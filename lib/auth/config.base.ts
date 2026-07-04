// BASE auth config — NO adapter, NO DB, NO models, NO top-level await.
// Imported by Edge middleware (lib/auth/middleware.ts), which CANNOT bundle
// mongoose / the MongoDB driver or reach a live DB. Credentials provider's
// `authorize` needs the DB, so we override it in the full config used by server
// components (lib/auth/config.ts) — there we import the User model and pass the
// MongoDBAdapter.
//
// Keeping the DB out of this module is what lets `next build` succeed and keeps
// the Edge middleware bundle light.

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { StaffRole } from "@/lib/constants";
import type { DefaultSession } from "next-auth";

// The shape of the session user across the app. (Canonical interface is in
// lib/auth/get-current-user.ts; this is re-exported for convenience.)
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: StaffRole;
  active: boolean;
  image?: string;
}

export const baseConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // Placeholder authorize — the full config (lib/auth/config.ts) supplies the
    // real DB-backed authorize. Middleware never calls authorize (it only reads
    // the JWT), so this stub is never hit.
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: StaffRole }).role;
        token.active = (user as { active?: boolean }).active;
      }
      return token;
    },
    async session({ session, token }) {
      const u = {
        ...(session.user ?? {}),
        id: token.id as string,
        role: token.role as StaffRole,
        active: (token.active ?? true) as boolean,
      };
      // Cast through `unknown` to the module-augmented Session.user shape
      // declared in lib/auth/next-auth.d.ts.
      session.user = u as unknown as typeof session.user;
      return session;
    },
  },
} satisfies NextAuthConfig;

// A standalone `auth()` for the Edge middleware path — built from the base
// config only (no adapter). Middleware uses this to read the JWT.
export const { auth, signIn, signOut, handlers } = NextAuth(baseConfig);
