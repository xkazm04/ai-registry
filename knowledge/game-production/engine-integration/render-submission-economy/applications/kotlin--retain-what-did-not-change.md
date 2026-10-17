---
layer: application
type: application
subject: render-submission-economy
technique: retain-what-did-not-change
stack: kotlin
status: forged
verified_on: 2026-10-16
verified_against: kotlin@2.0.21
---

# Two retentions kept, one baked HUD layer refused at the pixel gate

Source tree: `firetv-deathride` on branch `deathride/main` at `e6ef6752`, read 2026-10-16; paths are
relative to its root. Kotlin 2.0.21 on libGDX 1.13.5, one render thread holding the GL context. The work is
the 10-06 optimize wave's render cards and the 10-08 device session P16 that graded the last two of them.
Desktop figures come from the host soak with `--profile` counters and are labelled desktop; device figures
are from one Fire TV stick (model AFTKM, Android 11, PowerVR GE9215) in profiled runs on a shared host.

## Kept: the minimap road line as a retained mesh

The race minimap pushed its 360-segment road line through the immediate shape renderer every frame. It is
now baked once per scene into a mesh that shares the road-mark shader:
`deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:15 "HUD minimap road lines: 360 centre-line segments and every branch, 6 vertices each, retained on the GPU."`
The card states both counts the change moved, the better and the worse, as the technique's seventh step asks:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:4 "legacy loop 14.98 us/frame"` (three
alternating pairs of 30 s desktop soaks) against
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:4 "mesh 9.87 us/frame; draw calls 24.3 -> 26.5"`.
The two extra draws come from splitting the shape pass around the mesh; a backlog card to remove them by
reordering the overlay waits on a visual decision. Desktop microseconds are not stick figures, and no device
run isolated this card.

## Kept: HUD text laid out only when a call changed

The glyph layer remembers the previous refresh's calls and skips layout when a call at the same position has
the same string, origin, colour and start:
`deathride/game/src/main/kotlin/dev/deathride/game/GlyphLayer.kt:47 "if(text is String && slot<previousCalls && starts[slot]==start && texts[slot]==text && xs[slot]==originX && ys[slot]==originY && colors[slot]==bits) { count=ends[slot];return }"`.
That is the technique's fifth step with its key listed from the code, not from memory. On the stick (P11, two
profiled 360 s runs) the HUD was ruled out as a cause of the frame tail:
`docs/concepts/deathride/P11-frame-tail.md:137 "HUD leads in 13 of 178, and each of those 13 had the thread off-CPU for"` most of the
frame, which points at preemption rather than at HUD work.

## Refused: the static HUD chrome baked into one texture

P16 tried the larger retention: the race HUD's frames, dial and icons baked into one framebuffer and drawn as
quads. It was faster on the stick,
`docs/concepts/deathride/P16-hud-layers.md:28 "Its hudMs is lower than base by 0.145 ms (-12%)"`, and it failed the
pixel gate:
`docs/concepts/deathride/P16-hud-layers.md:15 "337-409 by more than 1, max 30"` pixels per race frame. The cause is
the multisampled back buffer:
`docs/concepts/deathride/P16-hud-layers.md:3 "back buffer RGBA8888 with 2x MSAA"`, and
`docs/concepts/deathride/P16-hud-layers.md:25 "With 2x MSAA, a seam that falls inside a pixel takes one sample from each patch, while a"`
single-sampled bake takes only the patch under the pixel centre. Some of those pixels also carry a live bar's
edge, `docs/concepts/deathride/P16-hud-layers.md:27 "so even an MSAA bake could not make them exact."` The card was
reverted (`7dabb5c0`) and a pixel-exact form that retains the chrome's vertices instead of its pixels was put
to the owner as a question. This is the decision rule the technique gained from this session: a retained
picture is judged in the real multisampled target, and pixels baked at one sample are not the picture the live
draw makes there.

## Refused: fewer font pages, timing not shown

The sibling card merged the HUD's runtime fonts onto one page. It was exact and it saved what it promised:
`docs/concepts/deathride/P16-hud-layers.md:14 "**3 -> 2** in every frame of every run (fonts beats base)"`, font textures
5 to 2 MiB, text pixel diff 0 in six stick captures. Its deciding reading, fixed before the first graded run,
was HUD time, and the two runs disagreed:
`docs/concepts/deathride/P16-hud-layers.md:14 "fonts 1.166 / 1.616 ms vs base 1.182 / 1.183 ms: **not shown**"`.
It was reverted (`8443a99f`). The lesson for the technique's reporting rule is that a saving in flushes is a
count, and the frame cost it was meant to buy is a separate figure that has to show on the device.

## Deviations

- **No equivalence check run for the minimap mesh.** The card's gate is geometry and order identical to the
  immediate path by construction (the same float formulas), not a recorded comparison of vertex buffers; the
  technique's sixth step was not run as a mismatch count.
- **The text cache has no check run either.** The key is complete as read from the code, but no session rebuilt
  every skipped call and counted mismatches.
- **The baked layer's memory.** It added 3.31 MiB of owned textures, a residency cost the reverted card would
  have needed a row for.

## Outside corroboration

Headset platform guidance makes multisampled eye buffers the normal case: Meta says to "almost always use MSAA
in your apps for Quest devices, however you should not go over 4x MSAA sampling"
(https://developers.meta.com/vr/documentation/native/android/mobile-msaa-analysis/), which is why the refused
card's failure transfers to headsets with more force than on this stick's two samples. On submitting a static
layer once for two views, Meta's multiview guidance notes that sequential stereo "typically doubles the
application and driver overhead" and that with the extension "draw calls are instanced into each corresponding
element of the texture array" (https://developers.meta.com/horizon/documentation/native/android/mobile-multiview/).
No Death Ride VR or XR build exists, and nothing here was measured on a headset.
