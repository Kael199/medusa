// Uploads library. Read-only browse of the public/uploads/manga tree. We walk
// the disk — each manga folder lists covers/ banners/ chapters/<chapterId>/ —
// so admin staff can see what exists. Deletion of orphaned uploads is a v1
// TODO: do it via the manga/chapter delete actions (which remove the relative
// dirs best-effort).

import { promises as fs } from "node:fs";
import path from "node:path";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UPLOAD_ROOT } from "@/lib/utils/upload-path";

export const metadata = { title: "Uploads" };

interface FileEntry {
  name: string;
  url: string;
}

interface ChapterEntry {
  chapterId: string;
  pages: FileEntry[];
}

interface MangaTreeEntry {
  mangaId: string;
  mangaTitle: string | null;
  covers: FileEntry[];
  banners: FileEntry[];
  chapters: ChapterEntry[];
}

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
function isImage(name: string): boolean {
  return IMAGE_EXT.test(name);
}

async function safeReaddir(p: string): Promise<string[]> {
  try {
    return await fs.readdir(p);
  } catch {
    return [];
  }
}

function filesToEntries(names: string[], urlBase: string): FileEntry[] {
  return names
    .filter(isImage)
    .map((n) => ({ name: n, url: `${urlBase}/${n}` }));
}

export default async function UploadsPage() {
  await connect();
  const user = await getCurrentUser();
  if (!user || !can(user.role, "uploads:read")) {
    return <EmptyState title="No permission" description="Your role cannot browse uploads." />;
  }

  let readError: string | null = null;
  const tree: MangaTreeEntry[] = [];

  try {
    const mangaRoot = path.resolve(UPLOAD_ROOT, "manga");
    const mangaDirs = await safeReaddir(mangaRoot);
    const validIds = mangaDirs.filter((d) => /^[a-f0-9]{24}$/i.test(d));

    const docs = validIds.length
      ? (await Manga.find({ _id: { $in: validIds } }).select("title slug").lean()) as unknown as { _id: import("mongoose").Types.ObjectId; title: string; slug: string }[]
      : [];
    const byId = new Map(docs.map((d) => [d._id.toString(), d.title]));

    for (const dir of validIds) {
      const mangaPath = path.resolve(mangaRoot, dir);
      const entry: MangaTreeEntry = {
        mangaId: dir,
        mangaTitle: byId.get(dir) ?? null,
        covers: [],
        banners: [],
        chapters: [],
      };

      const subdirs = await safeReaddir(mangaPath);
      for (const sub of subdirs) {
        const subPath = path.resolve(mangaPath, sub);
        if (sub === "covers") {
          entry.covers = filesToEntries(await safeReaddir(subPath), `/uploads/manga/${dir}/covers`);
        } else if (sub === "banners") {
          entry.banners = filesToEntries(await safeReaddir(subPath), `/uploads/manga/${dir}/banners`);
        } else if (sub === "chapters") {
          const chapterDirs = await safeReaddir(subPath);
          for (const cd of chapterDirs) {
            if (!/^[a-f0-9]{24}$/i.test(cd)) continue;
            entry.chapters.push({
              chapterId: cd,
              pages: filesToEntries(await safeReaddir(path.resolve(subPath, cd)), `/uploads/manga/${dir}/chapters/${cd}`),
            });
          }
        }
      }
      tree.push(entry);
    }
  } catch (e) {
    readError = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Uploads</h1>
        <p className="text-sm text-muted-foreground">
          Read-only library of uploaded media on disk. Deletion of orphaned files is a TODO.
        </p>
      </div>
      {readError && (
        <p className="text-sm text-destructive">Failed to read uploads dir: {readError}</p>
      )}
      {tree.length === 0 ? (
        <EmptyState title="No uploads yet" description="Upload covers, banners, or chapter pages to see them here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tree.map((entry) => (
            <Card key={entry.mangaId}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="truncate">
                  {entry.mangaTitle ?? `(orphaned ${entry.mangaId.slice(-6)})`}
                </CardTitle>
                <Badge variant="secondary">{entry.mangaId.slice(-6)}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <UploadGroup label="Covers" items={entry.covers} />
                <UploadGroup label="Banners" items={entry.banners} />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Chapter pages</p>
                  {entry.chapters.length === 0 && (
                    <p className="text-xs text-muted-foreground">None.</p>
                  )}
                  {entry.chapters.map((c) => (
                    <div key={c.chapterId} className="space-y-1">
                      <p className="text-xs font-mono text-muted-foreground">chapter {c.chapterId.slice(-6)}</p>
                      <div className="flex flex-wrap gap-2">
                        {c.pages.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={p.url} src={p.url} alt="" className="h-16 w-12 rounded border object-cover" title={p.name} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadGroup({ label, items }: { label: string; items: FileEntry[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label} ({items.length})</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={it.url} src={it.url} alt={it.name} className="h-16 w-16 rounded border object-cover" title={it.name} />
          ))}
        </div>
      )}
    </div>
  );
}
