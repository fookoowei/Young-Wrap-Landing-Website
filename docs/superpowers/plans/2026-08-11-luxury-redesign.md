# Luxury Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the shipped Young Wrap site to luxury-automotive standard (custom cursor, GSAP motion, fullscreen menu, draggable portfolio, story section, form+map contact) and split the 3D configurator onto its own `studio.html` page with an expanded palette.

**Architecture:** Vanilla Vite multi-page (index + studio). New focused modules per concern (`menu.js`, `cursor.js`, `motion.js`, `carousel.js`, `quote-form.js`); existing modules (`config.js`, `i18n/*`, `three/*`, `gallery.js`→carousel) evolve in place. GSAP drives all motion behind `matchMedia` reduced-motion guards.

**Tech Stack:** Vite 6, GSAP 3 (ScrollTrigger, Draggable, InertiaPlugin — all free), Three.js 0.170 (studio page only), vitest.

## Global Constraints

- Commit messages: plain conventional-commit style, **no AI/Claude attribution lines** (hard user requirement).
- `npm test` and `npm run build` green before every commit.
- Tokens only: `--orange: #FA9C20` accent on carbon (`--carbon/--panel/--ink…`); orange never a large background. Fonts stay Chakra Petch (display) + Saira (body).
- Every user-facing string bilingual: `data-i18n` key in BOTH `en` and `zh` of `src/i18n/translations.js`; the parity test must scan BOTH html files after Task 2.
- Reduced-motion: every GSAP effect inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`; hero video paused + poster under reduce; cursor and preloader disabled.
- Owner data only in `src/config.js`. Landing must NOT load Three.js. Lighthouse targets (mobile): landing SEO ≥ 95, perf ≥ 85.
- Reference sites give patterns only — never copy their text, images, or logos.

## File Structure

```
index.html (reworked)         studio.html (new)
src/main.js (landing entry)   src/studio.js (studio entry, new)
src/menu.js src/cursor.js src/motion.js src/carousel.js src/quote-form.js (new)
src/three/wraps.js (palette expanded)  src/three/carViewer.js (unchanged)
src/i18n/translations.js (+keys)  src/styles/main.css (heavy rework, stays single file)
public/videos/hero-montage.mp4 + hero-poster.jpg (new)
scripts/build-hero-montage.md (recipe record)
tests/quote-form.test.js (new) tests/wraps.test.js tests/i18n.test.js (extended)
```

---

### Task 1: Hero montage video

**Files:**
- Create: `public/videos/hero-montage.mp4`, `public/videos/hero-poster.jpg`, `scripts/build-hero-montage.md`
- Modify: `index.html` (hero `<video>`), delete tracked `public/videos/car-wrapping.mp4` (move file to `assets-src/videos/`)

**Interfaces:**
- Produces: hero video at `videos/hero-montage.mp4`, poster at `videos/hero-poster.jpg` (Task 10's reduced-motion handling and SEO og:image reuse the poster path).

- [ ] **Step 1:** Inspect the six clips: `for f in assets-src/videos/wrapping{1..6}.mp4; do ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate -of csv "$f"; done`. Note durations/orientations.
- [ ] **Step 2:** Normalize + trim each clip to its best ~2.5 s (default: first 2.5 s; if a clip starts with junk frames — black/blur — pick a better `-ss` offset by eye from `ffmpeg -ss X -i clip -frames:v 1 probe.jpg` checks):

```bash
mkdir -p /tmp/montage
i=0; for f in assets-src/videos/wrapping{1..6}.mp4; do i=$((i+1))
  ffmpeg -y -ss 0 -t 2.5 -i "$f" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p "/tmp/montage/seg$i.mp4"
