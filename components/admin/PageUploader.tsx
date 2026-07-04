"use client";

// Chapter page uploader. Drag/drop or pick multiple images; we POST each via
// the uploadImages Server Action (transcoded to webp server-side), then render
// the resulting thumbnails in an ordered list. Up/down move buttons reorder
// pages; Save persists via setChapterPages (full replace). Client-side limit
// checks happen on the file list before upload.

import * as React from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Trash2, Upload as UploadIcon, Save } from "lucide-react";
import { uploadImages } from "@/lib/actions/upload";
import { setChapterPages, reorderPages } from "@/lib/actions/chapter";
import { UPLOAD_LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export interface ExistingPage {
  url: string;
  width: number;
  height: number;
}

export function PageUploader({
  mangaId,
  chapterId,
  existingPages,
}: {
  mangaId: string;
  chapterId: string;
  existingPages: ExistingPage[];
}) {
  const [pages, setPages] = React.useState<ExistingPage[]>(existingPages);
  const [pending, startTransition] = React.useTransition();
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => setPages(existingPages), [existingPages]);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    if (pages.length + arr.length > UPLOAD_LIMITS.maxPagesPerChapter) {
      toast.error(`Max ${UPLOAD_LIMITS.maxPagesPerChapter} pages per chapter`);
      return;
    }
    let oversized = 0;
    for (const f of arr) {
      if (f.size > UPLOAD_LIMITS.maxFileBytes) oversized++;
    }
    if (oversized > 0) {
      toast.error(`${oversized} file(s) exceed ${(UPLOAD_LIMITS.maxFileBytes / 1024 / 1024).toFixed(0)} MB`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("kind", "chapter");
      fd.set("mangaId", mangaId);
      fd.set("chapterId", chapterId);
      arr.forEach((f) => fd.append("files", f, f.name));
      const res = await uploadImages(fd);
      if (res.ok) {
        const appended = res.data.urls.map((url, i) => ({
          url,
          width: res.data.widths[i] ?? 0,
          height: res.data.heights[i] ?? 0,
        }));
        setPages((prev) => [...prev, ...appended]);
        toast.success(`Uploaded ${appended.length} page(s)`);
        startTransition(async () => {
          const saveRes = await setChapterPages(chapterId, pages.concat(appended).map((p) => ({ url: p.url, width: p.width, height: p.height })));
          if (!saveRes.ok) toast.error(saveRes.error ?? "Failed to persist pages");
        });
      } else {
        toast.error(res.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, dir: -1 | 1) {
    setPages((prev) => {
      const next = prev.slice();
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function remove(idx: number) {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  }

  function saveOrder() {
    startTransition(async () => {
      const res = await setChapterPages(
        chapterId,
        pages.map((p) => ({ url: p.url, width: p.width, height: p.height })),
      );
      if (res.ok) toast.success("Page order saved");
      else toast.error(res.error ?? "Save failed");
    });
  }

  function reorderOnly() {
    startTransition(async () => {
      const res = await reorderPages(chapterId, pages.map((p) => p.url));
      if (res.ok) toast.success("Order updated");
      else toast.error(res.error ?? "Save failed");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pages</CardTitle>
          <p className="text-sm text-muted-foreground">{pages.length} page(s)</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={reorderOnly} disabled={pending || pages.length === 0}>
            <Save className="h-4 w-4" /> Save order
          </Button>
          <Button type="button" size="sm" onClick={saveOrder} disabled={pending || pages.length === 0}>
            {pending ? "Saving…" : "Save pages"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors",
            dragging ? "border-primary bg-muted/40" : "border-muted",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
        >
          <UploadIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag & drop images, or</p>
          <Input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
            }}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Up to {UPLOAD_LIMITS.maxPagesPerChapter} pages, {(UPLOAD_LIMITS.maxFileBytes / 1024 / 1024).toFixed(0)} MB each.
          </p>
        </div>

        {pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pages yet.</p>
        ) : (
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((p, i) => (
              <li key={p.url + i} className="rounded-md border p-2">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`page ${i + 1}`} className="h-40 w-full rounded bg-muted object-contain" />
                  <Badge className="absolute left-1 top-1">{i + 1}</Badge>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => remove(i)}
                    aria-label="Remove page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.width}×{p.height}</span>
                  <div className="flex">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={i === pages.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default PageUploader;
