// Daily Match Point — 90-second esports strategy game.
// Three rounds, six shared credits. Legacy sees opponent tendencies +
// a warning about the next round. Recruit sees the plays, their costs,
// and locks in the team's choice.
//
// Outcome rule (the whole game in one table): every play beats some
// opponent plans and loses to others. The same play wins in one
// scenario and loses in another — and the Legacy dossier always says
// WHY (the tendency text names the plan). No randomness in outcomes:
// the same (scenario, round, play) always gives the same result, so a
// challenge link reproduces the exact challenge for a friend.

export type PlayId = 'rush' | 'default' | 'fake' | 'mid' | 'save'
export type OpponentPlan = 'stack' | 'aggro' | 'passive' | 'rotate'

export interface PlayDef {
  id: PlayId
  name: string
  cost: number
  blurb: string
}

export const PLAYS: PlayDef[] = [
  { id: 'rush', name: 'Rush the site', cost: 2, blurb: 'Fast hit. High risk, high reward.' },
  { id: 'default', name: 'Slow default', cost: 1, blurb: 'Take map control, gather info, then hit.' },
  { id: 'fake', name: 'Fake and rotate', cost: 3, blurb: 'Sell a hit on one site, strike the other.' },
  { id: 'mid', name: 'Mid control push', cost: 2, blurb: 'Fight for mid, then collapse.' },
  { id: 'save', name: 'Save / eco round', cost: 0, blurb: 'Free. Give up the round, keep your credits.' },
]

export const STARTING_CREDITS = 6
export const MATCH_SECONDS = 90
export const ROUNDS = 3

export interface PlayOutcome {
  won: boolean
  /** Exactly one sentence — shown to both players after the round. */
  text: string
}

/** Outcome matrix: play × opponent plan. */
export const OUTCOMES: Record<PlayId, Record<OpponentPlan, PlayOutcome>> = {
  rush: {
    stack: { won: false, text: 'You rushed straight into a full stack and got traded out.' },
    aggro: { won: false, text: 'Both teams rushed — their duelists won the opening fight.' },
    passive: { won: true, text: 'They gave up space and you took the site for free.' },
    rotate: { won: true, text: 'You hit before their rotation could arrive.' },
  },
  default: {
    stack: { won: true, text: 'Your slow default gathered info and walked around the stack.' },
    aggro: { won: false, text: 'They took mid while you waited, then pinched you.' },
    passive: { won: true, text: 'You took free map control while they sat back.' },
    rotate: { won: false, text: 'They rotated faster than your default developed.' },
  },
  fake: {
    stack: { won: true, text: 'Your fake pulled the stack away and the real hit found an empty site.' },
    aggro: { won: false, text: 'They pushed through your fake and caught you split apart.' },
    passive: { won: true, text: 'Your fake froze them in place while you walked onto the site.' },
    rotate: { won: false, text: 'Their rotators read the fake and were already waiting.' },
  },
  mid: {
    stack: { won: false, text: 'You pushed mid into a prepared crossfire.' },
    aggro: { won: true, text: 'You met their push prepared and won the mid fight.' },
    passive: { won: false, text: 'You pushed mid into nothing — they were already set on the site.' },
    rotate: { won: true, text: 'You caught their rotators mid-move.' },
  },
  save: {
    stack: { won: false, text: 'You saved this round — the round is lost, but your credits are untouched.' },
    aggro: { won: false, text: 'You saved this round — the round is lost, but your credits are untouched.' },
    passive: { won: false, text: 'You saved this round — the round is lost, but your credits are untouched.' },
    rotate: { won: false, text: 'You saved this round — the round is lost, but your credits are untouched.' },
  },
}

export function resolvePlay(playId: PlayId, plan: OpponentPlan): PlayOutcome {
  return OUTCOMES[playId][plan]
}

export interface ScenarioRound {
  plan: OpponentPlan
  /** What the Legacy Agent sees about THIS round. Names the plan in plain words. */
  tendency: string
  /** Warning about the NEXT round (for round 3: the final-round warning). */
  nextWarning: string
}

