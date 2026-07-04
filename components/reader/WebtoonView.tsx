"use client";

import { useEffect, useRef, useState } from "react";
import type { ReaderPage } from "@/components/reader/PaginatedView";

interface WebtoonViewProps {
  pages: ReaderPage[];
  gap?: number; // pixels between images
}

/**
 * Continuous vertical strip with lazy `src` swap via IntersectionObserver.
 * The actual `src` isn't set until the image approaches the viewport to keep
 * initial load light, then images fade in on load.
 */
export function WebtoonView({ pages, gap = 0 }: WebtoonViewProps) {
  if (!pages.length) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        No pages in this chapter.
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col items-center"
      style={{ gap: `${gap}px` }}
    >
      {pages.map((p, i) => (
        <LazyWebtoonImage key={i} page={p} index={i} />
      ))}
    </div>
  );
}

function LazyWebtoonImage({ page, index }: { page: ReaderPage; index: number }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        }
      },
      { rootMargin: "600px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const aspectStyle = page.width && page.height
    ? { aspectRatio: `${page.width} / ${page.height}` }
    : { minHeight: "100px" };

  return (
    <img
      ref={ref}
      src={inView ? page.url : undefined}
      data-src={page.url}
      alt={`Page ${index + 1}`}
      width={page.width || undefined}
      height={page.height || undefined}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={
        "w-full object-contain transition-opacity duration-300 " +
        (loaded ? "opacity-100" : "opacity-0")
      }
      style={{ ...aspectStyle, background: "var(--muted)" }}
      draggable={false}
    />
  );
}
