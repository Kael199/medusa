// FULL auth config — used by SERVER components, route handlers, and the API
// route (`app/api/auth/[...nextauth]/route.ts`). Adds the MongoDBAdapter and
// the real DB-backed Credentials `authorize`. Middleware does NOT import this
// file (see lib/auth/config.base.ts) so the Edge bundle never pulls in mongoose
// / the MongoDB driver.
//
// BUILD-SAFE: this module must NOT open a DB connection at import time. `next
// build` imports it during page-data collection for the auth route; an eager
// connect would fail (no DB at build time). The MongoDBAdapter therefore
// receives the `getClient` *function* — Auth.js resolves it only when it first
// needs the client at request time. `authorize` likewise connects lazily on the
// first real login attempt.

import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Credentials from "next-auth/providers/credentials";
import type { MongoClient } from "mongodb";
import type { StaffRole } from "@/lib/constants";

import { getClient } from "@/lib/db/client";
import { connect } from "@/lib/db/mongoose";
import { verifyPassword, dummyVerify } from "@/lib/auth/password";
// Register all Mongoose schemas on the default connection before User.findOne.
import "@/models";
import { User } from "@/models";

import { baseConfig } from "@/lib/auth/config.base";

// Lazy adapter client: a function returning a (memoized) connect-promise. Per
// @auth/mongodb-adapter's signature this is a supported form, and crucially it
// is NOT invoked at import time — Auth.js calls it only when it first touches
// the adapter collections (request time). `MongoClient` isn't awaited here.
const adapterClient: () => Promise<MongoClient> = getClient;

// Replace the placeholder Credentials provider with the real DB-backed one.
const providers = baseConfig.providers.map((p) => p) as typeof baseConfig.providers;
const realCredentials = Credentials({
  id: "credentials",
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(c) {
    const email = (c?.email ?? "").toString().trim().toLowerCase();
    const password = (c?.password ?? "").toString();

    // Ensure the Mongoose default connection is open before querying
    // (bufferCommands is false, so a query without a connection would reject).
    // Runs at request time only — never during the build.
    await connect();

    // `password` is select:false, so explicitly select it + the disabled flag.
    const user = await User.findOne({ email }).select("+password +active");

    if (!user) {
      // Burn ~one bcrypt compare so "no such user" isn't visibly faster than
      // "wrong password" (basic user-enumeration hedge).
      await dummyVerify();
      return null;
    }

    const ok = await verifyPassword(password, user.password ?? "");
    if (!ok) return null;
    // Disabled accounts cannot log in even with correct credentials.
    if (user.active === false) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role as StaffRole,
      active: user.active,
      image: user.image,
    };
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...baseConfig,
  adapter: MongoDBAdapter(adapterClient),
  providers: [realCredentials],
});
