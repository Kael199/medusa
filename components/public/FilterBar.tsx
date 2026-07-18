"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { MANGA_STATUS, MANGA_TYPE, BROWSE_SORT_OPTIONS } from "@/lib/constants";

interface FilterBarProps {
  genres: { _id?: string; name: string; slug: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};

const SORT_LABELS: Record<string, string> = {
  latest: "Latest",
  oldest: "Oldest",
  title: "A–Z",
  views: "Most Viewed",
  rating: "Top Rated",
};

type FilterKey = "sort" | "status" | "type";

type ChipOption = {
  key: FilterKey;
  value: string;
  label: string;
  active: boolean;
};

function Chip({
  active,
  onSelect,
  label,
}: {
  active: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200 backdrop-blur-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-cyan))] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border border-transparent text-white shadow-[0_0_18px_-4px_hsl(var(--neon-magenta)/0.7)] [background:linear-gradient(135deg,hsl(var(--neon-magenta)/0.85),hsl(var(--neon-violet)/0.85),hsl(var(--neon-cyan)/0.85))]"
          : "border border-white/15 bg-white/[0.04] text-[hsl(var(--reader-muted))] hover:border-white/30 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_14px_-6px_hsl(var(--neon-cyan)/0.6)]"
      )}
    >
      {label}
    </button>
  );
}

export function FilterBar({ genres }: FilterBarProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const currentStatus = sp.get("status") ?? "";
  const currentType = sp.get("type") ?? "";
  const currentSort = sp.get("sort") ?? "";
  const currentGenre = sp.get("genre") ?? "";

  const applyParam = (key: string, val: string) => {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
  };

  const genreHref = (slug: string) => {
    const params = new URLSearchParams(sp.toString());
    params.delete("page");
    params.set("genre", slug);
    return `/browse?${params.toString()}`;
  };

  const sortChips: ChipOption[] = [
    {
      key: "sort",
      value: "",
      label: "Default",
      active: currentSort === "",
    },
    ...BROWSE_SORT_OPTIONS.map((s) => ({
      key: "sort" as FilterKey,
      value: s,
      label: SORT_LABELS[s] ?? s,
      active: currentSort === s,
    })),
  ];

  const statusChips: ChipOption[] = [
    {
      key: "status",
      value: "",
      label: "Any",
      active: currentStatus === "",
    },
    ...MANGA_STATUS.map((s) => ({
      key: "status" as FilterKey,
      value: s,
      label: STATUS_LABELS[s] ?? s,
      active: currentStatus === s,
    })),
  ];

  const typeChips: ChipOption[] = [
    {
      key: "type",
      value: "",
      label: "Any",
      active: currentType === "",
    },
    ...MANGA_TYPE.map((t) => ({
      key: "type" as FilterKey,
      value: t,
      label: t[0].toUpperCase() + t.slice(1),
      active: currentType === t,
    })),
  ];

  const ChipRow = ({
    label,
    items,
  }: {
    label: string;
    items: ChipOption[];
  }) => (
    <div>
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[hsl(var(--reader-muted))]">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((opt) => (
          <Chip
            key={`${opt.key}-${opt.value || "any"}`}
            active={opt.active}
            label={opt.label}
            onSelect={() => applyParam(opt.key, opt.value)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[hsl(var(--reader-text))]">
          Filters
        </h2>
        {(currentStatus || currentType || currentGenre) && (
          <Link
            href="/browse"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--reader-muted))] transition-colors hover:text-[hsl(var(--neon-magenta))]"
          >
            Clear
          </Link>
        )}
      </div>

      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--reader-border))] to-transparent" />

      <div className="mt-4 space-y-4">
        <ChipRow label="Sort" items={sortChips} />
        <ChipRow label="Status" items={statusChips} />
        <ChipRow label="Type" items={typeChips} />

        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[hsl(var(--reader-muted))]">
            Genres
          </p>
          <ul
            className={cn(
              "max-h-72 space-y-1 overflow-y-auto pr-1 stagger-children"
            )}
          >
            {genres.length === 0 && (
              <li className="text-xs text-[hsl(var(--reader-muted))]">
                No genres yet
              </li>
            )}
            {genres.map((g) => {
              const active = currentGenre === g.slug;
              return (
                <li key={g._id ?? g.slug}>
                  <Link
                    href={genreHref(g.slug)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center rounded-md px-2.5 py-1.5 text-sm transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-cyan))] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "text-white shadow-[0_0_18px_-6px_hsl(var(--neon-magenta)/0.8)] [background:linear-gradient(135deg,hsl(var(--neon-magenta)/0.85),hsl(var(--neon-violet)/0.85),hsl(var(--neon-cyan)/0.85))]"
                        : "text-[hsl(var(--reader-muted))] hover:bg-white/[0.04] hover:text-white hover:shadow-[0_0_14px_-8px_hsl(var(--neon-cyan)/0.6)]"
                    )}
                  >
                    {g.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}