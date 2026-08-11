import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

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
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelector('.hero-video')?.pause()
  })
}
