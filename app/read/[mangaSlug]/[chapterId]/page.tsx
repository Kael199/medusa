import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Chapter } from "@/models";
import { getSettings } from "@/lib/query/get-settings";
import { incrementViews } from "@/lib/query/increment-views";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReaderClientLazy } from "./ReaderClientLazy";
import type { ReaderPayload } from "./ReaderClient";

interface ReaderPageProps {
  params: Promise<{ mangaSlug: string; chapterId: string }>;
}

// Per-request data; never statically renderable.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  await connect();
  const { mangaSlug, chapterId } = await params;
  const manga = await Manga.findOne({ slug: mangaSlug, isPublished: true, isHidden: { $ne: true } })
    .select("title _id")
    .lean() as unknown as { title: string; _id: import("mongoose").Types.ObjectId } | null;
  if (!manga) return { title: "Not found" };
  const chapter = await Chapter.findById(chapterId).select("chapterNumber title mangaId").lean() as unknown as {
    chapterNumber: number;
    title?: string;
    mangaId: import("mongoose").Types.ObjectId;
  } | null;
  if (!chapter || String(chapter.mangaId) !== String(manga._id)) return { title: "Not found" };
  return {
    title: `${manga.title} — Chapter ${chapter.chapterNumber}`,
  };
}

interface ReaderPageDoc {
  _id: import("mongoose").Types.ObjectId;
  title: string;
  slug: string;
}

interface ReaderChapterDoc {
  _id: import("mongoose").Types.ObjectId;
  chapterNumber: number;
  volume?: number | null;
  title?: string;
  pages?: { url: string; order?: number; width?: number; height?: number }[];
}

interface ReaderNavChapterDoc {
  _id: import("mongoose").Types.ObjectId;
  chapterNumber: number;
  title?: string;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  await connect();
  const settings = await getSettings();
  const { mangaSlug, chapterId } = await params;

  const manga = await Manga.findOne({ slug: mangaSlug, isPublished: true, isHidden: { $ne: true } })
    .select("_id title slug")
    .lean() as unknown as ReaderPageDoc | null;
  if (!manga) notFound();

  const chapter = await Chapter.findOne({
    _id: chapterId,
    mangaId: manga._id,
    isPublished: true,
  })
    .select("chapterNumber volume title pages")
    .lean() as unknown as ReaderChapterDoc | null;
  if (!chapter) notFound();

  const prevChapter = await Chapter.findOne({
    mangaId: manga._id,
    isPublished: true,
    chapterNumber: { $lt: chapter.chapterNumber },
  })
    .sort({ chapterNumber: -1 })
    .select("_id chapterNumber title")
    .lean() as unknown as ReaderNavChapterDoc | null;

  const nextChapter = await Chapter.findOne({
    mangaId: manga._id,
    isPublished: true,
    chapterNumber: { $gt: chapter.chapterNumber },
  })
    .sort({ chapterNumber: 1 })
    .select("_id chapterNumber title")
    .lean() as unknown as ReaderNavChapterDoc | null;

  void incrementViews(String(manga._id)).catch(() => {});

  const pages = (chapter.pages ?? [])
    .slice()
    .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
    .map((p: { url: string; order?: number; width?: number; height?: number }) => ({
      url: p.url,
      width: p.width || 0,
      height: p.height || 0,
    }));

  const payload: ReaderPayload = {
    mangaId: String(manga._id),
    mangaSlug: manga.slug,
    mangaTitle: manga.title,
    chapterId: String(chapter._id),
    chapterNumber: chapter.chapterNumber,
    volume: chapter.volume ?? null,
    title: chapter.title ?? "",
    pages,
    prev: prevChapter ? String(prevChapter._id) : null,
    next: nextChapter ? String(nextChapter._id) : null,
    defaultMode: settings.defaultReaderMode,
  };

  const prevHref = prevChapter ? `/read/${mangaSlug}/${String(prevChapter._id)}` : null;
  const nextHref = nextChapter ? `/read/${mangaSlug}/${String(nextChapter._id)}` : null;

  return (
    <div>
      {/* SSR shell for SEO + no-JS fallback */}
      <noscript>
        <div className="mx-auto max-w-2xl p-4">
          <p className="mb-4 text-lg font-semibold">{manga.title} — Chapter {chapter.chapterNumber}</p>
          {pages.map((p: { url: string; width: number; height: number }, i: number) => (
            <img key={i} src={p.url} alt={`Page ${i + 1}`} className="mb-4 w-full" />
          ))}
          <div className="flex justify-between">
            {prevHref ? <Link href={prevHref}>← Prev</Link> : <span />}
            {nextHref ? <Link href={nextHref}>Next →</Link> : <span />}
          </div>
        </div>
      </noscript>

      {/* Client reader (dynamic, no SSR — shell above covers no-JS). */}
      <ReaderClientLazy payload={payload} />

      {/* SEO-friendly navigation links (hidden visually, crawled by bots). */}
      <div className="sr-only">
        <Link href={`/manga/${payload.mangaSlug}`}>Back to {payload.mangaTitle}</Link>
        {prevHref && <Link href={prevHref}>Previous chapter <ChevronLeft /></Link>}
        {nextHref && <Link href={nextHref}>Next chapter <ChevronRight /></Link>}
      </div>
    </div>
  );
}
