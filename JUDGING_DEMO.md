# FaZe Blackbox — Judging Demo (3 minutes)

**Live demo:** https://faze-blackbox.vercel.app/
**GitHub:** https://github.com/Sukhman-Singh007/Faze-Blackbox
**Team:** Sukhman Singh + Akumar1313 (UNT, HackUTA 2026, FaZe Clan sponsor challenge)

## 20-second introduction (say this first)

"FaZe Blackbox is a two-player mystery vault. One player is a Legacy Agent — a longtime FaZe fan who sees the history. The other is a New Recruit — a new fan who holds the puzzle and the only keypad. Neither can solve a stage alone, so they have to talk. Three stages, three reveals, one vault — and every game turns a new fan into a FaZe fan."

## Two-player demo — two tabs, same browser (2 minutes)

1. **Tab A:** type a name, click **Create Room — as Legacy Agent**. Copy the 6-character code.
2. **Tab B:** type a name, paste the code, click **Join Room**. You become the New Recruit automatically and the game starts.
3. **Show the split:** in Tab A (Legacy), show the clue — then switch to Tab B and show that the clue is hidden there ("CLASSIFIED"). In Tab B, show the keypad — Tab A has none. That is the cooperation.
4. **Stage 1:** Legacy reads the first-letters clue out loud; Recruit enters **FAZE**.
5. **Stage 2:** Legacy reads the cipher sheet; Recruit enters **CLAN**.
6. **Stage 3 — the best puzzle to show:** neither player has the full answer. Legacy holds positions 1, 3, 5 (22, 21, 20); Recruit holds positions 2 and 4 (1=A, 12=L). They must interleave them to get **VAULT**. Enter it, watch the vault open, and show the shareable achievement.
7. **If a judge refreshes mid-game:** the session restores to the same stage — that was a bug we fixed, and it is safe to demo.

Solo fallback if only one screen is available: **Practice solo** on the landing page shows both sides with a role switcher.

## Revenue model (30 seconds)

Proposed, not existing: gaming and technology brands sponsor a weekly mystery episode, with branding woven naturally into the mission (a clue, a prop, a location). After completing an episode, players may unlock optional sponsor rewards or offers. FaZe could measure episode starts, completion rates, return visits, shares, and optional offer clicks. There are no existing sponsorship agreements and no revenue yet — everything sponsor-related in the demo is labelled hypothetical.

## Why fans return / how it grows the audience

A new episode every week gives fans a reason to come back. Every game pairs a longtime fan with a new fan, and the longtime fan teaches the new fan FaZe history to win — so each game is also an onboarding. Shareable achievements and invite links turn every completed vault into a referral.

## Likely judge questions

**Q: Is this real FaZe history?**
A: Not yet. The reveals are clearly labelled timeline slots. We did not invent any FaZe facts — we are waiting on the sponsor-provided official 2010–2026 timeline, and the exact insertion point is documented in `TIMELINE.md` (one string per stage in `src/lib/puzzles.ts`).

**Q: Does multiplayer work across devices?**
A: Honestly, not yet on the live deployment. It uses browser-local state (localStorage + BroadcastChannel), so the tested demo is two tabs on one device. The Supabase Realtime code, migration, and server-side answer-validation Edge Function are in the repo and ready; wiring them up is the next step after judging.

**Q: How do you stop one player solving it alone?**
A: Two ways. Stages 1–2 are interface-enforced: the clue-holder has no keypad and the solver cannot see the clue. Stage 3 is information-enforced: the answer is split across both players (Legacy 1/3/5, Recruit 2/4), so neither side holds enough to solve it alone. Answers are validated against SHA-256 hashes, never stored in plaintext.

## Known limitations (stated honestly)

- Historical reveals are placeholders until the official sponsor timeline is supplied.
- Multiplayer is browser-local (two tabs, one device); cross-device play via Supabase is built but not configured live.
- Episode 02 is a preview only — it is not playable.
- No real sponsors, no real revenue, no invented statistics anywhere in the product.
