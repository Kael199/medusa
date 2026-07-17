import type { Metadata } from "next";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { getSettings } from "@/lib/query/get-settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { Footer } from "@/components/public/Footer";

export const metadata: Metadata = {
  title: { default: "Mango", template: "%s · Mango" },
  description: "Read manga, manhwa and manhua online.",
};

// The public layout fetches settings from the DB and renders per request.
// Marking the segment dynamic keeps `next build` from prerendering it
// against a DB that isn't available at build time. Individual pages under
// this segment that should be cached can opt back in per-route later.
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connect();
  const settings = await getSettings();

  return (
    <div className="reader-public-shell flex min-h-dvh flex-col">
      <PublicNavbar siteName={settings.siteName} />
      {settings.announcements.length > 0 && (
        <div className="border-b border-white/10 bg-[hsl(var(--reader-accent)/0.12)] text-[hsl(var(--reader-text))]">
          <div className="reader-container py-2 text-center text-xs font-medium tracking-wide sm:text-sm">
            {settings.announcements.join(" · ")}
          </div>
        </div>
      )}
      <main id="main" className="flex-1">{children}</main>
      <Footer siteName={settings.siteName} footerText={settings.footerText} />
    </div>
  );
}
