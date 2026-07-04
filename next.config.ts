// Next.js 16 config. Server Actions are CSRF-protected by default (signed action
// id + origin check) — do NOT relax allowedOrigins. Local /uploads images are
// same-origin so no remotePatterns entry is needed.

import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // /uploads/* is served from public/ (same origin) -> no remotePatterns needed.
    // If a CDN is added later, add a remotePatterns entry there.
  },
  experimental: {
    // App Router inference; keep defaults unless needed.
  },
  // The reader makes /uploads files part of the same response origin, so
  // next/image can optimize them without any domain config.
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default config;
