# Young Wrap — 3D Landing Site

Landing page for Young Wrap (car wraps, PPF, tint, coating — Kota Kemuning, Shah Alam) with an interactive Three.js car and live wrap preview. EN/中文.

## Develop
```
npm install
npm run dev
```

## Test / Build
```
npm test
npm run build && npm run preview
```

## Deploy
Push to `main` → GitHub Actions builds and deploys to GitHub Pages.
One-time setup: repo Settings → Pages → Source: **GitHub Actions**.

## Content
Shop data (phone, address, socials, KOL posts) lives in `src/config.js`; translations in `src/i18n/translations.js`.
