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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, LogOut, Menu, User as UserIcon } from "lucide-react";

export interface AdminUser {
  name?: string;
  email: string;
  role: StaffRole;
}

const ROLE_STYLES: Record<StaffRole, string> = {
  "super-admin":
    "border-[hsl(var(--neon-magenta)/0.4)] bg-[hsl(var(--neon-magenta)/0.12)] text-[hsl(var(--neon-magenta))]",
  editor:
    "border-[hsl(var(--neon-cyan)/0.4)] bg-[hsl(var(--neon-cyan)/0.12)] text-[hsl(var(--neon-cyan))]",
  uploader:
    "border-[hsl(var(--neon-violet)/0.4)] bg-[hsl(var(--neon-violet)/0.12)] text-[hsl(var(--neon-violet))]",
};

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
    <div className="relative flex min-h-screen bg-background">
      {/* Subtle aurora underlay on the admin shell */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(var(--neon-magenta)/0.10),transparent)] blur-3xl" />
        <div className="absolute top-1/3 right-0 h-72 w-[50rem] rounded-full bg-[radial-gradient(closest-side,hsl(var(--neon-cyan)/0.08),transparent)] blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-md md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2.5 border-b border-border/60 px-5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))] text-xs font-black text-primary-foreground shadow-[0_8px_22px_-10px_hsl(var(--primary)/0.7)]">
            M
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight text-foreground">
              {siteName || "Admin"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Studio
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar items={navItems} activeHref={pathname} />
        </div>
        <div className="border-t border-border/60 p-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          v1.0 · {user.role}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-r-border/60 bg-card/95 p-0 backdrop-blur-xl"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-14 items-center gap-2.5 border-b border-border/60 px-5">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary via-[hsl(var(--neon-violet))] to-[hsl(var(--neon-cyan))] text-xs font-black text-primary-foreground">
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

          <div className="ml-auto flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                ROLE_STYLES[user.role] ?? "border-border bg-muted text-muted-foreground",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
              {user.role}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-[hsl(var(--neon-cyan))/0.30] text-foreground">
                    <UserIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="hidden max-w-[12rem] truncate sm:inline">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[14rem]">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    void handleSignOut();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminShell;
