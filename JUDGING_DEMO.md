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
