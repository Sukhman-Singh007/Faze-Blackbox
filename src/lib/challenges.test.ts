import { describe, it, expect } from 'vitest'
import { challengeId, parseChallenge, challengeShareText } from './challenges'

describe('challenge links', () => {
  it('every challenge id round-trips through parse + id', () => {
    const ids = [
      'mp-2026-11-14',
      'mp-scen-stackers',
      'mp-scen-pack-sample',
      'sat-2026-11-14',
      'qp-nba-2026-11-14',
      'qp-mixed-2026-11-14',
    ]
    for (const id of ids) {
      const ref = parseChallenge(id)
      expect(ref).not.toBeNull()
      expect(challengeId(ref!)).toBe(id)
    }
  })

  it('rejects room codes and junk', () => {
    expect(parseChallenge('ABC123')).toBeNull()
    expect(parseChallenge('room-ABC123')).toBeNull()
    expect(parseChallenge('')).toBeNull()
    expect(parseChallenge('mp-2026-11-14-extra')).toBeNull()
    expect(parseChallenge('qp-chess-2026-11-14')).toBeNull()
  })

  it('the share text carries the link and no answers or player details', () => {
    const text = challengeShareText('I won 2/3 rounds with 2 credits left!', 'mp-2026-11-14')
    expect(text).toContain('challenge=mp-2026-11-14')
    expect(text).not.toMatch(/SNIP|HOUSE|FIVE|rush|fake/i)
  })
})
