import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  for (const { src, alt } of IMAGES) {
    const card = document.createElement('figure')
    card.className = 'portfolio-card'
    card.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy" draggable="false" /><figcaption>${alt}</figcaption>`
    card.querySelector('img').addEventListener('click', () => {
      if (dragging) return
      lightboxImg.src = src; lightboxImg.alt = alt; lightbox.showModal()
    })
    track.append(card)
  }
  let dragging = false
  const bound = () => Math.min(0, track.parentElement.clientWidth - track.scrollWidth)
  Draggable.create(track, {
    type: 'x', inertia: true, edgeResistance: 0.82,
    bounds: () => ({ minX: bound(), maxX: 0 }),
    onDragStart: () => (dragging = true),
    onThrowComplete: () => (dragging = false),
    onDragEnd: function () { if (!this.tween) dragging = false },
  })
  addEventListener('resize', () => Draggable.get(track)?.applyBounds({ minX: bound(), maxX: 0 }))

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close() })

  ScrollTrigger.refresh()
}
