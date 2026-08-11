export const WRAP_COLORS = [
  { id: 'yw-orange', hex: '#FA9C20', name: { en: 'YW Orange', zh: '炽橙' } },
  { id: 'midnight', hex: '#0b0b0d', name: { en: 'Midnight Black', zh: '午夜黑' } },
  { id: 'arctic', hex: '#e8eaed', name: { en: 'Arctic White', zh: '极地白' } },
  { id: 'nardo', hex: '#7b8087', name: { en: 'Nardo Grey', zh: '纳多灰' } },
  { id: 'racing-red', hex: '#c1121f', name: { en: 'Racing Red', zh: '赛道红' } },
  { id: 'miami-blue', hex: '#00b4d8', name: { en: 'Miami Blue', zh: '迈阿密蓝' } },
  { id: 'signal-yellow', hex: '#ffd60a', name: { en: 'Signal Yellow', zh: '信号黄' } },
  { id: 'emerald', hex: '#2d6a4f', name: { en: 'Emerald Green', zh: '祖母绿' } },
  { id: 'ultraviolet', hex: '#7b2cbf', name: { en: 'Ultraviolet', zh: '紫罗兰' } },
]

export const WRAP_FINISHES = {
  gloss: { label: { en: 'Gloss', zh: '亮面' }, roughness: 0.12, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.04 },
  matte: { label: { en: 'Matte', zh: '哑光' }, roughness: 0.55, metalness: 0.05, clearcoat: 0.0, clearcoatRoughness: 0.0 },
  satin: { label: { en: 'Satin', zh: '缎面' }, roughness: 0.3, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.25 },
  shift: { label: { en: 'Color Shift', zh: '变色龙' }, roughness: 0.18, metalness: 0.6, clearcoat: 1.0, clearcoatRoughness: 0.05, iridescence: 1.0, iridescenceIOR: 1.6 },
}

export function wrapParams(colorId, finishId) {
  const color = WRAP_COLORS.find((c) => c.id === colorId)
  const finish = WRAP_FINISHES[finishId]
  if (!color || !finish) throw new Error(`Unknown wrap combination: ${colorId}/${finishId}`)
  const { label, ...material } = finish
  return { color: color.hex, ...material }
}
