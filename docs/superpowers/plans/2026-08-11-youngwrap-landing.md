# Young Wrap Landing — Video Hero, Orange Theme, GR86, Maps & KOL Embeds (Upgrade Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the already-implemented site: cinematic background-video hero (3D car moves to its own configurator section), amber→orange rebrand, licensed GR86 model, Google Maps iframe embed, KOL Instagram post iframe.

**Architecture:** The site is live code (Vite vanilla + Three.js, modular: `src/config.js`, `src/i18n/`, `src/three/`, `src/gallery.js`, vitest in `tests/`). This plan only restructures the hero, swaps theme tokens/model, and adds two iframes. All owner data stays in `src/config.js`.

**Tech Stack:** existing — Vite, Three.js 0.170, vitest.

## Global Constraints

- Commit messages: plain conventional-commit style, **no AI/Claude attribution lines** (hard user requirement).
- New palette: orange `#FF6B00` (accent, replaces amber `#f5a623`), deep orange `#D45800` (replaces `#c97f16`), black/white/carbon tokens unchanged. Orange = accents/CTAs only.
- Existing conventions win: `data-shop` link wiring, `data-i18n` keys (update BOTH `en`+`zh` in `src/i18n/translations.js`), corner-cut clip-path aesthetic, dynamic-import of Three.js.
- `npm test` (vitest) and `npm run build` must pass at every commit.
- Hero video file path: `public/videos/wrapping.mp4` (current placeholder clip; owner's nanobanana montage later overwrites the same file — see `docs/assets-brief.md`).

---

### Task 1: Amber → orange rebrand

**Files:**
- Modify: `src/styles/main.css` (tokens + every `var(--amber*)` usage stays valid via rename), `index.html` (favicon fill, theme-color stays), `src/three/wraps.js` (`yw-amber` swatch), `tests/wraps.test.js` (if it asserts the hex/name)

- [ ] **Step 1:** In `src/styles/main.css` rename tokens and set new values — `sed -i '' 's/--amber-deep/--orange-deep/g; s/--amber/--orange/g' src/styles/main.css index.html src/**/*.js` then set `--orange: #FF6B00; --orange-deep: #D45800;` in `:root`.
- [ ] **Step 2:** `grep -rn 'f5a623\|c97f16\|amber' src index.html tests` — replace remaining literals: favicon SVG fill `%23f5a623` → `%23FF6B00`; in `src/three/wraps.js` change `{ id: 'yw-amber', hex: '#f5a623', name: { en: 'YW Amber', zh: '琥珀橙' } }` → `{ id: 'yw-orange', hex: '#FF6B00', name: { en: 'YW Orange', zh: '炽橙' } }`.
- [ ] **Step 3:** Run `npm test` — update any assertion in `tests/wraps.test.js` referencing the old id/hex, re-run until PASS.
- [ ] **Step 4:** Visual check (`npm run dev`): all former amber accents render orange; no leftover amber anywhere (spot-check buttons, eyebrows, focus outline, marquee).
- [ ] **Step 5: Commit** — `git commit -am "feat: rebrand accent from amber to orange"`

---

### Task 2: Background-video hero + configurator section

**Files:**
- Modify: `index.html`, `src/styles/main.css`, `src/i18n/translations.js`, `src/main.js` (only if selector assumptions break)

Restructure: `.hero` becomes a full-viewport video hero (reference: dark full-bleed footage, big headline left, CTAs). The 3D viewer + wrap picker move into a new `<section id="configurator">` directly below the marquee. **Keep all existing ids/classes used by `src/main.js`** (`car-canvas`, `wrap-colors`, `wrap-finishes`, `data-shop`, `data-i18n`) so no JS rewiring is needed.

- [ ] **Step 1: Replace the `.hero` section in `index.html`:**

```html
<section class="hero">
  <video class="hero-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true">
    <source src="videos/wrapping.mp4" type="video/mp4" />
  </video>
  <div class="hero-scrim" aria-hidden="true"></div>
  <div class="hero-overlay">
    <div class="hero-copy">
      <p class="hero-eyebrow">Wrap · PPF · Tint · Coating</p>
      <h1 class="hero-headline">
        <span data-i18n="hero.headline1">Wrap it.</span>
        <span class="accent" data-i18n="hero.headline2">Drive it.</span>
      </h1>
      <p class="hero-sub" data-i18n="hero.sub">Premium car wraps, PPF, window tint & ceramic coating in Kota Kemuning, Shah Alam.</p>
      <div class="cta-row">
        <a class="btn btn-whatsapp" data-shop="whatsapp" href="#" target="_blank" rel="noopener" data-i18n="hero.cta.whatsapp">WhatsApp Us</a>
        <a class="btn btn-call" data-shop="tel" href="#" data-i18n="hero.cta.call">Call Now</a>
      </div>
    </div>
  </div>
</section>
```

(The `viewer-fallback-img` moves with the canvas to the configurator section.)

- [ ] **Step 2: Insert new section after the marquee:**

```html
<section id="configurator" class="configurator">
  <p class="eyebrow" data-i18n="configurator.title">Design Your Wrap</p>
  <p class="section-sub" data-i18n="hero.hint">Drag to spin the car — tap a color to preview a wrap</p>
  <div id="car-canvas" aria-label="Interactive 3D car preview">
    <img class="viewer-fallback-img" src="images/gallery-1.svg" alt="Wrapped car preview" hidden />
  </div>
  <div class="wrap-picker">
    <p class="picker-title" data-i18n="picker.title">Pick your wrap</p>
    <div id="wrap-colors" class="swatches" role="listbox" aria-label="Wrap colors"></div>
    <p class="picker-title" data-i18n="picker.finish">Finish</p>
    <div id="wrap-finishes" class="finishes" role="listbox" aria-label="Wrap finishes"></div>
  </div>
</section>
```

Add nav link `<a href="#configurator" data-i18n="nav.configurator">3D Studio</a>` before Services; add `nav.configurator` + `configurator.title` to BOTH langs in `src/i18n/translations.js` (zh: `3D 工作室` / `设计你的车膜`).

- [ ] **Step 3: CSS** — add `.hero-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }`; keep/strengthen `.hero-scrim` gradient (left side ≥ .85 black for text); `.configurator { }` styles: canvas container `height: min(70vh, 640px)` with the existing radial stage background moved from the old hero rules; wrap-picker centered below canvas. Delete/adapt now-unused hero-bottom rules. Follow the existing corner-cut / eyebrow patterns.
- [ ] **Step 4:** Check video size: `ls -lh public/videos/wrapping.mp4` — if > 10 MB re-encode (`ffmpeg -i in.mp4 -vf scale=1920:-2 -an -crf 28 out.mp4`); if ffmpeg missing, note size in ASSETS.md for the owner.
- [ ] **Step 5: Verify** — `npm test` passes; dev server: video plays behind headline, CTAs work, configurator section fully functional (spin + swatches + finishes), mobile 375px layout sane, no console errors.
- [ ] **Step 6: Commit** — `git commit -am "feat: background video hero; move 3D viewer to configurator section"`

---

### Task 3: GR86 model (manual sourcing, judgement required)

**Files:**
- Modify: `public/models/car.glb` (replace), `ASSETS.md`, possibly `src/three/carViewer.js` (body-material matching)

- [ ] **Step 1:** Read `src/three/carViewer.js` first — note the model path and how body/paint meshes are identified.
- [ ] **Step 2:** Source a downloadable CC0/CC-BY **Toyota GR86 / GT86 / Subaru BRZ** GLB (Sketchfab license filters). Must have a distinct body/paint material. If none acceptable, keep a comparable coupe and record the substitution for the owner.
- [ ] **Step 3:** Optimize: `npx @gltf-transform/cli optimize in.glb public/models/car.glb --texture-compress webp` — target ≤ 4 MB. Adjust carViewer's material-matching to the new model's material names; re-verify all swatches recolor body only (not glass/wheels/lights).
- [ ] **Step 4:** Record attribution (author, URL, license, credit line) in `ASSETS.md`; if CC-BY, add credit to the site footer.
- [ ] **Step 5:** `npm test && npm run build` pass; visual check.
- [ ] **Step 6: Commit** — `git commit -am "feat: swap 3D model to Toyota GR86"`

---

### Task 4: Google Maps iframe embed

**Files:**
- Modify: `src/config.js`, `index.html` (`#contact`), `src/main.js`, `src/styles/main.css`

- [ ] **Step 1:** In `src/config.js` add to `SHOP`: `mapsEmbedSrc: 'https://www.google.com/maps?q=42,+Jalan+Anggerik+Vanilla+Ad+31%2FAd,+Kota+Kemuning,+40460+Shah+Alam,+Selangor&output=embed'` and simplify `mapsUrl` to `'https://www.google.com/maps/search/?api=1&query=Young+Wrap+Kota+Kemuning'` (current value is a fragile copy-pasted search URL).
- [ ] **Step 2:** In `#contact`, add a map column inside `.contact-grid`: `<iframe class="map-embed" src="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Young Wrap location on Google Maps"></iframe>`; in `wireShopLinks()` add `document.querySelector('.map-embed').src = SHOP.mapsEmbedSrc`.
- [ ] **Step 3:** CSS: `.map-embed { width:100%; min-height:340px; border:0; filter:grayscale(.15); }` + corner-cut class to match cards; grid adjusts to fit three columns → stack on mobile.
- [ ] **Step 4: Verify** — map tile shows the Kota Kemuning address, "Get Directions" still opens Google Maps app/site; `npm test` passes (no key/billing involved — plain embed URL).
- [ ] **Step 5: Commit** — `git commit -am "feat: embed Google Map in contact section"`

---

### Task 5: KOL Instagram post iframe

**Files:**
- Modify: `index.html` (`.kol`), `src/main.js`, `src/styles/main.css`

- [ ] **Step 1:** In `.kol` section add `<div id="kol-embed" class="kol-embed"></div>` between the description and the "View the post" button.
- [ ] **Step 2:** In `src/main.js` (after `wireShopLinks()`):

```js
const kolBox = document.getElementById('kol-embed')
if (SHOP.kol.postUrl) {
  const iframe = document.createElement('iframe')
  iframe.src = SHOP.kol.postUrl.replace(/\/?$/, '/') + 'embed/'
  iframe.loading = 'lazy'
  iframe.title = `Instagram post by ${SHOP.kol.handle}`
  iframe.setAttribute('scrolling', 'no')
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('allowtransparency', 'true')
  kolBox.append(iframe)
}
```

- [ ] **Step 3:** CSS: `.kol-embed { display:flex; justify-content:center; margin:1.5rem 0; } .kol-embed iframe { width:min(400px, 90vw); height:520px; border:0; background:var(--panel); }` corner-cut to match.
- [ ] **Step 4: Verify** — post renders in the iframe (note: `src/config.js` `kol.postUrl` is still marked PLACEHOLDER — confirm the real collab post URL with the owner; wrong URL shows Instagram's "post unavailable" inside the frame, which is acceptable until confirmed). Buttons still link out.
- [ ] **Step 5: Commit** — `git commit -am "feat: embed KOL Instagram post"`

---

### Task 6: Full verification + push

- [ ] **Step 1:** `npm test` → all pass. `npm run build && npm run preview` → walk every section from the production bundle at desktop + 375 px widths.
- [ ] **Step 2:** Lighthouse (mobile): SEO ≥ 95, perf ≥ 80; fix flagged issues (likely video weight — see Task 2 Step 4).
- [ ] **Step 3:** Push. NOTE: local `main` tracks `origin/main` which is **gone** (remote branch deleted/recreated). Run `git push -u origin main`; if it's rejected, STOP and ask the owner whether the GitHub repo was recreated before forcing anything.
- [ ] **Step 4:** Confirm GitHub Pages workflow runs green and the live URL shows the video hero + GR86.

---

## Owner-supplied later (each a one-commit swap)

Nanobanana montage overwrites `public/videos/wrapping.mp4` (+ poster frame, add `poster=` attr); real gallery photos replace `public/images/gallery-*.svg`; confirmed KOL post URL in `src/config.js`; prompts live in `docs/assets-brief.md`.
