// Single entry point for DB access. Importing this module warms the caches
// and re-exports the helpers consumers use. The raw MongoClient (client.ts)
// feeds the Auth.js MongoDBAdapter; the Mongoose connection (mongoose.ts)
// feeds the app's models. Both share MONGODB_URI.

export { connect, getConnection } from "./mongoose";
export { getClient, mongoClient } from "./client";
