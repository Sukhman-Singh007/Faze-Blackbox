import { describe, it, expect } from 'vitest'
import {
  PLAYS, OUTCOMES, SCENARIOS, DAILY_SCENARIOS, getScenario,
  dailyScenario, dailyChallengeId, scenarioForDailyId,
  newMatchState, lockPlay, continueMatch, timeoutMatch, matchScore,
  resolvePlay,
} from './matchpoint'

describe('outcome matrix — same play, different outcome', () => {
  it('Rush wins against a passive opponent and loses against a stack', () => {
    expect(resolvePlay('rush', 'passive').won).toBe(true)
    expect(resolvePlay('rush', 'stack').won).toBe(false)
    expect(resolvePlay('rush', 'aggro').won).toBe(false)
  })

  it('the same Rush play wins in the Stackers scenario and loses in the Rushers scenario', () => {
    const stackers = getScenario('stackers')!
    const rushers = getScenario('rushers')!
    // Stackers round 1: passive. Rushers round 1: aggressive.
    expect(resolvePlay('rush', stackers.rounds[0].plan).won).toBe(true)
    expect(resolvePlay('rush', rushers.rounds[0].plan).won).toBe(false)
    // And Rushers round 3 is a stack — Rush loses there too, for a
    // reason the Legacy dossier states in plain words.
    expect(resolvePlay('rush', rushers.rounds[2].plan).won).toBe(false)
    expect(rushers.rounds[2].tendency).toMatch(/stack/i)
  })

  it('every outcome explanation is exactly one sentence', () => {
    for (const play of Object.values(OUTCOMES)) {
      for (const outcome of Object.values(play)) {
        // One sentence: ends with a period and contains no other
        // sentence-ending punctuation.
        expect(outcome.text).toMatch(/\.$/)
        expect(outcome.text.replace(/\.$/, '')).not.toMatch(/[.!?]/)
        expect(outcome.text.length).toBeGreaterThan(10)
      }
    }
  })

  it('Save is free and always loses the round — the fallback that lets a broke team finish', () => {
    for (const plan of ['stack', 'aggro', 'passive', 'rotate'] as const) {
      expect(resolvePlay('save', plan).won).toBe(false)
    }
    expect(PLAYS.find((p) => p.id === 'save')!.cost).toBe(0)
  })

  it('every scenario has 3 rounds with a tendency and a next-round warning', () => {
    for (const s of SCENARIOS) {
      expect(s.rounds).toHaveLength(3)
      for (const r of s.rounds) {
        expect(r.tendency.length).toBeGreaterThan(10)
        expect(r.nextWarning.length).toBeGreaterThan(10)
      }
    }
  })
})

describe('match flow', () => {
  it('a full match: lock, continue, lock, continue, lock, done', () => {
    let m = newMatchState('stackers', 'mp-2026-11-14')
    expect(m.credits).toBe(6)
    m = lockPlay(m, 'rush') // round 1 vs passive -> win, costs 2
    expect(m.roundsWon).toBe(1)
    expect(m.credits).toBe(4)
    expect(m.phase).toBe('result')
    m = continueMatch(m)
    expect(m.round).toBe(2)
    m = lockPlay(m, 'fake') // round 2 vs stack -> win, costs 3
    expect(m.roundsWon).toBe(2)
    expect(m.credits).toBe(1)
    m = continueMatch(m)
    m = lockPlay(m, 'save') // round 3 vs rotate -> lose, costs 0
    expect(m.roundsWon).toBe(2)
    expect(m.credits).toBe(1)
    m = continueMatch(m)
    expect(m.phase).toBe('done')
    expect(m.results).toHaveLength(3)
  })

  it('cannot lock a play that costs more than the credits left', () => {
    let m = newMatchState('stackers', 'mp-2026-11-14')
    m = lockPlay(m, 'fake') // 3 credits
    m = continueMatch(m)
    m = lockPlay(m, 'fake') // 0 credits left
    m = continueMatch(m)
    expect(() => lockPlay(m, 'rush')).toThrow(/costs 2 but only 0/)
    // Save is still available.
    m = lockPlay(m, 'save')
    expect(m.phase).toBe('result')
  })

  it('timeout ends the match and marks unplayed rounds lost', () => {
    let m = newMatchState('rushers', 'mp-2026-11-14')
    m = lockPlay(m, 'mid') // round 1 vs aggro -> win
    m = continueMatch(m)
    m = timeoutMatch(m)
    expect(m.phase).toBe('done')
    expect(m.timedOut).toBe(true)
    expect(m.results).toHaveLength(3)
    expect(m.results[0].won).toBe(true)
    expect(m.results[1].won).toBe(false)
    expect(m.results[2].won).toBe(false)
    expect(m.results[1].explanation).toMatch(/Time ran out/)
  })

  it('score = rounds won x100 + credits left x25 + seconds left', () => {
    const m = { ...newMatchState('stackers', 'x'), roundsWon: 2, credits: 3 }
    expect(matchScore(m, 40)).toBe(200 + 75 + 40)
    expect(matchScore(m, 0)).toBe(275)
    expect(matchScore(m, 999)).toBe(200 + 75 + 90) // capped at 90
  })
})

describe('daily rotation', () => {
  it('the same date always picks the same scenario', () => {
    const a = dailyScenario(new Date('2026-11-14T12:00:00.000Z'))
    const b = dailyScenario(new Date('2026-11-14T23:59:59.000Z'))
    expect(a.id).toBe(b.id)
  })

  it('consecutive days cycle through the daily scenarios', () => {
    const ids = new Set<string>()
    for (let i = 0; i < DAILY_SCENARIOS.length; i++) {
      ids.add(dailyScenario(new Date(`2026-11-${14 + i}T12:00:00.000Z`)).id)
    }
    expect(ids.size).toBe(DAILY_SCENARIOS.length)
  })

  it('daily challenge id round-trips to the same scenario', () => {
    const id = dailyChallengeId(new Date('2026-11-14T12:00:00.000Z'))
    expect(id).toBe('mp-2026-11-14')
    expect(scenarioForDailyId(id)?.id).toBe(dailyScenario(new Date('2026-11-14T12:00:00.000Z')).id)
    expect(scenarioForDailyId('mp-2026-13-99')).toBeUndefined()
    expect(scenarioForDailyId('not-a-challenge')).toBeUndefined()
  })
})
