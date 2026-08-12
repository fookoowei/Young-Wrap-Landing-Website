import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl } from '../src/quote-form.js'

describe('buildWhatsAppUrl', () => {
  it('encodes all fields into a wa.me url', () => {
    const url = buildWhatsAppUrl('https://wa.me/60196002910', { name: 'Ali', car: 'GR86', service: 'Full Wrap', message: 'matte black?' })
    expect(url.startsWith('https://wa.me/60196002910?text=')).toBe(true)
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Ali'); expect(text).toContain('GR86'); expect(text).toContain('Full Wrap'); expect(text).toContain('matte black?')
  })
  it('omits empty fields', () => {
    const text = decodeURIComponent(buildWhatsAppUrl('https://wa.me/1', { name: 'A', car: '', service: '', message: '' }).split('text=')[1])
    expect(text).not.toContain('Item:')
  })
})
