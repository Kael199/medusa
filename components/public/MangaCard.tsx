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
  ongoing: "bg-emerald-400 text-emerald-950",
  completed: "bg-sky-300 text-sky-950",
  hiatus: "bg-amber-300 text-amber-950",
};

export function MangaCard({ manga }: { manga: MangaCardData }) {
  const statusStyle = STATUS_STYLES[manga.status] ?? "bg-white/80 text-slate-950";

  return (
    <Link href={`/manga/${manga.slug}`} className="group block min-w-0 focus-visible:outline-none">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-[#181d29] shadow-[0_16px_28px_-22px_rgb(0_0_0/0.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[hsl(var(--reader-accent)/0.8)] group-hover:shadow-[0_20px_34px_-20px_hsl(var(--reader-accent)/0.52)]">
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
            <span className="px-3 text-[10px] font-bold uppercase tracking-[0.16em]">No cover</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a10]/90 via-transparent to-black/10" />
        <span className={cn("absolute left-2 top-2 rounded px-1.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]", statusStyle)}>
          {manga.status}
        </span>
        {typeof manga.rating === "number" && manga.rating > 0 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/65 px-1.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-[hsl(var(--reader-accent))] text-[hsl(var(--reader-accent))]" /> {manga.rating.toFixed(1)}
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded border border-white/20 bg-black/35 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {manga.type}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-[hsl(var(--reader-text))] transition-colors group-hover:text-[hsl(var(--reader-accent))]">
        {manga.title}
      </h3>
    </Link>
  );
}
