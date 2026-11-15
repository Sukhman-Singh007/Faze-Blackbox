// Saturday Challenge event card — free weekly challenge, open every
// Saturday at 12:00 p.m. Central through Sunday. Shows the countdown,
// the published scoring rules, the personal best (this device only),
// and a labelled preview so the format can be tried any day.
//
// Cash prize preview: an EXAMPLE only. This build collects no entry
// fees and promises no payout.

import { useEffect, useState } from 'react'
import {
  fmtCountdown, getSaturdayBest, isSaturdayOpen, saturdayCountdown,
  saturdayScenario, saturdayWeekId,
} from '../lib/saturday'

export interface SaturdayCardProps {
  onPlay: () => void
}

export function SaturdayCard({ onPlay }: SaturdayCardProps) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const open = isSaturdayOpen(now)
  const cd = saturdayCountdown(now)
  const weekId = saturdayWeekId(now)
  const scenario = saturdayScenario(now)
  const best = getSaturdayBest(weekId)

  return (
    <section id="saturday" className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-red-400">FREE WEEKLY EVENT</p>
          <h2 className="mt-1 text-2xl font-black">Saturday Challenge</h2>
          <p className="mt-1 text-sm text-zinc-400">
            This week: vs <b className="text-zinc-200">{scenario.opponent}</b> — {scenario.style}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${open ? 'border-green-500 text-green-300' : 'border-amber-600 text-amber-300'}`}>
          {open ? 'OPEN NOW' : 'OPENS SATURDAY 12 P.M. CT'}
        </span>
      </div>

      <p className="mt-4 font-mono text-2xl font-black tabular-nums">
        {cd.label}: {fmtCountdown(cd.seconds)}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Opens every Saturday at 12 p.m. Central, closes at the end of Sunday. Everyone plays the same challenge.
      </p>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-left text-sm">
        <p className="text-xs font-bold tracking-widest text-zinc-400">SCORING RULES</p>
        <p className="mt-1 leading-relaxed text-zinc-300">
          Score = 100 per round won + 10 per credit left + 1 per 3 seconds remaining (up to 30).
          Three rounds, six shared credits, one free Save play so a team can always finish.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {best
            ? `Personal best on this device (week of ${weekId}): ${best.score} points — ${best.roundsWon}/3 rounds, ${best.creditsLeft} credits left.`
            : `No personal best yet for the week of ${weekId}. Scores are stored only in this browser.`}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {open ? (
          <button onClick={onPlay} className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500">
            Play the Saturday Challenge
          </button>
        ) : (
          <button onClick={onPlay} className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500">
            Try the preview
          </button>
        )}
      </div>
      {!open && (
        <p className="mt-2 text-xs text-zinc-500">
          Preview — same format, playable any day. Preview scores do not count toward your personal best.
        </p>
      )}

      <div className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-left text-sm">
        <p className="text-xs font-bold tracking-widest text-zinc-400">CASH PRIZE PREVIEW — EXAMPLE ONLY</p>
        <p className="mt-1 leading-relaxed text-zinc-300">
          Future format: a sponsor funds a prize for the top score. The current challenge is free to play and awards a personal best on this device.
        </p>
      </div>
    </section>
  )
}
