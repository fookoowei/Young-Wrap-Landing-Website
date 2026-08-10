# Young Wrap 3D Landing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single-page bilingual (EN/中文) landing site for Young Wrap with an interactive Three.js car whose wrap color/finish changes live, deployable as static files to GitHub Pages.

**Architecture:** Vanilla HTML/CSS/JS bundled by Vite (vanilla template, no framework). All page copy lives in real HTML (English default) with `data-i18n` attributes for the Chinese toggle. Three.js renders the hero car in an isolated module with a procedural fallback car so the page works before the real GLB model/assets arrive. All shop-specific data (phone, address, links) is centralized in `src/config.js` for one-place swapping.

**Tech Stack:** Vite 7 (vanilla), Three.js (only runtime dependency), Vitest (unit tests), GitHub Actions → GitHub Pages.

## Global Constraints

- No JS framework — vanilla only; `three` is the only runtime dependency.
- Git commits: plain messages, **no Claude/AI attribution lines of any kind** (owner's standing rule).
- 3D model: GLB, CC0 or CC-BY license (recorded in `ASSETS.md`), file ≤ 2 MB.
- English is the default language present in the HTML; Chinese applied via JS dictionary; language pref saved to `localStorage` key `yw-lang`.
- All placeholder business data (phone `+60 12-345 6789`, address, KOL post URL) lives only in `src/config.js` and `index.html` head tags — marked with `PLACEHOLDER` comments.
- Build output must work from a subpath (GitHub Pages project site) → `base: './'` in Vite config, asset URLs via `import.meta.env.BASE_URL`.
- Repo root: `~/Documents/GitHub/Young-Wrap-Landing-Website`. All paths below are relative to it.

## File Structure

```
index.html                      — full page content, SEO head, JSON-LD
vite.config.js                  — base './', vitest config
package.json
public/models/car.glb           — licensed car model (Task 6)
public/images/gallery-*.svg     — placeholder gallery images (Task 7)
public/robots.txt, public/sitemap.xml
src/main.js                     — entry point, wires all modules
src/config.js                   — SHOP data (single place for real info swap)
src/styles/main.css             — all styling (CSS vars for brand colors)
src/i18n/translations.js        — flat EN/ZH dictionary
src/i18n/i18n.js                — t(), applyLanguage(), initLanguageToggle()
src/three/wraps.js              — wrap colors/finishes data + wrapParams()
src/three/carViewer.js          — scene, model load, fallback, applyWrap
src/gallery.js                  — lightbox
tests/i18n.test.js, tests/wraps.test.js
.github/workflows/deploy.yml    — build + Pages deploy
ASSETS.md                       — asset sources/licenses + what owner must supply
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `.gitignore`, `index.html` (minimal), `src/main.js`, `src/styles/main.css` (empty shell)

**Interfaces:**
- Produces: working `npm run dev` / `npm run build` / `npm test` pipeline all later tasks rely on.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "young-wrap-landing",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "three": "^0.170.0"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js and .gitignore**

`vite.config.js`:
```js
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: { target: 'es2020' },
  test: { environment: 'node' },
})
```

`.gitignore`:
```
node_modules/
dist/
.DS_Store
```

- [ ] **Step 3: Create minimal index.html, src/main.js, empty src/styles/main.css**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Young Wrap — Car Wraps, PPF, Tint & Coating | Kota Kemuning, Shah Alam</title>
    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <h1>Young Wrap</h1>
  </body>
</html>
```

`src/main.js`:
```js
import './styles/main.css'

console.log('Young Wrap landing — scaffold OK')
```

`src/styles/main.css`: create as an empty file.

- [ ] **Step 4: Install and verify build**

Run: `npm install && npm run build`
Expected: `dist/` produced with `index.html` and hashed assets, no errors.

