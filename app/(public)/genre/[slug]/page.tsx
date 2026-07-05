import { notFound } from "next/navigation";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Genre } from "@/models";
import { buildBrowseFilter, buildSort } from "@/lib/query/browse";
import { paginate } from "@/lib/query/paginate";
import { MangaGrid } from "@/components/public/MangaGrid";
import type { MangaCardData } from "@/components/public/MangaCard";
import { Pagination } from "@/components/ui/pagination";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

function scalar(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) v = v[0];
  return typeof v === "string" && v.length ? v : undefined;
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  await connect();
  const { slug } = await params;
  const sp = await searchParams;

  const genre = (await Genre.findOne({ slug }).select("name slug").lean()) as
    | { _id: unknown; name: string; slug: string }
    | null;
  if (!genre) notFound();

  const page = Math.max(1, parseInt(scalar(sp.page) ?? "1", 10) || 1);
  const filter = await buildBrowseFilter({ genre: slug, sort: scalar(sp.sort) });
  const sort = buildSort(scalar(sp.sort));

  const result = await paginate(Manga, filter, {
    page,
    pageSize: 24,
    sort,
    lean: true,
    select: "slug title status type coverImage rating views updatedAt",
  });

  const manga: MangaCardData[] = result.items.map((d: any) => ({
    _id: String(d._id),
    slug: d.slug,
    title: d.title,
    status: d.status,
    type: d.type,
    coverImage: d.coverImage ?? "",
    rating: typeof d.rating === "number" ? d.rating : 0,
  }));

  const query: Record<string, string | undefined> = { sort: scalar(sp.sort) };

  return (
    <div className="container py-6 sm:py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Genre</p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{genre.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "title" : "titles"} in this genre
        </p>
      </div>
      <MangaGrid
        manga={manga}
        emptyTitle="Nothing here yet"
        emptyDescription="No published manga carry this genre."
      />
      <div className="mt-8 flex justify-center">
        <Pagination basePath={`/genre/${slug}`} query={query} page={result.page} totalPages={result.totalPages} />
      </div>
    </div>
  );
}