export const WRAP_COLORS = [
  { id: 'yw-orange', hex: '#FA9C20', group: 'bright', name: { en: 'YW Orange', zh: '炽橙' } },
  { id: 'racing-red', hex: '#C1121F', group: 'bright', name: { en: 'Racing Red', zh: '竞速红' } },
  { id: 'miami-blue', hex: '#00B7C2', group: 'bright', name: { en: 'Miami Blue', zh: '迈阿密蓝' } },
  { id: 'acid-green', hex: '#7FB069', group: 'bright', name: { en: 'Acid Green', zh: '酸性绿' } },
  { id: 'jet-black', hex: '#0B0B0C', group: 'neutral', name: { en: 'Jet Black', zh: '曜石黑' } },
  { id: 'pearl-white', hex: '#F4F1EA', group: 'neutral', name: { en: 'Pearl White', zh: '珍珠白' } },
  { id: 'cement-grey', hex: '#9DA3A8', group: 'neutral', name: { en: 'Cement Grey', zh: '水泥灰' } },
  { id: 'khaki-tan', hex: '#B8A47E', group: 'neutral', name: { en: 'Khaki Tan', zh: '卡其棕' } },
  { id: 'gunmetal', hex: '#3A4148', group: 'metallic', name: { en: 'Gunmetal', zh: '枪灰金属' } },
  { id: 'liquid-silver', hex: '#C8CDD2', group: 'metallic', name: { en: 'Liquid Silver', zh: '流银' } },
  { id: 'deep-bronze', hex: '#6E4A1F', group: 'metallic', name: { en: 'Deep Bronze', zh: '深古铜' } },
  { id: 'midnight-purple', hex: '#3B2A63', group: 'special', name: { en: 'Midnight Purple', zh: '午夜紫' } },
  { id: 'chameleon-teal', hex: '#0E5A54', group: 'special', name: { en: 'Chameleon Teal', zh: '变色青' } },
  { id: 'sakura-pink', hex: '#E8A3C3', group: 'special', name: { en: 'Sakura Pink', zh: '樱花粉' } },
]

// GROUP_LABELS kept for tests / fallback text; the on-page headings are driven
// by data-i18n keys (palette.<group>) in src/i18n/translations.js instead, so
// they respond to the language toggle. GROUP_ORDER (its key order) drives the
// render order of the grouped swatch sections in studio.js.
export const GROUP_LABELS = {
  bright: { en: 'Gloss Brights', zh: '亮彩' },
  neutral: { en: 'Neutrals', zh: '中性色' },
  metallic: { en: 'Metallics', zh: '金属色' },
  special: { en: 'Specials', zh: '特殊色' },
}
export const GROUP_ORDER = Object.keys(GROUP_LABELS)

export const WRAP_FINISHES = {
  gloss: { label: { en: 'Gloss', zh: '亮面' }, roughness: 0.12, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.04 },
  matte: { label: { en: 'Matte', zh: '哑光' }, roughness: 0.55, metalness: 0.05, clearcoat: 0.0, clearcoatRoughness: 0.0 },
  satin: { label: { en: 'Satin', zh: '缎面' }, roughness: 0.3, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.25 },
  shift: { label: { en: 'Color Shift', zh: '变色龙' }, roughness: 0.18, metalness: 0.6, clearcoat: 1.0, clearcoatRoughness: 0.05, iridescence: 1.0, iridescenceIOR: 1.6 },
}

export function wrapParams(colorId, finishId, overrideHex) {
  const color = WRAP_COLORS.find((c) => c.id === colorId)
  const finish = WRAP_FINISHES[finishId]
  if (!overrideHex && !color) throw new Error(`Unknown wrap combination: ${colorId}/${finishId}`)
  if (!finish) throw new Error(`Unknown wrap combination: ${colorId}/${finishId}`)
  const hex = overrideHex ?? color.hex
  const { label, ...material } = finish
  return { color: hex, ...material }
}
