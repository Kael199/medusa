// Root Next.js proxy (formerly "middleware" — renamed in Next 16).
// Re-exports the default function only. The `config` (matcher) MUST be defined
// inline here, NOT re-exported — Next statically parses it from proxy.ts/middleware.ts.
// See https://nextjs.org/docs/app/api-reference/file-conventions/middleware

import { default as middleware } from "@/lib/auth/middleware";

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
