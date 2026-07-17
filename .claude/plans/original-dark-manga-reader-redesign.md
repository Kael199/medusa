# Original dark manga-reader redesign

## Goal
Transform the existing public-facing Medusa CMS into an original, dark, high-density manga discovery and reading experience. This is an original brand and implementation: no copying of Asura Scans names, artwork, text, proprietary content, or exact UI composition. Existing MongoDB content, routes, reader modes, and admin workflows remain intact.

## Confirmed direction
- User selected **Original inspired site**: use general manga-reader conventions, not a replica.
- Target visual language: always-dark graphite/navy surfaces, a vivid warm accent, compact discovery-oriented layouts, readable chapter access, responsive navigation, and distinct component styling.
- Scope is the full public experience, including home, browse/search/genre discovery views, series detail, shared header/footer, cards, and chapter list.

## Existing architecture and constraints
- Next.js 16 App Router, React 19, Tailwind CSS 3, Mongoose/MongoDB.
- All public routes are intentionally dynamic and fetch published/non-hidden data on the server.
- Existing data model exposes titles, descriptions, authors/artists, types, statuses, ratings, views, cover/banner art, genres/tags, and chapters—enough for discovery surfaces without schema changes.
- Homepage already retrieves featured, recently updated, and popular items; the client-side `FeaturedMangaSlider` supports an image-backed carousel and graceful missing-art state.
- `PublicNavbar`, `Footer`, `MangaCard`, `MangaGrid`, and `ChapterList` are shared public building blocks. Detail, browse, search, and genre pages compose them.
- The `ThemeProvider` currently permits system/light/dark selection. Public chrome should instead apply dark styling consistently without breaking admin or reader styling.
- No remote content needs to be imported, scraped, or embedded. Existing administrator-uploaded images remain the only artwork.

## Implementation plan
1. **Create a public-only dark identity layer**
   - Add a stable public shell class to `app/(public)/layout.tsx` and set the public surface to dark independently of the global user-selected theme.
   - Add scoped CSS variables and utilities for this shell in `app/globals.css`: dark backgrounds, layered panels, warm accent, cool highlight, borders, shadows, decorative grid/noise effects, and an accessible reduced-motion fallback.
   - Preserve global semantic tokens and unscoped admin/reader styles so the redesign does not alter back-office behavior.

2. **Rebuild shared discovery chrome**
   - Restyle `PublicNavbar` as a compact, dark, sticky navigation with an original wordmark treatment, streamlined Browse/Search navigation, search space, account call-to-action, and matching mobile drawer.
   - Update `Footer` to a simpler dark directory/footer pattern with content and account links, and remove misleading external project attribution.
   - Keep all current navigation destinations and authentication links.

3. **Redesign collection cards and home feed**
   - Rework `MangaCard` and `MangaGrid` into a dense but responsive cover grid with a distinct framed-art treatment, overlays, typography, status/rating metadata, missing-art fallback, and keyboard-visible focus state.
   - Update the featured slider styling and home page composition so its hero, recently updated, and popular feed use the new visual hierarchy and original labels. Continue using the existing published manga queries and no-image behavior.

4. **Complete public route consistency**
   - Restyle browse, search, genre, and series detail page shells/headers to use dark surface panels and clear discovery metadata while retaining existing filtering, pagination, linking, and DB query behavior.
   - Rework `ChapterList` as a readable, dense chapter panel with date/page metadata and clear entry affordances, retaining newest-first sort and existing reader route.
   - Make focused class-level adjustments to the filters, search input, empty states, authentication forms, and forbidden route if needed to prevent light surfaces or broken contrast inside the public shell.

5. **Validate and polish**
   - Run the production build (`npm run build`) and address TypeScript/build errors caused by implementation.
   - Check empty database behavior, existing uploads/no-upload image fallbacks, mobile markup, focus states, and that public pages use existing routes only.
   - Do not make claims of exact site replication or introduce external manga sources.

## Expected files
- `app/(public)/layout.tsx`
- `app/(public)/page.tsx`
- `app/(public)/browse/page.tsx`
- `app/(public)/search/page.tsx`
- `app/(public)/manga/[slug]/page.tsx`
- `app/globals.css`
- `components/public/PublicNavbar.tsx`
- `components/public/Footer.tsx`
- `components/public/FeaturedMangaSlider.tsx`
- `components/public/MangaCard.tsx`
- `components/public/MangaGrid.tsx`
- `components/public/ChapterList.tsx`
- Targeted public filtering/search/empty-state components only if contrast consistency requires them.

## Verification
- `npm run build`
- Manual source-level review of public shell isolation, dark contrast, no-image states, responsive navigation, carousel controls, and existing links.
