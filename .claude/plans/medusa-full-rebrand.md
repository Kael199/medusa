# Medusa full rebrand plan

## Scope
Replace the project and default product brand **Mango** with **Medusa** everywhere it identifies the application, while preserving the manga-domain vocabulary (`Manga` model/types/routes/content terminology) and existing database schema.

## Findings
- Static product defaults occur in `app/layout.tsx`, `app/(public)/layout.tsx`, `app/admin/layout.tsx`, `models/Settings.ts`, `lib/query/get-settings.ts`, and `scripts/seed.ts`.
- Project/package/docs branding occurs in `package.json`, `package-lock.json`, `README.md`, `design-system/MASTER.md`, and historical `.claude/plans/` documents.
- The site settings singleton already supports a configurable `siteName`; changing its fallback and seed value updates new/default installations. Existing deployed databases with `siteName: "Mango"` must be updated through Admin Settings or a data migration because schema defaults do not overwrite persisted values.
- `mango` also appears in example MongoDB database names and Vercel domains in README. Those examples should be renamed to Medusa equivalents as part of the rebrand.
- Domain-specific `Manga` names (models, routes, UI labels such as “Manga CRUD”, type/status constants) will not be changed: they describe the app’s content rather than the product brand.

## Implementation steps
1. Update package metadata from `mango-admin` to an appropriate Medusa package name and synchronize the root name in `package-lock.json`.
2. Change all default/fallback app branding from `Mango` to `Medusa` in root/public/admin metadata, settings model/query defaults, and the seed settings payload.
3. Update documentation/design-system headers and deployment/example identifiers (`mango` database/domain) to `medusa`, including historical plan title/context where branding is stated.
4. Confirm no unintended product-brand occurrences remain via a case-sensitive search, then run TypeScript validation. Update the lint script separately only if requested; it is an existing unrelated issue.

## Compatibility
- No route, model, collection, or environment-variable names change.
- Existing `Settings` records remain authoritative, so existing sites will retain their stored name until they are changed through `/admin/settings`.
