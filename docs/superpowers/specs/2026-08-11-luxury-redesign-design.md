# Young Wrap — Luxury Redesign (Hispano Suiza / SC Group style)

**Date:** 2026-08-11
**Base:** current shipped site (video hero, configurator, WebP gallery, embeds — all on `main`)
**References:** hispanosuizacars.com + scgroup.dk — pattern sources only (cursor, motion, menu, carousel, list-style sections). No assets or copy from either site.

## Goals

Elevate the site's look/feel to luxury-automotive standard: custom cursor, GSAP motion system, fullscreen menu, draggable portfolio, story section, form+map contact — and split the 3D configurator into its own page.

## Stack Changes

- Add `gsap` (npm, free incl. plugins): ScrollTrigger, Draggable, InertiaPlugin.
- Vite multi-page build: `index.html` (landing) + `studio.html` (3D studio). Three.js loads ONLY on studio.html — removes the 590 KB chunk from the landing page entirely.
- Everything else unchanged: vanilla JS, vitest, tokens (`--orange: #FA9C20` on carbon), Chakra Petch + Saira fonts (kept for brand continuity; treatment changes, not the faces).

## Landing Page (index.html), top to bottom

1. **Preloader** — black overlay, YW wordmark reveal, curtain lift (~1.2 s). Session-once (sessionStorage) and skipped under `prefers-reduced-motion`.
2. **Header** — slim fixed bar: logo left; right side WhatsApp pill CTA + hamburger. Hamburger opens fullscreen black overlay menu: staggered oversized nav links (Home / 3D Studio / Services / Portfolio / Contact), EN⇄中文 toggle, social icons, shop phone. Works at every viewport (fixes nav hidden <940px).
3. **Custom cursor** — orange dot + lagging ring (GSAP quickTo). Ring grows on interactive elements; morphs to a "DRAG" pill over the portfolio carousel. Only when `(pointer: fine)`; disabled under reduced-motion; native cursor never hidden for form fields.
4. **Hero** — background video becomes a **montage of the owner's six clips** (`assets-src/videos/wrapping1–6.mp4`): each clip's best ~2–3 s, normalized 1920×1080 24fps, hard cuts, muted, loopable, target ≤ 8 MB (ffmpeg concat; crf tuned to fit). Oversized uppercase headline with staggered line-mask reveal; ghost/solid pill CTAs; thin scroll indicator. Poster = first frame.
5. **Marquee** — kept (Wrap · PPF · Tint · Coating · Detailing), slightly slimmer.
6. **About / story (new)** — "Your neighbourhood wrap installer" curatorial copy (~60 words EN + 中文), stat row with scroll count-up (5 services · 10+ transformations shown · Kota Kemuning based), one parallax gallery image. Content grounded in the shop's real IG bio — no invented claims (no fake years/car counts).
7. **Services** — numbered luxury rows (01 Wraps … 05 Detailing, 06 · Anything = the wrap-anything line). Row hover: background lightens, number turns orange, row expands to show its one-line description. Keyboard-focusable equivalents.
8. **3D Studio teaser (new, replaces inline configurator)** — full-bleed dark section: still render of the car + "Design your wrap in 3D" + CTA → `studio.html`. (Configurator moves off the landing page per owner.)
9. **Portfolio** — **draggable horizontal carousel** (GSAP Draggable + inertia, snap per card; native touch scroll on mobile) of the 10 WebP photos, large cards with location/finish captions from alt data, lightbox kept.
10. **KOL** — kept (iframe embed), restyled with section eyebrow + reveal.
11. **Contact** — two columns: **quote form** (name, car model, service select, message) beside the **Google Maps embed** + address/hours/phone. Submit composes a prefilled WhatsApp message and opens `wa.me/<number>?text=…` (no backend on static hosting; matches how the shop actually closes deals). Client-side required-field checks only.
12. **Footer** — big wordmark, SVG social icons (Instagram, Facebook, WhatsApp), model attribution line, © line.

## Studio Page (studio.html, new)

- Full-viewport 3D configurator: same carViewer module, same lazy pattern (init on load here — it IS the page).
- **Expanded palette:** ~14 curated wrap colors in groups (Gloss brights / Matte neutrals / Metallics / Specials) **plus a free custom color** `<input type="color">`; finish row (Gloss/Matte/Satin/Colour-Shift) kept.
- "SPIN" cursor pill over the canvas; back-to-home link in header; same fullscreen menu, i18n, footer condensed.
- Selected color+finish deep-links via URL hash (e.g. `#c=FA9C20&f=matte`) so a chosen wrap is shareable in WhatsApp.
- Model file stays `public/models/car.glb` (currently CC-BY RX-7 stand-in; owner may later supply a properly licensed GR86 — one-file swap, attribution line updated then).

## Motion System (GSAP)

- One `src/motion.js` module: section reveal defaults (fade+rise, stagger), ScrollTrigger registrations, marquee, count-ups, parallax. All wrapped in `gsap.matchMedia()` with `prefers-reduced-motion: reduce` → static (no scroll effects, video paused/hidden poster).
- Hero video also honors reduced-motion (pause + poster).

## Structure / Files

```
index.html, studio.html
src/main.js (landing entry) · src/studio.js (studio entry)
src/menu.js (header+overlay) · src/cursor.js · src/motion.js · src/carousel.js (Draggable portfolio) · src/quote-form.js (wa.me composer)
src/three/carViewer.js (unchanged core) · src/three/wraps.js (palette expanded)
src/i18n/* (keys for every new string, en+zh parity test extended)
scripts/build-hero-montage.md (recorded ffmpeg recipe)
public/videos/hero-montage.mp4 (+ poster jpg)
```

## Constraints

- Lighthouse (mobile, landing): SEO ≥ 95 kept at 100; performance ≥ 85 (Three.js gone from landing; GSAP ~70 KB gz total).
- All new copy bilingual; i18n parity test must cover studio.html keys too.
- No AI attribution in commits. Owner data stays in `src/config.js`.
- Old `#configurator` section removed from landing; redirects/anchors: nav "3D Studio" → `studio.html`.

## Testing

- vitest: extend i18n parity to scan both HTML files; palette test (all hexes valid, ids unique); wa.me composer unit test (fields → encoded URL).
- Manual: cursor states, drag physics, menu open/close + focus trap, form → WhatsApp on desktop and mobile, studio deep-link hash, reduced-motion pass, 375 px walk.
- Lighthouse re-run on both pages before push.
