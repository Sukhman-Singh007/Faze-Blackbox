# FaZe Clan timeline — insertion point (verified facts only)

**Status: no official sponsor timeline is in this project yet.** No FaZe
historical facts have been invented anywhere in the app. Do not replace the
placeholders below with facts from memory, fan wikis, or web search — only
with the sponsor-provided official 2010–2026 timeline.

## Where to insert it (exactly)

File: `src/lib/puzzles.ts`, the `reveal.timelineSlot` string of each stage:

| Stage | Current placeholder | Replace with |
|---|---|---|
| 1 | `TIMELINE SLOT 2010–2013 — replace this text with the sponsor-provided official FaZe Clan timeline entry for this era.` | Official timeline entry, 2010–2013 |
| 2 | `TIMELINE SLOT 2014–2018 — …` | Official timeline entry, 2014–2018 |
| 3 | `TIMELINE SLOT 2019–2026 — …` | Official timeline entry, 2019–2026 |

Each `timelineSlot` is shown to both players in the reveal modal after that
stage is solved. The puzzle answers (FAZE / CLAN / VAULT) are fictional demo
answers and do not depend on the timeline, so swapping the text in is a
one-line change per stage with no gameplay change.

## What counts as verified

- A timeline entry supplied by the HackUTA / FaZe Clan sponsor, or a
  primary FaZe Clan source the sponsor points to.
- Anything else — including a plausible-sounding date or event — stays out
  until the sponsor confirms it.

## What we need from the sponsor / team (requested 2026-11-14)

Please send the official FaZe Clan 2010–2026 timeline — ideally one short
entry per era (2010–2013, 2014–2018, 2019–2026), each with a date or year
and one or two sentences. Once it arrives, the change is one string per
stage (see the table above) plus one puzzle: Stage 3's split-key numbers
can be re-keyed to a verified event (for example, a year or a name from
the timeline) while keeping the same Legacy-holds-half / Recruit-holds-
half structure. Until then, no historical content in the game has been
changed, and no FaZe facts have been invented.
