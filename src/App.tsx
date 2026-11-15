import { useEffect, useMemo, useRef, useState } from 'react'
import { STAGES, validateAnswer, type Role } from './lib/puzzles'
import { roomStore, recordCompletion, getHistory, newPlayerId, saveSession, loadSession, clearSession, ownsSeat, gameElapsedMs, type RoomState, type RoomMode } from './lib/rooms'
import { validateAnswerServer } from './lib/supabase'
import {
  dailyScenario, dailyChallengeId, getScenario, scenarioForDailyId, newMatchState,
  lockPlay, continueMatch, timeoutMatch, matchScore, matchTimePoints, MATCH_SECONDS, ROUNDS, PLAYS,
  type MatchState, type PlayId, type Scenario,
} from './lib/matchpoint'
import { utcDateStr } from './lib/matchpoint'
import { QP_CATEGORIES, type QPCategory } from './lib/quickplay'
import { parseChallenge, challengeId, challengeUrl } from './lib/challenges'
import { clearRun, readRun, saveRun } from './lib/run-session'
import { copyText } from './lib/clipboard'
import { saturdayScenarioForWeek, saturdayWeekId, isSaturdayOpen, saveSaturdayBest } from './lib/saturday'
import { DISCORD_INVITE_URL } from './lib/config'
import { incStat } from './lib/stats'
import { MatchPointGame } from './components/MatchPointGame'
import { QuickPlayGame } from './components/QuickPlayGame'
import { SaturdayCard } from './components/SaturdayCard'
import { PackCard } from './components/PackCard'

type View = 'landing' | 'lobby' | 'game' | 'complete' | 'quickplay' | 'localmatch'

/** A local (no-room) Match Point run: challenge links, Saturday, pack
 *  sample. Solo with a role switcher; the friend who opens the link
 *  starts their own independent run on the same challenge. */
interface LocalRun {
  state: MatchState
  startedAtMs: number
  completedAtMs: number | null
  role: Role
}

interface LocalMatch {
  scenarioId: string
  challengeId: string
  kind: 'daily' | 'saturday' | 'pack' | 'challenge'
  weekId?: string
  preview?: boolean
}

