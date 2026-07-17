# Vercel-ready public experience redesign

## Goal
Refresh the public-facing manga site into a polished, dynamic orange-and-indigo experience that deploys cleanly to Vercel with MongoDB-backed content. The redesign includes an accessible autoplay hero slider fed from existing manga banner/cover records, a stronger shared color/motion system, and consistent refinements across public pages and site chrome. Admin and reader workflows remain functionally unchanged unless a shared token affects them.

## Current state
- Next.js 16 App Router with Tailwind CSS 3, React 19, and MongoDB/Mongoose.
- The public layout is intentionally `force-dynamic` because it reads site settings from MongoDB; this is compatible with Vercel server rendering when its environment variables are configured.
- The home page presently selects one most-viewed manga as a static hero, then renders two grids.
- The Manga schema already provides everything needed for slides: `slug`, `title`, `bannerImage`, `coverImage`, `description`, `author`, `status`, `type`, `views`, and `rating`.
- There is no slider dependency today. The slider will use React state/effects and CSS transitions instead of adding a library.
- Global styling uses semantic HSL tokens and supports light/dark theme states.

## Approved design direction
- Full visual redesign of public-facing pages and components, while retaining existing data model, routes, and behavior.
- Use a premium orange-and-indigo palette, strengthened surfaces, gradients, and motion.
- Add a dynamic, responsive, accessible homepage slider driven by featured published manga from MongoDB.
- Deployment target: Vercel with MongoDB configured.

## Implementation plan
1. **Create reusable public hero slider**
   - Add a client `FeaturedMangaSlider` component under `components/public/`.
   - Define a compact serializable slide data type based only on existing Manga fields.
   - Render image art with layered readable gradients, status/type metadata, author/rating details, primary and secondary calls-to-action, slide count, dot controls, and previous/next buttons.
   - Autoplay at a calm interval, pause on pointer/focus interaction, honor `prefers-reduced-motion`, wrap around safely, and expose labeled controls/slide state for keyboard and screen-reader users.
   - Include an attractive no-image treatment so featured titles with no cover/banner do not create an empty experience.

2. **Connect dynamic featured data to the homepage**
   - Update `app/(public)/page.tsx` to query a small set of published/non-hidden Manga ordered by view count and recency, selecting only required fields.
   - Replace the single static hero query/markup with the slider component. Retain existing recently-updated and popular content sections, but tune section layouts and labels to fit the redesigned visual hierarchy.
   - Keep all queries server-side, preserve `force-dynamic`, and avoid changes to the MongoDB model or additional deployment dependencies.

3. **Establish visual tokens and motion utilities**
   - Update `app/globals.css` semantic color values for an intentional orange brand primary, indigo secondary/accent, rich neutral backdrops, high-contrast dark mode, and refined shadows.
   - Add narrowly scoped utilities for aurora/mesh hero backgrounds, slide animation, text gradients, frosted surfaces, and image overlays. Include a reduced-motion rule that disables automated visual motion.
   - Preserve existing token names so shared UI, admin, reader, and forms inherit coherent styling without functional regressions.

4. **Redesign shared public chrome and content cards**
   - Refine `PublicNavbar` and `Footer` into consistent premium translucent navigation/footer surfaces with stronger active, hover, mobile, and theme-toggle states.
   - Modernize `MangaCard` and `MangaGrid` for consistent image framing, micro-interactions, title readability, rating/status treatment, responsive density, and graceful missing-art handling.
   - Review the browse, search, genre, manga-detail, forbidden, login, and signup public routes and make targeted class-level changes so the redesign feels coherent across the full public site without altering their data/query/action behavior.

5. **Vercel readiness and verification**
   - Confirm the image remote pattern/config is compatible with the image URLs the app accepts, without accidentally widening host access.
   - Run TypeScript/build checks and resolve all design-introduced errors.
   - Verify that dynamic public routes render safely when no manga exists and that the slider has no hydration mismatch.
   - Report required Vercel environment variables inferred from `.env.local.example` and any remaining deployment prerequisites; do not expose secret values.

## Files expected to change
- `app/(public)/page.tsx`
- `app/globals.css`
- `components/public/FeaturedMangaSlider.tsx` (new)
- `components/public/PublicNavbar.tsx`
- `components/public/Footer.tsx`
- `components/public/MangaCard.tsx`
- `components/public/MangaGrid.tsx`
- Targeted public route/component files discovered during review
- Possibly `next.config.ts` only if an existing image-config gap is confirmed

## Verification
- `npm run build`
- Optionally inspect/resolve lint configuration incompatibility if `npm run lint` is not viable under the current Next.js version.
- Manual code-level checks for slider controls, reduced-motion support, responsive markup, and database-empty behavior.

## Deployment notes
Vercel must receive the same non-secret configuration keys documented in `.env.local.example`, especially the MongoDB connection string and authentication/session variables. Because the public layout is deliberately dynamic, Vercel must use a runtime that can reach the configured MongoDB deployment.