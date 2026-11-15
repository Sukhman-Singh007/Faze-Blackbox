// Saturday Challenge — a free weekly challenge that opens every
// Saturday at 12:00 p.m. Central Time and stays open through Sunday.
// Everyone gets the same challenge for the week. Scores are stored
// only in this browser, so they are always labelled
// "Personal best on this device."
//
// Cash prizes: the default build collects NO entry fees and promises
// NO payout. The card shows an optional "Cash prize preview" that is
// clearly labelled as an example. A real prize event would need
// confirmed funding, published contest rules, and server-verified
// results — see README / DEVPOST.

import { SATURDAY_SCENARIOS, type Scenario } from './matchpoint'

const CT = 'America/Chicago'

export interface CTParts {
  weekday: number // 0 = Sunday … 6 = Saturday
  hour: number
  year: number
  month: number // 0-based
  day: number
}

export function ctParts(d = new Date()): CTParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CT,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]))
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    weekday: weekdays[parts.weekday] ?? 0,
    hour: Number(parts.hour) % 24,
    year: Number(parts.year),
    month: Number(parts.month) - 1,
    day: Number(parts.day),
  }
}

/** Offset of Central Time from UTC at `d`, in ms (negative in CST/CDT). */
function ctOffsetMs(d: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]))
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - d.getTime()
}

/** The next Saturday 12:00 p.m. Central, as an instant. */
export function nextSaturdayNoonCT(now = new Date()): Date {
  const offset = ctOffsetMs(now)
  const ctNow = now.getTime() + offset
  const ctDate = new Date(ctNow)
  const daysAhead = (6 - ctDate.getUTCDay() + 7) % 7
  let targetCt = Date.UTC(
    ctDate.getUTCFullYear(),
    ctDate.getUTCMonth(),
    ctDate.getUTCDate() + daysAhead,
    12, 0, 0,
  )
  if (targetCt <= ctNow) targetCt += 7 * 86_400_000
  // Convert the CT wall clock back to UTC (recompute offset at target
  // so a DST change mid-week does not shift the result).
  let targetUtc = targetCt - offset
  targetUtc = targetCt - ctOffsetMs(new Date(targetUtc))
  return new Date(targetUtc)
}

/** Is the Saturday Challenge open right now? Open Saturday 12:00 CT
 *  through end of Sunday CT. */
export function isSaturdayOpen(now = new Date()): boolean {
  const p = ctParts(now)
  if (p.weekday === 6 && p.hour >= 12) return true
  if (p.weekday === 0) return true
  return false
}

/** Week id = the CT date of the Saturday that opens the week, e.g.
 *  "2026-11-14". Stable for the whole open weekend. */
export function saturdayWeekId(now = new Date()): string {
  const p = ctParts(now)
  // If it is Sunday, the week belongs to yesterday (Saturday).
  const dayShift = p.weekday === 0 ? -1 : 0
  const d = new Date(Date.UTC(p.year, p.month, p.day + dayShift))
  return d.toISOString().slice(0, 10)
}

/** Which Saturday scenario runs this week. Rotates weekly. */
export function saturdayScenario(now = new Date()): Scenario {
  const weekId = saturdayWeekId(now)
  const weekNumber = Math.floor(new Date(`${weekId}T00:00:00.000Z`).getTime() / (7 * 86_400_000))
  return SATURDAY_SCENARIOS[((weekNumber % SATURDAY_SCENARIOS.length) + SATURDAY_SCENARIOS.length) % SATURDAY_SCENARIOS.length]
}

/** Seconds until the next opening (or until it closes, if open). */
export function saturdayCountdown(now = new Date()): { open: boolean; seconds: number; label: string } {
  if (isSaturdayOpen(now)) {
    // Closes at Monday 00:00 CT.
    const p = ctParts(now)
    const daysToMonday = (8 - p.weekday) % 7
    const closeCt = Date.UTC(p.year, p.month, p.day + daysToMonday, 0, 0, 0)
    const offset = ctOffsetMs(now)
    const seconds = Math.max(0, Math.floor((closeCt - offset - now.getTime()) / 1000))
    return { open: true, seconds, label: 'Closes in' }
  }
  const next = nextSaturdayNoonCT(now)
  return { open: false, seconds: Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000)), label: 'Opens in' }
}

export function fmtCountdown(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86_400)
  const h = Math.floor((totalSeconds % 86_400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

// --- Personal best (this device only) ---

export interface SaturdayBest {
  score: number
  roundsWon: number
  creditsLeft: number
  at: string
}

const BEST_KEY = (weekId: string) => `faze-blackbox:sat-best:${weekId}`

export function getSaturdayBest(weekId: string): SaturdayBest | null {
  try {
    const raw = localStorage.getItem(BEST_KEY(weekId))
    return raw ? (JSON.parse(raw) as SaturdayBest) : null
  } catch {
    return null
  }
}

/** Returns true if this run set a new personal best. */
export function saveSaturdayBest(weekId: string, best: SaturdayBest): boolean {
  try {
    const prev = getSaturdayBest(weekId)
    if (prev && prev.score >= best.score) return false
    localStorage.setItem(BEST_KEY(weekId), JSON.stringify(best))
    return true
  } catch {
    return false
  }
}