const EPISODES = [
  { week: 'EP 01 — OUT NOW', title: 'The First Key', status: 'Playable now', sponsor: 'Community episode — no sponsor yet', live: true },
  { week: 'EP 02 — IN DEVELOPMENT', title: 'The Red Room Tapes', status: 'Preview', sponsor: 'HYPOTHETICAL sponsored episode — illustrative only, no real partnership', live: false },
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
  const [linkError, setLinkError] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [copyFallback, setCopyFallback] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [playerId, setPlayerId] = useState(() => loadSession()?.playerId ?? newPlayerId())
  const [localMatch, setLocalMatch] = useState<LocalMatch | null>(null)
  const [qp, setQp] = useState<{ category: QPCategory; dateStr: string } | null>(null)
  const history = useMemo(() => getHistory(), [view])
  const [todayDate, setTodayDate] = useState(() => utcDateStr())
  const todayId = dailyChallengeId(new Date(todayDate))
  const today = dailyScenario(new Date(todayDate))

  useEffect(() => {
    const updateDay = () => setTodayDate(utcDateStr())
    const interval = window.setInterval(updateDay, 10_000)
    window.addEventListener('focus', updateDay)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', updateDay)
    }
  }, [])

  useEffect(() => {
    if (view !== 'landing') window.scrollTo({ top: 0 })
  }, [view])

  const inviteLink = room ? `${window.location.origin}${window.location.pathname}?room=${room.code}` : ''

  const copy = async (text: string, label: string) => {
    if (await copyText(text)) {
      setCopyError('')
      setCopyFallback('')
      setCopied(label)
      setTimeout(() => setCopied(''), 2000)
    } else {
      setCopyError('Could not copy automatically. Select and copy this link.')
      setCopyFallback(text)
    }
  }

  // Deep links: ?challenge=<id> starts an independent run on that
  // challenge (a friend's link — same scenario, fresh run, no answers
  // in the link). ?room=XXXXXX pre-fills join for the vault / Match
  // Point rooms.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ch = params.get('challenge')
    if (ch) {
      const ref = parseChallenge(ch)
      if (ref?.kind === 'qp') {
        setQp({ category: ref.category, dateStr: ref.date })
        setView('quickplay')
        return
      }

      if (ref?.kind === 'sat') {
        const now = new Date()
        const preview = !isSaturdayOpen(now) || ref.weekId !== saturdayWeekId(now)
        setLocalMatch({ scenarioId: saturdayScenarioForWeek(ref.weekId).id, challengeId: ch, kind: 'saturday', weekId: ref.weekId, preview })
        setView('localmatch')
        return
      }

      const scenario = ref?.kind === 'mp-daily' ? scenarioForDailyId(ch)
        : ref?.kind === 'mp-scen' ? getScenario(ref.scenarioId)
        : undefined
      if (scenario) {
        setLocalMatch({ scenarioId: scenario.id, challengeId: ch, kind: 'challenge' })
        setView('localmatch')
        return
      }

      setLinkError(true)
      return
    }

    const resumeId = params.get('resume')
    const saved = resumeId ? parseChallenge(resumeId) : null
    if (saved?.kind === 'qp') {
      setQp({ category: saved.category, dateStr: saved.date })
      setView('quickplay')
      return
    }

    if (resumeId) {
      const run = readRun<LocalMatch>(resumeId + ':setup')
      if (run && getScenario(run.scenarioId)) {
        setLocalMatch(run)
        setView('localmatch')
        return
      }
    }

    const c = params.get('room')
    if (c) setJoinCode(c.toUpperCase())
  }, [])

  // Refresh / reconnect: restore this tab's saved seat (sessionStorage is
  // per-tab, so a second tab is a different player, not the same session).
  // Only restores when the session actually owns a seat in the room —
  // an unrelated user can never take an occupied seat this way.
  useEffect(() => {
    // A challenge link owns this visit — never restore a vault seat over it.
    const route = new URLSearchParams(window.location.search)
    if (route.has('challenge') || route.has('resume')) return
    const s = loadSession()
    if (!s) return
    const r = roomStore.load(s.code)
    if (route.get('room') && route.get('room')?.toUpperCase() !== s.code) return
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
    function sync(r: RoomState) {
      const latest = roomStore.load(r.code) ?? r
      setRoom(latest)
      if (latest.status === 'playing') setView((prev) => (prev === 'lobby' ? 'game' : prev))
      if (latest.status === 'completed') setView('complete')
    }
    const unsubscribe = roomStore.subscribe(room.code, sync)
    sync(room)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code])

  async function handleCreate(pickedRole: Role, mode: RoomMode = 'vault', scenarioId = '') {
    if (loading) return
    if (!name.trim()) {
      setError('Enter a name to start a room.')
      document.getElementById(mode === 'matchpoint' ? 'matchpoint-name' : 'agent-name')?.focus()
      return
    }
    setError(''); setLoading(true)
    const { room: r, playerId: pid } = roomStore.create(
      name.trim(), pickedRole, playerId, mode, scenarioId, mode === 'matchpoint' ? todayId : '',
    )
    window.history.replaceState(null, '', window.location.pathname)
    if (mode === 'matchpoint') incStat('mpStarts')
    setPlayerId(pid); saveSession({ code: r.code, role: pickedRole, name: name.trim(), playerId: pid, solo: false })
    setSolo(false); setRole(pickedRole); setRoom(r); setLoading(false); setView('lobby')
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (loading) return
    if (!name.trim()) {
      setError('Enter a name to join a room.')
      document.getElementById('agent-name')?.focus()
      return
    }
    if (code.length !== 6) { setError('Room codes are 6 characters. Check the code and try again.'); return }
    setError(''); setLoading(true)
    const res = roomStore.join(code, name.trim(), playerId)
    setLoading(false)
    if ('error' in res) { setError(res.error); return }
    window.history.replaceState(null, '', '?room=' + code)
    setSolo(false)
    setPlayerId(res.playerId); saveSession({ code: res.room.code, role: res.role, name: name.trim(), playerId: res.playerId, solo: false })
    setRole(res.role); setRoom(res.room)
    setView(res.room.status === 'playing' ? 'game' : 'lobby')
  }

  function startSolo(mode: RoomMode = 'vault', scenarioId = '') {
    if (loading) return
    const playerName = name.trim() || 'Solo Player'
    setName(playerName)
    setError(''); setSolo(true)
    window.history.replaceState(null, '', window.location.pathname)
    const { room: r, playerId: pid } = roomStore.create(
      playerName, 'legacy', playerId, mode, scenarioId, mode === 'matchpoint' ? todayId : '',
    )
    if (mode === 'matchpoint') incStat('mpStarts')
    r.legacyJoined = true; r.recruitJoined = true; r.recruitName = playerName + ' (solo)'; r.recruitPlayerId = pid; r.status = 'playing'
    r.gameStartedAt = new Date().toISOString() // gameplay starts now, not at room creation
    roomStore.save(r); setPlayerId(pid); saveSession({ code: r.code, role: 'legacy', name: playerName, playerId: pid, solo: true })
    setRole('legacy'); setRoom(r); setView('game')
  }

  /** Start a local (no-room) Match Point run: challenge links, the
   *  Saturday Challenge / preview, and the pack sample. */
  function startLocalMatch(lm: LocalMatch) {
    clearRun(lm.challengeId)
    saveRun(lm.challengeId + ':setup', lm)
    window.history.replaceState(null, '', '?resume=' + encodeURIComponent(lm.challengeId))
    setLocalMatch(lm)
    setView('localmatch')
  }

  function startSaturday() {
    const now = new Date()
    const weekId = saturdayWeekId(now)
    const preview = !isSaturdayOpen(now)
    const sc = saturdayScenarioForWeek(weekId)
    startLocalMatch({
      scenarioId: sc.id,
      challengeId: challengeId({ kind: 'sat', weekId }),
      kind: 'saturday',
      weekId,
      preview,
    })
  }

  function startQuickPlay(category: QPCategory) {
    const dateStr = utcDateStr()
    const id = challengeId({ kind: 'qp', category, date: dateStr })
    clearRun(id)
    window.history.replaceState(null, '', '?resume=' + encodeURIComponent(id))
    setQp({ category, dateStr })
    setView('quickplay')
  }

  function exitToLanding() {
    if (localMatch) {
      clearRun(localMatch.challengeId)
      clearRun(localMatch.challengeId + ':setup')
    }
    if (qp) clearRun(challengeId({ kind: 'qp', category: qp.category, date: qp.dateStr }))
    window.history.replaceState(null, '', window.location.pathname)
    setLocalMatch(null)
    setQp(null)
    setLinkError(false)
    setView('landing')
  }

  function handleInviteFresh() {
    // The completion screen's invite must lead to a FRESH playable room:
    // the completed room's code is unjoinable by design. Create a new
    // room for this player (same name, same role), copy its invite link,
    // and take the player to its lobby to wait for their friend.
    if (!room) return
    const myName = name.trim() || (role === 'legacy' ? room.legacyName : room.recruitName)
    if (!myName) return
    const pid = newPlayerId()
    const { room: r } = roomStore.create(myName, role, pid, room.mode, room.match?.scenarioId ?? '', room.match?.challengeId ?? '')
    if (room.mode === 'matchpoint') incStat('mpStarts')
    setPlayerId(pid); saveSession({ code: r.code, role, name: myName, playerId: pid, solo: false })
    setSolo(false)
    window.history.replaceState(null, '', window.location.pathname)
    setRoom(r); setView('lobby')
    // Label 'link' (not 'invite'): the lobby's "Copy invite link" button
    // shows "Copied!" for that label, which is the confirmation the
    // player actually sees after landing in the new lobby.
    copy(`${window.location.origin}${window.location.pathname}?room=${r.code}`, 'link')
  }

  function leaveRoom() {
    clearSession()
    window.history.replaceState(null, '', window.location.pathname)
    setRoom(null); setSolo(false); setLocalMatch(null); setQp(null); setView('landing'); setError(''); setJoinCode('')
  }

  return (
    <div className="min-h-screen bg-faze-dark scanlines">
      <header className="sticky top-0 z-40 border-b border-faze-line bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => room ? leaveRoom() : exitToLanding()} className="flex items-center gap-2 text-left">
            <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="shrink-0"><rect x="2" y="2" width="32" height="32" rx="5" fill="#0A0A0B" stroke="#E10600" strokeWidth="2"/><rect x="9" y="16" width="18" height="11" rx="2" fill="none" stroke="#E10600" strokeWidth="2"/><path d="M13 16v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#E10600" strokeWidth="2"/><circle cx="18" cy="21" r="2" fill="#E10600"/></svg>
            <span className="leading-tight"><span className="block font-display text-base tracking-wide">FAZE BLACKBOX</span>
            <span className="hidden text-[11px] text-zinc-400 sm:block">Unlock the Past. Build the Next Generation.</span></span>
          </button>
          {view === 'landing' && (
            <nav aria-label="Games" className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
              <a href="#matchpoint" className="hover:text-white">Match Point</a>
              <a href="#quickplay" className="hover:text-white">Quick Play</a>
              <a href="#saturday" className="hover:text-white">Saturday Challenge</a>
            </nav>
          )}
          {room && <button onClick={leaveRoom} className="rounded-lg border border-faze-line px-3 py-1.5 text-sm hover:border-faze-red">Leave room</button>}
        </div>
      </header>

      {copyError && (
        <div role="alert" className="fixed inset-x-4 top-20 z-50 mx-auto max-w-lg rounded-xl border border-red-600 bg-zinc-950 p-4">
          <p>{copyError}</p>
          <input aria-label="Link to copy" className="mt-2 w-full rounded border border-zinc-600 bg-black p-2" value={copyFallback} readOnly onFocus={(e) => e.currentTarget.select()} />
          <button className="mt-2 underline" onClick={() => setCopyError('')}>Dismiss</button>
        </div>
      )}
      {linkError && view === 'landing' && (
        <p role="alert" className="mx-auto mt-4 max-w-xl px-4 text-center text-red-200">
          This challenge link is invalid. Pick a game below to play.
        </p>
      )}

      {view === 'landing' && (
        <Landing name={name} setName={setName} joinCode={joinCode} setJoinCode={setJoinCode}
          error={error} loading={loading} onCreate={handleCreate} onJoin={handleJoin} onSolo={() => startSolo()}
          copy={copy} copied={copied} showEpisodes={showEpisodes} setShowEpisodes={setShowEpisodes} history={history}
          today={today} todayId={todayId} onCreateMp={(r) => handleCreate(r, 'matchpoint', today.id)}
          onSoloMp={() => startSolo('matchpoint', today.id)} onQuickPlay={startQuickPlay}
          onSaturday={startSaturday} onPlaySample={() => startLocalMatch({ scenarioId: 'pack-sample', challengeId: 'mp-scen-pack-sample', kind: 'pack' })} />
      )}
      {view === 'lobby' && room && (
        <Lobby room={room} role={role} inviteLink={inviteLink} copy={copy} copied={copied} onLeave={leaveRoom} />
      )}
      {view === 'game' && room && room.mode === 'matchpoint' && (
        <MatchRoomGame room={room} role={role} solo={solo} setRole={setRole} setRoom={setRoom} onExit={leaveRoom} onInviteFresh={handleInviteFresh} />
      )}
      {view === 'game' && room && room.mode !== 'matchpoint' && (
        <Game room={room} role={role} solo={solo} setRole={setRole} setRoom={setRoom} onComplete={() => setView('complete')} />
      )}
      {view === 'complete' && room && room.mode === 'matchpoint' && (
        <MatchRoomGame room={room} role={role} solo={solo} setRole={setRole} setRoom={setRoom} onExit={leaveRoom} onInviteFresh={handleInviteFresh} />
      )}
      {view === 'complete' && room && room.mode !== 'matchpoint' && (
        <Completion room={room} role={role} copy={copy} copied={copied} onAgain={leaveRoom} history={history} onInviteFresh={handleInviteFresh} solo={solo} />
      )}
      {view === 'quickplay' && qp && (
        <QuickPlayGame category={qp.category} dateStr={qp.dateStr} onExit={exitToLanding} />
      )}
      {view === 'localmatch' && localMatch && (
        <LocalMatchView key={localMatch.challengeId} lm={localMatch} onExit={exitToLanding} />
      )}

      <footer className="border-t border-faze-line py-6 text-center text-xs text-zinc-500">
        FaZe Blackbox · A student project for HackUTA 2026.{' '}
        <a className="underline" href="https://docs.google.com/document/d/1HI-h6v38zGZaYzV_yc1G7u0NIec8pBerYdqO3z6mjQ4/edit" target="_blank" rel="noreferrer">FaZe Clan timeline</a>
        {'. Sponsorships and prizes are examples.'}
      </footer>
    </div>
  )
}

