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

The UI runs without API keys; guest progress falls back to `localStorage`. Signed-in preferences and progress need Neon + Auth0 (see below).

## What ships in this MVP

- TypeScript App Router + Tailwind UI (original gym / playbook look)
- Half court, net at top; chips read `Name · Role`
- Rotation 1–6, serve | serve-receive, named passing looks (3-person, 2-person, W-pass)
- Libero on/off — **off maps L to back-row middle**
- Play-all + step/reset, optional overlap overlay
- Guided lessons, free Explore, multiple-choice Quiz
- `prefers-reduced-motion` (no chip easing; play-all still steps)
- `content/rotations/r1.json`–`r6.json` stubs (see TODO below)
- `/api/progress` local hook (client `localStorage`); signed-in data is `/api/me/*`

## Content TODO

Coordinates in `content/rotations/` are normalized stubs (`x` left→right, `y` net→endline). Replace them with film-traced or coach-approved spots. Regenerate the six files with:

```bash
node scripts/generate-rotations.mjs
```

## Auth0 + Neon backend

Copy `.env.example` to `.env.local`. **Do not commit secrets.**

### Neon (`DATABASE_URL`)

`DATABASE_URL` is injected via environment (local `.env.local` or host secrets). **Do not commit it.**

The Neon database already has `app_users`, `user_preferences`, and `user_progress`. Drizzle models in `lib/db/schema.ts` match those columns (JSON camelCase in APIs, snake_case in the database). Court formations are **not** stored in Neon.

`drizzle/0000_*.sql` is a baseline of that existing schema. It uses `CREATE TABLE IF NOT EXISTS` and only adds foreign keys when none are present, so `db:migrate` is safe on an already-provisioned database. Do not invent a conflicting schema.

```bash
npm run db:generate   # drizzle-kit generate — writes SQL under drizzle/
npm run db:migrate    # applies baseline SQL; refused unless DATABASE_URL is a real Neon URL
```

### Auth0 (email + Google)

Create a **Regular Web Application** in the Auth0 dashboard.

1. Enable the **Username-Password-Authentication** (email) and **Google** social connections.
2. Allowed Callback URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`
   - Optional preview wildcard if your tenant allows it: `https://*.vercel.app/auth/callback`
3. Allowed Logout URLs:
   - `http://localhost:3000`
   - `https://<your-vercel-domain>`
4. Allowed Web Origins / Allowed Origins (CORS):
   - `http://localhost:3000`
   - `https://<your-vercel-domain>`

Environment variables (see `.env.example`):

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `AUTH0_SECRET` | `openssl rand -hex 32` |
| `AUTH0_DOMAIN` | Tenant host, e.g. `your-tenant.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Application client ID |
| `AUTH0_CLIENT_SECRET` | Application client secret |
| `APP_BASE_URL` | `http://localhost:3000` locally; omit on Vercel previews to infer the host |
| `AUTH0_BASE_URL` | Alias for `APP_BASE_URL` |
| `AUTH0_ISSUER_BASE_URL` | Alias for `AUTH0_DOMAIN` (with or without `https://`) |

Session routes are mounted by `proxy.ts` (Next.js 16 network boundary): `/auth/login`, `/auth/logout`, `/auth/callback`. API routes read the session via `@auth0/nextjs-auth0`. Unauthenticated calls return **401**. The first authenticated `/api/me/*` request upserts `app_users` and creates default preferences + progress rows.

- `GET` / `PUT` `/api/me/preferences` → `{ liberoEnabled, roleNames }`
- `GET` / `PUT` `/api/me/progress` → `{ completed, lastRotation, lastMode, lastAlternate, lastStep }`

Until Auth0 + Neon env vars exist, the homepage guest session is local and quiz/guided progress stays in the browser.
