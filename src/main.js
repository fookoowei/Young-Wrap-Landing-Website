import './styles/main.css'
import { SHOP } from './config.js'
import { initLanguageToggle, getSavedLanguage } from './i18n/i18n.js'
import { WRAP_COLORS, WRAP_FINISHES, wrapParams } from './three/wraps.js'
import { initGallery } from './gallery.js'

function wireShopLinks() {
  const targets = {
    whatsapp: SHOP.whatsappUrl,
    tel: `tel:${SHOP.phone}`,
    maps: SHOP.mapsUrl,
    instagram: SHOP.instagram,
    facebook: SHOP.facebook,
    kol: SHOP.kol.postUrl,
  }
  for (const [key, url] of Object.entries(targets)) {
    for (const el of document.querySelectorAll(`[data-shop="${key}"]`)) el.href = url
  }
  document.querySelector('.shop-address').textContent = SHOP.addressLine
  document.querySelector('.shop-hours').textContent = SHOP.hours
}

async function initViewer() {
  const container = document.getElementById('car-canvas')
  // Dynamic import keeps three.js out of the initial bundle so text paints first.
  const viewer = await import('./three/carViewer.js')
    .then(({ createCarViewer }) => createCarViewer(container))
    .catch(() => null)
  if (!viewer) {
    container.classList.add('viewer-fallback')
    return
  }

  const lang = getSavedLanguage()
  let colorId = WRAP_COLORS[0].id
  let finishId = 'gloss'
  const update = () => viewer.applyWrap(wrapParams(colorId, finishId))

  const swatchBox = document.getElementById('wrap-colors')
  for (const c of WRAP_COLORS) {
    const btn = document.createElement('button')
    btn.className = 'swatch'
    btn.type = 'button'
    btn.style.background = c.hex
    btn.title = c.name[lang]
    btn.setAttribute('role', 'option')
    btn.setAttribute('aria-selected', String(c.id === colorId))
    btn.addEventListener('click', () => {
      colorId = c.id
      for (const el of swatchBox.children) el.setAttribute('aria-selected', 'false')
      btn.setAttribute('aria-selected', 'true')
      update()
    })
    swatchBox.append(btn)
  }

  const finishBox = document.getElementById('wrap-finishes')
  for (const [id, f] of Object.entries(WRAP_FINISHES)) {
    const btn = document.createElement('button')
    btn.className = 'finish-btn'
    btn.type = 'button'
    btn.dataset.i18n = `finish.${id}`
    btn.textContent = f.label[lang]
    btn.setAttribute('role', 'option')
    btn.setAttribute('aria-selected', String(id === finishId))
    btn.addEventListener('click', () => {
      finishId = id
      for (const el of finishBox.children) el.setAttribute('aria-selected', 'false')
      btn.setAttribute('aria-selected', 'true')
      update()
    })
    finishBox.append(btn)
  }

  update()
}

wireShopLinks()
initLanguageToggle(document.getElementById('lang-toggle'))
initGallery()
initViewer()