done
printf "file '/tmp/montage/seg%d.mp4'\n" 1 2 3 4 5 6 > /tmp/montage/list.txt
ffmpeg -y -f concat -safe 0 -i /tmp/montage/list.txt -c copy public/videos/hero-montage.mp4
ffmpeg -y -i public/videos/hero-montage.mp4 -frames:v 1 -q:v 3 public/videos/hero-poster.jpg
ls -lh public/videos/
```

Target ≤ 8 MB (raise crf to 32 per-segment and re-concat if over). Record the final recipe + chosen offsets in `scripts/build-hero-montage.md`.
- [ ] **Step 3:** Update the hero in `index.html`: `<source src="videos/hero-montage.mp4" …>` and add `poster="videos/hero-poster.jpg"` to the `<video>`. `git rm public/videos/car-wrapping.mp4` after `mv public/videos/car-wrapping.mp4 assets-src/videos/`.
- [ ] **Step 4:** `npm test` + `npm run build` green; `npm run preview` + curl: montage returns 200, page references it, no reference to car-wrapping.mp4 remains (grep src/ index.html dist/index.html).
- [ ] **Step 5:** Commit — `git add -A && git commit -m "feat: hero montage from six wrap clips"`

---

### Task 2: Multi-page split — studio.html

**Files:**
- Create: `studio.html`, `src/studio.js`
- Modify: `vite.config.js`, `index.html` (configurator section → teaser), `src/main.js` (remove viewer init), `src/i18n/translations.js`, `tests/i18n.test.js`, `src/styles/main.css`

**Interfaces:**
- Consumes: `createCarViewer(container)` from `src/three/carViewer.js`; `WRAP_COLORS`, `WRAP_FINISHES`, `wrapParams(colorId, finishId)` from `src/three/wraps.js`; `initLanguageToggle`, `getSavedLanguage` from `src/i18n/i18n.js`; `SHOP` from `src/config.js`.
- Produces: `studio.html` with ids `car-canvas`, `wrap-colors`, `wrap-finishes`, `custom-color` and Vite entry `src/studio.js` exporting nothing (self-initializing). Landing section `#studio-teaser`. Nav/menu links point to `studio.html` (later tasks reuse). i18n test scans `['index.html','studio.html']`.

- [ ] **Step 1:** `vite.config.js`:

```js
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
export default defineConfig({
  base: './',
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), studio: resolve(__dirname, 'studio.html') } } },
})
```

- [ ] **Step 2:** Create `studio.html`: copy `index.html`'s head (title: `3D Wrap Studio — Young Wrap`, meta description "Preview wrap colours and finishes on a 3D car — Young Wrap, Kota Kemuning."; drop JSON-LD and og duplicates except og:title/description; keep favicon/fonts; `<script type="module" src="/src/studio.js"></script>`). Body: same `.site-header` (logo links to `index.html`), `<main>` with a single full-height `.studio` section containing the ENTIRE configurator markup moved verbatim from index.html (`#car-canvas` + fallback img, `.wrap-picker` with `#wrap-colors`/`#wrap-finishes`), plus `<input type="color" id="custom-color" value="#FA9C20" aria-label="Custom wrap colour">` inside the picker, and a condensed footer (© line + model credit). Keep every `data-i18n` attribute as-is.
- [ ] **Step 3:** In `index.html`, replace the whole `#configurator` section with the teaser:

```html
<section id="studio-teaser" class="studio-teaser">
  <p class="eyebrow" data-i18n="teaser.eyebrow">3D Studio</p>
  <h2 data-i18n="teaser.title">Design your wrap in 3D</h2>
  <p class="section-sub" data-i18n="teaser.sub">Spin the car, pick a colour, choose your finish — then send it to us.</p>
  <a class="btn btn-whatsapp" href="studio.html" data-i18n="teaser.cta">Enter the studio</a>
</section>
```

