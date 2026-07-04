// Chapters for a manga. Lists chapters ordered by chapterNumber; gives an
// inline published toggle (chapter:publish) and edit/delete. New chapter
// button is gated by chapter:create.

import Link from "next/link";
import { notFound } from "next/navigation";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Chapter, type MangaDoc, type ChapterDoc } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { setChapterPublished, deleteChapter } from "@/lib/actions/chapter";
import { Plus, ExternalLink } from "lucide-react";

export const metadata = { title: "Chapters" };

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connect();
  const { id } = await params;
  const manga = (await Manga.findById(id).select("title slug").lean()) as MangaDoc | null;
  if (!manga) notFound();

  const user = await getCurrentUser();

  const chapters = (await Chapter.find({ mangaId: manga._id })
    .sort({ chapterNumber: 1 })
    .lean()) as unknown as ChapterDoc[];

  const canPublish = !!user && can(user.role, "chapter:publish");
  const canDelete = !!user && can(user.role, "chapter:delete");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chapters</h1>
          <p className="text-sm text-muted-foreground">
            <Link href={`/admin/manga/${manga._id}`} className="hover:underline">{manga.title}</Link>{" "}
            · {chapters.length} chapter(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/manga/${manga.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /> View public</Link>
          </Button>
          {user && can(user.role, "chapter:create") && (
            <Button asChild>
              <Link href={`/admin/manga/${manga._id}/chapters/new`}><Plus className="h-4 w-4" /> New chapter</Link>
            </Button>
          )}
        </div>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          title="No chapters yet"
          description="Create the first chapter to start adding pages."
          action={
            user && can(user.role, "chapter:create") ? (
              <Button asChild><Link href={`/admin/manga/${manga._id}/chapters/new`}><Plus className="h-4 w-4" /> New chapter</Link></Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((c) => (
                <TableRow key={c._id.toString()}>
                  <TableCell className="font-mono tabular-nums">{c.chapterNumber}</TableCell>
                  <TableCell>{c.title || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{c.volume ?? "—"}</TableCell>
                  <TableCell>{c.pages?.length ?? 0}</TableCell>
                  <TableCell>
                    {canPublish ? (
                      <PublishToggle
                        id={c._id.toString()}
                        published={Boolean(c.isPublished)}
                        action={setChapterPublished}
                      />
                    ) : c.isPublished ? (
                      <Badge variant="success">published</Badge>
                    ) : (
                      <Badge variant="secondary">draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/manga/${manga._id}/chapters/${c._id}`}>Edit</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/read/${manga.slug}/${c._id}`} target="_blank">Read</Link>
                      </Button>
                      {canDelete && (
                        <DeleteButton
                          id={c._id.toString()}
                          action={deleteChapter}
                          confirm={`Delete chapter ${c.chapterNumber}?`}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
