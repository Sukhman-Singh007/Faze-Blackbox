// Daily Match Point — shared presentation for room co-op and local
// (solo / challenge-link / Saturday / pack-sample) runs. The parent
// owns the state and persistence; this component renders the role
// views, the 90-second clock, round results and the results screen.
//
// Roles: Legacy sees opponent tendencies + next-round warning.
// Recruit sees the plays, their costs, and locks the choice.
// Solo practice shows one role at a time with a switcher.

import { useEffect, useRef, useState } from 'react'
import {
  PLAYS, MATCH_SECONDS, ROUNDS, matchScore,
  type MatchState, type PlayId, type Scenario,
} from '../lib/matchpoint'
import type { Role } from '../lib/puzzles'
import { challengeShareText } from '../lib/challenges'
import { copyText } from '../lib/clipboard'
import { SponsorSlot } from './SponsorSlot'

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export interface MatchPointGameProps {
  scenario: Scenario
  state: MatchState
  role: Role
  solo: boolean
  /** ms epoch when the 90-second clock started; null while waiting. */
  startedAtMs: number | null
  /** ms epoch when the match completed; null while playing. */
  completedAtMs: number | null
  contextLabel: string
  challengeId: string
  isPreview?: boolean
  onLock: (playId: PlayId) => void
  onContinue: () => void
  onTimeout: () => void
  onSwitchRole?: () => void
  onReplay?: () => void
  onExit: () => void
}

