# Young Wrap — Assets Brief

Everything the site needs from the owner, and the generation prompts for nanobanana 2.

## Checklist

| Asset | Target file | Status |
|---|---|---|
| Hero background video (10–20 s loop, 16:9, ≤ 8 MB) | `public/videos/hero.mp4` | pending |
| Hero poster frame (first frame as JPG) | `public/videos/hero-poster.jpg` | pending |
| Logo (transparent PNG or SVG) | `public/img/logo.png` | pending |
| 6–10 gallery photos | `public/img/gallery/*.jpg` | pending |
| Phone/WhatsApp number | `src/config.js` | pending |
| Street address + opening hours | `src/config.js` | pending |
| Charles Tee collab post URL | `src/config.js` | pending |

## Hero video — recommended recipe

Best result = **real shop clips as the backbone, AI b-roll as filler.** Real wrapping footage of the actual shop builds trust; AI clips fill gaps where no footage exists. Aim for 4–6 snippets × 2–3 s each, hard cuts, exported 1920×1080, H.264, muted, loopable (last shot flows back into the first). Keep overall exposure DARK — white text must stay readable on top.

### Prompt A — image-to-video (use brother's photos as input frames)

> Cinematic slow-motion shot inside a dark professional car wrap studio, moody low-key lighting with warm orange rim light. The subject from the reference photo works on a sports car panel, smoothing matte vinyl wrap with a squeegee, sparks of reflected orange light on the car body. Shallow depth of field, dark charcoal background, embers of orange bokeh. Color palette: deep black, warm orange (#FF6B00) accents, white highlights. Slow dolly-in camera move, 24 fps film look, high contrast, no text, no watermark, underexposed background suitable for white text overlay.

### Prompt B — text-to-video b-roll (no reference image needed)

Generate several variations, one per line — each is a standalone 2–3 s clip:

> Extreme close-up, slow motion: gloved hands peel bright orange vinyl wrap film off its backing paper, film catches warm studio light, dark background, cinematic shallow depth of field, orange and black color palette, no text.

> Macro shot: heat gun softens vinyl wrap over a car fender curve, faint heat shimmer, dark moody garage lit by a single warm orange practical light, cinematic film grain, no text.

> Slow orbit around a matte black Toyota GR86 sports coupe with subtle orange accents in a dark showroom, single overhead spotlight, reflections gliding across the body, very dark background, cinematic, loopable camera move, no text.

> Close-up squeegee glides across freshly applied gloss vinyl on a car door, water beads scatter, warm orange rim lighting against near-black shadows, slow motion 120 fps look, no text.

### Prompt C — poster frame (image, not video)

> Cinematic still: dark car wrap studio, matte black sports coupe under a warm orange spotlight, heavy black vignette, deep shadows, orange (#FF6B00) rim light on the car silhouette, room for large white text on the left half, 16:9, photorealistic, no text, no watermark.

### Assembly tips

- Order clips: peel film → heat gun → squeegee → car orbit (hero shot last, loops into peel).
- Any free cutter works (CapCut/iMovie): hard cuts only, no transitions, export 1080p ~5 Mbps, **strip audio**.
- If a clip comes out too bright, darken it — the headline sits on top.

## Gallery photos

Pick 6–10 best finished-car shots from @young.wrap. Landscape orientation preferred, ≥ 1200 px wide. Drop originals in `~/Downloads/youngwrap`; they get resized/compressed into the repo during implementation.
