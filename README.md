# FaZe Blackbox — HackUTA 2026 · FaZe Clan Sponsor Challenge

**Unlock the Past. Build the Next Generation.**

A cooperative two-player mystery vault. One player holds the history, the other holds the puzzle. Neither can solve it alone.

- **Player 1 — Legacy Agent:** longtime fan, sees historical clues the other player cannot see.
- **Player 2 — New Recruit:** new fan, holds the locked puzzle and the only keypad.
- Three stages, three historical reveals, one final vault unlock — both screens update in real time.

> Fan-made hackathon demo concept. Not affiliated with or endorsed by FaZe Clan. No historical FaZe facts are invented: puzzle reveals are clearly-labelled timeline slots to be filled with the sponsor-provided official 2010–2026 timeline. Sponsored episodes shown in the app are hypothetical / illustrative only.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — puzzle validation + room codes
npm run build      # tsc + vite build
```

No keys needed to play: without Supabase env vars the app runs in **demo-local mode** (two tabs on one device sync via BroadcastChannel + localStorage).

## Test it with two players (2 minutes)

1. Tab A: enter a name → **Create Room — as Legacy Agent** → copy the 6-character code.
2. Tab B (second tab / second device on the demo): enter a name → paste the code → **Join Room**. You automatically become New Recruit.
3. The game starts automatically. Legacy reads their clue out loud; Recruit enters the answer.
4. Stage answers (demo): **1: FAZE · 2: CLAN · 3: VAULT** — each is only solvable by combining both players' screens.
5. After Stage 3 the vault animation plays and both players get a shareable achievement.

Solo? Use **Practice solo** on the landing page — it shows both sides so a judge can test alone.

## Tech stack

React 19 + Vite + TypeScript + Tailwind CSS · Supabase (PostgreSQL + Realtime + Edge Functions) · Vercel

## Supabase setup (optional, for cross-device realtime + server validation)

```bash
cp .env.example .env.local   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
supabase db push             # applies supabase/migrations/001_init.sql
supabase functions deploy validate-answer
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...   # Edge Function only — NEVER in the frontend
```

Schema, RLS and the Edge Function are in `supabase/`. Answers are stored **only as SHA-256 hashes** — no plaintext answers in the client, and the service-role key never ships to the browser. When Supabase is configured, `validateAnswerServer()` is tried first and the client-side hash check is only the offline fallback.

## Project structure

```
src/
  App.tsx            # landing, lobby, game, completion — full state machine
  lib/puzzles.ts     # 3 stages, role-separated clues, SHA-256 validation
  lib/rooms.ts       # room codes, lobby, BroadcastChannel/localStorage sync
  lib/supabase.ts    # Supabase client + server validation call
  lib/puzzles.test.ts
supabase/
  migrations/001_init.sql
  functions/validate-answer/index.ts
DEVPOST.md           # full Devpost submission draft
DEPLOYMENT.md        # Vercel + GitHub steps
```

## Business model

Sponsored weekly mystery episodes (a brand sponsors an episode; fans complete branded challenges and unlock digital rewards), premium fan experiences, merch partnerships, and brand-sponsored competitions. Retention: weekly episodes, completed-mission history, shareable achievements, invite links. All partnerships in this demo are hypothetical and labelled as such.

## Team

Sukhman Singh (Sukhman-Singh007) + Akumar1313 — UNT, HackUTA 2026.
