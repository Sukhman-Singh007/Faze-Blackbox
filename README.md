# FaZe Blackbox — HackUTA 2026 · FaZe Clan Sponsor Challenge

**Unlock the Past. Build the Next Generation.**

FaZe Clan has two kinds of fans — longtime fans who lived its history and a new generation just discovering it — but nothing puts those two groups on the same team. FaZe Blackbox is a cooperative mystery vault that only opens when a longtime fan and a new fan play together.

**Live demo:** https://faze-blackbox.vercel.app/ · **Repo:** https://github.com/Sukhman-Singh007/Faze-Blackbox

> Independent student submission for the HackUTA 2026 FaZe Clan sponsor challenge — not an official FaZe Clan product, and not affiliated with or endorsed by FaZe Clan. Every historical fact in the game comes from the sponsor-provided "FaZe Clan: A Timeline, 2010–2026" — see `TIMELINE.md`. Sponsored episodes and prizes shown in the app are hypothetical / illustrative only.

## The game in 30 seconds

**1. History Vault — the core (Implemented).** A two-player mystery vault in three stages. The Legacy Agent (longtime fan) sees a dated historical archive the other player cannot see; the New Recruit (new fan) holds the puzzle and the only keypad. Each stage can only be solved by combining information from both sides — in Stage 2 the answer word appears in neither player's text, and in Stage 3 neither side alone can compute the answer. Solo practice lets one player switch roles and see both sides. Three progressive hints per stage; a first-time player solved all three from the clues alone in live testing (2026-11-14).

