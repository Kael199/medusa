import Link from "next/link";
import Image from "next/image";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga } from "@/models";
import { getSettings } from "@/lib/query/get-settings";
import { MangaGrid } from "@/components/public/MangaGrid";
import type { MangaCardData } from "@/components/public/MangaCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Sparkles, TrendingUp } from "lucide-react";

const HOMELIMIT = 12;

// Per-request data; never statically renderable.
export const dynamic = "force-dynamic";

async function fetchMangaCardData(
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  limit: number,
): Promise<MangaCardData[]> {
  const docs = await Manga.find(filter)
    .sort(sort)
    .limit(limit)
    .select("slug title status type coverImage rating")
    .lean();
  return docs.map((d: any) => ({
    _id: String(d._id),
    slug: d.slug,
    title: d.title,
    status: d.status,
    type: d.type,
    coverImage: d.coverImage ?? "",
    rating: typeof d.rating === "number" ? d.rating : 0,
  }));
}

export default async function HomePage() {
  await connect();
  const settings = await getSettings();

  const baseFilter = { isPublished: true, isHidden: { $ne: true } };

  const [recentlyUpdated, popular, heroManga] = await Promise.all([
    fetchMangaCardData(baseFilter, { updatedAt: -1 }, HOMELIMIT),
    fetchMangaCardData(baseFilter, { views: -1 }, HOMELIMIT),
    Manga.findOne(baseFilter)
      .sort({ views: -1 })
      .select("slug title bannerImage coverImage description author status type")
      .lean() as unknown as {
        slug: string;
        title: string;
        bannerImage?: string;
        coverImage?: string;
        description?: string;
        author?: string;
        status: string;
        type: string;
      } | null,
  ]);

  return (
    <div className="container py-6 sm:py-8">
      {/* Hero */}
      {heroManga && (heroManga.bannerImage || heroManga.coverImage) && (
        <section className="group relative mb-10 overflow-hidden rounded-2xl border bg-card shadow-elev-1">
          <div className="absolute inset-0">
            <Image
              src={(heroManga.bannerImage || heroManga.coverImage)!}
              alt=""
              fill
              priority
              sizes="100vw"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 gradient-hero" />
          </div>
          <div className="relative flex min-h-[20rem] flex-col justify-end gap-3 p-6 sm:min-h-[24rem] sm:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-elev-1">
              <Flame className="h-3.5 w-3.5" /> Popular now
            </span>
            <h1 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              {heroManga.title}
            </h1>
            {heroManga.author && (
              <p className="text-sm text-muted-foreground">by {heroManga.author}</p>
            )}
            {heroManga.description && (
              <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground text-balance">
                {heroManga.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={`/manga/${heroManga.slug}`}>
                  Read now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="backdrop-blur">
                <Link href="/browse">Browse library</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {settings.announcements.length > 0 && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {settings.announcements.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <Sparkles className="h-5 w-5 text-primary" /> Recently updated
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Fresh chapters just landed.</p>
          </div>
          <Link
            href="/browse?sort=latest"
            className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <MangaGrid
          manga={recentlyUpdated}
          emptyTitle="No series yet"
          emptyDescription="Be the first to add manga once published."
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <TrendingUp className="h-5 w-5 text-primary" /> Popular
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Most-read this week.</p>
          </div>
          <Link
            href="/browse?sort=views"
            className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <MangaGrid manga={popular} emptyTitle="No series yet" />
      </section>
    </div>
  );
}