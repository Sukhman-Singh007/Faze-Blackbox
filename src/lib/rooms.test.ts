// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { RoomStore, emptyRoom, ownsSeat, saveSession, loadSession, clearSession, gameElapsedMs, type PlayerSession } from './rooms'

// In-memory Storage stand-in for localStorage / sessionStorage in node.
function makeStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
    clear: () => map.clear(),
  }
}

beforeEach(() => {
  Object.assign(globalThis, { localStorage: makeStorage(), sessionStorage: makeStorage() })
})

describe('room creation / joining (both host-role combinations)', () => {
  it('Scenario 1: Legacy hosts, Recruit joins -> status playing, roles correct', () => {
    const host = new RoomStore()
    const joiner = new RoomStore()
    const { room, playerId: hostId } = host.create('Sukhman', 'legacy')
    expect(room.status).toBe('waiting')
    const res = joiner.join(room.code, 'Akumar', 'player-recruit')
    expect('error' in res).toBe(false)
    if ('error' in res) return
    expect(res.role).toBe('recruit')
    expect(res.room.status).toBe('playing')
    expect(res.room.legacyName).toBe('Sukhman')
    expect(res.room.recruitName).toBe('Akumar')
    expect(res.room.legacyPlayerId).toBe(hostId)
  })

  it('Scenario 2 (the reported bug): Recruit hosts, Legacy joins -> must also start', () => {
    const host = new RoomStore()
    const joiner = new RoomStore()
    const { room } = host.create('Akumar', 'recruit')
    const res = joiner.join(room.code, 'Sukhman', 'player-legacy')
    expect('error' in res).toBe(false)
    if ('error' in res) return
    expect(res.role).toBe('legacy')
    // Before the fix this stayed 'waiting' and both players sat on
    // "Both agents in — starting…" forever.
    expect(res.room.status).toBe('playing')
    expect(res.room.legacyJoined).toBe(true)
    expect(res.room.recruitJoined).toBe(true)
  })

  it('a third player cannot take an occupied seat', () => {
    const s = new RoomStore()
    const { room } = s.create('A', 'legacy')
    s.join(room.code, 'B', 'p-b')
    const third = s.join(room.code, 'C', 'p-c')
    expect('error' in third).toBe(true)
  })

  it('joining a finished room is rejected, joining a missing room is rejected', () => {
    const s = new RoomStore()
    expect('error' in s.join('XXXXXX', 'Nobody', 'p-x')).toBe(true)
    const { room } = s.create('A', 'legacy')
    const done = { ...room, status: 'completed' as const }
    s.save(done)
    expect('error' in s.join(room.code, 'B', 'p-b')).toBe(true)
  })
})

