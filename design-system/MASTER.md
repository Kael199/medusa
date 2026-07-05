# Mango Manga CMS — Master Design System

Style: **content-dense, dark-mode-first manga reader** with Asurascans-inspired polish.
Generated 2026-07-05. Source of truth for all UI tokens. Page-level overrides go in `pages/<page>.md`.

## 1. Style

- **Voice:** modern manga reading platform. Restrained chrome, maximum art.
- **Pattern:** App shell (sticky top bar + content) on public; dashboard shell (sidebar + content) on admin.
- **Surface treatment:** glassmorphic top bar (`bg-background/85 backdrop-blur`) on light, opaque on dark.
- **Card style:** soft 12px radii, 1px border + subtle elevation-1 shadow. No harsh drop shadows.
- **Cover art:** 2:3 aspect ratio, full-bleed image, gradient overlay for badges.
- **Emphasis:** primary actions via saturated orange; VIP via warm amber gradient; danger via standard red.

## 2. Color tokens (light + dark)

All values HSL space-separated. Use via `bg-primary`, `text-muted-foreground`, etc.

**Brand**
- `--primary` orange. Light `24 95% 53%`. Dark `24 95% 58%`.
- `--primary-foreground` white in both modes.

**VIP**
- `--vip` light `38 92% 50%`, dark `40 95% 58%`.
- `--vip-foreground` muted dark on light / deep dark on dark for contrast.

**Surfaces (dark-mode first — dark is default-leaning)**
- Light: background `0 0% 100%`, card `0 0% 100%`, popover `0 0% 100%`, muted `240 5% 96%`.
- Dark: background `222 18% 7%`, card `222 16% 10%`, popover `222 18% 7%`, muted `222 14% 14%`.

**Foreground**
- Light `222 47% 11%`, Dark `210 20% 96%`.
- Muted-foreground: Light `222 12% 42%`, Dark `215 12% 65%`.

**Borders / inputs / focus ring** mirror primary hue.

## 3. Typography

- Sans: `Inter` (already wired) + `var(--font-sans)` fallback.
- Display (brand + hero): same as sans but **tracking-tight**, weight 800.
- Scale (px): 12, 13, 14, 16, 18, 20, 24, 30, 38.
- Line height: body 1.55, headings 1.15.
- Tracking: headings `-0.02em`, body default.

## 4. Spacing & radii

- 4/8 rhythm: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Radii: sm 6, md 10, lg 14, xl 20.
- Containers: max-width `76rem` public, full-bleed admin (with sidebar).

## 5. Elevation

- e1 `0 1px 2px rgb(0 0 0 / 0.06)` (cards, popovers)
- e2 `0 6px 16px -8px rgb(0 0 0 / 0.18)` (modals, sheets)
- e3 `0 24px 48px -24px rgb(0 0 0 / 0.30)` (hero overlays)
- Dark mode: ramp opacity ~1.6× because shadows on dark need more presence.

## 6. Motion

- Micro: 150ms ease-out (hover, focus rings, taps).
- Surface: 220ms ease-out (modals, sheets).
- Reduced motion: clamp to 0.01ms via `@media (prefers-reduced-motion: reduce)`.
- Never animate width/height — transform/opacity only.

## 7. Iconography

- `lucide-react` (already a dep). Stroke 1.75, 16/20/24 px.
- No emojis. Manga type/status badges use small inline SVGs or text-only labels in colored chips.

## 8. Pre-delivery checklist

- [ ] Both themes validate WCAG AA (4.5:1 body, 3:1 UI).
- [ ] Touch targets ≥44px.
- [ ] Focus rings visible (2px ring on `--ring`).
- [ ] Skip-to-content link on first paint.
- [ ] No layout shift on image load (use `<Image fill>` + `aspect-*` containers).
- [ ] `prefers-reduced-motion` honored.