Run: `npm run dev` briefly (Ctrl-C after) — expected: Vite serves on localhost with no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore index.html src/
git commit -m "chore: scaffold Vite vanilla project"
```

---

### Task 2: Shop Config + i18n Module (TDD)

**Files:**
- Create: `src/config.js`, `src/i18n/translations.js`, `src/i18n/i18n.js`
- Test: `tests/i18n.test.js`

**Interfaces:**
- Produces: `SHOP` object from `config.js` (fields: `name, phone, phoneDisplay, whatsappUrl, addressLine, mapsUrl, hours, instagram, facebook, kol {name, handle, url, postUrl}`); `translations` (flat keys, `en`/`zh`); `t(lang, key)`; `applyLanguage(lang)`; `initLanguageToggle(buttonEl)`. Task 3's HTML uses these exact `data-i18n` keys; Task 8's main.js calls `applyLanguage`/`initLanguageToggle`.

- [ ] **Step 1: Write the failing tests**

`tests/i18n.test.js`:
```js
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
    expect(t('zh', '__missing__' )).toBe(t('en', '__missing__'))
  })

  it('returns the key itself when unknown in every language', () => {
    expect(t('en', 'no.such.key')).toBe('no.such.key')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/i18n.test.js`
Expected: FAIL — cannot resolve `../src/i18n/translations.js`.

- [ ] **Step 3: Write src/config.js**

```js
// Single source of truth for shop data. PLACEHOLDER values marked — swap when owner provides.
const phoneRaw = '+60123456789' // PLACEHOLDER — real WhatsApp/phone number

export const SHOP = {
  name: 'Young Wrap',
  phone: phoneRaw,
  phoneDisplay: '+60 12-345 6789', // PLACEHOLDER
  whatsappUrl: `https://wa.me/${phoneRaw.replace(/[^0-9]/g, '')}`,
  addressLine: 'Kota Kemuning, Shah Alam, Selangor', // PLACEHOLDER — full street address
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kota+Kemuning+Shah+Alam', // PLACEHOLDER
  hours: 'Mon–Sat 10:00 AM – 7:00 PM', // PLACEHOLDER
  instagram: 'https://www.instagram.com/young.wrap/',
  facebook: 'https://www.facebook.com/people/YoungWrap/61552718845372/',
  kol: {
    name: 'Charles Tee',
    handle: '@charlest33',
    url: 'https://www.instagram.com/charlest33/',
    postUrl: 'https://www.instagram.com/charlest33/', // PLACEHOLDER — exact collab post URL
  },
}
```

- [ ] **Step 4: Write src/i18n/translations.js (full dictionary)**

```js
export const translations = {
  en: {
    'nav.services': 'Services',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact',
    'hero.headline': 'Transform Your Ride',
    'hero.sub': 'Premium car wraps, PPF, window tint & ceramic coating in Kota Kemuning, Shah Alam.',
    'hero.cta.whatsapp': 'WhatsApp Us',
    'hero.cta.call': 'Call Now',
    'hero.hint': 'Drag to spin the car — tap a color to preview a wrap',
    'picker.title': 'Pick your wrap',
    'picker.finish': 'Finish',
    'finish.gloss': 'Gloss',
    'finish.matte': 'Matte',
    'finish.satin': 'Satin',
    'finish.shift': 'Color Shift',
    'services.title': 'Our Services',
    'services.wrap.title': 'Full & Partial Wraps',
    'services.wrap.desc': 'Premium cast vinyl in any colour and finish. Change the look, protect the original paint.',
    'services.ppf.title': 'Paint Protection Film',
    'services.ppf.desc': 'Self-healing transparent film that shields your paint from stone chips and scratches.',
    'services.tint.title': 'Window Tint',
    'services.tint.desc': 'Heat-rejecting films for cooler cabins, privacy and UV protection.',
    'services.coating.title': 'Ceramic Coating',
    'services.coating.desc': 'Deep gloss and long-lasting protection that makes every wash easier.',
    'services.detailing.title': 'Detailing',
    'services.detailing.desc': 'Interior and exterior deep cleaning to showroom standard.',
    'gallery.title': 'Recent Work',
    'gallery.sub': 'A few of our favourite transformations. See more on Instagram.',
    'kol.title': 'As Seen On',
    'kol.desc': 'Trusted by Charles Tee (@charlest33) — watch the collab on Instagram.',
    'kol.cta': 'View the post',
    'contact.title': 'Find Us',
    'contact.hours': 'Opening Hours',
    'contact.address': 'Address',
    'contact.directions': 'Get Directions',
    'footer.tagline': 'Your neighbourhood wrap installer — Wraps | PPF | Tint | Coating',
  },
  zh: {
    'nav.services': '服务项目',
    'nav.gallery': '作品展示',
    'nav.contact': '联系我们',
    'hero.headline': '焕新你的座驾',
    'hero.sub': '哥打肯文宁（Kota Kemuning）高品质车身改色、漆面保护膜、隔热膜与陶瓷镀晶。',
    'hero.cta.whatsapp': 'WhatsApp 联系',
    'hero.cta.call': '立即致电',
    'hero.hint': '拖动旋转车辆 — 点击色块预览改色效果',
    'picker.title': '挑选你的改色膜',
    'picker.finish': '质感',
    'finish.gloss': '亮面',
    'finish.matte': '哑光',
    'finish.satin': '缎面',
    'finish.shift': '变色龙',
    'services.title': '服务项目',
    'services.wrap.title': '全车 / 局部改色',
    'services.wrap.desc': '进口铸造级改色膜，颜色与质感任选，焕新外观同时保护原厂漆。',
    'services.ppf.title': '漆面保护膜 (PPF)',
    'services.ppf.desc': '自我修复透明保护膜，有效抵御石击与刮痕。',
    'services.tint.title': '隔热膜',
    'services.tint.desc': '高隔热车窗膜，降温防晒、保护隐私、阻挡紫外线。',
    'services.coating.title': '陶瓷镀晶',
    'services.coating.desc': '深邃光泽与持久保护，让每次洗车更轻松。',
    'services.detailing.title': '汽车美容',
    'services.detailing.desc': '内饰与外观深度清洁，还原展厅级光彩。',
    'gallery.title': '近期作品',
    'gallery.sub': '部分得意之作，更多请关注我们的 Instagram。',
    'kol.title': '人气推荐',
    'kol.desc': '人气创作者 Charles Tee（@charlest33）倾力推荐 — 到 Instagram 观看合作内容。',
    'kol.cta': '查看贴文',
    'contact.title': '门店位置',
    'contact.hours': '营业时间',
    'contact.address': '地址',
    'contact.directions': '导航前往',
    'footer.tagline': '你身边的专业贴膜店 — 改色 | PPF | 隔热膜 | 镀晶',
  },
}
```

- [ ] **Step 5: Write src/i18n/i18n.js**

```js
import { translations } from './translations.js'

const STORAGE_KEY = 'yw-lang'

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key
}

export function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'zh' ? 'zh' : 'en'
  } catch {
    return 'en'
  }
}

