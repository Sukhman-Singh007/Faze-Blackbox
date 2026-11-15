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

## More ways to play (added 2026-11-14 evening)

Daily play is free in every mode. All four modes are live on the landing page.

### Daily Match Point — 90-second esports strategy game
Three rounds, six shared credits. Legacy sees opponent tendencies and a warning about the next round; Recruit sees the plays, their costs, and locks the team's choice. Save is free (costs 0, loses the round) so a team can always finish even if it spends all its credits early. After each round the outcome is explained in one sentence. The results screen shows rounds won, credits left, and the score (100 per round won + 10 per unused credit + 1 per three seconds remaining, up to 30 time points).
- Everyone gets the same challenge for a given UTC day (`mp-YYYY-MM-DD`). Three daily scenarios rotate (`src/lib/matchpoint.ts`): Ironwall Five, Blitzline, Ghost Shift. The same play wins in one scenario and loses in another — Rush beats a passive opponent and loses to a stack — and the Legacy dossier always says why.
- Two-tab co-op reuses the room system (create a Match Point room; same codes, seats, session recovery). Solo practice has a role switcher.

### Sports Quick Play — five-question rounds
NBA, NFL, soccer and esports, or a mixed round. 24 original questions (6 per category) with a short explanation and source after every answer. The set rotates by date (seeded shuffle), so everyone gets the same five questions on a given day and a round never repeats a question.
- **To add questions:** edit the one file `src/lib/quickplay.ts` — copy a block, give it a unique id, keep `answer` pointing at the right option. Tests enforce ≥4 questions per category and a valid answer index.

### Saturday Challenge — free weekly event
Opens every Saturday at 12:00 p.m. Central Time and stays open through Sunday. Everyone plays the same challenge for the week (two Saturday scenarios rotate). The event card publishes the scoring rules (same formula as Match Point), shows a live countdown, and offers a labelled preview playable any day — preview scores do not count. Scores are stored only in the browser, so personal bests are labelled "Personal best on this device." The revised scoring starts a fresh local best so earlier scores are not compared on a different scale.
- **Cash prizes:** the default build collects no entry fees and promises no payout. The card shows an optional "Cash prize preview" that is clearly labelled as an example. A real prize event would need confirmed funding, published contest rules, and server-verified results.

### Challenge a Friend + Discord
Every results screen has **Challenge a Friend**: it copies a short score message and a link to the exact challenge (`?challenge=<id>`). The link carries only a challenge ID — no answers, no player names, no scores. Opening it on another device starts an independent run on the same challenge. Works for Daily Match Point (`mp-…`), Saturday (`sat-…`) and Sports Quick Play (`qp-…`). Challenge IDs are separate from room codes.
- **Discord:** the invite URL is configurable in `src/lib/config.ts` (`DISCORD_INVITE_URL`). It is empty by default, so the app shows only the working copy-link button — players paste challenges into Discord, group chats, or messages. Set the URL to a real invite to enable the "Join our Discord" button.

### Creator Challenge Pack — proposed $4.99 one-time
Daily play stays free. The pack offers five extra co-op challenges one buyer can play with a friend. One sample ("The Comeback Kings") is playable now via **Play sample**; the other four are labelled **PLANNED**. **I'm interested** is a demo action — no payment is taken.

### Sponsor placement + honest counts
One clearly labelled example sponsor placement appears after the score, never during gameplay: a gaming brand could pay a flat fee to sponsor a Saturday Challenge and get a report on starts, completions and offer clicks. The counts shown are real but local-only (`src/lib/stats.ts`, localStorage) and always labelled "on this device". Nothing is sent to a server, and no count is displayed that is not actually tracked.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — 65 tests: puzzles, rooms, Match Point outcomes/timer/scoring, Quick Play rotation, challenge links, Saturday window/countdown
npm run build      # tsc + vite build
```

No keys needed to play: the app runs in **demo-local mode** (two tabs on one device sync via BroadcastChannel + localStorage).

## Test it with two players (2 minutes)

1. Tab A: enter a name → **Create Room — as Legacy Agent** → copy the 6-character code.
2. Tab B (second tab): enter a name → paste the code → **Join Room**. You automatically become New Recruit.
3. The game starts automatically. Legacy reads their dossier out loud; Recruit asks the right question and enters the answer.
4. After Stage 3 the vault animation plays and both players get a shareable achievement. The timer on the completion screen measures gameplay only — from the moment the second player joined to the vault opening. Lobby waiting time doesn't count.
5. A completed room code cannot be reused: joining it again shows "That room already finished its mission. Create a new room to play again." From the completion screen, **Invite a friend to play** creates a fresh room and copies its invite link — it never invites anyone into the finished room.

Solo? Use **Practice solo** on the landing page — it shows both sides so a judge can test alone (with a role switcher).

## Tech stack

React 19 + Vite + TypeScript + Tailwind CSS · Supabase (PostgreSQL + Edge Functions — code in repo, not live) · Vercel. **Implemented vs proposed:** the vault, Daily Match Point (co-op + solo + challenge links), Sports Quick Play, the Saturday Challenge (open window + preview + countdown + personal best on this device), the Creator Pack sample, and the example sponsor placement are implemented and tested. Cross-device multiplayer, Episode 02, the remaining four pack challenges, real prize payouts, and any sponsorship are proposed / not yet built — and are labelled as such in the app.

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
  lib/rooms.ts       # room codes, lobby, BroadcastChannel/localStorage sync (+ Match Point rooms)
  lib/supabase.ts    # Supabase client + server validation call
  lib/matchpoint.ts  # Daily Match Point: scenarios, outcome matrix, credits, 90s clock, scoring
  lib/quickplay.ts   # Sports Quick Play: the question bank (edit here) + date rotation
  lib/challenges.ts  # friend challenge links (?challenge=<id>)
  lib/saturday.ts    # Saturday Challenge: CT open window, countdown, personal best
  lib/config.ts      # Discord invite URL, pack price (edit here)
  lib/stats.ts       # on-this-device interaction counts (localStorage only)
  lib/clipboard.ts   # copy helper for the new games
  components/
    MatchPointGame.tsx  # shared Match Point presentation (room + local runs)
    QuickPlayGame.tsx   # five-question rounds + explanations
    SaturdayCard.tsx    # weekly event card, countdown, prize preview
    PackCard.tsx        # Creator Challenge Pack offer + sample
    SponsorSlot.tsx     # labelled example sponsor placement
  lib/*.test.ts      # unit tests (65 total)
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

Sponsored weekly mystery episodes (a brand sponsors an episode; fans complete branded challenges and unlock digital rewards), premium fan experiences, merch partnerships, and brand-sponsored competitions. Retention: weekly episodes, completed-mission history, shareable achievements, invite links — plus the new daily and weekly loops: a Daily Match Point every day, Sports Quick Play rounds, and the Saturday Challenge. New in this build: a proposed $4.99 one-time Creator Challenge Pack (five extra co-op challenges; one sample playable now, rest planned) and a flat-fee Saturday Challenge sponsorship with a report on starts, completions and offer clicks (counts tracked only in the browser and labelled "on this device"). All partnerships, pack pricing and prize previews in this demo are hypothetical / illustrative only — no existing sponsorships, no revenue yet, no entry fees collected, no payout promised. A real prize event would need confirmed funding, published contest rules, and server-verified results.

## Team

Sukhman Singh (Sukhman-Singh007) + Akumar1313 — UNT, HackUTA 2026.
