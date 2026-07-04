"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  basePath: string; // e.g. "/browse" or "/admin/manga"
  query: Record<string, string | undefined>; // current filters (page excluded)
  page: number;
  totalPages: number;
  pageParam?: string; // default "page"
}

/** Builds a relative URL preserving current filters and setting `page`. */
function buildUrl(basePath: string, query: Record<string, string | undefined>, page: number, pageParam: string) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "" && k !== pageParam) params.set(k, v);
  }
  if (page > 1) params.set(pageParam, String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ basePath, query, page, totalPages, pageParam = "page" }: PaginationProps) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  // window of pages around current
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav className="flex items-center gap-1 text-sm">
      {prev !== null ? (
        <Link href={buildUrl(basePath, query, prev, pageParam)} className="inline-flex h-9 items-center rounded-md border px-3 hover:bg-accent">
          <ChevronLeft className="h-4 w-4" /> Prev
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center rounded-md border px-3 opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</span>
      )}
      {start > 1 && <span className="px-2 text-muted-foreground">…</span>}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildUrl(basePath, query, p, pageParam)}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md border",
            p === page ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
          )}
        >
          {p}
        </Link>
      ))}
      {end < totalPages && <span className="px-2 text-muted-foreground">…</span>}
      {next !== null ? (
        <Link href={buildUrl(basePath, query, next, pageParam)} className="inline-flex h-9 items-center rounded-md border px-3 hover:bg-accent">
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center rounded-md border px-3 opacity-40">Next <ChevronRight className="h-4 w-4" /></span>
      )}
    </nav>
  );
}
