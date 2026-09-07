---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: scene-partition-is-the-gated-unit
status: forged
laws: [an-instrument-proves-it-had-input, a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
use_when: [one source image is meant to yield several assets, gating a reconstruction that decomposes a scene into parts, a generated scene came back looking complete and something is missing from it, deciding what a scene-mode reconstruction gate actually judges]
---

# The scene partition is the gated unit

## The concern

The sibling isolation rule ends by naming this case and declining it: environment or scene
reconstruction, where the whole frame is the subject, is a *different problem with a
different rubric*. This is that rubric, and it exists because the reconstruction stopped
requiring one subject per image. A scene-mode reconstruction takes a busy frame and returns
several separate objects plus a background, and the five input criteria have nothing to run
on when it does — not because they are wrong, but because they take a **unit** as given, and
here the unit does not exist until the tool makes it.

That is the whole of the difference and it is worth stating flatly. In single-subject
gating, the image *is* the unit; the gate's question is whether that unit reconstructs. In
scene gating the tool first cuts the frame into regions, and only then is there anything to
score. So a gate that runs the five criteria against the source frame is scoring an object
that will never be reconstructed, and a gate that runs them against each region has skipped
the only check that is new: **whether the cut accounted for everything.**

Both of the gates this subject already designs — the input gate here, and the output gate
that grades the mesh that comes back — operate on things that exist. A part of the frame
that no region selected produces no reconstruction input, therefore no mesh, therefore
nothing for either gate to fail. It is not scored badly. It is not scored. A scene missing
a third of its content passes both ends of the pipeline with every verdict green, and the
first person to notice is whoever opens the result and counts.

## The three states a frame's area can be in

The partition is only checkable if its output states are closed, and there are three, not
two. Every part of the source frame is exactly one of:

- **A region** — selected, extracted, and headed for reconstruction as its own asset.
- **Backdrop** — deliberately not an object, carried as whatever the pipeline uses for
  things that are only ever seen and never edited or collided with.
- **Residue** — selected by nothing and claimed by nothing.

Residue is the state the naive implementation does not have, and its absence is what makes
the failure silent. A partition reported as "7 objects extracted" is not a measurement of
the frame; it is a count of successes with no denominator. Report the three states or the
gate is describing something other than the image it was given.

## The procedure

Run in this order. Steps 1 and 2 are the part that does not exist in the single-subject
lane, and they are the part that pays.

1. **Declare the expected inventory before decomposing, from the brief.** What assets is
   this frame supposed to yield? This is the same discipline the isolation rule already
   applies to a held prop — ask what the asset list says, not what the picture looks like —
   and it moves upstream here, because it is the only expectation the coverage check can be
   run against. Derived after the fact from what the tool returned, the check is circular
   and always passes.
2. **Run the coverage check on the partition, before scoring any region.** Every declared
   inventory item resolves to exactly one region; every region resolves to an inventory
   item, or is explicitly marked backdrop, or is explicitly discarded with a reason. Any
   unresolved item on either side is a finding. An empty or near-empty partition is a loud
   failure and never a clean pass — a decomposition that returned two regions over a frame
   briefed for nine has not gated well, it has not run.
3. **Score each region on the extracted crop, never on the source frame.** The reconstruction
   sees the crop. Isolation, silhouette, lighting and legibility are all properties of what
   was cut out, and a region that reads cleanly in the composed frame can be a fused blob
   the moment it is separated from the objects that were giving it its edges.
4. **Route a failing region to the partition first, not to the image.** This lane has a
   repair channel the single-subject lane does not: the boundary is adjustable and the
   region can be re-extracted without touching the source. Adjusting the cut is cheaper than
   every other remedy in this subject, and it is the first thing to try — but only once. A
   region that fails the same criterion after a boundary correction is failing on the
   content, and further boundary work is a way of not deciding.
5. **Compose the frame verdict as the minimum over regions, plus the coverage verdict as its
   own line.** Never an average. An average lets one cleanly-extracted hero object carry a
   region that will come back unusable, and it cannot express a missing object at all,
   because a missing object contributes no term.

## Decision rules

- **Occlusion is this lane's frame-edge hard fail, and it has no single-subject analogue.**
  In an isolated input, a subject clipped by the border is a hard fail because nothing
  downstream restores truncated volume. In a scene, objects occlude each other by
  construction — the barrel behind the crate is missing the same evidence, for the same
  reason, and no crop or re-extraction recovers it. So occlusion depth is a scored criterion
  here, not an incidental one, and a region occluded past the threshold is refused or
  demoted to backdrop. It is the dominant defect class of scene inputs, and the isolation
  rubric does not contain it because an isolated subject cannot have it.
- **Never score the backdrop on object criteria.** It is gated on being seen, at the angles
  the shot actually uses, and on nothing else. Applying silhouette or legibility thresholds
  to it manufactures failures for a thing whose job is to be looked at from one side, and
  the pipeline learns to ignore the gate.
- **A region promoted from backdrop, or demoted to it, is re-gated.** The two have different
  criteria, so the verdict does not travel with the region across that boundary. A verdict
  is bound to the content it judged, and the content changed category.
- **Discarding is a decision that gets recorded.** "This part of the frame becomes nothing"
  is frequently correct — clutter, crowd, a rendered logo. It is correct once someone said
  so. Silent discard and residue are the same state seen from two sides, and the whole point
  of the three-state model is that they are told apart.

## Recording the result

The gate's report carries the partition itself, not just the scores: region count, declared
inventory count, backdrop area, residue area, and the resolution of each declared item.
Scores without that header are the failure L12 names — a verdict from an instrument that
never said what it examined, and in this lane the thing it examined is exactly what is in
question.

Over many frames the residue distribution is the useful signal, and it points upstream in
the same way the isolation lane's failure distribution does. Residue concentrated on the
same class of content across frames is not a tuning problem; it is a briefing problem, and
the frames are being composed with content the decomposition was never going to select.

## When not to use this

- **A single-subject input**, which is the sibling isolation rule's job and is gated there.
  Running a partition check over a frame briefed for one asset produces one region and a
  coverage check that is trivially true.
- **A backdrop-only capture**, where nothing is extracted as an object and the frame is
  wanted purely as something to be seen. There is no partition, so there is nothing here to
  gate; the constraint is view coverage.
- **Photogrammetry from registered real capture**, where the multiple images are views of
  one subject rather than a frame holding many, and the constraint is camera coverage rather
  than partition coverage.
