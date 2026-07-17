import { MangaCard, type MangaCardData } from "@/components/public/MangaCard";
import { EmptyState } from "@/components/ui/empty-state";
import { BookX } from "lucide-react";

interface MangaGridProps {
  manga: MangaCardData[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function MangaGrid({
  manga,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Check back later for new additions.",
}: MangaGridProps) {
  if (!manga || manga.length === 0) {
    return (
      <EmptyState
        icon={BookX}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {manga.map((m) => (
        <MangaCard key={String(m._id)} manga={m} />
      ))}
    </div>
  );
}