export function MatchPointGame(props: MatchPointGameProps) {
  const { scenario, state, role, solo, startedAtMs, completedAtMs, contextLabel, challengeId } = props
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [copied, setCopied] = useState(false)
  const timeoutFired = useRef(false)

  const remainingMs = startedAtMs == null ? MATCH_SECONDS * 1000 : MATCH_SECONDS * 1000 - (nowMs - startedAtMs)
  const secondsLeftAtEnd =
    startedAtMs != null && completedAtMs != null
      ? Math.max(0, MATCH_SECONDS - Math.floor((completedAtMs - startedAtMs) / 1000))
      : 0

  // Tick the clock while the match is live.
  useEffect(() => {
    if (state.phase === 'done' || startedAtMs == null) return
    const t = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [state.phase, startedAtMs])

  // Time expired: tell the parent once.
  useEffect(() => {
    if (state.phase === 'done' || startedAtMs == null) return
    if (remainingMs <= 0 && !timeoutFired.current) {
      timeoutFired.current = true
      props.onTimeout()
    }
  }, [remainingMs, state.phase, startedAtMs, props])

  useEffect(() => {
    timeoutFired.current = false
  }, [state.round, state.phase])

  const roundDef = scenario.rounds[Math.min(state.round, ROUNDS) - 1]
  const lastResult = state.results[state.results.length - 1]
  const score = state.phase === 'done' ? matchScore(state, secondsLeftAtEnd) : 0

  const handleChallenge = async () => {
    const line =
      state.phase === 'done'
        ? `I won ${state.roundsWon}/${ROUNDS} rounds with ${state.credits} credits left in ${contextLabel} (score ${score})!`
        : `I'm playing ${contextLabel} — ${scenario.opponent}.`
    const ok = await copyText(challengeShareText(line, challengeId))
    setCopied(ok)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-center">
      <p className="text-xs font-bold tracking-widest text-red-400">{contextLabel.toUpperCase()}</p>
      <h1 className="mt-1 text-3xl font-black">Daily Match Point</h1>
      <p className="mt-1 text-sm text-zinc-400">
        vs <span className="font-bold text-zinc-200">{scenario.opponent}</span> — {scenario.style}
      </p>
      {props.isPreview && (
        <p className="mx-auto mt-3 max-w-md rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
          Preview — the Saturday Challenge opens Saturday at 12 p.m. Central. Preview scores do not count toward your
          personal best.
        </p>
      )}

      {/* Match status bar */}
      <div className="mt-4 flex items-center justify-center gap-3 text-sm">
        <span className="rounded-full border border-zinc-700 px-3 py-1">Round {Math.min(state.round, ROUNDS)} / {ROUNDS}</span>
        <span className="rounded-full border border-zinc-700 px-3 py-1">Credits: <b>{state.credits}</b> / 6</span>
        <span className={`rounded-full border px-3 py-1 font-mono ${remainingMs < 15_000 && state.phase !== 'done' ? 'border-red-500 text-red-300' : 'border-zinc-700'}`}>
          {fmtClock(remainingMs)}
        </span>
        <span className="rounded-full border border-zinc-700 px-3 py-1">Won: <b>{state.roundsWon}</b></span>
      </div>

      {solo && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
          Solo practice — you are playing both roles. You are viewing the{' '}
          <b>{role === 'legacy' ? 'Legacy Agent' : 'New Recruit'}</b>.
          <button onClick={props.onSwitchRole} className="ml-3 rounded-lg border border-zinc-600 px-3 py-1 text-xs font-bold hover:border-zinc-400">
            Switch to {role === 'legacy' ? 'New Recruit' : 'Legacy Agent'}
          </button>
        </div>
      )}

      {state.phase === 'play' && role === 'legacy' && (
        <div className="mt-6 space-y-4 text-left">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs font-bold tracking-widest text-red-400">OPPONENT TENDENCIES — ROUND {state.round}</p>
            <p className="mt-2 text-lg leading-relaxed">{roundDef.tendency}</p>
          </section>
          <section className="rounded-2xl border border-amber-800/60 bg-amber-950/30 p-5">
            <p className="text-xs font-bold tracking-widest text-amber-300">WARNING — NEXT ROUND</p>
            <p className="mt-2 leading-relaxed text-amber-100">{roundDef.nextWarning}</p>
          </section>
          <p className="text-center text-sm text-zinc-500">
            Your Recruit sees the plays and the costs. Talk it out, then they lock the choice.
          </p>
        </div>
      )}

      {state.phase === 'play' && role === 'recruit' && (
        <div className="mt-6 space-y-3 text-left">
          <p className="text-center text-sm text-zinc-400">
            Pick the team's play. Your Legacy Agent sees what the opponent is doing — ask them first.
          </p>
          {PLAYS.map((play) => {
            const affordable = play.cost <= state.credits
            return (
              <button
                key={play.id}
                disabled={!affordable}
                onClick={() => props.onLock(play.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-left hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>
                  <span className="block font-bold">{play.name}</span>
                  <span className="block text-sm text-zinc-400">{play.blurb}</span>
                </span>
                <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-sm font-bold">
                  {play.cost === 0 ? 'FREE' : `${play.cost} credits`}
                </span>
              </button>
            )
          })}
          <p className="text-center text-xs text-zinc-500">
            Save is free and always available — it loses the round but keeps your credits for later.
          </p>
        </div>
      )}

      {state.phase === 'result' && lastResult && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className={`text-sm font-black tracking-widest ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult.won ? 'ROUND WON' : 'ROUND LOST'} — ROUND {lastResult.round}
          </p>
          <p className="mt-2 text-lg">You played <b>{lastResult.playName}</b>.</p>
          <p className="mt-2 leading-relaxed text-zinc-300">{lastResult.explanation}</p>
          <p className="mt-3 text-sm text-zinc-500">Credits left: <b className="text-zinc-200">{state.credits}</b></p>
          <button
            onClick={props.onContinue}
            className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-bold hover:bg-red-500"
          >
            {state.round >= ROUNDS ? 'See results' : `Continue to round ${state.round + 1}`}
          </button>
        </div>
      )}

      {state.phase === 'done' && (
        <div className="mt-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-sm font-black tracking-widest text-green-400">MATCH COMPLETE</p>
            <p className="mt-3 text-4xl font-black">
              {state.roundsWon} / {ROUNDS} rounds won
            </p>
            <p className="mt-1 text-zinc-400">Credits left: <b className="text-zinc-200">{state.credits}</b></p>
            <p className="mt-4 text-sm text-zinc-400">
              Score <b className="text-zinc-100">{score}</b> = {state.roundsWon} rounds × 100 + {state.credits} credits × 25
              + {secondsLeftAtEnd} seconds left
            </p>
            {state.timedOut && (
              <p className="mt-2 text-sm text-amber-300">Time ran out — unplayed rounds counted as lost.</p>
            )}
            <ul className="mt-4 space-y-2 text-left text-sm">
              {state.results.map((r) => (
                <li key={r.round} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                  <b>Round {r.round}:</b> {r.playName} — {r.won ? 'won' : 'lost'}.{' '}
                  <span className="text-zinc-400">{r.explanation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleChallenge}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
            >
              {copied ? 'Challenge link copied!' : 'Challenge a Friend'}
            </button>
            {props.onReplay && (
              <button onClick={props.onReplay} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-zinc-500">
                Play again
              </button>
            )}
            <button onClick={props.onExit} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-zinc-500">
              Back to home
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            The link opens the same challenge for your friend — their own run, no answers in the link.
          </p>

          <SponsorSlot />
        </div>
      )}
    </div>
  )
}
