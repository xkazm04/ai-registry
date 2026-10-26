---
layer: application
type: application
subject: generative-artifact-gating
technique: declare-the-producer-per-asset-class
stack: process
status: forged
verified_on: 2026-10-26
applied: experiment
ab_verdict: not-better
---

# A paired trial: a commercial image-to-3D service against scripted props

bp (public, github.com/xkazm04/bp), read at `6bc4f02` on 2026-10-26. It builds the props for its
VR light table by script in a headless modelling tool. On 2026-10-25 it ran a capped trial of a
commercial image-to-3D service against two scripted classes:
- furniture glyphs, about 5 cm tall, seen at about 30 pixels from the player's eye;
- the light-table frame, seen up close where the hands rest.

The service is named here because this layer allows it: the trial used Tripo's v3 API through a
logged, capped client.

## The two producers, as the tree declares them

The frame is constructed, with its slots kept separate:

scripts/art/light-table-frame/build_frame.bpy:6 "Procedural only: no generated input, no GPU job."
scripts/art/light-table-frame/build_frame.bpy:11 "The glow strip and the glass keep"

The glyphs are constructed, with exaggerated proportions for their viewing size:

scripts/art/build_art.bpy:121 "is a 2:1 maquette vignette about 4.4 x 2.1 cm and 1.3 to 2.4 cm tall, near 1:40, with the heights and the thin members"

The trial client refuses any call over its cap and logs each one:

scripts/lookdev/tripo.mjs:17 "// Spend: a task is refused before any network call when its estimate (PRICES, the published table) is over --cap, or"

The log holds 18 calls and 695 credits (one credit is one US cent), each with the credits the
service reported. Every call matched the published price table.

## The arms and what came back

All renders used the same camera, lights and the additive glass material, at the true viewing
distance and leaning in.

| Class | Generated route (credits) | Result against the scripted asset |
| --- | --- | --- |
| Meeting table glyph | single image, low-poly mode (30) | lost the tabletop: reject |
| Meeting table glyph | front and side views, low-poly mode (30) | chairs with legs; better per glyph |
| Meeting table glyph | high-detail generation, then the service's retopology to 856 triangles (75) | watertight, five clean parts; best generated |
| Desk, sofa set, oval table | reference image, high detail, retopology to about 800 (85 each) | real furniture close up; 24 to 46 non-manifold edges; lower and flatter than the scripted glyphs |
| Light-table frame | reference image, high detail with textures, retopology to 8,000 (105) | one fused part, 0.75 m tall against 0.95, 111 non-manifold edges, glow painted into the texture: same to worse |

Delivered triangle counts overshot every request (800 asked, 808 to 879 delivered). Every
generated mesh needed stray faces removed, re-orientation, rescaling and the project's own
materials before it could stand in the scene.

## Verdict: not-better as a replacement, better as a route for one class

- Target: an asset class that reads better at the player's distance for the money.
- Floor that must hold: the frame's separate emissive slot and its specified dimensions.

The frame failed the floor. The glyphs were better leaning in, and not significantly better at
about 30 pixels. Overall the generator is not a replacement, so the verdict is `not-better`. The
trial then wrote the declaration the technique asks for:
- small furniture and props read close up may be generated, then retopologised by the service
  and cleaned by script;
- the frame, the room cells and the paper stay scripted, because they need exact profiles,
  separate emissive parts or plan data.

The untested combination, generated furniture scaled with the scripted glyphs' exaggerated
heights, is the next arm.

## What else the trial found

The side-by-side render exposed a defect in the scripted frame, unrelated to the generator: black
streaks in its baked rim. They were fixed by re-baking with the rim unwrapped analytically. A
paired trial reads both arms, and the incumbent is not exempt.
