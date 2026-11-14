// FaZe Blackbox — puzzles, built only from the sponsor-provided timeline:
// "FaZe Clan: A Timeline, 2010–2026" (sponsor doc, sourced to FaZe Clan
// YouTube, Liquipedia, Forbes and others). No historical fact here is
// invented. Sensitive material from the doc (lawsuits, crypto scandals,
// the 2025 exodus) is deliberately not used — this is a fan game about
// the milestones.
//
// DESIGN RULES (enforced by puzzles.test.ts):
// - The answer word never appears in the visible puzzle text of the
//   stage that asks for it — except Stage 1, the onboarding stage,
//   where the answer is a *transformation* (first four letters) of a
//   name the Legacy Agent must first *select* from decoys.
// - Both players must contribute reasoning, not just typing: the
//   Legacy Agent holds dated facts, the Recruit holds the question
//   and the keypad. Neither side's text alone yields the answer.
// - Answers are stored only as SHA-256 hashes, never as plaintext
//   (and never in a code comment). A short-word hash is still
//   brute-forceable, so this is demo-local protection only —
//   server-side validation (Phase 5) is what makes it real.
// - Hints are progressive: each stage has three, revealed one at a
//   time by the player, so first-timers can finish without the game
//   handing them the answer up front.

export type Role = 'legacy' | 'recruit'

export interface Stage {
  id: number
  title: string
  subtitle: string
  // What ONLY the Legacy Agent sees
  legacyClue: { heading: string; body: string; detail: string }
  // What ONLY the New Recruit sees (the puzzle + input)
  recruitPuzzle: { heading: string; body: string; detail: string; placeholder: string; hints: string[] }
  answerHash: string
  answerLength: number
  // Shown to BOTH players after the stage is solved. Real history.
  reveal: { heading: string; body: string; source: string }
}

const SOURCE = "Source: 'FaZe Clan: A Timeline, 2010–2026' (sponsor-provided), via FaZe Clan YouTube, Liquipedia and Forbes."