/* ---------------- Match Point (room co-op) ---------------- */
// Wraps the shared MatchPointGame with room-backed state: the same room
// codes, seats, session recovery and BroadcastChannel transport as the
// vault. The 90-second clock runs from room.gameStartedAt.
function MatchRoomGame(props: { room: RoomState; role: Role; solo: boolean; setRole: (r: Role) => void; setRoom: (r: RoomState) => void; onExit: () => void; onInviteFresh: () => void }) {
  const { room } = props
  const match = room.match!
  const scenario = getScenario(match.scenarioId)!
  const startedAtMs = room.gameStartedAt ? new Date(room.gameStartedAt).getTime() : null
  const completedAtMs = room.completedAt ? new Date(room.completedAt).getTime() : null

  function updateMatch(action: (state: MatchState) => MatchState, timedOut = false) {
    function applyUpdate() {
      const current = roomStore.load(room.code)
      if (!current?.match || current.status !== 'playing') return
      const active = current.match
      if (active.round !== match.round || active.phase !== match.phase) return

      const now = Date.now()
      const expired = startedAtMs !== null && now - startedAtMs >= MATCH_SECONDS * 1000
      if (timedOut && !expired) return
      const next = expired ? timeoutMatch(active) : action(active)
      const finished = next.phase === 'done'
      const updated: RoomState = {
        ...current,
        match: next,
        status: finished ? 'completed' : current.status,
        completedAt: finished ? new Date(now).toISOString() : null,
      }
      roomStore.save(updated)
      props.setRoom(updated)
      if (finished) incStat('mpCompletions')
    }

    // Both tabs can notice the deadline at once. Re-read the latest round
    // inside the lock so a late click cannot overwrite a completed match.
    if (navigator.locks) {
      void navigator.locks.request(`blackbox-match-${room.code}`, applyUpdate)
    } else {
      applyUpdate()
    }
  }

  function handleLock(playId: PlayId) {
    if (props.role !== 'recruit' || match.phase !== 'play') return
    const play = PLAYS.find((choice) => choice.id === playId)
    if (!play || play.cost > match.credits) return
    updateMatch((active) => {
      const next = lockPlay(active, playId)
      return active.round === ROUNDS ? continueMatch(next) : next
    })
  }

  function handleContinue() {
    if (props.role === 'recruit' && match.phase === 'result') updateMatch(continueMatch)
  }

  function handleTimeout() {
    updateMatch(timeoutMatch, true)
  }

  return (
    <MatchPointGame
      scenario={scenario} state={match} role={props.role} solo={props.solo}
      startedAtMs={startedAtMs} completedAtMs={completedAtMs}
      contextLabel="Daily Match Point" challengeId={match.challengeId}
      onLock={handleLock} onContinue={handleContinue} onTimeout={handleTimeout}
      onSwitchRole={() => props.setRole(props.role === 'legacy' ? 'recruit' : 'legacy')}
      onReplay={props.onInviteFresh} replayLabel="Start a new room" onExit={props.onExit}
    />
  )
}