Change the nav link `href="#configurator"` → `href="studio.html"`.
- [ ] **Step 4:** Create `src/studio.js`: import css, config, i18n, wraps, and `createCarViewer` (static import — this page IS the viewer); reuse the swatch/finish-button wiring currently in `src/main.js`'s `initViewer()` (move that block here), init immediately (no IntersectionObserver). Wire `#custom-color` `input` event → `viewer.applyWrap(wrapParams(null, finishId, e.target.value))` — see Task 3 for the extended `wrapParams` signature; until Task 3 lands, call `viewer.applyWrap({ ...wrapParams(colorId, finishId) })` and set the custom hex by passing `colorHex` — implement against Task 3's final signature `wrapParams(colorId, finishId, overrideHex?)` and add the third parameter to `wraps.js` in THIS task as a pass-through (`const hex = overrideHex ?? COLOR_BY_ID[colorId].hex`).
- [ ] **Step 5:** In `src/main.js`: delete `initViewer()` and its IntersectionObserver + the wraps/carViewer imports. Landing must not reference three.js (verify in build output: no carViewer chunk loaded by index.html).
- [ ] **Step 6:** i18n: add `teaser.*` keys (zh: `3D 工作室` / `在 3D 中设计你的车膜` / `旋转车辆、挑选颜色与质感——然后发给我们。` / `进入工作室`). Extend `tests/i18n.test.js` to scan both html files for `data-i18n` keys (read both files, union the keys).
- [ ] **Step 7:** `npm test` + `npm run build`; `npm run preview` + curl both `/` and `/studio.html` (200, correct sections); confirm dist/assets: three.js chunk referenced only from studio entry (`grep -l carViewer dist/assets/*.js` + check which html pulls it).
- [ ] **Step 8:** Commit — `feat: split 3D configurator to studio page`

---

### Task 3: Expanded palette + custom colour + shareable hash

**Files:**
- Modify: `src/three/wraps.js`, `src/studio.js`, `src/styles/main.css`, `tests/wraps.test.js`

**Interfaces:**
- Produces: `WRAP_COLORS`: 14 entries `{ id, hex, group: 'bright'|'neutral'|'metallic'|'special', name: {en, zh} }`; `wrapParams(colorId, finishId, overrideHex?)`; studio hash sync `#c=<hex-no-#>&f=<finishId>`.

- [ ] **Step 1:** Extend `tests/wraps.test.js` (write first, watch fail): every color has unique id, valid `#RRGGBB` hex, a `group` from the four allowed values, and both `en`/`zh` names; `wrapParams('yw-orange','gloss')` returns the orange hex; `wrapParams(null,'gloss','#123456')` returns `#123456`.
- [ ] **Step 2:** Rewrite `WRAP_COLORS` (keep `yw-orange` first):

```js
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
export const GROUP_LABELS = { bright: {en:'Gloss Brights',zh:'亮彩'}, neutral: {en:'Neutrals',zh:'中性色'}, metallic: {en:'Metallics',zh:'金属色'}, special: {en:'Specials',zh:'特殊色'} }
```

`wrapParams(colorId, finishId, overrideHex)` → `{ colorHex: overrideHex ?? byId(colorId).hex, ...WRAP_FINISHES[finishId] }` (keep existing finish param shape used by `carViewer.applyWrap`).
- [ ] **Step 3:** Studio render: group swatches under small `GROUP_LABELS` headings (respect saved language); custom `<input type="color">` styled as a swatch with a "+" look; selecting any swatch clears custom, using custom deselects swatches.
- [ ] **Step 4:** Hash sync in `studio.js`: on change → `history.replaceState(null,'', '#c='+hex.slice(1)+'&f='+finishId)`; on load parse `location.hash` (regex `#?c=([0-9a-fA-F]{6})&f=(\w+)`) and apply if valid (unknown finish → 'gloss').
- [ ] **Step 5:** `npm test` green (new assertions pass), build green; manual: deep link `studio.html#c=3B2A63&f=matte` loads purple matte.
- [ ] **Step 6:** Commit — `feat: expanded grouped wrap palette with custom colour and share links`

---

### Task 4: GSAP motion system

**Files:**
- Create: `src/motion.js`
- Modify: `package.json` (add gsap), `src/main.js`, `src/studio.js`, `index.html` (add `data-reveal` attrs), `src/styles/main.css`

