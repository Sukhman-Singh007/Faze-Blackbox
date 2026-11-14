import { useEffect, useMemo, useRef, useState } from 'react'
import { STAGES, validateAnswer, type Role } from './lib/puzzles'
import { roomStore, recordCompletion, getHistory, newPlayerId, saveSession, loadSession, clearSession, ownsSeat, type RoomState } from './lib/rooms'
import { validateAnswerServer } from './lib/supabase'

type View = 'landing' | 'lobby' | 'game' | 'complete'

const EPISODES = [
  { week: 'EP 01 — OUT NOW', title: 'The First Key', status: 'Playable now', sponsor: 'Community episode — no sponsor yet', live: true },
  { week: 'EP 02 — NEXT WEEK', title: 'The Red Room Tapes', status: 'Preview', sponsor: 'HYPOTHETICAL sponsored episode — illustrative only, no real partnership', live: false },
  { week: 'EP 03 — COMING SOON', title: 'Signal in the Static', status: 'Announced', sponsor: 'HYPOTHETICAL brand challenge — illustrative only', live: false },
]

function fmt(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [room, setRoom] = useState<RoomState | null>(null)
  const [role, setRole] = useState<Role>('legacy')
  const [solo, setSolo] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [playerId, setPlayerId] = useState(() => loadSession()?.playerId ?? newPlayerId())
  const history = useMemo(() => getHistory(), [view])

  const inviteLink = room ? `${window.location.origin}${window.location.pathname}?room=${room.code}` : ''

  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 2000) }
    catch { setError('Copy failed — select and copy the text manually.'); }
  }

  // Deep link: ?room=XXXXXX pre-fills join
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('room')
    if (c) setJoinCode(c.toUpperCase())
  }, [])

  // Refresh / reconnect: restore this tab's saved seat (sessionStorage is
  // per-tab, so a second tab is a different player, not the same session).
  // Only restores when the session actually owns a seat in the room —
  // an unrelated user can never take an occupied seat this way.
  useEffect(() => {
    const s = loadSession()
    if (!s) return
    const r = roomStore.load(s.code)
    if (r && ownsSeat(r, s.role, s)) {
      setName(s.name); setRole(s.role); setSolo(s.solo); setPlayerId(s.playerId); setRoom(r)
      setView(r.status === 'completed' ? 'complete' : r.status === 'playing' ? 'game' : 'lobby')
    } else {
      clearSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Live sync: subscribe to room updates (BroadcastChannel + storage events).
  // Functional setView calls avoid the stale-`view` closure that could
  // miss the lobby -> game transition, and make a duplicate start a no-op.
  useEffect(() => {
    if (!room) return
    const unsub = roomStore.subscribe(room.code, (r) => {
      setRoom(r)
      if (r.status === 'playing') setView((prev) => (prev === 'lobby' ? 'game' : prev))
      if (r.status === 'completed') setView((prev) => (prev === 'complete' ? prev : 'complete'))
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code])

  async function handleCreate(pickedRole: Role) {
    if (!name.trim()) { setError('Enter your agent name first.'); return }
    setError(''); setLoading(true)
    await new Promise((r) => setTimeout(r, 350)) // visible loading state
    const { room: r, playerId: pid } = roomStore.create(name.trim(), pickedRole, playerId)
    setPlayerId(pid); saveSession({ code: r.code, role: pickedRole, name: name.trim(), playerId: pid, solo: false })
    setRole(pickedRole); setRoom(r); setLoading(false); setView('lobby')
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (!name.trim()) { setError('Enter your agent name first.'); return }
    if (code.length !== 6) { setError('Room codes are 6 characters — check the code and try again.'); return }
    setError(''); setLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const res = roomStore.join(code, name.trim(), playerId)
    setLoading(false)
    if ('error' in res) { setError(res.error); return }
    setPlayerId(res.playerId); saveSession({ code: res.room.code, role: res.role, name: name.trim(), playerId: res.playerId, solo: false })
    setRole(res.role); setRoom(res.room)
    setView(res.room.status === 'playing' ? 'game' : 'lobby')
  }

  function startSolo() {
    if (!name.trim()) { setError('Enter your agent name first — solo practice still needs a name.'); return }
    setError(''); setSolo(true)
    const { room: r, playerId: pid } = roomStore.create(name.trim(), 'legacy', playerId)
    r.legacyJoined = true; r.recruitJoined = true; r.recruitName = name.trim() + ' (solo)'; r.recruitPlayerId = pid; r.status = 'playing'
    roomStore.save(r); setPlayerId(pid); saveSession({ code: r.code, role: 'legacy', name: name.trim(), playerId: pid, solo: true })
    setRole('legacy'); setRoom(r); setView('game')
  }

  function leaveRoom() {
    clearSession()
    setRoom(null); setSolo(false); setView('landing'); setError(''); setJoinCode('')
  }

  return (
    <div className="min-h-screen bg-faze-dark scanlines">
      <header className="sticky top-0 z-40 border-b border-faze-line bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-left">
            <span className="grid h-9 w-9 place-items-center rounded bg-faze-red font-display text-lg">F</span>
            <span className="leading-tight"><span className="block font-display text-base tracking-wide">FAZE BLACKBOX</span>
            <span className="block text-[11px] text-zinc-400">Unlock the Past. Build the Next Generation.</span></span>
          </button>
          <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
            <button onClick={() => { setView('landing'); setShowEpisodes(false) }} className="hover:text-white">How it works</button>
            <button onClick={() => { setView('landing'); setShowEpisodes(true) }} className="hover:text-white">Weekly episodes</button>
            <span className="rounded-full border border-faze-line px-3 py-1 text-xs text-zinc-400">HackUTA 2026 · FaZe Clan Challenge</span>
          </nav>
          {room && <button onClick={leaveRoom} className="rounded-lg border border-faze-line px-3 py-1.5 text-sm hover:border-faze-red">Leave room</button>}
        </div>
      </header>

      {view === 'landing' && (
        <Landing name={name} setName={setName} joinCode={joinCode} setJoinCode={setJoinCode}
          error={error} loading={loading} onCreate={handleCreate} onJoin={handleJoin} onSolo={startSolo}
          copy={copy} copied={copied} showEpisodes={showEpisodes} setShowEpisodes={setShowEpisodes} history={history} />
      )}
      {view === 'lobby' && room && (
        <Lobby room={room} role={role} inviteLink={inviteLink} copy={copy} copied={copied} onLeave={leaveRoom} />
      )}
      {view === 'game' && room && (
        <Game room={room} role={role} solo={solo} setRole={setRole} setRoom={setRoom} onComplete={() => setView('complete')} />
      )}
      {view === 'complete' && room && (
        <Completion room={room} role={role} copy={copy} copied={copied} onAgain={leaveRoom} history={history} inviteLink={inviteLink} />
      )}

      <footer className="border-t border-faze-line py-6 text-center text-xs text-zinc-500">
        FaZe Blackbox — HackUTA 2026 FaZe Clan sponsor challenge. Fan-made demo concept; not affiliated with or endorsed by FaZe Clan.
        Historical timeline slots are placeholders for the sponsor-provided 2010–2026 timeline. Sponsored episodes shown are hypothetical.
      </footer>
    </div>
  )
}

/* ---------------- Landing ---------------- */
function Landing(props: {
  name: string; setName: (v: string) => void; joinCode: string; setJoinCode: (v: string) => void
  error: string; loading: boolean; onCreate: (r: Role) => void; onJoin: () => void; onSolo: () => void
  copy: (t: string, l: string) => void; copied: string; showEpisodes: boolean; setShowEpisodes: (v: boolean) => void
  history: { code: string; ms: number; at: string }[]
}) {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="rise py-14 text-center md:py-20">
        <p className="mb-4 inline-block rounded-full border border-faze-red/60 bg-faze-red/10 px-4 py-1 text-xs font-bold tracking-widest text-red-300">TWO PLAYERS · THREE STAGES · ONE VAULT</p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">FAZE <span className="text-faze-red">BLACKBOX</span></h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">Unlock the Past. Build the Next Generation.</p>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">A cooperative mystery vault. One player holds the history, the other holds the puzzle. Neither can solve it alone — talk, share clues, and open the vault together.</p>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left md:grid-cols-3">
          {[
            ['01 · LEGACY AGENT', 'The longtime fan. You see historical clues your partner cannot see.'],
            ['02 · NEW RECRUIT', 'The new fan. You hold the locked puzzle and the only keypad.'],
            ['03 · THE VAULT', 'Three stages. Three reveals. One final unlock — together.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-faze-line bg-faze-panel p-4 shadow-card">
              <p className="font-mono text-xs font-bold text-faze-red">{t}</p><p className="mt-2 text-sm text-zinc-300">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl pb-14 text-center">
        <h2 className="font-display text-2xl md:text-3xl">OLD FANS KNOW THE HISTORY. <span className="text-faze-red">NEW FANS UNLOCK THE FUTURE.</span></h2>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-300">FaZe has fans who lived its history — and a new generation just discovering it. Blackbox puts them on the same team.</p>
        <div className="mt-6 grid gap-3 text-left md:grid-cols-2">
          <div className="rounded-2xl border border-faze-line bg-faze-panel p-5">
            <p className="font-mono text-xs font-bold text-faze-red">👤 LEGACY AGENT — THE RETURNING FAN</p>
            <p className="mt-2 text-sm text-zinc-300">You know the history. You see the clues a new fan never could — and for the first time, that knowledge is the key to the game.</p>
          </div>
          <div className="rounded-2xl border border-faze-line bg-faze-panel p-5">
            <p className="font-mono text-xs font-bold text-faze-red">🔓 NEW RECRUIT — THE NEW FAN</p>
            <p className="mt-2 text-sm text-zinc-300">You hold the puzzle and the only keypad. You learn FaZe history by playing it — not by reading about it — because your partner has to teach it to you to win.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-400">Each player gets different information. Neither can solve a stage alone. Talking is the mechanic — and every conversation turns a new fan into a FaZe fan.</p>
      </section>

      <section id="room-setup" className="mx-auto grid max-w-4xl scroll-mt-24 gap-6 pb-14 md:grid-cols-2">
        <div className="rounded-2xl border border-faze-line bg-faze-panel p-6 shadow-card">
          <h2 className="font-display text-xl">ENTER THE VAULT</h2>
          <label htmlFor="agent-name" className="mt-4 block text-xs font-bold tracking-wider text-zinc-400">YOUR AGENT NAME</label>
          <input id="agent-name" value={props.name} onChange={(e) => props.setName(e.target.value)} placeholder="e.g. Sukhman" maxLength={24}
            className="mt-1 w-full rounded-lg border border-faze-line bg-black px-3 py-2.5" />
          {props.error && <p role="alert" className="mt-3 rounded-lg bg-red-950/60 border border-red-800 px-3 py-2 text-sm text-red-200">{props.error}</p>}
          <div className="mt-4 grid gap-2">
            <button disabled={props.loading} onClick={() => props.onCreate('legacy')} className="rounded-xl bg-faze-red px-4 py-3 font-bold shadow-glow disabled:opacity-50 hover:bg-faze-bright">
              {props.loading ? 'Creating room…' : 'Create Room — as Legacy Agent'}</button>
            <button disabled={props.loading} onClick={() => props.onCreate('recruit')} className="rounded-xl border border-faze-red px-4 py-3 font-bold text-red-200 hover:bg-faze-red/10 disabled:opacity-50">
              Create Room — as New Recruit</button>
            <button onClick={props.onSolo} className="rounded-xl border border-faze-line px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500">
              Practice solo (demo — see both sides, for judges testing alone)</button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Creating a room gives you a unique 6-character code. Your partner joins with it and automatically takes the other role. Demo mode works with two tabs on this device; cross-device play needs Supabase configured and is not live yet.</p>
        </div>

        <div className="rounded-2xl border border-faze-line bg-faze-panel p-6 shadow-card">
          <h2 className="font-display text-xl">JOIN A ROOM</h2>
          <label htmlFor="room-code" className="mt-4 block text-xs font-bold tracking-wider text-zinc-400">ROOM CODE (6 CHARACTERS)</label>
          <input id="room-code" value={props.joinCode} onChange={(e) => props.setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. K7Q2XA" maxLength={6}
            className="mt-1 w-full rounded-lg border border-faze-line bg-black px-3 py-2.5 font-mono text-lg tracking-[0.3em]" />
          <button disabled={props.loading} onClick={props.onJoin} className="mt-4 w-full rounded-xl bg-white px-4 py-3 font-bold text-black disabled:opacity-50 hover:bg-zinc-200">
            {props.loading ? 'Joining…' : 'Join Room'}</button>
          <div className="mt-5 rounded-xl border border-faze-line bg-black/40 p-4">
            <p className="text-xs font-bold tracking-wider text-zinc-400">HOW A STAGE WORKS</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-300">
              <li>Legacy Agent reads their secret clue out loud.</li>
              <li>New Recruit combines it with their locked puzzle.</li>
              <li>Recruit enters the answer — both screens update instantly.</li>
              <li>A historical reveal unlocks, then the next stage opens.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">WEEKLY MYSTERY EPISODES</h2>
          <button onClick={() => props.setShowEpisodes(!props.showEpisodes)} className="text-sm text-red-300 underline">{props.showEpisodes ? 'Hide' : 'Show all'}</button>
        </div>
        <p className="mt-1 text-sm text-zinc-400">New episode every week. Fans return to play, compete, and unlock rewards — the retention loop, and the sponsored-episode revenue model.</p>
        {props.showEpisodes && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {EPISODES.map((ep) => (
              <article key={ep.title} className="rounded-2xl border border-faze-line bg-faze-panel p-5">
                <p className="font-mono text-xs text-faze-red">{ep.week}</p>
                <h3 className="mt-1 font-display">{ep.title}</h3>
                <p className="mt-1 text-sm text-zinc-300">{ep.status}</p>
                <p className="mt-2 text-xs text-zinc-500">{ep.sponsor}</p>
                {ep.live
                  ? <button onClick={() => {
                      // Was: document.querySelector('input')?.focus() — focused
                      // an off-screen field with no visible navigation.
                      // Now: smooth-scroll to the room setup panel first,
                      // then focus the agent-name field once it is in view.
                      document.getElementById('room-setup')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      window.setTimeout(() => document.getElementById('agent-name')?.focus({ preventScroll: true }), 450)
                    }} className="mt-3 rounded-lg bg-faze-red px-3 py-2 text-sm font-bold">Play Episode 01</button>
                  : <button disabled className="mt-3 cursor-not-allowed rounded-lg border border-faze-line px-3 py-2 text-sm text-zinc-500">Notify me — coming soon</button>}
              </article>
            ))}
          </div>
        )}
        {props.history.length > 0 && (
          <div className="mt-6 rounded-2xl border border-faze-line bg-faze-panel p-5">
            <h3 className="font-display">YOUR COMPLETED MISSIONS</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              {props.history.map((h) => <li key={h.at}>Room {h.code} — {fmt(h.ms)} — {new Date(h.at).toLocaleString()}</li>)}
            </ul>
          </div>
        )}
      </section>

      <section className="pb-16">
        <div className="rounded-2xl border border-faze-red/40 bg-gradient-to-b from-faze-red/10 to-faze-panel p-6 md:p-8">
          <p className="font-mono text-xs font-bold tracking-widest text-faze-red">FOR JUDGES · PROPOSED MODEL — NOT AN EXISTING DEAL</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">THE BUSINESS BEHIND THE BLACKBOX</h2>
          <p className="mt-3 max-w-3xl text-zinc-300">Blackbox turns attention into a weekly habit — and a weekly habit into revenue. Here is how we propose it works:</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-faze-line bg-black/40 p-4">
              <p className="font-bold">1 · Sponsored episodes</p>
              <p className="mt-1 text-sm text-zinc-400">Gaming and technology brands sponsor a weekly mystery episode. Their branding appears naturally inside the mission — as a clue, a prop, or a location — never as a banner fans ignore.</p>
            </div>
            <div className="rounded-xl border border-faze-line bg-black/40 p-4">
              <p className="font-bold">2 · Rewards after the win</p>
              <p className="mt-1 text-sm text-zinc-400">After completing an episode, players may unlock optional sponsor rewards or offers. Rewards come after the fun, so they feel earned — and players actually see them.</p>
            </div>
            <div className="rounded-xl border border-faze-line bg-black/40 p-4">
              <p className="font-bold">3 · Measured, not guessed</p>
              <p className="mt-1 text-sm text-zinc-400">FaZe could measure episode starts, completion rates, return visits, shares, and optional offer clicks — the numbers a sponsor needs to renew.</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">Proposed monetization opportunities only. There are no existing sponsorship agreements and no actual revenue yet. All sponsor examples in this demo are hypothetical.</p>
        </div>
      </section>
    </main>
  )
}

/* ---------------- Lobby ---------------- */
function Lobby(props: { room: RoomState; role: Role; inviteLink: string; copy: (t: string, l: string) => void; copied: string; onLeave: () => void }) {
  const { room } = props
  const both = room.legacyJoined && room.recruitJoined
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="font-display text-4xl">WAITING LOBBY</h1>
      <p className="mt-2 text-zinc-400">Share the code. When both agents are in, the vault opens automatically.</p>
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-faze-red/50 bg-faze-panel p-6 shadow-glow">
        <p className="text-xs font-bold tracking-widest text-zinc-400">ROOM CODE</p>
        <p className="mt-1 font-mono text-4xl font-bold tracking-[0.25em] md:text-5xl">{room.code}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => props.copy(room.code, 'code')} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black">{props.copied === 'code' ? 'Copied!' : 'Copy code'}</button>
          <button onClick={() => props.copy(props.inviteLink, 'link')} className="rounded-lg border border-faze-line px-4 py-2 text-sm">{props.copied === 'link' ? 'Copied!' : 'Copy invite link'}</button>
        </div>
        <p className="mt-3 break-all text-xs text-zinc-500">{props.inviteLink}</p>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {([
          ['LEGACY AGENT', room.legacyJoined, room.legacyName],
          ['NEW RECRUIT', room.recruitJoined, room.recruitName],
        ] as const).map(([label, joined, nm]) => (
          <div key={label} className={`rounded-2xl border p-5 ${joined ? 'border-green-600 bg-green-950/30' : 'border-faze-line bg-faze-panel'}`}>
            <p className="font-mono text-xs font-bold text-zinc-400">{label}</p>
            <p className="mt-2 text-lg font-bold">{joined ? `● ${nm} — IN` : '○ Waiting…'}</p>
            {props.role === (label === 'LEGACY AGENT' ? 'legacy' : 'recruit') && joined && <p className="text-xs text-zinc-400">That’s you.</p>}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-400">{both ? 'Both agents in — starting…' : 'Waiting for your partner to join…'}</p>
      {!both && <p className="mt-1 animate-pulse text-xs text-zinc-500">Tip for testing: open this invite link in a second tab / second device and join with the same code.</p>}
      <button onClick={props.onLeave} className="mt-6 text-sm text-zinc-400 underline">Cancel and leave room</button>
    </main>
  )
}

/* ---------------- Game ---------------- */
function Game(props: { room: RoomState; role: Role; solo: boolean; setRole: (r: Role) => void; setRoom: (r: RoomState) => void; onComplete: () => void }) {
  const { room, role } = props
  const stage = STAGES[Math.min(room.stage, 3) - 1]
  const [guess, setGuess] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [reveal, setReveal] = useState<null | { heading: string; body: string; timelineSlot: string }>(null)
  // Timer is anchored to the room's startedAt (persisted in room state),
  // not to this mount — so a refresh mid-game does not reset the clock.
  const startRef = useRef(new Date(room.startedAt).getTime())
  const [elapsed, setElapsed] = useState(() => Date.now() - startRef.current)

  useEffect(() => { const t = setInterval(() => setElapsed(Date.now() - startRef.current), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { setGuess(''); setMsg('') }, [room.stage])

  const attempts = room.attempts[stage.id] || 0

  async function submit() {
    if (role !== 'recruit' && !props.solo) { setMsg('Only the New Recruit has the keypad. Read your clue to them — that is the cooperation.'); return }
    const clean = guess.trim().toUpperCase()
    if (clean.length !== stage.answerLength) { setMsg(`That answer needs exactly ${stage.answerLength} letters.`); return }
    setBusy(true); setMsg('')
    // Production: server validation first; demo hash check is the fallback.
    const server = await validateAnswerServer(room.code, stage.id, clean)
    const ok = server ?? (await validateAnswer(stage.id, clean))
    setBusy(false)
    const updated: RoomState = { ...room, attempts: { ...room.attempts, [stage.id]: attempts + 1 } }
    if (!ok) { roomStore.save(updated); props.setRoom(updated); setMsg('Wrong code — the vault stays shut. Talk it through and try again.'); return }
    updated.solvedAt = { ...room.solvedAt, [stage.id]: new Date().toISOString() }
    updated.lastEvent = `Stage ${stage.id} solved`
    if (stage.id === 3) {
      updated.stage = 4; updated.status = 'completed'; updated.completedAt = new Date().toISOString()
      recordCompletion(room.code, Date.now() - new Date(room.startedAt).getTime())
    } else { updated.stage = stage.id + 1 }
    roomStore.save(updated); props.setRoom(updated)
    setReveal(stage.reveal)
  }

  function closeReveal() {
    setReveal(null)
    if (room.status === 'completed') props.onComplete()
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-mono text-xs text-zinc-400">ROOM {room.code} · {fmt(elapsed)} · ATTEMPTS THIS STAGE: {attempts}</p>
        <h1 className="font-display text-3xl">{stage.title}</h1><p className="text-zinc-400">{stage.subtitle}</p></div>
        <div className="flex gap-1">{STAGES.map((s) => (
          <span key={s.id} className={`rounded-full px-3 py-1 text-xs font-bold ${s.id < room.stage || room.status === 'completed' ? 'bg-green-600' : s.id === room.stage ? 'bg-faze-red' : 'bg-faze-panel text-zinc-400'}`}>
            {s.id < room.stage || room.status === 'completed' ? '✓ ' : ''}Stage {s.id}</span>))}</div>
      </div>

      {props.solo && (
        <div className="mt-4 rounded-xl border border-yellow-700 bg-yellow-950/40 p-3 text-sm text-yellow-200">
          Solo practice mode — you can switch sides to test both views.
          <button onClick={() => props.setRole(role === 'legacy' ? 'recruit' : 'legacy')} className="ml-3 rounded bg-yellow-600 px-3 py-1 font-bold text-black">Switch to {role === 'legacy' ? 'New Recruit' : 'Legacy Agent'}</button>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Legacy panel — hidden content from Recruit, and vice versa */}
        <section className={`rounded-2xl border p-6 shadow-card ${role === 'legacy' ? 'border-faze-red bg-faze-panel shadow-glow' : 'border-faze-line bg-black/40 opacity-60'}`}>
          <p className="font-mono text-xs font-bold text-faze-red">👤 LEGACY AGENT — {room.legacyName || '—'}</p>
          {role === 'legacy' ? (
            <><h2 className="mt-2 font-display text-lg">{stage.legacyClue.heading}</h2>
            <p className="mt-2 text-zinc-300">{stage.legacyClue.body}</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black p-4 font-mono text-sm leading-relaxed text-red-100">{stage.legacyClue.detail}</pre>
            <p className="mt-3 text-sm text-zinc-400">You have no keypad. Your job is to explain this clearly to your Recruit.</p></>
          ) : (
            <><h2 className="mt-2 font-display text-lg">CLASSIFIED</h2>
            <p className="mt-2 text-zinc-400">Your Legacy Agent can see this clue. You cannot — ask them to read it to you. That is the game.</p>
            <div className="mt-3 rounded-xl bg-black p-4 font-mono text-sm text-zinc-600">████ ██████ ████ ██████<br />████ ████ ██████ ████</div></>
          )}
        </section>

        <section className={`rounded-2xl border p-6 shadow-card ${role === 'recruit' ? 'border-faze-red bg-faze-panel shadow-glow' : 'border-faze-line bg-black/40 opacity-60'}`}>
          <p className="font-mono text-xs font-bold text-faze-red">🔓 NEW RECRUIT — {room.recruitName || '—'}</p>
          {role === 'recruit' ? (
            <><h2 className="mt-2 font-display text-lg">{stage.recruitPuzzle.heading}</h2>
            <p className="mt-2 text-zinc-300">{stage.recruitPuzzle.body}</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black p-4 font-mono text-sm leading-relaxed text-red-100">{stage.recruitPuzzle.detail}</pre>
            <div className="mt-4 flex gap-2">
              <input value={guess} onChange={(e) => setGuess(e.target.value.toUpperCase())} placeholder={stage.recruitPuzzle.placeholder}
                maxLength={stage.answerLength} onKeyDown={(e) => e.key === 'Enter' && submit()}
                className="w-full rounded-lg border border-faze-line bg-black px-3 py-2.5 font-mono text-lg tracking-[0.25em]" />
              <button disabled={busy} onClick={submit} className="shrink-0 rounded-xl bg-faze-red px-5 py-2.5 font-bold shadow-glow disabled:opacity-50">{busy ? 'Checking…' : 'Unlock'}</button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{stage.recruitPuzzle.hint}</p></>
          ) : (
            <><h2 className="mt-2 font-display text-lg">LOCKED PUZZLE</h2>
            <p className="mt-2 text-zinc-400">Only the New Recruit sees the puzzle and the keypad. Your clue is the missing half — share it.</p>
            {props.solo && <button onClick={() => props.setRole('recruit')} className="mt-3 rounded-lg bg-faze-red px-4 py-2 text-sm font-bold">Switch to Recruit to enter the answer</button>}</>
          )}
        </section>
      </div>

      {msg && <p role="alert" className="mt-4 rounded-xl border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">{msg}</p>}
      <p className="mt-4 text-center text-xs text-zinc-500">Last event: {room.lastEvent} · Backend: {roomStore.backend} {roomStore.backend === 'demo-local' ? '(two tabs, no keys needed — Supabase Realtime when VITE_SUPABASE_URL is set)' : '(Supabase Realtime)'}</p>

      {reveal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4">
          <div className="rise w-full max-w-lg rounded-2xl border border-faze-red bg-faze-panel p-6 text-center shadow-glow">
            <div className="vault-ring mx-auto grid h-24 w-24 place-items-center rounded-full"><span className="grid h-20 w-20 place-items-center rounded-full bg-black font-display text-3xl">✓</span></div>
            <h2 className="mt-4 font-display text-2xl">{reveal.heading}</h2>
            <p className="mt-2 text-zinc-300">{reveal.body}</p>
            <p className="mt-3 rounded-xl bg-black p-3 text-xs text-zinc-400">{reveal.timelineSlot}</p>
            <button onClick={closeReveal} className="mt-5 w-full rounded-xl bg-faze-red px-4 py-3 font-bold">
              {room.status === 'completed' ? 'Open the vault →' : 'Continue to next stage →'}</button>
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------------- Completion ---------------- */
function Completion(props: { room: RoomState; role: Role; copy: (t: string, l: string) => void; copied: string; onAgain: () => void; history: { code: string; ms: number; at: string }[]; inviteLink: string }) {
  const { room } = props
  const totalMs = room.completedAt ? new Date(room.completedAt).getTime() - new Date(room.startedAt).getTime() : 0
  const totalAttempts = Object.values(room.attempts).reduce((a, b) => a + b, 0)
  const shareText = `I unlocked the FaZe Blackbox with my partner in ${fmt(totalMs)}! Room ${room.code} — 3 stages, 0 solo solves. Unlock the Past. Build the Next Generation. #FaZeBlackbox #HackUTA2026`
  const [unlocked, setUnlocked] = useState(false)
  useEffect(() => { const t = setTimeout(() => setUnlocked(true), 600); return () => clearTimeout(t) }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <div className={`vault-ring mx-auto grid h-40 w-40 place-items-center rounded-full ${unlocked ? 'vault-open' : ''}`}>
        <div className="grid h-32 w-32 place-items-center rounded-full bg-black"><span className="font-display text-5xl">🔓</span></div>
      </div>
      <p className="mt-6 inline-block rounded-full border border-green-500/60 bg-green-950/40 px-4 py-1 text-xs font-bold tracking-widest text-green-300">★ MISSION COMPLETE — 3 / 3 STAGES SOLVED TOGETHER</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl"><span className="shimmer-text">THE VAULT IS OPEN</span></h1>
      <p className="mt-3 text-zinc-300">Room {room.code} · {room.legacyName} (Legacy) + {room.recruitName} (Recruit) · {fmt(totalMs)} · {totalAttempts} total attempts</p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-yellow-600/60 bg-gradient-to-b from-yellow-950/40 to-faze-panel p-6 text-left">
        <p className="font-mono text-xs font-bold text-yellow-300">🏆 SHAREABLE ACHIEVEMENT</p>
        <p className="mt-2 font-display text-xl">BLACKBOX UNLOCKED</p>
        <p className="mt-1 text-sm text-zinc-300">Completed all 3 stages cooperatively — no solo solves.</p>
        <p className="mt-2 text-xs text-zinc-500">Verified by room state · {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button onClick={() => props.copy(shareText, 'share')} className="rounded-xl bg-faze-red px-5 py-3 font-bold shadow-glow">{props.copied === 'share' ? 'Copied!' : 'Copy achievement to share'}</button>
        <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: 'FaZe Blackbox', text: shareText }) } catch { /* user cancelled */ } } else props.copy(shareText, 'share') }} className="rounded-xl border border-faze-line px-5 py-3 font-bold">Share…</button>
        <button onClick={() => props.copy(props.inviteLink, 'invite')} className="rounded-xl border border-faze-red px-5 py-3 font-bold text-red-200">{props.copied === 'invite' ? 'Invite link copied!' : 'Invite a friend to play'}</button>
        <button onClick={props.onAgain} className="rounded-xl border border-faze-line px-5 py-3 font-bold">Play again — new room</button>
      </div>

      <div className="mt-8 grid gap-3 text-left md:grid-cols-2">
        <div className="rounded-2xl border border-faze-red/50 bg-gradient-to-b from-faze-red/10 to-faze-panel p-5">
          <p className="font-mono text-xs font-bold text-faze-red">NEXT WEEK · PREVIEW — NOT PLAYABLE YET</p>
          <h2 className="mt-1 font-display text-lg">EPISODE 02 — THE RED ROOM TAPES</h2>
          <p className="mt-2 text-sm text-zinc-300">A new vault, new clues, same rule: neither player can solve it alone. Episode 02 does not exist yet — this is a preview of the weekly format.</p>
          <button disabled className="mt-3 cursor-not-allowed rounded-lg border border-faze-line px-3 py-2 text-sm text-zinc-500">Coming soon — not playable yet</button>
        </div>
        <div className="rounded-2xl border border-faze-line bg-faze-panel p-5">
          <h2 className="font-display text-lg">WHY COME BACK?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            <li>A new episode drops every week — a reason to return, not a one-off game.</li>
            <li>Invite a friend with your link: every new Recruit is a new FaZe fan brought in by a longtime fan.</li>
            <li>Your completed missions are saved on this device — see your history on the landing page.</li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">Revenue model (for judges): sponsored weekly episodes + premium fan experiences + merch partnerships + brand competitions. All partnerships shown in this demo are hypothetical / illustrative only — no existing sponsorships.</p>
    </main>
  )
}
