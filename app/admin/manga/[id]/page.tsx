// Edit manga page. Loads the manga + genre/tag lists, guards that the user
// can edit it (we rely on the action for own-checks here; the page just shows
// the form), and renders MangaForm in edit mode with the manga's current
// values. canPublish controls the publish switch.

import { notFound } from "next/navigation";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga, type MangaDoc } from "@/models";
import { Genre, Tag } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can, canEditManga } from "@/lib/auth/rbac";
import { MangaForm, type MangaFormValue } from "@/components/admin/MangaForm";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Edit manga" };

export default async function EditMangaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connect();
  const { id } = await params;
  const manga = (await Manga.findById(id).populate(["genres", "tags"]).lean()) as
    | (MangaDoc & {
        _id: import("mongoose").Types.ObjectId;
        genres?: { _id: import("mongoose").Types.ObjectId; name: string }[];
        tags?: { _id: import("mongoose").Types.ObjectId; name: string }[];
      })
    | null;

  if (!manga) notFound();

  const user = await getCurrentUser();
  if (!user) notFound();

  if (!canEditManga({ id: user.id, role: user.role }, manga)) {
    return <EmptyState title="No permission" description="You can only edit manga you own." />;
  }

  const [genres, tags] = await Promise.all([
    Genre.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string }[],
    Tag.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string }[],
  ]);

  const value: MangaFormValue = {
    _id: manga._id.toString(),
    title: manga.title,
    altTitles: manga.altTitles ?? [],
    description: manga.description,
    author: manga.author,
    artist: manga.artist,
    status: manga.status,
    type: manga.type,
    year: manga.year ?? null,
    coverImage: manga.coverImage,
    bannerImage: manga.bannerImage,
    genreIds: (manga.genres ?? []).map((g) => g._id.toString()),
    tagIds: (manga.tags ?? []).map((t) => t._id.toString()),
    isPublished: manga.isPublished,
    isHidden: manga.isHidden,
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Edit manga</h1>
      <MangaForm
        mode="edit"
        manga={value}
        genres={genres.map((g) => ({ _id: g._id.toString(), name: g.name }))}
        tags={tags.map((t) => ({ _id: t._id.toString(), name: t.name }))}
        canPublish={can(user.role, "manga:publish")}
        user={{ id: user.id, role: user.role }}
      />
    </div>
  );
}
