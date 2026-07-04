"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export interface MangaCardData {
  _id: string;
  slug: string;
  title: string;
  status: string;
  type: string;
  coverImage: string;
  rating?: number;
}

const STATUS_STYLES: Record<string, string> = {
  ongoing: "bg-emerald-600 text-white",
  completed: "bg-primary text-primary-foreground",
  hiatus: "bg-amber-500 text-white",
};

export function MangaCard({ manga }: { manga: MangaCardData }) {
  const href = `/manga/${manga.slug}`;
  const statusStyle = STATUS_STYLES[manga.status] ?? "bg-secondary text-secondary-foreground";
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border bg-muted">
        {manga.coverImage ? (
          <Image
            src={manga.coverImage}
            alt={manga.title}
            width={300}
            height={450}
            sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1024px) 25vw, 16vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No cover
          </div>
        )}
        <span
          className={cn(
            "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
            statusStyle,
          )}
        >
          {manga.status}
        </span>
        {typeof manga.rating === "number" && manga.rating > 0 && (
          <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            ★ {manga.rating.toFixed(1)}
          </span>
        )}
      </div>
      <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
        {manga.title}
      </h3>
    </Link>
  );
}
