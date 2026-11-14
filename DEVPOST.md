# Devpost submission — FaZe Blackbox (HackUTA 2026)

**Title:** FaZe Blackbox
**Tagline:** Unlock the Past. Build the Next Generation.

## Inspiration
FaZe Clan has longtime fans who lived its history and a new generation discovering it now — but nothing makes those two groups play *together*. We built a vault that only opens when both do.

## What it does
A cooperative two-player mystery platform. A Legacy Agent (longtime fan) sees historical clues; a New Recruit (new fan) holds the locked puzzle and the only keypad. Neither can solve a stage alone. Three stages, real-time sync, historical reveals after each stage, a vault-unlock animation, and a shareable achievement. Weekly sponsored mystery episodes keep fans returning.

## How we built it
React 19 + Vite + TypeScript + Tailwind CSS, Supabase (PostgreSQL, Realtime, Edge Functions), deployed on Vercel. Rooms use unique 6-character codes. Answers are validated against SHA-256 hashes — in production by a Supabase Edge Function, so no plaintext answer or service key ever ships to the browser. Demo mode syncs two tabs via BroadcastChannel/localStorage so it plays with zero setup.

## Challenges we faced
- Making cooperation *required*, not optional: we enforced it in the UI (Legacy has no keypad, Recruit cannot see the clue) instead of just suggesting it.
- Real-time sync without credentials on demo day: built a local transport first, with Supabase Realtime as the configured backend.
- Not inventing FaZe history: puzzle reveals are labelled timeline slots for the sponsor-provided 2010–2026 timeline.

## Accomplishments we're proud of
A complete playable three-stage game, working two-player flow tested in two tabs, server-side validation design, and a revenue story (sponsored episodes) that fits the sponsor brief.

## What we learned
Asymmetric information is a stronger multiplayer mechanic than shared trivia; and a demo that works with no keys beats a backend that only works after setup.

## What's next
Fill timeline slots with the official FaZe timeline, wire Supabase Realtime end-to-end in production, ship Episode 02 with a real sponsor, and add leaderboards + merch rewards.

## Built with
React, Vite, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Supabase Realtime, Vercel, GitHub.

## Links
- GitHub: https://github.com/Sukhman-Singh007/faze-blackbox (create the empty public repo, then push — see DEPLOYMENT.md)
- Live demo: <Vercel URL after deploy — see DEPLOYMENT.md>
- Demo answers for judges: Stage 1 FAZE, Stage 2 CLAN, Stage 3 VAULT
