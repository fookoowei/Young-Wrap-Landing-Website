import './styles/main.css'
import { SHOP } from './config.js'
import { initLanguageToggle, getSavedLanguage, t } from './i18n/i18n.js'
import { WRAP_COLORS, WRAP_FINISHES, GROUP_ORDER, wrapParams } from './three/wraps.js'
import { createCarViewer } from './three/carViewer.js'
import { initMotion } from './motion.js'
import { initMenu } from './menu.js'

function wireShopLinks() {
  const targets = {
    whatsapp: SHOP.whatsappUrl,
    tel: `tel:${SHOP.phone}`,
    instagram: SHOP.instagram,
    facebook: SHOP.facebook,
  }
  for (const [key, url] of Object.entries(targets)) {
    for (const el of document.querySelectorAll(`[data-shop="${key}"]`)) el.href = url
  }
  const menuPhone = document.querySelector('.menu-phone')
  if (menuPhone) menuPhone.textContent = SHOP.phoneDisplay
}

wireShopLinks()

const HASH_RE = /#?c=([0-9a-fA-F]{6})&f=(\w+)/

function parseHash(hash) {
  const match = hash.match(HASH_RE)
  if (!match) return null
  const [, hex, finish] = match
  return {
    hex: `#${hex.toUpperCase()}`,
    finishId: Object.hasOwn(WRAP_FINISHES, finish) ? finish : 'gloss',
  }
}

async function initViewer() {
  const container = document.getElementById('car-canvas')
  const viewer = await createCarViewer(container).catch(() => null)
  if (!viewer) {
    container.classList.add('viewer-fallback')
    return
  }

  const lang = getSavedLanguage()
  const parsed = parseHash(location.hash)

  let colorId = WRAP_COLORS[0].id
  let finishId = 'gloss'
  let customHex = null

  if (parsed) {
    const match = WRAP_COLORS.find((c) => c.hex.toUpperCase() === parsed.hex)
    finishId = parsed.finishId
    if (match) {
      colorId = match.id
    } else {
      colorId = null
      customHex = parsed.hex
    }
  }

  const currentHex = () => customHex ?? WRAP_COLORS.find((c) => c.id === colorId)?.hex ?? WRAP_COLORS[0].hex

  const syncHash = () => {
    history.replaceState(null, '', `#c=${currentHex().slice(1)}&f=${finishId}`)
  }

  const update = () => {
    viewer.applyWrap(wrapParams(colorId, finishId, customHex))
    syncHash()
  }

  const swatchButtons = []
  const clearSwatchSelection = () => {
    for (const el of swatchButtons) el.setAttribute('aria-selected', 'false')
  }

  const swatchBox = document.getElementById('wrap-colors')
  for (const group of GROUP_ORDER) {
    const colors = WRAP_COLORS.filter((c) => c.group === group)
    if (!colors.length) continue

    const heading = document.createElement('p')
    heading.className = 'picker-title swatch-group-title'
    heading.dataset.i18n = `palette.${group}`
    heading.textContent = t(lang, `palette.${group}`)
    swatchBox.append(heading)

    const row = document.createElement('div')
    row.className = 'swatches'
    for (const c of colors) {
      const btn = document.createElement('button')
      btn.className = 'swatch'
      btn.type = 'button'
      btn.style.background = c.hex
      btn.title = c.name[lang]
      btn.setAttribute('role', 'option')
      btn.setAttribute('aria-selected', String(c.id === colorId))
      btn.addEventListener('click', () => {
        colorId = c.id
        customHex = null
        clearSwatchSelection()
        btn.setAttribute('aria-selected', 'true')
        customColor.value = c.hex
        update()
      })
      swatchButtons.push(btn)
      row.append(btn)
    }
    swatchBox.append(row)
  }

  // Custom colour "swatch": a picker-title + a color input styled as a
  // swatch with a "+" overlay (see .swatch-custom-wrap in main.css).
  const customTitle = document.createElement('p')
  customTitle.className = 'picker-title'
  customTitle.dataset.i18n = 'picker.custom'
  customTitle.textContent = t(lang, 'picker.custom')
  swatchBox.append(customTitle)

  const customRow = document.createElement('div')
  customRow.className = 'swatches'
  const customWrap = document.createElement('span')
  customWrap.className = 'swatch-custom-wrap'
  const customColor = document.createElement('input')
  customColor.type = 'color'
  customColor.id = 'custom-color'
  customColor.setAttribute('aria-label', t(lang, 'picker.custom'))
  customColor.setAttribute('role', 'option')
  customColor.value = currentHex()
  customColor.addEventListener('input', (e) => {
    customHex = e.target.value.toUpperCase()
    colorId = null
    clearSwatchSelection()
    update()
  })
  customWrap.append(customColor)
  customRow.append(customWrap)
  swatchBox.append(customRow)

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

initLanguageToggle(document.getElementById('lang-toggle'))
initViewer()
initMotion()
initMenu()
