import gsap from 'gsap'

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const dot = document.createElement('div'); dot.className = 'cursor-dot'
  const ring = document.createElement('div'); ring.className = 'cursor-ring'
  const label = document.createElement('span'); label.className = 'cursor-label'
  ring.append(label); document.body.append(dot, ring)

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 })
  const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })
  const rsx = gsap.quickTo(ring, 'scaleX', { duration: 0.2, ease: 'power2.out' }), rsy = gsap.quickTo(ring, 'scaleY', { duration: 0.2, ease: 'power2.out' })
  addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) })

  const LABELS = { drag: 'DRAG', spin: 'SPIN' }
  addEventListener('pointerover', (e) => {
    const pill = e.target.closest('[data-cursor]')
    const interactive = e.target.closest('a, button, input, select, textarea, .swatch, .finish-btn')
    if (pill) { label.textContent = LABELS[pill.dataset.cursor] ?? ''; ring.classList.add('is-pill') }
    else ring.classList.remove('is-pill')
    const hover = Boolean(interactive) && !pill
    ring.classList.toggle('is-hover', hover)
    rsx(hover ? 1.6 : 1); rsy(hover ? 1.6 : 1)
  })
  addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-cursor]')) { ring.classList.remove('is-pill'); label.textContent = '' }
  })
}
