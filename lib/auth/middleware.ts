// Edge middleware for staff/admin routes.
//
// IMPORTANT: middleware is UX-only — it keeps honest users out of /admin chrome
// they shouldn't see and bounces unauthenticated visitors to /login. The real
// enforcement happens in Server Actions / route handlers via `requireCan`
// (see lib/auth/assert.ts). Middleware runs on the Edge runtime and CANNOT
// reliably read Mongoose or the DB, so we only inspect the JWT via `auth`.
//
// Why `export { auth as default }`: Auth.js v5 lets us export `auth` directly
// as the Next middleware function. It populates `req.auth` from the JWT and,
// when `pages.signIn` is set, would auto-redirect — but we override behavior
// with a wrapper so we can branch on role+active and route to /forbidden.
//
// We import `auth` from the BASE config (lib/auth/config.base.ts) — NOT the
// full config — so the Edge middleware bundle never pulls in mongoose, the
// MongoDB driver, @auth/mongodb-adapter, or our models. Those live only in the
// server-component / route-handler path (lib/auth/config.ts).

import { auth } from "@/lib/auth/config.base";
import { can } from "@/lib/auth/rbac";

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const user = req.auth?.user;
  const isLoginPage = path === "/login";

  // Allow anyone to reach /login (so they can sign in). Everything else in
  // /admin and /api/admin below is gated.

  if (path.startsWith("/api/admin")) {
    // For API routes: respond with a plain 401/403 JSON instead of redirect.
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    if (user.active === false) {
      return new Response(JSON.stringify({ error: "Account disabled" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }
    if (!can(user.role, "admin:view")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }
    return; // fall through to the route handler
  }

  if (path.startsWith("/admin")) {
    if (isLoginPage) return; // safety; matcher wouldn't match anyway

    if (!user) {
      // Send them to login, remembering where they tried to go.
      const callbackPath = encodeURIComponent(path);
      const url = new URL(`/login?callbackPath=${callbackPath}`, nextUrl);
      return Response.redirect(url);
    }

    if (user.active === false) {
      return Response.redirect(new URL("/forbidden", nextUrl));
    }

    if (!can(user.role, "admin:view")) {
      return Response.redirect(new URL("/forbidden", nextUrl));
    }
    return; // fall through
  }
});

// Matcher: only the admin trees. Everything else (public reader, /login,
// /forbidden, /api/auth/*) bypasses this middleware entirely.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
