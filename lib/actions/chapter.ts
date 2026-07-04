"use server";

// Chapter CRUD Server Actions + page management. Ownership: an uploader can
// only touch chapters of manga they uploaded (canEditChapter via the
// chapter's uploadedById, since chapters point directly at the uploader).
// Editors/super-admin override. Publishing requires the dedicated permission.
// Pages are replaced wholesale via setChapterPages (order == array order),
// or reordered in place via reorderPages.

import { Types } from "mongoose";
import path from "node:path";
import { promises as fs } from "node:fs";

import "@/models";
import { connect } from "@/lib/db/mongoose";
import { Manga, type MangaDoc } from "@/models";
import { Chapter, type ChapterDoc } from "@/models";
import { requireCan } from "@/lib/auth/assert";
import { asActionError, type ActionResult } from "@/lib/actions/_shared";
import { can, canEditChapter, canEditManga, type Ownable } from "@/lib/auth/rbac";
import {
  revalidateManga,
  revalidateChapters,
  revalidateAdminManga,
} from "@/lib/utils/revalidate";
import { safeUploadDir } from "@/lib/utils/upload-path";

export interface CreateChapterInput {
  chapterNumber: number;
  volume?: number | null;
  title?: string;
  isPublished?: boolean;
}

export interface PageInput {
  url: string;
  width?: number;
  height?: number;
}

function toObjectId(s: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

async function loadChapter(id: string) {
  const oid = toObjectId(id);
  if (!oid) return null;
  return (await Chapter.findById(oid).lean()) as ChapterDoc | null;
}

async function loadManga(id: string) {
  const oid = toObjectId(id);
  if (!oid) return null;
  return (await Manga.findById(oid).lean()) as MangaDoc | null;
}

export async function createChapter(
  mangaId: string,
  { chapterNumber, volume, title, isPublished }: CreateChapterInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("chapter:create");

    const mangaOid = toObjectId(mangaId);
    if (!mangaOid) return { ok: false, error: "Invalid mangaId" };

    const manga = await loadManga(mangaId);
    if (!manga) return { ok: false, error: "Manga not found" };

    if (!canEditManga({ id: user.id, role: user.role } as Ownable, manga)) {
      return { ok: false, error: "You can only add chapters to manga you own" };
    }

    if (typeof chapterNumber !== "number" || !isFinite(chapterNumber) || chapterNumber < 0) {
      return { ok: false, error: "chapterNumber must be a non-negative number" };
    }

    const existing = await Chapter.findOne({
      mangaId: mangaOid,
      chapterNumber,
    }).lean();
    if (existing) {
      return { ok: false, error: `Chapter ${chapterNumber} already exists for this manga` };
    }

    const fullUser: Ownable = { id: user.id, role: user.role };
    const canPub = can(fullUser.role, "chapter:publish");
    const wantsPub = Boolean(isPublished);

    const doc = await Chapter.create({
      mangaId: mangaOid,
      chapterNumber,
      volume: volume ?? null,
      title: title ?? "",
      pages: [],
      isPublished: wantsPub && canPub,
      publishedAt: wantsPub && canPub ? new Date() : null,
      uploadedById: new Types.ObjectId(user.id),
    });

    revalidateManga(manga.slug);
    revalidateChapters(mangaId);
    revalidateAdminManga();
    return { ok: true, data: { id: doc.id } };
  } catch (e) {
    return asActionError(e);
  }
}

export interface UpdateChapterInput {
  chapterNumber?: number;
  volume?: number | null;
  title?: string;
}

export async function updateChapter(
  chapterId: string,
  input: UpdateChapterInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("chapter:create");

    const chapter = await loadChapter(chapterId);
    if (!chapter) return { ok: false, error: "Chapter not found" };

    const manga = await loadManga(chapter.mangaId.toString());
    const fullUser: Ownable = { id: user.id, role: user.role };
    if (
      !canEditChapter(fullUser, chapter) &&
      !(manga && canEditManga(fullUser, manga))
    ) {
      return { ok: false, error: "You can only edit chapters you own" };
    }

    const update: Record<string, unknown> = {};
    if (input.chapterNumber !== undefined) {
      if (input.chapterNumber < 0 || !isFinite(input.chapterNumber)) {
        return { ok: false, error: "chapterNumber must be non-negative" };
      }
      // Uniqueness check on chapterNumber change.
      if (input.chapterNumber !== chapter.chapterNumber) {
        const clash = await Chapter.findOne({
          mangaId: chapter.mangaId,
          chapterNumber: input.chapterNumber,
          _id: { $ne: chapter._id },
        }).lean();
        if (clash) return { ok: false, error: `Chapter ${input.chapterNumber} already exists` };
      }
      update.chapterNumber = input.chapterNumber;
    }
    if (input.volume !== undefined) update.volume = input.volume;
    if (input.title !== undefined) update.title = input.title;

    await Chapter.updateOne({ _id: chapter._id }, { $set: update });

    if (manga) revalidateManga(manga.slug);
    revalidateChapters(chapter.mangaId.toString());
    revalidateAdminManga();
    return { ok: true, data: { id: chapterId } };
  } catch (e) {
    return asActionError(e);
  }
}

