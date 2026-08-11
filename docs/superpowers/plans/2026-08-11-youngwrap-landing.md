# Young Wrap 3D Landing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-page bilingual landing site for Young Wrap: cinematic video hero, interactive 3D GR86 wrap configurator, services, gallery, KOL embed, Google Maps contact — static output deployable to GitHub Pages.

**Architecture:** Vanilla HTML/CSS/JS bundled by Vite (vanilla template). One `index.html` holds all real content (SEO); JS modules add behavior (i18n, 3D configurator, gallery lightbox). All owner-specific data lives in `src/config.js` so placeholders swap in one place.

**Tech Stack:** Vite 6 (vanilla), Three.js (npm), GitHub Actions → GitHub Pages.

## Global Constraints

- Commit messages: plain, conventional-commit style, **no AI/Claude attribution lines of any kind** (hard user requirement).
- Colors: `--clr-orange: #FF6B00`, `--clr-black: #0B0B0C`, `--clr-surface: #151517`, `--clr-white: #FFFFFF`. Orange = accents/CTAs only, never large backgrounds.
- No frameworks. No React. Three.js is the only heavy dependency.
- Vite `base: './'` (relative paths → works on GitHub Pages subpath AND Hostinger root unchanged).
- Default page language: English (`<html lang="en">`); Chinese via runtime toggle.
- All owner-pending values (phone, address, video, photos, KOL post URL) read from `src/config.js` — never hardcoded in sections.
- Node 20+. Run all commands from the repo root `~/Documents/GitHub/Young-Wrap-Landing-Website`.

## File Structure

```
index.html                      # all sections, real content, SEO tags
vite.config.js
package.json
public/
  videos/hero.mp4               # owner-supplied later (site must work without it)
  videos/hero-poster.jpg        # owner-supplied later
  img/logo.svg                  # placeholder wordmark until real logo arrives
  img/gallery/                  # owner photos later
  models/gr86.glb               # licensed model (Task 4)
  models/ATTRIBUTION.md
  robots.txt
  sitemap.xml
src/
  main.js                       # entry: wires all modules
  config.js                     # ALL owner data + placeholders
  i18n.js                       # EN/ZH dictionary + toggle
  configurator.js               # Three.js GR86 + wrap picker
  gallery.js                    # gallery render + lightbox
  styles/main.css               # theme tokens + all styling
scripts/check-i18n.mjs          # automated dictionary parity check
.github/workflows/deploy.yml    # Pages deploy
```

---

### Task 1: Scaffold + theme + page skeleton

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/styles/main.css`, `.gitignore`

**Interfaces:**
- Produces: section ids `#hero #configurator #services #gallery #kol #contact`, CSS custom properties listed in Global Constraints, `main.js` as module entry. All later tasks hang off these.

- [ ] **Step 1: Init project**

```bash
npm create vite@latest . -- --template vanilla   # answer "Ignore files and continue" if prompted
npm install
npm install three
rm -f counter.js javascript.svg style.css        # remove Vite demo files (paths relative to repo root/src as created)
```

- [ ] **Step 2: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
})
```

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
dist/
.DS_Store
```

- [ ] **Step 4: Write `index.html` skeleton** (content sections filled by later tasks; keep ids exact)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Young Wrap — Car Wrap, PPF, Tint & Coating in Kota Kemuning, Shah Alam</title>
  <script type="module" src="/src/main.js"></script>
</head>
<body>
  <header class="site-header">
    <a class="logo" href="#hero">YOUNG<span>WRAP</span></a>
    <nav class="nav">
      <a href="#services" data-i18n="nav.services">Services</a>
      <a href="#gallery" data-i18n="nav.gallery">Gallery</a>
      <a href="#contact" data-i18n="nav.contact">Contact</a>
      <button id="lang-toggle" class="lang-toggle" type="button">中文</button>
    </nav>
  </header>
  <main>
    <section id="hero"></section>
    <section id="configurator"></section>
    <section id="services"></section>
    <section id="gallery"></section>
    <section id="kol"></section>
    <section id="contact"></section>
  </main>
  <footer class="site-footer">
    <p data-i18n="footer.rights">© 2026 Young Wrap · Kota Kemuning, Shah Alam</p>
  </footer>
