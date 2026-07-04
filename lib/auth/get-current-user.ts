// Resolve the Auth.js session to a typed `SessionUser`, or null.
//
// This is the canonical entry point for Server Components / Server Actions that
// need "who is the current user?". It hides Auth.js' `session.user` shape behind
// our own `SessionUser` so callers don't depend on the next-auth session type.

import type { StaffRole } from "@/lib/constants";
import { auth } from "@/lib/auth/config";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: StaffRole;
  active: boolean;
  image?: string;
}

/**
 * Returns the authenticated staff user, or `null` if no session / inactive.
 *
 * Note: the `active` flag is read from the JWT, which is only refreshed from
 * the DB on sign-in. If an admin disables a session mid-flight, the user's
 * current token stays valid until it expires — server actions that mutate
 * should additionally check `user.active` against the DB if staleness matters.
 * v1 keeps it simple.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const u = session?.user;
  if (!u) return null;
  if (typeof u.id !== "string" || !u.id) return null;
  if (!u.role) return null;
  // Treat an explicit `active === false` as logged-out. `null`/`undefined`
  // degrade to truthy so we never lock everyone out if the flag is missing.
  if (u.active === false) return null;
  return {
    id: u.id,
    email: u.email as string,
    name: u.name ?? undefined,
    role: u.role,
    active: u.active,
    image: u.image ?? undefined,
  };
}
