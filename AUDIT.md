# FaZe Blackbox — Phase 1 Audit (2026-11-14)

> **Status note (2026-11-15):** this is the Phase 1 snapshot, written before Phases 2–8. Two things in it are now stale — §2.2 and §4 describe the original puzzles (answers FAZE / CLAN / VAULT), which Phase 3 replaced with SNIP / HOUSE / FIVE (`src/lib/puzzles.ts`, `TIMELINE.md`); and §1's "17/17 unit tests" is now **65 tests, all passing** (verified 2026-11-15, `npm test`). The §3 misleading-claim items were addressed in the Phase 8 docs rewrite. The security findings in §2 still stand and are the basis for the Supabase phase.

Audited by Mica (lead designer / engineer / QA). Live site verified 200 at
https://faze-blackbox.vercel.app/ during this audit. Timeline source:
official sponsor doc "FaZe Clan: A Timeline, 2010–2026"
(https://docs.google.com/document/d/1HI-h6v38zGZaYzV_yc1G7u0NIec8pBerYdqO3z6mjQ4/edit)
— read in full via the public export (1,774 lines). Every historical fact
used below comes from that document; nothing was invented.

## 1. Real vs mockup

### Real and tested
- Landing, create/join with 6-char codes, two-player lobby, invite link
  (`?room=CODE`), role-specific screens (Legacy: clues, no keypad;
  Recruit: puzzle + only keypad), solo practice mode.
- 3 playable stages, wrong-answer rejection, attempts counter, timer
  anchored to room `startedAt`, refresh/reconnect via per-tab
  sessionStorage + opaque playerId seat tokens (a stranger cannot take
  an occupied seat), completion + shareable achievement, completed-mission
  history, "Play again" starts a fresh room.
- 17/17 unit tests (Vitest), `tsc` + Vite production build pass.
- Live browser tests (Nov 14, desktop): solo playthrough, wrong answers,
  refresh restore, invite copy — all PASS. Mobile 390px never tested
  (cloud browser cannot resize).

### Mockup / not live
- **Supabase backend is dead code in production.** `src/lib/supabase.ts`
  only calls `validate-answer`; no Supabase room reads/writes and no
  Realtime subscription exist anywhere. `RoomStore` is always
  localStorage + BroadcastChannel. Cross-device play has never worked
  and is not wired, despite comments/docs implying it "takes over when
  configured".
- Episode 02/03 are previews only (labelled correctly).
- Historical reveals are placeholder slots, not history (fixed in Phase 2).

## 2. Security problems (priority order)

1. **Fail-open validation (critical).** `App.tsx` `submit()`:
   `const ok = server ?? (await validateAnswer(...))` — any Supabase
   error, timeout, or missing config silently falls back to the
   client-side hash check. A failed server must fail closed.
2. **Answers are effectively public.** `puzzles.ts` ships SHA-256 hashes
   of 4–5 letter words (FAZE/CLAN/VAULT) plus the clue text that spells
   them out. Short-word SHA-256 is brute-forceable in seconds; the hash
   hides nothing. Only server-side validation with the hash held
   server-side fixes this. The new puzzles (Phase 3) must not put the
   answer, or anything that directly spells it, in the client bundle.
3. **Client advances its own stage.** After any "ok", the client writes
   `stage`/`status='completed'` to localStorage itself
   (`App.tsx:364-371`). There is no server authority over progression.
4. **Edge Function is not authoritative either.** `validate-answer`
   does not check: the guesser is in the room, their role, that
   `stage_id` equals the room's current stage, or attempts. It reads
   the room then updates it in two steps (race on simultaneous
   submissions — no atomic `stage = stage+1 where stage = X`). No rate
   limiting, no auth. Anyone who knows a room code can brute-force a
   4-letter answer through it.
5. **RLS is wide open on rooms.** Migration `001_init.sql`: rooms
   `select using (true)` and `for all using (true)` — anyone with the
   anon key can read/write any room, including setting `stage=4`.
   `stage_answers` is correctly `select using (false)`.
   `completed_missions` insert is `with check (true)` (spammable).
6. **No room expiry.** Rooms live in localStorage forever; no TTL,
   no cleanup. A completed room code can be re-entered (join correctly
   rejects it with an error, but the code never expires from history).

## 3. Misleading claims (must fix in Phase 8)

- `DEVPOST.md` "How we built it": "in production by a Supabase Edge
  Function" — false on the live deployment. "real-time sync" without
  the same-device qualifier. "Built with: Supabase Realtime" — the
  Realtime client is never instantiated.
- `README.md` stack line lists Supabase Realtime as if live; the
  "Backend & security" section is honest and should be kept as the
  model for the other docs.
- `App.tsx` game footer: "Backend: … (Supabase Realtime)" when env
  vars are set — but setting them changes nothing about rooms.
- `JUDGING_DEMO.md` Q&A is honest; keep it, update after Phase 5.
- Footer: "Historical timeline slots are placeholders" — becomes
  false after Phase 2; must be replaced with a source credit.

## 4. Puzzle quality (current)

- Stage 1: Legacy's card literally spells FAZE (first letters of
  FALCON/ALPHA/ZENITH/ECHO); Recruit's scrambled letters are the same
  word. Solvable by one player reading the other's screen — and by
  anyone who opens the client bundle.
