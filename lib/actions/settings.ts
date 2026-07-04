"use server";

// Site settings singleton. getSettings lazily upserts the default doc;
// updateSettings is the only mutation path and is protected by settings:manage
// (super-admin only). Announcements are stored as an array but presented as a
// newline-separated textarea on the admin page.

import "@/models";
import { connect } from "@/lib/db/mongoose";
import { Settings, type SettingsDoc } from "@/models";
import { requireCan } from "@/lib/auth/assert";
import { asActionError, type ActionResult } from "@/lib/actions/_shared";
import { READER_MODES, type ReaderMode } from "@/lib/constants";
import { revalidateSettings } from "@/lib/utils/revalidate";

export interface UpdateSettingsInput {
  siteName?: string;
  tagline?: string;
  defaultReaderMode?: ReaderMode;
  footerText?: string;
  maintenanceMode?: boolean;
  announcements?: string[];
}

export type SettingsShape = SettingsDoc;

export async function getSettings(): Promise<ActionResult<SettingsShape>> {
  try {
    await connect();
    let doc = await Settings.findById("singleton").lean();
    if (!doc) {
      // Lazy upsert of the default singleton.
      await Settings.findByIdAndUpdate(
        "singleton",
        { $setOnInsert: { _id: "singleton" } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      doc = await Settings.findById("singleton").lean();
    }
    if (!doc) return { ok: false, error: "Settings could not be initialized" };
    return { ok: true, data: doc as unknown as SettingsShape };
  } catch (e) {
    return asActionError(e);
  }
}

export async function updateSettings(
  patch: UpdateSettingsInput,
): Promise<ActionResult<SettingsShape>> {
  try {
    await connect();
    await requireCan("settings:manage");

    const update: Record<string, unknown> = {};
    if (patch.siteName !== undefined) update.siteName = patch.siteName;
    if (patch.tagline !== undefined) update.tagline = patch.tagline;
    if (patch.footerText !== undefined) update.footerText = patch.footerText;
    if (patch.maintenanceMode !== undefined) update.maintenanceMode = Boolean(patch.maintenanceMode);
    if (patch.announcements !== undefined) {
      update.announcements = patch.announcements.map((s) => s.trim()).filter(Boolean);
    }
    if (patch.defaultReaderMode !== undefined) {
      if (!(READER_MODES as readonly string[]).includes(patch.defaultReaderMode)) {
        return { ok: false, error: "Invalid reader mode" };
      }
      update.defaultReaderMode = patch.defaultReaderMode;
    }

    const doc = await Settings.findByIdAndUpdate(
      "singleton",
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean() as SettingsShape | null;

    revalidateSettings();
    return { ok: true, data: doc as SettingsShape };
  } catch (e) {
    return asActionError(e);
  }
}
