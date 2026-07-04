"use client";

// AuthGate — a CLIENT-side defensive gate for the admin tree.
//
// The real authorization gate is server-side: middleware + Server Actions via
// `requireCan`. AuthGate exists as a second layer so that if a stale client
// bundle navigates into /admin with no session cookie (or with a disabled
// account) the user still bounces immediately instead of seeing admin chrome
// for a frame before the server layout redirects.
//
// Usage (in app/admin/layout.tsx, owned by workstream C):
//   <AuthGate user={sessionUser} requiredRole="editor">
//     {children}
//   </AuthGate>
//
// `user` comes from the server layout (which calls getCurrentUser()) and is
// passed down so we don't need a client session provider for this check.

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { StaffRole } from "@/lib/constants";
import { can } from "@/lib/auth/rbac";
import type { Permission } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/get-current-user";

interface AuthGateProps {
  user?: SessionUser | null;
  /** Optional minimum role; if omitted, any logged-in admin:user passes. */
  requiredRole?: StaffRole;
  /** Optional fine-grained permission (preferred over requiredRole). */
  requiredPermission?: Permission;
  children: React.ReactNode;
}

export function AuthGate({
  user,
  requiredRole,
  requiredPermission,
  children,
}: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();

  // No session → push to login with the current path preserved.
  React.useEffect(() => {
    if (!user) {
      const callbackPath = encodeURIComponent(pathname || "/admin");
      router.replace(`/login?callbackPath=${callbackPath}`);
    }
  }, [user, pathname, router]);

  // While we have no user (and are about to redirect), render nothing.
  if (!user) {
    return null;
  }

  // Account disabled — show a disabled screen rather than redirect away,
  // since the server layout will already have redirected non-staff; on the
  // client this is a clear dead-end message.
  if (!user.active) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Your account has been disabled.
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Please contact the administrator to restore access.
        </p>
        <Link
          href="/api/auth/signout"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Sign out
        </Link>
      </div>
    );
  }

  // Role / permission check.
  const roleOk = requiredRole ? user.role === requiredRole : true;
  const permOk = requiredPermission
    ? can(user.role, requiredPermission)
    : true;
  if (!roleOk || !permOk) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          You don't have permission to view this console.
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Your role doesn't grant staff dashboard access.
        </p>
        <Link
          href="/forbidden"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          More info
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
