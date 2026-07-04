// Edit chapter page. Shows metadata form + the PageUploader for pages. Own/
// permission checks enforced at the action layer; the page just gates the
// chrome for clarity.

import Link from "next/link";
import { notFound } from "next/navigation";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, Chapter, type MangaDoc, type ChapterDoc } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can, canEditChapter, canEditManga } from "@/lib/auth/rbac";
import { ChapterForm, type ChapterFormValue } from "@/components/admin/ChapterForm";
import { PageUploader } from "@/components/admin/PageUploader";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { StaffRole } from "@/lib/constants";

export const metadata = { title: "Edit chapter" };

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  await connect();
  const { id, chapterId } = await params;

  const manga = (await Manga.findById(id).select("title slug _id").lean()) as MangaDoc | null;
  if (!manga) notFound();

  const chapter = (await Chapter.findById(chapterId).lean()) as ChapterDoc | null;
  if (!chapter) notFound();

  // Guard against matrix mismatch: chapter must belong to that manga.
  if (String(chapter.mangaId) !== String(manga._id)) notFound();

  const user = await getCurrentUser();
  if (!user) notFound();
  const fullUser = { id: user.id, role: user.role as StaffRole };
  if (!canEditChapter(fullUser, chapter) && !canEditManga(fullUser, manga)) {
    return <EmptyState title="No permission" description="You can only edit chapters you own." />;
  }

  const value: ChapterFormValue = {
    _id: chapter._id.toString(),
    chapterNumber: chapter.chapterNumber,
    volume: chapter.volume ?? null,
    title: chapter.title,
    isPublished: chapter.isPublished,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chapter {chapter.chapterNumber}
            {chapter.title ? ` · ${chapter.title}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            <Link href={`/admin/manga/${manga._id}`} className="hover:underline">{manga.title}</Link>{" "}
            · {chapter.pages.length} page(s)
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/read/${manga.slug}/${chapter._id}`} target="_blank">
            <ExternalLink className="h-4 w-4" /> View public
          </Link>
        </Button>
      </div>

      <ChapterForm
        mangaId={manga._id.toString()}
        mode="edit"
        chapter={value}
        canPublish={can(user.role, "chapter:publish")}
        user={fullUser}
      />

      <PageUploader
        mangaId={manga._id.toString()}
        chapterId={chapter._id.toString()}
        existingPages={chapter.pages.map((p) => ({ url: p.url, width: p.width, height: p.height }))}
      />
    </div>
  );
}
