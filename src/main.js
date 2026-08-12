import gsap from 'gsap'
import './styles/main.css'
import { SHOP } from './config.js'
import { initLanguageToggle } from './i18n/i18n.js'
import { initCarousel } from './carousel.js'
import { initMotion, initHeroReveal } from './motion.js'
import { initMenu, initHeaderScroll } from './menu.js'
import { initCursor } from './cursor.js'
import { initQuoteForm } from './quote-form.js'

// Landing-only intro: brief brand curtain, then the hero headline reveals.
// Skipped instantly (no animation) once seen this session, or under reduced motion.
function initPreloader(onDone) {
  const el = document.getElementById('preloader')
  if (!el) { onDone(); return }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let seen = false
  try { seen = Boolean(sessionStorage.getItem('yw-seen')) } catch { /* private mode — non-fatal */ }
  if (reduce || seen) {
    el.remove()
    onDone()
    return
  }

  const mark = el.querySelector('.preloader-mark')
  gsap.timeline({
    onComplete: () => {
      el.remove()
      try { sessionStorage.setItem('yw-seen', '1') } catch { /* private mode — non-fatal */ }
      onDone()
    },
  })
    .to(mark, { opacity: 1, letterSpacing: '0.34em', duration: 0.6, ease: 'power2.out' })
    .to(el, { yPercent: -100, duration: 0.6, ease: 'power3.inOut' })
}

function wireShopLinks() {
  const targets = {
    whatsapp: SHOP.whatsappUrl,
    tel: `tel:${SHOP.phone}`,
    maps: SHOP.mapsUrl,
    instagram: SHOP.instagram,
    facebook: SHOP.facebook,
  }
  for (const [key, url] of Object.entries(targets)) {
    for (const el of document.querySelectorAll(`[data-shop="${key}"]`)) el.href = url
  }
  document.querySelector('.shop-address').textContent = SHOP.addressLine
  const mapEmbed = document.querySelector('.map-embed')
  if (mapEmbed) mapEmbed.src = SHOP.mapsEmbedSrc
  const menuPhone = document.querySelector('.menu-phone')
  if (menuPhone) menuPhone.textContent = SHOP.phoneDisplay
}

const playHeroReveal = initHeroReveal()
initPreloader(playHeroReveal)

wireShopLinks()

const kolGrid = document.getElementById('kol-grid')
for (const kol of SHOP.kols) {
  const card = document.createElement('div')
  card.className = 'kol-card'
  const handle = document.createElement('a')
  handle.className = 'kol-handle'
  handle.href = kol.url
  handle.target = '_blank'
  handle.rel = 'noopener'
  handle.textContent = kol.handle
  const iframe = document.createElement('iframe')
  iframe.src = kol.postUrl.replace(/\/?$/, '/') + 'embed/'
  iframe.loading = 'lazy'
  iframe.title = `Instagram post by ${kol.handle}`
  iframe.setAttribute('scrolling', 'no')
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('allowtransparency', 'true')
  card.append(handle, iframe)
  kolGrid.append(card)
}

initLanguageToggle(document.getElementById('lang-toggle'))
initCarousel()
initMotion()
initMenu()
initHeaderScroll()
initCursor()
initQuoteForm(SHOP)
