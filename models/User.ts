// User model — STAFF ONLY (no public reader accounts in v1).
// The Auth.js MongoDBAdapter creates User/Account/Session/VerificationToken
// docs via the raw driver; we keep a parallel Mongoose model so the app can
// manage staff with full typed CRUD. `password` is select:false so it's never
// accidentally serialized, and it's never added to sessions.

import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { STAFF_ROLES, type StaffRole } from "@/lib/constants";
import { hashPassword } from "@/lib/auth/password";

export const UserSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false },
    image: { type: String, default: "" },
    role: { type: String, enum: STAFF_ROLES, default: "uploader" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "users" },
);

// same collection name as the Auth.js adapter uses ("users") so credentials
// login creates/looks-up docs that match between the two layers.

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  role: StaffRole;
  _id: mongoose.Types.ObjectId;
  id: string;
};

// Re-hash when a plain-text password is set/changed (compare won't match a
// pre-hashed value of length 60 starting with "$2").
UserSchema.pre("save", async function () {
  const doc = this as unknown as UserDoc & { password?: string; isModified: (p: string) => boolean };
  if (doc.isModified("password") && doc.password && !doc.password.startsWith("$2")) {
    doc.password = await hashPassword(doc.password);
  }
});

export const User =
  mongoose.models.User ?? mongoose.model<UserDoc>("User", UserSchema);

export default User;
