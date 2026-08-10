import { describe, it, expect } from 'vitest'
import { WRAP_COLORS, WRAP_FINISHES, wrapParams } from '../src/three/wraps.js'

describe('wrap data', () => {
  it('every color has a valid hex and bilingual name', () => {
    for (const c of WRAP_COLORS) {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(c.name.en).toBeTruthy()
      expect(c.name.zh).toBeTruthy()
    }
  })

  it('every finish keeps PBR params in [0,1] and has bilingual labels', () => {
    for (const f of Object.values(WRAP_FINISHES)) {
      for (const key of ['roughness', 'metalness', 'clearcoat', 'clearcoatRoughness']) {
        expect(f[key]).toBeGreaterThanOrEqual(0)
        expect(f[key]).toBeLessThanOrEqual(1)
      }
      expect(f.label.en).toBeTruthy()
      expect(f.label.zh).toBeTruthy()
    }
  })

  it('wrapParams merges color + finish without the label', () => {
    const p = wrapParams(WRAP_COLORS[0].id, 'gloss')
    expect(p.color).toBe(WRAP_COLORS[0].hex)
    expect(p.roughness).toBe(WRAP_FINISHES.gloss.roughness)
    expect(p.label).toBeUndefined()
  })

  it('wrapParams throws on unknown ids', () => {
    expect(() => wrapParams('nope', 'gloss')).toThrow()
    expect(() => wrapParams(WRAP_COLORS[0].id, 'nope')).toThrow()
  })
})
