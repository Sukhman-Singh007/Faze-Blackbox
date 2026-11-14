# FaZe Blackbox — HackUTA 2026 · FaZe Clan Sponsor Challenge

**Unlock the Past. Build the Next Generation.**

A cooperative two-player mystery vault. One player holds the history, the other holds the puzzle. Neither can solve it alone.

- **Player 1 — Legacy Agent:** longtime fan, sees dated historical dossiers the other player cannot see.
- **Player 2 — New Recruit:** new fan, holds the question and the only keypad.
- Three stages, three real historical reveals, one final vault unlock — both screens update in real time (same device, two tabs).

> Fan-made hackathon demo concept. Not affiliated with or endorsed by FaZe Clan. Every historical fact in the game comes from the sponsor-provided "FaZe Clan: A Timeline, 2010–2026" — see `TIMELINE.md`. Nothing historical was invented. Sponsored episodes shown in the app are hypothetical / illustrative only.

## The puzzles (verified history, real reasoning)

| Stage | Era | The puzzle | Answer |
|---|---|---|---|
| 1 — The First Key | 2010–2013 | Legacy's founding file lists three names for the crew; Recruit must get the May 2010 original name and take the first four letters of its second word. | SNIP |
| 2 — The Shared Roof | 2014–2017 | Legacy's dossier has four entries; only the 2014 one is about where the crew lived. Recruit asks for it and names the place. The answer word appears nowhere in either player's text. | HOUSE |
| 3 — The Crest | 2018–2026 | Each player counts the world-title wins in their own list (festival titles, cumulative awards and runner-up finishes don't count). Legacy counts 3, Recruit counts 2; the answer is the sum, spelled out. | FIVE |

Each stage has three progressive hints, revealed one at a time. A first-time player solved all three from the clues alone in live testing (2026-11-14) — no prior instructions.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — 21 tests: puzzle validation, design rules, room codes
npm run build      # tsc + vite build
```

No keys needed to play: the app runs in **demo-local mode** (two tabs on one device sync via BroadcastChannel + localStorage).

## Test it with two players (2 minutes)

1. Tab A: enter a name → **Create Room — as Legacy Agent** → copy the 6-character code.
2. Tab B (second tab): enter a name → paste the code → **Join Room**. You automatically become New Recruit.
3. The game starts automatically. Legacy reads their dossier out loud; Recruit asks the right question and enters the answer.
4. After Stage 3 the vault animation plays and both players get a shareable achievement.
5. A completed room code cannot be reused: joining it again shows "That room already finished its mission. Create a new room to play again."

Solo? Use **Practice solo** on the landing page — it shows both sides so a judge can test alone (with a role switcher).

## Tech stack

React 19 + Vite + TypeScript + Tailwind CSS · Supabase (PostgreSQL + Edge Functions — code in repo, not live) · Vercel

## Backend & security — what is actually running

**Inspected 2026-11-14 (see `AUDIT.md`):** the deployed app uses **browser-local state only** — rooms live in `localStorage`, sync via `BroadcastChannel` + `storage` events (`src/lib/rooms.ts`). Supabase code, the migration and the Edge Function exist in the repo but are **not configured on the live deployment** (no `VITE_SUPABASE_URL` set), so **cross-device multiplayer does not work and is not claimed to work** — two tabs on one device is the tested path.

Known security limits of the demo (documented in `AUDIT.md`, to fix with the Supabase phase): client-side SHA-256 validation of short words is brute-forceable; the client advances its own stage; the Edge Function does not yet check role/room/stage or rate-limit; the migration's room policy is `using (true)`. No secret keys are in the repo or the client bundle (`.env.example` lists only public anon values; the service-role key is Edge-Function-only). Player seats are claimed by an opaque per-player token stored per-tab in `sessionStorage`, so a refresh restores the same seat and a stranger cannot take an occupied one.

## Supabase setup (optional, for cross-device realtime + server validation)

```bash
cp .env.example .env.local   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
supabase db push             # applies supabase/migrations/001_init.sql
supabase functions deploy validate-answer
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...   # Edge Function only — NEVER in the frontend
```

Note: setting these variables alone does **not** switch rooms to Supabase — `RoomStore` is still local. Moving rooms to Supabase Realtime channels is the next engineering step (see `AUDIT.md` §7); it is deliberately not claimed as done.

## Project structure

```
src/
  App.tsx            # landing, lobby, game, completion — full state machine
  lib/puzzles.ts     # 3 stages, role-separated dossiers, SHA-256 validation, hints
  lib/rooms.ts       # room codes, lobby, BroadcastChannel/localStorage sync
  lib/supabase.ts    # Supabase client + server validation call
  lib/puzzles.test.ts
  lib/rooms.test.ts
supabase/
  migrations/001_init.sql
  functions/validate-answer/index.ts
AUDIT.md             # Phase 1 audit: real vs mockup, security, prioritized plan
TIMELINE.md          # timeline source, per-stage facts, design decisions
DEVPOST.md           # full Devpost submission draft
DEPLOYMENT.md        # Vercel + GitHub steps
JUDGING_DEMO.md      # 3-minute judging script
```

## Business model

Sponsored weekly mystery episodes (a brand sponsors an episode; fans complete branded challenges and unlock digital rewards), premium fan experiences, merch partnerships, and brand-sponsored competitions. Retention: weekly episodes, completed-mission history, shareable achievements, invite links. All partnerships in this demo are hypothetical and labelled as such.

## Team

Sukhman Singh (Sukhman-Singh007) + Akumar1313 — UNT, HackUTA 2026.
