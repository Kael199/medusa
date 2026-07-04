// Genres & Tags management. Two columns (genres / tags), inline create +
// list with edit/delete. The page renders regardless of role (it's part of the
// admin nav for editor+), but the create/edit/delete UI only renders when the
// role holds genre:manage; otherwise a notice is shown. Mutation actions
// re-check permission server-side.

import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Genre, Tag } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { GenreTagManager } from "@/components/admin/GenreTagManager";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Genres & Tags" };

export default async function GenresPage() {
  await connect();
  const user = await getCurrentUser();
  const canManage = !!user && can(user.role, "genre:manage");

  const [genres, tags] = await Promise.all([
    Genre.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string; kind: string }[],
    Tag.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string; kind: string }[],
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Genres & Tags</h1>
        <p className="text-sm text-muted-foreground">
          Genres appear in browse filters; tags are free-form categorization.
        </p>
      </div>

      {!canManage && (
        <EmptyState title="Read-only" description="Your role cannot manage genres or tags." />
      )}

      {canManage && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GenreTagManager
            title="Genres"
            kind="genre"
            items={genres.map((g) => ({ _id: g._id.toString(), name: g.name, slug: g.slug }))}
          />
          <GenreTagManager
            title="Tags"
            kind="tag"
            items={tags.map((t) => ({ _id: t._id.toString(), name: t.name, slug: t.slug }))}
          />
        </div>
      )}
    </div>
  );
}
