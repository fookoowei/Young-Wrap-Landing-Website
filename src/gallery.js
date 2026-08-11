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

export function initGallery() {
  const grid = document.getElementById('gallery-grid')
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = lightbox.querySelector('.lightbox-img')

  for (const { src, alt } of IMAGES) {
    const img = document.createElement('img')
    img.src = src
    img.alt = alt
    img.loading = 'lazy'
    img.addEventListener('click', () => {
      lightboxImg.src = src
      lightboxImg.alt = alt
      lightbox.showModal()
    })
    grid.append(img)
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close() })
}
