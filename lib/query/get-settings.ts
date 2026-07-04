// Public read-only accessor for the Settings singleton. Safe defaults are
// returned when the doc is missing — we never write from a public path.
// Connect first, register schemas, then read.

import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Settings } from "@/models";
import type { ReaderMode } from "@/lib/constants";

export interface PublicSettings {
  siteName: string;
  tagline: string;
  defaultReaderMode: ReaderMode;
  announcements: string[];
  footerText: string;
  maintenanceMode: boolean;
}

const DEFAULTS: PublicSettings = {
  siteName: "Mango",
  tagline: "Read manga, manhwa and manhua online.",
  defaultReaderMode: "paginated",
  announcements: [],
  footerText: "",
  maintenanceMode: false,
};

/**
 * Load the settings singleton and merge with safe defaults. Never throws from
 * a render path: on missing doc or error, returns DEFAULTS.
 */
export async function getSettings(): Promise<PublicSettings> {
  try {
    await connect();
    const doc = await Settings.findById("singleton").lean() as unknown as Partial<{
      siteName: string;
      tagline: string;
      defaultReaderMode: ReaderMode;
      announcements: string[];
      footerText: string;
      maintenanceMode: boolean;
    }> | null;
    if (!doc) return { ...DEFAULTS };
    return {
      siteName: doc.siteName ?? DEFAULTS.siteName,
      tagline: doc.tagline ?? DEFAULTS.tagline,
      defaultReaderMode: (doc.defaultReaderMode as ReaderMode) ?? DEFAULTS.defaultReaderMode,
      announcements: Array.isArray(doc.announcements) ? doc.announcements.filter(Boolean) : [],
      footerText: doc.footerText ?? DEFAULTS.footerText,
      maintenanceMode: Boolean(doc.maintenanceMode),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export default getSettings;
