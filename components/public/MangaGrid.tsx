import { MangaCard, type MangaCardData } from "@/components/public/MangaCard";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { BookX } from "lucide-react";

interface MangaGridProps {
  manga: MangaCardData[];
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Render shimmer skeletons instead of the cards. Useful while the
   * upstream query is pending. The existing default `false` keeps the
   * public API unchanged for current call sites.
   */
  isLoading?: boolean;
  /** Number of skeleton cards to render while loading. Defaults to 12. */
  skeletonCount?: number;
}

function MangaCardSkeleton() {
  return (
    <div className="space-y-2">
      <div
        aria-hidden
        className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
      >
        <div
          className={cn(
            "h-full w-full animate-shimmer rounded-lg",
            "[background-image:linear-gradient(110deg,transparent_0%,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%,transparent_100%)]",
            "[background-size:200%_100%]"
          )}
        />
      </div>
      <div className="h-3 w-3/4 overflow-hidden rounded bg-white/[0.04]">
        <div
          className={cn(
            "h-full w-full animate-shimmer rounded",
            "[background-image:linear-gradient(110deg,transparent_0%,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%,transparent_100%)]",
            "[background-size:200%_100%]"
          )}
        />
      </div>
      <div className="h-3 w-1/2 overflow-hidden rounded bg-white/[0.04]">
        <div
          className={cn(
            "h-full w-full animate-shimmer rounded",
            "[background-image:linear-gradient(110deg,transparent_0%,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%,transparent_100%)]",
            "[background-size:200%_100%]"
          )}
        />
      </div>
    </div>
  );
}

export function MangaGrid({
  manga,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Check back later for new additions.",
  isLoading = false,
  skeletonCount = 12,
}: MangaGridProps) {
  if (isLoading) {
    const placeholders = Array.from({ length: skeletonCount });
    return (
      <section className="relative isolate">
        <div aria-hidden className="hero-aurora pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div
          className={cn(
            "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 stagger-children"
          )}
        >
          {placeholders.map((_, i) => (
            <MangaCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  if (!manga || manga.length === 0) {
    return (
      <section className="relative isolate">
        <div aria-hidden className="hero-aurora pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <EmptyState
          icon={BookX}
          title={emptyTitle}
          description={emptyDescription}
        />
      </section>
    );
  }

  return (
    <section className="relative isolate">
      <div aria-hidden className="hero-aurora pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div
        className={cn(
          "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 stagger-children"
        )}
      >
        {manga.map((m) => (
          <MangaCard key={String(m._id)} manga={m} />
        ))}
      </div>
    </section>
  );
}