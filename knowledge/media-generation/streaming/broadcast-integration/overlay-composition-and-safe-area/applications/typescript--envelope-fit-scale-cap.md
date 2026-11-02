---
layer: application
type: application
subject: overlay-composition-and-safe-area
technique: envelope-fit-scale-cap
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0.3
---

# Envelope fit with a scale cap — Castle Control overlay renderer (TypeScript)

Castle Control (main at `8ef2d8ecd1aa0ea4a47c6ce139e9d3ee885a1db5`, TypeScript 6.0.3 per
`package.json:26 "typescript": "6.0.3"`) renders its Beacons overlays — designs the
streamer authors as data packages — in OBS browser sources through one renderer class. The
renderer is a clean realization of the technique; two server-rendered overlays beside it
are not.

## The fit, exactly as the technique states it

- `packages/renderer/src/overlay.ts:83 "const scale = Math.min(this.display.scale, width / bounds.width, height / bounds.height);"`
- `packages/renderer/src/overlay.ts:85 "const x = anchor === 'center' ? 0.5 : anchor.endsWith('r') ? 1 : 0;"` and
  `:88 "this.root.style.setProperty('--scene-x', \`${(width - bounds.width * scale) * x}px\`);"` — the scaled
  envelope is placed at the anchor inside the viewport.
- `packages/renderer/src/overlay.ts:62 "resize(width: number, height: number): void {"` — refits on every viewport
  change, which is what the embedded browser does when the streamer resizes the source.
- `apps/overlay/README.md:81 "Scale multiplies logical pixels, capped by the scale needed to keep the entire"` and
  `:85 "Default scale does not enlarge small artwork."` — the documented contract.

**Upward lesson taken into the technique:** the envelope is not the current frame.
`apps/overlay/README.md:62 "layer scales and the extrema of intensity bindings. It keeps that envelope stable"`
— the renderer fits the union of every state an intensity-driven design can animate into,
including layers at negative offsets, so the overlay does not refit and pump as a
contribution meter grows.

## The badge rides the same geometry

The SIMULATED provenance badge is built beside the fit (the
`provenance-badge-opposite-corner` technique in this subject):

- `packages/renderer/src/overlay.ts:58 "// Scene-owned chrome stays outside the package's replaceable layer list."` — no
  streamer-authored design can drop or cover it (upward lesson).
- `packages/renderer/src/overlay.css:29 "[data-simulated-badge][data-anchor=\"bl\"],"` through `:32` — the badge flips to the
  corner opposite the anchor; `apps/overlay/README.md:87 "anchors it uses the diagonally opposite viewport corner"`.
- `apps/overlay/README.md:102 "stream error the renderer clears its layers, bindings, diagnostics and SIMULATED"` — the
  badge clears with the content.

Deviation, admitted in the repo's own words at `apps/overlay/README.md:89 "smaller than half the viewport; full-frame artwork can still reach the badge."`:
the badge is placed against the *viewport*, not the fitted envelope, so in the full 1080p
source the product creates it lands in a far canvas corner rather than beside the art.

## Where the fit is missing

The two overlays rendered by the Rust core size themselves in viewport units and hide
overflow instead of computing a capped scale:

- `crates/cc-core/src/overlay/vote_bar.rs:75 "width:min(90vw,calc(60vw * {scale})); max-height:90vh; overflow:hidden;"`
- `crates/cc-core/src/overlay/lots.css:4 "width: min(100%, calc(70vmin * var(--draw-scale)));"` with `overflow: hidden` on the same rule.

Both cap width but not height against content, so a long ballot or a winners list taller
than the box is cropped rather than shrunk — the "crop with a nicer default" the technique's
decision rules name. The same two pages also break the stream-background rule: the vote bar
is a pale card (`vote_bar.rs:75 "background:var(--paper)"`, `--paper:#F4F0E6` in
`packages/tokens/src/generated.css:3 "--paper:#F4F0E6;"`), and the lot plate is dark ink on a transparent
background (`lots.css:1 "background: transparent;"`), which is what the 2026-11-02 filming evidence recorded
as "plain light cards over black read as broken". Moving both onto the renderer's fit, with
a panel of their own, closes both gaps.
