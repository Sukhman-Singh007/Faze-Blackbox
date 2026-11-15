# FaZe Blackbox — Judging Demo (3 minutes)

**Live demo:** https://faze-blackbox.vercel.app/
**GitHub:** https://github.com/Sukhman-Singh007/Faze-Blackbox
**Team:** Sukhman Singh + Akumar1313 (UNT, HackUTA 2026, FaZe Clan sponsor challenge)

## 20-second introduction (say this first)

"FaZe Blackbox is a two-player mystery vault. One player is a Legacy Agent — a longtime FaZe fan who sees the history. The other is a New Recruit — a new fan who holds the puzzle and the only keypad. Neither can solve a stage alone, so they have to talk. Three stages, three real moments from FaZe history, one vault — and every game turns a new fan into a FaZe fan."

## Two-player demo — two tabs, same browser (2 minutes)

1. **Tab A:** type a name, click **Create Room — as Legacy Agent**. Copy the 6-character code.
2. **Tab B:** type a name, paste the code, click **Join Room**. You become the New Recruit automatically and the game starts.
3. **Show the split:** in Tab A (Legacy), show the dossier — then switch to Tab B and show that it is hidden there ("CLASSIFIED"). In Tab B, show the keypad — Tab A has none. That is the cooperation.
4. **Stage 1:** Legacy reads the founding file out loud (May 2010, FaZe Sniping). Recruit asks for the original name and enters **SNIP** — the first four letters of its second word.
5. **Stage 2:** Legacy reads the 2014 entry about shared living space in Plainview. Recruit enters **HOUSE**. Point out: the word HOUSE appears nowhere on either screen — it has to be reasoned out.
6. **Stage 3 — the best puzzle to show:** neither player has the full answer. Legacy counts the world-title wins in their list (3: 2021 CDL, 2022 Antwerp, 2023 Halo); Recruit counts theirs (2: the 2025 and 2026 Six Invitationals). Festival titles, the Intel Grand Slam and a runner-up finish don't count. Together: 3 + 2 = **FIVE**. Enter it, watch the vault open, and show the shareable achievement and the Five Stars reveal.
7. **If a judge refreshes mid-game:** the session restores to the same stage — that was a bug we fixed, and it is safe to demo.
8. **If a judge re-enters a finished room code:** it says "That room already finished its mission. Create a new room to play again." — completed rooms can't be replayed as fresh games.

Solo fallback if only one screen is available: **Practice solo** on the landing page shows both sides with a role switcher. Stuck? Each stage has a "Need a hint?" button with three progressive hints.

## Revenue model (30 seconds)

Proposed, not existing: gaming and technology brands sponsor a weekly mystery episode, with branding woven naturally into the mission (a clue, a prop, a location). After completing an episode, players may unlock optional sponsor rewards or offers. FaZe could measure episode starts, completion rates, return visits, shares, and optional offer clicks. There are no existing sponsorship agreements and no revenue yet — everything sponsor-related in the demo is labelled hypothetical.

## Why fans return / how it grows the audience

A new episode every week gives fans a reason to come back. Every game pairs a longtime fan with a new fan, and the longtime fan teaches the new fan FaZe history to win — so each game is also an onboarding. Shareable achievements and invite links turn every completed vault into a referral.

## Likely judge questions

**Q: Is this real FaZe history?**
A: Yes — every fact comes from the sponsor-provided "FaZe Clan: A Timeline, 2010–2026", and each reveal cites it as its source. One caveat we state in the game itself: the five-star mapping is the timeline's own reconstruction from crest files and the results record, not an official FaZe statement. Sensitive material from the timeline (lawsuits, scandals, the 2025 exodus) was deliberately left out.

**Q: Does multiplayer work across devices?**
A: Honestly, not yet on the live deployment. It uses browser-local state (localStorage + BroadcastChannel), so the tested demo is two tabs on one device. The Supabase migration and answer-validation Edge Function are in the repo; wiring rooms to Supabase Realtime with hardened RLS is the next step, documented in `AUDIT.md`.

**Q: How do you stop one player solving it alone?**
A: The answer is split across both players' information, not just their screens. Stage 2's answer word appears in neither player's text. In Stage 3, Legacy counts 3 world titles and Recruit counts 2 — the answer is the sum, and neither side can compute it alone. Answers are validated against SHA-256 hashes, never stored in plaintext (and a short-word hash is only demo-grade protection — real security needs the server-side validation we're building next).

## Known limitations (stated honestly)

- Multiplayer is browser-local (two tabs, one device); cross-device play via Supabase is not live.
- Episode 02 is a preview only — it is not playable.
- Mobile 390px layout has not been verified in a resizable browser; desktop is the tested path.
- No real sponsors, no real revenue, no invented statistics anywhere in the product.

## Judging-criteria alignment (FaZe sponsor challenge)

