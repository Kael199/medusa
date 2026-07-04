// Admin manga list. Server-side filtering by search + status; pagination via
// the shared Pagination component. Admin sees ALL manga (drafts, hidden,
// unpublished). The published toggle is rendered only when the role holds
// manga:publish.

import Link from "next/link";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, type MangaDoc } from "@/models";
import { paginate } from "@/lib/query/paginate";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { PAGINATION, MANGA_STATUS, type MangaStatus } from "@/lib/constants";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { setMangaPublished, deleteManga } from "@/lib/actions/manga";
import { Plus, Search } from "lucide-react";
import type { FilterQuery } from "mongoose";

export const metadata = { title: "Manga" };

interface SearchParams {
  page?: string;
  q?: string;
  status?: string;
}

export default async function AdminMangaList({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connect();
  const sp = await searchParams;
  const user = await getCurrentUser();
  const page = Math.max(Number(sp.page ?? "1") || 1, 1);
  const q = sp.q?.trim() ?? "";
  const status = sp.status?.trim() ?? "";

  const canPublish = !!user && can(user.role, "manga:publish");

  const filter: FilterQuery<MangaDoc> = {};
  if (q) {
    // Use the text index. (Admin's q searches published + drafts.)
    filter.$text = { $search: q };
  }
  if (status && (MANGA_STATUS as readonly string[]).includes(status)) {
    filter.status = status as MangaStatus;
  }

  const { items, total, totalPages, page: curPage } = await paginate(
    Manga,
    filter,
    { page, populate: ["genres", "tags"], lean: true, select: "title slug status type coverImage views isPublished isHidden updatedAt genres tags" },
  );

  const query: Record<string, string | undefined> = { q: q || undefined, status: status || undefined };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manga</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        {user && can(user.role, "manga:create") && (
          <Button asChild>
            <Link href="/admin/manga/new"><Plus className="h-4 w-4" /> New manga</Link>
          </Button>
        )}
      </div>

      <form className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search manga…"
            className="w-64 pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {MANGA_STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No manga found" description="Adjust filters or create a new manga." />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => {
                const manga = m as unknown as MangaDoc;
                return (
                  <TableRow key={manga._id.toString()}>
                    <TableCell>
                      {manga.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={manga.coverImage} alt="" className="h-14 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-14 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/manga/${manga._id}`} className="font-medium hover:underline">
                        {manga.title}
                      </Link>
                      {manga.isHidden && <Badge variant="outline" className="ml-2">hidden</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={manga.status === "ongoing" ? "default" : manga.status === "completed" ? "success" : "secondary"}>
                        {manga.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{manga.type}</TableCell>
                    <TableCell className="tabular-nums">{(manga.views ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {canPublish ? (
                        <PublishToggle
                          id={manga._id.toString()}
                          published={Boolean(manga.isPublished)}
                          action={setMangaPublished}
                        />
                      ) : manga.isPublished ? (
                        <Badge variant="success">published</Badge>
                      ) : (
                        <Badge variant="secondary">draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/manga/${manga._id}`}>Edit</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/manga/${manga._id}/chapters`}>Chapters</Link>
                        </Button>
                        {user && can(user.role, "manga:delete") && (
                          <DeleteButton
                            id={manga._id.toString()}
                            action={deleteManga}
                            confirm={`Delete "${manga.title}" and all its chapters?`}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/manga"
        query={query}
        page={curPage}
        totalPages={totalPages}
      />
    </div>
  );
}
