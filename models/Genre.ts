// Genre model. A genre is a discoverable category shown in browse filters.
// Tag is the same shape, kept as a separate collection so namespaces don't
// collide and counts can be indexed independently.

import mongoose, { Schema } from "mongoose";
import { slugify } from "@/lib/utils/slug";
import { TAG_KIND, type TagKind } from "@/lib/constants";

export interface GenreDoc {
  name: string;
  slug: string;
  kind: TagKind;
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema = new Schema<GenreDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true, minlength: 1, maxlength: 60 },
    slug: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: TAG_KIND, default: "genre" },
  },
  { timestamps: true },
);

// Derive slug from name when not explicitly provided.
GenreSchema.pre("validate", function (next) {
  const doc = this as unknown as GenreDoc & { slug?: string };
  if (!doc.slug && doc.name) {
    doc.slug = slugify(doc.name);
  }
  next();
});

// Avoid duplicate Model registration under HMR.
export const Genre =
  mongoose.models.Genre ?? mongoose.model<GenreDoc>("Genre", GenreSchema);

export default Genre;
