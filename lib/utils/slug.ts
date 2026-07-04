// Slug generation and uniqueness. Slugs are server-generated (users never write
// them) and appended with a short counter when colliding.

import type { Document, Model } from "mongoose";

export function slugify(input: string): string {
  return (
    input
      .toString()
      .normalize("NFKD") // decompose accents
      .replace(/\p{Diacritic}/gu, "") // strip diacritics (unicode property)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // non-alnum -> dash
      .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
      .slice(0, 80) || "untitled"
  );
}

// Finds a unique slug for `model` based on `base`, suffixing `-2`, `-3`, ... if
// needed. `slugField` defaults to "slug". Use after slugify().
export async function uniqueSlug<T extends Document>(
  model: Model<T>,
  base: string,
  slugField = "slug",
  exceptId?: string,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 2;
  const query: Record<string, unknown> = { [slugField]: candidate };
  if (exceptId) query._id = { $ne: exceptId };
  while (await model.exists(query)) {
    candidate = `${root}-${n++}`;
    query[slugField] = candidate;
  }
  return candidate;
}
