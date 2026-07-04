// Admin dashboard. Counts manga/chapters, total views, top-rated and recently
// updated manga. Read-only server fetches; uses StatCard + a recent list.

import Link from "next/link";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Chapter } from "@/models";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, BookOpen, Eye, Star, Plus } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  await connect();
  const [mangaCount, chapterCount, totalViewsAgg, topRatedRaw, recentRaw] = await Promise.all([
    Manga.countDocuments(),
    Chapter.countDocuments(),
    Manga.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
    Manga.find({ isPublished: true, rating: { $gt: 0 } })
      .sort({ rating: -1, ratingCount: -1 })
      .limit(5)
      .select("title slug rating ratingCount coverImage")
      .lean() as unknown as { _id: import("mongoose").Types.ObjectId; title: string; slug: string; rating: number; ratingCount: number; coverImage?: string | null }[],
    Manga.find()
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("title slug status type isPublished isHidden updatedAt")
      .lean() as unknown as { _id: import("mongoose").Types.ObjectId; title: string; slug: string; status: string; type: string; isPublished: boolean; isHidden: boolean; updatedAt: Date }[],
  ]);
  const topRated = topRatedRaw;
  const recent = recentRaw;

  const totalViews = totalViewsAgg[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your manga CMS.</p>
        </div>
        <Button asChild>
          <Link href="/admin/manga/new"><Plus className="h-4 w-4" /> New manga</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Manga" value={mangaCount} icon={Book} />
        <StatCard title="Chapters" value={chapterCount} icon={BookOpen} />
        <StatCard title="Total views" value={totalViews.toLocaleString()} icon={Eye} />
        <StatCard title="Top-rated" value={topRated.length} icon={Star} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Top rated</h2>
          <ul className="divide-y rounded-md border">
            {topRated.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No rated manga yet.</li>
            )}
            {topRated.map((m) => (
              <li key={m._id.toString()} className="flex items-center justify-between p-3">
                <Link href={`/admin/manga/${m._id}`} className="truncate text-sm font-medium hover:underline">
                  {m.title}
                </Link>
                <span className="text-sm tabular-nums">
                  <Star className="inline h-3.5 w-3.5 text-amber-500" /> {m.rating.toFixed(1)} ({m.ratingCount})
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recently updated</h2>
          <ul className="divide-y rounded-md border">
            {recent.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No manga yet.</li>
            )}
            {recent.map((m) => (
              <li key={m._id.toString()} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <Link href={`/admin/manga/${m._id}`} className="block truncate text-sm font-medium hover:underline">
                    {m.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.isPublished ? "success" : "secondary"}>
                    {m.isPublished ? "published" : "draft"}
                  </Badge>
                  {m.isHidden && <Badge variant="outline">hidden</Badge>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