export function applyLanguage(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en'
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(lang, el.dataset.i18n)
  }
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch { /* private mode — non-fatal */ }
}

export function initLanguageToggle(buttonEl) {
  let lang = getSavedLanguage()
  const render = () => {
    buttonEl.textContent = lang === 'en' ? '中文' : 'EN'
    applyLanguage(lang)
  }
  buttonEl.addEventListener('click', () => {
    lang = lang === 'en' ? 'zh' : 'en'
    render()
  })
  render()
}
```

Note: `t('zh', '__missing__')` returns the key `'__missing__'` via the double fallback — the test's fallback assertion compares it against `t('en', '__missing__')`, which is also the key, so both fallback layers are exercised without needing a real missing-in-zh key (parity test forbids one).

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/i18n.test.js`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add src/config.js src/i18n/ tests/i18n.test.js
git commit -m "feat: shop config and EN/ZH i18n module"
```

---

### Task 3: Page Content & SEO (index.html)

**Files:**
- Modify: `index.html` (replace entirely)
- Create: `public/robots.txt`, `public/sitemap.xml`

**Interfaces:**
- Consumes: `data-i18n` keys exactly as defined in Task 2's dictionary.
- Produces: DOM ids used by later tasks: `#car-canvas` (viewer container), `#wrap-colors`, `#wrap-finishes` (picker containers), `#gallery-grid`, `#lightbox` (dialog), `#lang-toggle`, and `data-shop` attributes (`data-shop="whatsapp|tel|maps|instagram|facebook|kol"`) that `main.js` fills from `SHOP`.