</body>
</html>
```

- [ ] **Step 5: Write `src/styles/main.css`** — tokens + base

```css
:root {
  --clr-orange: #FF6B00;
  --clr-black: #0B0B0C;
  --clr-surface: #151517;
  --clr-white: #FFFFFF;
  --clr-muted: #9b9b9f;
  --font-sans: "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--clr-black);
  color: var(--clr-white);
  font-family: var(--font-sans);
  line-height: 1.6;
}
section { min-height: 40vh; padding: 5rem clamp(1rem, 5vw, 4rem); }
h2 { font-size: clamp(1.8rem, 4vw, 3rem); margin-bottom: 1.5rem; }
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem clamp(1rem, 5vw, 4rem);
  background: linear-gradient(rgba(11,11,12,.85), transparent);
}
.logo { color: var(--clr-white); text-decoration: none; font-weight: 800; letter-spacing: .05em; }
.logo span { color: var(--clr-orange); }
.nav { display: flex; gap: 1.5rem; align-items: center; }
.nav a { color: var(--clr-white); text-decoration: none; font-size: .95rem; }
.nav a:hover { color: var(--clr-orange); }
.lang-toggle {
  background: none; border: 1px solid var(--clr-orange); color: var(--clr-orange);
  padding: .3rem .8rem; border-radius: 999px; cursor: pointer; font-size: .85rem;
}
.lang-toggle:hover { background: var(--clr-orange); color: var(--clr-black); }
.btn {
  display: inline-block; padding: .9rem 2rem; border-radius: 999px;
  font-weight: 700; text-decoration: none; transition: transform .15s;
}
.btn:hover { transform: translateY(-2px); }
.btn--primary { background: var(--clr-orange); color: var(--clr-black); }
.btn--ghost { border: 2px solid var(--clr-white); color: var(--clr-white); }
.site-footer { padding: 2rem; text-align: center; color: var(--clr-muted); font-size: .85rem; }
```

- [ ] **Step 6: Write `src/main.js`**

```js
import './styles/main.css'
```

- [ ] **Step 7: Verify** — `npm run dev` shows black page with fixed header, orange accents; `npm run build` exits 0.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: scaffold Vite project with theme and page skeleton"`

---

### Task 2: config.js + video hero

**Files:**
- Create: `src/config.js`
- Modify: `index.html` (`#hero`), `src/styles/main.css`, `src/main.js`

**Interfaces:**
- Produces: `SHOP` export — `{ name, phoneDisplay, phoneE164, whatsappUrl, address, hours, instagram, facebook, kolHandle, kolPostUrl, mapsEmbedSrc, galleryImages }`. Consumed by Tasks 6–8.

- [ ] **Step 1: Write `src/config.js`** (values marked PLACEHOLDER are swapped when owner supplies data)

```js
export const SHOP = {
  name: 'Young Wrap',
  phoneDisplay: '+60 12-345 6789',                       // PLACEHOLDER
  phoneE164: '+60123456789',                             // PLACEHOLDER
  whatsappUrl: 'https://wa.me/60123456789?text=Hi%20Young%20Wrap%2C%20I%20want%20a%20quote', // PLACEHOLDER
  address: 'Kota Kemuning, 40460 Shah Alam, Selangor',   // PLACEHOLDER (street pending)
  hours: 'Mon–Sat · 10:00 AM – 7:00 PM',                 // PLACEHOLDER
  instagram: 'https://www.instagram.com/young.wrap/',
  facebook: 'https://www.facebook.com/people/YoungWrap/61552718845372/',
  kolHandle: 'charlest33',
  kolPostUrl: '',                                        // PLACEHOLDER → e.g. https://www.instagram.com/p/XXXX/
  mapsEmbedSrc: 'https://www.google.com/maps?q=Kota+Kemuning,+Shah+Alam,+Selangor&output=embed', // PLACEHOLDER (exact address later)
  galleryImages: [],                                     // PLACEHOLDER → ['img/gallery/01.jpg', ...]
}
```

