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
  })
  // desktop: as each sticky panel is covered by the next, it recedes and dims
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 940px)', () => {
    const panels = gsap.utils.toArray('.panel')
    panels.forEach((panel, i) => {
      const next = panels[i + 1]
      if (!next) return
      gsap.to(panel, { scale: 0.95, filter: 'brightness(0.45)', transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } })
    })
  })
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelector('.hero-video')?.pause()
  })
}
