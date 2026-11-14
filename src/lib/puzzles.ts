// FaZe Blackbox — demo puzzles.
// IMPORTANT: these are FICTIONAL demo puzzles for the hackathon MVP.
// No historical FaZe facts are invented here. The `reveal` slots are
// placeholders to be replaced with the sponsor's official 2010-2026 timeline.
// Answers are NEVER stored in plaintext in the client: only SHA-256 hashes
// are shipped. In production, validation runs in the Supabase Edge Function
// (supabase/functions/validate-answer) which holds the same hashes server-side.

export type Role = 'legacy' | 'recruit'

export interface Stage {
  id: number
  title: string
  subtitle: string
  // What ONLY the Legacy Agent sees
  legacyClue: { heading: string; body: string; detail: string }
  // What ONLY the New Recruit sees (the puzzle + input)
  recruitPuzzle: { heading: string; body: string; detail: string; placeholder: string; hint: string }
  answerHash: string
  answerLength: number
  // Shown to BOTH players after the stage is solved. Replace with official timeline.
  reveal: { heading: string; body: string; timelineSlot: string }
}

export const STAGES: Stage[] = [
  {
    id: 1,
    title: 'Stage 1 — The First Key',
    subtitle: 'Unscramble the name on the vault door.',
    legacyClue: {
      heading: 'ARCHIVE CARD — EYES ONLY: LEGACY AGENT',
      body: 'Take the FIRST letter of each word, in order:',
      detail: 'FALCON  •  ALPHA  •  ZENITH  •  ECHO\nThat spells the 4-letter code word. Tell your Recruit the letters — do NOT type it yourself, you have no keypad.',
    },
    recruitPuzzle: {
      heading: 'LOCKED KEYPAD — NEW RECRUIT',
      body: 'Scrambled letters on the vault door:',
      detail: 'Z  •  E  •  F  •  A\nYour Legacy Agent holds an archive card that spells the word. Ask them what it says, unscramble these letters to match it, then enter the code.',
      placeholder: 'Enter 4-letter code',
      hint: 'Hint: your partner’s first letters spell it.',
    },
    answerHash: '7e71bc438645f7ce334cf9b678d82459b3cf521eb78b03c3a551d2edd618cc7f', // FAZE
    answerLength: 4,
    reveal: {
      heading: 'VAULT LOG 01 — UNLOCKED',
      body: 'Stage 1 complete. You worked as one team: one player held the clue, the other held the keypad.',
      timelineSlot: 'TIMELINE SLOT 2010–2013 — replace this text with the sponsor-provided official FaZe Clan timeline entry for this era.',
    },
  },
  {
    id: 2,
    title: 'Stage 2 — The Cipher Sheet',
    subtitle: 'Decode the number lock.',
    legacyClue: {
      heading: 'CIPHER SHEET — EYES ONLY: LEGACY AGENT',
      body: 'The archive cipher sheet reads:',
      detail: '3 = C   •   12 = L   •   1 = A   •   14 = N\nRead the numbers to your Recruit in order. You cannot enter the code — only they have the keypad.',
    },
    recruitPuzzle: {
      heading: 'NUMBER LOCK — NEW RECRUIT',
      body: 'The lock shows four numbers:',
      detail: '3  –  12  –  1  –  14\nYour Legacy Agent has the cipher sheet that turns numbers into letters. Ask them for each number, then enter the 4-letter word.',
      placeholder: 'Enter 4-letter word',
      hint: 'Hint: 3-12-1-14 is a word, not a number.',
    },
    answerHash: '68cf9218d6057b3d33d4d1631d5b24905d984ffd9411473bd7622506a70d66ec', // CLAN
    answerLength: 4,
    reveal: {
      heading: 'VAULT LOG 02 — UNLOCKED',
      body: 'Stage 2 complete. The cipher only worked because both of you shared what only you could see.',
      timelineSlot: 'TIMELINE SLOT 2014–2018 — replace this text with the sponsor-provided official FaZe Clan timeline entry for this era.',
    },
  },
  {
    id: 3,
    title: 'Stage 3 — The Final Vault',
    subtitle: 'Decode the last dial and open the Blackbox.',
    // SPLIT-KEY PUZZLE: neither player alone can solve this stage.
    // Legacy holds letters 1, 3, 5 (as numbers); Recruit holds letters
    // 2 and 4. The word only exists when both halves are interleaved:
    // [Legacy 1] [Recruit 2] [Legacy 3] [Recruit 4] [Legacy 5].
    // Stages 1–2 are interface-enforced instead (Legacy has the clue but
    // no keypad; Recruit has the keypad but not the clue).
    legacyClue: {
      heading: 'FINAL DIAL — EYES ONLY: LEGACY AGENT',
      body: 'You hold THREE of the five dial letters — positions 1, 3 and 5:',
      detail: 'Position 1 = 22   •   Position 3 = 21   •   Position 5 = 20\n(A = 1, B = 2, … Z = 26.) Your Recruit holds positions 2 and 4, which you do NOT have. Read your three numbers to them — without their two letters, your half spells nothing.',
    },
    recruitPuzzle: {
      heading: 'FINAL DIAL — NEW RECRUIT',
      body: 'You hold TWO of the five dial letters — positions 2 and 4:',
      detail: 'Position 2 = 1 (A)   •   Position 4 = 12 (L)\nYour Legacy Agent holds positions 1, 3 and 5, which you do NOT have. Ask them for their three numbers, convert each (A = 1 … Z = 26), then interleave them — [their 1] [your 2] [their 3] [your 4] [their 5] — and enter the 5-letter word to open the vault.',
      placeholder: 'Enter 5-letter word',
      hint: 'Hint: your two letters are A and L. The word is what you have been opening all along.',
    },
    answerHash: 'e1c20be7b222031d9091b8ab95a5ce2b59e2ed514b86c2d1eaf064fd8abbd531', // VAULT
    answerLength: 5,
    reveal: {
      heading: 'THE BLACKBOX IS OPEN',
      body: 'All three stages solved together. Neither of you could have done this alone — that is the point of FaZe Blackbox.',
      timelineSlot: 'TIMELINE SLOT 2019–2026 — replace this text with the sponsor-provided official FaZe Clan timeline entry for this era.',
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
