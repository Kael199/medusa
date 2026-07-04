"use server";

// Image upload Server Action. v1 policy: only roles holding `upload:manage`
// (editor, super-admin) can directly upload. Uploaders own `uploads:read`
// only — they can still author chapters and have an editor/super-admin (or a
// future own-draft upload path wired into createChapter) add pages. Keeping a
// single permission gate here avoids splitting the trust boundary across
// kinds (cover/banner/chapter) for v1.
//
// Filenames on disk are ALWAYS server-generated — the user's filename is
// discarded. Magic-byte sniffing (file-type) + size limits + (SVG-excluded)
// mime allowlist run on every file. We transcode to webp via sharp so the
// public site serves a single modern format; dimensions are captured from the
// transcoded buffer for accurate aspect-ratio boxes in the reader.

import path from "node:path";
import { promises as fs } from "node:fs";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

import "@/models";
import { connect } from "@/lib/db/mongoose";
import { requireCan } from "@/lib/auth/assert";
import { asActionError, type ActionResult } from "@/lib/actions/_shared";
import { UPLOAD_LIMITS } from "@/lib/constants";
import { safeUploadDir, toPublicUrl } from "@/lib/utils/upload-path";

export interface UploadResult {
  urls: string[];
  widths: number[];
  heights: number[];
}

type ImageKind = "cover" | "banner" | "chapter";

function isImageMime(mime: string | undefined): boolean {
  const allowed: readonly string[] = UPLOAD_LIMITS.allowedMime;
  return !!mime && allowed.includes(mime);
}

export async function uploadImages(
  formData: FormData,
): Promise<ActionResult<UploadResult>> {
  try {
    await connect();
    // All uploads require upload:manage in v1 (see file header).
    await requireCan("upload:manage");

    const kind = String(formData.get("kind") ?? "") as ImageKind;
    const mangaId = String(formData.get("mangaId") ?? "");
    const chapterId = formData.get("chapterId");
    const chapterIdStr = chapterId ? String(chapterId) : undefined;

    if (!["cover", "banner", "chapter"].includes(kind)) {
      return { ok: false, error: "Invalid upload kind" };
    }
    if (!mangaId) return { ok: false, error: "mangaId is required" };
    if (kind === "chapter" && !chapterIdStr) {
      return { ok: false, error: "chapterId is required for chapter uploads" };
    }

    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) return { ok: false, error: "No files provided" };

    if (kind === "chapter" && files.length > UPLOAD_LIMITS.maxPagesPerChapter) {
      return {
        ok: false,
        error: `A chapter can have at most ${UPLOAD_LIMITS.maxPagesPerChapter} pages`,
      };
    }

    const maxBytes =
      kind === "cover" ? UPLOAD_LIMITS.maxCoverBytes : UPLOAD_LIMITS.maxFileBytes;

    const dir = safeUploadDir(mangaId, {
      kind: kind === "cover" ? "covers" : kind === "banner" ? "banners" : "chapters",
      chapterId: chapterIdStr,
    });
    await fs.mkdir(dir, { recursive: true });

    const ts = Date.now();
    const urls: string[] = [];
    const widths: number[] = [];
    const heights: number[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxBytes) {
        return { ok: false, error: `File "${file.name}" exceeds ${(maxBytes / 1024 / 1024).toFixed(0)} MB limit` };
      }

      const buf = Buffer.from(await file.arrayBuffer());

      // Magic-byte sniff. SVG has no magic bytes file-type recognizes and is
      // intentionally excluded from allowedMime, so it falls through cleanly.
      const detected = await fileTypeFromBuffer(buf);
      if (!isImageMime(detected?.mime)) {
        return { ok: false, error: `File "${file.name}" is not an allowed image type` };
      }

      const sharpInstance = sharp(buf, { failOn: "none" });
      const meta = await sharpInstance.metadata();

      // Server-generated filename. Pages use zero-pad order; covers/banners use
      // a timestamp so refreshing replaces the previous cover file path.
      let diskName: string;
      if (kind === "chapter") {
        diskName = `${String(i).padStart(3, "0")}.webp`;
      } else {
        diskName = `${kind}-${ts}.webp`;
      }

      const dest = path.resolve(dir, diskName);
      // Re-check traversal on the final composed path too.
      const root = path.resolve(process.cwd(), "public", "uploads") + path.sep;
      if (!dest.startsWith(root)) {
        return { ok: false, error: "Resolved upload path escapes uploads root" };
      }

      await sharp(buf, { failOn: "none" })
        .webp({ quality: 85 })
        .toFile(dest);

      const outMeta = await sharp(dest).metadata();
      urls.push(toPublicUrl(dest));
      widths.push(outMeta.width ?? meta.width ?? 0);
      heights.push(outMeta.height ?? meta.height ?? 0);
    }

    return { ok: true, data: { urls, widths, heights } };
  } catch (e) {
    return asActionError(e);
  }
}
