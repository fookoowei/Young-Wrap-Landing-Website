import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Sets the hero headline lines + scroll indicator to their pre-reveal state and
// returns a function that plays the reveal. Call play() once the preloader
// finishes (or immediately, if the preloader was skipped).
export function initHeroReveal() {
  const lines = document.querySelectorAll('.hero-headline .line-mask > *')
  const scrollLine = document.querySelector('.scroll-indicator .scroll-line')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduce) return () => {}

  gsap.set(lines, { yPercent: 110 })

  return function play() {
    gsap.to(lines, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' })
    if (scrollLine) {
      gsap.to(scrollLine, { scaleY: 0.35, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.6 })
    }
  }
}

export function initMotion() {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    for (const el of document.querySelectorAll('[data-reveal]')) {
      gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' } })
    }
    for (const group of document.querySelectorAll('[data-reveal-group]')) {
      gsap.from(group.children, { opacity: 0, y: 32, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 85%' } })
    }
    for (const el of document.querySelectorAll('[data-count]')) {
      const target = Number(el.dataset.count)
      const obj = { v: 0 }
      gsap.to(obj, { v: target, duration: 1.4, ease: 'power1.out',
        snap: { v: 1 }, onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        scrollTrigger: { trigger: el, start: 'top 90%' } })
    }
    for (const el of document.querySelectorAll('[data-parallax]')) {
      gsap.to(el, { yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: el, scrub: true } })
    }
    for (const clip of document.querySelectorAll('.media-clip')) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: clip, start: 'top 88%' } })
      tl.from(clip, { clipPath: 'inset(100% 0 0 0)', duration: 1, ease: 'power3.out' }, 0)
        .from(clip.querySelector('img'), { scale: 1.25, duration: 1.4, ease: 'power2.out' }, 0)
    }
  })
  // desktop: as each sticky panel is covered by the next, it recedes behind a
  // darkening veil (opacity + transform only — cheap to composite, no filter)
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 940px)', () => {
    const panels = gsap.utils.toArray('.panel')
    const cleanups = []
    panels.forEach((panel, i) => {
      const next = panels[i + 1]
      if (!next) return
      const veil = document.createElement('div')
      veil.className = 'panel-veil'
      panel.append(veil)
      cleanups.push(() => veil.remove())
      const trig = { trigger: next, start: 'top bottom', end: 'top top', scrub: true }
      gsap.to(panel, { scale: 0.97, transformOrigin: 'center top', ease: 'none', scrollTrigger: trig })
      gsap.to(veil, { opacity: 0.65, ease: 'power1.in', scrollTrigger: trig })
    })
    return () => { for (const fn of cleanups) fn() }
  })
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelector('.hero-video')?.pause()
  })
}
