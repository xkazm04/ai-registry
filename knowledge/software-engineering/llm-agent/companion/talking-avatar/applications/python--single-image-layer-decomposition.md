---
layer: application
type: application
subject: talking-avatar
technique: single-image-layer-decomposition
stack: python
status: forged
verified_on: 2026-10-18
verified_against: python@3.12
---

# Splitting light-on-black portraits as light — a glow-being rig

The athena-portable avatar spike (branch `worktree-spark-athena-avatar`, commit
`7eba8aee` for the glow path, `a0ac5923` for the painted-face path) split two
generated non-human portraits — a fibre-optic owl and an origami crystal bust,
1024x1024 each — into layers for a browser rig of about 1,000 lines with no
dependencies. Prep runs offline on CPU in 30-60 s per portrait; the runtime then
draws at 60 fps at 1080p (figures from one RTX 4090 desktop, headless Chromium,
2026-10-18, n = 2 portraits x 3 lines).

## The four modes, in code

The splitter reads the portrait as light and lifts elements front to back off a
working copy that is inpainted under each one:
`spikes/avatar/t1-rig/prep/split_glow.py:5 "additive delta  max(0, working - filled), alpha 0"`,
`spikes/avatar/t1-rig/prep/split_glow.py:6 "the element's own pixels, alpha = soft coverage x occl"`,
`spikes/avatar/t1-rig/prep/split_glow.py:7 "removed from the working copy and redrawn procedurally"`.
The regions are authored per portrait in a spec and refined from luminance
(`spikes/avatar/t1-rig/prep/split_glow.py:12 "regions are authored geometry, refined from luminance"`)
— the technique's "hand-authored region spec" route for light-on-black art,
confirmed.

- **Additive deltas.** `spikes/avatar/t1-rig/prep/split_glow.py:167 "delta = np.clip(work.astype(np.int16) - filled.astype(np.int16), 0, 255)"`,
  blended premultiplied at runtime: `spikes/avatar/web/src/glow.js:272 "gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);"`.
- **Radial window for a light that closes.** `spikes/avatar/t1-rig/prep/split_glow.py:82 "a light blob is radial: full inside 1.6 x the core"`
  and the shader fade: `spikes/avatar/web/src/glow.js:133 "closing iris: what lies beyond the closing radius fades"`.
- **Ring erased and redrawn analytically.** `spikes/avatar/web/src/glow.js:104 "halo ring, analytic so it stays whole when the head moves in front of it"`.
- **Sparse body silhouette from the original light.** `spikes/avatar/t1-rig/prep/split_glow.py:123 "silhouette from the original light, never from fill noise or erased parts"`
  with holes flood-filled: `spikes/avatar/t1-rig/prep/split_glow.py:127 "a sparse body of strands still occludes what is behind it"`.
- **One shared warp.** `spikes/avatar/web/src/glow.js:43 "head turn: orthographic sphere warp + per-layer depth"`.

## The painted-face path, for contrast

For human art the same spike used a matte, landmarks and an inpainter, and found
the face-sized-hole failure: hair behind the face is filled by pushing colour
inward and darkening it, not by the inpainter
(`spikes/avatar/t1-rig/prep/split_fallback.py:159 "bh_rgb[behind] = (push[behind].astype(np.float32) * 0.8)"`),
and the open distance is set per style
(`spikes/avatar/t1-rig/prep/split_fallback.py:233 "photo-like faces: a wide-open jaw drops ~20 % of mouth width"`).

## Measured result

`spikes/avatar/t1-rig/README.md:109 "fps p50 59.9 / p5 59.5-59.9, CPU 0.5-0.8 % of 16 cores, GPU process 128-130 MB"`.
Laptop integrated graphics were not measured; the technique's rule that an
unmeasured hardware class is reported as unmeasured applies.

## Deviations

- Region geometry is authored by hand per portrait. That is right for two
  portraits and is a cost per new portrait; a user-generated avatar would need an
  automatic region proposal before this path could serve onboarding.
- The operator's verdict was "T1 fails to move with origami": the decomposition
  held, the procedural motion on the stiff crystal form did not satisfy. The
  layer split was not the weak link; the motion source was.
