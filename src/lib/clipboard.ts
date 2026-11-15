// Small clipboard helper shared by the new games (the vault's copy
// helper lives in App.tsx; this one is importable from components).

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      try {
        ta.select()
        return document.execCommand('copy')
      } finally {
        ta.remove()
      }
    } catch {
      return false
    }
  }
}
