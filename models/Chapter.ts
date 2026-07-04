// Chapter model — belongs to a Manga, holds the ordered list of page image URLs.
// pages[].width/height are captured at upload so the reader can reserve aspect
// boxes (no layout shift) and lazy-load webtoon mode.

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const PageSchema = new Schema(
  {
    url: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { _id: false },
);

const ChapterSchema = new Schema(
  {
    mangaId: { type: Schema.Types.ObjectId, ref: "Manga", required: true, index: true },
    chapterNumber: { type: Number, required: true, min: 0 },
    volume: { type: Number, default: null, min: 0 },
    title: { type: String, default: "", trim: true, maxlength: 200 },
    pages: { type: [PageSchema], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    uploadedById: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

// One chapter number per manga, matching how readers index a series.
ChapterSchema.index({ mangaId: 1, chapterNumber: 1 }, { unique: true });
// Efficient "next/prev chapter" lookups ordered by numeric number.
ChapterSchema.index({ mangaId: 1, isPublished: 1, chapterNumber: 1 });

// Keep `order` contiguous (0..n-1) on save, mirroring array position.
ChapterSchema.pre("save", function (next) {
  const doc = this as unknown as { pages: { order: number; url: string }[] };
  doc.pages
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((p, i) => {
      p.order = i;
    });
  next();
});

export type ChapterDoc = InferSchemaType<typeof ChapterSchema> & {
  _id: mongoose.Types.ObjectId;
  id: string;
};

export const Chapter =
  mongoose.models.Chapter ?? mongoose.model("Chapter", ChapterSchema);

export default Chapter;