export interface Scenario {
  id: string
  name: string
  opponent: string
  style: string
  rounds: [ScenarioRound, ScenarioRound, ScenarioRound]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'stackers',
    name: 'Ironwall Five',
    opponent: 'Ironwall Five',
    style: 'Patient and disciplined. They stack sites and punish rushes.',
    rounds: [
      {
        plan: 'passive',
        tendency: 'They are giving up space early and playing for retakes.',
        nextWarning: 'Next round: expect a hard stack on one site — a fake could pull them apart.',
      },
      {
        plan: 'stack',
        tendency: 'They are stacking one site with four defenders.',
        nextWarning: 'Next round: their rotations are the fastest we have seen — hit before they arrive.',
      },
      {
        plan: 'rotate',
        tendency: 'Their rotations are the fastest we have seen — they collapse on any hit.',
        nextWarning: 'Final round — they will throw everything at the site. Spend what you have left.',
      },
    ],
  },
  {
    id: 'rushers',
    name: 'Blitzline',
    opponent: 'Blitzline',
    style: 'All aggression. They fight for every inch of mid.',
    rounds: [
      {
        plan: 'aggro',
        tendency: 'They are sprinting into mid every round — duels from the first second.',
        nextWarning: 'Next round: more of the same — they will not slow down. Meet them prepared, or dodge them.',
      },
      {
        plan: 'aggro',
        tendency: 'Same again — full aggression straight through mid.',
        nextWarning: 'Next round: they finally slow down and stack a site. A slow default beats a stack.',
      },
      {
        plan: 'stack',
        tendency: 'They have switched to a hard stack — four defenders on one site.',
        nextWarning: 'Final round — punish the stack with patience, or a fake.',
      },
    ],
  },
  {
    id: 'rotators',
    name: 'Ghost Shift',
    opponent: 'Ghost Shift',
    style: 'Never where you expect. They rotate faster than anyone.',
    rounds: [
      {
        plan: 'rotate',
        tendency: 'They rotate at the first sound — nobody stays put.',
        nextWarning: 'Next round: they go quiet and passive. Take the free space.',
      },
      {
        plan: 'passive',
        tendency: 'They have gone quiet — giving up space, waiting for you to come to them.',
        nextWarning: 'Next round: a hard stack. Do not rush into it.',
      },
      {
        plan: 'stack',
        tendency: 'Four defenders stacked on one site.',
        nextWarning: 'Final round — the stack is the test. Fake it, or walk around it.',
      },
    ],
  },
  {
    id: 'saturday-1',
    name: 'The Underdogs',
    opponent: 'The Underdogs',
    style: 'Saturday special. Scrappy, unpredictable, nothing to lose.',
    rounds: [
      {
        plan: 'passive',
        tendency: 'They are sitting back, letting you make the first move.',
        nextWarning: 'Next round: they come out swinging through mid.',
      },
      {
        plan: 'aggro',
        tendency: 'Full aggression through mid — they are not holding back.',
        nextWarning: 'Next round: a hard stack. Patience beats it.',
      },
      {
        plan: 'stack',
        tendency: 'Four defenders stacked on one site for the decider.',
        nextWarning: 'Final round — everything on the line. Spend your credits.',
      },
    ],
  },
  {
    id: 'saturday-2',
    name: 'The Gauntlet',
    opponent: 'The Gauntlet',
    style: 'Saturday special. A different test every round — no comfortable answers.',
    rounds: [
      {
        plan: 'stack',
        tendency: 'A hard stack from the very first round — they dare you to rush.',
        nextWarning: 'Next round: their rotations speed up. Hit fast or not at all.',
      },
      {
        plan: 'rotate',
        tendency: 'They are rotating on every sound — the map feels empty until it is not.',
        nextWarning: 'Next round: pure aggression through mid.',
      },
      {
        plan: 'aggro',
        tendency: 'All five pushing mid for the final round.',
        nextWarning: 'Final round — meet them head-on, or let them run past you.',
      },
    ],
  },
  {
    id: 'pack-sample',
    name: 'The Comeback Kings',
    opponent: 'The Comeback Kings',
    style: 'Creator Challenge Pack sample. They never lose a lead quietly.',
    rounds: [
      {
        plan: 'stack',
        tendency: 'They stack the site and dare you to test them.',
        nextWarning: 'Next round: they go quiet and give up space.',
      },
      {
        plan: 'passive',
        tendency: 'They have gone passive — free map control if you take it.',
        nextWarning: 'Next round: full aggression through mid.',
      },
      {
        plan: 'aggro',
        tendency: 'Five players rushing mid for the decider.',
        nextWarning: 'Final round — win the mid fight and the match is yours.',
      },
    ],
  },
]

