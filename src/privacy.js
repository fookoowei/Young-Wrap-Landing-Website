import './styles/main.css'
import { SHOP, wireWaTextLinks } from './config.js'
import { initCookieNotice } from './cookie-notice.js'
import { initLanguageToggle } from './i18n/i18n.js'
import { initSmoothScroll } from './motion.js'
import { initMenu, initHeaderScroll } from './menu.js'
import { initCursor } from './cursor.js'

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
initLanguageToggle(document.getElementById('lang-toggle'))
initSmoothScroll()
initMenu()
initHeaderScroll()
initCursor()
wireWaTextLinks()
initCookieNotice()
