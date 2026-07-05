import Link from "next/link";
import { BookOpen, Github } from "lucide-react";

interface FooterProps {
  siteName: string;
  footerText?: string;
}

export function Footer({ siteName, footerText }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-card/40">
      <div className="container py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </span>
              {siteName}
            </Link>
            {footerText && (
              <p className="max-w-xs text-sm text-muted-foreground">{footerText}</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Read
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/browse" className="hover:text-primary">Browse</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary">Search</Link>
              </li>
              <li>
                <Link href="/browse?sort=latest" className="hover:text-primary">
                  Latest updates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-primary">Sign in</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-primary">Sign up</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              A self-hosted manga reader. All titles are property of their respective owners.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Github className="h-3.5 w-3.5" /> Built with Next.js &amp; MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}