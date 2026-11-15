# FaZe Blackbox — Compliance Audit

**Date:** 2026-11-14 (evening, America/Chicago)
**Auditor:** Mica (AI agent working for Sukhman Singh), at Sukhman's request
**Scope:** Eligibility of the HackUTA 2026 FaZe Clan challenge entry, submission accuracy, and the timer / invite / victory-screen defects found during the audit.
**Status:** Audit complete. **No changes were made in this pass** — fixes are listed as proposed work below, pending Sukhman's go-ahead.

---

## 1. Hacking window — evidence

The task states the official rule as: project code, design assets, and build work must be created within the **November 14 noon – November 15 noon** hacking window (America/Chicago).

### Git history (local repo `~/workspace/faze-blackbox/`, branch `main`)

| Commit | Author date (CST) | Committer date (CST) | Subject |
|---|---|---|---|
| `260f28c` | 2026-11-14 14:50:16 | 2026-11-14 14:50:16 | FaZe Blackbox: complete playable 3-stage co-op mystery vault |
| `35e280a` | 2026-11-14 14:54:09 | 2026-11-14 14:54:09 | Remove unused binary hero asset |
| `84efb88` | 2026-11-14 15:45:21 | 2026-11-14 15:45:21 | Fix recruit-host start bug, refresh/reconnect sessions, Episode 01 scroll, Stage 3 split-key puzzle |
| `6656581` | 2026-11-14 15:48:42 | 2026-11-14 15:48:42 | Anchor game timer to room startedAt |
| `063401b` | 2026-11-14 16:05:31 | 2026-11-14 16:05:31 | Final polish: audience + business sections, upgraded victory screen, JUDGING_DEMO.md, a11y/mobile fixes |
| `e833034` | 2026-11-14 16:30:36 | 2026-11-14 16:30:36 | Phase 2+3+4: verified FaZe history, redesigned puzzles (SNIP/HOUSE/FIVE), progressive hints, visual + a11y polish |
| `b7b591a` | 2026-11-14 16:34:19 | 2026-11-14 16:34:19 | Phase 8: rewrite README, DEVPOST and JUDGING_DEMO to match the real product |

- Author date == committer date on every commit. No rebasing, no rewritten history, no backdated commits.
- First commit (14:50) contains the full initial app (29 files, incl. `package-lock.json`, `src/App.tsx`, `src/lib/puzzles.ts`, `src/lib/rooms.ts`, Supabase migration + Edge Function, tests, docs). All of it was written between the project directory's creation and that commit (see below).

### Filesystem evidence

- Project directory `~/workspace/faze-blackbox/` created **2026-11-14 14:46:23 CST** — after noon.
- `node_modules` installed 2026-11-14 14:47 — after noon.
- No tracked file in the repo has a modification time before 2026-11-14 12:00. A workspace-wide search found no FaZe Blackbox project files outside this directory predating the window (only auto-generated relationship-index copies of the team name, which are metadata, not project code).

### GitHub evidence (public API, `api.github.com/repos/Sukhman-Singh007/Faze-Blackbox`)

- Repo **created 2026-11-14T20:53:39Z = 14:53:39 CST** — inside the window.
- Last push 2026-11-14T22:36:16Z = 16:36 CST. Default branch `main`, public, not a fork, not a template.
- Repo description is empty (`null`) — cosmetic; the Devpost submission carries the description.

**Conclusion on timing:** everything in the repository — code, docs, and assets — was created inside the stated hacking window. No pre-window project work was found.

### What existed before the window (and is not project work)

- **Sponsor-provided timeline** ("FaZe Clan: A Timeline, 2010–2026", Google Doc) — supplied by the event/sponsor; it is source material, not code. It was read in full (1,774 lines) on 2026-11-14 and is the only source of historical facts in the game.
- **Public libraries / scaffolding** — Vite React-TypeScript template, React 19, Tailwind CSS 3, Supabase JS client, Vitest, TypeScript. Standard public tooling; no external game template or starter was used.
- **`src/assets/hero.png`** (PNG 343×361, 13 KB) — added in the first commit, removed 4 minutes later in `35e280a`. It was created inside the window and is **not in the current product**. Noted for completeness; no action needed.
- **No prior FaZe Blackbox code, design, or repo** existed before 14:46 CST on Nov 14.

### AI-assisted work — disclosure question (UNRESOLVED, see §5)

