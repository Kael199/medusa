import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

export interface ChapterRow {
  _id: string;
  chapterNumber: number;
  volume?: number | null;
  title?: string;
  pageCount: number;
}

interface ChapterListProps {
  chapters: ChapterRow[];
  mangaSlug: string;
  lastChapterId?: string;
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

  return (
    <ol className="divide-y rounded-lg border">
      {chapters.map((c) => (
        <li key={String(c._id)}>
          <Link
            href={`/read/${mangaSlug}/${String(c._id)}`}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                Chapter {c.chapterNumber}
                {c.volume != null && <span className="text-muted-foreground"> · Vol. {c.volume}</span>}
              </p>
              {c.title && (
                <p className="truncate text-xs text-muted-foreground">{c.title}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{c.pageCount} pages</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
