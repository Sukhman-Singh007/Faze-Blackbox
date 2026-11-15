import { generateRoomCode, type Role } from './puzzles'
import { supabase, supabaseConfigured } from './supabase'

export type RoomStatus = 'waiting' | 'playing' | 'completed'

export interface RoomState {
  code: string
  status: RoomStatus
  stage: number // 1..3, 4 = vault unlocked
  legacyJoined: boolean
  recruitJoined: boolean
  legacyName: string
  recruitName: string
  /** Opaque per-player seat tokens. A seat can only be reclaimed by the
   *  player who holds its token (see restoreSession / join). Older rooms
   *  created before this field existed have empty tokens and fall back to
   *  a name match for that seat. */
  legacyPlayerId: string
  recruitPlayerId: string
  attempts: Record<number, number>
  solvedAt: Record<number, string>
  startedAt: string
  /** When gameplay actually began: the moment the second seat filled
   *  (or solo practice started). NOT room creation — the old timer
   *  measured creation -> completion, so lobby/idle time inflated it
   *  (a completed game showed 82:29 for ~5–10 min of play).
   *  Null while waiting in the lobby; persisted in room state so a
   *  refresh never resets it. Pre-fix rooms have null and fall back
   *  to startedAt in gameElapsedMs(). */
  gameStartedAt: string | null
  completedAt: string | null
  lastEvent: string
}

export function newPlayerId(): string {
  try { return crypto.randomUUID() } catch { return `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` }
}

export function emptyRoom(code: string, creatorName: string, creatorRole: Role, creatorPlayerId = ''): RoomState {
  return {
    code, status: 'waiting', stage: 1,
    legacyJoined: creatorRole === 'legacy', recruitJoined: creatorRole === 'recruit',
    legacyName: creatorRole === 'legacy' ? creatorName : '',
    recruitName: creatorRole === 'recruit' ? creatorName : '',
    legacyPlayerId: creatorRole === 'legacy' ? creatorPlayerId : '',
    recruitPlayerId: creatorRole === 'recruit' ? creatorPlayerId : '',
    attempts: {}, solvedAt: {}, startedAt: new Date().toISOString(),
    gameStartedAt: null,
    completedAt: null, lastEvent: 'Room created',
  }
}

/** Gameplay elapsed time in ms. Starts at gameStartedAt (second seat
 *  filled / solo start), freezes at completedAt. Both players derive
 *  the same number from the same room state. While waiting in the lobby
 *  (no gameStartedAt) it is 0, however long the room sits — that is the
 *  82:29 bug. Pre-fix completed rooms (no gameStartedAt) fall back to
 *  startedAt so old history still reads. */
export function gameElapsedMs(room: RoomState, now = Date.now()): number {
  if (room.completedAt) {
    const start = room.gameStartedAt ? new Date(room.gameStartedAt).getTime() : new Date(room.startedAt).getTime()
    return Math.max(0, new Date(room.completedAt).getTime() - start)
  }
  if (!room.gameStartedAt) return 0
  return Math.max(0, now - new Date(room.gameStartedAt).getTime())
}

const KEY = (code: string) => `faze-blackbox:room:${code}`
const CH = (code: string) => `faze-blackbox-ch:${code}`
const SESSION_KEY = 'faze-blackbox:session'

export interface PlayerSession { code: string; role: Role; name: string; playerId: string; solo: boolean }

// Sessions live in sessionStorage, NOT localStorage, on purpose:
// sessionStorage is per-tab (survives a refresh, is not shared with a
// second tab), while the room itself lives in shared localStorage.
// That is what lets two tabs on one device be two different players,
// and lets either tab refresh and reclaim its own seat.
function sessionStore(): Storage | null {
  try { return typeof sessionStorage !== 'undefined' ? sessionStorage : null } catch { return null }
}

export function saveSession(s: PlayerSession) {
  try { sessionStore()?.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* session is best-effort */ }
}
export function loadSession(): PlayerSession | null {
  try { const raw = sessionStore()?.getItem(SESSION_KEY); return raw ? (JSON.parse(raw) as PlayerSession) : null } catch { return null }
}
export function clearSession() {
  try { sessionStore()?.removeItem(SESSION_KEY) } catch { /* ignore */ }
}

/** Does this session own the given seat? Token match wins; for pre-fix
 *  rooms with no token stored, an exact name match on that seat also counts
 *  (so rooms created before this fix can still be rejoined by their player). */
export function ownsSeat(room: RoomState, role: Role, s: PlayerSession): boolean {
  if (s.code !== room.code || s.role !== role) return false
  const token = role === 'legacy' ? room.legacyPlayerId : room.recruitPlayerId
  const name = role === 'legacy' ? room.legacyName : room.recruitName
  const joined = role === 'legacy' ? room.legacyJoined : room.recruitJoined
  if (!joined) return false
  if (token) return token === s.playerId
  return name !== '' && name === s.name
}

