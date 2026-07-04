// Manga model — the central content record. All UI correctness flows from this:
// text index powers /search, compound browse index powers filter pages, the
// pages field lives on Chapter (one manga -> many chapters -> many pages).

import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { slugify, uniqueSlug } from "@/lib/utils/slug";
import { MANGA_STATUS, MANGA_TYPE, type MangaStatus, type MangaType } from "@/lib/constants";

const PageRef = new Schema(
  {
    url: { type: String, required: true },
    order: { type: Number, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { _id: false },
);

const MangaSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    altTitles: { type: [String], default: [] },
    description: { type: String, default: "", maxlength: 5000 },
    author: { type: String, default: "", trim: true, maxlength: 120 },
    artist: { type: String, default: "", trim: true, maxlength: 120 },
    status: { type: String, enum: MANGA_STATUS, default: "ongoing", index: true },
    type: { type: String, enum: MANGA_TYPE, default: "manga", index: true },
    year: { type: Number, default: null, min: 1900, max: 2100 },
    coverImage: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    genres: [{ type: Schema.Types.ObjectId, ref: "Genre", default: [] }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", default: [] }],
    views: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date, default: null },
    isPublished: { type: Boolean, default: false, index: true },
    isHidden: { type: Boolean, default: false, index: true },
    uploadedById: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export type MangaDoc = InferSchemaType<typeof MangaSchema> & {
  status: MangaStatus;
  type: MangaType;
  _id: mongoose.Types.ObjectId;
  id: string;
};

// Full-text search index. Weights so title beats altTitles beats author.
MangaSchema.index(
  { title: "text", altTitles: "text", author: "text", description: "text" },
  {
    name: "manga_text",
    weights: { title: 10, altTitles: 5, author: 3, description: 1 },
  },
);

// Compound index for browse filtering (public list query).
MangaSchema.index({ status: 1, type: 1, isPublished: 1, isHidden: 1 });
MangaSchema.index({ updatedAt: -1 }); // "latest updated" sort
MangaSchema.index({ views: -1 }); // "most viewed" sort

// Derive slug from title server-side; dedupe if needed.
MangaSchema.pre("validate", async function () {
  const doc = this as unknown as MangaDoc & { slug?: string; _id: mongoose.Types.ObjectId };
  if (!doc.slug && doc.title) {
    doc.slug = await uniqueSlug(
      mongoose.model("Manga"),
      doc.title,
      "slug",
      doc._id?.toString(),
    );
  } else if (doc.slug) {
    doc.slug = slugify(doc.slug);
  }
});

// Avoid HMR duplicate registration.
export const Manga =
  mongoose.models.Manga ?? mongoose.model("Manga", MangaSchema);

export default Manga;
