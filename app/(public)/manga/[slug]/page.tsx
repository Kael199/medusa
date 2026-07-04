import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Chapter } from "@/models";
import { incrementViews } from "@/lib/query/increment-views";
import { Badge } from "@/components/ui/badge";
import { ChapterList, type ChapterRow } from "@/components/public/ChapterList";

interface MangaPageProps {
  params: Promise<{ slug: string }>;
}

// Per-request data (loads + view increment); never statically renderable.
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};

export async function generateMetadata({ params }: MangaPageProps): Promise<Metadata> {
  await connect();
  const { slug } = await params;
  const m = await Manga.findOne({ slug }).select("title description author").lean() as unknown as {
    title: string;
    description?: string;
    author?: string;
  } | null;
  if (!m) return { title: "Not found" };
  return {
    title: m.title,
    description: m.description || `Read ${m.title} online` + (m.author ? ` by ${m.author}.` : "."),
  };
}

export default async function MangaDetailPage({ params }: MangaPageProps) {
  await connect();
  const { slug } = await params;

  const manga = await Manga.findOne({ slug })
    .populate([
      { path: "genres", select: "name slug" },
      { path: "tags", select: "name slug" },
    ])
    .lean() as unknown as {
      _id: import("mongoose").Types.ObjectId;
      title: string;
      altTitles?: string[];
      description?: string;
      author?: string;
      artist?: string;
      status: string;
      type: string;
      year?: number | null;
      rating: number;
      ratingCount: number;
      views: number;
      coverImage?: string;
      bannerImage?: string;
      isPublished: boolean;
      isHidden: boolean;
      genres?: { name: string; slug: string }[];
      tags?: { name: string; slug: string }[];
    } | null;

  if (!manga || !manga.isPublished || manga.isHidden) {
    notFound();
  }

  // Fire-and-forget view increment.
  void incrementViews(String(manga._id)).catch(() => {});

  const chapters = await Chapter.find({
    mangaId: manga._id,
    isPublished: true,
  })
    .sort({ chapterNumber: 1 })
    .select("chapterNumber volume title pages")
    .lean() as unknown as {
      _id: import("mongoose").Types.ObjectId;
      chapterNumber: number;
      volume?: number | null;
      title?: string;
      pages?: { url: string; order?: number; width?: number; height?: number }[];
    }[];

  const chapterRows: ChapterRow[] = (chapters as any[]).map((c) => ({
    _id: String(c._id),
    chapterNumber: c.chapterNumber,
    volume: c.volume ?? null,
    title: c.title ?? "",
    pageCount: Array.isArray(c.pages) ? c.pages.length : 0,
  }));

  const mangaId = String(manga._id);
  const genres = (manga.genres ?? []) as unknown as { name: string; slug: string }[];
  const tags = (manga.tags ?? []) as unknown as { name: string; slug: string }[];

  return (
    <div>
      {/* Banner */}
      {manga.bannerImage && (
        <div className="relative h-48 overflow-hidden border-b sm:h-64">
          <Image
            src={manga.bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Cover */}
          <div className="mx-auto w-40 shrink-0 sm:mx-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border bg-muted shadow">
              {manga.coverImage ? (
                <Image
                  src={manga.coverImage}
                  alt={manga.title}
                  width={300}
                  height={450}
                  sizes="160px"
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  No cover
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{manga.title}</h1>
            {manga.altTitles && manga.altTitles.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{manga.altTitles.join(" · ")}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{STATUS_LABELS[manga.status] ?? manga.status}</Badge>
              <Badge variant="outline" className="capitalize">{manga.type}</Badge>
              {manga.year && <Badge variant="outline">{manga.year}</Badge>}
              {manga.ratingCount > 0 && (
                <Badge variant="outline">★ {manga.rating.toFixed(1)} ({manga.ratingCount})</Badge>
              )}
              <Badge variant="outline">{manga.views.toLocaleString()} views</Badge>
            </div>

            {(manga.author || manga.artist) && (
              <div className="mt-3 text-sm">
                {manga.author && <span className="text-muted-foreground">Story: <span className="text-foreground">{manga.author}</span></span>}
                {manga.author && manga.artist && <span className="mx-2 text-muted-foreground">·</span>}
                {manga.artist && <span className="text-muted-foreground">Art: <span className="text-foreground">{manga.artist}</span></span>}
              </div>
            )}

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <Link key={g.slug} href={`/genre/${g.slug}`}>
                    <Badge variant="outline" className="hover:bg-accent">{g.name}</Badge>
                  </Link>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t.slug} variant="secondary" className="font-normal">{t.name}</Badge>
                ))}
              </div>
            )}

            {manga.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {manga.description}
              </p>
            )}
          </div>
        </div>

        {/* Chapters */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Chapters ({chapterRows.length})</h2>
          <ChapterList chapters={chapterRows} mangaSlug={slug} />
        </section>
      </div>
    </div>
  );
}
