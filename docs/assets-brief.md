# Young Wrap — Assets Brief

Everything the site needs from the owner, and the generation prompts for nanobanana 2.

## Checklist

| Asset | Target file | Status |
|---|---|---|
| Hero background video (10–20 s loop, 16:9, ≤ 8 MB) | `public/videos/car-wrapping.mp4` (overwrite) | rough clip in place — montage pending |
| Hero poster frame (first frame as JPG) | `public/videos/hero-poster.jpg` | pending |
| Gallery photos | `public/images/car1–10` | ✅ supplied (webp conversion in plan Task 4) |
| Charles Tee collab post URL | `src/config.js` → `kol.postUrl` | ✅ confirmed by owner |
| GR86 3D model | `public/models/` | ⚠️ supplied model is CC-BY-NC (non-commercial) — cannot ship; see plan Task 3 |

**Note from owner:** hero video must NOT show the owner's brother (or any recognizable person) — close-up wrapping process shots only.

## Hero video — recommended recipe

Best result = **real shop clips as the backbone, AI b-roll as filler.** Real wrapping footage of the actual shop builds trust; AI clips fill gaps where no footage exists. Aim for 4–6 snippets × 2–3 s each, hard cuts, exported 1920×1080, H.264, muted, loopable (last shot flows back into the first). Keep overall exposure DARK — white text must stay readable on top.

### Text-to-video prompts — close-up process only, NO people/faces

Generate each line as its own standalone 2–3 s clip. Every prompt deliberately frames hands/tools/surfaces only:

> Extreme close-up, slow motion: gloved hands peel bright orange vinyl wrap film off its backing paper, film catches warm studio light, dark background, cinematic shallow depth of field, orange and black color palette, hands and film only, no face, no person visible beyond gloves, no text, no watermark.

> Macro shot: heat gun softens vinyl wrap over a car fender curve, faint heat shimmer rising, dark moody garage lit by a single warm orange practical light, cinematic film grain, tools and car surface only, no people, no text, no watermark.

> Close-up: felt-edge squeegee glides across freshly applied gloss black vinyl on a car door, micro air bubbles vanish behind it, warm orange rim lighting against near-black shadows, slow motion 120 fps look, gloved hand only, no face, no text.

> Macro slow motion: sharp blade trims excess matte vinyl along a car panel edge, clean cut line revealing perfect wrap edge, dark background with orange accent light, gloved fingertips only, no person, no text.

> Extreme close-up: iridescent color-shift vinyl flexes and catches light, hues rolling from orange to deep purple across the film surface, black void background, cinematic, abstract, loopable, no hands, no text.

> Slow orbit around a matte black Toyota GR86 sports coupe with subtle orange accents in a dark empty showroom, single overhead spotlight, reflections gliding across the body, very dark background, cinematic, loopable camera move, no people, no text, no watermark.

### Prompt C — poster frame (image, not video)

> Cinematic still: dark car wrap studio, matte black sports coupe under a warm orange spotlight, heavy black vignette, deep shadows, orange (#FF6B00) rim light on the car silhouette, room for large white text on the left half, 16:9, photorealistic, no text, no watermark.

### Assembly tips

- Order clips: peel film → heat gun → squeegee → car orbit (hero shot last, loops into peel).
- Any free cutter works (CapCut/iMovie): hard cuts only, no transitions, export 1080p ~5 Mbps, **strip audio**.
- If a clip comes out too bright, darken it — the headline sits on top.

## Gallery photos

Pick 6–10 best finished-car shots from @young.wrap. Landscape orientation preferred, ≥ 1200 px wide. Drop originals in `~/Downloads/youngwrap`; they get resized/compressed into the repo during implementation.