- [ ] **Step 1: Replace index.html with full page**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Young Wrap — Car Wraps, PPF, Tint & Coating | Kota Kemuning, Shah Alam</title>
    <meta name="description" content="Young Wrap: premium car wraps, paint protection film (PPF), window tint, ceramic coating and detailing in Kota Kemuning, Shah Alam, Selangor. WhatsApp us for a quote." />
    <!-- PLACEHOLDER og:url/og:image — update after deploy + real photos -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Young Wrap — Car Wraps, PPF, Tint & Coating" />
    <meta property="og:description" content="Premium car wraps, PPF, tint & coating in Kota Kemuning, Shah Alam. WhatsApp us for a quote." />
    <meta property="og:url" content="https://fookoowei.github.io/Young-Wrap-Landing-Website/" />
    <meta property="og:image" content="https://fookoowei.github.io/Young-Wrap-Landing-Website/images/gallery-1.svg" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏎️</text></svg>" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "AutoBodyShop",
      "name": "Young Wrap",
      "description": "Car wraps, paint protection film, window tint, ceramic coating and detailing.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kota Kemuning, Shah Alam",
        "addressRegion": "Selangor",
        "addressCountry": "MY"
      },
      "telephone": "+60123456789",
      "url": "https://fookoowei.github.io/Young-Wrap-Landing-Website/",
      "sameAs": [
        "https://www.instagram.com/young.wrap/",
        "https://www.facebook.com/people/YoungWrap/61552718845372/"
      ]
    }
    </script>
    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="#top">Young Wrap</a>
      <nav class="site-nav">
        <a href="#services" data-i18n="nav.services">Services</a>
        <a href="#gallery" data-i18n="nav.gallery">Gallery</a>
        <a href="#contact" data-i18n="nav.contact">Contact</a>
      </nav>
      <button id="lang-toggle" class="lang-toggle" type="button" aria-label="Switch language">中文</button>
    </header>

    <main id="top">
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-eyebrow">Wraps | PPF | Tint | Coating</p>
          <h1 data-i18n="hero.headline">Transform Your Ride</h1>
          <p class="hero-sub" data-i18n="hero.sub">Premium car wraps, PPF, window tint & ceramic coating in Kota Kemuning, Shah Alam.</p>
          <div class="cta-row">
            <a class="btn btn-whatsapp" data-shop="whatsapp" href="#" data-i18n="hero.cta.whatsapp">WhatsApp Us</a>
            <a class="btn btn-call" data-shop="tel" href="#" data-i18n="hero.cta.call">Call Now</a>
          </div>
        </div>
        <div class="hero-viewer">
          <div id="car-canvas" aria-label="Interactive 3D car preview">
            <img class="viewer-fallback-img" src="images/gallery-1.svg" alt="Wrapped car preview" hidden />
          </div>
          <p class="hero-hint" data-i18n="hero.hint">Drag to spin the car — tap a color to preview a wrap</p>
          <div class="wrap-picker">
            <p class="picker-title" data-i18n="picker.title">Pick your wrap</p>
            <div id="wrap-colors" class="swatches" role="listbox" aria-label="Wrap colors"></div>
            <p class="picker-title" data-i18n="picker.finish">Finish</p>
            <div id="wrap-finishes" class="finishes" role="listbox" aria-label="Wrap finishes"></div>
          </div>
        </div>
      </section>

      <section id="services" class="services">
        <h2 data-i18n="services.title">Our Services</h2>
        <div class="service-grid">
          <article><h3 data-i18n="services.wrap.title">Full & Partial Wraps</h3><p data-i18n="services.wrap.desc">Premium cast vinyl in any colour and finish. Change the look, protect the original paint.</p></article>
          <article><h3 data-i18n="services.ppf.title">Paint Protection Film</h3><p data-i18n="services.ppf.desc">Self-healing transparent film that shields your paint from stone chips and scratches.</p></article>
          <article><h3 data-i18n="services.tint.title">Window Tint</h3><p data-i18n="services.tint.desc">Heat-rejecting films for cooler cabins, privacy and UV protection.</p></article>
          <article><h3 data-i18n="services.coating.title">Ceramic Coating</h3><p data-i18n="services.coating.desc">Deep gloss and long-lasting protection that makes every wash easier.</p></article>
          <article><h3 data-i18n="services.detailing.title">Detailing</h3><p data-i18n="services.detailing.desc">Interior and exterior deep cleaning to showroom standard.</p></article>
        </div>
      </section>

      <section id="gallery" class="gallery">
        <h2 data-i18n="gallery.title">Recent Work</h2>
        <p data-i18n="gallery.sub">A few of our favourite transformations. See more on Instagram.</p>
        <div id="gallery-grid" class="gallery-grid"></div>
      </section>

      <section class="kol">
        <h2 data-i18n="kol.title">As Seen On</h2>
        <p data-i18n="kol.desc">Trusted by Charles Tee (@charlest33) — watch the collab on Instagram.</p>
        <a class="btn btn-outline" data-shop="kol" href="#" target="_blank" rel="noopener" data-i18n="kol.cta">View the post</a>
      </section>

      <section id="contact" class="contact">
        <h2 data-i18n="contact.title">Find Us</h2>
        <div class="contact-grid">
          <div>
            <h3 data-i18n="contact.address">Address</h3>
            <p class="shop-address">Kota Kemuning, Shah Alam, Selangor</p>
            <h3 data-i18n="contact.hours">Opening Hours</h3>
            <p class="shop-hours">Mon–Sat 10:00 AM – 7:00 PM</p>
            <a class="btn btn-outline" data-shop="maps" href="#" target="_blank" rel="noopener" data-i18n="contact.directions">Get Directions</a>
          </div>
          <div class="socials">
            <a data-shop="instagram" href="#" target="_blank" rel="noopener">Instagram</a>
            <a data-shop="facebook" href="#" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p data-i18n="footer.tagline">Your neighbourhood wrap installer — Wraps | PPF | Tint | Coating</p>
      <p>© 2026 Young Wrap</p>
    </footer>

    <a class="whatsapp-fab" data-shop="whatsapp" href="#" aria-label="Chat on WhatsApp">💬</a>

    <dialog id="lightbox" class="lightbox">
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <img class="lightbox-img" src="" alt="" />
    </dialog>
  </body>
</html>
```

- [ ] **Step 2: Create public/robots.txt and public/sitemap.xml**

`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://fookoowei.github.io/Young-Wrap-Landing-Website/sitemap.xml
```

`public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fookoowei.github.io/Young-Wrap-Landing-Website/</loc>
    <lastmod>2026-08-10</lastmod>
  </url>
</urlset>
```

- [ ] **Step 3: Wire SHOP data + i18n in src/main.js**

Replace `src/main.js`:
```js
import './styles/main.css'
import { SHOP } from './config.js'
import { initLanguageToggle } from './i18n/i18n.js'

function wireShopLinks() {
  const targets = {
    whatsapp: SHOP.whatsappUrl,
    tel: `tel:${SHOP.phone}`,
    maps: SHOP.mapsUrl,
    instagram: SHOP.instagram,
    facebook: SHOP.facebook,
    kol: SHOP.kol.postUrl,
  }
  for (const [key, url] of Object.entries(targets)) {
    for (const el of document.querySelectorAll(`[data-shop="${key}"]`)) el.href = url
  }
  document.querySelector('.shop-address').textContent = SHOP.addressLine
  document.querySelector('.shop-hours').textContent = SHOP.hours
}

