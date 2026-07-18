"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LogIn,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/public/SearchBar";
import { cn } from "@/lib/utils/cn";

interface PublicNavbarProps {
  siteName: string;
}

const NAV_LINKS = [
  { href: "/browse", label: "Library" },
  { href: "/browse?sort=latest", label: "Updates" },
  { href: "/search", label: "Search" },
] as const;

function isActiveLink(href: string, pathname: string): boolean {
  if (href === "/browse?sort=latest") {
    return pathname === "/browse";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNavbar({ siteName }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Global ⌘K / Ctrl+K shortcut — focuses the search input when present.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      const input = document.querySelector<HTMLInputElement>(
        'input[type="search"][aria-label="Search manga"]',
      );
      if (input) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "glass-strong",
        "border-b border-[hsl(var(--reader-border))]/70",
      )}
    >
      {/* Neon gradient hairline under the navbar border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--neon-magenta)) 18%, hsl(var(--neon-violet)) 50%, hsl(var(--neon-cyan)) 82%, transparent 100%)",
          opacity: 0.55,
        }}
      />

      <div className="reader-container relative flex h-16 items-center gap-3">
        {/* Brand */}
        <Link
          href="/"
          aria-label={`${siteName} home`}
          className="group flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--reader-bg))]"
        >
          <span
            className={cn(
              "relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg",
              "bg-gradient-to-br from-[hsl(var(--neon-magenta))] via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))]",
              "text-white shadow-[0_8px_24px_-10px_hsl(var(--neon-magenta)/0.7)]",
              "motion-safe:transition-shadow motion-safe:duration-300",
              "group-hover:shadow-[0_0_24px_-2px_hsl(var(--neon-magenta)/0.7),0_0_24px_-2px_hsl(var(--neon-cyan)/0.6)]",
              "group-focus-visible:shadow-[0_0_24px_-2px_hsl(var(--neon-cyan)/0.8)]",
            )}
          >
            <BookOpen className="h-5 w-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 motion-safe:transition-opacity motion-safe:duration-500 group-hover:opacity-100"
            />
          </span>
          <span className="hidden text-base font-black uppercase tracking-[0.08em] sm:inline">
            <span className="text-neon-gradient">{siteName}</span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex items-center rounded-md px-3 py-2",
                  "text-xs font-bold uppercase tracking-[0.12em]",
                  "outline-none transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--reader-bg))]",
                  active
                    ? "text-white"
                    : "text-[hsl(var(--reader-muted))] hover:text-white motion-safe:hover:[text-shadow:0_0_18px_hsl(var(--neon-cyan)/0.55)]",
                )}
              >
                <span className="relative z-10">{link.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[hsl(var(--neon-magenta))] via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))] bg-[length:200%_100%] motion-safe:animate-shimmer"
                  />
                )}
                {!active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-[hsl(var(--neon-magenta))] via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))] opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-90 motion-safe:group-hover:animate-shimmer"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search — SearchBar owns its own icon + ⌘K kbd adornments. */}
        <div className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBar className="block" />
        </div>

        {/* Icon-only fallback on small screens */}
        <Link
          href="/search"
          aria-label="Search"
          className={cn(
            "ml-auto grid h-9 w-9 place-items-center rounded-md",
            "border border-[hsl(var(--reader-border))]",
            "text-[hsl(var(--reader-muted))]",
            "motion-safe:transition-all motion-safe:duration-200",
            "hover:border-[hsl(var(--neon-cyan))]/60 hover:text-[hsl(var(--neon-cyan))]",
            "hover:shadow-[0_0_0_1px_hsl(var(--neon-cyan)/0.3),0_0_18px_-6px_hsl(var(--neon-cyan)/0.55)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))]",
            "md:hidden",
          )}
        >
          <Search className="h-4 w-4" />
        </Link>

        {/* Sign-in CTA */}
        <Link
          href="/login"
          className={cn(
            "ml-auto inline-flex h-9 items-center gap-2 rounded-md px-3.5",
            "text-xs font-bold uppercase tracking-[0.12em] text-white",
            "bg-gradient-to-r from-[hsl(var(--neon-magenta))] via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))]",
            "bg-[length:200%_100%] bg-[position:0%_50%]",
            "shadow-[0_8px_24px_-10px_hsl(var(--neon-magenta)/0.7),0_0_0_1px_hsl(var(--neon-violet)/0.4)_inset]",
            "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
            "hover:bg-[position:100%_50%] hover:shadow-[0_10px_28px_-8px_hsl(var(--neon-magenta)/0.85),0_0_28px_-4px_hsl(var(--neon-cyan)/0.6),0_0_0_1px_hsl(var(--neon-cyan)/0.55)_inset] motion-safe:hover:scale-[1.03]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--reader-bg))]",
            "sm:inline-flex",
          )}
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Sign in</span>
        </Link>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "h-9 w-9 rounded-md text-[hsl(var(--reader-text))]",
                "hover:bg-white/5 hover:text-white",
                "focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))]",
              )}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <SheetContent
              side="right"
              className={cn(
                "w-[min(22rem,90vw)] border-l border-[hsl(var(--reader-border))]",
                "bg-[hsl(var(--reader-panel))] text-[hsl(var(--reader-text))]",
                "p-0",
              )}
            >
              <SheetTitle className="sr-only">Site navigation</SheetTitle>

              {/* Brand row */}
              <div className="flex items-center justify-between border-b border-[hsl(var(--reader-border))] px-5 py-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[hsl(var(--neon-magenta))] via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))] text-white shadow-[0_8px_22px_-10px_hsl(var(--neon-magenta)/0.8)]">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-black uppercase tracking-[0.1em] text-neon-gradient">
                    {siteName}
                  </span>
                </Link>
                <SheetClose
                  className={cn(
                    "rounded-md p-1.5 text-[hsl(var(--reader-muted))]",
                    "hover:bg-white/5 hover:text-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))]",
                  )}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </SheetClose>
              </div>

              {/* Nav links (staggered) */}
              <nav
                className="flex flex-col gap-1 px-3 py-4"
                aria-label="Mobile navigation"
              >
                {NAV_LINKS.map((link, index) => {
                  const active = isActiveLink(link.href, pathname);
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        style={{ animationDelay: `${index * 30}ms` }}
                        className={cn(
                          "motion-safe:animate-slide-in-right",
                          "group flex items-center justify-between rounded-lg px-3 py-3",
                          "text-sm font-bold uppercase tracking-[0.12em]",
                          "outline-none transition-all duration-200",
                          "focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))]",
                          active
                            ? "bg-white/[0.06] text-white shadow-[inset_1px_0_0_hsl(var(--neon-magenta)),inset_-1px_0_0_hsl(var(--neon-cyan))]"
                            : "text-[hsl(var(--reader-muted))] hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              active
                                ? "bg-gradient-to-r from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-cyan))] shadow-[0_0_8px_hsl(var(--neon-magenta)/0.7)]"
                                : "bg-[hsl(var(--reader-border))] group-hover:bg-[hsl(var(--reader-cyan))]",
                            )}
                          />
                          {link.label}
                        </span>
                        <Sparkles
                          aria-hidden
                          className={cn(
                            "h-3.5 w-3.5 transition-opacity",
                            active
                              ? "text-[hsl(var(--neon-cyan))] opacity-100"
                              : "text-[hsl(var(--reader-muted))] opacity-0 group-hover:opacity-100",
                          )}
                        />
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="mx-5 my-2 h-px bg-gradient-to-r from-transparent via-[hsl(var(--reader-border))] to-transparent" />

              {/* Footer pinned CTA */}
              <div className="absolute inset-x-0 bottom-0 border-t border-[hsl(var(--reader-border))] bg-[hsl(var(--reader-panel))]/95 p-4 backdrop-blur">
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-md py-3",
                      "text-xs font-bold uppercase tracking-[0.14em] text-white",
                      "bg-gradient-to-r from-[hsl(var(--neon-magenta))] via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))]",
                      "shadow-[0_10px_28px_-10px_hsl(var(--neon-magenta)/0.75),0_0_0_1px_hsl(var(--neon-violet)/0.45)_inset]",
                      "motion-safe:transition-all motion-safe:duration-300",
                      "hover:shadow-[0_12px_32px_-10px_hsl(var(--neon-magenta)/0.9),0_0_24px_-4px_hsl(var(--neon-cyan)/0.55),0_0_0_1px_hsl(var(--neon-cyan)/0.55)_inset]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--reader-panel))]",
                    )}
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                </SheetClose>
                <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--reader-muted))]">
                  Press ⌘ K to search
                </p>
              </div>

              {/* Bottom spacer so content isn't covered by the pinned CTA */}
              <div className="h-32" aria-hidden />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
