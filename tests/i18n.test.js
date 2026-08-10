import { describe, it, expect } from 'vitest'
import { translations } from '../src/i18n/translations.js'
import { t } from '../src/i18n/i18n.js'

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
