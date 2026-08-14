import { getSavedLanguage, t } from './i18n/i18n.js'

const STORAGE_KEY = 'yw-cookies-ok'

export function initCookieNotice() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return
  } catch { /* private mode — still show; dismissal just won't persist */ }

  const lang = getSavedLanguage()
  const box = document.createElement('div')
  box.className = 'cookie-notice'
  box.setAttribute('role', 'region')
  box.setAttribute('aria-label', 'Cookie notice')

  const msg = document.createElement('p')
  msg.dataset.i18n = 'cookie.msg'
  msg.textContent = t(lang, 'cookie.msg')

  const actions = document.createElement('div')
  actions.className = 'cookie-actions'
  const ok = document.createElement('button')
  ok.className = 'btn btn-primary'
  ok.type = 'button'
  ok.dataset.i18n = 'cookie.ok'
  ok.textContent = t(lang, 'cookie.ok')
  ok.addEventListener('click', () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* non-fatal */ }
    box.remove()
  })
  const more = document.createElement('a')
  more.href = 'privacy.html'
  more.dataset.i18n = 'cookie.more'
  more.textContent = t(lang, 'cookie.more')
  actions.append(ok, more)

  box.append(msg, actions)
  document.body.append(box)
}
