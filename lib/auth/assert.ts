// Server-side authorization primitives shared by Server Actions and Server
// Components. The convention for Server Actions (workstream C):
//
//   export async function someAction(input) {
//     try {
//       const user = await requireCan("manga:editAny");
//       ...do work...
//       return { ok: true, data };
//     } catch (e) {
//       return asActionError(e);
//     }
//   }
//
// `requireUser` throws AuthError (401) when there's no session; `requireCan`
// throws ForbiddenError (403) when the role lacks the permission. `asActionError`
// flattens either (or any) error into the `{ ok:false, error, status }` envelope.

import type { Permission } from "@/lib/auth/rbac";
import { can } from "@/lib/auth/rbac";
import { getCurrentUser, type SessionUser } from "@/lib/auth/get-current-user";

/** 401 — no session / account disabled. */
export class AuthError extends Error {
  status: number;
  constructor(message = "Unauthorized", status = 401, options?: ErrorOptions) {
    super(message, options);
    this.name = "AuthError";
    this.status = status;
  }
}

/** 403 — authenticated but the role lacks the required permission. */
export class ForbiddenError extends AuthError {
  constructor(perm: Permission, options?: ErrorOptions) {
    super(`Forbidden: missing permission "${perm}"`, 403, options);
    this.name = "ForbiddenError";
  }
}

/** Throw AuthError(401) if there is no current user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Unauthorized: no active session");
  }
  return user;
}

/** Throw AuthError(401) if no session, ForbiddenError(403) if role lacks `perm`. */
export async function requireCan(perm: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, perm)) {
    throw new ForbiddenError(perm);
  }
  return user;
}

/** Flatten any thrown value into a Server-Action error envelope. */
export function asActionError(e: unknown): {
  ok: false;
  error: string;
  status: number;
} {
  if (e instanceof AuthError) {
    return { ok: false, error: e.message, status: e.status };
  }
  if (e instanceof Error) {
    return { ok: false, error: e.message, status: 500 };
  }
  return {
    ok: false,
    error: "Internal error",
    status: 500,
  };
}