wireShopLinks()
initLanguageToggle(document.getElementById('lang-toggle'))
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`, open the page.
Expected: all sections render (unstyled), language toggle swaps every marked string to Chinese and back, WhatsApp/Call links point at `wa.me/60123456789` and `tel:+60123456789`, reload remembers the chosen language.

Run: `npm test` — expected: i18n tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html public/robots.txt public/sitemap.xml src/main.js
git commit -m "feat: full page content, SEO head, shop link wiring"
```

---

### Task 4: Styling

**Files:**
- Modify: `src/styles/main.css` (replace entirely)

**Interfaces:**
- Consumes: class names/ids exactly as in Task 3's HTML.
- Produces: CSS custom properties `--brand-accent`, `--bg`, `--surface`, `--text`, `--text-dim` (swap points for real brand colors).

- [ ] **Step 1: Write main.css**

```css
:root {
  --bg: #0b0d10;
  --surface: #14181d;
  --text: #f2f4f6;
  --text-dim: #9aa3ad;
  --brand-accent: #e10600; /* PLACEHOLDER — swap for real logo color */
  --whatsapp: #25d366;
  --radius: 14px;
  --maxw: 1100px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.6;
}
h1, h2, h3 { line-height: 1.15; letter-spacing: -0.01em; }
section { max-width: var(--maxw); margin: 0 auto; padding: 4.5rem 1.25rem; }
section h2 { font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin-bottom: 0.75rem; }

.site-header {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 1.5rem;
  padding: 0.9rem 1.25rem;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ffffff14;
}
.brand { font-weight: 800; font-size: 1.15rem; color: var(--text); text-decoration: none; letter-spacing: 0.02em; }
.site-nav { display: flex; gap: 1.25rem; margin-left: auto; }
.site-nav a { color: var(--text-dim); text-decoration: none; font-size: 0.95rem; }
.site-nav a:hover { color: var(--text); }
.lang-toggle {
  border: 1px solid #ffffff2e; background: none; color: var(--text);
  border-radius: 999px; padding: 0.35rem 0.9rem; cursor: pointer; font-size: 0.9rem;
}

.hero {
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 2rem; align-items: center; min-height: 82vh; padding-top: 3rem;
}
.hero-eyebrow { color: var(--brand-accent); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.8rem; }
.hero h1 { font-size: clamp(2.4rem, 6vw, 4rem); margin: 0.5rem 0 1rem; }
.hero-sub { color: var(--text-dim); max-width: 40ch; }
.cta-row { display: flex; gap: 0.9rem; margin-top: 1.75rem; flex-wrap: wrap; }

.btn {
  display: inline-block; padding: 0.85rem 1.6rem; border-radius: 999px;
  font-weight: 700; text-decoration: none; color: #fff; transition: transform 0.15s ease;
}
.btn:hover { transform: translateY(-2px); }
.btn-whatsapp { background: var(--whatsapp); color: #06281a; }
.btn-call { background: var(--brand-accent); }
.btn-outline { border: 1px solid #ffffff3d; color: var(--text); background: none; }

.hero-viewer { position: relative; }
#car-canvas {
  width: 100%; aspect-ratio: 4 / 3; border-radius: var(--radius);
  background: radial-gradient(ellipse 65% 55% at 50% 60%, #1d232b 0%, var(--bg) 75%);
  overflow: hidden; touch-action: none;
}
#car-canvas canvas { display: block; width: 100% !important; height: 100% !important; }
#car-canvas.viewer-fallback .viewer-fallback-img[hidden] { display: block !important; }
.viewer-fallback-img { width: 100%; height: 100%; object-fit: cover; }
.hero-hint { text-align: center; color: var(--text-dim); font-size: 0.85rem; margin-top: 0.6rem; }

.wrap-picker { margin-top: 1rem; background: var(--surface); border-radius: var(--radius); padding: 1rem 1.25rem; }
.picker-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); margin: 0.5rem 0 0.5rem; }
.swatches { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.swatch {
  width: 34px; height: 34px; border-radius: 50%; cursor: pointer;
  border: 2px solid #ffffff2b; transition: transform 0.12s ease;
}
.swatch:hover { transform: scale(1.12); }
.swatch[aria-selected="true"] { border-color: #fff; box-shadow: 0 0 0 3px var(--brand-accent); }
.finishes { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.finish-btn {
  border: 1px solid #ffffff2e; background: none; color: var(--text);
  border-radius: 999px; padding: 0.4rem 1rem; cursor: pointer; font-size: 0.9rem;
}
.finish-btn[aria-selected="true"] { background: var(--brand-accent); border-color: var(--brand-accent); }

.service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
.service-grid article { background: var(--surface); border-radius: var(--radius); padding: 1.5rem; border: 1px solid #ffffff0f; }
.service-grid h3 { font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--brand-accent); }
.service-grid p { color: var(--text-dim); font-size: 0.95rem; }

.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.9rem; margin-top: 1.5rem; }
.gallery-grid img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--radius); cursor: zoom-in; }

.kol { text-align: center; background: var(--surface); border-radius: var(--radius); max-width: min(var(--maxw), calc(100% - 2.5rem)); }
.kol .btn { margin-top: 1.25rem; }

.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
.contact h3 { margin-top: 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
.socials { display: flex; flex-direction: column; gap: 0.6rem; }
.socials a { color: var(--text); }

.site-footer { text-align: center; padding: 2.5rem 1.25rem; color: var(--text-dim); border-top: 1px solid #ffffff14; font-size: 0.9rem; }

.whatsapp-fab {
  position: fixed; right: 1.25rem; bottom: 1.25rem; z-index: 30;
  width: 56px; height: 56px; border-radius: 50%; background: var(--whatsapp);
  display: grid; place-items: center; font-size: 1.6rem; text-decoration: none;
  box-shadow: 0 8px 24px #0009;
}

.lightbox { border: none; background: #000c; padding: 0; border-radius: var(--radius); max-width: 90vw; }
.lightbox::backdrop { background: #000a; }
.lightbox-img { max-width: 90vw; max-height: 82vh; display: block; }
.lightbox-close {
  position: absolute; top: 0.5rem; right: 0.5rem; width: 40px; height: 40px;
  border-radius: 50%; border: none; background: #0008; color: #fff; font-size: 1.4rem; cursor: pointer;
}

@media (max-width: 820px) {
  .hero { grid-template-columns: 1fr; min-height: unset; padding-top: 2rem; }
  .site-nav { display: none; }
  .contact-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Verify responsive layout**

Run: `npm run dev`; check desktop width and 375 px width (devtools).
Expected: dark theme, sticky header, hero splits copy/viewer on desktop and stacks on mobile, floating WhatsApp button visible, no horizontal scroll at 375 px.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: responsive dark styling with brand color variables"
```

