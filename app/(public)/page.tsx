import Link from "next/link";
import Image from "next/image";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga } from "@/models";
import { getSettings } from "@/lib/query/get-settings";
import { MangaGrid } from "@/components/public/MangaGrid";
import type { MangaCardData } from "@/components/public/MangaCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Flame, Sparkles } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero */}
      {heroManga && (heroManga.bannerImage || heroManga.coverImage) && (
        <section className="relative mb-8 overflow-hidden rounded-xl border">
          <div className="absolute inset-0">
            <Image
              src={(heroManga.bannerImage || heroManga.coverImage)!}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          </div>
          <div className="relative flex min-h-[18rem] flex-col justify-end gap-3 p-6 sm:min-h-[22rem] sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
              <Flame className="h-3.5 w-3.5" /> Popular now
            </span>
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">{heroManga.title}</h1>
            {heroManga.author && <p className="text-sm text-muted-foreground">by {heroManga.author}</p>}
            {heroManga.description && (
              <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">{heroManga.description}</p>
            )}
            <div className="mt-1">
              <Button asChild>
                <Link href={`/manga/${heroManga.slug}`}>
                  Read now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {settings.announcements.length > 0 && (
        <div className="mb-6 rounded-lg border bg-accent/40 p-3 text-sm">
          {settings.announcements.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-primary" /> Recently Updated
          </h2>
          <Link href="/browse?sort=latest" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <MangaGrid manga={recentlyUpdated} emptyTitle="No series yet" emptyDescription="Be the first to add manga once published." />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Eye className="h-5 w-5 text-primary" /> Popular
          </h2>
          <Link href="/browse?sort=views" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <MangaGrid manga={popular} emptyTitle="No series yet" />
      </section>
    </div>
  );
}
