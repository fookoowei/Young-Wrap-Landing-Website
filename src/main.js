import './styles/main.css'
import { SHOP } from './config.js'
import { initLanguageToggle } from './i18n/i18n.js'

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

wireShopLinks()
initLanguageToggle(document.getElementById('lang-toggle'))
