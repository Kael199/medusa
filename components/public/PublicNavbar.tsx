"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, BookOpen, Search, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/public/SearchBar";
import { cn } from "@/lib/utils/cn";

interface PublicNavbarProps {
  siteName: string;
}

export function PublicNavbar({ siteName }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { href: "/browse", label: "Library" },
    { href: "/browse?sort=latest", label: "Updates" },
    { href: "/search", label: "Search" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#10131d]/90 text-[hsl(var(--reader-text))] backdrop-blur-xl">
      <div className="reader-container flex h-16 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${siteName} home`}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--reader-accent))] text-white shadow-[0_8px_22px_-10px_hsl(var(--reader-accent)/0.8)]">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="hidden text-base font-black uppercase tracking-[0.08em] sm:inline">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const active = link.href === "/browse?sort=latest"
              ? pathname === "/browse"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-[hsl(var(--reader-muted))] hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden w-full max-w-sm xl:block">
          <SearchBar className="[&>input]:reader-input [&>input]:h-9 [&>input]:rounded-md [&>input]:text-sm" />
        </div>

        <Link
          href="/search"
          className="ml-auto grid h-9 w-9 place-items-center rounded-md border border-white/10 text-[hsl(var(--reader-muted))] transition hover:border-white/20 hover:text-white xl:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Link>
        <Link
          href="/login"
          className="hidden items-center gap-2 rounded-md bg-[hsl(var(--reader-accent))] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[hsl(var(--reader-accent-strong))] sm:inline-flex"
        >
          <LogIn className="h-3.5 w-3.5" /> Sign in
        </Link>

        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="text-white hover:bg-white/10 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-white/10 bg-[#121620] p-5 text-[hsl(var(--reader-text))]">
              <SheetTitle className="flex items-center justify-between text-[hsl(var(--reader-text))]">
                <span className="flex items-center gap-2 font-black uppercase tracking-[0.08em]">
                  <BookOpen className="h-5 w-5 text-[hsl(var(--reader-accent))]" /> {siteName}
                </span>
                <SheetClose className="rounded-md p-1 text-[hsl(var(--reader-muted))] hover:bg-white/10 hover:text-white" aria-label="Close menu">
                  <X className="h-4 w-4" />
                </SheetClose>
              </SheetTitle>
              <div className="mt-6">
                <SearchBar onSubmitted={() => setMobileOpen(false)} className="[&>input]:reader-input" />
              </div>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="rounded-md px-3 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[hsl(var(--reader-muted))] hover:bg-white/5 hover:text-white">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <Link href="/login" className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[hsl(var(--reader-accent))] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white" onClick={() => setMobileOpen(false)}>
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
