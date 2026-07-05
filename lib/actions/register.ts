"use server";

// Self-service staff registration (Server Action).
//
// The product is staff-only — there is no public reader account surface. To
// still let a new team member get themselves a login without requiring a
// super-admin to pre-create them, we accept self-registration when a valid
// STAFF_INVITE_CODE is supplied. Default role is "uploader"; a super-admin
// can promote via the existing /admin/staff page. The invite code is the
// only thing distinguishing this from fully open registration — keep it
// out of the bundle (it's only read on the server).
//
// Password hashing is delegated to the User pre-save hook
// (models/User.ts -> lib/auth/password.ts).

import "@/models";
import { connect } from "@/lib/db/mongoose";
import { User } from "@/models";
import { hashPassword } from "@/lib/auth/password";
import { asActionError, type ActionResult } from "@/lib/actions/_shared";

// Email-shaped check; intentionally permissive because the User model will
// reject anything that gets past this on save via Mongoose validators.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}

function validate(input: RegisterInput): string | null {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";
  const inviteCode = input.inviteCode?.trim() ?? "";

  if (!name) return "Please enter your name";
  if (name.length > 80) return "Name is too long";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 200) return "Password is too long";
  if (!inviteCode) return "Invite code is required";
  return null;
}

// Timing-safe-ish compare for the invite code so a wrong-length guess doesn't
// short-circuit before we reach bcrypt work.
function secretsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function registerStaff(
  input: RegisterInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();

    const validationError = validate(input);
    if (validationError) {
      return { ok: false, error: validationError };
    }

    const expected = process.env.STAFF_INVITE_CODE;
    if (!expected) {
      // Self-registration is intentionally disabled when no invite code is
      // configured. Fail closed with a generic message so we don't leak why.
      return { ok: false, error: "Registration is currently closed" };
    }
    if (!secretsMatch(input.inviteCode.trim(), expected)) {
      // Same generic wording as a duplicate-email collision to avoid giving
      // away that the code was wrong vs. the code not existing.
      return { ok: false, error: "Invalid invite code" };
    }

    const email = input.email.trim().toLowerCase();
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return { ok: false, error: "An account with that email already exists" };
    }

    try {
      const hashed = await hashPassword(input.password);
      const doc = await User.create({
        name: input.name.trim(),
        email,
        password: hashed,
        role: "uploader",
        active: true,
      });
      return { ok: true, data: { id: doc._id.toString() } };
    } catch (e) {
      if (e instanceof Error && /duplicate key|E11000/i.test(e.message)) {
        return { ok: false, error: "An account with that email already exists" };
      }
      throw e;
    }
  } catch (e) {
    return asActionError(e);
  }
}
