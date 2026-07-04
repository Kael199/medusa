"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { PaginatedView, type ReaderPage } from "@/components/reader/PaginatedView";
import { ListView } from "@/components/reader/ListView";
import { WebtoonView } from "@/components/reader/WebtoonView";
import type { ReaderMode } from "@/lib/constants";
import type { WidthMode } from "@/components/reader/ReaderSettingsPopover";

export interface ReaderPayload {
  mangaId: string;
  mangaSlug: string;
  mangaTitle: string;
  chapterId: string;
  chapterNumber: number;
  volume: number | null;
  title: string;
  pages: { url: string; width: number; height: number }[];
  prev: string | null;
  next: string | null;
  defaultMode: ReaderMode;
}

const MODE_KEY = "reader:mode";
const WIDTH_KEY = "reader:width";
const WEBTOON_GAP_KEY = "reader:webtoon-gap";
const progressKey = (mangaId: string) => `progress:${mangaId}`;

interface ReaderClientProps {
  payload: ReaderPayload;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy mode
  }
}

export function ReaderClient({ payload }: ReaderClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<ReaderMode>(payload.defaultMode);
  const [widthMode, setWidthMode] = useState<WidthMode>("fit");
  const [webtoonGap, setWebtoonGap] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Hydrate preferences after mount to avoid SSR/CSR mismatch.
  useEffect(() => {
    const stored = readStorage<string | null>(MODE_KEY, null);
    if (stored === "paginated" || stored === "list" || stored === "webtoon") {
      setMode(stored);
    }
    const w = readStorage<string | null>(WIDTH_KEY, null);
    if (w === "fit" || w === "actual") setWidthMode(w);
    const gap = readStorage<string | null>(WEBTOON_GAP_KEY, null);
    if (gap != null) {
      const n = Number(gap);
      if (!Number.isNaN(n)) setWebtoonGap(Math.max(0, Math.min(40, n)));
    }
  }, []);

  // Persist mode + width.
  useEffect(() => { writeStorage(MODE_KEY, mode); }, [mode]);
  useEffect(() => { writeStorage(WIDTH_KEY, widthMode); }, [widthMode]);
  useEffect(() => { writeStorage(WEBTOON_GAP_KEY, String(webtoonGap)); }, [webtoonGap]);

  const pages: ReaderPage[] = payload.pages;
  const pageCount = pages.length;

  // Reading progress save.
  const saveProgress = useCallback(
    (page: number) => {
      writeStorage(
        progressKey(payload.mangaId),
        JSON.stringify({
          lastChapterId: payload.chapterId,
          lastPage: page,
          ts: Date.now(),
        }),
      );
    },
    [payload.mangaId, payload.chapterId],
  );

  // Save on currentPage change.
  useEffect(() => {
    saveProgress(currentPage);
  }, [currentPage, saveProgress]);

  // Save on unmount + on tab hide.
  useEffect(() => {
    const onHide = () => saveProgress(currentPage);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    window.addEventListener("pagehide", onHide);
    return () => {
      saveProgress(currentPage);
      window.removeEventListener("pagehide", onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle through reader modes.
  const cycleMode = useCallback(() => {
    setMode((m) => (m === "paginated" ? "list" : m === "list" ? "webtoon" : "paginated"));
  }, []);

  const goNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, Math.max(pageCount - 1, 0)));
  }, [pageCount]);
  const goPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNextPage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevPage();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        cycleMode();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
          el.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNextPage, goPrevPage, cycleMode]);

  // Reset to first page when chapter changes.
  useEffect(() => {
    setCurrentPage(0);
  }, [payload.chapterId]);

  const prevHref = payload.prev ? `/read/${payload.mangaSlug}/${payload.prev}` : null;
  const nextHref = payload.next ? `/read/${payload.mangaSlug}/${payload.next}` : null;

  let view: React.ReactNode;
  if (mode === "paginated") {
    view = (
      <PaginatedView
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        widthMode={widthMode}
      />
    );
  } else if (mode === "list") {
    view = <ListView pages={pages} />;
  } else {
    view = <WebtoonView pages={pages} gap={webtoonGap} />;
  }

  return (
    <div ref={containerRef} className="ReaderClient">
      <ReaderShell
        mangaTitle={payload.mangaTitle}
        mangaSlug={payload.mangaSlug}
        chapterNumber={payload.chapterNumber}
        pageIndicator={
          mode === "paginated" && pageCount > 0
            ? `${currentPage + 1} / ${pageCount}`
            : undefined
        }
        prevHref={prevHref}
        nextHref={nextHref}
        prevLabel={prevHref ? "Prev" : null}
        nextLabel={nextHref ? "Next" : null}
        mode={mode}
        widthMode={widthMode}
        webtoonGap={webtoonGap}
        onModeChange={setMode}
        onWidthModeChange={setWidthMode}
        onWebtoonGapChange={setWebtoonGap}
      >
        {view}
      </ReaderShell>
    </div>
  );
}

export default ReaderClient;
