# Mango — Manga CMS with full-control Admin Panel

A self-hosted manga / manhwa / manhua CMS built on **Next.js 16** (App Router, Turbopack, React 19.2 Server Components + Server Actions) and **MongoDB** (Mongoose for app data, raw `MongoClient` for the Auth.js adapter). No scrapers — you upload your own content. Role-based staff access controls everything.

## Features

**Public site**
- Home page with recently-updated and popular manga
- Browse + search with filters (status, type, genre, sort) and full-text search
- Manga detail page (cover/banner, metadata, genres/tags, chapters, OG image)
- Reader with three modes: **paginated**, **list**, **webtoon long-strip**
- Reading progress saved in `localStorage` (no accounts)
- Sitemap + robots

**Admin panel** (`/admin`, staff-only)
- Dashboard with stats
- Manga CRUD (create / edit / publish / unpublish / hide / delete)
- Chapter manager (create, upload pages, reorder, publish)
- Genres & tags management
- Uploads library
- Staff users + roles (Super-Admin / Editor / Uploader)
- Site settings (name, tagline, default reader mode, announcements, maintenance)

## Roles

| Asset | super-admin | editor | uploader |
|---|:--:|:--:|:--:|
| Use admin panel | ✓ | ✓ | ✓ |
| Create manga / chapter | ✓ | ✓ | own drafts only |
| Edit any / own | any | any | own only |
| Publish | ✓ | ✓ | ✗ |
| Delete | ✓ | ✓ | ✗ |
| Manage genres/tags | ✓ | ✓ | ✗ |
| Upload files | ✓ | ✓ | ✗ (view only) |
| Manage staff & settings | ✓ | ✗ | ✗ |

Enforcement happens in the Server Actions + Server Components (the middleware is UX-only). The "uploader == own drafts only" rule is enforced at the data layer via `uploadedById` own-checks.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
#    - MONGODB_URI      (local Mongo or Atlas free tier)
#    - AUTH_SECRET       (generate with: npx auth secret)
#    - SEED_ADMIN_EMAIL
#    - SEED_ADMIN_PASSWORD  (>= 8 chars)

# 3. Seed the Super-Admin + starter genres
npm run seed

# 4. Run dev server
npm run dev
```

Open http://localhost:3000, then go to `/login` and sign in with your seeded Super-Admin. You'll be redirected to `/admin`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next dev (Turbopack) |
| `npm run build` | Production build (also runs typegen + typecheck) |
| `npm run start` | Production server |
| `npm run seed` | Idempotent first-run seeder (Super-Admin + genres + Settings) |
| `npm run lint` | ESLint |
| `npm run typegen` | Regenerate Next route types (PageProps) |

## Architecture notes

- **Two DB connections, one URI.** `lib/db/client.ts` caches a raw `MongoClient` for the Auth.js `MongoDBAdapter` (it requires an already-connected client). `lib/db/mongoose.ts` caches the Mongoose connection the app's own models use. Both share `MONGODB_URI` and `globalThis` caches to survive dev HMR.
- **Auth.js v5.** Credentials provider, JWT strategy (avoids a session round-trip and lets us carry the staff role cheaply), `jwt` + `session` callbacks stamp `id`/`role`/`active`. `password` is `select:false`. Module augmentation in `lib/auth/next-auth.d.ts` keeps the session typed.
- **Images** are stored on the local filesystem under `public/uploads/manga/{mangaId}/{covers|banners|chapters/{chapterId}}/`. Upload Server Action validates magic bytes (rejects SVG), enforces size/count caps, validates ObjectIds (blocks path traversal), and converts to webp via `sharp`. See **v1 limitation** below.

### v1 limitations / known gaps (documented, not blocking)

- **Read-only filesystem on serverless.** `public/uploads/` writes work on a normal dev machine, a VM, or a Docker volume, but **not on Vercel/serverless** where the FS is read-only. To deploy serverless, swap `lib/actions/upload.ts` for a blob/S3 variant — the relative-URL contract makes this a one-file change.
- **No rate limiting.** There is no IP throttle on `/api/auth/callback/credentials` or on the upload action. Mitigations present: bcrypt hashing, magic-byte upload checks, RBAC on every mutation. Add `@upstash/ratelimit` (or middleware-level) throttling before going to production. A clean seam is left in `lib/auth/config.ts` and `lib/actions/upload.ts`.
- **No public reader accounts.** Reading progress is purely client-side `localStorage`. Bookmarking/commenting/registration are out of scope for v1.
- **Middleware is UX-only.** It redirects unauthenticated visitors away from `/admin`, but the real security boundary is the Server Actions / Server Components guarded by `getCurrentUser()` + `assertCan()`. Never rely on middleware alone — Server Actions can be invoked from anywhere.

## Security posture at a glance
- Passwords hashed with bcrypt (12 rounds), `select:false`, constant-time-ish compare (`verifyPassword` + `dummyVerify`).
- Server Actions CSRF-protected by Next 16 defaults (signed action id + origin check). `allowedOrigins` is **not** relaxed.
- Public query builders use closed allowlists; Mongo operator keys (`$gt`, `$where`, …) are dropped — defenses against NoSQL injection.
- IDOR: every mutation loads the resource, checks `can(role, "…:editAny")` / `editOwn` (`uploadedById.equals(user.id)`), and rejects otherwise.
- File upload: magic-byte sniff, size + count caps, reject SVG, server-generated filenames (never the user's), ObjectId-validated path components.
