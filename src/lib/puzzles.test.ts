import { describe, it, expect } from 'vitest'
import { STAGES, normalizeAnswer, generateRoomCode, isValidRoomCode, validateAnswer } from './puzzles'

describe('puzzles', () => {
  it('has exactly 3 stages', () => { expect(STAGES).toHaveLength(3) })
  it('each stage has different clues per role', () => {
    for (const s of STAGES) {
      expect(s.legacyClue.body).not.toBe(s.recruitPuzzle.body)
      expect(s.legacyClue.detail.length).toBeGreaterThan(10)
      expect(s.recruitPuzzle.detail.length).toBeGreaterThan(10)
    }
  })
  it('validates the real answers (SNIP / HOUSE / FIVE)', async () => {
    expect(await validateAnswer(1, 'snip')).toBe(true)
    expect(await validateAnswer(2, 'HOUSE')).toBe(true)
    expect(await validateAnswer(3, ' five ')).toBe(true)
  })
  it('rejects wrong and wrong-length answers', async () => {
    expect(await validateAnswer(1, 'FAKE')).toBe(false)
    expect(await validateAnswer(2, 'HOME')).toBe(false)
    expect(await validateAnswer(3, 'STARS')).toBe(false)
    expect(await validateAnswer(2, 'HOUS')).toBe(false)
    expect(await validateAnswer(99, 'SNIP')).toBe(false)
  })
  it('normalizes answers', () => { expect(normalizeAnswer('  sn-ip! ')).toBe('SNIP') })
  it('every stage has exactly 3 progressive hints', () => {
    for (const s of STAGES) {
      expect(s.recruitPuzzle.hints).toHaveLength(3)
      for (const h of s.recruitPuzzle.hints) expect(h.length).toBeGreaterThan(10)
    }
  })
  it('Stage 2 answer word never appears in either player text', () => {
    const s2 = STAGES[1]
    expect((s2.legacyClue.detail + s2.recruitPuzzle.detail).toLowerCase()).not.toContain('house')
  })
  it('Stage 3 answer word never appears in either player text', () => {
    const s3 = STAGES[2]
    const text = (s3.legacyClue.detail + s3.recruitPuzzle.detail + s3.legacyClue.body + s3.recruitPuzzle.body).toLowerCase()
    expect(text).not.toContain('five')
    expect(text).not.toContain('5 stars')
  })
  it('Stage 3 is a true split count: Legacy holds 3 star wins, Recruit holds 2', () => {
    const s3 = STAGES[2]
    // Legacy star wins (and only these three dates are world titles in their list)
    for (const d of ['Aug 22, 2021', 'May 22, 2022', 'Oct 15, 2023']) {
      expect(s3.legacyClue.detail).toContain(d)
    }
    // Legacy decoys: Katowice (not a world championship) and the Grand Slam (cumulative award)
    expect(s3.legacyClue.detail).toContain('IEM Katowice')
    expect(s3.legacyClue.detail).toContain('Intel Grand Slam')
    // Recruit star wins
    for (const d of ['Feb 16, 2025', 'Feb 15, 2026']) {
      expect(s3.recruitPuzzle.detail).toContain(d)
    }
    // Recruit decoys: EWC festival titles and a runner-up finish
    expect(s3.recruitPuzzle.detail).toContain('Esports World Cup')
    expect(s3.recruitPuzzle.detail).toContain('lose 1–3')
    // Neither side states the total.
    expect(s3.legacyClue.detail).not.toContain('three star')
    expect(s3.recruitPuzzle.detail).not.toContain('two star')
  })
  it('Stage 1 is the documented exception: answer is a transformation, not a copy', () => {
    const s1 = STAGES[0]
    // The Recruit's text never contains the answer.
    expect(s1.recruitPuzzle.detail).not.toContain('SNIP')
    // Legacy's text contains the founding name "Sniping" — the answer is
    // its first four letters, and only after selecting the May 2010 name
    // over the later name and the 2014 division.
    expect(s1.legacyClue.detail).toContain('FaZe Sniping')
    expect(s1.legacyClue.detail).toContain('FaZe Clan')
    expect(s1.legacyClue.detail).toContain('FaZe France')
  })
  it('no reveal invents history: every reveal cites the sponsor timeline', () => {
    for (const s of STAGES) {
      expect(s.reveal.source).toContain('FaZe Clan: A Timeline, 2010–2026')
    }
  })
})

describe('room codes', () => {
  it('generates unique 6-char codes', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateRoomCode()))
    expect(codes.size).toBeGreaterThan(190)
    for (const c of codes) expect(isValidRoomCode(c)).toBe(true)
  })
  it('rejects short / lowercase codes', () => {
    expect(isValidRoomCode('ABC')).toBe(false)
    expect(isValidRoomCode('abc123')).toBe(false)
  })
})