| Criterion | Implemented evidence | What we will demonstrate | Remaining limitations |
|---|---|---|---|
| **1. Target audience and problem** | Two roles built for the two real FaZe audiences: Legacy Agent (longtime fan who knows the history) and New Recruit (new fan discovering it). The landing page names both and explains why they need each other. | The role split on screen: Legacy sees a dossier the Recruit cannot see; the Recruit holds the only keypad. | No user research was run during the hackathon — the audience split comes from the sponsor brief and the timeline, not from interviews. |
| **2. Creativity and product concept** | A cooperative vault where the answer is split across two players' information, not just their screens. Stage 2's answer word appears in neither player's text; Stage 3's answer is a sum neither side can compute alone. | Stage 3 live: Legacy counts 3, Recruit counts 2, together they get FIVE. | One episode only (Episode 01). Episodes 02–03 are previews, not playable. |
| **3. Prioritization and resource decisions** | With 24 hours and no backend credentials on demo day, we built the local transport first (two tabs, no keys) so the game always works, and kept Supabase as code in the repo for the next step. We spent the time on puzzles and verified history instead of a backend judges can't test. | The game runs with zero setup: open the link, create a room, play. | Cross-device play was deferred, not finished — it is the honest next step, documented in `AUDIT.md`. |
| **4. Technical feasibility and MVP quality** | Complete playable 3-stage game: room codes, lobby, session recovery after refresh, progressive hints, vault unlock, shareable achievement, completed-mission history. 25 unit tests pass (puzzle rules, room codes, gameplay timer); TypeScript + production build clean. | Full playthrough in the demo, including a refresh mid-game that restores the same stage. | Demo-local only; answer validation is a demo-grade client-side hash check (brute-forceable, fail-open) until server validation ships. |
| **5. Fan engagement and audience growth** | Weekly episode format with a reason to return; every game pairs a longtime fan with a new fan and the longtime fan teaches the new fan FaZe history to win; shareable achievements and invite links (the completion-screen invite creates a fresh room). | The completion screen: shareable achievement, fresh-room invite, Episode 02 preview. | No real players, no engagement data, no measured retention — everything about growth is a proposal, not a result. |

### Product recommendation and proposed revenue model

**Recommendation:** ship weekly sponsored mystery episodes. A brand sponsors one episode; its branding appears inside the mission (a clue, a prop, a location), never as a banner. After completing an episode, players may unlock optional sponsor rewards. FaZe could measure episode starts, completion rates, return visits, shares, and optional offer clicks.

**Honest status:** proposed only. No sponsors, no revenue, no user counts, no engagement data. All sponsor examples in the demo are labelled hypothetical.

## Presentation script (3–4 minutes, natural language)

Say it in your own words — this is a guide, not a script to memorize. Two speakers work well: one presents, the other plays the second tab.

**[0:00–0:30] The problem.** "FaZe has two kinds of fans. There are longtime fans who lived the history — and there's a whole new generation just finding FaZe now. But nothing puts those two groups on the same team. So we built a game where they have to play together — or the vault never opens."

**[0:30–1:00] The idea.** "FaZe Blackbox is a two-player mystery vault. One player is the Legacy Agent — the longtime fan — who sees historical clues. The other is the New Recruit — the new fan — who holds the puzzle and the only keypad. Neither one can solve a stage alone. They have to talk. Three stages, three real moments from FaZe history, one vault."

**[1:00–2:30] Live demo (two tabs).** "Let me show you. Tab one creates a room as the Legacy Agent. Tab two joins with the code and becomes the Recruit automatically. Watch — the Legacy side shows a dossier, and on the Recruit's screen that same clue is blacked out. And the keypad only exists on the Recruit's side. Stage one: the founding file says FaZe started in May 2010 as FaZe Sniping — so the answer is SNIP. Stage two: the 2014 entry is about the crew moving in together in Plainview — the answer is HOUSE, and that word appears nowhere on either screen, you have to reason it out. Stage three is the one we're proudest of: the Legacy counts three world-title wins, the Recruit counts two, and the answer is the sum — FIVE. The vault opens, and both players get a shareable achievement."

**[2:30–3:00] How it's built.** "React, TypeScript and Tailwind, deployed on Vercel. The demo runs locally in the browser — two tabs on one device sync with no setup, and if a player refreshes, their seat and stage come back. The Supabase backend code is in the repo — the migration and the answer-validation function — but it's not wired up on the live deployment yet, and we're not going to pretend it is. The answers are checked against hashes in the demo, which is fine for a demo but not real security — server-side validation is the next step."

**[3:00–3:30] Why fans come back, and the money.** "A new episode drops every week, so there's a reason to return. Every game is also an onboarding: the longtime fan teaches the new fan FaZe history in order to win. And the business side is sponsored episodes — a brand sponsors a week, its branding is woven into the mission itself, and players can unlock sponsor rewards after they win. That's a proposal, not a deal — there are no sponsors yet, and everything sponsor-related in the demo is labelled hypothetical."

**[3:30–4:00] What's next and what's honest.** "Next: wire up Supabase for real cross-device play with server-side validation, then ship Episode 02 with a real sponsor. What we know is unfinished: cross-device multiplayer, Episode 02, and mobile layout testing. What we know works: the game you're looking at, the history in it — every fact comes from the sponsor-provided timeline — and the fact that two players have to think together to open the vault. Thank you — happy to let you play it."