- [ ] **Step 2: Fill `#hero` in `index.html`**

```html
<section id="hero" class="hero">
  <video class="hero__video" autoplay muted loop playsinline
         poster="./videos/hero-poster.jpg" aria-hidden="true">
    <source src="./videos/hero.mp4" type="video/mp4" />
  </video>
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <h1 data-i18n="hero.title">Transform Your Ride</h1>
    <p class="hero__tagline" data-i18n="hero.tagline">Wraps · PPF · Tint · Coating — Kota Kemuning, Shah Alam</p>
    <div class="hero__ctas">
      <a class="btn btn--primary" data-contact="whatsapp" href="#" data-i18n="hero.cta_whatsapp">WhatsApp Us</a>
      <a class="btn btn--ghost" data-contact="tel" href="#" data-i18n="hero.cta_call">Call Now</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Hero CSS** (append to `main.css`)

```css
.hero { position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; padding-top: 6rem; }
.hero__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: var(--clr-surface); }
.hero__overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(11,11,12,.88) 25%, rgba(11,11,12,.45) 70%, rgba(255,107,0,.15)); }
.hero__content { position: relative; z-index: 1; max-width: 46rem; }
.hero__content h1 { font-size: clamp(2.6rem, 7vw, 5rem); line-height: 1.1; }
.hero__tagline { margin: 1.2rem 0 2rem; color: var(--clr-muted); font-size: clamp(1rem, 2vw, 1.25rem); }
.hero__ctas { display: flex; gap: 1rem; flex-wrap: wrap; }
```

- [ ] **Step 4: Wire contact links in `src/main.js`** (missing video is fine — poster/surface shows)

```js
import './styles/main.css'
import { SHOP } from './config.js'

for (const a of document.querySelectorAll('[data-contact="whatsapp"]')) a.href = SHOP.whatsappUrl
for (const a of document.querySelectorAll('[data-contact="tel"]')) a.href = `tel:${SHOP.phoneE164}`
document.querySelector('.hero__video')?.addEventListener('error', e => e.currentTarget.remove())
```

- [ ] **Step 5: Verify** — dev server: full-height dark hero, headline, both buttons carry `wa.me`/`tel:` hrefs (inspect element). No console errors despite missing video file.

- [ ] **Step 6: Commit** — `git commit -am "feat: video hero with contact CTAs and central config"`

---

### Task 3: i18n EN ⇄ 中文

**Files:**
- Create: `src/i18n.js`, `scripts/check-i18n.mjs`
- Modify: `src/main.js`, `package.json` (add `"check": "node scripts/check-i18n.mjs"`)

**Interfaces:**
- Produces: `initI18n()` (binds `#lang-toggle`, applies saved language). Dictionary keys must cover every `data-i18n` attribute in `index.html` — later tasks adding `data-i18n` MUST add both `en` and `zh` entries here.

- [ ] **Step 1: Write `src/i18n.js`**

```js
const dict = {
  en: {
    'nav.services': 'Services', 'nav.gallery': 'Gallery', 'nav.contact': 'Contact',
    'hero.title': 'Transform Your Ride',
    'hero.tagline': 'Wraps · PPF · Tint · Coating — Kota Kemuning, Shah Alam',
    'hero.cta_whatsapp': 'WhatsApp Us', 'hero.cta_call': 'Call Now',
    'footer.rights': '© 2026 Young Wrap · Kota Kemuning, Shah Alam',
  },
  zh: {
    'nav.services': '服务项目', 'nav.gallery': '作品展示', 'nav.contact': '联系我们',
    'hero.title': '焕新你的座驾',
    'hero.tagline': '车身改色 · 漆面保护膜 · 隔热膜 · 镀晶 — 哥打哥文宁，莎阿南',
    'hero.cta_whatsapp': 'WhatsApp 咨询', 'hero.cta_call': '立即致电',
    'footer.rights': '© 2026 Young Wrap · 哥打哥文宁，莎阿南',
  },
}

export function applyLang(lang) {
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const t = dict[lang][el.dataset.i18n]
    if (t) el.textContent = t
  }
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en'
  document.getElementById('lang-toggle').textContent = lang === 'zh' ? 'EN' : '中文'
  localStorage.setItem('yw-lang', lang)
}

export function initI18n() {
  let lang = localStorage.getItem('yw-lang') ?? 'en'
  applyLang(lang)
  document.getElementById('lang-toggle').addEventListener('click', () => {
    lang = lang === 'en' ? 'zh' : 'en'
    applyLang(lang)
  })
}

export { dict }
```

