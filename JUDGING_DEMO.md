# FaZe Blackbox — Judging Demo (3 minutes)

**Live demo:** https://faze-blackbox.vercel.app/
**GitHub:** https://github.com/Sukhman-Singh007/Faze-Blackbox
**Team:** Sukhman Singh + Akumar1313 (UNT, HackUTA 2026, FaZe Clan sponsor challenge)

## 20-second introduction (say this first)

"FaZe Blackbox is a two-player mystery vault. One player is a Legacy Agent — a longtime FaZe fan who sees the history. The other is a New Recruit — a new fan who holds the puzzle and the only keypad. Neither can solve a stage alone, so they have to talk. Three stages, three real moments from FaZe history, one vault — and every game turns a new fan into a FaZe fan. And it doesn't stop there: there's a daily 90-second strategy game, a five-question sports round, and a free Saturday event — all with friend challenges by link."

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

## Daily Match Point demo (45 seconds)

1. Scroll to **Daily Match Point** — today's opponent is named on the card, and everyone plays the same challenge today.
2. **Create a room as Legacy Agent** in one tab, join as Recruit in the second. Legacy sees the opponent's tendencies ("They are stacking one site with four defenders") and a warning about the next round; Recruit sees the plays and their costs — and locks the choice.
3. Play one round: pick a play, watch the one-sentence explanation, and point out the tradeoff — the free Save loses the round but keeps your credits. Show the 90-second clock and the credits.
4. **The same-move test:** Rush wins against a passive opponent and loses against a stack — the dossier says why, so the loss is understandable, not random.
5. On the results screen, show **Challenge a Friend** — it copies a score message and a link to the exact challenge. A friend opening the link starts their own run on the same scenario.

## Sports Quick Play + Saturday Challenge demo (30 seconds)

1. Scroll to **Sports Quick Play**, pick a sport (or Mixed), answer a question, and show the explanation and source after the answer. Same five questions for everyone today.
2. Scroll to **Saturday Challenge**: show the countdown to Saturday 12 p.m. Central, the published scoring rules, and the **Try the preview** button — the format is playable any day. Note the personal best is labelled "on this device" because scores live only in the browser.
3. Point out the **Creator Challenge Pack** ($4.99 proposed): one sample playable now with **Play sample**, the other four labelled PLANNED, and **I'm interested** as a demo action — no payment taken.

## Revenue model (30 seconds)

Proposed, not existing: gaming and technology brands sponsor a weekly mystery episode, with branding woven naturally into the mission (a clue, a prop, a location). After completing an episode, players may unlock optional sponsor rewards or offers. FaZe could measure episode starts, completion rates, return visits, shares, and optional offer clicks. There are no existing sponsorship agreements and no revenue yet — everything sponsor-related in the demo is labelled hypothetical.

New in this build: a proposed $4.99 one-time Creator Challenge Pack (five extra co-op challenges, one sample playable now, the rest planned) and a flat-fee Saturday Challenge sponsorship — a gaming brand pays a flat fee, gets its name on the event card and one labelled placement after the score, plus a report on starts, completions and offer clicks. The counts shown in the demo are real but tracked only in this browser and labelled "on this device." The Saturday card also shows a cash-prize preview that is clearly an example: this build collects no entry fees and promises no payout — a real prize event would need confirmed funding, published contest rules, and server-verified results.

## Why fans return / how it grows the audience

A new episode every week gives fans a reason to come back. Every game pairs a longtime fan with a new fan, and the longtime fan teaches the new fan FaZe history to win — so each game is also an onboarding. Shareable achievements and invite links turn every completed vault into a referral. New daily and weekly loops give solo players a reason to return too: a Daily Match Point every day, a fresh five-question sports round every day, and the Saturday Challenge every weekend — each with a Challenge a Friend link that brings a friend in on the same challenge.

## Likely judge questions

**Q: Is this real FaZe history?**
A: Yes — every fact comes from the sponsor-provided "FaZe Clan: A Timeline, 2010–2026", and each reveal cites it as its source. One caveat we state in the game itself: the five-star mapping is the timeline's own reconstruction from crest files and the results record, not an official FaZe statement. Sensitive material from the timeline (lawsuits, scandals, the 2025 exodus) was deliberately left out.

**Q: Does multiplayer work across devices?**
A: Honestly, not yet on the live deployment. It uses browser-local state (localStorage + BroadcastChannel), so the tested demo is two tabs on one device. The Supabase migration and answer-validation Edge Function are in the repo; wiring rooms to Supabase Realtime with hardened RLS is the next step, documented in `AUDIT.md`. Friend challenges are different: a challenge link opens an independent run on the same challenge on any device — no live sync needed, and no answers travel in the link.

