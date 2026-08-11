import { describe, it, expect } from 'vitest'
import { WRAP_COLORS, WRAP_FINISHES, wrapParams } from '../src/three/wraps.js'

const ALLOWED_GROUPS = ['bright', 'neutral', 'metallic', 'special']

describe('wrap data', () => {
  it('every color has a valid hex and bilingual name', () => {
    for (const c of WRAP_COLORS) {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(c.name.en).toBeTruthy()
      expect(c.name.zh).toBeTruthy()
    }
  })

  it('has 14 colors with unique ids and a valid group each', () => {
    expect(WRAP_COLORS).toHaveLength(14)
    const ids = new Set(WRAP_COLORS.map((c) => c.id))
    expect(ids.size).toBe(WRAP_COLORS.length)
    for (const c of WRAP_COLORS) {
      expect(ALLOWED_GROUPS).toContain(c.group)
    }
  })

  it('keeps yw-orange as the first color', () => {
    expect(WRAP_COLORS[0].id).toBe('yw-orange')
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

  it('wrapParams("yw-orange", "gloss") returns the orange hex', () => {
    const p = wrapParams('yw-orange', 'gloss')
    expect(p.color).toBe('#FA9C20')
  })

  it('wrapParams(null, "gloss", overrideHex) returns the override hex', () => {
    const p = wrapParams(null, 'gloss', '#123456')
    expect(p.color).toBe('#123456')
  })
})
