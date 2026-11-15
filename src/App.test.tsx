import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

function mount() {
  root = createRoot(container)
  act(() => root.render(<App />))
}

function reload() {
  act(() => root.unmount())
  mount()
}

async function click(label: RegExp) {
  const button = [...container.querySelectorAll('button')].find((el) => label.test(el.textContent ?? ''))
  expect(button).toBeDefined()
  await act(async () => { button!.click() })
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  window.history.replaceState(null, '', '/')
  sessionStorage.clear()
  localStorage.clear()
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
})

describe('first-time judging flows', () => {
  it('puts co-op name feedback beside the control and lets solo play start without a name', async () => {
    mount()
    await click(/^Host as Legacy Agent$/)
    expect(document.activeElement?.id).toBe('matchpoint-name')
    expect(container.querySelector('#matchpoint')?.textContent).toContain('Enter a name to start a room.')
    await click(/^Play solo$/)
    expect(container.textContent).toContain('Round 1 / 3')
    expect(container.textContent).toContain('Credits: 6 / 6')
  })

  it('keeps shared Match Point progress and the selected role after a refresh', async () => {
    window.history.replaceState(null, '', '/?challenge=mp-scen-stackers')
    mount()
    await click(/Switch to New Recruit/)
    await click(/Rush the site/)
    await click(/Continue to round 2/)
    expect(container.textContent).toContain('Credits: 4 / 6')
    reload()
    expect(container.textContent).toContain('Round 2 / 3')
    expect(container.textContent).toContain('Credits: 4 / 6')
    expect(container.textContent).toContain('Switch to Legacy Agent')
    await click(/Save \/ eco round/)
    await click(/Continue to round 3/)
    await click(/Save \/ eco round/)
    expect(container.textContent).toContain('MATCH COMPLETE')
  })

  it('keeps Quick Play progress from the homepage after a refresh', async () => {
    mount()
    await click(/^NBA$/)
    const option = container.querySelector('section button')
    expect(option).toBeDefined()
    await act(async () => { (option as HTMLButtonElement).click() })
    await click(/^Next question$/)
    expect(container.textContent).toContain('Question 2 / 5')
    reload()
    expect(container.textContent).toContain('Question 2 / 5')
  })

  it('opens old Saturday links as practice and handles invalid dates visibly', () => {
    window.history.replaceState(null, '', '/?challenge=sat-2020-01-04')
    mount()
    expect(container.textContent).toContain('Only the current Saturday Challenge counts toward your personal best.')
    window.history.replaceState(null, '', '/?challenge=sat-2026-02-30')
    reload()
    expect(container.textContent).toContain('This challenge link is invalid.')
  })
})
