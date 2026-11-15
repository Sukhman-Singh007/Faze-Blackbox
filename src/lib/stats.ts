// Interaction counts, stored only in this browser. These are the ONLY
// numbers the app ever shows as counts — and they are always labelled
// "on this device". Nothing is sent to a server. If a count is not
// tracked here, the app must not display it as a number.

export type StatKey =
  | 'mpStarts'
  | 'mpCompletions'
  | 'qpStarts'
  | 'qpCompletions'
  | 'satStarts'
  | 'satCompletions'
  | 'sponsorClicks'
  | 'packInterested'

const KEY = 'faze-blackbox:stats'

export function getStats(): Record<StatKey, number> {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      mpStarts: parsed.mpStarts ?? 0,
      mpCompletions: parsed.mpCompletions ?? 0,
      qpStarts: parsed.qpStarts ?? 0,
      qpCompletions: parsed.qpCompletions ?? 0,
      satStarts: parsed.satStarts ?? 0,
      satCompletions: parsed.satCompletions ?? 0,
      sponsorClicks: parsed.sponsorClicks ?? 0,
      packInterested: parsed.packInterested ?? 0,
    }
  } catch {
    return {
      mpStarts: 0, mpCompletions: 0, qpStarts: 0, qpCompletions: 0,
      satStarts: 0, satCompletions: 0, sponsorClicks: 0, packInterested: 0,
    }
  }
}

export function incStat(key: StatKey): void {
  try {
    const stats = getStats()
    stats[key] += 1
    localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    /* stats are best-effort */
  }
}
