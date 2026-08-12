# Hero montage build recipe

Source: six owner clips at `assets-src/videos/wrapping1.mp4` … `wrapping6.mp4`
(gitignored source material — never commit them).

All six clips are landscape 1280x720 @ 24fps, ~4.04s each, so the
`scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080` step is a
pure upscale for every clip (source aspect ratio already matches 16:9 target) —
no important content is cropped away.

## Per-clip inspection

Each clip was probed with `ffprobe` for duration/orientation, then sampled at
t = 0.0, 0.3, 0.6, 1.0, 2.0, 3.0s (grid contact sheets) to check for junk
opening frames (black/blur/shake) before picking a trim offset.

| Clip | Content | Opening check | Chosen `-ss` |
|------|---------|----------------|--------------|
| wrapping1 | Orange gloss wrap film close-up, gloved hands | Good from frame 0 | `0` |
| wrapping2 | Matte black hood, heat-gun forming | Good from frame 0 | `0` |
| wrapping3 | Squeegee on gloss black panel, torch light | Good from frame 0 | `0` |
| wrapping4 | Blade trimming excess film | First ~0.5s is static/empty (no hand/blade in frame); blade enters ~t=0.3-0.6 | `0.6` (shifted to lead with the trim action) |
| wrapping5 | Color-shift (orange→purple) wrap reveal on body curve | Good from frame 0 | `0` |
| wrapping6 | Full-car studio reveal, matte black GR86/BRZ, top light + rotation | Good from frame 0 | `0` (used as closing shot) |

## Build commands

```bash
mkdir -p /tmp/montage

# seg1 — wrapping1, -ss 0
ffmpeg -y -ss 0 -t 2.5 -i assets-src/videos/wrapping1.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p /tmp/montage/seg1.mp4

# seg2 — wrapping2, -ss 0
ffmpeg -y -ss 0 -t 2.5 -i assets-src/videos/wrapping2.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p /tmp/montage/seg2.mp4

# seg3 — wrapping3, -ss 0
ffmpeg -y -ss 0 -t 2.5 -i assets-src/videos/wrapping3.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p /tmp/montage/seg3.mp4

# seg4 — wrapping4, -ss 0.6 (skip the empty opening, lead with the blade entering frame)
ffmpeg -y -ss 0.6 -t 2.5 -i assets-src/videos/wrapping4.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p /tmp/montage/seg4.mp4

# seg5 — wrapping5, -ss 0
ffmpeg -y -ss 0 -t 2.5 -i assets-src/videos/wrapping5.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p /tmp/montage/seg5.mp4

# seg6 — wrapping6, -ss 0
ffmpeg -y -ss 0 -t 2.5 -i assets-src/videos/wrapping6.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p /tmp/montage/seg6.mp4

printf "file '/tmp/montage/seg%d.mp4'\n" 1 2 3 4 5 6 > /tmp/montage/list.txt
ffmpeg -y -f concat -safe 0 -i /tmp/montage/list.txt -c copy public/videos/hero-montage.mp4
ffmpeg -y -i public/videos/hero-montage.mp4 -frames:v 1 -q:v 3 public/videos/hero-poster.jpg
ls -lh public/videos/
```

## Result

- `public/videos/hero-montage.mp4` — 6 segments × 2.5s = 15.0s total, 921 KB
  (well under the 8 MB target; crf 30 was sufficient, no need to raise to 32).
- `public/videos/hero-poster.jpg` — first frame of the montage (wrapping1 at
  t=0), dark orange-on-black, consistent with the montage's dark-leaning
  exposure.
- Hard cuts between all 6 segments (concat via `-c copy`, no crossfade/transition).
- No audio (`-an`) — hero video is muted/looped background footage.

## Retiring the old hero video

The previous single-clip hero (`public/videos/car-wrapping.mp4`, 5.7 MB,
tracked) was moved to `assets-src/videos/car-wrapping.mp4` (gitignored source)
and removed from git tracking (`git rm`) once `index.html` was repointed at
`videos/hero-montage.mp4` with `poster="videos/hero-poster.jpg"`.
