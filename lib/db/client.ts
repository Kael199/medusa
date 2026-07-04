// Cached raw MongoClient — passed to Auth.js v5's MongoDBAdapter.
// Auth.js owns its own collections (users/accounts/sessions/verificationTokens)
// via the driver, independent of Mongoose.
//
// LAZY BY DESIGN: importing this module triggers NO network I/O. The MongoClient
// is constructed (that allocates objects only — `new MongoClient` does not dial
// out), and `connect()` is deferred behind `getClient`. This matters because
// `next build` evaluates the auth route module during page-data collection — if
// that import eagerly connected, the build would fail (or stall ~10s) against a
// DB that isn't running at build time. The first request-time `await
// getClient()` opens the connection; it is then cached on `globalThis` for the
// process lifetime and reused.
//
// Auth.js' MongoDBAdapter accepts a `Promise<MongoClient>` OR a function
// `() => Promise<MongoClient>` directly (see @auth/mongodb-adapter/index.d.ts).
// We pass the function form, so even the adapter does not trigger a connect at
// module load — only when Auth.js first needs the client at request time.

import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

// Constructed at module scope — NO network I/O happens here, so this is safe to
// run during the build.
const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});

// Returns a (memoized) connect-promise. Creating the promise is cheap; the
// connection is opened by `await client.connect()` inside the IIFE, which runs
// only when the returned promise is awaited — i.e. at request time, never at
// module import. Caching on `globalThis` survives Next dev HMR reloads.
export function getClient(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const c = client;
    global._mongoClientPromise = (async () => {
      await c.connect();
      return c;
    })();
  }
  return global._mongoClientPromise;
}

export { client as mongoClient };
export default getClient;
