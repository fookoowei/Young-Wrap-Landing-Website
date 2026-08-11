import './styles/main.css'
import { initLanguageToggle, getSavedLanguage } from './i18n/i18n.js'
import { WRAP_COLORS, WRAP_FINISHES, wrapParams } from './three/wraps.js'
import { createCarViewer } from './three/carViewer.js'

async function initViewer() {
  const container = document.getElementById('car-canvas')
  const viewer = await createCarViewer(container).catch(() => null)
  if (!viewer) {
    container.classList.add('viewer-fallback')
    return
  }

  const lang = getSavedLanguage()
  let colorId = WRAP_COLORS[0].id
  let finishId = 'gloss'
  let customHex = null
  const update = () => viewer.applyWrap(wrapParams(colorId, finishId, customHex))

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
      customHex = null
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

  // Full swatch-clearing / hash-sync behaviour lands in Task 3; for now the
  // input just overrides the active swatch colour with the picked hex.
  const customColor = document.getElementById('custom-color')
  customColor.addEventListener('input', (e) => {
    customHex = e.target.value
    update()
  })

  update()
}

initLanguageToggle(document.getElementById('lang-toggle'))
initViewer()