/* ---------------- Match Point (local run) ---------------- */
// Challenge links, Saturday Challenge / preview, and the pack sample.
// Solo with a role switcher; a friend opening the link starts their own
// independent run on the same challenge.
function LocalMatchView(props: { lm: LocalMatch; onExit: () => void }) {
  const { lm } = props
  const scenario = getScenario(lm.scenarioId)!
  const makeRun = (): LocalRun => ({
    state: newMatchState(lm.scenarioId, lm.challengeId),
    startedAtMs: Date.now(),
    completedAtMs: null,
    role: 'legacy',
  })
  const [run, setRun] = useState(() => readRun<LocalRun>(lm.challengeId) ?? makeRun())
  const { state, startedAtMs, completedAtMs, role } = run
  const runRef = useRef(run)
  useEffect(() => {
    if (readRun<LocalRun>(lm.challengeId)) return
    saveRun(lm.challengeId, runRef.current)
    if (lm.kind === 'saturday' && !lm.preview) incStat('satStarts')
    if (lm.kind !== 'saturday') incStat('mpStarts')
  }, [lm.challengeId, lm.kind, lm.preview])

  const contextLabel =
    lm.kind === 'saturday' ? `Saturday Challenge · week of ${lm.weekId ?? ''}`
    : lm.kind === 'pack' ? 'Creator Challenge Pack sample'
    : 'Match Point'

  function updateRun(next: LocalRun) {
    runRef.current = next
    saveRun(lm.challengeId, next)
    setRun(next)
  }

  function advance(action: (active: MatchState) => MatchState, timedOut = false) {
    const current = runRef.current
    if (current.state.phase === 'done' || current.state !== state) return
    const now = Date.now()
    const remainingMs = MATCH_SECONDS * 1000 - (now - current.startedAtMs)
    if (timedOut && remainingMs > 0) return
    const next = remainingMs <= 0 ? timeoutMatch(current.state) : action(current.state)
    const finished = next.phase === 'done'
    updateRun({ ...current, state: next, completedAtMs: finished ? now : null })

    if (!finished) return
    if (lm.kind === 'saturday') {
      const finishDate = new Date(now)
      if (!lm.preview && lm.weekId === saturdayWeekId(finishDate) && isSaturdayOpen(finishDate)) {
        incStat('satCompletions')
        saveSaturdayBest(lm.weekId, {
          score: matchScore(next, matchTimePoints(remainingMs)),
          roundsWon: next.roundsWon,
          creditsLeft: next.credits,
          at: new Date(now).toISOString(),
        })
      }
    } else {
      incStat('mpCompletions')
    }
  }

  function handleLock(playId: PlayId) {
    const play = PLAYS.find((choice) => choice.id === playId)
    if (role !== 'recruit' || state.phase !== 'play' || !play || play.cost > state.credits) return
    advance((active) => {
      const next = lockPlay(active, playId)
      return active.round === ROUNDS ? continueMatch(next) : next
    })
  }

  function handleContinue() {
    if (state.phase === 'result') advance(continueMatch)
  }

  function handleTimeout() {
    advance(timeoutMatch, true)
  }

  function handleReplay() {
    updateRun(makeRun())
    if (lm.kind === 'saturday' && !lm.preview) incStat('satStarts')
    if (lm.kind !== 'saturday') incStat('mpStarts')
  }

  return (
    <MatchPointGame
      scenario={scenario} state={state} role={role} solo
      startedAtMs={startedAtMs} completedAtMs={completedAtMs}
      contextLabel={contextLabel} challengeId={lm.challengeId} isPreview={lm.preview}
      onLock={handleLock} onContinue={handleContinue} onTimeout={handleTimeout}
      onSwitchRole={() => updateRun({ ...runRef.current, role: role === 'legacy' ? 'recruit' : 'legacy' })}
      onReplay={handleReplay} onExit={props.onExit}
    />
  )
}