**Q: How do you stop one player solving it alone?**
A: The answer is split across both players' information, not just their screens. Stage 2's answer word appears in neither player's text. In Stage 3, Legacy counts 3 world titles and Recruit counts 2 — the answer is the sum, and neither side can compute it alone. Answers are validated against SHA-256 hashes, never stored in plaintext (and a short-word hash is only demo-grade protection — real security needs the server-side validation we're building next).

## Known limitations (stated honestly)

- Multiplayer is browser-local (two tabs, one device); cross-device play via Supabase is not live. Challenge links are independent runs, not live shared games.
- Episode 02 is a preview only — it is not playable.
- Mobile 390px layout has not been verified in a resizable browser; desktop is the tested path.
- No real sponsors, no real revenue, no invented statistics anywhere in the product. Interaction counts are tracked only in the browser and labelled "on this device."
- The Creator Pack's four remaining challenges are planned, not built. The cash-prize preview is an example only — no entry fees, no payout.

## Judging-criteria alignment (FaZe sponsor challenge)

| Criterion | Implemented evidence | What we will demonstrate | Remaining limitations |
|---|---|---|---|
| **1. Target audience and problem** | Two roles built for the two real FaZe audiences: Legacy Agent (longtime fan who knows the history) and New Recruit (new fan discovering it). The landing page names both and explains why they need each other. Sports Quick Play adds a solo lane for fans who arrive alone, with the same FaZe tie-in (one esports question is FaZe's founding year). | The role split on screen: Legacy sees a dossier the Recruit cannot see; the Recruit holds the only keypad. | No user research was run during the hackathon — the audience split comes from the sponsor brief and the timeline, not from interviews. |
| **2. Creativity and product concept** | A cooperative vault where the answer is split across two players' information, not just their screens. Stage 2's answer word appears in neither player's text; Stage 3's answer is a sum neither side can compute alone. Daily Match Point adds a second original mechanic: the same play wins in one scenario and loses in another, and the dossier explains why. | Stage 3 live: Legacy counts 3, Recruit counts 2, together they get FIVE. Then one Match Point round: Rush wins vs a passive opponent, loses vs a stack. | One vault episode only (Episode 01). Episodes 02–03 are previews, not playable. |
| **3. Prioritization and resource decisions** | With 24 hours and no backend credentials on demo day, we built the local transport first (two tabs, no keys) so the game always works, and kept Supabase as code in the repo for the next step. We spent the time on puzzles and verified history instead of a backend judges can't test. New modes reuse the same room/transport code instead of a second backend: Match Point rooms are the vault's rooms with a different game state. | The game runs with zero setup: open the link, create a room, play. Match Point, Quick Play and Saturday all run on the same stack. | Cross-device play was deferred, not finished — it is the honest next step, documented in `AUDIT.md`. |
| **4. Technical feasibility and MVP quality** | Complete playable 3-stage game: room codes, lobby, session recovery after refresh, progressive hints, vault unlock, shareable achievement, completed-mission history. Plus: a working 90-second strategy game with deterministic outcomes and a published scoring formula; a 24-question trivia bank with date rotation and no repeats; a Saturday event with a real Central-Time open window, countdown and preview; challenge links that reproduce the exact challenge on another device. 65 automated tests pass (puzzle rules, room codes, gameplay timer, Match Point outcomes, Quick Play rotation, challenge links, Saturday window); TypeScript + production build clean. | Full playthrough in the demo, including a refresh mid-game that restores the same stage; a Match Point round; a Quick Play question with its explanation and source; the Saturday countdown and preview. | Demo-local only; answer validation is a demo-grade client-side hash check (brute-forceable, fail-open) until server validation ships. |
| **5. Fan engagement and audience growth** | Weekly episode format with a reason to return; every game pairs a longtime fan with a new fan and the longtime fan teaches the new fan FaZe history to win; shareable achievements and invite links (the completion-screen invite creates a fresh room). Daily loops now give solo players a reason to return too: a new Match Point challenge and a new five-question set every day, a Saturday event every week, and Challenge a Friend links that bring a friend in on the same challenge. | The completion screen: shareable achievement, fresh-room invite, Episode 02 preview. The Match Point results screen: Challenge a Friend copies a link to the exact challenge. | No real players, no engagement data, no measured retention — everything about growth is a proposal, not a result. Counts shown are tracked only in this browser and labelled "on this device." |

### Product recommendation and proposed revenue model

**Recommendation:** ship weekly sponsored mystery episodes. A brand sponsors one episode; its branding appears inside the mission (a clue, a prop, a location), never as a banner. After completing an episode, players may unlock optional sponsor rewards. FaZe could measure episode starts, completion rates, return visits, shares, and optional offer clicks.

**New in this build:** a proposed $4.99 one-time Creator Challenge Pack — five extra co-op challenges one buyer can play with a friend (one sample playable now, the rest labelled planned) — and a flat-fee Saturday Challenge sponsorship: a gaming brand pays a flat fee, gets its name on the event card and one labelled placement after the score, plus a report on starts, completions and offer clicks. The Saturday card also shows a cash-prize preview that is clearly an example only: this build collects no entry fees and promises no payout. A real prize event would need confirmed funding, published contest rules, and server-verified results.

**Honest status:** proposed only. No sponsors, no revenue, no user counts, no engagement data. All sponsor examples in the demo are labelled hypothetical. Interaction counts are tracked only in the browser and labelled "on this device."

## Presentation script (3–4 minutes, natural language)

Say it in your own words — this is a guide, not a script to memorize. Two speakers work well: one presents, the other plays the second tab.

**[0:00–0:30] The problem.** "FaZe has two kinds of fans. There are longtime fans who lived the history — and there's a whole new generation just finding FaZe now. But nothing puts those two groups on the same team. So we built a game where they have to play together — or the vault never opens."

**[0:30–1:00] The idea.** "FaZe Blackbox is a two-player mystery vault. One player is the Legacy Agent — the longtime fan — who sees historical clues. The other is the New Recruit — the new fan — who holds the puzzle and the only keypad. Neither one can solve a stage alone. They have to talk. Three stages, three real moments from FaZe history, one vault."

**[1:00–2:30] Live demo (two tabs).** "Let me show you. Tab one creates a room as the Legacy Agent. Tab two joins with the code and becomes the Recruit automatically. Watch — the Legacy side shows a dossier, and on the Recruit's screen that same clue is blacked out. And the keypad only exists on the Recruit's side. Stage one: the founding file says FaZe started in May 2010 as FaZe Sniping — so the answer is SNIP. Stage two: the 2014 entry is about the crew moving in together in Plainview — the answer is HOUSE, and that word appears nowhere on either screen, you have to reason it out. Stage three is the one we're proudest of: the Legacy counts three world-title wins, the Recruit counts two, and the answer is the sum — FIVE. The vault opens, and both players get a shareable achievement."

**[2:30–3:00] How it's built.** "React, TypeScript and Tailwind, deployed on Vercel. The demo runs locally in the browser — two tabs on one device sync with no setup, and if a player refreshes, their seat and stage come back. The Supabase backend code is in the repo — the migration and the answer-validation function — but it's not wired up on the live deployment yet, and we're not going to pretend it is. The answers are checked against hashes in the demo, which is fine for a demo but not real security — server-side validation is the next step. The new modes reuse the same room system: a Match Point room is a vault room with a different game inside it, and a challenge link is just an ID — no answers travel in it."

**[3:00–3:30] Why fans come back, and the money.** "The Saturday Challenge gives fans a reason to come back each weekend. Between events, they can try a daily Match Point match or a five-question sports round. Every results screen has a Challenge a Friend button, so one player brings the next one in. And the business side is sponsored episodes — a brand sponsors a week, its branding is woven into the mission itself, and players can unlock sponsor rewards after they win. New in this build: a proposed $4.99 Creator Challenge Pack — five extra co-op challenges, one sample playable now — and a flat-fee Saturday sponsorship with a report on starts, completions and offer clicks. That's a proposal, not a deal — there are no sponsors yet, and everything sponsor-related in the demo is labelled hypothetical. The counts you'll see are tracked only in this browser and labelled 'on this device.'"

**[3:30–4:00] What's next and what's honest.** "Next: wire up Supabase for real cross-device play with server-side validation, then ship Episode 02 with a real sponsor, and finish the rest of the Creator Pack. What we know is unfinished: cross-device multiplayer, Episode 02, the four remaining pack challenges, and mobile layout testing. What we know works: the game you're looking at, the history in it — every fact comes from the sponsor-provided timeline — and the fact that two players have to think together to open the vault. Thank you — happy to let you play it."
