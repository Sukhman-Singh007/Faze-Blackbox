# Devpost submission — FaZe Blackbox (HackUTA 2026)

**Title:** FaZe Blackbox
**Tagline:** Unlock the Past. Build the Next Generation.

## Inspiration
FaZe Clan has longtime fans who lived its history and a new generation discovering it now — but nothing makes those two groups play *together*. We built a vault that only opens when both do.

## What it does
A cooperative two-player mystery vault. A Legacy Agent (longtime fan) sees dated historical dossiers; a New Recruit (new fan) holds the question and the only keypad. Neither can solve a stage alone. Three stages, real historical reveals after each stage, a vault-unlock animation, and a shareable achievement. The History Vault is playable now. We propose sponsored events as a future revenue source.

The puzzles use real FaZe history from the sponsor-provided timeline "FaZe Clan: A Timeline, 2010–2026": the crew's founding as FaZe Sniping in May 2010, the first content house in Plainview in 2014, and the five events the sponsor timeline associates with the stars on the crest (2021 CDL Championship, 2022 PGL Major Antwerp, 2023 Halo World Championship, back-to-back Six Invitationals 2025–2026). The finale asks both players to count the world-title wins in their own dossiers and combine the counts — neither side alone can know the answer.

**Daily Match Point (live):** a 90-second esports strategy game — three rounds, six shared credits. Legacy sees opponent tendencies and a warning about the next round; Recruit sees the plays and their costs and locks the choice. A free Save play means a team can always finish. Everyone gets the same challenge for the day, with three rotating scenarios; the same play wins in one scenario and loses in another, for a reason the dossier states. Two-tab co-op and solo practice both work.

**Sports Quick Play (live):** five-question rounds across NBA, NFL, soccer and esports (24 original questions, each with an explanation and source). The set rotates by date so everyone gets the same five questions, and a round never repeats a question. Questions live in one file so we can add more regularly.

**Saturday Challenge (live):** a free weekly event that opens every Saturday at 12 p.m. Central, with a countdown, published scoring rules, and a labelled preview playable any day. Scores are stored only in the browser and labelled "Personal best on this device."

**Challenge a Friend (live):** every results screen copies a short score message and a link to the exact challenge. The link carries only a challenge ID — no answers or player details — and opens an independent run on the same challenge on any device. The Discord invite URL is configurable; until a real invite is supplied, the working copy-link button lets players paste challenges into Discord, group chats, or messages.

**Revenue, labelled honestly (live as demo, proposed as business):** daily play is free. A proposed $4.99 one-time Creator Challenge Pack offers five extra co-op challenges (one sample playable now, the rest labelled planned). One clearly labelled example sponsor placement appears after the score: a gaming brand could pay a flat fee to sponsor a Saturday Challenge and get a report on starts, completions and offer clicks — the demo shows event starts, completions, and opens of the sponsor details, stored in this browser. The Saturday card shows an optional cash-prize preview that is clearly an example: this build collects no entry fees and promises no payout.

## How we built it
React 19 + Vite + TypeScript + Tailwind CSS, deployed on Vercel. Rooms use unique 6-character codes. The live demo runs in demo-local mode: two tabs on one device sync via BroadcastChannel + localStorage, with session recovery if a player refreshes. Gameplay time is measured from the moment the second player joins (or solo practice starts) to the vault opening — lobby waiting doesn't count. Supabase code (PostgreSQL migration + answer-validation Edge Function) is in the repo; it is not configured on the live deployment, and cross-device play is not claimed. Answers are checked against SHA-256 hashes in the demo — a demo-grade check only: short-word hashes are brute-forceable and validation falls back to the client hash if the server check errors, so real security needs the server-side validation we're building next. Answers are never stored in plaintext in the client.

## Challenges we faced
- Making cooperation *required*, not optional: the answer is split across both players' information, not just their screens. In the finale, Legacy counts 3 world titles and Recruit counts 2 — the answer only exists when both counts are combined.
- Making puzzles solvable but not copyable: the Stage 2 answer word appears nowhere in either player's text, and the Stage 3 answer is a sum neither side can compute alone. A first-time player solved all three stages from the clues alone in live testing.
- Not inventing FaZe history: every fact comes from the sponsor-provided 2010–2026 timeline, with source credits in the app. Sensitive material from the timeline (lawsuits, scandals, the 2025 exodus) was deliberately left out.
- Real-time sync without credentials on demo day: built a local transport first, with Supabase as the next step — and wrote down honestly what is and isn't live.

## Accomplishments we're proud of
A complete playable three-stage game with verified FaZe history, working two-player flow tested in two tabs, a finale that requires both players to reason (not just type), progressive hints, and a revenue story (sponsored episodes) that fits the sponsor brief. 65 automated tests pass, including tests that enforce the puzzle design rules, the gameplay timer, cross-tab broadcast isolation, Match Point outcomes (the same play wins in one scenario and loses in another), Quick Play rotation, session recovery, challenge-link validation, and the Saturday Central-Time window. Fixed the timer to measure gameplay only (it previously counted lobby waiting time — a completed game showed 82:29 for about 5–10 minutes of play), fixed the completion-screen invite to create a fresh room instead of linking the finished one, and fixed a cross-tab state leak where a fresh room's creation could overwrite the other tab's completion screen. Added a daily 90-second strategy game, a sports trivia mode, a weekly Saturday event with a preview, friend challenges by link, and a labelled creator-pack offer with a playable sample — all in the same hacking window.

## What we learned
Asymmetric information is a stronger multiplayer mechanic than shared trivia; a demo that works with no keys beats a backend that only works after setup; and a hash of a four-letter word hides nothing — real security needs server-side validation.

## What's next
Wire Supabase Realtime end-to-end (rooms, server-side validation with hardened RLS, atomic stage progression) so co-op works across devices, ship Episode 02 with a real sponsor, finish the remaining four Creator Pack challenges, and add leaderboards + merch rewards. A real cash-prize Saturday event would need confirmed funding, published contest rules, and server-verified results first.

## Built with
React, Vite, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Vercel, GitHub.

## Links
- GitHub: https://github.com/Sukhman-Singh007/Faze-Blackbox
- Live demo: https://faze-blackbox.vercel.app
- Demo answers for judges: Stage 1 SNIP, Stage 2 HOUSE, Stage 3 FIVE
