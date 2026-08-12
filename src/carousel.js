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
  const viewport = track.parentElement

  // two copies of the set make the drag loop seamless; the clone set is
  // hidden from the accessibility tree
  for (let copy = 0; copy < 2; copy++) {
    for (const { src, alt } of IMAGES) {
      const card = document.createElement('figure')
      card.className = 'portfolio-card'
      if (copy > 0) card.setAttribute('aria-hidden', 'true')
      card.innerHTML = `<img src="${src}" alt="${copy > 0 ? '' : alt}" loading="lazy" draggable="false" />`
      track.append(card)
    }
  }
  const cards = [...track.children]

  // while dragging, every card recedes and greys out except the one
  // closest to the viewport centre
  const markCentered = () => {
    const mid = viewport.getBoundingClientRect().left + viewport.clientWidth / 2
    let best, bestDist = Infinity
    for (const card of cards) {
      const r = card.getBoundingClientRect()
      const d = Math.abs(r.left + r.width / 2 - mid)
      if (d < bestDist) { bestDist = d; best = card }
    }
    for (const card of cards) card.classList.toggle('is-centered', card === best)
  }

  // distance between the first card of each copy = one full loop
  let period = track.children[IMAGES.length].offsetLeft - track.children[0].offsetLeft
  let wrapX = gsap.utils.wrap(-period, 0)
  const applyWrap = function () { gsap.set(track, { x: wrapX(this.x) }); markCentered() }
  Draggable.create(track, {
    type: 'x', inertia: true,
    onPress: () => { markCentered(); viewport.classList.add('is-dragging') },
    onDrag: applyWrap,
    onThrowUpdate: applyWrap,
    onRelease: function () {
      if (!this.tween || !this.tween.isActive()) viewport.classList.remove('is-dragging')
    },
    onThrowComplete: () => viewport.classList.remove('is-dragging'),
  })
  addEventListener('resize', () => {
    period = track.children[IMAGES.length].offsetLeft - track.children[0].offsetLeft
    wrapX = gsap.utils.wrap(-period, 0)
    gsap.set(track, { x: wrapX(Number(gsap.getProperty(track, 'x'))) })
  })
}
