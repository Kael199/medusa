"use client";
// Server Components cannot use `next/dynamic` with `ssr:false`. This thin client
// wrapper owns the dynamic import of the (heavy, browser-only) reader and is
// rendered by the server page. The server page stays a Server Component for SEO
// and metadata; only the interactive reader is client-only.

import dynamic from "next/dynamic";
import type { ReaderPayload } from "./ReaderClient";

const ReaderClient = dynamic(
  () => import("./ReaderClient").then((m) => m.ReaderClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Loading reader…
      </div>
    ),
  },
);

export function ReaderClientLazy({ payload }: { payload: ReaderPayload }) {
  return <ReaderClient payload={payload} />;
}

export default ReaderClientLazy;
