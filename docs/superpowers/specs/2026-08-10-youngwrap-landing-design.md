# Young Wrap — 3D Landing Website Design

**Date:** 2026-08-10
**Client:** Young Wrap (@young.wrap) — car wrap shop in Kota Kemuning, Shah Alam, Selangor, Malaysia
**Goal:** A single-page landing site whose centerpiece is an interactive 3D car with live wrap swapping. Primary actions: instant contact (WhatsApp/Call) and showcasing past work.

## Tech Approach

Vanilla HTML/CSS/JS + Three.js, bundled with Vite (vanilla template, no framework). Output is a plain static folder deployable to GitHub Pages (free) or Hostinger (paid) with no code changes.

Rationale:
- SEO: all content is real HTML text, fully crawlable — better than a client-rendered React SPA.
- Hosting: static files work anywhere; no Node server required.
- Scope: one landing page doesn't justify a framework.

## Visual Theme

- **Colors:** orange as brand accent on black backgrounds with white text. Tokens: `--clr-orange: #FF6B00`, `--clr-black: #0B0B0C`, `--clr-surface: #151517`, `--clr-white: #FFFFFF`. Orange is used for CTAs, highlights, and hover states; never as a large background.
- Overall feel: dark, cinematic, premium — modeled on the reference screenshot (full-bleed dark video, large white headline, minimal chrome).

## Page Structure (single page, top to bottom)

1. **Hero** — full-viewport **background video** (montage of wrap-work clips, muted/looped/autoplay/playsinline, dark overlay for text contrast, poster image fallback). Over it: Young Wrap logo + large headline + tagline ("Wraps | PPF | Tint | Coating"), prominent WhatsApp and Call buttons. Video is owner-supplied (generated with nanobanana 2 + real shop clips; prompts provided in `docs/assets-brief.md`).
2. **3D Configurator** — full-screen section: interactive 3D **Toyota GR86** (the owner's car). Wrap picker: color swatches × finish options (gloss, matte, satin, color-shift).
3. **Services** — Full/Partial Wraps, PPF, Window Tint, Ceramic Coating, Detailing. Real HTML headings and copy for SEO.
4. **Gallery** — responsive grid of past-work photos (from Instagram content the owner supplies). Lightbox on click.
5. **KOL section** — "As seen on @charlest33" (Charles Tee, 316K followers), with the collab Instagram post embedded via `<iframe>` (post permalink + `/embed`), plus a link to the profile.
6. **Location & Contact** — address, **Google Maps iframe embed** (free `?output=embed` URL — no API key or billing), opening hours, Instagram/Facebook links. Floating WhatsApp button persists across the whole page.

## 3D Car (Three.js)

- Free, properly licensed (CC-BY or CC0) **Toyota GR86** model in GLB format, target ≤ ~4 MB compressed; if no acceptable GR86 license is found, fall back to a comparable generic sports coupe and note it for the owner. License attribution recorded in `public/models/ATTRIBUTION.md` and site footer if required.
- Interactions: drag to rotate (OrbitControls, zoom/pan constrained), slow auto-rotate when idle.
- Wrap picker changes the body material's color + finish parameters (metalness/roughness/clearcoat; color-shift via iridescence or angle-dependent tint).
- Fallback: WebGL-unavailable or low-end devices get a static hero image instead; page content never depends on the 3D loading.
- Lazy considerations: model loads async with a loading indicator; page text renders immediately.

## Language: EN ⇄ 中文

- English is the default content in the HTML (indexed by Google).
- Header toggle swaps text via a JS translation dictionary (`data-i18n` attributes). Preference saved to `localStorage`.
- `lang` attribute updates on toggle.

## SEO

- Title/meta description targeting "car wrap Kota Kemuning", "car wrap Shah Alam", PPF/tint/coating keywords.
- Open Graph + Twitter card tags (good WhatsApp link previews).
- JSON-LD `LocalBusiness` (AutoRepair/AutoBodyShop type) structured data: name, address, hours, phone, geo, sameAs (Instagram/Facebook).
- Semantic HTML (h1/h2, alt text on gallery images), sitemap.xml + robots.txt.

## Assets & Placeholders

Owner will supply (placeholders until then, each swappable in one place — `src/config.js`):
- Phone/WhatsApp number (drives `tel:` and `wa.me` links)
- Exact street address + opening hours (drives the Google Maps embed URL)
- Logo file
- Hero background video (nanobanana 2 montage + real wrap clips; prompts in `docs/assets-brief.md`) + poster frame
- 6–10 gallery photos → `~/Downloads/youngwrap` then copied into the repo
- Charles Tee collab post URL (drives the Instagram iframe embed)

## Hosting & Repo

- Git repo pushed to GitHub; deploy via GitHub Pages (free) from the built `dist/` (GitHub Actions build on push).
- Optional later: custom domain pointed at GitHub Pages, or move `dist/` to Hostinger unchanged.

## Error Handling

- 3D: try/catch around WebGL init → static image fallback.
- Missing assets: gallery renders only existing images; contact buttons hidden-if-empty is NOT used — placeholders shown until real data arrives so layout is stable.

## Testing / Verification

- Local: `npm run dev` visual check; `npm run build && npm run preview` for the production bundle.
- Lighthouse pass for performance/SEO/accessibility (target: SEO ≥ 95, perf ≥ 80 mobile).
- Manual checks: wrap picker changes materials, language toggle swaps all strings, WhatsApp/tel links correct, mobile layout at 375px width.
