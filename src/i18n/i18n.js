import { translations } from './translations.js'

const STORAGE_KEY = 'yw-lang'

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key
}

export function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'zh' ? 'zh' : 'en'
  } catch {
    return 'en'
  }
}

export function applyLanguage(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en'
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(lang, el.dataset.i18n)
  }
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch { /* private mode — non-fatal */ }
}

export function initLanguageToggle(buttonEl) {
  let lang = getSavedLanguage()
  const render = () => {
    buttonEl.textContent = lang === 'en' ? '中文' : 'EN'
    applyLanguage(lang)
  }
  buttonEl.addEventListener('click', () => {
    lang = lang === 'en' ? 'zh' : 'en'
    render()
  })
  render()
}
