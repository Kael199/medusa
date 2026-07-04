// New manga page. Server fetches the genre/tag option lists and renders the
// shared MangaForm in create mode. Permissions for create are checked by the
// createManga Server Action itself; the admin layout also gates entry to
// staff only.

import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Genre, Tag } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { MangaForm } from "@/components/admin/MangaForm";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "New manga" };

export default async function NewMangaPage() {
  await connect();
  const user = await getCurrentUser();
  if (!user || !can(user.role, "manga:create")) {
    return <EmptyState title="No permission" description="Your role cannot create manga." />;
  }

  const [genres, tags] = await Promise.all([
    Genre.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string }[],
    Tag.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string }[],
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">New manga</h1>
      <MangaForm
        mode="create"
        genres={genres.map((g) => ({ _id: g._id.toString(), name: g.name }))}
        tags={tags.map((t) => ({ _id: t._id.toString(), name: t.name }))}
        canPublish={can(user.role, "manga:publish")}
        user={{ id: user.id, role: user.role }}
      />
    </div>
  );
}
