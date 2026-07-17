# Medusa black–red–blue public design plan

## Scope
Refresh the **public-facing Medusa site**—including the homepage featured slider, navigation, catalog/detail/search surfaces, cards, filters, and footer—with a cohesive black, crimson-red, and electric-blue visual system. The admin interface retains its existing neutral semantic theme for productivity and contrast.

## Current implementation
- The public site already has an isolated `.reader-public-shell` theme in `app/globals.css`, powered by `--reader-*` CSS variables. Public components consume those variables plus hard-coded dark surfaces.
- `FeaturedMangaSlider.tsx` already supports autoplay, pause-on-hover/focus, navigation buttons, dots, motion reduction, banner fallback, and responsive layouts. It is the correct component for a visual enhancement rather than a new carousel.
- `PublicNavbar.tsx`, `MangaCard.tsx`, `Footer.tsx`, search/filter components, and public route layouts provide the remaining public visual surfaces.
- The current palette is orange/cyan/dark-navy. It should shift to black/near-black foundations, crimson red as the primary action/identity color, and electric blue as the secondary/light/interaction accent.

## Design direction
- **Foundation:** near-black `#07080D` / charcoal layered panels with blue-black depth; preserve readable off-white text.
- **Primary identity:** crimson/red (roughly `#E11D48` to `#FF2D55`) for branding, active navigation, primary CTAs, spotlight labels, and hover glows.
- **Secondary energy:** electric/cobalt blue (roughly `#38BDF8` to `#2563EB`) for secondary metadata, trending indicators, focus/interactive cues, and atmospheric gradients.
- **Signature treatment:** subtle red/blue radial lighting, thin dual-tone borders, restrained grid texture, and gradients—not large saturated color fields—so covers remain the visual focus.

## Implementation steps
1. Update `.reader-public-shell` variables and its helper utilities in `app/globals.css`: new dark foundation, red primary accent, blue secondary accent, refined panel/border values, updated background glow/grid, and reusable Medusa-specific gradient/glow utility classes.
2. Redesign `FeaturedMangaSlider.tsx` around that token system:
   - add black/red/blue atmospheric overlays and edge treatment;
   - improve content hierarchy and action contrast;
   - change status, type, rating, dots, and navigation controls to the new red/blue roles;
   - preserve current accessibility behavior, reduced-motion support, and responsive image fallback.
3. Align `PublicNavbar.tsx`, `MangaCard.tsx`, `Footer.tsx`, and public search/filter/section styling with the token system: red active/primary interactions, blue supplemental data/focus accents, stronger panels and borders, and consistent card hover effects.
4. Refine the homepage empty-state hero and section headings in `app/(public)/page.tsx` so they use the same Medusa signature lighting and red/blue hierarchy.
5. Run TypeScript validation and inspect the diff for accidental admin/global semantic-token impact.

## Guardrails
- Do not alter routes, database models, reader behavior, slider mechanics, or admin theme tokens.
- Do not replace the established accessible carousel controls; enhance only their visuals and semantics where necessary.
- Retain content-image fallbacks and motion-reduction behavior.
