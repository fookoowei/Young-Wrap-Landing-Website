import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { translations } from '../src/i18n/translations.js'
import { t } from '../src/i18n/i18n.js'

const HTML_PAGES = ['index.html', 'studio.html', 'privacy.html']

function keysUsedInHtml() {
  const keys = new Set()
  for (const page of HTML_PAGES) {
    const path = fileURLToPath(new URL(`../${page}`, import.meta.url))
    const html = readFileSync(path, 'utf8')
    for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) keys.add(match[1])
  }
  return keys
}

describe('translations dictionary', () => {
  it('has identical key sets for en and zh', () => {
    expect(Object.keys(translations.zh).sort()).toEqual(Object.keys(translations.en).sort())
  })

  it('has no empty strings', () => {
    for (const lang of ['en', 'zh']) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('')
      }
    }
  })
})

describe('data-i18n usage in index.html and studio.html', () => {
  it('every data-i18n key used across both pages has en and zh translations', () => {
    const used = keysUsedInHtml()
    expect(used.size).toBeGreaterThan(0)
    for (const key of used) {
      expect(translations.en, key).toHaveProperty(key)
      expect(translations.zh, key).toHaveProperty(key)
    }
  })
})

describe('t()', () => {
  it('returns the translation for a known key', () => {
    expect(t('zh', 'nav.services')).toBe('服务项目')
  })

  it('falls back to English for a key missing in zh', () => {
    expect(t('zh', '__missing__')).toBe(t('en', '__missing__'))
  })

  it('returns the key itself when unknown in every language', () => {
    expect(t('en', 'no.such.key')).toBe('no.such.key')
  })
})