- Stage 2: same pattern (numbers map straight to CLAN).
- Stage 3 (split-key) is the only genuinely cooperative puzzle, but
  the conversion is trivial and the hint gives the answer away
  ("the word is what you have been opening all along").
- No progressive hints (one static hint per stage), no hint
  accessibility, no first-time-player solvability test.
- Stage 1–2 cooperation is interface-enforced only, not
  reasoning-enforced.

## 5. Visual / accessibility

- Generic dark cards + red buttons; emojis as icons (👤 🔓 🏆);
  repeated "scanlines" + glow; no custom artwork (logo is a red
  square with "F"); marketing copy is AI-generic in places.
- No `prefers-reduced-motion` support (vault animation + `animate-pulse`
  run unconditionally). Only `role="alert"` exists for a11y; no
  focus-visible styles, no skip link, no aria for the vault animation
  or timer. Keyboard flow is otherwise OK (inputs are labelled).
- No loading state for the Supabase path; error states exist but are
  plain text. Mobile 390px untested.

## 6. Other known bugs / gaps

- `isValidRoomCode` rejects lowercase codes as typed (join does
  `.toUpperCase()` first, so this only bites direct calls — minor).
- Solo mode mutates a room object created by `roomStore.create`
  before saving (works, but fragile).
- `startSolo` reuses the same `playerId` for both seats.
- No integration/E2E tests in the repo — browser tests were manual
  and are not committed. No test for simultaneous submissions,
  completed-room rejoin, or expired rooms.
- `DEVPOST.md` still contains template placeholders (lowercase GitHub
  URL, "<Vercel URL after deploy>").

## 7. Prioritized plan

### P0 — must do before Devpost (deadline 11:59 PM Nov 14)
1. **Phase 2+3 (story + puzzles):** three-era story from the verified
   timeline; new reasoning puzzles; answers never derivable from
   client data alone. See §8.
2. **Phase 4 (visual, scoped):** dossier/vault art direction, custom
   SVG mark, remove emojis, reduced-motion + focus styles, 390px check.
3. **Phase 7 (QA):** unit tests for new puzzles, build, live browser
   E2E desktop + mobile, both host combinations, refresh, wrong
   answers, completed-room rejoin.
4. **Phase 8 (docs):** README/DEVPOST/JUDGING_DEMO rewritten to match
   the real product; no fabricated claims; Devpost submitted.

### P1 — do if time remains before the deadline
5. **Phase 5 (real Supabase, stretch):** Supabase project + migration
   (fixed RLS) + hardened Edge Function (fail-closed, atomic
   progression, role/room checks, rate limit) + Realtime rooms +
   Vercel env vars + cross-device test. Requires Sukhman's dashboard
   actions (see §9) — cannot be faked. Demo-local stays as the
   labelled fallback either way.

