// /forbidden — 403 landing for users who are logged in but lack the role to
// view /admin, or whose account has been disabled. Linked from the middleware
// and from the client AuthGate.

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted/40 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          You don't have permission to access this page.
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          If you believe this is a mistake, contact the site administrator. Your
          account may have been disabled or your role may not include staff
          access.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Try the dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
