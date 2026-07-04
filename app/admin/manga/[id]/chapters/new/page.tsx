// New chapter page. Renders the ChapterForm in create mode; after create the
// form redirects to the edit-chapter page where pages can be uploaded.

import { notFound } from "next/navigation";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, type MangaDoc } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can, canEditManga } from "@/lib/auth/rbac";
import { ChapterForm } from "@/components/admin/ChapterForm";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "New chapter" };

export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connect();
  const { id } = await params;
  const manga = (await Manga.findById(id).select("title _id").lean()) as MangaDoc | null;
  if (!manga) notFound();

  const user = await getCurrentUser();
  if (!user) notFound();
  if (!can(user.role, "chapter:create") || !canEditManga({ id: user.id, role: user.role }, manga)) {
    return <EmptyState title="No permission" description="You can only add chapters to manga you own." />;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">New chapter</h1>
      <p className="text-sm text-muted-foreground">For: {manga.title}</p>
      <ChapterForm
        mangaId={manga._id.toString()}
        mode="create"
        canPublish={can(user.role, "chapter:publish")}
        user={{ id: user.id, role: user.role }}
        redirectHrefAfterCreate={`/admin/manga/${manga._id}/chapters/{id}`}
      />
    </div>
  );
}