/** Demo transport: localStorage + BroadcastChannel + `storage` events.
 *  Works instantly with two tabs / two windows on the same device, with
 *  no keys and no backend — the path judges use to test the MVP.
 *  Cross-device multiplayer is NOT provided by this transport: two
 *  different devices have separate localStorage. For that, configure
 *  Supabase (see README / supabase/migrations) — the RoomStore API is
 *  the seam where the Supabase Realtime adapter plugs in. */
export class RoomStore {
  private channel: BroadcastChannel | null = null
  private channelCode: string | null = null

  create(name: string, role: Role, playerId = newPlayerId()): { room: RoomState; playerId: string } {
    const code = generateRoomCode()
    const room = emptyRoom(code, name, role, playerId)
    this.save(room)
    return { room, playerId }
  }

  load(code: string): RoomState | null {
    try {
      const raw = localStorage.getItem(KEY(code))
      return raw ? (JSON.parse(raw) as RoomState) : null
    } catch { return null }
  }

  save(room: RoomState) {
    localStorage.setItem(KEY(room.code), JSON.stringify(room))
    // Broadcast ONLY to subscribers of this room's own channel. Before
    // this guard, save() posted on whatever channel was currently open,
    // so creating a fresh room from the completion screen broadcast the
    // NEW room on the OLD room's channel — and the other tab adopted it
    // while still showing its completion screen (live E2E, 2026-11-14).
    if (this.channel && this.channelCode === room.code) this.channel.postMessage(room)
  }

  join(code: string, name: string, playerId = newPlayerId()): { room: RoomState; role: Role; playerId: string } | { error: string } {
    const room = this.load(code)
    if (!room) return { error: `No room found with code ${code}. Check the code and try again.` }
    if (room.status === 'completed') return { error: 'That room already finished its mission. Create a new room to play again.' }
    // Reconnect: this player already holds a seat — hand it back, no duplicate.
    if (room.legacyJoined && room.legacyPlayerId && room.legacyPlayerId === playerId) return { room, role: 'legacy', playerId }
    if (room.recruitJoined && room.recruitPlayerId && room.recruitPlayerId === playerId) return { room, role: 'recruit', playerId }
    // BUG FIX (was: only the recruit-join branch set status='playing', so a
    // recruit-hosted room stuck on "Both agents in — starting…" when the
    // Legacy Agent joined). Both branches now use the same helper, which
    // flips to 'playing' exactly once, the moment the second seat fills.
    const takeSeat = (role: Role): { room: RoomState; role: Role; playerId: string } => {
      if (role === 'legacy') { room.legacyJoined = true; room.legacyName = name; room.legacyPlayerId = playerId }
      else { room.recruitJoined = true; room.recruitName = name; room.recruitPlayerId = playerId }
      room.lastEvent = `${name} joined as ${role === 'legacy' ? 'Legacy Agent' : 'New Recruit'}`
      if (room.legacyJoined && room.recruitJoined && room.status === 'waiting') {
        room.status = 'playing'
        // Gameplay starts NOW — not at room creation. Set once; a
        // reconnect/refresh must never move it.
        if (!room.gameStartedAt) room.gameStartedAt = new Date().toISOString()
      }
      this.save(room)
      return { room, role, playerId }
    }
    if (!room.legacyJoined) return takeSeat('legacy')
    if (!room.recruitJoined) return takeSeat('recruit')
    return { error: 'That room is already full (2 players). Create a new room instead.' }
  }

  subscribe(code: string, cb: (r: RoomState) => void) {
    this.channel = new BroadcastChannel(CH(code))
    this.channelCode = code
    // Defense in depth: ignore messages for any other room code, even
    // if a sender ever posts on the wrong channel again.
    this.channel.onmessage = (e) => { const r = e.data as RoomState; if (r && r.code === code) cb(r) }
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY(code) && e.newValue) cb(JSON.parse(e.newValue) as RoomState)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      this.channel?.close(); this.channel = null; this.channelCode = null
    }
  }

  /** True when a real Supabase backend is configured for this build. */
  get backend(): 'demo-local' | 'supabase' {
    return supabaseConfigured && supabase ? 'supabase' : 'demo-local'
  }
}

export const roomStore = new RoomStore()

export function recordCompletion(code: string, ms: number) {
  try {
    const raw = localStorage.getItem('faze-blackbox:history')
    const list = raw ? JSON.parse(raw) : []
    list.unshift({ code, ms, at: new Date().toISOString() })
    localStorage.setItem('faze-blackbox:history', JSON.stringify(list.slice(0, 20)))
  } catch { /* history is best-effort */ }
}

export function getHistory(): { code: string; ms: number; at: string }[] {
  try { return JSON.parse(localStorage.getItem('faze-blackbox:history') || '[]') } catch { return [] }
}
