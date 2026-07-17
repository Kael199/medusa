// Settings singleton — one document holds global site config. Accessed via
// getSettings() which lazily upserts the default singleton.

import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { READER_MODES, type ReaderMode } from "@/lib/constants";

const SettingsSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    siteName: { type: String, default: "Medusa" },
    tagline: { type: String, default: "" },
    defaultReaderMode: { type: String, enum: READER_MODES, default: "paginated" },
    announcements: { type: [String], default: [] },
    footerText: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "settings" },
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema> & {
  defaultReaderMode: ReaderMode;
};

export const Settings =
  mongoose.models.Settings ??
  mongoose.model<SettingsDoc>("Settings", SettingsSchema);

export default Settings;
