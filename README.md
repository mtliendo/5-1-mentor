# 5-1 Mentor

Phone-first Next.js app for learning volleyball **5-1** rotations. Half-court view (net at the top), named player chips, serve and serve-receive walks, and a short quiz.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

The UI runs without API keys; guests keep preferences and progress in `localStorage`. Signed-in users sync through `GET`/`PUT` `/api/me/preferences` and `/api/me/progress` (Auth0 session + Neon). Authenticated users can snapshot custom role names + libero preference to a share link (`POST /api/me/shares`); another signed-in user imports that snapshot. Court layouts are not stored.

## What ships in this MVP

- TypeScript App Router + Tailwind UI (original gym / playbook look)
- Half court, net at top; chips read `Name · Role`
- Rotation 1–6, serve | serve-receive, named passing looks (3-person, 2-person, W-pass)
- Libero on/off — **off maps L to back-row middle**
- Play-all + step/reset, optional overlap overlay
- Guided lessons, free Explore, multiple-choice Quiz
- `prefers-reduced-motion` (no chip easing; play-all still steps)
- `content/rotations/r1.json`–`r6.json` stubs (see TODO below)
- Auth0 v4 login (`/auth/login`, callback `/auth/callback`) — email + Google
- Signed-in prefs/progress at `/api/me/*`; guests stay on `localStorage`
- Legacy `/api/progress` is a thin compatibility stub only

## Content TODO

Coordinates in `content/rotations/` are normalized stubs (`x` left→right, `y` net→endline). Replace them with film-traced or coach-approved spots. Regenerate the six files with:

```bash
node scripts/generate-rotations.mjs
```

## Auth0 + Neon backend

Copy `.env.example` to `.env.local`. **Do not commit secrets.**

### Neon (`DATABASE_URL`)

`DATABASE_URL` is injected via environment (local `.env.local` or host secrets). **Do not commit it.**

The Neon database already has `app_users`, `user_preferences`, and `user_progress`. `formation_shares` is added by `drizzle/0001_formation_shares.sql`. Drizzle models in `lib/db/schema.ts` match those columns (JSON camelCase in APIs, snake_case in the database). Court formations are **not** stored in Neon — shares snapshot only `{ roleNames, liberoEnabled }`.

`drizzle/0000_*.sql` is a baseline of the original schema. Later migrations (including `0001_formation_shares.sql`) use `CREATE TABLE IF NOT EXISTS` and only add constraints when missing, so `db:migrate` is safe on an already-provisioned database. Do not invent a conflicting schema.

```bash
npm run db:generate   # drizzle-kit generate — writes SQL under drizzle/
npm run db:migrate    # applies baseline SQL; refused unless DATABASE_URL is a real Neon URL
```

### Auth0 (email + Google)

The app is already provisioned on tenant **`focusotter-demos.us.auth0.com`** (email + Google connections only). Copy `.env.example` and inject secrets from shared-box / Vercel — do not invent or commit `AUTH0_SECRET` or `AUTH0_CLIENT_SECRET`.

Public application settings:

| Setting | Value |
| --- | --- |
| Domain / issuer host | `focusotter-demos.us.auth0.com` |
| Issuer | `https://focusotter-demos.us.auth0.com` |
| Client ID | `ZNevIeCZyDRADUp1zQ3811oIJp14BcVS` |
| SDK | `@auth0/nextjs-auth0` v4 |
| Local callback | `http://localhost:3000/auth/callback` |
| Production app | `https://5-1-mentor.vercel.app` (Vercel project `5-1-mentor`) |
| Production callback | `https://5-1-mentor.vercel.app/auth/callback` |
| Connections | Database (email) + Google |

Dashboard URLs that must stay registered:

1. Allowed Callback URLs:
   - `http://localhost:3000/auth/callback`
   - `https://5-1-mentor.vercel.app/auth/callback`
2. Allowed Logout URLs:
   - `http://localhost:3000`
   - `https://5-1-mentor.vercel.app`
3. Allowed Web Origins / Allowed Origins (CORS):
   - `http://localhost:3000`
   - `https://5-1-mentor.vercel.app`

Environment variables (see `.env.example`):

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon connection string (injected; not committed) |
| `AUTH0_SECRET` | Session cookie secret from shared-box (not committed) |
| `AUTH0_CLIENT_SECRET` | Application secret from shared-box (not committed) |
| `AUTH0_DOMAIN` | `focusotter-demos.us.auth0.com` |
| `AUTH0_ISSUER_BASE_URL` | `https://focusotter-demos.us.auth0.com` (alias for domain) |
| `AUTH0_CLIENT_ID` | `ZNevIeCZyDRADUp1zQ3811oIJp14BcVS` |
| `APP_BASE_URL` | `http://localhost:3000` locally; `https://5-1-mentor.vercel.app` in production (injected on Vercel) |
| `AUTH0_BASE_URL` | Alias for `APP_BASE_URL` |

Session routes are mounted by `proxy.ts` (Next.js 16 network boundary) using the v4 paths: `/auth/login`, `/auth/logout`, `/auth/callback`. API routes read the session via `@auth0/nextjs-auth0`. Unauthenticated calls return **401**. The first authenticated `/api/me/*` request upserts `app_users` and creates default preferences + progress rows.

- `GET` / `PUT` `/api/me/preferences` → `{ liberoEnabled, roleNames }`
- `GET` / `PUT` `/api/me/progress` → `{ completed, lastRotation, lastMode, lastAlternate, lastStep }`
- `POST` `/api/me/shares` (auth) → `{ url, token, expiresAt }` — `url` is `{APP_BASE_URL}/share/{token}` (prod example: `https://5-1-mentor.vercel.app/share/{token}`)
- `GET` `/api/shares/{token}` (public preview) → `{ roleNames, liberoEnabled, expiresAt }` — 404 if missing, revoked, or expired; no owner PII
- `POST` `/api/me/shares/{token}/import` (auth) → overwrites the importer’s `{ liberoEnabled, roleNames }`
- `DELETE` `/api/me/shares/{token}` (auth, owner) → soft-revoke (`revoked_at`); 403 if not the owner

Until Auth0 + Neon env vars exist, the homepage guest session is local and quiz/guided progress stays in the browser.

### Test signed-in prefs / progress

1. Copy `.env.example` to `.env.local` and inject `AUTH0_SECRET`, `AUTH0_CLIENT_SECRET`, and `DATABASE_URL` (do not invent values). Side Quests injects these on Vercel for `https://5-1-mentor.vercel.app`.
2. `npm run dev` or open production `https://5-1-mentor.vercel.app`. Header **Sign in** (home also has Email / Google) → Auth0 → callback `/auth/callback` (prod: `https://5-1-mentor.vercel.app/auth/callback`).
3. Explore: toggle libero, edit a player name (always-visible **Name your lineup**), change rotation/mode/passing look. Reload — values should return.
4. Guided: open a later lesson, reload `/guided` — same lesson.
5. Quiz: finish a run, reload — best score persists.
6. Sign out — guest mode uses `localStorage` only; `/api/me/*` returns 401.
7. Desktop: Explore should show court and rotation/mode controls in one viewport (no scroll ping-pong). Passing looks show coach-language help.
