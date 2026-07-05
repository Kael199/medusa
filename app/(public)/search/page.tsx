import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga } from "@/models";
import { buildBrowseFilter, buildSort } from "@/lib/query/browse";
import { paginate } from "@/lib/query/paginate";
import { MangaGrid } from "@/components/public/MangaGrid";
import type { MangaCardData } from "@/components/public/MangaCard";
import { SearchBar } from "@/components/public/SearchBar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Data + searchParams-driven; never statically renderable.
export const dynamic = "force-dynamic";

function scalar(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) v = v[0];
  return typeof v === "string" && v.length ? v : undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await connect();
  const sp = await searchParams;
  const q = scalar(sp.q) ?? "";
  const page = Math.max(1, parseInt(scalar(sp.page) ?? "1", 10) || 1);

  const headings = (
    <div className="mb-6">
      <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Search</h1>
      <SearchBar defaultValue={q} className="max-w-xl" />
    </div>
  );

  if (!q) {
    return (
      <div className="container py-6 sm:py-8">
        {headings}
        <EmptyState
          icon={Search}
          title="Type to search"
          description="Find manga, manhwa and manhua by title, alternative titles or author."
        />
      </div>
    );
  }

  const filter = await buildBrowseFilter({ q, sort: scalar(sp.sort) });
  const sort = buildSort(scalar(sp.sort));
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

  const query: Record<string, string | undefined> = { q };

  return (
    <div className="container py-6 sm:py-8">
      {headings}
      <p className="mb-4 text-sm text-muted-foreground">
        {result.total} {result.total === 1 ? "result" : "results"} for “{q}”
      </p>
      <MangaGrid
        manga={manga}
        emptyTitle="No results"
        emptyDescription={`No manga matched “${q}”. Try a different search.`}
      />
      <div className="mt-8 flex justify-center">
        <Pagination basePath="/search" query={query} page={result.page} totalPages={result.totalPages} />
      </div>
    </div>
  );
}