"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetTrigger, SheetContent, SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MANGA_STATUS, MANGA_TYPE, BROWSE_SORT_OPTIONS } from "@/lib/constants";

interface FilterSheetProps {
  genres: { _id?: string; name: string; slug: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};

const SORT_LABELS: Record<string, string> = {
  latest: "Recently Updated",
  oldest: "Oldest",
  title: "Title (A–Z)",
  views: "Most Viewed",
  rating: "Top Rated",
};

export function FilterSheet({ genres }: FilterSheetProps) {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetTitle>Filters</SheetTitle>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort</label>
            <Select value={currentSort || "latest"} onValueChange={(v) => applyParam("sort", v === "latest" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BROWSE_SORT_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{SORT_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <Select value={currentStatus || "any"} onValueChange={(v) => applyParam("status", v === "any" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {MANGA_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
            <Select value={currentType || "any"} onValueChange={(v) => applyParam("type", v === "any" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {MANGA_TYPE.map((t) => (
                  <SelectItem key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Genres</p>
            <ul className="grid grid-cols-2 gap-1">
              {genres.map((g) => {
                const active = currentGenre === g.slug;
                return (
                  <li key={g._id ?? g.slug}>
                    <Link
                      href={genreHref(g.slug)}
                      className={
                        "block rounded px-2 py-1.5 text-sm " +
                        (active ? "bg-primary text-primary-foreground" : "hover:bg-accent")
                      }
                    >
                      {g.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
