import { describe, it, expect } from 'vitest'
import { QUESTIONS, pickQuestions, questionsPerCategory, QP_CATEGORIES } from './quickplay'

describe('question bank', () => {
  it('has at least four accurate questions per category', () => {
    const counts = questionsPerCategory()
    for (const c of ['nba', 'nfl', 'soccer', 'esports']) {
      expect(counts[c]).toBeGreaterThanOrEqual(4)
    }
  })

  it('every question is well-formed: unique id, 4 options, valid answer, explanation and source', () => {
    const ids = new Set<string>()
    for (const q of QUESTIONS) {
      expect(ids.has(q.id)).toBe(false)
      ids.add(q.id)
      expect(q.options).toHaveLength(4)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(4)
      expect(q.explanation.length).toBeGreaterThan(5)
      expect(q.source.length).toBeGreaterThan(2)
      expect(q.question.endsWith('?')).toBe(true)
    }
  })

  it('the answer option matches the explanation (spot-check the fact claims)', () => {
    const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))
    expect(byId['nba-1'].options[byId['nba-1'].answer]).toBe('1 point')
    expect(byId['nba-3'].options[byId['nba-3'].answer]).toBe('30')
    expect(byId['nfl-1'].options[byId['nfl-1'].answer]).toBe('6 points')
    expect(byId['soc-3'].options[byId['soc-3'].answer]).toBe('A hat-trick')
    expect(byId['esp-4'].options[byId['esp-4'].answer]).toBe('13 rounds')
    expect(byId['esp-5'].options[byId['esp-5'].answer]).toBe('2010')
  })
})

describe('rotation', () => {
  it('the same category and date always pick the same set, in the same order', () => {
    const a = pickQuestions('nba', '2026-11-14').map((q) => q.id)
    const b = pickQuestions('nba', '2026-11-14').map((q) => q.id)
    expect(a).toEqual(b)
  })

  it('a round has five questions and never repeats one', () => {
    for (const c of QP_CATEGORIES) {
      const picked = pickQuestions(c.id, '2026-11-14')
      expect(picked).toHaveLength(5)
      expect(new Set(picked.map((q) => q.id)).size).toBe(5)
    }
  })

  it('different dates rotate the set', () => {
    const a = pickQuestions('mixed', '2026-11-14').map((q) => q.id).join(',')
    const b = pickQuestions('mixed', '2026-11-15').map((q) => q.id).join(',')
    const c = pickQuestions('mixed', '2026-11-16').map((q) => q.id).join(',')
    expect(new Set([a, b, c]).size).toBeGreaterThan(1)
  })

  it('a mixed round draws from the whole bank', () => {
    const picked = pickQuestions('mixed', '2026-11-14')
    expect(new Set(picked.map((q) => q.category)).size).toBeGreaterThanOrEqual(2)
  })

  it('a category round only asks that category', () => {
    const picked = pickQuestions('nfl', '2026-11-14')
    expect(picked.every((q) => q.category === 'nfl')).toBe(true)
  })
})
