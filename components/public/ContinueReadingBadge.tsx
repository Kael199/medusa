"use client";

// TODO (v1): highlight the last-read chapter via localStorage.
//
// Reading progress is stored client-side at key `progress:{mangaId}` =
// { lastChapterId, lastPage, ts }. This overlay component reads that key on
// mount and, if `lastChapterId` matches one of the rendered chapter rows,
// scrolls it into view and badges it "Continue reading". It must not cause
// hydration mismatch — it renders nothing server-side and only appends a
// client indicator after mount.

import { useEffect, useState } from "react";

interface ContinueReadingBadgeProps {
  mangaId: string;
}

export function ContinueReadingBadge({ mangaId }: ContinueReadingBadgeProps) {
  const [lastChapterId, setLastChapterId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`progress:${mangaId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { lastChapterId?: string };
        if (parsed.lastChapterId) setLastChapterId(parsed.lastChapterId);
      }
    } catch {
      // ignore malformed progress
    }
  }, [mangaId]);

  // Scroll the saved chapter into view (best-effort).
  useEffect(() => {
    if (!lastChapterId) return;
    const el = document.getElementById(`chapter-${lastChapterId}`);
    if (el) el.scrollIntoView({ block: "center" });
  }, [lastChapterId]);

  return null;
}

export default ContinueReadingBadge;
