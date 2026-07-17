"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, BookOpen, Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/public/SearchBar";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";

interface PublicNavbarProps {
  siteName: string;
}

export function PublicNavbar({ siteName }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/search", label: "Search" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-950/10 bg-background/80 shadow-[0_8px_30px_-24px_hsl(243_60%_24%/0.42)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 dark:border-white/10">
      <div className="container flex h-[4.5rem] items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold tracking-tight"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-primary text-primary-foreground shadow-lg shadow-orange-500/20">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-black tracking-[-0.03em]">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  active
                    ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
                    : "text-muted-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden max-w-md flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="hidden sm:inline-flex"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-400 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            Sign in
          </Link>
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-5">
                <SheetTitle className="mb-4 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  {siteName}
                </SheetTitle>
                <div className="mb-4">
                  <SearchBar onSubmitted={() => setMobileOpen(false)} />
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    <Sun className="h-4 w-4 dark:hidden" />
                    <Moon className="hidden h-4 w-4 dark:block" />
                    Toggle theme
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}