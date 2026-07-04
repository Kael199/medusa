// bcrypt hashing with a constant-ish work factor. Passwords are never logged
// or serialized to sessions.

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!hash) return false; // no password set (no stub)
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false; // malformed hash -> fail closed
  }
}

// Dummy compare to keep timing roughly constant when an account is not found.
export async function dummyVerify(): Promise<boolean> {
  await bcrypt.compare(
    "x",
    "$2a$12$0000000000000000000000000000000000000000000000000000000000",
  ).catch(() => null);
  return false;
}