**Interfaces:**
- Produces: `initMotion()` — registers ScrollTrigger; animates `[data-reveal]` (fade + 40px rise, 0.08s stagger within a `[data-reveal-group]`), `[data-count]` (count from 0 to `data-count` value on enter), `[data-parallax]` (y ±8% scrub). All inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`; under reduce: elements shown static, hero video `.pause()` + poster left visible. Later tasks (5–10) may use `gsap` directly.

- [ ] **Step 1:** `npm i gsap`
- [ ] **Step 2:** `src/motion.js`:

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export function initMotion() {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    for (const el of document.querySelectorAll('[data-reveal]')) {
      gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' } })
    }
    for (const group of document.querySelectorAll('[data-reveal-group]')) {
      gsap.from(group.children, { opacity: 0, y: 32, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 85%' } })
    }
    for (const el of document.querySelectorAll('[data-count]')) {
      const target = Number(el.dataset.count)
      const obj = { v: 0 }
      gsap.to(obj, { v: target, duration: 1.4, ease: 'power1.out',
        snap: { v: 1 }, onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        scrollTrigger: { trigger: el, start: 'top 90%' } })
    }
    for (const el of document.querySelectorAll('[data-parallax]')) {
      gsap.to(el, { yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: el, scrub: true } })
    }
  })
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelector('.hero-video')?.pause()
  })
}
```

- [ ] **Step 3:** Call `initMotion()` from `src/main.js` and `src/studio.js`. Add `data-reveal` to each landing section's heading block and `data-reveal-group` to `.service-grid` and stat rows (stat row markup arrives in Task 7 — attribute convention documented here).
- [ ] **Step 4:** `npm test` + `npm run build`; manual: sections rise in on scroll; with macOS "Reduce Motion" on (or DevTools emulation), no animation and video paused.
- [ ] **Step 5:** Commit — `feat: gsap motion system with reduced-motion guards`

---

### Task 5: Header + fullscreen menu

**Files:**
- Create: `src/menu.js`
- Modify: `index.html`, `studio.html`, `src/main.js`, `src/studio.js`, `src/i18n/translations.js`, `src/styles/main.css`

**Interfaces:**
- Consumes: `gsap` (Task 4), `SHOP` (config).
- Produces: `initMenu()`; header markup contract used by both pages:

```html
<header class="site-header">
  <a class="brand" href="index.html">YOUNG<span class="brand-dot">·</span>WRAP</a>
  <div class="header-right">
    <a class="btn btn-whatsapp btn-header" data-shop="whatsapp" href="#" target="_blank" rel="noopener" data-i18n="header.cta">WhatsApp</a>
    <button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-overlay" aria-label="Menu"><span></span><span></span></button>
  </div>
</header>
<div id="menu-overlay" class="menu-overlay" hidden>
  <nav class="menu-links" data-menu-stagger>
    <a href="index.html#top" data-i18n="menu.home">Home</a>
    <a href="studio.html" data-i18n="menu.studio">3D Studio</a>
    <a href="index.html#services" data-i18n="nav.services">Services</a>
    <a href="index.html#gallery" data-i18n="nav.gallery">Portfolio</a>
    <a href="index.html#contact" data-i18n="nav.contact">Contact</a>
  </nav>
  <div class="menu-meta">
    <button id="lang-toggle" class="lang-toggle" type="button" aria-label="Switch language">中文</button>
    <div class="menu-socials"><!-- populated by Task 9's icon set; until then text links --><a data-shop="instagram" href="#" target="_blank" rel="noopener">Instagram</a><a data-shop="facebook" href="#" target="_blank" rel="noopener">Facebook</a></div>
    <a class="menu-phone" data-shop="tel" href="#"></a>
  </div>
</div>
```

- [ ] **Step 1:** Replace old inline `.site-nav` in BOTH html files with the header+overlay markup above (`#lang-toggle` moves inside the overlay; `menu-phone` textContent set from `SHOP.phoneDisplay` in `wireShopLinks` — add that one line to `src/main.js`/`src/studio.js` shared wiring).
- [ ] **Step 2:** `src/menu.js`:

```js
import gsap from 'gsap'

export function initMenu() {
  const btn = document.getElementById('menu-toggle')
  const overlay = document.getElementById('menu-overlay')
  const links = overlay.querySelectorAll('a, button')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let open = false

  function setOpen(next) {
    open = next
    btn.setAttribute('aria-expanded', String(open))
    btn.classList.toggle('is-open', open)
    document.body.classList.toggle('menu-open', open)
    if (open) {
      overlay.hidden = false
      if (!reduce) {
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        gsap.fromTo(overlay.querySelector('[data-menu-stagger]').children,
          { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.1 })
      }
      links[0]?.focus()
    } else {
      const done = () => (overlay.hidden = true)
      reduce ? done() : gsap.to(overlay, { opacity: 0, duration: 0.25, onComplete: done })
      btn.focus()
    }
  }

  btn.addEventListener('click', () => setOpen(!open))
  overlay.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false) })
  document.addEventListener('keydown', (e) => {
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Tab') { // focus trap
      const f = [...links].filter(el => !el.hidden)
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault() }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
    }
  })
}
```

- [ ] **Step 3:** CSS: `.menu-overlay` fixed inset-0 `background: var(--carbon)`, z-index above header; `.menu-links a` huge display font (clamp(2.4rem, 8vw, 5.5rem), uppercase, `-webkit-text-stroke` 0 default, hover → color var(--orange) + slight x-shift); `.menu-toggle` two bars morph to X via `.is-open`; `body.menu-open { overflow: hidden }`. Remove the old `@media (max-width: 939px) { .site-nav { display: none } }` rule (menu works everywhere now).
- [ ] **Step 4:** i18n keys `header.cta` (WhatsApp / WhatsApp 咨询), `menu.home` (Home / 首页), `menu.studio` (3D Studio / 3D 工作室). `npm test` green.
- [ ] **Step 5:** Manual: open/close both pages, Esc closes, tab cycles inside, links navigate + close, mobile 375px fine. Build green.
- [ ] **Step 6:** Commit — `feat: fullscreen menu with staggered links and focus trap`

---

### Task 6: Custom cursor

**Files:**
- Create: `src/cursor.js`
- Modify: `src/main.js`, `src/studio.js`, `index.html` + `studio.html` (data-cursor attrs), `src/styles/main.css`

**Interfaces:**
- Consumes: `gsap`.
- Produces: `initCursor()`; attribute contract: elements with `data-cursor="drag"` show DRAG pill (Task 8 sets it on the carousel), `data-cursor="spin"` shows SPIN pill (studio canvas container). Anchor/button/input hover → ring grows.

- [ ] **Step 1:** `src/cursor.js`:

```js
import gsap from 'gsap'

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const dot = document.createElement('div'); dot.className = 'cursor-dot'
  const ring = document.createElement('div'); ring.className = 'cursor-ring'
  const label = document.createElement('span'); label.className = 'cursor-label'
  ring.append(label); document.body.append(dot, ring)

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 })
  const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })
  addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) })

  const LABELS = { drag: 'DRAG', spin: 'SPIN' }
  addEventListener('pointerover', (e) => {
    const pill = e.target.closest('[data-cursor]')
    const interactive = e.target.closest('a, button, input, select, textarea, .swatch, .finish-btn')
    if (pill) { label.textContent = LABELS[pill.dataset.cursor] ?? ''; ring.classList.add('is-pill') }
    else ring.classList.remove('is-pill')
    ring.classList.toggle('is-hover', Boolean(interactive) && !pill)
  })
  addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-cursor]')) { ring.classList.remove('is-pill'); label.textContent = '' }
  })
}
```

- [ ] **Step 2:** CSS: `.cursor-dot` 6px orange circle, `.cursor-ring` 34px border ring, both `position: fixed; top:0; left:0; translate: -50% -50%; pointer-events: none; z-index: 9999; mix-blend-mode: normal`. `.is-hover` scales ring 1.6×; `.is-pill` → ring becomes 64px filled orange pill, label (black, Chakra Petch 10px, letter-spaced) visible. Do NOT set `cursor: none` globally — only `body:has(.cursor-ring) a, … { cursor: none }` on non-form interactive elements; form fields keep native cursors.
- [ ] **Step 3:** Add `data-cursor="spin"` to `#car-canvas`'s parent `.studio` stage container in studio.html. (Carousel gets `data-cursor="drag"` in Task 8.)
- [ ] **Step 4:** `initCursor()` in both entries. Tests/build green; manual hover checks.
- [ ] **Step 5:** Commit — `feat: custom cursor with hover and pill states`