describe('gameplay timer (gameStartedAt)', () => {
  it('gameStartedAt is null at creation, set when the second seat fills — both host roles', () => {
    const s = new RoomStore()
    const { room: r1 } = s.create('Sukhman', 'legacy')
    expect(r1.gameStartedAt).toBeNull()
    expect(r1.status).toBe('waiting')
    const joined = s.join(r1.code, 'Akumar', 'p-recruit')
    expect('error' in joined).toBe(false)
    if ('error' in joined) return
    expect(joined.room.status).toBe('playing')
    expect(joined.room.gameStartedAt).not.toBeNull()

    const { room: r2 } = s.create('Akumar', 'recruit')
    expect(r2.gameStartedAt).toBeNull()
    const joined2 = s.join(r2.code, 'Sukhman', 'p-legacy')
    expect('error' in joined2).toBe(false)
    if ('error' in joined2) return
    expect(joined2.room.gameStartedAt).not.toBeNull()
  })

  it('a reconnect / re-join never moves gameStartedAt', () => {
    const s = new RoomStore()
    const { room, playerId } = s.create('Sukhman', 'legacy')
    const joined = s.join(room.code, 'Akumar', 'p-recruit')
    if ('error' in joined) throw new Error('join failed in test setup')
    const started = joined.room.gameStartedAt
    expect(started).not.toBeNull()
    // Same player re-joins with the same token (refresh path).
    const again = s.join(room.code, 'Sukhman', playerId)
    expect('error' in again).toBe(false)
    if ('error' in again) return
    expect(again.room.gameStartedAt).toBe(started)
    // And a plain reload keeps it too.
    expect(new RoomStore().load(room.code)!.gameStartedAt).toBe(started)
  })

  it('gameElapsedMs: 0 before play starts, runs while playing, freezes at completedAt', () => {
    const s = new RoomStore()
    const { room } = s.create('A', 'legacy')
    // Waiting in the lobby: no gameplay time, however long the room sits.
    expect(gameElapsedMs(room, Date.now() + 82 * 60 * 1000)).toBe(0)
    const joined = s.join(room.code, 'B', 'p-b')
    if ('error' in joined) throw new Error('join failed in test setup')
    const start = new Date(joined.room.gameStartedAt!).getTime()
    expect(gameElapsedMs(joined.room, start + 90_000)).toBe(90_000)
    // Completed: frozen at completedAt, later "now" changes nothing.
    const done = { ...joined.room, status: 'completed' as const, completedAt: new Date(start + 300_000).toISOString() }
    expect(gameElapsedMs(done, start + 999_999_999)).toBe(300_000)
    expect(gameElapsedMs(done)).toBe(300_000)
  })

  it('gameElapsedMs falls back to startedAt for pre-fix rooms without gameStartedAt', () => {
    const r = emptyRoom('ABC123', 'A', 'legacy')
    const done = { ...r, gameStartedAt: null, status: 'completed' as const, completedAt: new Date(new Date(r.startedAt).getTime() + 60_000).toISOString() }
    expect(gameElapsedMs(done)).toBe(60_000)
  })
})

describe('refresh / reconnect (session restore)', () => {
  it('Scenario 6: a refresh restores the same seat, stage and progress — no duplicate player', () => {
    const s = new RoomStore()
    const { room, playerId } = s.create('Sukhman', 'legacy')
    const joined = s.join(room.code, 'Akumar', 'p-recruit')
    if ('error' in joined) throw new Error('join failed in test setup')
    // Simulate the Legacy player's tab: save session, then "refresh"
    // (new RoomStore instance, same storages) and restore from it.
    const session: PlayerSession = { code: room.code, role: 'legacy', name: 'Sukhman', playerId, solo: false }
    saveSession(session)
    const restoredSession = loadSession()
    expect(restoredSession?.code).toBe(room.code)
    const fresh = new RoomStore()
    const reloaded = fresh.load(room.code)
    expect(reloaded).not.toBeNull()
    expect(reloaded!.status).toBe('playing')
    expect(ownsSeat(reloaded!, 'legacy', restoredSession!)).toBe(true)
    // Re-joining with the same playerId hands the same seat back.
    const again = fresh.join(room.code, 'Sukhman', playerId)
    expect('error' in again).toBe(false)
    if ('error' in again) return
    expect(again.role).toBe('legacy')
    expect(again.room.legacyJoined).toBe(true)
    expect(again.room.recruitJoined).toBe(true) // other player NOT replaced
  })

  it('an unrelated session cannot claim an occupied seat', () => {
    const s = new RoomStore()
    const { room } = s.create('Sukhman', 'legacy')
    s.join(room.code, 'Akumar', 'p-recruit')
    const stranger: PlayerSession = { code: room.code, role: 'legacy', name: 'Mallory', playerId: 'p-stranger', solo: false }
    expect(ownsSeat(room, 'legacy', stranger)).toBe(false)
    expect(ownsSeat(room, 'recruit', stranger)).toBe(false)
  })

  it('clearSession removes the saved session', () => {
    saveSession({ code: 'ABC123', role: 'legacy', name: 'A', playerId: 'p-1', solo: false })
    expect(loadSession()).not.toBeNull()
    clearSession()
    expect(loadSession()).toBeNull()
  })

  it('emptyRoom keeps pre-fix rooms readable (no player ids)', () => {
    const r = emptyRoom('ABC123', 'A', 'legacy')
    expect(r.legacyPlayerId).toBe('')
    expect(r.status).toBe('waiting')
  })
})