- [ ] **Step 2: Write failing check `scripts/check-i18n.mjs`**

```js
import { readFileSync } from 'node:fs'
const src = readFileSync('src/i18n.js', 'utf8')
const html = readFileSync('index.html', 'utf8')
const { dict } = await import('../src/i18n.js').catch(() => ({ dict: null }))
// i18n.js touches document at import-time only inside functions, so import is safe in Node
const enKeys = new Set(Object.keys(dict.en)), zhKeys = new Set(Object.keys(dict.zh))
const htmlKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1])
let fail = false
for (const k of htmlKeys) {
  if (!enKeys.has(k)) { console.error(`missing en: ${k}`); fail = true }
  if (!zhKeys.has(k)) { console.error(`missing zh: ${k}`); fail = true }
}
for (const k of enKeys) if (!zhKeys.has(k)) { console.error(`zh lacks: ${k}`); fail = true }
for (const k of zhKeys) if (!enKeys.has(k)) { console.error(`en lacks: ${k}`); fail = true }
if (fail) process.exit(1)
console.log(`i18n OK — ${htmlKeys.length} keys in HTML, ${enKeys.size} in dict`)
```

- [ ] **Step 3: Add to `package.json` scripts:** `"check": "node scripts/check-i18n.mjs"` — run `npm run check`, expect PASS (fix any missing keys until it passes).

- [ ] **Step 4: Wire into `src/main.js`:** add `import { initI18n } from './i18n.js'` and call `initI18n()`.

- [ ] **Step 5: Verify** — toggle switches all visible text to Chinese and back; reload keeps choice; `<html lang>` flips.

- [ ] **Step 6: Commit** — `git commit -am "feat: EN/ZH language toggle with parity check"`

---

### Task 4: GR86 model sourcing (manual, judgement required)

**Files:**
- Create: `public/models/gr86.glb`, `public/models/ATTRIBUTION.md`

- [ ] **Step 1:** Search Sketchfab (downloadable, CC0/CC-BY filters) for "Toyota GR86" / "GT86" / "Subaru BRZ". Requirements: GLB export, separate body/paint material (check material list on the model page), reasonable poly count.
- [ ] **Step 2:** If no acceptable GR86/GT86/BRZ license exists, pick a generic Japanese sports coupe and record the substitution in `ATTRIBUTION.md` for the owner to see.
- [ ] **Step 3:** Compress: `npx @gltf-transform/cli optimize input.glb public/models/gr86.glb --texture-compress webp` — target ≤ 4 MB. Note actual body-material name(s) in `ATTRIBUTION.md` (Task 5 needs them).
- [ ] **Step 4:** Write `ATTRIBUTION.md`: model name, author, source URL, license, required credit line if CC-BY.
- [ ] **Step 5: Commit** — `git add public/models && git commit -m "feat: add licensed GR86 3D model"`

---

### Task 5: 3D wrap configurator

**Files:**
- Create: `src/configurator.js`
- Modify: `index.html` (`#configurator`), `src/styles/main.css`, `src/main.js`, `src/i18n.js` (new keys)

**Interfaces:**
- Consumes: `public/models/gr86.glb` (Task 4), body-material names from `ATTRIBUTION.md`.
- Produces: `initConfigurator()` — self-contained; safe no-op with fallback message if WebGL missing.

- [ ] **Step 1: Fill `#configurator` in `index.html`**

