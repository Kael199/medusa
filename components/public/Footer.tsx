import Link from "next/link";

interface FooterProps {
  siteName: string;
  footerText?: string;
}

export function Footer({ siteName, footerText }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        {footerText && <p className="mb-3 max-w-2xl">{footerText}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>
            © {year} {siteName}. All series are property of their respective owners.
          </p>
          <nav className="flex gap-4">
            <Link href="/browse" className="hover:text-foreground">Browse</Link>
            <Link href="/search" className="hover:text-foreground">Search</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
