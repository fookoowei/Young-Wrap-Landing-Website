const IMAGES = [1, 2, 3, 4, 5, 6].map((i) => ({
  src: `${import.meta.env.BASE_URL}images/gallery-${i}.svg`,
  alt: `Young Wrap project ${i}`, // replace with descriptive alts when real photos arrive
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
