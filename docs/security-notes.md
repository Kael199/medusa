# Security Notes — Auth & Enforcement (Workstream B)

A short, living summary of how authentication and authorization work in this
CMS, and the known gaps v1 ships with. Kept deliberately blunt so engineers
extending the system don't get burned by the seams.

## What we have

- **Auth.js v5** (`next-auth@5.0.0.0-beta`) with the **Credentials** provider
  only. There are no OAuth providers in v1 — staff are provisioned
  out-of-band by a super-admin (workstream C / D `staff` management).
- **JWT sessions** (`session: { strategy: "jwt" }`), not database sessions,
  so `role` and `active` ride on the token without a per-request DB lookup.
  The MongoDB adapter is still wired so credentials login and any future
  OAuth land documents in the `users` collection Mongoose also manages.
- **`password` is `select: false`** on the User schema, so it's never
  serialized to the client or sessions. `authorize()` explicitly
  `.select("+password +active")` when it needs them.
- **`active` flag** softly disables logins: `authorize()` rejects an inactive
  user even with a correct password, and `getCurrentUser()` treats
  `active === false` as logged-out. Server Actions that mutate should
  re-check `active` against the DB if mid-session disable matters (the JWT
  is only refreshed from the DB on sign-in).
- **Authorization is enforced server-side** via `lib/auth/assert.ts`:
  `requireUser()` (401) and `requireCan(perm)` (401 → 403). Server Actions
  call `requireCan("manga:editAny")` etc. and wrap logic in try/catch,
  returning `asActionError(e)` on failure. Permissions are the source of
  truth in `lib/auth/rbac.ts`; "uploader == own drafts only" is enforced at
  the data layer via `canEditManga` / `canEditChapter`.
- **Middleware is UX-only.** It keeps honest traffic out of `/admin` and
  `/api/admin/*`, redirecting unauthenticated users to `/login` with a
  `callbackPath`, and rerouting authenticated-but-unauthorized users to
  `/forbidden`. For `/api/admin/*` it returns JSON 401/403 instead of
  redirecting. **It does not authorize mutations** — Server Actions do.
- **Timing safety on login:** when no user is found, `authorize()` runs
  `dummyVerify()` (a throwaway bcrypt compare) so the "no such user" and
  "wrong password" branches take roughly the same time. This is a basic
  user-enumeration hedge, not a perfect one (network jitter matters).

## Known gaps (v1)

- **No rate limiting.** There is no throttle on `/api/auth/callback/credentials`
  or the login page. A determined attacker can brute-force passwords.
  Mitigation is a v2 task: a tokens-per-IP-per-window limiter (Redis or
  edge KV) in front of the credentials callback, plus exponential lockout
  by email. For now, run behind Cloudflare / a CDN with WAF rate rules.
- **No CSRF on the credentials callback beyond Next defaults.** Auth.js v5
  + Next 16 Server Actions inherit double-submit CSRF protection for the
  action layer, and the Auth.js handlers set `SameSite=Lax` cookies. Custom
  POST routes (outside Server Actions) must add their own CSRF token.
- **JWT staleness on disable.** Disabling a user (`active:false`) does not
  invalidate the user's existing JWT until it expires; they keep working
  for the session lifetime. For an immediate kill, rotate `NEXTAUTH_SECRET`
  (invalidates all sessions) or add a token-revocation table — out of scope v1.
- **No MFA / no password reset flow.** Staff recovery is manual
  (super-admin resets a password) — see the `seed` script and the staff
  management UI (workstream C).
- **No audit log of auth events.** Failed/successful logins are not
  persisted. v2 will add an `authEvents` collection.
- **Credentials enumeration is reduced, not eliminated.** Beyond timing,
  the login form returns the same generic "Invalid credentials" toast for
  all failure modes.

## Trust boundaries

```
Browser ─→ middleware (UX gate, JWT only) ─→ RSC layout (getCurrentUser)
        ─→ Server Action / route handler ─→ requireCan(perm) ← actual gate
        ─→ Mongoose (lib/actions/*) ─→ MongoDB
```

Anything reachable as a Server Action or a route handler MUST go through
`requireCan`. Treat the client as adversarial; never trust props from it for
authorization, only for the input shape.
