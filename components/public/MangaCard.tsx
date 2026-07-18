"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star } from "lucide-react";
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
    "bg-emerald-400/90 text-emerald-950 shadow-[0_0_18px_-2px_rgb(52_211_153/0.65)] ring-1 ring-emerald-300/60",
  completed:
    "bg-cyan-300/90 text-cyan-950 shadow-[0_0_18px_-2px_rgb(34_211_238/0.7)] ring-1 ring-cyan-200/60",
  hiatus:
    "bg-amber-300/90 text-amber-950 shadow-[0_0_18px_-2px_rgb(252_211_77/0.7)] ring-1 ring-amber-200/60",
};

export function MangaCard({ manga }: { manga: MangaCardData }) {
  const statusStyle =
    STATUS_STYLES[manga.status] ??
    "bg-white/80 text-slate-950 ring-1 ring-white/40";

  return (
    <Link
      href={`/manga/${manga.slug}`}
      className="group block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-magenta))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="neon-trace relative aspect-[2/3] overflow-hidden rounded-lg bg-[#181d29] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-20px_hsl(var(--neon-magenta)/0.55)]">
        {manga.coverImage ? (
          <Image
            src={manga.coverImage}
            alt={manga.title}
            width={300}
            height={450}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="reader-grid-bg flex h-full w-full flex-col items-center justify-center gap-2 bg-[#181d29] text-center text-[hsl(var(--reader-muted))]">
            <BookOpen className="h-7 w-7 text-[hsl(var(--reader-accent))]" />
            <span className="px-3 text-[10px] font-bold uppercase tracking-[0.16em]">
              No cover
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a10]/90 via-transparent to-black/10" />

        {/* Status pill — saturated, glowy */}
        <span
          className={cn(
            "absolute left-2 top-2 rounded px-1.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] backdrop-blur-sm",
            statusStyle
          )}
        >
          {manga.status}
        </span>

        {/* Rating badge — glassy + neon-amber star */}
        {typeof manga.rating === "number" && manga.rating > 0 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-black/55 px-1.5 py-1 text-[10px] font-bold text-white shadow-[0_0_14px_-4px_rgb(252_211_77/0.7)] backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgb(252_211_77/0.9)]" />
            {manga.rating.toFixed(1)}
          </span>
        )}

        {/* Type badge — glassy + neon-cyan border */}
        <span className="absolute bottom-2 left-2 rounded-md border border-cyan-300/40 bg-black/45 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_14px_-6px_rgb(34_211_238/0.7)] backdrop-blur-md">
          {manga.type}
        </span>

        {/* VIP badge — gradient amber + glow + optional shimmer */}
        {manga.isVip && (
          <span
            className={cn(
              "gradient-vip absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-amber-950 shadow-[0_0_18px_-2px_rgb(251_191_36/0.85)] ring-1 ring-amber-200/60",
              "motion-safe:animate-shimmer [background-size:200%_100%]"
            )}
          >
            <Star className="h-3 w-3 fill-amber-950 text-amber-950" />
            VIP
          </span>
        )}
      </div>

      <h3
        className={cn(
          "mt-2 line-clamp-2 text-sm font-bold leading-snug transition-colors",
          "text-[hsl(var(--reader-text))] group-hover:text-neon-gradient"
        )}
      >
        {manga.title}
      </h3>
    </Link>
  );
}
