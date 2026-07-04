// Cached Mongoose connection — used by the app's own models (Manga, Chapter, …).
// distinct from the raw MongoClient cache in client.ts which feeds the Auth.js adapter.
// Both share the same MONGODB_URI. Caching on globalThis survives Next dev HMR
// reloads and prevents connection storms.

import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn:
    | {
        conn: typeof mongoose | undefined;
        promise: Promise<typeof mongoose> | undefined;
      }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const cached: {
  conn: typeof mongoose | undefined;
  promise: Promise<typeof mongoose> | undefined;
} = global._mongooseConn ?? (global._mongooseConn = { conn: undefined, promise: undefined });

export async function connect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      autoIndex: true, // create indexes in dev; disable in prod once stable
      serverSelectionTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = undefined;
    throw err;
  }

  return cached.conn;
}

// alias used by models/index.ts and consumers
export async function getConnection() {
  return connect();
}

export default connect;