```html
<section id="configurator" class="config">
  <h2 data-i18n="config.title">Design Your Wrap</h2>
  <p class="config__hint" data-i18n="config.hint">Drag to spin the GR86 — pick a colour and finish to preview your wrap.</p>
  <div class="config__stage"><canvas id="car-canvas"></canvas><div id="car-loading" class="config__loading">Loading 3D…</div></div>
  <div class="config__controls">
    <div class="swatches" id="color-swatches"></div>
    <div class="finishes" id="finish-buttons">
      <button type="button" data-finish="gloss" class="is-active" data-i18n="config.gloss">Gloss</button>
      <button type="button" data-finish="matte" data-i18n="config.matte">Matte</button>
      <button type="button" data-finish="satin" data-i18n="config.satin">Satin</button>
      <button type="button" data-finish="shift" data-i18n="config.shift">Colour Shift</button>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Write `src/configurator.js`**

```js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const COLORS = ['#FF6B00', '#0B0B0C', '#FFFFFF', '#B7BdC4', '#1E3A8A', '#166534', '#7F1D1D', '#F0ABFC']
const FINISHES = {
  gloss: { roughness: .22, metalness: .35, clearcoat: 1, clearcoatRoughness: .05, iridescence: 0 },
  matte: { roughness: .85, metalness: .1, clearcoat: 0, clearcoatRoughness: .5, iridescence: 0 },
  satin: { roughness: .5, metalness: .25, clearcoat: .4, clearcoatRoughness: .3, iridescence: 0 },
  shift: { roughness: .25, metalness: .6, clearcoat: 1, clearcoatRoughness: .08, iridescence: 1, iridescenceIOR: 1.8 },
}
// Adjust after Task 4: names of paint materials in the chosen GLB
const BODY_MATERIAL_RE = /body|paint|car[_ ]?paint|shell/i

