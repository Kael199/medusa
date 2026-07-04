// Disk-path helpers for uploaded media. The single aim is to keep every file
// the app writes pinned under public/uploads, so a crafted mangaId/chapterId
// can't escape it (path-traversal defense). We never trust the user's filename
// — filenames on disk are server-generated (see lib/actions/upload.ts).

import path from "node:path";
import { Types } from "mongoose";

const UPLOAD_ROOT = path.resolve(process.cwd(), "public", "uploads");

export type UploadKind = "covers" | "banners" | "chapters";

export interface SafeUploadDirOptions {
  kind: UploadKind;
  chapterId?: string;
}

const HEX_RE = /^[a-f0-9]{24}$/i;

function assertObjectId(s: string, label: string): void {
  if (!HEX_RE.test(s) || !Types.ObjectId.isValid(s)) {
    throw new Error(`Invalid ${label}: ${s}`);
  }
}

/**
 * Returns an absolute disk path under public/uploads/manga/{mangaId}/{kind}
 * (and /chapters/{chapterId} for chapter pages). Validates that mangaId and
 * chapterId are 24-hex ObjectIds and that the resolved path stays under
 * public/uploads — rejecting any traversal attempt.
 */
export function safeUploadDir(
  mangaId: string,
  { kind, chapterId }: SafeUploadDirOptions,
): string {
  assertObjectId(mangaId, "mangaId");

  const parts = [UPLOAD_ROOT, "manga", mangaId, kind];
  if (kind === "chapters") {
    if (!chapterId) throw new Error("chapterId is required for chapters");
    assertObjectId(chapterId, "chapterId");
    parts.push(chapterId);
  } else if (chapterId) {
    throw new Error(`chapterId is not allowed for kind "${kind}"`);
  }

  const resolved = path.resolve(...parts);
  // Ensure the final path is strictly inside UPLOAD_ROOT. Using path.sep
  // avoids the prefix-matching trap (/uploads/evil is not under /uploads).
  const rootWithSep = UPLOAD_ROOT + path.sep;
  if (resolved !== UPLOAD_ROOT && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Resolved path escapes uploads root: ${resolved}`);
  }
  return resolved;
}

/**
 * Convert an absolute or repo-relative disk path under public/uploads into a
 * `/uploads/...` URL. Anything not under public/uploads is rejected.
 */
export function toPublicUrl(absOrRel: string): string {
  const resolved = path.resolve(absOrRel);
  const rootWithSep = UPLOAD_ROOT + path.sep;
  if (resolved !== UPLOAD_ROOT && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Path is not under uploads root: ${resolved}`);
  }
  const rel = path.relative(UPLOAD_ROOT, resolved).split(path.sep).join("/");
  return `/uploads/${rel}`;
}

export { UPLOAD_ROOT };
