"use client";

// Manga create/edit form. Server passes the genre/tag option lists (already
// fetched) plus the optional existing manga (id + fields), the signed-in
// user, and whether the user can publish. On submit we call createManga or
// updateManga Server Actions, show toast feedback, and redirect to
// /admin/manga. Cover/banner images are uploaded through the uploadImages
// Server Action — the resulting /uploads URL is what we persist (not the raw
// file).

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadImages } from "@/lib/actions/upload";
import { createManga, updateManga } from "@/lib/actions/manga";
import { MANGA_STATUS, MANGA_TYPE, type MangaStatus, type MangaType } from "@/lib/constants";
import type { StaffRole } from "@/lib/constants";
import { UPLOAD_LIMITS } from "@/lib/constants";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface GenreTagOption {
  _id: string;
  name: string;
}

export interface MangaFormValue {
  _id: string;
  title: string;
  altTitles: string[];
  description: string;
  author: string;
  artist: string;
  status: MangaStatus;
  type: MangaType;
  year: number | null;
  coverImage: string;
  bannerImage: string;
  genreIds: string[];
  tagIds: string[];
  isPublished: boolean;
  isHidden: boolean;
}

export function MangaForm({
  mode,
  manga,
  genres,
  tags,
  canPublish,
  user,
}: {
  mode: "create" | "edit";
  manga?: Partial<MangaFormValue>;
  genres: GenreTagOption[];
  tags: GenreTagOption[];
  canPublish: boolean;
  user?: { id: string; role: StaffRole };
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const [title, setTitle] = React.useState(manga?.title ?? "");
  const [altTitles, setAltTitles] = React.useState((manga?.altTitles ?? []).join("\n"));
  const [description, setDescription] = React.useState(manga?.description ?? "");
  const [author, setAuthor] = React.useState(manga?.author ?? "");
  const [artist, setArtist] = React.useState(manga?.artist ?? "");
  const [status, setStatus] = React.useState<MangaStatus>(manga?.status ?? "ongoing");
  const [type, setType] = React.useState<MangaType>(manga?.type ?? "manga");
  const [year, setYear] = React.useState<string>(
    manga?.year != null ? String(manga.year) : "",
  );
  const [coverImage, setCoverImage] = React.useState(manga?.coverImage ?? "");
  const [bannerImage, setBannerImage] = React.useState(manga?.bannerImage ?? "");
  const [genreIds, setGenreIds] = React.useState<string[]>(manga?.genreIds ?? []);
  const [tagIds, setTagIds] = React.useState<string[]>(manga?.tagIds ?? []);
  const [isPublished, setIsPublished] = React.useState<boolean>(
    Boolean(manga?.isPublished),
  );
  const [isHidden, setIsHidden] = React.useState<boolean>(Boolean(manga?.isHidden));
  const [uploading, setUploading] = React.useState(false);

  // For an uploader editing an existing manga that they own but cannot
  // publish, hide the switch and silently drop the value on submit.
  const showPublishToggle = canPublish;

  async function uploadFile(file: File, kind: "cover" | "banner") {
    if (!manga?._id && mode === "create") {
      toast.error("Save the manga first before uploading a cover image.");
      return;
    }
    const id = manga?._id;
    if (!id) return;
    if (file.size > UPLOAD_LIMITS.maxCoverBytes) {
      toast.error(`Image exceeds ${(UPLOAD_LIMITS.maxCoverBytes / 1024 / 1024).toFixed(0)} MB`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("mangaId", String(id));
      fd.append("files", file, file.name);
      const res = await uploadImages(fd);
      if (res.ok) {
        const url = res.data.urls[0];
        if (!url) {
          toast.error("Upload failed");
          return;
        }
        if (kind === "cover") setCoverImage(url);
        else setBannerImage(url);
        toast.success("Image uploaded");
      } else {
        toast.error(res.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  function toggle(ids: string[], setIds: (v: string[]) => void, id: string) {
    setIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const yearNum = year.trim() === "" ? null : Number(year);
    if (yearNum != null && !Number.isFinite(yearNum)) {
      toast.error("Year must be a number");
      return;
    }

    const payload = {
      title: title.trim(),
      altTitles: altTitles.split("\n").map((s) => s.trim()).filter(Boolean),
      description,
      author,
      artist,
      status,
      type,
      year: yearNum,
      coverImage,
      bannerImage,
      genreIds,
      tagIds,
      isPublished: showPublishToggle ? isPublished : false,
      isHidden,
    };

    startTransition(async () => {
      let res: { ok: boolean; error?: string; data?: { id: string; slug: string } };
      if (mode === "create") {
        res = await createManga(payload);
      } else {
        res = await updateManga(String(manga?._id ?? ""), payload);
      }
      if (res.ok) {
        toast.success(mode === "create" ? "Manga created" : "Manga updated");
        router.push("/admin/manga");
        router.refresh();
      } else {
        toast.error(res.error ?? "Save failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{mode === "create" ? "New Manga" : "Edit Manga"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altTitles">Alternative titles (one per line)</Label>
              <Textarea
                id="altTitles"
                value={altTitles}
                onChange={(e) => setAltTitles(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                maxLength={5000}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} maxLength={120} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as MangaStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MANGA_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as MangaType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MANGA_TYPE.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1900}
                  max={2100}
                  placeholder="e.g. 2024"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cover image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coverImage ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="cover" className="h-48 w-full rounded-md object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={() => setCoverImage("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  No cover
                </div>
              )}
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploading || (mode === "create" && !manga?._id)}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f, "cover");
                  e.target.value = "";
                }}
              />
              {mode === "create" && (
                <p className="text-xs text-muted-foreground">Save the manga first to upload a cover.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bannerImage ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerImage} alt="banner" className="h-28 w-full rounded-md object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={() => setBannerImage("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-28 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  No banner
                </div>
              )}
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploading || (mode === "create" && !manga?._id)}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f, "banner");
                  e.target.value = "";
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Published</Label>
                {showPublishToggle ? (
                  <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
                ) : (
                  <span className="text-xs text-muted-foreground">no permission</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isHidden">Hidden</Label>
                <Switch id="isHidden" checked={isHidden} onCheckedChange={setIsHidden} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPicker
          title="Genres"
          options={genres}
          selected={genreIds}
          onToggle={(id) => toggle(genreIds, setGenreIds, id)}
        />
        <CategoryPicker
          title="Tags"
          options={tags}
          selected={tagIds}
          onToggle={(id) => toggle(tagIds, setTagIds, id)}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
      {user && (
        <p className="text-xs text-muted-foreground">
          Acting as <strong>{user.role}</strong> &mdash;{canPublish ? "" : " you cannot publish."}
        </p>
      )}
    </form>
  );
}

function CategoryPicker({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: GenreTagOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = new Set(selected);
  const selectedNames = options
    .filter((o) => selectedSet.has(o._id))
    .map((o) => o.name);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Done" : "Select"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-1">
          {selectedNames.length === 0 ? (
            <span className="text-sm text-muted-foreground">None selected</span>
          ) : (
            selectedNames.map((n) => (
              <Badge key={n} variant="secondary" className="gap-1">{n}</Badge>
            ))
          )}
        </div>
        {open && (
          <div className="grid max-h-56 grid-cols-2 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-3">
            {options.map((o) => (
              <label key={o._id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedSet.has(o._id)}
                  onChange={() => onToggle(o._id)}
                />
                <span className={cn("truncate", selectedSet.has(o._id) && "font-medium")}>{o.name}</span>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MangaForm;
