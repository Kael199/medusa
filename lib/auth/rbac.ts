// Role-based access control. Single source of truth for permissions.
//
// Permission atoms are action-scoped strings (resource:verb), never vague verbs.
// Every mutation Server Action in lib/actions/* calls assertCan() (B) which
// calls can() below plus an ownership check where editOwn vs editAny matters.
//
// The "uploader == own drafts only" rule is enforced at the DATA layer via
// canEditManga / canEditChapter (own-check on uploadedById), not just UI.

import type { StaffRole } from "@/lib/constants";

export type Permission =
  | "*"
  | "admin:view"
  | "manga:create"
  | "manga:editAny"
  | "manga:editOwn"
  | "manga:publish"
  | "manga:delete"
  | "chapter:create"
  | "chapter:editAny"
  | "chapter:editOwn"
  | "chapter:publish"
  | "chapter:delete"
  | "genre:manage"
  | "upload:manage"
  | "uploads:read"
  | "staff:manage"
  | "settings:manage";

export const PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  "super-admin": ["*"],
  editor: [
    "admin:view",
    "manga:create",
    "manga:editAny",
    "manga:publish",
    "manga:delete",
    "chapter:create",
    "chapter:editAny",
    "chapter:publish",
    "chapter:delete",
    "genre:manage",
    "upload:manage",
    "uploads:read",
  ],
  uploader: [
    "admin:view",
    "manga:create",
    "manga:editOwn",
    "chapter:create",
    "chapter:editOwn",
    "uploads:read",
  ],
};

/** Does `role` grant `perm`? Super-Admin ("*") grants everything. */
export function can(role: StaffRole | undefined | null, perm: Permission): boolean {
  if (!role) return false;
  const set = PERMISSIONS[role];
  if (!set) return false;
  if (set.includes("*")) return true;
  return set.includes(perm);
}

// Minimal user shape for own-checks (full User doc satisfies it too).
export interface Ownable {
  id: string;
  role: StaffRole;
}

export interface WithUploader {
  uploadedById?: { equals?: (id: string) => boolean } | string | null;
}

function ownerEquals(field: WithUploader["uploadedById"], userId: string): boolean {
  if (!field) return false;
  if (typeof field === "string") return field === userId;
  return typeof field.equals === "function" && field.equals(userId);
}

/** Can this user edit this manga at all (any or own)? */
export function canEditManga(
  user: Ownable | null | undefined,
  manga: WithUploader | null,
): boolean {
  if (!user) return false;
  if (can(user.role, "manga:editAny")) return true;
  if (can(user.role, "manga:editOwn")) {
    return ownerEquals(manga?.uploadedById, user.id);
  }
  return false;
}

/** Can this user edit this chapter (any or own)? Own is derived via the parent manga. */
export function canEditChapter(
  user: Ownable | null | undefined,
  chapter: WithUploader | null,
): boolean {
  if (!user) return false;
  if (can(user.role, "chapter:editAny")) return true;
  if (can(user.role, "chapter:editOwn")) {
    return ownerEquals(chapter?.uploadedById, user.id);
  }
  return false;
}