export async function deleteChapter(chapterId: string): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("chapter:create");

    const chapter = await loadChapter(chapterId);
    if (!chapter) return { ok: false, error: "Chapter not found" };

    const manga = await loadManga(chapter.mangaId.toString());
    const fullUser: Ownable = { id: user.id, role: user.role };
    // Editor+ (chapter:delete) wins; else uploader-owned.
    const canDelete =
      can(fullUser.role, "chapter:delete") ||
      canEditChapter(fullUser, chapter) ||
      (manga && canEditManga(fullUser, manga));
    if (!canDelete) {
      return { ok: false, error: "You can only delete chapters you own" };
    }

    await Chapter.deleteOne({ _id: chapter._id });

    // Best-effort cleanup of the chapter upload dir.
    try {
      const dir = safeUploadDir(chapter.mangaId.toString(), {
        kind: "chapters",
        chapterId: chapterId,
      });
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // swallowed
    }

    if (manga) revalidateManga(manga.slug);
    revalidateChapters(chapter.mangaId.toString());
    revalidateAdminManga();
    return { ok: true, data: { id: chapterId } };
  } catch (e) {
    return asActionError(e);
  }
}

export async function setChapterPublished(
  chapterId: string,
  published: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("chapter:publish");

    const chapter = await loadChapter(chapterId);
    if (!chapter) return { ok: false, error: "Chapter not found" };

    await Chapter.updateOne(
      { _id: chapter._id },
      { $set: { isPublished: published, publishedAt: published ? new Date() : null } },
    );

    const manga = await loadManga(chapter.mangaId.toString());
    if (manga) revalidateManga(manga.slug);
    revalidateChapters(chapter.mangaId.toString());
    revalidateAdminManga();
    return { ok: true, data: { id: chapterId } };
  } catch (e) {
    return asActionError(e);
  }
}

/** Replace the full pages[] list. Array order == display order. */
export async function setChapterPages(
  chapterId: string,
  pages: PageInput[],
): Promise<ActionResult<{ id: string; pageCount: number }>> {
  try {
    await connect();
    const user = await requireCan("chapter:create");

    const chapter = await loadChapter(chapterId);
    if (!chapter) return { ok: false, error: "Chapter not found" };

    const manga = await loadManga(chapter.mangaId.toString());
    const fullUser: Ownable = { id: user.id, role: user.role };
    if (
      !canEditChapter(fullUser, chapter) &&
      !(manga && canEditManga(fullUser, manga))
    ) {
      return { ok: false, error: "You can only edit chapters you own" };
    }

    const docs = pages.map((p, i) => ({
      url: String(p.url),
      width: Number(p.width ?? 0),
      height: Number(p.height ?? 0),
      order: i,
    }));

    await Chapter.updateOne({ _id: chapter._id }, { $set: { pages: docs } });

    if (manga) revalidateManga(manga.slug);
    revalidateChapters(chapter.mangaId.toString());
    revalidateAdminManga();
    return { ok: true, data: { id: chapterId, pageCount: docs.length } };
  } catch (e) {
    return asActionError(e);
  }
}

/**
 * Reassign page order from a list of urls (or any stable id; here we use the
 * url string) in the new desired order. The pre("save") hook normalizes, but
 * we update via updateOne so we set order explicitly.
 */
export async function reorderPages(
  chapterId: string,
  newOrder: string[],
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("chapter:create");

    const chapter = await loadChapter(chapterId);
    if (!chapter) return { ok: false, error: "Chapter not found" };

    const manga = await loadManga(chapter.mangaId.toString());
    const fullUser: Ownable = { id: user.id, role: user.role };
    if (
      !canEditChapter(fullUser, chapter) &&
      !(manga && canEditManga(fullUser, manga))
    ) {
      return { ok: false, error: "You can only edit chapters you own" };
    }

    const byUrl = new Map(chapter.pages.map((p) => [p.url, p]));
    const reordered = newOrder
      .map((key, i) => {
        const match = byUrl.get(String(key));
        if (!match) return null;
        return { url: match.url, width: match.width ?? 0, height: match.height ?? 0, order: i };
      })
      .filter((p): p is { url: string; width: number; height: number; order: number } => p !== null);

    await Chapter.updateOne({ _id: chapter._id }, { $set: { pages: reordered } });

    if (manga) revalidateManga(manga.slug);
    revalidateChapters(chapter.mangaId.toString());
    return { ok: true, data: { id: chapterId } };
  } catch (e) {
    return asActionError(e);
  }
}

