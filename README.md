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

No API keys are required. Auth0 and Neon are stubbed; progress falls back to `localStorage`.

## What ships in this MVP

- TypeScript App Router + Tailwind UI (original gym / playbook look)
- Half court, net at top; chips read `Name · Role`
- Rotation 1–6, serve | serve-receive, named passing looks (3-person, 2-person, W-pass)
- Libero on/off — **off maps L to back-row middle**
- Play-all + step/reset, optional overlap overlay
- Guided lessons, free Explore, multiple-choice Quiz
- `prefers-reduced-motion` (no chip easing; play-all still steps)
- `content/rotations/r1.json`–`r6.json` stubs (see TODO below)
- `/api/progress` hook for a future Neon table; client writes localStorage today

## Content TODO

Coordinates in `content/rotations/` are normalized stubs (`x` left→right, `y` net→endline). Replace them with film-traced or coach-approved spots. Regenerate the six files with:

```bash
node scripts/generate-rotations.mjs
```

## Auth0 / Neon (later)

Copy `.env.example` to `.env.local` when you are ready. Do not commit secrets.

- Auth0: implement `getSession()` inside `lib/auth.ts`
- Neon: run SQL through `lib/neon.ts` and persist `/api/progress`

Until those env vars exist, the guest session is local and quiz/guided progress stays in the browser.
