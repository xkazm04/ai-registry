---
layer: application
type: application
subject: video-assembly
technique: generated-shot-sourcing
stack: react
status: forged
verified_on: 2026-08-31
verified_against: react@19
applied: simulation
ab_verdict: better
---

# React: a studio whose cut list cannot hold a cut

*Verified against the consuming tree at commit `7637553`, 2026-08-31.*

The technique's rung 3 gained an amendment this run: two anchors from
unmistakably different spaces do not interpolate and break — they render as a
**cut**, and the cost is that the cut lands inside the clip where the assembly
cannot reach it. This tree has no generative-video path at all, which makes it
the wrong place to test the affordance and an unusually good place to test the
cost. The finding is what its shape says without having been designed to say
anything.

## The seam

The studio walks scenes through phases — research, script, frames, score, cut
— and the cut phase's structural beats are derived, not authored by hand.
`app/_phases/cut/CutTimeline.tsx:41-47` finds the act-two marker by walking
the scene list in order, testing each scene's `mood` for `/turn/i`, and
accumulating `targetS` until it matches:

```
let atS = 0;
for (const sc of SCENES) {
  if (/turn/i.test(sc.mood)) return { atS, slug: sc.slug };
  atS += sc.targetS;
}
return null;
```

The decision the amendment governs — *how many cuts does one clip contain* —
is made here by default, and the default is one. `app/_studio/projectTypes.ts`
makes it structural rather than incidental: a `Scene` carries exactly one
`pickedFrameId: string | null`, and a `TimelineClip` is one span with one
`startS`, one `durS` and one `offsetMs`. There is no field anywhere that can
say a clip contains an edit.

## A and B, over three shipped cases

**A** — rung 3 as it stood: the anchors must be cut from one cloth, so a
two-world pair is a mistake and the producer is told not to make it.
**B** — the amended rung: a two-world pair is a documented third row that buys
coverage plus a transition for one render, gated on whether the assembly needs
to own the cut point.

The cases are the five scenes of the project the studio actually ships
(`app/_studio/scenes.ts`, 31 seconds, states deliberately uneven):

1. **The act-two turn.** `sc-3` is `EXT. ROOFTOP — NIGHT`, mood
   `"vertigo / turn"`, and it is the only scene the marker logic can match.
   Under B a producer could brief `sc-2 → sc-3` as one two-world generation —
   the crane cab as head anchor, the rooftop as the second reference — and buy
   the turn for one render. **Prediction: the marker breaks.** `atS` is
   accumulated over discrete scenes, so a merged clip either shifts the marker
   off 13s or removes `sc-3` from the list entirely, in which case the scan
   falls through and returns `null` — no act-two marker drawn at all.
   *Falsifier:* if the turn were derived from a timestamp or a marker on the
   clip, merging two scenes would not move it. It is derived from the scene
   enumeration.
2. **The readiness signal.** `sc-4 → sc-5` (`INT. HARBOR GATE — NIGHT` to
   `EXT. WATERLINE — DAWN`) is the largest world gap in the project and the
   story's release beat — precisely the third row's case. `sc-5` is also the
   one scene with `pickedFrameId: null`, and that null is the only readiness
   signal the model carries. **Prediction: a clip spanning both leaves `sc-5`
   permanently unpicked while its footage exists** — the project reports
   incomplete when the cut is done, and no gate catches it, because per-scene
   picks are the whole instrument. *Falsifier:* readiness computed from
   timeline coverage rather than per-scene picks would not fire.
3. **The sync bench.** `TimelineClip.offsetMs` is written by the Cut's drift
   correction and moves the whole block on the ruler. A clip carrying an
   internal cut holds two shots against one offset. **Prediction: drift
   becomes uncorrectable** — if the model's cut lands early against the
   narration written for those beats, the operator can nudge the clip and
   cannot move the cut inside it. *Falsifier:* a timeline that could split a
   clip, or a pipeline that re-rendered instead of nudging. `TimelineClip` has
   no split.

## Verdict: better

All three predictions are read off shipped code and shipped data rather than
off a run, and the amendment answers all three with its own question — *does
the assembly need to own this cut point?* Here it does, three times over, and
for three unrelated reasons.

The reason this is `better` rather than `no change` is narrower than the three
cases. Rung 3 as it stood already told a producer not to pair two worlds. It
gave the right answer for the wrong reason — *it will break* — and that reason
does not survive contact with a two-world pair that comes back looking good,
which is exactly what the source demonstrating this had. An accidental
prohibition converts to a stated trade, and the trade is the part that holds.

## What the tree could not have been built to prove

This studio has no video generation. Nothing in `lib/` builds a motion request,
there is no frame-anchor code anywhere in the tree, and the cut phase assembles
over frames and score. It could not have been designed to demonstrate anything
about anchor pairs.

It demonstrates the amendment's cost anyway, structurally: **a clip that
contains its own cut is unrepresentable here.** One scene, one picked frame,
one span, one offset. The assembly owning every cut is not a policy this
project chose and could revisit — it is a shape, and a generated clip with an
edit inside it would enter the timeline as an atom, pass every instrument, and
be invisible to all three of the checks above. That is better evidence for the
amendment's warning than an adopting tree would have produced, because nobody
arranged it.

## What this realization cannot do

Nothing here was executed. The mode is simulation because the affordance half
has no seam in this fleet — neither media-generation project has a generative
video path — and the cost half cannot be run without one. The three
predictions are falsifiable and each names its falsifier, but they are
reasoning over a shipped tree, not measurements of it. Re-test as `code` when
the studio grows a motion-request path with frame anchoring.
