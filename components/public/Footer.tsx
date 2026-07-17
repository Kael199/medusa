import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

interface FooterProps {
  siteName: string;
  footerText?: string;
}

export function Footer({ siteName, footerText }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#0c0f16] text-[hsl(var(--reader-text))]">
      <div className="reader-container py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-black uppercase tracking-[0.08em]">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--reader-accent))] text-white"><BookOpen className="h-5 w-5" /></span>
              {siteName}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--reader-muted))]">
              {footerText || "A focused home for discovering, following, and reading your library."}
            </p>
          </div>
          <FooterColumn title="Discover" links={[['Library', '/browse'], ['Latest updates', '/browse?sort=latest'], ['Top rated', '/browse?sort=rating']]} />
          <FooterColumn title="Explore" links={[['Popular titles', '/browse?sort=views'], ['Search', '/search'], ['Browse genres', '/browse']]} />
          <FooterColumn title="Account" links={[['Sign in', '/login'], ['Create account', '/signup']]} />
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-[hsl(var(--reader-muted))] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. All rights reserved.</p>
          <p>Read responsibly and support original creators.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="reader-kicker">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="group inline-flex items-center gap-1 text-sm text-[hsl(var(--reader-muted))] transition hover:text-white">
              <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--reader-accent))] opacity-0 transition group-hover:opacity-100" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
