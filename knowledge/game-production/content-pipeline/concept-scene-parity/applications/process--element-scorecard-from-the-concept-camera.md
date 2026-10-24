---
layer: application
type: application
subject: concept-scene-parity
technique: element-scorecard-from-the-concept-camera
stack: process
status: forged
verified_on: 2026-10-25
applied: task
ab_verdict: better
---

# Process: a fifteen-element scorecard for a VR light table

bp is a public project whose VR app (`apps/vr`, Unreal Engine 5.8 on the forward VR path)
is meant to come to read as one generated concept image: a backlit blueprint table in a
dark drafting studio, with a lamp-shaped agent, amber pins and a wrist panel. Its scorecard
is a document rather than code, so this is a `process` application. Read at bp commit
`d8b1fea` on 2026-10-25.

## The element list, written once

The decomposition lives in its own file and was written before any score:
docs/concepts/vr-light-table/art-breakdown.md:3 "The target image (`target-light-table.jpg`) is the bar."
Fifteen rows, each with what the image shows, what it is in the product, and a "Built as"
column (data, procedural, generated, shader). That column is the technique's build
column, and it is already a first guess at the capping stage.

The four-level scale is stated in words beside the list, together with who scores and
what a machine score is worth:
docs/concepts/vr-light-table/art-breakdown.md:65 "is scored 0 to 3 by the owner, with a vision-model pre-score as advice only"
The same file sets the bar as a minimum per element, not a total:
docs/concepts/vr-light-table/art-breakdown.md:72 "Pass: no element below 2, and elements 1, 4, 7, 9, 10 and 11 at 3."
That is the scene-scale form of "no average hides a failure", and it is the strongest
thing in the realization.

## The cheat column

The concept's cheats are written down as a section of the list rather than dropped:
docs/concepts/vr-light-table/art-breakdown.md:31 "## Where the image cheats, and what the build does instead"
invented labels, a dozen furnished wings at one zoom, decorative percentages and, the one
that matters most for a device, docs/concepts/vr-light-table/art-breakdown.md:40 "**The light is a painting.** The concept has bounce light everywhere."
The style block records a cheat the headset can never show:
docs/concepts/vr-light-table/art-breakdown.md:51 "shallow depth of field at the far edge"
**Deviation:** the section names the cheats but gives no per-element device ceiling, so the
feasibility question (40 of 45, asked by the owner) could not be read against a stated
attainable maximum and was argued from estimates instead.

## A scored round, read by name

The first scored round is in the run note:
docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md:27 "The scores are the Director's reading, 0 to 3, of each art-breakdown element:"
Unbuilt elements score 0 and stay in the list, as the technique requires:
docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md:45 "| 7 | Amber pins with tags | 0 | **0** | Not built (L5) |"
The total is present and is immediately followed by the named zeros:
docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md:54 "| | **Total** | **5 / 45** | **19 / 45** | |"
docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md:56 "The total does not hide the failures. Four elements are still 0:"
One gap is attributed to a stage in the same note, which is cap attribution arriving early:
docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md:72 "This is the data, not the renderer"
And the frame cost sits beside the look, as the headset-budget boundary requires:
docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md:90 "At the target pose the p50 is 144 draws against the P4 budget of 150"

## Estimates against the measured round

A one-day fidelity sprint followed (2026-10-24). Five research reports estimated what each
stage could add; they live in the session scratchpad, not the tree, and are cited by name
only. The UE-fidelity report put the reachable total at 38 to 42 of 45. The Blender and
image-generation reports each estimated their own stage's lift (about +5 to +7 and +4 to
+6). The audit report ranked levers by gain per effort and said 40 was reachable only if
the lamp agent and the studio both reached 3, adding that nothing produced so far showed
the art pipeline could deliver a 3. Four builders then worked one day. The builders read
the result at 28 of 45; the owner read it at "about 25-30".

This is the run behind the technique's claim that ceiling estimates rank levers and do not
predict totals. **Upward lesson, taken into the technique:** the estimate that held was the
one conditioned on the weakest stage's demonstrated output.

## The verdict, and how far it binds

`ab_verdict: better` comes from the intake run `intake-vr-fidelity-20261024`, pair 4 (the
whole scene before and after the sprint, from the concept's camera). **It is unblinded**:
the owner answered in words ("Whole scene improved, about 25-30 I would say") and the
director mapped the words onto arms. It judges the scene the scorecard steered, not the
scorecard as an instrument; no arm compared a sprint run without one.

## Deviations recorded

- No per-element ceiling or device-ceiling column, as above.
- The run note's scores are the Director's reading and the later 28 is the builders'; the
  owner's 25 to 30 is a total, not per element, so the per-element series stops being the
  judge's after the first round.
