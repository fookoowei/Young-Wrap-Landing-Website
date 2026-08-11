# Young Wrap Landing — Video Hero, Orange Theme, GR86, Maps & KOL Embeds (Upgrade Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the already-implemented site: cinematic background-video hero (3D car moves to its own configurator section), amber→orange rebrand, licensed GR86 model, Google Maps iframe embed, KOL Instagram post iframe.

**Architecture:** The site is live code (Vite vanilla + Three.js, modular: `src/config.js`, `src/i18n/`, `src/three/`, `src/gallery.js`, vitest in `tests/`). This plan only restructures the hero, swaps theme tokens/model, and adds two iframes. All owner data stays in `src/config.js`.

**Tech Stack:** existing — Vite, Three.js 0.170, vitest.

## Global Constraints

- Commit messages: plain conventional-commit style, **no AI/Claude attribution lines** (hard user requirement).
- New palette: logo orange `#FA9C20` (sampled from public/logo/yw.jpg; accent, replaces amber `#f5a623`), deep variant `#C87C19` (replaces `#c97f16`), black/white/carbon tokens unchanged. Orange = accents/CTAs only. Owner: match the logo color, per 2026-08-11 instruction.
- Existing conventions win: `data-shop` link wiring, `data-i18n` keys (update BOTH `en`+`zh` in `src/i18n/translations.js`), corner-cut clip-path aesthetic, dynamic-import of Three.js.
- `npm test` (vitest) and `npm run build` must pass at every commit.
- Hero video: use `public/videos/car-wrapping.mp4` (owner's newer clip, 32 MB — MUST be re-encoded to ≤ 8 MB before shipping); owner's nanobanana montage later overwrites the same file — see `docs/assets-brief.md`. Delete the older `wrapping.mp4` once swapped.
- Design references (owner-picked): wearebrain.com — headline text sitting directly on dark video, minimal chrome; payanamuseum.com — alternating text/image rhythm, curatorial voice, timeline-style info blocks; 363sudbury.com — emotional-first tagline, lean breathing copy; car-wash-wcopilot.webflow.io — service landing structure. Apply as: keep copy sparse, big type over video, alternate section rhythms, don't crowd sections.

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
    <source src="videos/car-wrapping.mp4" type="video/mp4" />
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
- [ ] **Step 4:** Re-encode the hero video (32 MB → target ≤ 8 MB): `ffmpeg -i public/videos/car-wrapping.mp4 -vf scale=1920:-2 -an -crf 30 -preset slow -movflags +faststart /tmp/hero.mp4 && mv /tmp/hero.mp4 public/videos/car-wrapping.mp4` (raise crf to 32 if still heavy; install ffmpeg via `brew install ffmpeg` if missing). Delete the superseded `public/videos/wrapping.mp4`.
- [ ] **Step 5: Verify** — `npm test` passes; dev server: video plays behind headline, CTAs work, configurator section fully functional (spin + swatches + finishes), mobile 375px layout sane, no console errors.
- [ ] **Step 6: Commit** — `git commit -am "feat: background video hero; move 3D viewer to configurator section"`

---

### Task 3: GR86 model (LICENSING BLOCKER — judgement required)

**Files:**
- Modify: `public/models/car.glb` (replace), `ASSETS.md`, possibly `src/three/carViewer.js` (body-material matching)
- Delete: `public/models/2021_pandem_gr86_v1_aero_kit/` (see below)

⚠️ The owner-downloaded `2021_pandem_gr86_v1_aero_kit` (Ddiaz Design, Sketchfab) is **CC-BY-NC-SA-4.0 — non-commercial only**. A business marketing site is commercial use, so this model MUST NOT ship. Do not wire it up.

- [ ] **Step 1:** Read `src/three/carViewer.js` — note model path and how body/paint meshes are identified.
- [ ] **Step 2:** Source a **commercial-OK** (CC0 or CC-BY) Toyota GR86 / GT86 / Subaru BRZ GLB (Sketchfab downloadable + license filters; also try Poly Haven/pmndrs market). Must have a distinct body/paint material.
- [ ] **Step 3:** If no commercial-OK GR86-family model exists: STOP and present the owner three options — (a) buy one with a standard royalty-free license (Sketchfab Store/CGTrader, typically USD 10–50), (b) message Ddiaz Design for written commercial permission, (c) keep the current generic coupe for launch. Wait for their pick.
- [ ] **Step 4:** Optimize the chosen model: `npx @gltf-transform/cli optimize in.glb public/models/car.glb --texture-compress webp` — target ≤ 4 MB. Adjust carViewer's material-matching to the new material names; verify swatches recolor body only (not glass/wheels/lights). Remove the NC model folder from the repo.
- [ ] **Step 5:** Record attribution (author, URL, license, credit line) in `ASSETS.md`; if CC-BY, add the credit line to the site footer.
- [ ] **Step 6:** `npm test && npm run build` pass; visual check.
- [ ] **Step 7: Commit** — `git commit -am "feat: swap 3D model to Toyota GR86"`

---

### Task 4: Real gallery photos → WebP

**Files:**
- Modify: `src/gallery.js`, `public/images/` (10 owner photos: `car1.jpg…car10.webp`, mixed formats)

- [ ] **Step 1:** Convert/normalize all 10 to WebP ≤ 1600 px wide (owner asked for all-WebP). One-off script with sharp:
  `npm i -D sharp` then `node -e "const s=require('sharp'),fs=require('fs');fs.readdirSync('public/images').filter(f=>/^car\d+\.(jpg|webp)$/.test(f)).forEach(async f=>{const n=f.replace(/\..+$/,'.webp');await s('public/images/'+f).resize({width:1600,withoutEnlargement:true}).webp({quality:78}).toFile('public/images/tmp-'+n);fs.renameSync('public/images/tmp-'+n,'public/images/'+n)})"` — then delete leftover `.jpg` originals. Target ≤ 250 KB each (`ls -lh` check; lower quality to 70 if needed).
- [ ] **Step 2:** Update `src/gallery.js` IMAGES to the ten real files with descriptive alts (look at each photo to write the alt, e.g. "Matte black full wrap on a sedan by Young Wrap"):

```js
const IMAGES = Array.from({ length: 10 }, (_, i) => ({
  src: `${import.meta.env.BASE_URL}images/car${i + 1}.webp`,
  alt: 'REPLACE with per-photo description during implementation',
}))
```

- [ ] **Step 3:** Gallery-1.svg was also the 3D `viewer-fallback-img` — point that `<img>` at `images/car1.webp` instead.
- [ ] **Step 4:** Verify grid + lightbox with real photos at desktop and 375 px; `npm run build` passes; committed images total ≤ ~2.5 MB.
- [ ] **Step 5: Commit** — `git commit -am "feat: real wrap photos in gallery as webp"`

---

### Task 5: "We wrap anything" mention

**Files:**
- Modify: `index.html`, `src/i18n/translations.js`, `src/styles/main.css` (if needed)

Owner: wraps aren't only cars — pickleball paddles, vans, planes, boats… always challenging themselves. Keep it VERY brief — one strip, no new heavy section.

- [ ] **Step 1:** After the services grid, add:

```html
<p class="services-anything">
  <span data-i18n="services.anything">Not just cars — we've wrapped pickleball paddles, vans, boats, even aircraft. If it has a surface, we'll wrap it.</span>
</p>
```

- [ ] **Step 2:** i18n both langs (zh: `不只是汽车 — 匹克球拍、货车、船艇、甚至飞机我们都包过。只要有表面，我们就能包。`). Style as a single accent-bordered line matching the corner-cut aesthetic, muted text with orange highlight on "anything"/「都能包」.
- [ ] **Step 3:** Verify + `npm test` (i18n parity) passes.
- [ ] **Step 4: Commit** — `git commit -am "feat: brief we-wrap-anything mention"`

---

### Task 6: Google Maps iframe embed

**Files:**
- Modify: `src/config.js`, `index.html` (`#contact`), `src/main.js`, `src/styles/main.css`

- [ ] **Step 1:** In `src/config.js` add to `SHOP`: `mapsEmbedSrc: 'https://www.google.com/maps?q=42,+Jalan+Anggerik+Vanilla+Ad+31%2FAd,+Kota+Kemuning,+40460+Shah+Alam,+Selangor&output=embed'` and simplify `mapsUrl` to `'https://www.google.com/maps/search/?api=1&query=Young+Wrap+Kota+Kemuning'` (current value is a fragile copy-pasted search URL).
- [ ] **Step 2:** In `#contact`, add a map column inside `.contact-grid`: `<iframe class="map-embed" src="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Young Wrap location on Google Maps"></iframe>`; in `wireShopLinks()` add `document.querySelector('.map-embed').src = SHOP.mapsEmbedSrc`.
- [ ] **Step 3:** CSS: `.map-embed { width:100%; min-height:340px; border:0; filter:grayscale(.15); }` + corner-cut class to match cards; grid adjusts to fit three columns → stack on mobile.
- [ ] **Step 4: Verify** — map tile shows the Kota Kemuning address, "Get Directions" still opens Google Maps app/site; `npm test` passes (no key/billing involved — plain embed URL).
- [ ] **Step 5: Commit** — `git commit -am "feat: embed Google Map in contact section"`

---

### Task 7: KOL Instagram post iframe

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

### Task 8: Full verification + push

- [ ] **Step 1:** `npm test` → all pass. `npm run build && npm run preview` → walk every section from the production bundle at desktop + 375 px widths.
- [ ] **Step 2:** Lighthouse (mobile): SEO ≥ 95, perf ≥ 80; fix flagged issues (likely video weight — see Task 2 Step 4).
- [ ] **Step 3:** Push. NOTE: local `main` tracks `origin/main` which is **gone** (remote branch deleted/recreated). Run `git push -u origin main`; if it's rejected, STOP and ask the owner whether the GitHub repo was recreated before forcing anything.
- [ ] **Step 4:** Confirm GitHub Pages workflow runs green and the live URL shows the video hero + GR86.

---

## Owner-supplied later (each a one-commit swap)

Nanobanana montage overwrites `public/videos/wrapping.mp4` (+ poster frame, add `poster=` attr); real gallery photos replace `public/images/gallery-*.svg`; confirmed KOL post URL in `src/config.js`; prompts live in `docs/assets-brief.md`.
