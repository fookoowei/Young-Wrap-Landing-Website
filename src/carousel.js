import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
gsap.registerPlugin(Draggable, InertiaPlugin)

const ALT_TEXTS = [
  'Gloss grey wrap with an orange racing stripe on a Ford Mustang coupe by Young Wrap',
  'Gloss magenta pink full wrap on a Mercedes-Benz A-Class AMG hatchback by Young Wrap',
  'Gloss red wrap with a black roof on a Porsche 911 by Young Wrap',
  'Gloss black full wrap on a Tesla Model Y by Young Wrap',
  'Pearl white full wrap on a Porsche Taycan electric sedan by Young Wrap',
  'Satin gunmetal wrap with a carbon-fibre hood and splitter on a Ford Mustang coupe by Young Wrap',
  'Gloss maroon wrap with a carbon-fibre hood on a modified Honda Civic sedan by Young Wrap',
  'Red and white racing livery wrap on a Toyota GR86 by Young Wrap',
  'Satin silver chrome wrap on a BMW 5 Series sedan by Young Wrap',
  'Gloss gunmetal wrap with a carbon-fibre hood on a Honda Civic Type R by Young Wrap',
]

const IMAGES = ALT_TEXTS.map((alt, i) => ({
  src: `${import.meta.env.BASE_URL}images/car${i + 1}.webp`,
  alt,
}))

export function initCarousel() {
  const track = document.getElementById('portfolio-track')
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = lightbox.querySelector('.lightbox-img')
  let dragging = false

  // two copies of the set make the drag loop seamless; the clone set is
  // hidden from the accessibility tree
  for (let copy = 0; copy < 2; copy++) {
    for (const { src, alt } of IMAGES) {
      const card = document.createElement('figure')
      card.className = 'portfolio-card'
      card.dataset.cursor = 'zoom'
      if (copy > 0) card.setAttribute('aria-hidden', 'true')
      card.innerHTML = `<img src="${src}" alt="${copy > 0 ? '' : alt}" loading="lazy" draggable="false" />`
      card.addEventListener('click', () => {
        if (dragging) return
        lightboxImg.src = src; lightboxImg.alt = alt; lightbox.showModal()
      })
      track.append(card)
    }
  }

  // distance between the first card of each copy = one full loop
  let period = track.children[IMAGES.length].offsetLeft - track.children[0].offsetLeft
  let wrapX = gsap.utils.wrap(-period, 0)
  const applyWrap = function () { gsap.set(track, { x: wrapX(this.x) }) }
  // dragging guard: set on real drags so the click right after a drag can't
  // open the lightbox; reset on every fresh press so the next tap works even
  // when that press interrupted an inertia throw
  Draggable.create(track, {
    type: 'x', inertia: true,
    onPress: () => (dragging = false),
    onDragStart: () => (dragging = true),
    onDrag: applyWrap,
    onThrowUpdate: applyWrap,
  })
  addEventListener('resize', () => {
    period = track.children[IMAGES.length].offsetLeft - track.children[0].offsetLeft
    wrapX = gsap.utils.wrap(-period, 0)
    gsap.set(track, { x: wrapX(Number(gsap.getProperty(track, 'x'))) })
  })

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close() })
}
