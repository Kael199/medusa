// Central enums, role list, and upload limits for the manga CMS.
// Every `as const` tuple doubles as a union type via indexed access.

export const MANGA_STATUS = ["ongoing", "completed", "hiatus"] as const;
export type MangaStatus = (typeof MANGA_STATUS)[number];

export const MANGA_TYPE = ["manga", "manhwa", "manhua"] as const;
export type MangaType = (typeof MANGA_TYPE)[number];

export const READER_MODES = ["paginated", "list", "webtoon"] as const;
export type ReaderMode = (typeof READER_MODES)[number];

export const TAG_KIND = ["genre", "tag"] as const;
export type TagKind = (typeof TAG_KIND)[number];

export const STAFF_ROLES = ["super-admin", "editor", "uploader"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const BROWSE_SORT_OPTIONS = [
  "latest",
  "oldest",
  "title",
  "views",
  "rating",
] as const;
export type BrowseSort = (typeof BROWSE_SORT_OPTIONS)[number];

// Upload constraints — enforced in lib/actions/upload.ts.
export const UPLOAD_LIMITS = {
  maxFileBytes: 8 * 1024 * 1024, // 8 MB per image
  maxPagesPerChapter: 200,
  maxCoverBytes: 8 * 1024 * 1024,
  allowedMime: ["image/jpeg", "image/png", "image/webp", "image/gif"], // SVG explicitly excluded
} as const;

export const PAGINATION = {
  defaultPageSize: 24,
  maxPageSize: 60,
} as const;

export const RESERVED_SLUGS = [
  "uploads",
  "admin",
  "api",
  "login",
  "browse",
  "search",
  "genre",
  "manga",
  "read",
  "forbidden",
] as const;