---

### Task 5: Wrap Data Module (TDD)

**Files:**
- Create: `src/three/wraps.js`
- Test: `tests/wraps.test.js`

**Interfaces:**
- Produces: `WRAP_COLORS` (array of `{id, hex, name:{en,zh}}`), `WRAP_FINISHES` (map id → `{label:{en,zh}, roughness, metalness, clearcoat, clearcoatRoughness, iridescence?, iridescenceIOR?}`), `wrapParams(colorId, finishId)` → `{color, roughness, metalness, clearcoat, clearcoatRoughness, iridescence?, iridescenceIOR?}`. Task 6 consumes all three.

- [ ] **Step 1: Write the failing tests**

`tests/wraps.test.js`:
```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/wraps.test.js`
Expected: FAIL — cannot resolve `../src/three/wraps.js`.

- [ ] **Step 3: Write src/three/wraps.js**

```js
export const WRAP_COLORS = [
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/wraps.test.js`
Expected: PASS (4 tests). Also run `npm test` — all suites PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/wraps.js tests/wraps.test.js
git commit -m "feat: wrap color/finish data module"
```

---

### Task 6: 3D Car Viewer + Picker Wiring

**Files:**
- Create: `src/three/carViewer.js`, `public/models/` (model file), `ASSETS.md`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `wrapParams`, `WRAP_COLORS`, `WRAP_FINISHES` (Task 5); `#car-canvas`, `#wrap-colors`, `#wrap-finishes` (Task 3); `getSavedLanguage` (Task 2).
- Produces: `createCarViewer(container)` → `Promise<{ applyWrap(params) } | null>` (`null` = WebGL unavailable, fallback image shown).

- [ ] **Step 1: Obtain a licensed car model**

Download a CC0/CC-BY low-poly car in GLB, ≤ 2 MB, to `public/models/car.glb`. Try in order:
1. Kenney Car Kit (CC0): https://kenney.nl/assets/car-kit — download zip, pick a sports-car GLB from `Models/GLB format/`.
2. Quaternius vehicle packs (CC0): https://quaternius.com
3. Poly Pizza (filter license CC0): https://poly.pizza/explore/vehicles

Verify: `ls -lh public/models/car.glb` shows ≤ 2 MB. Record source URL + license in `ASSETS.md`:

```markdown
# Assets

## 3D model
- `public/models/car.glb` — <model name> by <author>, <license>, from <URL>

## Supplied by owner (pending — placeholders in use)
- Phone/WhatsApp number → `src/config.js`
- Full street address + hours → `src/config.js` and JSON-LD in `index.html`
- Logo + brand colors → `--brand-accent` in `src/styles/main.css`
- Gallery photos → replace `public/images/gallery-*.svg`
- Charles Tee collab post URL → `SHOP.kol.postUrl` in `src/config.js`
```

If no download is possible (offline), skip the file — the viewer's procedural fallback car (Step 2) keeps everything working; leave a note in ASSETS.md.

- [ ] **Step 2: Write src/three/carViewer.js**

