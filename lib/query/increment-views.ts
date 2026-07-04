// Atomic view counter increment — fire-and-read on the manga detail page.
// Defensive: ensure a connection exists even if a future caller forgets to
// `connect()` first (pages that call us already do, but this guards the export).

import { connect } from "@/lib/db/mongoose";
import { Manga } from "@/models";

export async function incrementViews(mangaId: string): Promise<void> {
  if (!mangaId) return;
  try {
    await connect();
    await Manga.updateOne({ _id: mangaId }, { $inc: { views: 1 } });
  } catch {
    // best-effort; view counts must never crash a page render
  }
}

export default incrementViews;
