"use client";

// Chapter metadata form (number/volume/title/published). Used on both new and
// edit pages; after create we redirect to the chapter edit page so the user
// can upload pages on the same screen.

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createChapter, updateChapter } from "@/lib/actions/chapter";
import type { StaffRole } from "@/lib/constants";

export interface ChapterFormValue {
  _id?: string;
  chapterNumber: number;
  volume: number | null;
  title: string;
  isPublished: boolean;
}

export function ChapterForm({
  mangaId,
  mode,
  chapter,
  canPublish,
  user,
  redirectHrefAfterCreate,
}: {
  mangaId: string;
  mode: "create" | "edit";
  chapter?: Partial<ChapterFormValue>;
  canPublish: boolean;
  user?: { id: string; role: StaffRole };
  redirectHrefAfterCreate?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const chapterNumber = chapter?.chapterNumber;
  const [number, setNumber] = React.useState<string>(
    chapterNumber != null ? String(chapterNumber) : "",
  );
  const [volume, setVolume] = React.useState<string>(
    chapter?.volume != null ? String(chapter.volume) : "",
  );
  const [title, setTitle] = React.useState(chapter?.title ?? "");
  const [isPublished, setIsPublished] = React.useState(Boolean(chapter?.isPublished));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(number);
    if (!Number.isFinite(num) || num < 0) {
      toast.error("Chapter number must be a non-negative number");
      return;
    }
    const vol = volume.trim() === "" ? null : Number(volume);
    if (vol != null && !Number.isFinite(vol)) {
      toast.error("Volume must be a number");
      return;
    }

    startTransition(async () => {
      const payload = { chapterNumber: num, volume: vol, title, isPublished };
      let res: { ok: boolean; error?: string; data?: { id: string } };
      if (mode === "create") {
        res = await createChapter(mangaId, payload);
      } else {
        res = await updateChapter(String(chapter?._id ?? ""), payload);
      }
      if (res.ok && res.data) {
        toast.success(mode === "create" ? "Chapter created" : "Chapter updated");
        if (mode === "create" && redirectHrefAfterCreate) {
          router.push(redirectHrefAfterCreate.replace("{id}", res.data.id));
        } else {
          router.refresh();
        }
      } else {
        toast.error(res.error ?? "Save failed");
      }
    });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New chapter" : "Edit chapter"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="number">Chapter number *</Label>
              <Input
                id="number"
                type="number"
                step="any"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublished">Published</Label>
            {canPublish ? (
              <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
            ) : (
              <span className="text-xs text-muted-foreground">no permission</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create chapter" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {user && !canPublish && (
            <p className="text-xs text-muted-foreground">Your role ({user.role}) cannot publish chapters. An editor must approve.</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default ChapterForm;
