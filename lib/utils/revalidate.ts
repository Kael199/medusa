// Centralized cache-invalidation. Next.js `revalidatePath` purges the static
// shell of a route's pages. Grouping these by feature keeps mutations in
// lib/actions/* honest about which views are affected. Re-exporting
// revalidatePath (default from "next/cache") here means actions never need to
// touch "next/cache" directly.

import { revalidatePath } from "next/cache";

/** Public manga-facing views that depend on a manga's content. */
export function revalidateManga(slug?: string): void {
  if (slug) revalidatePath(`/manga/${slug}`);
  revalidatePath(`/manga/[slug]`, "page");
  revalidatePath("/browse");
  revalidatePath("/");
}

/** Admin manga list and the chapters view of a manga. */
export function revalidateAdminManga(): void {
  revalidatePath("/admin/manga");
  revalidatePath("/admin/manga/[id]");
  revalidatePath("/admin/manga/[id]/chapters");
}

export function revalidateChapters(mangaId?: string): void {
  if (mangaId) revalidatePath(`/admin/manga/${mangaId}/chapters`);
  revalidatePath("/admin/manga/[id]/chapters");
  revalidatePath("/admin/manga/[id]/chapters/[chapterId]");
}

export function revalidateGenres(): void {
  revalidatePath("/browse");
  revalidatePath("/admin/genres");
}

export function revalidateStaff(): void {
  revalidatePath("/admin/staff");
}

export function revalidateSettings(): void {
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export function revalidateUploads(): void {
  revalidatePath("/admin/uploads");
}

/** Convenience: revalidate an arbitrary list of paths. */
export function revalidatePaths(...paths: string[]): void {
  for (const p of paths) revalidatePath(p);
}
