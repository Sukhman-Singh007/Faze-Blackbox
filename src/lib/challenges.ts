// Friend challenges — shareable links that start an independent run on
// the SAME challenge. The link carries only a challenge ID: no answers,
// no player names, no scores. Room codes are for live co-op rooms;
// challenge IDs are for async friend challenges.
//
// IDs:
//   mp-2026-11-14        Daily Match Point for that UTC date
//   mp-scen-stackers     One specific Match Point scenario
//   sat-2026-11-14       Saturday Challenge for the week of that Saturday (CT date)
//   qp-nba-2026-11-14    Sports Quick Play, category + date
//   qp-mixed-2026-11-14  Mixed round

import type { QPCategory } from './quickplay'

export type ChallengeRef =
  | { kind: 'mp-daily'; date: string }
  | { kind: 'mp-scen'; scenarioId: string }
  | { kind: 'sat'; weekId: string }
  | { kind: 'qp'; category: QPCategory; date: string }

export function challengeId(ref: ChallengeRef): string {
  switch (ref.kind) {
    case 'mp-daily':
      return `mp-${ref.date}`
    case 'mp-scen':
      return `mp-scen-${ref.scenarioId}`
    case 'sat':
      return `sat-${ref.weekId}`
    case 'qp':
      return `qp-${ref.category}-${ref.date}`
  }
}

export function parseChallenge(id: string): ChallengeRef | null {
  let m = /^mp-(\d{4}-\d{2}-\d{2})$/.exec(id)
  if (m) return { kind: 'mp-daily', date: m[1] }
  m = /^mp-scen-([a-z0-9-]+)$/.exec(id)
  if (m) return { kind: 'mp-scen', scenarioId: m[1] }
  m = /^sat-(\d{4}-\d{2}-\d{2})$/.exec(id)
  if (m) return { kind: 'sat', weekId: m[1] }
  m = /^qp-(nba|nfl|soccer|esports|mixed)-(\d{4}-\d{2}-\d{2})$/.exec(id)
  if (m) return { kind: 'qp', category: m[1] as QPCategory, date: m[2] }
  return null
}

export function challengeUrl(id: string): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://faze-blackbox.vercel.app/'
  return `${base}?challenge=${encodeURIComponent(id)}`
}

export function challengeTitle(ref: ChallengeRef): string {
  switch (ref.kind) {
    case 'mp-daily':
      return `Daily Match Point — ${ref.date}`
    case 'mp-scen':
      return 'Match Point challenge'
    case 'sat':
      return `Saturday Challenge — week of ${ref.weekId}`
    case 'qp':
      return `Sports Quick Play — ${ref.category.toUpperCase()} — ${ref.date}`
  }
}

/** Short score message for "Challenge a Friend". The link is the whole
 *  challenge — nothing about the sender's answers travels with it. */
export function challengeShareText(scoreLine: string, id: string): string {
  return `${scoreLine} Can you beat it? ${challengeUrl(id)}`
}
