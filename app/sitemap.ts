import type { MetadataRoute } from "next";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Chapter, Genre } from "@/models";

// The sitemap reflects live DB content (genres/manga), so it must be generated
// per request, not prerendered at build time against a DB that isn't running.
export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MANGA_LIMIT = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connect();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const genres = await Genre.find().select("slug").lean();
  for (const g of genres) {
    staticUrls.push({ url: `${BASE}/genre/${g.slug}`, changeFrequency: "weekly", priority: 0.6 });
  }

  const manga = await Manga.find({ isPublished: true, isHidden: { $ne: true } })
    .sort({ updatedAt: -1 })
    .limit(MANGA_LIMIT)
    .select("slug updatedAt _id")
    .lean();

  const mangaEntries: MetadataRoute.Sitemap = [];
  for (const m of manga) {
    const updated = m.updatedAt ? new Date(m.updatedAt as any) : undefined;
    mangaEntries.push({
      url: `${BASE}/manga/${m.slug}`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.7,
    });

    // First chapter read URL — gives crawlers a deep link per series.
    const firstChapter = await Chapter.findOne({ mangaId: m._id, isPublished: true })
      .sort({ chapterNumber: 1 })
      .select("_id")
      .lean() as unknown as { _id: import("mongoose").Types.ObjectId } | null;
    if (firstChapter) {
      mangaEntries.push({
        url: `${BASE}/read/${m.slug}/${String(firstChapter._id)}`,
        lastModified: updated,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return [...staticUrls, ...mangaEntries];
}
