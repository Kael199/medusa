"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/**
 * Admin nav with an animated "active pill" indicator that slides between items
 * using CSS transforms driven by the active link index. Pure presentation;
 * active state is derived from the current pathname (or an explicit
 * `activeHref` prop for callers that already know it).
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
  const pathnameFromHook = usePathname() ?? "";
  const activePath = activeHref ?? pathnameFromHook;
  const activeIndex = items.findIndex((item) => {
    return (
      activePath === item.href ||
      (item.href !== "/admin" && activePath.startsWith(item.href))
    );
  });
  const safeIndex = activeIndex < 0 ? 0 : activeIndex;

  return (
    <nav className="relative flex flex-col gap-0.5 p-2" onClick={onNavigate}>
      {/* Active pill indicator — fixed-height absolute layer behind items. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-2 right-2 z-0 rounded-md bg-gradient-to-r from-primary/20 via-primary/15 to-primary/20 ring-1 ring-primary/30 transition-all duration-300 ease-out"
        style={{
          height: 36,
          transform: `translateY(${safeIndex * 36}px)`,
        }}
      />
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          activePath === item.href ||
          (item.href !== "/admin" && activePath.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative z-10 flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform",
                active &&
                  "scale-110 drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]",
              )}
            />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default Sidebar;