export const DAILY_SCENARIOS = SCENARIOS.filter((s) => ['stackers', 'rushers', 'rotators'].includes(s.id))
export const SATURDAY_SCENARIOS = SCENARIOS.filter((s) => s.id.startsWith('saturday-'))

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}

/** UTC date string, e.g. "2026-11-14". The daily challenge is the same
 *  for everyone on the same UTC day. */
export function utcDateStr(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

/** Which scenario is today's Daily Match Point. Deterministic: day
 *  number since epoch, mod the number of daily scenarios. */
export function dailyScenario(date = new Date()): Scenario {
  const dayNumber = Math.floor(date.getTime() / 86_400_000)
  return DAILY_SCENARIOS[((dayNumber % DAILY_SCENARIOS.length) + DAILY_SCENARIOS.length) % DAILY_SCENARIOS.length]
}

export function dailyChallengeId(date = new Date()): string {
  return `mp-${utcDateStr(date)}`
}

/** Scenario for a daily challenge id like "mp-2026-11-14". */
export function scenarioForDailyId(id: string): Scenario | undefined {
  const m = /^mp-(\d{4}-\d{2}-\d{2})$/.exec(id)
  if (!m) return undefined
  const d = new Date(`${m[1]}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return undefined
  return dailyScenario(d)
}

export interface RoundResult {
  round: number
  playId: PlayId
  playName: string
  won: boolean
  explanation: string
}

export type MatchPhase = 'play' | 'result' | 'done'

export interface MatchState {
  scenarioId: string
  challengeId: string
  round: number // current round 1..3; 4 when done
  phase: MatchPhase
  credits: number
  roundsWon: number
  results: RoundResult[]
  timedOut: boolean
}

export function newMatchState(scenarioId: string, challengeId: string): MatchState {
  return {
    scenarioId,
    challengeId,
    round: 1,
    phase: 'play',
    credits: STARTING_CREDITS,
    roundsWon: 0,
    results: [],
    timedOut: false,
  }
}

/** Lock in a play for the current round. Returns the new state (pure).
 *  Throws on an illegal lock (wrong phase, unaffordable play). */
export function lockPlay(state: MatchState, playId: PlayId): MatchState {
  if (state.phase !== 'play') throw new Error('Cannot lock a play outside the play phase')
  const scenario = getScenario(state.scenarioId)
  if (!scenario) throw new Error(`Unknown scenario ${state.scenarioId}`)
  const play = PLAYS.find((p) => p.id === playId)
  if (!play) throw new Error(`Unknown play ${playId}`)
  if (play.cost > state.credits) throw new Error(`Play costs ${play.cost} but only ${state.credits} credits are left`)
  const roundDef = scenario.rounds[state.round - 1]
  const outcome = resolvePlay(playId, roundDef.plan)
  const result: RoundResult = {
    round: state.round,
    playId,
    playName: play.name,
    won: outcome.won,
    explanation: outcome.text,
  }
  return {
    ...state,
    phase: 'result',
    credits: state.credits - play.cost,
    roundsWon: state.roundsWon + (outcome.won ? 1 : 0),
    results: [...state.results, result],
  }
}

/** Advance after the round result was shown. */
export function continueMatch(state: MatchState): MatchState {
  if (state.phase !== 'result') throw new Error('Cannot continue outside the result phase')
  if (state.round >= ROUNDS) return { ...state, phase: 'done', round: ROUNDS + 1 }
  return { ...state, phase: 'play', round: state.round + 1 }
}

/** End the match early (time expired): unplayed rounds count as lost. */
export function timeoutMatch(state: MatchState): MatchState {
  if (state.phase === 'done') return state
  const results = [...state.results]
  for (let r = state.round; r <= ROUNDS; r++) {
    if (r === state.round && state.phase === 'result') continue // current round already resolved
    results.push({
      round: r,
      playId: 'save',
      playName: 'Time expired',
      won: false,
      explanation: 'Time ran out before this round was played.',
    })
  }
  return { ...state, phase: 'done', round: ROUNDS + 1, results, timedOut: true }
}

/** Score = rounds won × 100 + credits left × 25 + seconds left (max 90).
 *  Published on the Saturday card and the results screen. */
export function matchScore(state: MatchState, secondsLeft: number): number {
  return state.roundsWon * 100 + state.credits * 25 + Math.max(0, Math.min(MATCH_SECONDS, Math.floor(secondsLeft)))
}
