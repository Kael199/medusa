"use client";

// Genre/tag inline manager. Create + list with inline rename + delete; runs
// the Genre/Tag Server Actions. Re-fetches the page after each mutation to
// surface server validation errors via the action result.

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Check, X } from "lucide-react";
import {
  createGenre, createTag, updateGenre, updateTag, deleteGenre, deleteTag,
} from "@/lib/actions/genre";
import type { TagKind } from "@/lib/constants";

export interface GenreTagItem {
  _id: string;
  name: string;
  slug: string;
}

export function GenreTagManager({
  title,
  kind,
  items,
}: {
  title: string;
  kind: TagKind;
  items: GenreTagItem[];
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [pending, start] = React.useTransition();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");

  const create = kind === "genre" ? createGenre : createTag;
  const update = kind === "genre" ? updateGenre : updateTag;
  const del = kind === "genre" ? deleteGenre : deleteTag;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    start(async () => {
      const res = await create({ name: name.trim(), kind });
      if (res.ok) {
        setName("");
        toast.success(`Created`);
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed to create");
      }
    });
  }

  function startEdit(item: GenreTagItem) {
    setEditingId(item._id);
    setEditName(item.name);
  }

  async function saveEdit(id: string) {
    start(async () => {
      const res = await update(id, { name: editName.trim(), kind });
      if (res.ok) {
        setEditingId(null);
        toast.success("Updated");
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed to update");
      }
    });
  }

  async function handleDelete(id: string, n: string) {
    if (!window.confirm(`Delete "${n}"? It will be removed from all manga.`)) return;
    start(async () => {
      const res = await del(id);
      if (res.ok) {
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed to delete");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title} <span className="text-sm font-normal text-muted-foreground">({items.length})</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder={`New ${kind} name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <Button type="submit" size="sm" disabled={pending}>Add</Button>
        </form>
        <ul className="divide-y rounded-md border">
          {items.length === 0 && (
            <li className="p-3 text-sm text-muted-foreground">None yet.</li>
          )}
          {items.map((item) => (
            <li key={item._id} className="flex items-center justify-between gap-2 p-2">
              {editingId === item._id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 max-w-xs"
                  />
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" onClick={() => saveEdit(item._id)} disabled={pending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/{item.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => startEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item._id, item.name)}
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default GenreTagManager;
