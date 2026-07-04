"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReaderSettingsPopover, type WidthMode } from "@/components/reader/ReaderSettingsPopover";
import type { ReaderMode } from "@/lib/constants";

interface ReaderShellProps {
  mangaTitle: string;
  mangaSlug: string;
  chapterNumber: number;
  pageIndicator?: string; // e.g. "1 / 24" for paginated
  prevHref: string | null;
  nextHref: string | null;
  prevLabel: string | null;
  nextLabel: string | null;
  mode: ReaderMode;
  widthMode: WidthMode;
  webtoonGap: number;
  onModeChange: (m: ReaderMode) => void;
  onWidthModeChange: (w: WidthMode) => void;
  onWebtoonGapChange: (g: number) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  children: React.ReactNode;
}

export function ReaderShell({
  mangaTitle,
  mangaSlug,
  chapterNumber,
  pageIndicator,
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  mode,
  widthMode,
  webtoonGap,
  onModeChange,
  onWidthModeChange,
  onWebtoonGapChange,
  children,
}: ReaderShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur">
        <Button asChild variant="ghost" size="icon" aria-label="Back to manga">
          <Link href={`/manga/${mangaSlug}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{mangaTitle}</p>
          <p className="text-xs text-muted-foreground">Chapter {chapterNumber}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {prevHref && (
            <Button asChild variant="ghost" size="icon" aria-label="Previous chapter">
              <Link href={prevHref}><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
          )}
          {nextHref && (
            <Button asChild variant="ghost" size="icon" aria-label="Next chapter">
              <Link href={nextHref}><ChevronRight className="h-4 w-4" /></Link>
            </Button>
          )}
          <ReaderSettingsPopover
            mode={mode}
            widthMode={widthMode}
            webtoonGap={webtoonGap}
            onModeChange={onModeChange}
            onWidthModeChange={onWidthModeChange}
            onWebtoonGapChange={onWebtoonGapChange}
          />
        </div>
      </header>

      {/* View */}
      <main className="flex flex-1 flex-col items-center justify-start py-4">
        {children}
      </main>

      {/* Bottom bar */}
      <footer className="sticky bottom-0 z-30 flex h-14 items-center justify-between gap-2 border-t bg-background/95 px-4 backdrop-blur">
        <div className="min-w-0 flex-1">
          {prevHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={prevHref}>
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden truncate sm:inline">{prevLabel ? `Prev: ${prevLabel}` : "Prev"}</span>
                <span className="sm:hidden">Prev</span>
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">First chapter</span>
          )}
        </div>
        <div className="shrink-0 text-center text-xs text-muted-foreground">
          {pageIndicator ?? mode}
        </div>
        <div className="flex min-w-0 flex-1 justify-end">
          {nextHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={nextHref}>
                <span className="hidden truncate sm:inline">{nextLabel ? `Next: ${nextLabel}` : "Next"}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Last chapter</span>
          )}
        </div>
      </footer>
    </div>
  );
}
