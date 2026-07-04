// Tag model — same shape as Genre, default kind 'tag'. Separate collection
// from Genre to avoid name collisions and to index counts independently.

import mongoose, { Schema } from "mongoose";
import { slugify } from "@/lib/utils/slug";
import { TAG_KIND, type TagKind } from "@/lib/constants";

export interface TagDoc {
  name: string;
  slug: string;
  kind: TagKind;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<TagDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true, minlength: 1, maxlength: 60 },
    slug: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: TAG_KIND, default: "tag" },
  },
  { timestamps: true },
);

TagSchema.pre("validate", function (next) {
  const doc = this as unknown as TagDoc & { slug?: string };
  if (!doc.slug && doc.name) {
    doc.slug = slugify(doc.name);
  }
  next();
});

export const Tag =
  mongoose.models.Tag ?? mongoose.model<TagDoc>("Tag", TagSchema);

export default Tag;
