import { cn } from "@/lib/utils/cn";

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/**
 * Pure-presentation nav list. Active-state styling is driven by the pathname
 * in the parent (AdminShell) which passes `activeHref`. Items without badges
 * still render consistently.
 */
export function Sidebar({
  items,
  activeHref,
  onNavigate,
}: {
  items: SidebarItem[];
  activeHref?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 p-2" onClick={onNavigate}>
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          activeHref === item.href ||
          (item.href !== "/admin" && activeHref?.startsWith(item.href));
        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.badge}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

export default Sidebar;
