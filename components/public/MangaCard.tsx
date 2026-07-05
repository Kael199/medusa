"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface MangaCardData {
  _id: string;
  slug: string;
  title: string;
  status: string;
  type: string;
  coverImage: string;
  rating?: number;
  isVip?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  ongoing:
    "bg-emerald-500/95 text-white shadow-[0_1px_0_rgb(0,0,0,0.05)] dark:bg-emerald-500/80",
  completed:
    "bg-primary text-primary-foreground shadow-[0_1px_0_rgb(0,0,0,0.05)]",
  hiatus: "bg-amber-500/95 text-white shadow-[0_1px_0_rgb(0,0,0,0.05)]",
};

export function MangaCard({ manga }: { manga: MangaCardData }) {
  const href = `/manga/${manga.slug}`;
  const statusStyle = STATUS_STYLES[manga.status] ?? "bg-secondary text-secondary-foreground";

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border bg-muted shadow-elev-1 transition group-hover:shadow-elev-2">
        {manga.coverImage ? (
          <Image
            src={manga.coverImage}
            alt={manga.title}
            width={300}
            height={450}
            sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1024px) 25vw, 16vw"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No cover
          </div>
        )}

        {/* gradient at bottom for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

        {/* Top-left: status */}
        <span
          className={cn(
            "absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            statusStyle,
          )}
        >
          {manga.status}
        </span>

        {/* Top-right: rating or VIP */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {manga.isVip && (
            <span className="inline-flex items-center gap-1 rounded-md bg-vip px-1.5 py-0.5 text-[10px] font-bold uppercase text-vip-foreground shadow-elev-1">
              <Crown className="h-3 w-3" />
              VIP
            </span>
          )}
          {typeof manga.rating === "number" && manga.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              {manga.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Bottom: type chip (always visible) */}
        <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
            {manga.type}
          </span>
          {manga.isVip && (
            <Lock className="h-3.5 w-3.5 text-white/80" aria-hidden />
          )}
        </div>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
        {manga.title}
      </h3>
    </Link>
  );
}