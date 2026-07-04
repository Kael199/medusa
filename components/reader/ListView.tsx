"use client";

import type { ReaderPage } from "@/components/reader/PaginatedView";

interface ListViewProps {
  pages: ReaderPage[];
}

export function ListView({ pages }: ListViewProps) {
  if (!pages.length) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        No pages in this chapter.
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center">
      {pages.map((p, i) => (
        <img
          key={i}
          src={p.url}
          alt={`Page ${i + 1}`}
          width={p.width || undefined}
          height={p.height || undefined}
          loading="lazy"
          className="mb-4 w-full object-contain"
          style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : undefined }}
          draggable={false}
        />
      ))}
    </div>
  );
}
