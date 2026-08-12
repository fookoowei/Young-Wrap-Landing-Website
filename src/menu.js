import gsap from 'gsap'

export function initHeaderScroll() {
  const header = document.querySelector('.site-header')
  if (!header) return
  const update = () => header.classList.toggle('is-scrolled', scrollY > 24)
  addEventListener('scroll', update, { passive: true })
  update()
}

export function initMenu() {
  const btn = document.getElementById('menu-toggle')
  const panel = document.getElementById('menu-overlay')
  const backdrop = document.getElementById('menu-backdrop')
  const closeBtn = document.getElementById('menu-close')
  const links = panel.querySelectorAll('a, button')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let open = false

  function setOpen(next) {
    open = next
    btn.setAttribute('aria-expanded', String(open))
    btn.classList.toggle('is-open', open)
    document.body.classList.toggle('menu-open', open)
    gsap.killTweensOf([panel, backdrop])
    gsap.killTweensOf(panel.querySelector('[data-menu-stagger]').children)
    if (open) {
      panel.hidden = false
      backdrop.hidden = false
      if (!reduce) {
        gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        gsap.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.45, ease: 'power3.out' })
        gsap.fromTo(panel.querySelector('[data-menu-stagger]').children,
          { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'power3.out', delay: 0.15 })
      }
      closeBtn.focus()
    } else {
      const done = () => { if (!open) { panel.hidden = true; backdrop.hidden = true } }
      if (reduce) done()
      else {
        gsap.to(backdrop, { opacity: 0, duration: 0.25 })
        gsap.to(panel, { xPercent: 100, duration: 0.35, ease: 'power3.in', onComplete: done })
      }
      btn.focus()
    }
  }

  btn.addEventListener('click', () => setOpen(!open))
  closeBtn.addEventListener('click', () => setOpen(false))
  backdrop.addEventListener('click', () => setOpen(false))
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false) })
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