### P2 — after the deadline
6. Room expiry/cleanup, committed E2E tests, leaderboards, Episode 02.

## 8. Phase 2 story spine (from the verified timeline only)

Three eras, one per stage. Sensitive material in the doc (lawsuit,
crypto scandals, mental-health disclosures, the 2025 exodus) is
deliberately NOT used — this is a fan game about the milestones.

- **Stage 1 — 2010–2013, "The First Key":** founded May 2010 as
  FaZe Sniping by Eric "ClipZ" Rivera, Jeff "House Cat" Emann and
  Ben "Resistance" Christensen; first upload "FaZe Sniping Intro"
  May 31, 2010 (475,099 views); ILLCAMS Ep 1 Jun 2, 2010; Temperrr
  joins Aug 3, 2010 and the logo is his concept; 1M-subscriber
  teamtage Oct 8, 2012 — 12.1M views, the biggest video in FaZe
  history. Proposed answer word: **SNIP** (4) — the crew's first
  name, FaZe Sniping, derived from the founding facts, not printed
  as the answer anywhere.
- **Stage 2 — 2014–2017, "The House and the Superteam":** first
  content house opens 2014 in Plainview, NY; #FAZE5 returns Apr 20,
  2014 with G FUEL; FaZe buys G2's CS:GO roster Jan 2016 (~$700K);
  NiKo signed Feb 2017 (~$500K buyout); 2017 superteam (GuardiaN,
  olofmeister, NiKo, rain, karrigan) wins ELEAGUE Premier Oct 2017
  ($500K). Proposed answer word: **HOUSE** (5) — where the crew
  started living and filming together.
- **Stage 3 — 2018–2026, "The Five Stars" (finale):** the crest
  stars. Each star is a first place at the defining world event of
  its game: ★1 Aug 22, 2021 CDL Championship (Atlanta FaZe);
  ★2 May 22, 2022 PGL Major Antwerp (CS:GO); ★3 Oct 15, 2023 Halo
  World Championship; ★4 Feb 16, 2025 Six Invitational; ★5 Feb 15,
  2026 Six Invitational (first org to defend it). The puzzle is
  discrimination: each player's dossier mixes star wins with
  non-star wins (IEM Katowice 2022, Intel Grand Slam 2023, EWC
  titles 2024/2026, CDL 2026 Vegas) — together they must pick
  exactly the five star events. Proposed answer word: **STARS** (5). — CHANGED during implementation (2026-11-14): answer is **FIVE** (4). STARS appears in the puzzle's own text and would be copyable without doing the discrimination; FIVE requires combining both players' counts (3 + 2) and appears nowhere in either dossier. The Five Stars theme lives in the reveal.
  Source note: the star mapping is the timeline doc's own
  reconstruction from crest files + results record ("an inference
  from the record rather than a statement from the organisation") —
  the game must credit it that way, not as an official FaZe claim.
- Source credit in-app + README: "History from 'FaZe Clan: A
  Timeline, 2010–2026' (sponsor-provided), sourced to FaZe Clan
  YouTube, Liquipedia, Forbes and others. Fan-made demo; not
  affiliated with or endorsed by FaZe Clan."

## 9. What I need from Sukhman (nothing secret, nothing in chat)

1. **Approve the plan above** — especially the new answer words
   SNIP / HOUSE / STARS and the "Five Stars" finale (or propose
   alternatives). This is the one creative decision that gates
   Phases 2–3.
2. **Phase 5 (only if we attempt it):** create a Supabase project
   yourself in the dashboard (I will give baby steps), then give me
   the project URL + anon key via the secure flow — never paste the
   service-role key anywhere. The Edge Function secret is set in the
   Supabase dashboard, not in Vercel. If this does not happen, we
   ship demo-local only and say so honestly.
3. **Devpost:** you submit; I will hand you the finished copy.