```js
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// Simple stylized car so the page works even without a downloaded model.
function buildFallbackCar() {
  const group = new THREE.Group()
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d })
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 1.6), bodyMat)
  body.position.y = 0.55
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 1.4), bodyMat)
  cabin.position.set(-0.2, 1.15, 0)
  group.add(body, cabin)
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.8 })
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 24)
  for (const [x, z] of [[1.25, 0.8], [1.25, -0.8], [-1.25, 0.8], [-1.25, -0.8]]) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(x, 0.38, z)
    group.add(wheel)
  }
  return { object: group, bodyMeshes: [body, cabin] }
}

function findBodyMeshes(root) {
  const meshes = []
  root.traverse((o) => { if (o.isMesh) meshes.push(o) })
  const named = meshes.filter((m) => /body|paint|car|chassis/i.test(m.material?.name || m.name))
  if (named.length) return named
  // Fallback: the mesh with the largest bounding box is almost always the body shell.
  let best = meshes[0]
  let bestVol = -1
  for (const m of meshes) {
    const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3())
    const vol = size.x * size.y * size.z
    if (vol > bestVol) { bestVol = vol; best = m }
  }
  return best ? [best] : []
}

async function loadCar() {
  const url = `${import.meta.env.BASE_URL}models/car.glb`
  const gltf = await new GLTFLoader().loadAsync(url)
  const object = gltf.scene
  // Normalize: center on origin, rest on y=0, ~4 units long.
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const scale = 4 / Math.max(size.x, size.z)
  object.scale.setScalar(scale)
  const scaled = new THREE.Box3().setFromObject(object)
  const center = scaled.getCenter(new THREE.Vector3())
  object.position.sub(center)
  object.position.y -= scaled.min.y - center.y
  return { object, bodyMeshes: findBodyMeshes(object) }
}

export async function createCarViewer(container) {
  if (!supportsWebGL()) {
    container.classList.add('viewer-fallback')
    return null
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(4.5, 1.9, 4.5)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 3.2
  controls.maxDistance = 8
  controls.maxPolarAngle = Math.PI / 2.05
  controls.target.set(0, 0.6, 0)
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.1
  let idleTimer
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer) })
  controls.addEventListener('end', () => { idleTimer = setTimeout(() => { controls.autoRotate = true }, 3000) })

  let car
  try {
    car = await loadCar()
  } catch {
    car = buildFallbackCar()
  }
  scene.add(car.object)

  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.04 })
  for (const mesh of car.bodyMeshes) mesh.material = bodyMaterial

  function applyWrap(params) {
    bodyMaterial.color.set(params.color)
    bodyMaterial.roughness = params.roughness
    bodyMaterial.metalness = params.metalness
    bodyMaterial.clearcoat = params.clearcoat
    bodyMaterial.clearcoatRoughness = params.clearcoatRoughness
    bodyMaterial.iridescence = params.iridescence ?? 0
    bodyMaterial.iridescenceIOR = params.iridescenceIOR ?? 1.3
    bodyMaterial.needsUpdate = true
  }

  new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = container
    if (!w || !h) return
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }).observe(container)

  renderer.setAnimationLoop(() => {
    controls.update()
    renderer.render(scene, camera)
  })

  return { applyWrap }
}
```

- [ ] **Step 3: Build the picker UI and wire it in src/main.js**

Add to `src/main.js` (after existing imports/calls):
```js
import { createCarViewer } from './three/carViewer.js'
import { WRAP_COLORS, WRAP_FINISHES, wrapParams } from './three/wraps.js'
import { getSavedLanguage } from './i18n/i18n.js'

async function initViewer() {
  const container = document.getElementById('car-canvas')
  const viewer = await createCarViewer(container).catch(() => null)
  if (!viewer) {
    container.classList.add('viewer-fallback')
    return
  }

  const lang = getSavedLanguage()
  let colorId = WRAP_COLORS[0].id
  let finishId = 'gloss'
  const update = () => viewer.applyWrap(wrapParams(colorId, finishId))

  const swatchBox = document.getElementById('wrap-colors')
  for (const c of WRAP_COLORS) {
    const btn = document.createElement('button')
    btn.className = 'swatch'
    btn.type = 'button'
    btn.style.background = c.hex
    btn.title = c.name[lang]
    btn.setAttribute('role', 'option')
    btn.setAttribute('aria-selected', String(c.id === colorId))
    btn.addEventListener('click', () => {
      colorId = c.id
      for (const el of swatchBox.children) el.setAttribute('aria-selected', 'false')
      btn.setAttribute('aria-selected', 'true')
      update()
    })
    swatchBox.append(btn)
  }

  const finishBox = document.getElementById('wrap-finishes')
  for (const [id, f] of Object.entries(WRAP_FINISHES)) {
    const btn = document.createElement('button')
    btn.className = 'finish-btn'
    btn.type = 'button'
    btn.dataset.i18n = `finish.${id}`
    btn.textContent = f.label[lang]
    btn.setAttribute('role', 'option')
    btn.setAttribute('aria-selected', String(id === finishId))
    btn.addEventListener('click', () => {
      finishId = id
      for (const el of finishBox.children) el.setAttribute('aria-selected', 'false')
      btn.setAttribute('aria-selected', 'true')
      update()
    })
    finishBox.append(btn)
  }

  update()
}

initViewer()
```

