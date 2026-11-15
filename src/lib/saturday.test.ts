// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import {
  ctParts, nextSaturdayNoonCT, isSaturdayOpen, saturdayWeekId,
  saturdayScenario, saturdayCountdown, fmtCountdown,
  getSaturdayBest, saveSaturdayBest,
} from './saturday'

// Nov 14, 2026 is a Saturday (HackUTA weekend). Central is on CST (UTC-6) in November.
const FRI_NIGHT = new Date('2026-11-14T02:00:00.000Z') // Fri 20:00 CT
const SAT_NOON = new Date('2026-11-14T18:00:00.000Z') // Sat 12:00 CT
const SAT_AFTERNOON = new Date('2026-11-14T18:30:00.000Z') // Sat 12:30 CT
const SUNDAY = new Date('2026-11-15T16:00:00.000Z') // Sun 10:00 CT
const MONDAY = new Date('2026-11-16T15:00:00.000Z') // Mon 09:00 CT

function makeStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => void store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    length: 0,
  }
}

beforeEach(() => {
  Object.assign(globalThis, { localStorage: makeStorage() })
})

describe('Saturday Challenge window (Central Time)', () => {
  it('Central parts are right for the HackUTA weekend', () => {
    expect(ctParts(SAT_NOON)).toMatchObject({ weekday: 6, hour: 12 })
    expect(ctParts(FRI_NIGHT)).toMatchObject({ weekday: 5, hour: 20 })
    expect(ctParts(SUNDAY)).toMatchObject({ weekday: 0, hour: 10 })
  })

  it('the next opening from Friday night is Saturday noon Central', () => {
    expect(nextSaturdayNoonCT(FRI_NIGHT).toISOString()).toBe('2026-11-14T18:00:00.000Z')
  })

  it('is open Saturday afternoon and Sunday, closed Friday night and Monday', () => {
    expect(isSaturdayOpen(FRI_NIGHT)).toBe(false)
    expect(isSaturdayOpen(SAT_NOON)).toBe(true)
    expect(isSaturdayOpen(SAT_AFTERNOON)).toBe(true)
    expect(isSaturdayOpen(SUNDAY)).toBe(true)
    expect(isSaturdayOpen(MONDAY)).toBe(false)
  })

  it('the week id is the Saturday date, even on Sunday', () => {
    expect(saturdayWeekId(SAT_AFTERNOON)).toBe('2026-11-14')
    expect(saturdayWeekId(SUNDAY)).toBe('2026-11-14')
    expect(saturdayWeekId(FRI_NIGHT)).toBe('2026-11-14')
  })

  it('the Saturday scenario is stable within a week and rotates', () => {
    expect(saturdayScenario(SAT_AFTERNOON).id).toBe(saturdayScenario(SUNDAY).id)
    const nextWeek = saturdayScenario(new Date('2026-11-21T18:30:00.000Z'))
    expect(['saturday-1', 'saturday-2']).toContain(nextWeek.id)
  })

  it('countdown points at the next opening when closed', () => {
    const cd = saturdayCountdown(FRI_NIGHT)
    expect(cd.open).toBe(false)
    expect(cd.label).toBe('Opens in')
    // Friday 20:00 CT -> Saturday 12:00 CT = 16 hours = 57,600 s
    expect(cd.seconds).toBe(57_600)
    expect(fmtCountdown(57_600)).toBe('16:00:00')
  })

  it('opens at noon even when the timer was sampled mid-second', () => {
    const justBefore = new Date('2026-11-14T17:59:59.875Z')
    expect(nextSaturdayNoonCT(justBefore).toISOString()).toBe('2026-11-14T18:00:00.000Z')
    expect(saturdayCountdown(justBefore).seconds).toBe(1)
  })

  it('counts to Monday in Central Time across the fall DST change', () => {
    const beforeFallBack = new Date('2026-10-31T17:00:00.000Z')
    expect(saturdayCountdown(beforeFallBack).seconds).toBe(37 * 3600)
  })

  it('countdown formats days and hours', () => {
    expect(fmtCountdown(90_061)).toBe('1d 01:01:01')
    expect(fmtCountdown(65)).toBe('00:01:05')
  })
})

describe('personal best (this device only)', () => {
  it('saves a best, keeps the higher score, and never claims a shared leaderboard', () => {
    expect(getSaturdayBest('2026-11-14')).toBeNull()
    expect(saveSaturdayBest('2026-11-14', { score: 250, roundsWon: 2, creditsLeft: 2, at: '2026-11-14T18:30:00.000Z' })).toBe(true)
    expect(saveSaturdayBest('2026-11-14', { score: 200, roundsWon: 1, creditsLeft: 0, at: '2026-11-14T19:00:00.000Z' })).toBe(false)
    expect(getSaturdayBest('2026-11-14')?.score).toBe(250)
    expect(saveSaturdayBest('2026-11-14', { score: 300, roundsWon: 3, creditsLeft: 1, at: '2026-11-14T19:30:00.000Z' })).toBe(true)
    expect(getSaturdayBest('2026-11-14')?.score).toBe(300)
  })
})
