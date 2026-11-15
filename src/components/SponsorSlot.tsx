// One clearly labelled EXAMPLE sponsor placement. It appears AFTER the
// score, never during gameplay. The counts are real — but only for this
// browser: they come from localStorage (see src/lib/stats.ts) and are
// always labelled "on this device". A gaming brand could pay a flat fee
// to sponsor a Saturday Challenge and get a report on starts,
// completions and offer clicks; this card shows what that report would
// look like, with this device's numbers as the example.

import { useState } from 'react'
import { getStats, incStat } from '../lib/stats'

export function SponsorSlot() {
  const [expanded, setExpanded] = useState(false)
  const stats = getStats()
  const handleLearnMore = () => {
    if (!expanded) incStat('sponsorClicks')
    setExpanded(!expanded)
  }
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-left">
      <p className="text-[11px] font-bold tracking-widest text-zinc-500">Sponsor placement preview</p>
      <p className="mt-2 text-sm text-zinc-300">
        A gaming brand could sponsor a Saturday Challenge for a flat fee and get a report on starts, completions
        and offer clicks.
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        On this device: {stats.satStarts} Saturday starts · {stats.satCompletions} completions · {stats.sponsorClicks} sponsor details opened.
      </p>
      <button
        onClick={handleLearnMore}
        className="mt-3 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-500"
      >
        {expanded ? 'Hide sponsor details' : 'See what a sponsor gets'}
      </button>
      {expanded && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          A Saturday sponsor would get: their name on the event card, this placement after the score, and a weekly
          report with starts, completions and offer clicks. Pricing is a flat fee agreed with the sponsor — no
          revenue share, no player data, no tracking beyond the counts shown above.
        </p>
      )}
    </section>
  )
}
