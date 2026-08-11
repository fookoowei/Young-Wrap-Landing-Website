import './styles/main.css'
import { SHOP } from './config.js'
import { initLanguageToggle } from './i18n/i18n.js'
import { initGallery } from './gallery.js'
import { initMotion } from './motion.js'

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
  const mapEmbed = document.querySelector('.map-embed')
  if (mapEmbed) mapEmbed.src = SHOP.mapsEmbedSrc
}

wireShopLinks()

const kolBox = document.getElementById('kol-embed')
if (SHOP.kol.postUrl) {
  const iframe = document.createElement('iframe')
  iframe.src = SHOP.kol.postUrl.replace(/\/?$/, '/') + 'embed/'
  iframe.loading = 'lazy'
  iframe.title = `Instagram post by ${SHOP.kol.handle}`
  iframe.setAttribute('scrolling', 'no')
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('allowtransparency', 'true')
  kolBox.append(iframe)
}

initLanguageToggle(document.getElementById('lang-toggle'))
initGallery()
initMotion()