export function initConfigurator() {
  const canvas = document.getElementById('car-canvas')
  const loading = document.getElementById('car-loading')
  let renderer
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }) }
  catch { loading.textContent = 'Interactive 3D not supported on this device.'; return }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 100)
  camera.position.set(4.5, 1.6, 4.5)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true; controls.enablePan = false
  controls.minDistance = 3; controls.maxDistance = 8
  controls.maxPolarAngle = Math.PI / 2.05
  controls.autoRotate = true; controls.autoRotateSpeed = .8
  canvas.addEventListener('pointerdown', () => (controls.autoRotate = false))

  const paint = new THREE.MeshPhysicalMaterial({ color: '#FF6B00', ...FINISHES.gloss })
  new GLTFLoader().load(
    `${import.meta.env.BASE_URL}models/gr86.glb`,
    (gltf) => {
      gltf.scene.traverse((o) => {
        if (o.isMesh && BODY_MATERIAL_RE.test(o.material?.name ?? '')) o.material = paint
      })
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const c = box.getCenter(new THREE.Vector3())
      gltf.scene.position.sub(c)
      scene.add(gltf.scene)
      loading.remove()
    },
    undefined,
    () => { loading.textContent = '3D model unavailable.' },
  )

  const stage = canvas.parentElement
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h; camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(stage); resize()
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera) })

  const swatchBox = document.getElementById('color-swatches')
  for (const hex of COLORS) {
    const b = document.createElement('button')
    b.type = 'button'; b.className = 'swatch'; b.style.background = hex
    b.setAttribute('aria-label', `wrap colour ${hex}`)
    b.addEventListener('click', () => paint.color.set(hex))
    swatchBox.append(b)
  }
  document.getElementById('finish-buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-finish]'); if (!btn) return
    Object.assign(paint, FINISHES[btn.dataset.finish]); paint.needsUpdate = true
    for (const s of btn.parentElement.children) s.classList.toggle('is-active', s === btn)
  })
}
```

- [ ] **Step 3: CSS** (append)

```css
.config { text-align: center; }
.config__stage { position: relative; height: min(70vh, 600px); background: radial-gradient(ellipse at 50% 80%, #1c1c20 0%, var(--clr-black) 70%); border-radius: 1rem; overflow: hidden; }
#car-canvas { width: 100%; height: 100%; display: block; touch-action: none; }
.config__loading { position: absolute; inset: 0; display: grid; place-items: center; color: var(--clr-muted); pointer-events: none; }
.config__controls { display: flex; flex-direction: column; gap: 1rem; align-items: center; margin-top: 1.5rem; }
.swatches { display: flex; gap: .6rem; flex-wrap: wrap; justify-content: center; }
.swatch { width: 2.2rem; height: 2.2rem; border-radius: 50%; border: 2px solid #333; cursor: pointer; }
.swatch:hover { border-color: var(--clr-orange); }
.finishes { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; }
.finishes button { background: var(--clr-surface); color: var(--clr-white); border: 1px solid #333; padding: .5rem 1.2rem; border-radius: 999px; cursor: pointer; }
.finishes button.is-active { background: var(--clr-orange); color: var(--clr-black); border-color: var(--clr-orange); }
```

- [ ] **Step 4: Wire in `main.js`** (lazy — only init when section nears viewport)

```js
import { initConfigurator } from './configurator.js'
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting) { initConfigurator(); obs.disconnect() }
}, { rootMargin: '200px' }).observe(document.getElementById('configurator'))
```

- [ ] **Step 5: Add i18n keys** (`config.title/hint/gloss/matte/satin/shift` in both langs; zh: 设计你的车膜 / 拖动旋转 GR86，选择颜色与质感预览效果 / 亮面 / 哑光 / 缎面 / 变色龙) → `npm run check` passes.
- [ ] **Step 6: Verify** — car renders, drag rotates, all 8 swatches recolor body only (not glass/wheels), finishes visibly differ, auto-rotate stops on drag.
- [ ] **Step 7: Commit** — `git commit -am "feat: interactive GR86 wrap configurator"`

---

### Task 6: Services + Gallery

**Files:**
- Modify: `index.html` (`#services`, `#gallery`), `src/styles/main.css`, `src/i18n.js`, `src/main.js`
- Create: `src/gallery.js`

**Interfaces:**
- Consumes: `SHOP.galleryImages`, `SHOP.instagram` from Task 2.

- [ ] **Step 1: `#services` HTML** — five cards, each `h3[data-i18n]` + `p[data-i18n]`:

```html
<section id="services" class="services">
  <h2 data-i18n="services.title">Our Services</h2>
  <div class="services__grid">
    <div class="card"><h3 data-i18n="services.wrap_t">Full & Partial Wraps</h3><p data-i18n="services.wrap_d">Premium vinyl colour change — gloss, matte, satin and colour-shift films.</p></div>
    <div class="card"><h3 data-i18n="services.ppf_t">Paint Protection Film</h3><p data-i18n="services.ppf_d">Self-healing PPF that shields your paint from chips and scratches.</p></div>
    <div class="card"><h3 data-i18n="services.tint_t">Window Tint</h3><p data-i18n="services.tint_d">Heat-rejecting film for cooler cabins and UV protection.</p></div>
    <div class="card"><h3 data-i18n="services.coat_t">Ceramic Coating</h3><p data-i18n="services.coat_d">Deep gloss and long-term protection for paint and wraps.</p></div>
    <div class="card"><h3 data-i18n="services.detail_t">Detailing</h3><p data-i18n="services.detail_d">Interior and exterior detailing to keep your car showroom-fresh.</p></div>
  </div>
</section>
```

CSS: `.services__grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1rem } .card { background:var(--clr-surface); padding:2rem; border-radius:1rem; border-top:3px solid var(--clr-orange) }`

- [ ] **Step 2: `#gallery` HTML + `src/gallery.js`** — renders `SHOP.galleryImages` into a grid with a `<dialog>` lightbox; when the list is empty, renders one card linking to Instagram:

```js
import { SHOP } from './config.js'

export function initGallery() {
  const grid = document.getElementById('gallery-grid')
  if (!SHOP.galleryImages.length) {
    grid.innerHTML = `<a class="card gallery__empty" href="${SHOP.instagram}" target="_blank" rel="noopener">
      <span data-i18n="gallery.empty">See our latest work on Instagram @young.wrap →</span></a>`
    return
  }
  const dialog = document.getElementById('lightbox')
  for (const src of SHOP.galleryImages) {
    const img = document.createElement('img')
    img.src = `${import.meta.env.BASE_URL}${src}`
    img.alt = 'Car wrap by Young Wrap'; img.loading = 'lazy'
    img.addEventListener('click', () => { dialog.querySelector('img').src = img.src; dialog.showModal() })
    grid.append(img)
  }
  dialog.addEventListener('click', () => dialog.close())
}
```

HTML: `<section id="gallery"><h2 data-i18n="gallery.title">Our Work</h2><div id="gallery-grid" class="gallery__grid"></div><dialog id="lightbox"><img alt="Enlarged wrap photo" /></dialog></section>`
CSS: `.gallery__grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:.75rem } .gallery__grid img { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:.75rem; cursor:zoom-in } dialog#lightbox { background:transparent; border:none; max-width:90vw } dialog#lightbox img { max-width:90vw; max-height:85vh } dialog::backdrop { background:rgba(0,0,0,.85) }`

- [ ] **Step 3:** Call `initGallery()` in `main.js` **before** `initI18n()` (so injected `data-i18n` text gets translated). Add all new i18n keys (services.*, gallery.title 作品展示, gallery.empty 到 Instagram @young.wrap 查看最新作品 →, plus zh for the five services: 全车/局部改色贴膜, 漆面保护膜, 车窗隔热膜, 陶瓷镀晶, 精致洗护 + descriptions). `npm run check` passes.
- [ ] **Step 4: Verify** — services grid renders; gallery shows Instagram card (list is empty); toggle translates everything.
- [ ] **Step 5: Commit** — `git commit -am "feat: services and gallery sections"`

---

### Task 7: KOL embed + contact/map

**Files:**
- Modify: `index.html` (`#kol`, `#contact`), `src/main.js`, `src/styles/main.css`, `src/i18n.js`

**Interfaces:**
- Consumes: `SHOP.kolPostUrl`, `SHOP.kolHandle`, `SHOP.mapsEmbedSrc`, `SHOP.address`, `SHOP.hours`, contact fields.

- [ ] **Step 1: `#kol` HTML**

```html
<section id="kol" class="kol">
  <h2 data-i18n="kol.title">As Seen On</h2>
  <p data-i18n="kol.subtitle">Trusted by Charles Tee (@charlest33 · 316K followers)</p>
  <div id="kol-embed" class="kol__embed"></div>
</section>
```

- [ ] **Step 2: `main.js` — inject iframe only when URL exists**

```js
const kolBox = document.getElementById('kol-embed')
if (SHOP.kolPostUrl) {
  kolBox.innerHTML = `<iframe src="${SHOP.kolPostUrl.replace(/\/?$/, '/')}embed" loading="lazy"
    width="400" height="520" frameborder="0" scrolling="no" allowtransparency="true"
    title="Instagram post by @${SHOP.kolHandle}"></iframe>`
} else {
  kolBox.innerHTML = `<a class="btn btn--ghost" href="https://www.instagram.com/${SHOP.kolHandle}/"
    target="_blank" rel="noopener">@${SHOP.kolHandle} on Instagram</a>`
}
```

- [ ] **Step 3: `#contact` HTML** — two-column: info block (address, hours, phone link, IG/FB links, WhatsApp button) + `<iframe class="map" src="" loading="lazy" title="Young Wrap location on Google Maps">`; set `document.querySelector('.map').src = SHOP.mapsEmbedSrc` in `main.js`; render `SHOP.address`, `SHOP.hours`, `SHOP.phoneDisplay` into elements by id (`contact-address`, `contact-hours`, `contact-phone`). Floating WhatsApp button:

```html
<a id="wa-float" data-contact="whatsapp" href="#" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm6.1 16.9c-.3.8-1.5 1.5-2.1 1.6-.6.1-1.2.3-4.1-.9-3.5-1.4-5.7-5-5.9-5.2-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.9.3-.3.7-.4.9-.4h.6c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.7.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1.2-.2 1-1.1 1.2-1.5.2-.4.5-.3.8-.2.3.1 2 1 2.4 1.2.4.2.6.3.7.4.1.2.1.9-.2 1.7z"/></svg>
</a>
```

CSS: `#wa-float { position:fixed; right:1.2rem; bottom:1.2rem; z-index:90; background:#25D366; color:#fff; width:3.4rem; height:3.4rem; border-radius:50%; display:grid; place-items:center; box-shadow:0 4px 16px rgba(0,0,0,.4) }` — `data-contact="whatsapp"` wiring from Task 2 already sets its href. Map CSS: `.map { width:100%; min-height:320px; border:0; border-radius:1rem; filter:grayscale(.2) }`

- [ ] **Step 4:** i18n keys `kol.title 合作推荐 / kol.subtitle Charles Tee (@charlest33 · 31.6万粉丝) 信赖之选 / contact.title 联系我们 / contact.hours_label 营业时间 / contact.address_label 地址` etc. `npm run check` passes.
- [ ] **Step 5: Verify** — KOL section shows profile-link fallback (URL empty), map iframe loads Kota Kemuning, floating WhatsApp visible on all scroll positions.
- [ ] **Step 6: Commit** — `git commit -am "feat: KOL embed, contact section with Google Maps, floating WhatsApp"`

---

### Task 8: SEO + deploy

**Files:**
- Modify: `index.html` `<head>`
- Create: `public/robots.txt`, `public/sitemap.xml`, `.github/workflows/deploy.yml`

- [ ] **Step 1: Head tags** (after `<title>`; URL placeholder `https://USERNAME.github.io/Young-Wrap-Landing-Website/` — update when Pages URL/custom domain is known)

```html
<meta name="description" content="Young Wrap — professional car wrap, PPF, window tint & ceramic coating in Kota Kemuning, Shah Alam. Premium vinyl wraps for your ride. WhatsApp us for a quote." />
<meta property="og:title" content="Young Wrap — Car Wrap, PPF & Tint · Kota Kemuning" />
<meta property="og:description" content="Premium car wraps, PPF, tint & coating in Shah Alam. WhatsApp us for a quote." />
<meta property="og:type" content="website" />
<meta property="og:image" content="./videos/hero-poster.jpg" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoBodyShop",
  "name": "Young Wrap",
  "image": "./videos/hero-poster.jpg",
  "address": { "@type": "PostalAddress", "addressLocality": "Kota Kemuning, Shah Alam", "addressRegion": "Selangor", "addressCountry": "MY" },
  "telephone": "+60123456789",
  "sameAs": ["https://www.instagram.com/young.wrap/", "https://www.facebook.com/people/YoungWrap/61552718845372/"]
}
</script>
```

- [ ] **Step 2:** `public/robots.txt` (`User-agent: *\nAllow: /`) and `public/sitemap.xml` with the single URL.
- [ ] **Step 3: `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run check
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Verify** — `npm run build && npm run preview`: all sections work from the production bundle. Push, enable Pages (Settings → Pages → Source: GitHub Actions), confirm live URL renders including the 3D model.
- [ ] **Step 5:** Lighthouse (Chrome DevTools, mobile): SEO ≥ 95, perf ≥ 80. Fix flagged issues (usually image sizes / unused JS) before closing.
- [ ] **Step 6: Commit** — `git commit -am "feat: SEO metadata and GitHub Pages deploy"` and push.

---

## Later (when owner supplies assets — not blocking)

Drop-in swaps, each a one-commit change: real phone/address in `config.js`; `hero.mp4` + poster into `public/videos/`; gallery photos (resize ≤ 1600px, ~80% quality JPG) into `public/img/gallery/` + list them in `config.js`; KOL post URL in `config.js`; real logo replacing text wordmark.
