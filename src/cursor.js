import gsap from 'gsap'

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const dot = document.createElement('div'); dot.className = 'cursor-dot'
  const ring = document.createElement('div'); ring.className = 'cursor-ring'
  const label = document.createElement('span'); label.className = 'cursor-label'
  // carmen-style flanking arrows, sitting outside the circle
  const arrowL = document.createElement('span'); arrowL.className = 'cursor-arrow cursor-arrow--left'
  arrowL.innerHTML = '<svg viewBox="0 0 6 8" aria-hidden="true"><path d="M6 0 0 4l6 4V5.4L2.9 4 6 2.6Z" fill="currentColor"/></svg>'
  const arrowR = document.createElement('span'); arrowR.className = 'cursor-arrow cursor-arrow--right'
  arrowR.innerHTML = '<svg viewBox="0 0 6 8" aria-hidden="true"><path d="M0 0v2.6L3.1 4 0 5.4V8l6-4Z" fill="currentColor"/></svg>'
  ring.append(arrowL, label, arrowR); document.body.append(dot, ring)

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 })
  const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })
  const rsx = gsap.quickTo(ring, 'scaleX', { duration: 0.2, ease: 'power2.out' }), rsy = gsap.quickTo(ring, 'scaleY', { duration: 0.2, ease: 'power2.out' })
  addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) })

  const LABELS = { drag: 'DRAG', spin: 'SPIN' }
  addEventListener('pointerover', (e) => {
    const pill = e.target.closest('[data-cursor]')
    const interactive = e.target.closest('a, button, input, select, textarea, .swatch, .finish-btn')
    if (pill) {
      label.textContent = LABELS[pill.dataset.cursor] ?? ''
      ring.classList.add('is-pill')
      ring.classList.toggle('has-arrows', pill.dataset.cursor === 'drag')
    } else ring.classList.remove('is-pill', 'has-arrows')
    const hover = Boolean(interactive) && !pill
    ring.classList.toggle('is-hover', hover)
    rsx(hover ? 1.6 : 1); rsy(hover ? 1.6 : 1)
  })
  addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-cursor]')) { ring.classList.remove('is-pill', 'has-arrows'); label.textContent = '' }
  })
}
