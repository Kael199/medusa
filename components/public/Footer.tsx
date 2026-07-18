import Link from "next/link";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";

interface FooterProps {
  siteName: string;
  footerText?: string;
}

export function Footer({ siteName, footerText }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-[#07090f] text-[hsl(var(--reader-text))]">
      {/* Animated aurora top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--reader-accent))] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[80rem] -translate-x-1/2 bg-[radial-gradient(closest-side,hsl(var(--reader-accent)/0.18),transparent)] blur-2xl"
      />
      <div className="reader-container relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 font-black uppercase tracking-[0.08em] text-white"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[hsl(var(--reader-accent))] via-[hsl(var(--reader-violet))] to-[hsl(var(--reader-cyan))] text-white shadow-[0_8px_28px_-10px_hsl(var(--reader-accent)/0.7)] transition group-hover:shadow-[0_12px_36px_-10px_hsl(var(--reader-accent)/0.9)]">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="text-neon-gradient">{siteName}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--reader-muted))]">
              {footerText ||
                "A focused home for discovering, following, and reading your library."}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--reader-cyan))]">
              <Sparkles className="h-3 w-3" />
              Curated daily
            </div>
          </div>
          <FooterColumn
            title="Discover"
            links={[
              ["Library", "/browse"],
              ["Latest updates", "/browse?sort=latest"],
              ["Top rated", "/browse?sort=rating"],
            ]}
          />
          <FooterColumn
            title="Explore"
            links={[
              ["Popular titles", "/browse?sort=views"],
              ["Search", "/search"],
              ["Browse genres", "/browse"],
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              ["Sign in", "/login"],
              ["Create account", "/signup"],
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-[hsl(var(--reader-muted))] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. All rights reserved.</p>
          <p>Read responsibly and support original creators.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--reader-accent))]">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="group inline-flex items-center gap-1.5 text-sm text-[hsl(var(--reader-muted))] transition hover:text-white"
            >
              <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--reader-accent))] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              <span className="bg-gradient-to-r from-white/0 via-white/0 to-white/0 bg-[length:0%_1px] bg-bottom bg-no-repeat transition group-hover:bg-[linear-gradient(to_right,hsl(var(--reader-accent)),hsl(var(--reader-cyan)))] group-hover:bg-[length:100%_1px]">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
