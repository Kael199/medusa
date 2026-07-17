import Link from "next/link";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga } from "@/models";
import { getSettings } from "@/lib/query/get-settings";
import { MangaGrid } from "@/components/public/MangaGrid";
import type { MangaCardData } from "@/components/public/MangaCard";
import {
  FeaturedMangaSlider,
  type FeaturedMangaSlide,
} from "@/components/public/FeaturedMangaSlider";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

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

  const [recentlyUpdated, popular, featuredManga] = await Promise.all([
    fetchMangaCardData(baseFilter, { updatedAt: -1 }, HOMELIMIT),
    fetchMangaCardData(baseFilter, { views: -1 }, HOMELIMIT),
    Manga.find(baseFilter)
      .sort({ views: -1, updatedAt: -1 })
      .limit(5)
      .select("slug title bannerImage coverImage description author status type rating")
      .lean() as unknown as FeaturedMangaSlide[],
  ]);

  return (
    <div className="container hero-aurora py-6 sm:py-8">
      <FeaturedMangaSlider slides={featuredManga} />

      {featuredManga.length === 0 && (
        <section className="mb-12 overflow-hidden rounded-[2rem] border border-indigo-200/60 bg-[radial-gradient(circle_at_top_right,hsl(24_95%_53%/0.18),transparent_35%),linear-gradient(135deg,hsl(var(--card)),hsl(243_75%_97%))] p-8 shadow-elev-2 dark:border-indigo-400/10 dark:bg-[radial-gradient(circle_at_top_right,hsl(24_95%_53%/0.22),transparent_35%),linear-gradient(135deg,hsl(222_30%_10%),hsl(243_45%_16%))] sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Your next obsession</p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-black tracking-[-0.045em] sm:text-5xl">
            A curated home for every chapter.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            New releases, fan favorites, and unforgettable worlds will appear here as soon as you publish your first series.
          </p>
          <Link href="/browse" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-elev-2 transition hover:-translate-y-0.5 hover:brightness-110">
            Explore library <ArrowRight className="h-4 w-4" />
          </Link>
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