Note: finish buttons carry `data-i18n="finish.<id>"` so the language toggle re-labels them automatically.

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`.
Expected: car renders and slowly auto-rotates; dragging rotates it and pauses auto-rotate (resumes ~3 s after release); each swatch recolors the body; each finish visibly changes surface quality (matte = dull, gloss = reflective, shift = iridescent sheen); page still fully readable if you rename `public/models/car.glb` (procedural fallback car appears).

Run: `npm run build && npm run preview` — expected: same behavior from the production bundle.

- [ ] **Step 5: Commit**

```bash
git add src/three/carViewer.js src/main.js public/models/ ASSETS.md
git commit -m "feat: interactive 3D car viewer with wrap picker"
```

---

### Task 7: Gallery + Lightbox

**Files:**
- Create: `src/gallery.js`, `public/images/gallery-1.svg` … `gallery-6.svg`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `#gallery-grid`, `#lightbox` (Task 3).
- Produces: `initGallery()` — renders images and wires the lightbox.

- [ ] **Step 1: Generate placeholder images**

```bash
mkdir -p public/images
for i in 1 2 3 4 5 6; do
cat > "public/images/gallery-$i.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#14181d"/><stop offset="1" stop-color="#2a3340"/>
  </linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <text x="400" y="290" fill="#9aa3ad" font-family="system-ui" font-size="34" text-anchor="middle">Young Wrap</text>
  <text x="400" y="335" fill="#5a636d" font-family="system-ui" font-size="22" text-anchor="middle">Photo $i — real wrap photo coming soon</text>
</svg>
EOF
done
```

- [ ] **Step 2: Write src/gallery.js**

```js
const IMAGES = [1, 2, 3, 4, 5, 6].map((i) => ({
  src: `${import.meta.env.BASE_URL}images/gallery-${i}.svg`,
  alt: `Young Wrap project ${i}`, // replace with descriptive alts when real photos arrive
}))

export function initGallery() {
  const grid = document.getElementById('gallery-grid')
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = lightbox.querySelector('.lightbox-img')

  for (const { src, alt } of IMAGES) {
    const img = document.createElement('img')
    img.src = src
    img.alt = alt
    img.loading = 'lazy'
    img.addEventListener('click', () => {
      lightboxImg.src = src
      lightboxImg.alt = alt
      lightbox.showModal()
    })
    grid.append(img)
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close() })
}
```

- [ ] **Step 3: Wire into src/main.js**

Add:
```js
import { initGallery } from './gallery.js'

initGallery()
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`.
Expected: 6 placeholder tiles in a responsive grid; clicking opens the lightbox; closes via ×, backdrop click, and Esc.

Run: `npm test` — all suites still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/gallery.js src/main.js public/images/
git commit -m "feat: gallery grid with lightbox and placeholder images"
```

---

### Task 8: Deploy to GitHub Pages + README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Consumes: `npm run build` (Task 1), whole site.
- Produces: live site at `https://fookoowei.github.io/Young-Wrap-Landing-Website/`.

- [ ] **Step 1: Create .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create README.md**

```markdown
# Young Wrap — 3D Landing Site

Landing page for Young Wrap (car wraps, PPF, tint, coating — Kota Kemuning, Shah Alam) with an interactive Three.js car and live wrap preview. EN/中文.

## Develop
npm install
npm run dev

## Test / Build
npm test
npm run build && npm run preview

## Deploy
Push to `main` → GitHub Actions builds and deploys to GitHub Pages.
One-time setup: repo Settings → Pages → Source: **GitHub Actions**.

## Swapping in real content
See `ASSETS.md` — phone, address, photos, logo, and KOL post URL are placeholders, each changeable in one file.
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/ README.md
git commit -m "ci: GitHub Pages deploy workflow and README"
git push origin main
```

- [ ] **Step 4: Enable Pages and verify deploy**

Requires the repo owner once: GitHub → repo Settings → Pages → Build and deployment → Source: **GitHub Actions**. Then check the Actions tab run succeeds and open `https://fookoowei.github.io/Young-Wrap-Landing-Website/`.

Expected: live site — 3D car interactive, language toggle works, gallery lightbox works, WhatsApp/Call links open correctly on a phone.

- [ ] **Step 5: Lighthouse check**

Run Chrome DevTools → Lighthouse (mobile) on the live URL.
Expected: SEO ≥ 95, Performance ≥ 80. If performance is below target, the usual fix is model size — re-export/compress `car.glb` (must stay ≤ 2 MB).

---

## Post-launch (owner-supplied content — not part of this plan)

When the user provides real data, each swap is a one-file edit tracked in `ASSETS.md`: phone/address/hours/KOL post URL (`src/config.js` + JSON-LD in `index.html`), logo & brand color (`--brand-accent`), gallery photos (`public/images/`, update `IMAGES` alts in `src/gallery.js`), then update `og:image`/`og:url`/sitemap if a custom domain is added.