---

### Task 7: About/story section + services rows

**Files:**
- Modify: `index.html`, `src/i18n/translations.js`, `src/styles/main.css`

**Interfaces:**
- Consumes: `data-reveal`/`data-count` conventions (Task 4).
- Produces: `#about` section between marquee and services; services markup switched from cards to `.service-row` list (hover/focus expansion pure CSS).

- [ ] **Step 1:** Insert after the marquee:

```html
<section id="about" class="about">
  <p class="eyebrow" data-i18n="about.eyebrow">The House of Young Wrap</p>
  <div class="about-grid">
    <div class="about-copy" data-reveal>
      <h2 data-i18n="about.title">Your neighbourhood wrap installer</h2>
      <p data-i18n="about.body">From Kota Kemuning, we transform daily drives into statements — precision vinyl, paint protection and coatings, applied with obsession. Every panel, every edge, every time.</p>
    </div>
    <div class="about-stats" data-reveal-group>
      <div class="stat"><span class="stat-num" data-count="5">0</span><span class="stat-label" data-i18n="about.stat1">Core services</span></div>
      <div class="stat"><span class="stat-num" data-count="10">0</span><span class="stat-label" data-i18n="about.stat2">Featured transformations</span></div>
      <div class="stat"><span class="stat-num" data-count="1">0</span><span class="stat-label" data-i18n="about.stat3">Home — Kota Kemuning</span></div>
    </div>
  </div>
  <figure class="about-figure"><img src="images/car2.webp" alt="Wrapped car by Young Wrap" loading="lazy" data-parallax /></figure>
</section>
```

zh: 眼brow `Young Wrap 之家`, title `你的社区贴膜专家`, body `从哥打哥文宁出发，我们把日常座驾变成态度宣言——精准的车身贴膜、漆面保护与镀晶，每一块面板、每一道边缘，始终如一。`, stats `核心服务 / 精选案例 / 根据地——哥打哥文宁`.
- [ ] **Step 2:** Replace `.service-grid` cards with rows (same i18n keys, plus existing `services.anything` becomes row 06):

```html
<div class="service-rows" data-reveal-group>
  <div class="service-row"><span class="row-no">01</span><h3 data-i18n="services.wrap.title">Full & Partial Wraps</h3><p data-i18n="services.wrap.desc">…existing…</p></div>
  … 02 PPF · 03 Tint · 04 Coating · 05 Detailing …
  <div class="service-row service-row--any"><span class="row-no">06</span><h3 data-i18n="services.anything.title">Anything</h3><p data-i18n="services.anything">…existing anything text…</p></div>
</div>
```

Add `services.anything.title` key (en `Anything`, zh `万物皆可包`). CSS: rows full-width, top border `--line`, number in `--ink-dim`; `:hover`/`:focus-within` → background `--panel`, number `--orange`, `p` max-height transitions from 0 (collapsed, desktop) to open; on mobile `p` always visible. Delete old `.service-grid` card styles and the standalone `.services-anything` strip (its key moves into row 06).
- [ ] **Step 3:** Tests (i18n parity picks up new keys — add all to both langs) + build green; visual check.
- [ ] **Step 4:** Commit — `feat: about story section and numbered service rows`

---

### Task 8: Draggable portfolio carousel

**Files:**
- Create: `src/carousel.js`
- Modify: `index.html` (gallery section), `src/main.js` (replace `initGallery` call), delete `src/gallery.js`, `src/styles/main.css`, `src/i18n/translations.js`

**Interfaces:**
- Consumes: `gsap`, `Draggable`, `InertiaPlugin`; existing `#lightbox` dialog markup (kept).
- Produces: `initCarousel()`; markup contract:

