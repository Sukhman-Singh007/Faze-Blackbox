const prefix = 'faze-blackbox:run:v2:'

export function readRun<T>(id: string): T | null {
  try {
    const raw = sessionStorage.getItem(prefix + id)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

export function saveRun<T>(id: string, run: T): void {
  try {
    sessionStorage.setItem(prefix + id, JSON.stringify(run))
  } catch {
    // Running without browser storage is still supported.
  }
}

export function clearRun(id: string): void {
  try {
    sessionStorage.removeItem(prefix + id)
  } catch {
    // Running without browser storage is still supported.
  }
}