| Stage | Era | The puzzle | Answer |
|---|---|---|---|
| 1 — The First Key | 2010–2013 | Legacy's founding file lists three names for the crew; Recruit must get the May 2010 original name and take the first four letters of its second word. | SNIP |
| 2 — The Shared Roof | 2014–2017 | Legacy's dossier has four entries; only the 2014 one is about where the crew lived. Recruit asks for it and names the place. The answer word appears nowhere in either player's text. | HOUSE |
| 3 — The Crest | 2018–2026 | Each player counts the world-title wins in their own list (festival titles, cumulative awards and runner-up finishes don't count). Legacy counts 3, Recruit counts 2; the answer is the sum, spelled out. | FIVE |

**2. Daily and weekly return loop (Implemented).** Daily Match Point — a 90-second esports strategy game with a new opponent every day. Sports Quick Play — five-question rounds across NBA, NFL, soccer and esports, same questions for everyone each day. Saturday Challenge — a free weekly event with a countdown, published scoring rules and a labelled preview. Challenge a Friend — every results screen copies a link to the exact challenge. Details in `JUDGING_DEMO.md` and `DEVPOST.md`.

**3. Monetization (Proposed).** Daily play stays free. A proposed $4.99 one-time Creator Challenge Pack (five extra co-op challenges; one sample playable now, the rest labelled planned) and a flat-fee Saturday Challenge sponsorship with a report on starts, completions and offer clicks. See [Illustrative revenue assumptions](#illustrative-revenue-assumptions).

## Challenge Deliverables

### 1. User problem

FaZe Clan's audience splits into longtime fans who know the history and new fans discovering it now, and the two groups rarely play together. A new fan has no natural way into the history, and a longtime fan has no reason to teach it. The product insight is that cooperation itself can be the onboarding: make the history the thing the two players need from each other, so every game turns a new fan into a FaZe fan. No user research was conducted during the hackathon — this is a product judgement from the sponsor brief and the timeline, not a research finding.

### 2. Experience and priority features

Priorities, in order:

1. **History Vault (Implemented)** — the cooperative core described above. Two roles, three stages, real historical reveals, progressive hints, vault-unlock animation, shareable achievement.
2. **Daily and weekly return loop (Implemented)** — Daily Match Point, Sports Quick Play and the Saturday Challenge, each with Challenge a Friend links so one player brings the next one in.
3. **Monetization (Proposed)** — Creator Challenge Pack and Saturday sponsorship, both labelled as proposals in the app; no payment is taken, no entry fees collected, no payout promised.

### 3. Who it's for

- **Legacy Agent — the longtime fan.** Knows FaZe history, wants a game that rewards that knowledge and a reason to bring a friend in.
- **New Recruit — the new fan.** Discovering FaZe now, wants a fast, social way in that doesn't require knowing the history first.
- **The solo visitor.** Sports Quick Play and solo practice give a single player something to do alone, with the same FaZe tie-in (one esports question is FaZe's founding year).

### 4. Why it resonates

The vault makes the two audiences need each other: the longtime fan's knowledge is the key, and the new fan's fresh eyes do the reasoning. Stage 3 is the clearest example — Legacy counts 3 world-title wins, Recruit counts 2, and the answer only exists when both counts are combined. That is a game mechanic, not a quiz: the cooperation is in the reasoning, not just on the screen. The daily and weekly loops then give both players a reason to come back and to bring friends, instead of a one-off playthrough.

### 5. Revenue

Daily play is free. Two proposed streams, both labelled as proposals in the app and modelled below: a $4.99 one-time Creator Challenge Pack (sample playable now, paid pack proposed) and a flat-fee Saturday Challenge sponsorship. The cash-prize preview on the Saturday card is an example only — this build collects no entry fees and promises no payout. A real prize event would need confirmed funding, published contest rules and server-verified results. There are no sponsors, no sales and no revenue yet.

## How this maps to the judging criteria

| Judging criterion | Evidence in this repo |
|---|---|
| 1. Audience and problem | Two roles built for the two real FaZe audiences — Legacy Agent (longtime fan) and New Recruit (new fan) — in `src/App.tsx` and `src/lib/puzzles.ts`; the landing page names both and explains why they need each other. No user research was run; the audience split comes from the sponsor brief and the timeline. |
| 2. Creativity | A cooperative vault where the answer is split across two players' information, not just their screens — Stage 2's answer word appears in neither player's text; Stage 3's answer is a sum neither side can compute alone (`src/lib/puzzles.ts`). Daily Match Point adds a second original mechanic: the same play wins in one scenario and loses in another, and the dossier explains why (`src/lib/matchpoint.ts`). |
| 3. Prioritization | With 24 hours and no backend credentials on demo day, we built the local transport first (two tabs, no keys) so the game always works, and kept Supabase as code in the repo for the next step (`AUDIT.md` §7). New modes reuse the same room/transport code instead of a second backend. |
| 4. Technical feasibility and MVP quality | Complete playable 3-stage game: room codes, lobby, session recovery after refresh, progressive hints, vault unlock, shareable achievement, completed-mission history — plus a working 90-second strategy game with deterministic outcomes and a published scoring formula, a 24-question trivia bank with date rotation, and a Saturday event with a real Central-Time open window. **65 automated tests pass** (`npm test`); TypeScript + production build clean. Demo-local only; answer validation is a demo-grade client-side hash check until server validation ships (see [Security](#security)). |
| 5. Engagement and growth | Weekly episode format with a reason to return; every game pairs a longtime fan with a new fan and the longtime fan teaches the new fan FaZe history to win; shareable achievements and invite links. Daily loops give solo players a reason to return too: a new Match Point challenge and a new five-question set every day, a Saturday event every week, and Challenge a Friend links that bring a friend in on the same challenge. No real players, no engagement data, no measured retention — everything about growth is a proposal, not a result. |

## Illustrative revenue assumptions

All inputs below are **hypothetical assumptions** made up for illustration — there are no real users, no sales and no sponsors yet. Outputs are **illustrative gross revenue**, not forecasts. Sharing is a growth metric, not revenue, and is kept separate from the revenue lines.

| Input | Value | Status |
|---|---|---|
| Time period | One month (4 Saturday Challenges) | Stated period |
| Eligible audience (monthly active players) | 10,000 | Hypothetical assumption |
| Play rate (actives who play ≥ 1 Saturday Challenge in the month) | 40% → 4,000 Saturday players | Hypothetical assumption |
| Share rate (Saturday players who share a challenge link) | 25% → 1,000 shares / month | Hypothetical assumption — growth metric, not revenue |
| Pack conversion (of Saturday players) | 2% of 4,000 → 80 buyers / month | Hypothetical assumption |
| Creator Pack price | $4.99 one-time | Proposed (offer labelled in the app; no payment taken) |
| Saturday sponsor flat fee | $500 per Saturday Challenge | Proposed (hypothetical fee) |

**Calculations (same one-month period):**

- Pack: 80 buyers × $4.99 = **$399.20 / month (illustrative gross revenue)**.
- Sponsorship: 4 Saturdays × $500 = **$2,000 / month (illustrative gross revenue)**.
- Combined: $399.20 + $2,000 = **$2,399.20 / month (illustrative gross revenue)**.

**Recommendation: test the Saturday sponsorship first.** It keeps the core game free, gives a sponsor a defined placement (their name on the event card and one labelled placement after the score), and produces measurable starts, completions and offer clicks. The in-app counts behind that report are implemented today and tracked only in this browser (`src/lib/stats.ts`, always labelled "on this device"); sending a report to a sponsor is proposed. The pack is the second stream to test, once the Saturday audience exists to convert.

## Growth loop

Finish a challenge → tap **Challenge a Friend** → it copies a short score message and a link to the exact challenge (`?challenge=<id>`) → a friend opens the link on their own device and starts a separate run on the same challenge → compare scores. The link carries only a challenge ID — no answers, no player names, no scores. Live co-op (two players in the same game, in real time) currently works across two tabs in the same browser. Cross-device realtime co-op is the first roadmap item. Supabase code (migration + answer-validation Edge Function) is in the repo but is **not** the live backend — the deployed app runs on browser-local state only.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — 65 tests: puzzles, rooms, Match Point outcomes/timer/scoring, Quick Play rotation, challenge links, Saturday window/countdown
npm run build      # tsc + vite build
```

No keys needed to play: the app runs in **demo-local mode** (two tabs on one device sync via BroadcastChannel + localStorage).

## Test in 2 minutes (solo)

1. Open the live demo and click **Play the vault solo**.
2. You start as the Legacy Agent. Read the archive card, then click **Switch to New Recruit** to see the puzzle and the keypad.
3. Enter **SNIP** for Stage 1, **HOUSE** for Stage 2, **FIVE** for Stage 3 (answers are also in `DEVPOST.md`).
4. After Stage 3 the vault animation plays and the completion screen shows the shareable achievement and the five-stars finale.

Two players? Open the invite in a second tab in the same browser: Tab A clicks **Create Room — as Legacy Agent** and copies the 6-character code; Tab B enters a name, pastes the code and clicks **Join Room**. The second player automatically becomes the New Recruit and the game starts. A completed room code cannot be reused — joining it again shows "That room already finished its mission. Create a new room to play again." From the completion screen, **Invite a friend to play** creates a fresh room and copies its invite link.

## What is implemented vs proposed

| Feature | Status |
|---|---|
| History Vault (3 stages, role split, hints, reveals, completion) | Implemented |
| Daily Match Point (co-op + solo + challenge links) | Implemented |
| Sports Quick Play (24 questions, date rotation) | Implemented |
| Saturday Challenge (open window + preview + countdown + personal best on this device) | Implemented |
| Creator Pack sample ("The Comeback Kings", **Play sample**) | Implemented |
| Example sponsor placement after the score (counts labelled "on this device") | Implemented |
| Creator Pack paid purchase ($4.99) | Proposed — no payment is taken |
| Saturday sponsorship (flat fee + sponsor report) | Proposed |
| Cash prize for the Saturday Challenge | Example only — no entry fees, no payout |
| Cross-device realtime co-op (Supabase) | Proposed — first roadmap item; code in repo, not live |
| Episode 02, remaining four pack challenges, leaderboards | Proposed |

## Security

Demo-local mode stores rooms in the browser and checks answers against short-word SHA-256 hashes, which is brute-forceable and fail-open — real security needs the server-side validation in the repo's Supabase code; the full technical details and limits are in `AUDIT.md`.

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

## Team

Sukhman Singh (Sukhman-Singh007) + Akumar1313 — UNT, HackUTA 2026.

*Independent student submission for the HackUTA 2026 FaZe Clan sponsor challenge. Not an official FaZe Clan product; not affiliated with or endorsed by FaZe Clan.*