```html
<section id="gallery" class="portfolio">
  <p class="eyebrow" data-i18n="gallery.title">Recent Work</p>
  <p class="section-sub" data-i18n="gallery.sub">…existing…</p>
  <div class="portfolio-viewport" data-cursor="drag">
    <div id="portfolio-track" class="portfolio-track"><!-- 10 cards injected by JS --></div>
  </div>
</section>
```

- [ ] **Step 1:** `src/carousel.js` — move the IMAGES array (10 entries with the descriptive alts) from `gallery.js`, then:

```js
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
gsap.registerPlugin(Draggable, InertiaPlugin)

export function initCarousel() {
  const track = document.getElementById('portfolio-track')
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = lightbox.querySelector('.lightbox-img')
  for (const { src, alt } of IMAGES) {
    const card = document.createElement('figure')
    card.className = 'portfolio-card'
    card.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy" draggable="false" /><figcaption>${alt}</figcaption>`
    card.querySelector('img').addEventListener('click', () => {
      if (dragging) return
      lightboxImg.src = src; lightboxImg.alt = alt; lightbox.showModal()
    })
    track.append(card)
  }
  let dragging = false
  const bound = () => Math.min(0, track.parentElement.clientWidth - track.scrollWidth)
  Draggable.create(track, {
    type: 'x', inertia: true, edgeResistance: 0.82,
    bounds: () => ({ minX: bound(), maxX: 0 }),
    onDragStart: () => (dragging = true),
    onThrowComplete: () => (dragging = false),
    onDragEnd: function () { if (!this.tween) dragging = false },
  })
  addEventListener('resize', () => Draggable.get(track)?.applyBounds({ minX: bound(), maxX: 0 }))
}
```

- [ ] **Step 2:** CSS: viewport `overflow: hidden`; track `display: flex; gap: 1rem; width: max-content; touch-action: pan-y`; cards `width: min(70vw, 520px); aspect-ratio: 4/3` images cover, caption small `--ink-dim`. Keep existing lightbox styles.
- [ ] **Step 3:** Replace gallery grid markup with the contract above; in `main.js` swap `initGallery()` → `initCarousel()`; `git rm src/gallery.js`.
- [ ] **Step 4:** Tests/build green; manual: drag with momentum + edge resistance, click still opens lightbox (not after a drag), touch devices scroll track, DRAG pill cursor appears.
- [ ] **Step 5:** Commit — `feat: draggable portfolio carousel with inertia`

---

### Task 9: Contact form + map, footer + social icons

**Files:**
- Create: `src/quote-form.js`, `tests/quote-form.test.js`
- Modify: `index.html`, `src/main.js`, `src/i18n/translations.js`, `src/styles/main.css`, `studio.html` (footer socials only)

**Interfaces:**
- Consumes: `SHOP.whatsappUrl` base number (config), i18n.
- Produces: `buildWhatsAppUrl(shopWaBase, { name, car, service, message })` → `https://wa.me/<num>?text=<encoded>`; `initQuoteForm()`.

- [ ] **Step 1:** Failing test `tests/quote-form.test.js`:

```js
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
    expect(text).not.toContain('Car:')
  })
})
```

- [ ] **Step 2:** `src/quote-form.js`:

```js
export function buildWhatsAppUrl(waBase, { name, car, service, message }) {
  const lines = [`Hi Young Wrap! I'd like a quote.`,
    name && `Name: ${name}`, car && `Car: ${car}`, service && `Service: ${service}`, message && `Message: ${message}`,
  ].filter(Boolean)
  return `${waBase.split('?')[0]}?text=${encodeURIComponent(lines.join('\n'))}`
}