/* ---------------- Landing ---------------- */
function Landing(props: {
  name: string; setName: (v: string) => void; joinCode: string; setJoinCode: (v: string) => void
  error: string; loading: boolean; onCreate: (r: Role) => void; onJoin: () => void; onSolo: () => void
  copy: (t: string, l: string) => void; copied: string; showEpisodes: boolean; setShowEpisodes: (v: boolean) => void
  history: { code: string; ms: number; at: string }[]
  today: Scenario; todayId: string; onCreateMp: (r: Role) => void; onSoloMp: () => void
  onQuickPlay: (c: QPCategory) => void; onSaturday: () => void; onPlaySample: () => void
}) {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="rise mx-auto max-w-4xl py-12 md:py-16">
        <h1 className="break-words font-display text-4xl leading-none sm:text-5xl md:text-7xl">
          FAZE <span className="text-faze-red">BLACKBOX</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-zinc-300">Read the opponent. Make the call. See if your friends can beat your score.</p>
      </section>

      <section id="matchpoint" className="mx-auto max-w-4xl scroll-mt-24 pb-12">
        <div className="rounded-2xl border border-faze-line bg-faze-panel p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-wider text-red-300">Daily Match Point</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">Today vs. {props.today.opponent}</h2>
          <p className="mt-2 text-sm text-zinc-300">Three rounds. Six credits. Ninety seconds to work out when to spend and when to save.</p>
          <p className="mt-2 text-sm text-zinc-400">One player scouts the opponent. The other picks the play. Both roles are available in solo mode.</p>
          <button disabled={props.loading} onClick={props.onSoloMp} className="mt-5 rounded-xl bg-faze-red px-5 py-3 font-bold hover:bg-faze-bright disabled:opacity-50">
            Play solo
          </button>
          <div className="mt-5 border-t border-faze-line pt-4">
            <label htmlFor="matchpoint-name" className="block text-sm font-bold">Name for co-op</label>
            <input id="matchpoint-name" value={props.name} onChange={(e) => props.setName(e.target.value)} maxLength={24}
              className="mt-1 w-full max-w-xs rounded-lg border border-faze-line bg-black px-3 py-2.5" />
            {props.error && <p aria-live="polite" className="mt-2 text-sm text-red-200">{props.error}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button disabled={props.loading} onClick={() => props.onCreateMp('legacy')} className="rounded-lg border border-faze-line px-3 py-2 text-sm font-bold hover:border-faze-red disabled:opacity-50">Host as Legacy Agent</button>
              <button disabled={props.loading} onClick={() => props.onCreateMp('recruit')} className="rounded-lg border border-faze-line px-3 py-2 text-sm font-bold hover:border-faze-red disabled:opacity-50">Host as New Recruit</button>
              <a href="#room-setup" className="rounded-lg border border-faze-line px-3 py-2 text-sm font-bold hover:border-faze-red">Join with a room code</a>
            </div>
            <p className="mt-3 text-xs text-zinc-400">Co-op uses two tabs in the same browser. Share a challenge link for friends to play their own run.</p>
          </div>
        </div>
      </section>

      <nav aria-label="More ways to play" className="mx-auto flex max-w-4xl flex-wrap gap-3 pb-12">
        <a className="rounded-lg border border-faze-line px-4 py-2 font-bold hover:border-red-500" href="#quickplay">Sports Quick Play</a>
        <a className="rounded-lg border border-faze-line px-4 py-2 font-bold hover:border-red-500" href="#saturday">Saturday Challenge</a>
        <a className="rounded-lg border border-faze-line px-4 py-2 font-bold hover:border-red-500" href="#room-setup">FaZe History Vault</a>
      </nav>

      <section id="room-setup" className="mx-auto grid max-w-4xl scroll-mt-24 gap-6 pb-14 md:grid-cols-2">
        <div className="rounded-2xl border border-faze-line bg-faze-panel p-6 shadow-card">
          <h2 className="font-display text-xl">FaZe History Vault</h2>
          <p className="mt-2 text-sm text-zinc-400">Solve three puzzles based on FaZe history. The Legacy Agent has the clues and the New Recruit has the keypad.</p>
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
              Play the vault solo</button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Open the invite in a second tab in the same browser. Your partner takes the other role.</p>
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

      <section id="quickplay" className="mx-auto max-w-4xl scroll-mt-24 pb-14">
        <div className="rounded-2xl border border-faze-line bg-faze-panel p-6 shadow-card">
          <p className="font-mono text-xs font-bold text-faze-red">SPORTS QUICK PLAY — FREE</p>
          <h2 className="mt-1 font-display text-2xl">FIVE QUESTIONS. PICK A SPORT.</h2>
          <p className="mt-2 text-sm text-zinc-300">Five questions per round. Each answer comes with an explanation and a source.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {QP_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => props.onQuickPlay(c.id)} className="rounded-xl border border-faze-line px-4 py-2.5 font-bold hover:border-faze-red">
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl pb-14">
        <SaturdayCard onPlay={props.onSaturday} />
      </section>

      <section className="mx-auto max-w-4xl pb-14">
        <PackCard onPlaySample={props.onPlaySample} />
      </section>

      <section className="mx-auto max-w-4xl pb-14">
        <div className="rounded-2xl border border-faze-line bg-faze-panel p-6">
          <p className="font-mono text-xs font-bold text-faze-red">PLAY WITH FRIENDS</p>
          <h2 className="mt-1 font-display text-2xl">CHALLENGE A FRIEND, OR JOIN THE COMMUNITY</h2>
          <p className="mt-2 text-sm text-zinc-300">Send a friend the same Match Point or Quick Play challenge and compare scores.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => props.copy(challengeUrl(props.todayId), 'challenge')}
              className="rounded-xl bg-faze-red px-4 py-2.5 font-bold"
            >
              {props.copied === 'challenge' ? 'Copied!' : 'Copy today’s Match Point challenge link'}
            </button>
            {DISCORD_INVITE_URL ? (
              <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-faze-line px-4 py-2.5 font-bold hover:border-faze-red">
                Join our Discord
              </a>
            ) : (
              <span className="self-center text-xs text-zinc-500">
                Paste your link into Discord or a group chat.
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">History Vault episodes</h2>
          <button onClick={() => props.setShowEpisodes(!props.showEpisodes)} className="text-sm text-red-300 underline">{props.showEpisodes ? 'Hide' : 'Show all'}</button>
        </div>
        <p className="mt-1 text-sm text-zinc-400">Episode 1 is playable. Later episodes are previews.</p>
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
                  : null}
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
          <h2 className="font-display text-2xl md:text-3xl">Play free. Sponsor an event.</h2>
          <p className="mt-3 max-w-3xl text-zinc-300">Our proposal is to keep daily play free, sell optional creator packs, and offer brands a placement after Saturday Challenge results.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-faze-line bg-black/40 p-4">
              <p className="font-bold">Saturday sponsor</p>
              <p className="mt-1 text-sm text-zinc-400">A gaming brand could pay a flat fee to sponsor one Saturday Challenge.</p>
            </div>
            <div className="rounded-xl border border-faze-line bg-black/40 p-4">
              <p className="font-bold">Post-match offer</p>
              <p className="mt-1 text-sm text-zinc-400">Players could see an optional offer after their match.</p>
            </div>
            <div className="rounded-xl border border-faze-line bg-black/40 p-4">
              <p className="font-bold">Event report</p>
              <p className="mt-1 text-sm text-zinc-400">A sponsor report could show event starts, completions, and offer clicks.</p>
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
  const scenario = room.mode === 'matchpoint' && room.match ? getScenario(room.match.scenarioId) : undefined
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="font-display text-4xl">WAITING LOBBY</h1>
      <p className="mt-2 text-zinc-400">
        {room.mode === 'matchpoint'
          ? `Daily Match Point — vs ${scenario?.opponent ?? 'today’s opponent'}. Share the code. When both agents are in, the 90-second clock starts.`
          : 'Share the code. When both agents are in, the vault opens automatically.'}
      </p>
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
  const [reveal, setReveal] = useState<null | { heading: string; body: string; source: string }>(null)
  const [hintLevel, setHintLevel] = useState(0)
  // Timer is anchored to the room's gameStartedAt (persisted in room
  // state) — the moment play began, not room creation — so a refresh
  // mid-game does not reset the clock, and it freezes at completedAt
  // because gameElapsedMs() ends at completedAt once it is set.
  const [elapsed, setElapsed] = useState(() => gameElapsedMs(room))

  useEffect(() => { const t = setInterval(() => setElapsed(gameElapsedMs(room)), 1000); return () => clearInterval(t) }, [room])
  useEffect(() => { setGuess(''); setMsg(''); setHintLevel(0) }, [room.stage])

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
      recordCompletion(room.code, gameElapsedMs(updated))
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
          <p className="font-mono text-xs font-bold text-faze-red">LEGACY AGENT — {room.legacyName || '—'}</p>
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
          <p className="font-mono text-xs font-bold text-faze-red">NEW RECRUIT — {room.recruitName || '—'}</p>
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
            <div className="mt-3">
              {stage.recruitPuzzle.hints.slice(0, hintLevel).map((h, i) => (
                <p key={i} className="mt-1 rounded-lg bg-black/60 px-3 py-2 text-xs text-zinc-300"><span className="font-bold text-faze-red">HINT {i + 1} — </span>{h}</p>
              ))}
              {hintLevel < stage.recruitPuzzle.hints.length && (
                <button onClick={() => setHintLevel((n) => n + 1)} className="mt-2 rounded-lg border border-faze-line px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-faze-red">
                  Need a hint? ({stage.recruitPuzzle.hints.length - hintLevel} left)
                </button>
              )}
            </div></>
          ) : (
            <><h2 className="mt-2 font-display text-lg">LOCKED PUZZLE</h2>
            <p className="mt-2 text-zinc-400">Only the New Recruit sees the puzzle and the keypad. Your clue is the missing half — share it.</p>
            {props.solo && <button onClick={() => props.setRole('recruit')} className="mt-3 rounded-lg bg-faze-red px-4 py-2 text-sm font-bold">Switch to Recruit to enter the answer</button>}</>
          )}
        </section>
      </div>

      {msg && <p role="alert" className="mt-4 rounded-xl border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">{msg}</p>}
      <p className="mt-4 text-center text-xs text-zinc-500">Last event: {room.lastEvent} · Backend: {roomStore.backend} {roomStore.backend === 'demo-local' ? '(demo-local: two tabs on this device)' : '(Supabase answer validation on; rooms still stored locally)'}</p>

      {reveal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4">
          <div className="rise w-full max-w-lg rounded-2xl border border-faze-red bg-faze-panel p-6 text-center shadow-glow">
            <div className="vault-ring mx-auto grid h-24 w-24 place-items-center rounded-full"><span className="grid h-20 w-20 place-items-center rounded-full bg-black font-display text-3xl">✓</span></div>
            <h2 className="mt-4 font-display text-2xl">{reveal.heading}</h2>
            <p className="mt-2 text-zinc-300">{reveal.body}</p>
            <p className="mt-3 rounded-xl bg-black p-3 text-xs text-zinc-400">{reveal.source}</p>
            <button onClick={closeReveal} className="mt-5 w-full rounded-xl bg-faze-red px-4 py-3 font-bold">
              {room.status === 'completed' ? 'Open the vault →' : 'Continue to next stage →'}</button>
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------------- Completion ---------------- */
function Completion(props: { room: RoomState; role: Role; copy: (t: string, l: string) => void; copied: string; onAgain: () => void; history: { code: string; ms: number; at: string }[]; onInviteFresh: () => void; solo: boolean }) {
  const { room } = props
  const totalMs = gameElapsedMs(room)
  const totalAttempts = Object.values(room.attempts).reduce((a, b) => a + b, 0)
  const shareText = props.solo
    ? `I unlocked the FaZe Blackbox in solo practice in ${fmt(totalMs)}! Room ${room.code} — 3 stages. Unlock the Past. Build the Next Generation. #FaZeBlackbox #HackUTA2026`
    : `I unlocked the FaZe Blackbox with my partner in ${fmt(totalMs)}! Room ${room.code} — 3 stages, 0 solo solves. Unlock the Past. Build the Next Generation. #FaZeBlackbox #HackUTA2026`
  const [unlocked, setUnlocked] = useState(false)
  useEffect(() => { const t = setTimeout(() => setUnlocked(true), 600); return () => clearTimeout(t) }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <div className={`vault-ring mx-auto grid h-40 w-40 place-items-center rounded-full ${unlocked ? 'vault-open' : ''}`}>
        <div className="grid h-32 w-32 place-items-center rounded-full bg-black"><svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="28" width="36" height="26" rx="4" fill="none" stroke="#E10600" strokeWidth="4"/><path className="vault-shackle" d="M22 28v-8a10 10 0 0 1 20 0v8" fill="none" stroke="#E10600" strokeWidth="4"/><circle cx="32" cy="40" r="4" fill="#E10600"/></svg></div>
      </div>
      {unlocked && <p className="rise mt-4 inline-block rounded-full border border-green-500/60 bg-green-950/40 px-4 py-1 text-xs font-bold tracking-widest text-green-300">✓ UNLOCKED</p>}
      <p className="mt-6 inline-block rounded-full border border-green-500/60 bg-green-950/40 px-4 py-1 text-xs font-bold tracking-widest text-green-300">{props.solo ? '★ MISSION COMPLETE — 3 / 3 STAGES SOLVED IN SOLO PRACTICE' : '★ MISSION COMPLETE — 3 / 3 STAGES SOLVED TOGETHER'}</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl"><span className="shimmer-text">THE VAULT IS OPEN</span></h1>
      <p className="mt-3 text-zinc-300">Room {room.code} · {room.legacyName} (Legacy) + {room.recruitName} (Recruit) · {fmt(totalMs)} · {totalAttempts} total attempts</p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-yellow-600/60 bg-gradient-to-b from-yellow-950/40 to-faze-panel p-6 text-left">
        <p className="font-mono text-xs font-bold text-yellow-300">SHAREABLE ACHIEVEMENT</p>
        <p className="mt-2 font-display text-xl">BLACKBOX UNLOCKED</p>
        <p className="mt-1 text-sm text-zinc-300">{props.solo ? 'Completed all 3 stages in solo practice.' : 'Completed all 3 stages cooperatively — no solo solves.'}</p>
        <p className="mt-2 text-xs text-zinc-500">{props.solo ? 'Mission completed in solo practice' : 'Mission completed together'} · {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-faze-line bg-faze-panel p-5 text-left">
        <p className="font-mono text-xs font-bold text-faze-red">THE FINALE — FIVE STARS ON THE CREST</p>
        <p className="mt-2 text-sm text-zinc-300">One star per world title: the 2021 Call of Duty League Championship, the 2022 PGL Major in Antwerp, the 2023 Halo World Championship, and back-to-back Six Invitationals in 2025 and 2026 — the first organisation ever to defend one. {props.solo ? 'You counted them yourself: three from the Legacy dossier, two from the Recruit’s.' : 'You counted them together: three from the Legacy Agent, two from the Recruit.'}</p>
        <p className="mt-2 text-xs text-zinc-500">Source: “FaZe Clan: A Timeline, 2010–2026” (sponsor-provided). The star mapping is the timeline’s own reconstruction, not an official FaZe statement.</p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button onClick={() => props.copy(shareText, 'share')} className="rounded-xl bg-faze-red px-5 py-3 font-bold shadow-glow">{props.copied === 'share' ? 'Copied!' : 'Copy achievement to share'}</button>
        <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: 'FaZe Blackbox', text: shareText }) } catch { /* user cancelled */ } } else props.copy(shareText, 'share') }} className="rounded-xl border border-faze-line px-5 py-3 font-bold">Share…</button>
        <button onClick={props.onInviteFresh} className="rounded-xl border border-faze-red px-5 py-3 font-bold text-red-200">Invite a friend to play</button>
        <button onClick={props.onAgain} className="rounded-xl border border-faze-line px-5 py-3 font-bold">Play again — new room</button>
      </div>

      <div className="mt-8 grid gap-3 text-left md:grid-cols-2">
        <div className="rounded-2xl border border-faze-red/50 bg-gradient-to-b from-faze-red/10 to-faze-panel p-5">
          <p className="font-mono text-xs font-bold text-faze-red">EPISODE PREVIEW</p>
          <h2 className="mt-1 font-display text-lg">EPISODE 02 — THE RED ROOM TAPES</h2>
          <p className="mt-2 text-sm text-zinc-300">A preview of the next vault and its new clues.</p>
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
