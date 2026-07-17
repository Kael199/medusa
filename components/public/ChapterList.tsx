import Link from "next/link";
import { Calendar, BookOpen, Crown, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";

export interface ChapterRow {
  _id: string;
  chapterNumber: number;
  volume?: number | null;
  title?: string;
  pageCount: number;
  publishedAt?: Date | string | null;
  isVip?: boolean;
}

interface ChapterListProps {
  chapters: ChapterRow[];
  mangaSlug: string;
  lastChapterId?: string;
}

function formatDate(d?: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const diffMs = Date.now() - dt.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ChapterList({ chapters, mangaSlug }: ChapterListProps) {
  if (!chapters || chapters.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No chapters yet"
        description="Chapter list will appear here once chapters are published."
      />
    );
  }

  // Sort newest first for a typical manga-reader UX.
  const sorted = [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber);

  return (
    <ol className="reader-panel divide-y divide-white/10 overflow-hidden rounded-lg">
      {sorted.map((c) => (
        <li key={String(c._id)} className="group">
          <Link
            href={`/read/${mangaSlug}/${String(c._id)}`}
            className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.045]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-md text-xs font-semibold",
                  c.isVip
                    ? "gradient-vip text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {c.isVip ? (
                  <Crown className="h-4 w-4" aria-hidden />
                ) : (
                  c.chapterNumber
                )}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  Chapter {c.chapterNumber}
                  {c.volume != null && (
                    <span className="text-muted-foreground">· Vol. {c.volume}</span>
                  )}
                  {c.isVip && (
                    <span className="inline-flex items-center gap-1 rounded bg-vip/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-vip">
                      <Lock className="h-2.5 w-2.5" />
                      VIP
                    </span>
                  )}
                </p>
                {c.title && (
                  <p className="truncate text-xs text-muted-foreground">{c.title}</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden items-center gap-1 sm:inline-flex">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(c.publishedAt)}
              </span>
              <span className="tabular-nums">{c.pageCount} pages</span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}