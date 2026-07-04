// Browse/search filter + sort builders. SECURITY: closed allowlist only.
// Any query value that looks like a Mongo operator (starts with $, or is one of
// the known dangerous keys) is dropped entirely — this is the NoSQL-injection
// defense for the public browse/search pages.

import type { FilterQuery } from "mongoose";
import { Types } from "mongoose";
import {
  MANGA_STATUS,
  MANGA_TYPE,
  BROWSE_SORT_OPTIONS,
  type MangaStatus,
  type MangaType,
  type BrowseSort,
} from "@/lib/constants";
import { Manga } from "@/models";
import { Genre, Tag } from "@/models";

/** Coerce a possibly-array string value to a single string (first wins). */
function scalar(v: unknown): string | undefined {
  if (Array.isArray(v)) v = v[0];
  return typeof v === "string" && v.length ? v : undefined;
}

function inEnum<T extends string>(v: string | undefined, list: readonly T[]): T | undefined {
  return v && (list as readonly string[]).includes(v) ? (v as T) : undefined;
}

/**
 * Build the public browse/search filter from URL search params (all promised
 * to strings by Next 16). Only published + non-hidden manga are returned on
 * the public site; pass { includeUnpublished: true } for the admin list.
 */
export interface BrowseQuery {
  q?: string;
  status?: string;
  type?: string;
  genre?: string; // slug
  tag?: string; // slug
  sort?: string;
  page?: string;
}

export async function buildBrowseFilter(
  params: BrowseQuery,
  opts: { includeUnpublished?: boolean; includeHidden?: boolean } = {},
): Promise<FilterQuery<typeof Manga>> {
  const filter: FilterQuery<typeof Manga> = {};

  if (!opts.includeUnpublished) filter.isPublished = true;
  if (!opts.includeHidden) filter.isHidden = { $ne: true };

  const status = inEnum(scalar(params.status), MANGA_STATUS) as MangaStatus | undefined;
  if (status) filter.status = status;

  const type = inEnum(scalar(params.type), MANGA_TYPE) as MangaType | undefined;
  if (type) filter.type = type;

  const genreSlug = scalar(params.genre);
  if (genreSlug) {
    const g = await Genre.findOne({ slug: genreSlug }).lean() as unknown as { _id: import("mongoose").Types.ObjectId } | null;
    if (g) filter.genres = g._id;
    else filter.genres = new Types.ObjectId("000000000000000000000000"); // match nothing
  }

  const tagSlug = scalar(params.tag);
  if (tagSlug) {
    const t = await Tag.findOne({ slug: tagSlug }).lean() as unknown as { _id: import("mongoose").Types.ObjectId } | null;
    if (t) filter.tags = t._id;
    else filter.tags = new Types.ObjectId("000000000000000000000000");
  }

  const q = scalar(params.q);
  if (q) {
    // $text uses the manga_text index; only whole-word matching, but safe.
    filter.$text = { $search: q };
  }

  return filter;
}

const SORT_MAP: Record<BrowseSort, Record<string, 1 | -1>> = {
  latest: { updatedAt: -1 },
  oldest: { updatedAt: 1 },
  title: { title: 1 },
  views: { views: -1 },
  rating: { rating: -1 },
};

export function buildSort(sort?: string): Record<string, 1 | -1> {
  const key = (
    BROWSE_SORT_OPTIONS as readonly string[]
  ).includes(sort ?? "") ? (sort as BrowseSort) : "latest";
  return SORT_MAP[key];
}

export { MANGA_STATUS, MANGA_TYPE };