export const STAGES: Stage[] = [
  {
    id: 1,
    title: 'Stage 1 — The First Key',
    subtitle: 'What was FaZe called when the first video went up?',
    legacyClue: {
      heading: 'ARCHIVE CARD — EYES ONLY: LEGACY AGENT',
      body: 'The founding file. Three names for one crew — only one of them is from May 2010:',
      detail:
        '• May 2010 — Eric “ClipZ” Rivera, Jeff “House Cat” Emann and Ben “Resistance” Christensen start a Call of Duty trickshotting crew on YouTube. The crew is called FaZe Sniping.\n' +
        '• May 31, 2010 — the first upload: “FaZe Sniping Intro” (475,099 lifetime views). ILLCAMS Episode 1 follows three days later.\n' +
        '• Later — the crew becomes known as FaZe Clan.\n' +
        '• Apr 2014 — a European division launches under a different name: FaZe France.\n' +
        'Your Recruit needs the ORIGINAL name — the one from May 2010, not the later one and not the division. Read it to them exactly.',
    },
    recruitPuzzle: {
      heading: 'LOCKED KEYPAD — NEW RECRUIT',
      body: 'The vault wants the first four letters of the second word of the crew’s ORIGINAL name.',
      detail:
        'Your Legacy Agent has the founding file. Ask them: what was the crew called in May 2010 — the name on the very first upload? Then take the first four letters of the SECOND word of that name and enter them.',
      placeholder: 'Enter 4-letter code',
      hints: [
        'The founding name is from May 2010 — not the later name, and not the 2014 division.',
        'The crew was called FaZe Sniping when the first video went up.',
        'Take the first four letters of the second word: S-N-I-P.',
      ],
    },
    answerHash: 'efdea8af41d84aeae41b5f1b5fe33fee15c449863d33991c94b01d50ae5402be',
    answerLength: 4,
    reveal: {
      heading: 'VAULT LOG 01 — 2010–2013: THREE KIDS AND AN INTERVENTION',
      body: 'May 2010 — three players start FaZe Sniping, a Call of Duty trickshotting crew on YouTube. May 31, 2010 — the first upload, “FaZe Sniping Intro”. Aug 3, 2010 — Thomas “Temperrr” Oliveira joins at sixteen; his logo concept, a reversed F over a C, becomes the mark. Oct 8, 2012 — the 1-million-subscriber teamtage, 12.1M views, still the biggest video FaZe ever made.',
      source: SOURCE,
    },
  },
  {
    id: 2,
    title: 'Stage 2 — The Shared Roof',
    subtitle: 'In 2014 the crew stopped being just a channel. What did they move into?',
    legacyClue: {
      heading: 'DOSSIER 2014–2017 — EYES ONLY: LEGACY AGENT',
      body: 'Four entries from the middle era. Only one of them is about where the crew lived:',
      detail:
        '• 2014 — Temperrr and Banks set up shared living/content space in Plainview, NY, marking the pivot from pure trickshot channel to lifestyle brand.\n' +
        '• Jan 2016 — FaZe buys G2’s CS:GO roster for ~$700K, entering a second major esport.\n' +
        '• Feb 2017 — NiKo signs from mousesports, a reported ~$500K buyout, a Counter-Strike record at the time.\n' +
        '• Oct 2017 — the superteam (GuardiaN, olofmeister, NiKo, rain, karrigan) wins ELEAGUE CS:GO Premier, $500K, beating Astralis 2–0.\n' +
        'Your Recruit is asking about the place, not a player or a trophy. Read them the 2014 entry — the one about living together.',
    },
    recruitPuzzle: {
      heading: 'NUMBER-FREE LOCK — NEW RECRUIT',
      body: 'The vault wants a 5-letter word: the place the crew lived and filmed in together.',
      detail:
        'In 2014 the crew stopped being just a channel — they moved in together and started filming where they lived. Your Legacy Agent has four entries from 2014–2017. Ask them: what did Temperrr and Banks set up in Plainview in 2014? The word for that place is the code. (The signings and the trophy are decoys.)',
      placeholder: 'Enter 5-letter word',
      hints: [
        'Your partner’s 2014 entry is the one about living, not competing.',
        'The CS:GO signings are decoys — the answer is a place, not a player.',
        'Think: what do you call a building a crew lives in together?',
      ],
    },
    answerHash: '3e83712a5c41abe11cf75a9ff41a66059e3bf823421bbc6d7bd3797e83786ed8',
    answerLength: 5,
    reveal: {
      heading: 'VAULT LOG 02 — 2014–2017: THE SHARED ROOF AND THE SUPERTEAM',
      body: '2014 — the first content house opens in Plainview, NY, and FaZe pivots from trickshot channel to lifestyle brand. Jan 2016 — FaZe buys G2’s CS:GO roster for ~$700K. Feb 2017 — NiKo signs for a reported ~$500K buyout. Oct 2017 — the superteam wins ELEAGUE CS:GO Premier, $500K, the highest-profile trophy of that year.',
      source: SOURCE,
    },
  },
  {
    id: 3,
    title: 'Stage 3 — The Crest',
    subtitle: 'Count what the crest carries. Spell the total.',
    // FINALE: neither player alone can know the total. Legacy counts
    // the star wins in their list; Recruit counts theirs; the answer
    // is the sum, spelled out. Each list mixes real star wins with
    // decoys (festival titles, cumulative awards, runner-up finishes)
    // that fail the rule: first place at the defining world event of
    // its game. The answer word appears nowhere in either dossier.
    legacyClue: {
      heading: 'THE RULE — EYES ONLY: LEGACY AGENT',
      body: 'One mark on the crest for each first place at the defining world event of its game. A festival title does not count. A cumulative award does not count. A runner-up finish does not count. My wins, 2021–2023:',
      detail:
        '• Aug 22, 2021 — Atlanta FaZe win the Call of Duty League Championship, beating Toronto Ultra 5–3.\n' +
        '• Feb 27, 2022 — FaZe win IEM Katowice, 3–0 over G2, $400,000.\n' +
        '• May 22, 2022 — FaZe win the PGL Major in Antwerp, 2–0 over Natus Vincere, $500,000.\n' +
        '• Mar 2023 — FaZe complete the Intel Grand Slam by winning ESL Pro League Season 17, $1,000,000.\n' +
        '• Oct 15, 2023 — FaZe win the Halo World Championship, 4–0 over the defending champions OpTic, $400,000.\n' +
        'Count how many of MY wins earned a mark. Your Recruit holds the recent wins — ask them for their count, add the two counts together, and spell the total.',
    },
    recruitPuzzle: {
      heading: 'THE CREST — NEW RECRUIT',
      body: 'The logo carries black marks above it, one per world title. My wins are the recent ones, 2024–2026. Count how many earned a mark.',
      detail:
        '• Aug 2024 — Atlanta FaZe win the Esports World Cup in Riyadh, 4–2 over 100 Thieves, $600,000.\n' +
        '• Feb 16, 2025 — FaZe win the Six Invitational, 3–1 over Team BDS, $1,000,000.\n' +
        '• Dec 2025 — FaZe reach the StarLadder Budapest Major final and lose 1–3 to Vitality, $170,000.\n' +
        '• Feb 15, 2026 — FaZe win the Six Invitational again, 3–1 over Team Secret, $1,000,000 — the first organisation ever to defend it.\n' +
        '• Aug 2026 — FaZe win the Rainbow Six title at the Esports World Cup in Paris, 3–1 over FURIA, $750,000.\n' +
        'Count how many of MY wins earned a mark. Your Legacy Agent holds the older wins — ask them for their count, add the two counts together, and spell the total.',
      placeholder: 'Enter 4-letter word',
      hints: [
        'A mark means first place at the one event that decides a world champion — not a festival, not a cumulative award, not a runner-up finish.',
        'The Esports World Cup is a cross-game festival. The Intel Grand Slam is a cumulative award.',
        'Your Legacy Agent should count three. You should count two. Add them, then spell the total.',
      ],
    },
    answerHash: 'b35cf1ba111bbcf3a6f24755f22ed1346a8302aa62b9cf8ce82f8b5f2854eb83',
    answerLength: 4,
    reveal: {
      heading: 'THE BLACKBOX IS OPEN — THE FIVE STARS',
      body: 'One star per world title: Aug 22, 2021 — Call of Duty League Championship (Atlanta FaZe). May 22, 2022 — PGL Major, Antwerp (Counter-Strike). Oct 15, 2023 — Halo World Championship. Feb 16, 2025 and Feb 15, 2026 — back-to-back Six Invitationals, the first organisation ever to defend one. The star mapping is reconstructed from the crest files and the results record — FaZe has never published a key to the stars.',
      source: SOURCE + ' Star mapping: the timeline’s own reconstruction, not an official FaZe statement.',
    },
  },
]

export function normalizeAnswer(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Client-side demo validation: hashes the guess and compares to the stored hash.
 *  Production path: POST the guess to the Supabase Edge Function instead
 *  (see src/lib/supabase.ts) so the hash never needs to live in the client. */
export async function validateAnswer(stageId: number, rawGuess: string): Promise<boolean> {
  const stage = STAGES.find((s) => s.id === stageId)
  if (!stage) return false
  const guess = normalizeAnswer(rawGuess)
  if (guess.length !== stage.answerLength) return false
  return (await sha256Hex(guess)) === stage.answerHash
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 — readable on stage
  let code = ''
  const rand = new Uint32Array(6)
  crypto.getRandomValues(rand)
  for (let i = 0; i < 6; i++) code += chars[rand[i] % chars.length]
  return code
}

export function isValidRoomCode(code: string): boolean {
  // Deliberately NOT normalized: lowercase codes are invalid as typed.
  return /^[A-Z0-9]{6}$/.test(code)
}
