"use client";

// Admin chrome: persistent sidebar (desktop) / Sheet (mobile) + top bar with
// site name, role badge, and a user menu whose Sign-out entry calls Auth.js
// signOut(). The layout server component computes navItems filtered by role
// and passes them in; this component just renders.

import * as React from "react";
import { usePathname } from "next/navigation";
// MUST import signOut from the client entrypoint, not from "@/lib/auth/config".
// config.ts wires the MongoDBAdapter (mongoose + the MongoDB driver), which
// must NEVER enter the client browser bundle (it requires node's net/tls).
import { signOut } from "next-auth/react";
import type { StaffRole } from "@/lib/constants";
import { Sidebar, type SidebarItem } from "@/components/admin/Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User as UserIcon } from "lucide-react";

export interface AdminUser {
  name?: string;
  email: string;
  role: StaffRole;
}

export function AdminShell({
  user,
  siteName,
  navItems,
  children,
}: {
  user: AdminUser;
  siteName: string;
  navItems: SidebarItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: true, callbackUrl: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <span className="rounded-md bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground">
            M
          </span>
          <span className="font-semibold">{siteName || "Admin"}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar items={navItems} activeHref={pathname} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-14 items-center gap-2 border-b px-5">
                  <span className="rounded-md bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground">
                    M
                  </span>
                  <span className="font-semibold">{siteName || "Admin"}</span>
                </div>
                <Sidebar
                  items={navItems}
                  activeHref={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">{user.role}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    void handleSignOut();
                  }}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
