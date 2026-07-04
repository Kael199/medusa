"use server";

// Genre + Tag CRUD. Shared in one file because the two models have identical
// shape and identical permission (`genre:manage`). A `kind` discriminates
// which model a call targets (`genre` -> Genre, `tag` -> Tag). Deleting a
// genre/tag pulls it from manga.genres / manga.tags so docs don't carry stale
// refs. Soft revalidate of /browse + admin views.

import { Types } from "mongoose";

import "@/models";
import { connect } from "@/lib/db/mongoose";
import { Genre } from "@/models";
import { Tag } from "@/models";
import { Manga } from "@/models";
import { requireCan } from "@/lib/auth/assert";
import { asActionError, type ActionResult } from "@/lib/actions/_shared";
import type { TagKind } from "@/lib/constants";
import { revalidateGenres } from "@/lib/utils/revalidate";

export interface GenreTagInput {
  name: string;
  kind?: TagKind;
}

function toObjectId(s: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

// ---- Reads (any logged-in staff can list) ----

export async function listGenres(): Promise<ActionResult<{ _id: string; name: string; slug: string; kind: TagKind }[]>> {
  try {
    await connect();
    const docs = await Genre.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string; kind: TagKind }[];
    return {
      ok: true,
      data: docs.map((d) => ({
        _id: d._id.toString(),
        name: d.name,
        slug: d.slug,
        kind: d.kind,
      })),
    };
  } catch (e) {
    return asActionError(e);
  }
}

export async function listTags(): Promise<ActionResult<{ _id: string; name: string; slug: string; kind: TagKind }[]>> {
  try {
    await connect();
    const docs = await Tag.find().sort({ name: 1 }).lean() as unknown as { _id: import("mongoose").Types.ObjectId; name: string; slug: string; kind: TagKind }[];
    return {
      ok: true,
      data: docs.map((d) => ({
        _id: d._id.toString(),
        name: d.name,
        slug: d.slug,
        kind: d.kind,
      })),
    };
  } catch (e) {
    return asActionError(e);
  }
}

// ---- Mutations ----

export async function createGenre(
  input: GenreTagInput,
): Promise<ActionResult<{ id: string }>> {
  return createIn({ ...input, kind: "genre" });
}

export async function createTag(
  input: GenreTagInput,
): Promise<ActionResult<{ id: string }>> {
  return createIn({ ...input, kind: "tag" });
}

async function createIn(input: GenreTagInput): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    await requireCan("genre:manage");

    if (!input.name || !input.name.trim()) {
      return { ok: false, error: "Name is required" };
    }
    const kind = input.kind ?? "genre";
    if (kind !== "genre" && kind !== "tag") {
      return { ok: false, error: "Invalid kind" };
    }

    const Model = kind === "genre" ? Genre : Tag;
    try {
      const doc = await Model.create({ name: input.name.trim(), kind });
      revalidateGenres();
      return { ok: true, data: { id: doc._id.toString() } };
    } catch (e) {
      if (e instanceof Error && /duplicate key|E11000/i.test(e.message)) {
        return { ok: false, error: `A ${kind} with that name already exists` };
      }
      throw e;
    }
  } catch (e) {
    return asActionError(e);
  }
}

export async function updateGenre(
  id: string,
  input: GenreTagInput,
): Promise<ActionResult<{ id: string }>> {
  return updateIn(id, { ...input, kind: "genre" });
}

export async function updateTag(
  id: string,
  input: GenreTagInput,
): Promise<ActionResult<{ id: string }>> {
  return updateIn(id, { ...input, kind: "tag" });
}

async function updateIn(
  id: string,
  input: GenreTagInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    await requireCan("genre:manage");

    const oid = toObjectId(id);
    if (!oid) return { ok: false, error: "Invalid id" };

    const kind = input.kind ?? "genre";
    const Model = kind === "genre" ? Genre : Tag;

    const update: Record<string, unknown> = {};
    if (input.name !== undefined) update.name = input.name.trim();
    if (!input.name || !input.name.trim()) return { ok: false, error: "Name is required" };

    try {
      const doc = await Model.findByIdAndUpdate(oid, { $set: update }, { new: true });
      if (!doc) return { ok: false, error: "Not found" };
      revalidateGenres();
      return { ok: true, data: { id } };
    } catch (e) {
      if (e instanceof Error && /duplicate key|E11000/i.test(e.message)) {
        return { ok: false, error: `A ${kind} with that name already exists` };
      }
      throw e;
    }
  } catch (e) {
    return asActionError(e);
  }
}

export async function deleteGenre(id: string): Promise<ActionResult<{ id: string }>> {
  return deleteIn(id, "genre");
}

export async function deleteTag(id: string): Promise<ActionResult<{ id: string }>> {
  return deleteIn(id, "tag");
}

async function deleteIn(
  id: string,
  kind: TagKind,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    await requireCan("genre:manage");

    const oid = toObjectId(id);
    if (!oid) return { ok: false, error: "Invalid id" };

    const Model = kind === "genre" ? Genre : Tag;
    const res = await Model.deleteOne({ _id: oid });
    if (res.deletedCount === 0) return { ok: false, error: "Not found" };

    // Pull the deleted ref from every manga so we don't dangle.
    await Manga.updateMany({}, { $pull: { [kind === "genre" ? "genres" : "tags"]: oid } });

    revalidateGenres();
    return { ok: true, data: { id } };
  } catch (e) {
    return asActionError(e);
  }
}
