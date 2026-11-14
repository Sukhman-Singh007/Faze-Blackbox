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
  it('validates the demo answers (FAZE / CLAN / VAULT)', async () => {
    expect(await validateAnswer(1, 'faze')).toBe(true)
    expect(await validateAnswer(2, 'CLAN')).toBe(true)
    expect(await validateAnswer(3, ' vault ')).toBe(true)
  })
  it('rejects wrong and wrong-length answers', async () => {
    expect(await validateAnswer(1, 'FAKE')).toBe(false)
    expect(await validateAnswer(2, 'CL')).toBe(false)
    expect(await validateAnswer(99, 'FAZE')).toBe(false)
  })
  it('normalizes answers', () => { expect(normalizeAnswer('  fa-ze! ')).toBe('FAZE') })
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
