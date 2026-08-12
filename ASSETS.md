# Assets

## 3D model
- `public/models/car.glb` — "FREE 1975 Porsche 911 (930) Turbo" by Lionsharp Studios, from Sketchfab: https://sketchfab.com/3d-models/free-1975-porsche-911-930-turbo-8568d9d14a994b9cae59499f0dbed21e (profile: https://sketchfab.com/lionsharp). License: **CC-BY 4.0** — commercial use allowed, attribution required; credit line in both page footers. Downloaded by the owner (2026-08-12, source in gitignored `assets-src/models/free_1975_porsche_911_930_turbo/` with its license.txt), then optimized with `@gltf-transform/cli optimize --compress quantize --texture-compress webp --texture-size 1024 --simplify false` (74.2 MB → 6.4 MB). Its `paint` material is matched by the explicit `/body|paint/i` rule in `src/three/carViewer.js`, so wrap swatches recolor the body shell only.
- Previous model: "Mazda RX-7" by IvOfficial (CC-BY 3.0, Poly Pizza https://poly.pizza/m/SnIoWlh7S2). No longer shipped; kept here as history.
  - Chosen as a substitute for a Toyota GR86/GT86/Subaru BRZ: no commercial-safe (CC0/CC-BY) GR86-family model with a no-login download path was found (see "GR86 model search" below for candidates and why they were rejected). The RX-7 is a comparably-proportioned Japanese RWD sports coupe with a cleanly separated body-paint material, so wrap-color swatches apply correctly to the body only (glass, rims, black trim, and badge/logo decals are untouched).
  - Previous model: "Sports Car" by Quaternius (CC0), from the Cars Bundle on Poly Pizza: https://poly.pizza/m/1mkmFkAz5v (bundle: https://poly.pizza/bundle/Cars-Bundle-FE5IWe6OMk). Kept only as history here; no longer shipped.

### GR86 model search (for the record)
- Sketchfab has several CC-BY (attribution) Toyota GR86/GT86 models confirmed downloadable via the public API (e.g. "Toyota GR86 (ZN8)" by Car2022, "Toyota GT86 3D Model (Free)" by mpgs.studio, "GR86" by sr._suave_edits, "toyota gt 86" by klikker228666) — but Sketchfab's actual file download endpoint requires an authenticated session (`Authentication credentials were not provided`), which was not available in this environment. Not used.
- The owner's existing `assets-src/models/2021_pandem_gr86_v1_aero_kit/` (Ddiaz Design, Sketchfab) is CC-BY-NC-SA-4.0 — non-commercial only. Left on disk (gitignored), not wired up, not committed.
- Poly Pizza's "Toyota AE86" by IvOfficial (CC-BY 3.0, https://poly.pizza/m/ZEFWmOPSgh) was also downloaded and inspected, but its body and all four wheels share a single baked "Body" material/texture — recoloring the body would also recolor the wheels, which fails the "swatches must not touch wheels/glass" requirement without repainting the model (out of scope). Rejected in favor of the RX-7's properly separated materials.
- If an actual GR86/GT86/BRZ is wanted later: either (a) buy a royalty-free-licensed model (Sketchfab Store/CGTrader, ~USD 10–50) — several already-modeled options showed in search — or (b) log into Sketchfab and download one of the CC-BY models listed above (credit the author in this file and the footer), or (c) message Ddiaz Design for written commercial permission to use the Pandem GR86 kit already on disk.

## Logo
- `public/logo/yw.jpg` — official Young Wrap logo (from owner). Brand orange `#FA9C20` sampled from it → `--orange` in `src/styles/main.css`.

## Gallery
- 10 real car wrap photos shipped as WebP: `public/images/car1–10.webp`.

## KOL / Influencer collaboration
Wired to `SHOP.kols` in `src/config.js` (2026-08-12):
- Charles Tee `@charlest33` — post `https://www.instagram.com/p/DbX3XIbO2lg/`
- Mike Faizi `@mikefaizi` — reel `https://www.instagram.com/reel/DYPGSOISZRm/`
- Livvie `@livvie` — reel `https://www.instagram.com/reel/DYCh2shy5m3/`

Done: phone ✓, address ✓, hours ✓ (Mon–Fri 10–7, Sat 10–3, Sun closed), logo ✓.
