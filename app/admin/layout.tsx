// Admin layout (server component). Decides the entire shape of the admin
// chrome: if there's no signed-in user -> /login; if the role can't view the
// admin area -> /forbidden. Otherwise renders the chrome shell with nav items
// filtered by permission. `children` is the matched admin page.

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import "@/models";
import { connect } from "@/lib/db/mongoose";
import { Settings } from "@/models";
import { AdminShell, type AdminUser } from "@/components/admin/AdminShell";
import { AuthGate } from "@/components/admin/AuthGate";
import type { SidebarItem } from "@/components/admin/Sidebar";
import { LayoutDashboard, Book, Tags, FolderOpen, Users, Settings as SettingsIcon } from "lucide-react";

// Every admin page is authenticated + DB-backed and must render per request.
// Marking the segment dynamic keeps `next build` from prerendering these
// pages against a DB that isn't available at build time. (Also true in
// production: admin content is per-user, never statically cacheable.)
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connect();
  const user = await getCurrentUser();

  if (!user) redirect("/login?callbackPath=/admin");
  if (!can(user.role, "admin:view")) redirect("/forbidden");

  const allNav: SidebarItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/manga", label: "Manga", icon: Book },
    { href: "/admin/genres", label: "Genres & Tags", icon: Tags },
    { href: "/admin/uploads", label: "Uploads", icon: FolderOpen },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ];

  // Filter the nav to items the role can actually use. Some pages also gate
  // internally, but hiding the link is the first line of clarity.
  const navItems = allNav.filter((item) => {
    switch (item.href) {
      case "/admin/staff":
        return can(user.role, "staff:manage");
      case "/admin/settings":
        return can(user.role, "settings:manage");
      case "/admin/genres":
        return can(user.role, "genre:manage");
      case "/admin/uploads":
        return can(user.role, "uploads:read");
      default:
        return true; // Dashboard + Manga visible to every staff role
    }
  });

  // Pull the configured site name for the chrome header.
  let siteName = "Medusa";
  try {
    const settings = await Settings.findById("singleton").lean() as unknown as { siteName?: string } | null;
    if (settings && settings.siteName) siteName = settings.siteName;
  } catch {
    // ignore — non-fatal
  }

  const shellUser: AdminUser = {
    name: user.name ?? undefined,
    email: user.email,
    role: user.role,
  };

  return (
    <AdminShell user={shellUser} siteName={siteName} navItems={navItems}>
      <AuthGate user={user} requiredPermission="admin:view">
        {children}
      </AuthGate>
    </AdminShell>
  );
}