export function initQuoteForm(shop) {
  const form = document.getElementById('quote-form')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    if (!form.reportValidity()) return
    window.open(buildWhatsAppUrl(shop.whatsappUrl, data), '_blank', 'noopener')
  })
}
```

- [ ] **Step 3:** Contact section becomes two columns — left form, right map+info:

```html
<section id="contact" class="contact">
  <p class="eyebrow" data-i18n="contact.title">Find Us</p>
  <div class="contact-grid contact-grid--form">
    <form id="quote-form" class="quote-form" data-reveal>
      <label><span data-i18n="form.name">Name</span><input name="name" required autocomplete="name" /></label>
      <label><span data-i18n="form.car">Car model</span><input name="car" placeholder="e.g. GR86" /></label>
      <label><span data-i18n="form.service">Service</span>
        <select name="service">
          <option data-i18n="services.wrap.title">Full & Partial Wraps</option>
          <option data-i18n="services.ppf.title">Paint Protection Film</option>
          <option data-i18n="services.tint.title">Window Tint</option>
          <option data-i18n="services.coating.title">Ceramic Coating</option>
          <option data-i18n="services.detailing.title">Detailing</option>
        </select></label>
      <label><span data-i18n="form.message">Message</span><textarea name="message" rows="4"></textarea></label>
      <button class="btn btn-whatsapp" type="submit" data-i18n="form.send">Send via WhatsApp</button>
    </form>
    <div class="contact-side" data-reveal>
      <iframe class="map-embed" src="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Young Wrap location on Google Maps"></iframe>
      <p class="shop-address"></p>
      <p class="shop-hours" data-i18n="contact.hoursValue">…existing…</p>
      <a class="btn btn-outline" data-shop="maps" href="#" target="_blank" rel="noopener" data-i18n="contact.directions">Get Directions</a>
    </div>
  </div>
</section>
```

(`.socials` block moves to footer.) i18n keys `form.*` (zh: 姓名 / 车型 / 服务项目 / 留言 / 通过 WhatsApp 发送). `initQuoteForm(SHOP)` in `main.js`.
- [ ] **Step 4:** Footer on both pages: big wordmark, inline SVG icon links (Instagram camera glyph, Facebook f, WhatsApp bubble — draw simple 24×24 paths, `aria-label` each, `data-shop` wiring), tagline, model credit, ©. Same icon row inside the menu overlay (replace Task 5's temporary text links).
- [ ] **Step 5:** `npm test` (new tests pass) + build; manual: submit opens wa.me with prefilled text (desktop opens web.whatsapp), required name enforced, map+form side-by-side ≥940px, stacked below.
- [ ] **Step 6:** Commit — `feat: whatsapp quote form beside map; footer social icons`

---

### Task 10: Preloader, hero polish, full verification

**Files:**
- Modify: `index.html`, `studio.html`, `src/main.js`, `src/styles/main.css`, `src/motion.js` (hero timeline)

**Interfaces:**
- Consumes: everything prior.

- [ ] **Step 1:** Preloader (landing only): `<div id="preloader" aria-hidden="true"><span class="preloader-mark">YW</span></div>` first in body. In `main.js`: if `sessionStorage.getItem('yw-seen')` or reduced-motion → remove immediately; else gsap timeline (mark fades/tracks in 0.6s, curtain `yPercent: -100` 0.6s, then remove node, set `yw-seen`). Total ≤ 1.3s.
- [ ] **Step 2:** Hero headline line-mask reveal: wrap the two headline spans in `overflow: hidden` line wrappers; gsap from `yPercent: 110` stagger 0.12 after preloader completes (or on load when skipped). Scroll-down indicator (thin line + `data-i18n="hero.scroll"` "Scroll" / 「滑动」) bottom-left, subtle looping tween.
- [ ] **Step 3:** Full verification (mirror of previous round): `npm test`, `npm run build`, preview curls (both pages 200; montage, poster, studio chunk isolation — landing HTML must reference no three.js chunk), Lighthouse mobile both pages (landing: SEO ≥ 95, perf ≥ 85; studio: note scores), 375px walk, reduced-motion walk, `du -sh dist/` sane (≤ 15 MB with montage).
- [ ] **Step 4:** Fix anything found (small fixes inline in this task; report bigger breaks).
- [ ] **Step 5:** Commit — `feat: preloader and hero reveal polish`

---

## Later (not in this plan)

Real GR86 model swap when owner supplies a licensed file; nanobanana montage v2 if owner regenerates clips; TikTok icon if the shop opens an account.