All code, tests, and docs in the repo were written **during the window** by Mica (Meta's AI agent) working under Sukhman's direction — Sukhman specified the product, supplied the timeline, made the decisions (two-day schedule style: he approved each phase), created the GitHub repo himself, and is doing the Devpost submission himself. No code was written before the window, and no code was reused from any earlier project.

Whether HackUTA/MLH requires AI-assisted work to be **disclosed** in the submission, and in what form, could **not** be verified from the official sources available (see §2). This is flagged for organizer clarification — do not assume it is fine without asking.

---

## 2. Official rules, deadline, and required materials — verified vs unverified

| Item | Status | Evidence |
|---|---|---|
| Submission deadline | **Verified: Sun Nov 15, 2026, 12:00 PM CST** | Devpost "My hackathon projects" page, screenshotted by Sukhman 2026-11-14 16:42 CST: "Deadline Nov 15, 2026 @ 12:00pm CST", "19 more hours to deadline". (Earlier working assumption of Sat 11:59 PM was wrong — corrected.) |
| Hacking window (Nov 14 noon – Nov 15 noon) | Stated in the task; consistent with the noon deadline. Not independently re-verified against a published rules page. | — |
| Devpost submission fields | **Verified by direct inspection of the live form** | Project name (60 chars), elevator pitch (200 chars), thumbnail (optional), About the project (Markdown, required), Built with (tags, required), Try it out links, Project Media (optional), **Video demo link — YouTube or Vimeo URL (required)**. No sponsor-track selector appeared anywhere in the form Sukhman has filled so far. |
| Video requirement | **Verified: a video demo link is required** | Form field "Video demo link (required)". Sukhman began recording a ~2-minute screen-recording playthrough at ~16:54 CST on 2026-11-14 (in-window). **As of this audit it is not confirmed uploaded or linked.** This is the last open submission item. |
| Code-link requirement | **Verified as satisfied in the form** | GitHub URL https://github.com/Sukhman-Singh007/Faze-Blackbox entered in "Try it out" links; repo is public. |
| Sponsor-track selection | **UNVERIFIED** | No track selector seen in the Devpost form. Unknown whether FaZe-track selection happens on Devpost, at check-in, or at judging. **Needs organizer confirmation.** |
| Judging attendance requirements | **UNVERIFIED** | hackuta.com fetched 2026-11-14 returns only a partial page (schedule section did not render in text). No judging time, location, or attendance rule confirmed. A third-party listing (HackathonRadar) gives event hours 2026-11-14T14:00Z–2026-11-15T22:30Z, which does not match the noon–noon window — treated as unreliable, not as evidence. **Needs organizer confirmation.** |
| Official rules text (MLH / HackUTA) | **NOT FOUND** | Web searches for "HackUTA 2026 Devpost rules" and the official site returned no HackUTA 2026 Devpost rules page. One search result ("HACKUTA 2026 — The Odyssey", Nov 21–22) is an unrelated fan-made page and was **not** treated as official. The official site is hackuta.com; contact hello@hackuta.org. |

---

## 3. Devpost submission accuracy (draft in progress, not yet submitted)

Sukhman's Devpost draft as filled so far (name, pitch, story, tags, links) matches `DEVPOST.md`. Spot-checks:

- ✅ Title/tagline, links (GitHub + live demo), Built-with tags (React, Vite, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Vercel, GitHub) — all accurate.
- ✅ "How we built it" states the demo is browser-local, Supabase is not configured on the live deployment, and cross-device play is not claimed.
- ⚠️ **"Answers are validated against SHA-256 hashes in the demo"** is true but incomplete: validation is **fail-open** — `App.tsx` `submit()` uses `server ?? clientHash`, so any Supabase error falls back to the client hash (documented in `AUDIT.md`). The Devpost text does not claim server validation, so it is not false, but the honest framing is "demo-grade client-side hash check only".
- ⚠️ **"21 unit tests pass"** — was true at the last run (2026-11-14 ~16:30). Must be re-verified after the timer/invite fixes (planned in the test pass).
- ⚠️ **"A first-time player solved all three stages from the clues alone in live testing"** — true (2026-11-14 ~16:31 browser E2E, 8/8 steps PASS). Keep.
- ✅ No invented sponsors, stats, user counts, or revenue anywhere in the submission text. Revenue is labelled proposed/hypothetical.
- ❌ **Submission is NOT yet submitted.** Remaining: upload the demo video to YouTube (unlisted) and paste the link, then Save & submit before **Sun Nov 15, 12:00 PM CST**.

---

## 4. Technical findings from this audit (to be fixed, not yet changed)

### 4a. Timer — 82:29 is NOT accurate gameplay time (CONFIRMED BUG)

- `RoomState.startedAt` is set in `emptyRoom()` (`src/lib/rooms.ts`) at **room creation**, not when play begins.
- The in-game clock (`Game`, `src/App.tsx`) and the completion screen (`totalMs = completedAt - startedAt`) both measure **room creation → completion**, which includes: lobby waiting time, time for the second player to join, and any idle time while the room sat open.
- The reported completed game showed **82:29 and 10 attempts**. A real 3-stage playthrough takes roughly 5–10 minutes; 82:29 is consistent with a room created long before play started (e.g. created, left idle, played later). The number is real elapsed wall-clock time since creation — it is not fabricated — but it does **not** represent gameplay time.
- Attempts (10 total) counts every correctly-sized submission across all stages, wrong guesses included; wrong-length guesses do not count. That count is plausible and is not itself a bug, but it will be re-verified against the fixed timer.
- **Fix (proposed):** add `gameStartedAt` to `RoomState`, set it when status flips to `playing` (second seat fills, or solo start), persist it in room state so refreshes keep it, freeze the clock at `completedAt`, and derive the completion time from `completedAt - gameStartedAt` so both players see the same number. Do not replace the number with anything invented.

### 4b. Invite button invites into a finished room (CONFIRMED BUG)

- The completion screen's **"Invite a friend to play"** copies `inviteLink` = `?room=<completed code>`.
- `RoomStore.join()` rejects completed rooms ("That room already finished its mission. Create a new room to play again."), so anyone following that link cannot play.
- **Fix (proposed):** the button creates a fresh room for the current player (same role, same name), copies the *new* invite link, and moves the player to the new room's lobby. Test the new-room flow end to end.

### 4c. Completion screen wording + missing finale

- The achievement card says **"Verified by room state"** — misleading in browser-local mode (there is no verifier). Replace with **"Mission completed together"**.
- The completion screen has **no concise historical finale** (the five-stars summary currently lives only in the Stage 3 reveal modal). Add one.
- Episode 02 preview is already correctly labelled "Preview — not playable yet" with a disabled button. Keep.
- Vault animation (`vault-open`, 1.6s rotate/scale) exists and reduced-motion is handled in `src/index.css`; the task asks for it to feel more distinctive — small, targeted improvement only.

### 4d. History / counting logic — VERIFIED (no change needed)

Cross-checked `src/lib/puzzles.ts` against `TIMELINE.md` (which records the sponsor timeline facts):

- Stage 1 SNIP: FaZe Sniping, May 2010; first upload May 31, 2010. Decoys FaZe Clan (later name) and FaZe France (Apr 2014 division). ✓
- Stage 2 HOUSE: first content house, Plainview, 2014. Decoys: G2 CS:GO roster ~$700K (Jan 2016), NiKo ~$500K (Feb 2017), ELEAGUE Premier $500K (Oct 2017). The word HOUSE appears in neither player's text. ✓
- Stage 3 FIVE: Legacy counts 3 star wins (2021 CDL Championship, 2022 PGL Major Antwerp, 2023 Halo World Championship; decoys IEM Katowice 2022, Intel Grand Slam 2023). Recruit counts 2 (2025 + 2026 Six Invitationals; decoys Esports World Cup 2024 and 2026, StarLadder Budapest Major runner-up Dec 2025). 3 + 2 = 5 = FIVE. ✓
- The star-mapping caveat is stated in the Stage 3 reveal ("reconstructed … not an official FaZe statement"). ✓
- Method note: this audit cross-checked the game text against `TIMELINE.md` and the Phase 2/3 verification record; it did not re-read the full 1,774-line sponsor document.

### 4e. Honest technical claims — mostly clean, two items to fix in the sweep

- ✅ README / DEVPOST / JUDGING_DEMO (rewritten 2026-11-14 16:34) state browser-local multiplayer honestly; no cross-device claim; no fake sponsors/stats.
- ⚠️ In-app copy: the game footer says "Backend: demo-local (two tabs on this device)" — accurate. The landing page says "cross-device play needs Supabase configured and is not live yet" — accurate.
- ⚠️ The Devpost "SHA-256 hashes" line (see §3) and the in-code comment calling the client hash a "fallback" need the same honest framing: short-word hashes are brute-forceable and validation is fail-open. The claims sweep will align README / DEVPOST / App copy on this.
- ⚠️ The Supabase Edge Function + migration in the repo are **inactive code, not a deployed backend** — docs already say this; the sweep will make sure no sentence anywhere implies otherwise.

---

## 5. Compliance questions requiring organizer confirmation

Ask the organizers (hello@hackuta.org / HackUTA Discord / Devpost event page) — **do not declare eligibility until these are answered**:

1. **AI-assisted development:** This project was built with an AI coding agent (Muse) working under the team's direction, entirely inside the hacking window. Is AI-assisted code allowed for HackUTA 2026, and must it be disclosed in the Devpost submission? If so, in what wording/field?
2. **Sponsor-track selection:** How do we enter the FaZe Clan sponsor challenge — is there a track selector on Devpost we have missed, or is track entry handled at check-in / judging?
3. **Judging attendance:** When and where is judging (date, time, location)? Must both team members be present in person to demo? Is there a demo-expo format, and how long is each demo slot?
4. **Hacking-window confirmation:** Confirm the window is Nov 14 noon – Nov 15 noon CST and the Devpost deadline is Nov 15, 12:00 PM CST (as shown on Devpost).
5. **Video requirement:** Is a 2-minute narrated screen-recording demo video sufficient for the "Video demo link" field, or is a face-on-camera presentation required?

---

## 6. Proposed fixes (NOT yet started — awaiting go-ahead)

1. Timer fix (§4a) + tests (short controlled game + refresh; verify both players see the same time).
2. Invite fix (§4b) + new-room flow test.
3. Victory-screen improvements (§4c): distinctive vault-opening animation, "Mission completed together", correct time/attempts, both players' names (already present), concise historical finale, Episode 02 label (already correct), reduced-motion + mobile.
4. Honest-claims sweep + judging-criteria table in `JUDGING_DEMO.md` (5 criteria + revenue model, evidence vs limitations, no invented data).
5. Update `DEVPOST.md` + `JUDGING_DEMO.md` with a natural 3–4 minute presentation script.
6. Full test pass: unit tests, `tsc`, production build, live browser E2E (both host-role combinations, all puzzles, wrong answers, progressive hints, refresh/session recovery, timer accuracy, completion screen, new-room invite, mobile layout, keyboard usability). Report pass / fail / untested separately.
7. Push verified changes to GitHub; verify Vercel redeploy. Do not deploy untested changes.

**Biggest open risk right now:** the Devpost submission is still a draft — the demo video is not yet uploaded or linked, and the submission is not submitted. Deadline is **Sun Nov 15, 12:00 PM CST** (~17.5 hours from this audit).

---

## 7. Update — fixes approved and implemented (2026-11-14 ~19:00 CST)

Sukhman approved "fix the timer, invite, and victory screen, then test everything" (2026-11-14 18:50 CST). Implemented, unit-tested (25/25 pass, `tsc` clean, production build clean), and verified in live browser E2E (see test report in the final message):

- **Timer (§4a):** `gameStartedAt` added to `RoomState`, set when the second seat fills (both host-role combinations) or solo starts; `gameElapsedMs()` returns 0 in the lobby, runs during play, freezes at `completedAt`, and falls back to `startedAt` only for pre-fix completed rooms. The in-game clock and completion screen both use it, so both players see the same number. A lobby-wait regression test covers the 82:29 case directly.
- **Invite (§4b):** the completion screen's invite now creates a fresh room (same player, same role), copies the new invite link, and takes the player to the new room's lobby. The finished room's code stays unjoinable.
- **Victory screen (§4c):** "Verified by room state" → "Mission completed together"; added a concise historical finale (five stars); the vault animation now also swings the padlock shackle open and shows an UNLOCKED badge; share text and achievement card are honest in solo practice too ("in solo practice" instead of "with my partner / 0 solo solves").
- **Docs:** `DEVPOST.md` (25 tests, honest hash framing, timer/invite fixes noted), `README.md` (25 tests, timer + fresh-room invite documented), `JUDGING_DEMO.md` (judging-criteria table + 3–4 min presentation script) updated.
- **Still open (unchanged):** the five organizer questions in §5, and the Devpost video link + submission itself.
