"use client";

import { useEffect } from "react";

export interface ReaderPage {
  url: string;
  width: number;
  height: number;
}

interface PaginatedViewProps {
  pages: ReaderPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  widthMode: "fit" | "actual";
}

export function PaginatedView({ pages, currentPage, onPageChange, widthMode }: PaginatedViewProps) {
  const page = pages[currentPage];
  const isLast = currentPage >= pages.length - 1;

  // Prefetch next page image via a link tag for smoother paging.
  useEffect(() => {
    if (isLast) return;
    const next = pages[currentPage + 1];
    if (!next?.url) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = next.url;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [currentPage, pages, isLast]);

  if (!page) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        No pages in this chapter.
      </div>
    );
  }

  const aspect = page.width && page.height ? `${page.width} / ${page.height}` : "2 / 3";

  return (
    <div
      className="flex w-full justify-center"
      onClick={(e) => {
        // Click the right half → next page, left half → previous.
        const target = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - target.left;
        if (x > target.width / 2) onPageChange(Math.min(currentPage + 1, pages.length - 1));
        else onPageChange(Math.max(currentPage - 1, 0));
      }}
    >
      <img
        src={page.url}
        alt={`Page ${currentPage + 1}`}
        width={page.width || undefined}
        height={page.height || undefined}
        style={{
          aspectRatio: aspect,
          maxHeight: "100dvh",
          width: widthMode === "fit" ? "auto" : undefined,
          maxWidth: widthMode === "fit" ? "100%" : undefined,
          objectFit: "contain",
          imageRendering: "auto",
        }}
        className="select-none"
        draggable={false}
      />
    </div>
  );
}
