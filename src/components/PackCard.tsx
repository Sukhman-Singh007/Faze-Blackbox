// Creator Challenge Pack — a PROPOSED offer. Daily play stays free.
// The pack is $4.99 one-time (proposed), includes five extra co-op
// challenges one buyer can play with a friend, and ships one playable
// sample now. The rest are labelled planned. "Play sample" and
// "I'm interested" are the demo actions — no payment is taken.

import { useState } from 'react'
import { CREATOR_PACK_CHALLENGES, CREATOR_PACK_PRICE } from '../lib/config'
import { incStat } from '../lib/stats'

export interface PackCardProps {
  onPlaySample: () => void
}

const PLANNED = [
  'The Slow Grind — a patience test',
  'Midnight Rush — speed rounds',
  'The Mirror Match — same plays, both sides',
  'Grand Final — the hardest stack yet',
]

export function PackCard({ onPlaySample }: PackCardProps) {
  const [interested, setInterested] = useState(false)
  const handleInterested = () => {
    if (!interested) incStat('packInterested')
    setInterested(true)
  }
  return (
    <section id="pack" className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <p className="text-xs font-bold tracking-widest text-red-400">CREATOR CHALLENGE PACK — PROPOSED OFFER</p>
      <h2 className="mt-1 text-2xl font-black">Five extra co-op challenges, yours to keep</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Proposed price: <b className="text-zinc-100">{CREATOR_PACK_PRICE} one-time</b>. Daily play stays free.
        One buyer can play every pack challenge with a friend.
      </p>
      <ul className="mt-4 space-y-2 text-left text-sm">
        <li className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
          <b>Playable now:</b> The Comeback Kings — the pack sample.
          <button onClick={onPlaySample} className="ml-3 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold hover:bg-red-500">
            Play sample
          </button>
        </li>
        {PLANNED.map((name) => (
          <li key={name} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-zinc-400">
            <span className="mr-2 rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-zinc-300">PLANNED</span>
            {name}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">
        {CREATOR_PACK_CHALLENGES} extra co-op challenges in the full pack. No payment is taken in this demo.
      </p>
      <button
        onClick={handleInterested}
        className="mt-4 rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-zinc-500"
      >
        {interested ? 'Thanks — noted! We’ll announce the pack when it’s ready.' : 'I’m interested'}
      </button>
    </section>
  )
}
