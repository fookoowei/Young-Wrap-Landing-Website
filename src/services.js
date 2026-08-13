export function initServiceTabs() {
  const tabs = [...document.querySelectorAll('.svc-tab')]
  const panels = [...document.querySelectorAll('.svc-panel')]
  if (!tabs.length) return

  const select = (tab) => {
    for (const t of tabs) t.setAttribute('aria-selected', String(t === tab))
    for (const p of panels) p.hidden = p.dataset.svc !== tab.dataset.svc
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab))
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const next = tabs[(i + (e.key === 'ArrowDown' ? 1 : tabs.length - 1)) % tabs.length]
      next.focus()
      select(next)
    })
  })
}
