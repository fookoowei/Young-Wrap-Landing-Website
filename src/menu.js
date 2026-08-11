import gsap from 'gsap'

export function initMenu() {
  const btn = document.getElementById('menu-toggle')
  const overlay = document.getElementById('menu-overlay')
  const links = overlay.querySelectorAll('a, button')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let open = false

  function setOpen(next) {
    open = next
    btn.setAttribute('aria-expanded', String(open))
    btn.classList.toggle('is-open', open)
    document.body.classList.toggle('menu-open', open)
    gsap.killTweensOf(overlay)
    gsap.killTweensOf(overlay.querySelector('[data-menu-stagger]').children)
    if (open) {
      overlay.hidden = false
      if (!reduce) {
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        gsap.fromTo(overlay.querySelector('[data-menu-stagger]').children,
          { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.1 })
      }
      links[0]?.focus()
    } else {
      const done = () => { if (!open) overlay.hidden = true }
      reduce ? done() : gsap.to(overlay, { opacity: 0, duration: 0.25, onComplete: done })
      btn.focus()
    }
  }

  btn.addEventListener('click', () => setOpen(!open))
  overlay.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false) })
  document.addEventListener('keydown', (e) => {
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Tab') { // focus trap
      const f = [...links].filter(el => !el.hidden)
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault() }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
    }
  })
}
