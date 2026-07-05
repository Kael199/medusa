import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Genre } from "@/models";
import { buildBrowseFilter, buildSort } from "@/lib/query/browse";
import { paginate } from "@/lib/query/paginate";
import { MangaGrid } from "@/components/public/MangaGrid";
import type { MangaCardData } from "@/components/public/MangaCard";
import { FilterBar } from "@/components/public/FilterBar";
import { FilterSheet } from "@/components/public/FilterSheet";
import { Pagination } from "@/components/ui/pagination";

interface BrowsePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Data + searchParams-driven; never statically renderable.
export const dynamic = "force-dynamic";

function scalar(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) v = v[0];
  return typeof v === "string" && v.length ? v : undefined;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  await connect();
  const sp = await searchParams;

  const params = {
    q: scalar(sp.q),
    status: scalar(sp.status),
    type: scalar(sp.type),
    genre: scalar(sp.genre),
    tag: scalar(sp.tag),
    sort: scalar(sp.sort),
    page: scalar(sp.page),
  };

  const filter = await buildBrowseFilter(params);
  const sort = buildSort(params.sort);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const result = await paginate(Manga, filter, {
    page,
    pageSize: 24,
    sort,
    populate: ["genres", "tags"],
    lean: true,
    select: "slug title status type coverImage rating genres tags views updatedAt",
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

  // Genre list for the filter sidebar.
  const genres = await Genre.find().sort({ name: 1 }).select("name slug").lean();
  const genreList = genres.map((g) => ({ _id: String(g._id), name: g.name, slug: g.slug }));

  const query: Record<string, string | undefined> = {
    q: params.q,
    status: params.status,
    type: params.type,
    genre: params.genre,
    tag: params.tag,
    sort: params.sort,
  };

  return (
    <div className="container py-6 sm:py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Browse</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "title" : "titles"}
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <FilterBar genres={genreList} />
        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <FilterSheet genres={genreList} />
          </div>
          <MangaGrid
            manga={manga}
            emptyTitle="No manga found"
            emptyDescription="Try removing filters or searching for something else."
          />
          <div className="mt-8 flex justify-center">
            <Pagination basePath="/browse" query={query} page={result.page} totalPages={result.totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}