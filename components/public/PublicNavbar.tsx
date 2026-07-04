"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetTrigger, SheetContent, SheetTitle, SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/public/SearchBar";

interface PublicNavbarProps {
  siteName: string;
}

export function PublicNavbar({ siteName }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/search", label: "Search" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-lg tracking-tight">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent " +
                (pathname === l.href || pathname.startsWith(l.href + "/")
                  ? "text-foreground"
                  : "text-muted-foreground")
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="mb-4">{siteName}</SheetTitle>
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
