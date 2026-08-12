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

## Round 3 — assets for the panel redesign (2026-08-12)

Generate these whenever ready (nanobanana or camera). No people or faces in any of them. Deliver to `Downloads` as before; I'll convert to WebP and wire them in.

1. **About panel background** (replaces `images/car2.webp` if you want something wider)
   Prompt: "Ultra-wide cinematic photo of a dark automotive workshop interior at night, a freshly wrapped sports car in amber-orange vinyl under warm spot lighting, deep black shadows, no people, no logos, moody luxury garage atmosphere, 21:9, photorealistic"
2. **Process panel accent stills** (4 close-ups, 3:2, one per step)
   - "Macro photo of dozens of car wrap vinyl rolls stacked on a dark industrial shelf, a rainbow of colours — gloss amber orange, candy red, sapphire blue, viper green, magenta pink, pearl white, gunmetal grey, satin black, chrome silver, colour-shift purple-teal — glossy and matte finishes side by side, shallow depth of field with the amber orange roll in sharp focus, no people, no hands, photorealistic"
   - "Close-up of colour swatch fan of vinyl wrap samples lying on a dark carbon-fibre table, amber accent lighting, no people, photorealistic"
   - "Extreme close-up of a felt squeegee smoothing amber-orange vinyl over a car door edge, gloved fingertips barely visible at frame edge only if unavoidable — prefer tool-only crop, dramatic side light, photorealistic"
   - "Close-up of water beading on a freshly ceramic-coated glossy black car panel, dark background, single warm light streak, no people, photorealistic"
3. **Studio teaser background** (replaces `images/car8.webp` if desired)
   Prompt: "A sleek Japanese sports coupe in matte amber-orange wrap on a dark turntable stage, studio rim lighting, black void background, slight top-down angle, no people, no badges, 16:9, photorealistic"
4. **Optional: vertical detail clips** (9:16, 5–8 s each, for a future reels strip)
   Same style as the hero montage prompts in Round 2 (close-up wrapping process, no people/faces).

## Round 4 — video clips (2026-08-12)

### Two extra 4s hero clips (extend the closing car showcase)
Text-to-video, no reference image needed — the descriptions below carry the
style of the current closing shot. Target: 1280x720, 24fps, ~4s each,
no people, loopable-ish ends.

1. **Close-up rear orbit (GR86)**
   "Close-up slow orbit around the rear haunch of a matte black Toyota GR86
   sports coupe with subtle orange accents, in a dark empty showroom under a
   single overhead spotlight, reflections gliding across the rear fender,
   ducktail spoiler and taillight as the camera moves, very dark background,
   cinematic, loopable camera move, no people, no text, no watermark,
   4 seconds, 24fps"
2. **Close-up front dolly (GR86)**
   "Extreme close-up, low camera at bumper height slowly dollying along the
   front of a matte black Toyota GR86 sports coupe with subtle orange accents,
   headlight and front fender filling the frame, a single overhead spotlight
   in a dark empty showroom, reflections gliding across the hood, shallow
   depth of field, very dark background, cinematic, loopable camera move,
   no people, no text, no watermark, 4 seconds, 24fps"

Deliver as `wrapping7.mp4` / `wrapping8.mp4` in Downloads — I'll re-cut the
montage with them appended before the closing shot.

### Studio-teaser background video (replaces the Ken Burns placeholder)
The section already plays `public/videos/studio-teaser.mp4` (a temporary slow
zoom of the still). Text-to-video, no reference needed:
   "A Nissan GT-R R35 in matte amber-orange wrap standing on a dark circular
   turntable stage in a black void studio. The turntable rotates slowly and
   continuously, studio rim lighting sweeping across the matte orange body and
   rear wing as it turns, subtle reflections on the dark floor, deep shadows
   all around, seamless loop, cinematic, photorealistic, no people, no text,
   no watermark, 6 seconds, 24fps, 16:9"
Deliver as `studio-teaser.mp4` in Downloads — drop-in replacement, no code
change needed.
