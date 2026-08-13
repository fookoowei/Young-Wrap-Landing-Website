import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
gsap.registerPlugin(ScrollTrigger)

// Lerped scrolling (scgroup-style). Native scroll position is animated, so
// position: sticky and fixed keep working; ScrollTrigger stays in sync.
export function initSmoothScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const lenis = new Lenis({ lerp: 0.09 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a || a.hash.length < 2) return
    const el = document.querySelector(a.hash)
    if (!el) return
    e.preventDefault()
    lenis.scrollTo(el)
  })
}

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
    // about images drift slowly inside their frame (CSS oversizes them so the
    // shift never exposes an edge)
    for (const img of document.querySelectorAll('.edit-media img')) {
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.closest('.edit-media'), start: 'top bottom', end: 'bottom top', scrub: true } })
    }
    // process dial: the number wheel rotates so the active step's number sits
    // on the amber dot; each step still highlights while in view
    const flow = document.querySelector('.flow')
    if (flow) {
      const steps = [...flow.querySelectorAll('.flow-step')]
      const rotor = flow.querySelector('.dial-rotor')
      if (rotor && steps.length > 1) {
        gsap.to(rotor, { rotation: -18 * (steps.length - 1), ease: 'none',
          scrollTrigger: { trigger: flow.querySelector('.flow-steps'), start: 'top center', end: 'bottom center', scrub: true } })
      }
      steps.forEach((step, i) => {
        ScrollTrigger.create({ trigger: step, start: 'top 70%', end: 'bottom 30%',
          toggleClass: { targets: [step, flow.querySelector(`.dial-no[data-step="${i}"]`)].filter(Boolean), className: 'is-active' } })
        gsap.from(step.querySelector('.flow-copy'), { opacity: 0, y: 36, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 82%' } })
      })
    }
  })
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelector('.hero-video')?.pause()
  })
}
