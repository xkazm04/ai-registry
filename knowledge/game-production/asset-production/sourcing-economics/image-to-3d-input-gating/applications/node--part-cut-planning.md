---
layer: application
type: application
subject: image-to-3d-input-gating
technique: part-cut-planning
stack: node
status: forged
verified_on: 2026-09-07
verified_against: node@24
applied: simulation
ab_verdict: better
proof: structural-only
---

# Planning the cuts, in a Node asset pipeline

## What was opened

The same Next/TypeScript game-production pipeline: an input-gating module and a
reference-role module on the image side, three generator runners, a critique stage that
grades a mesh against the stage that produced it, and a finishing runner that joins parts
and decimates to a face budget.

**The witness for that version:** the tree declares no engines field and pins no runtime
in CI, so the version this document is verified against is taken from the `@types/node`
dependency pin the repository actually carries — not from the machine that read it. The
headless DCC the finishing runner drives is separately pinned at 4.2 in that module's own
measured note, and every Blender-side fact here is read against that.

## The structural fact: "part" has only one meaning here, and it is a defect

The word appears throughout the tree and it never once means *a part somebody chose*.

- The critique stage carries a finding code for an over-budget part count, sitting in a
  list of defect classes beside floater fragments and component counts.
- The finishing stage is declared to **resolve** that finding, because its runner joins
  every part into one object. The remedy for having parts is to stop having them.
- The finishing runner's UV mode documents the other end: joining N textured parts leaves
  N layouts stacked in the same coordinate space, so consolidation re-packs rather than
  re-projects.

So the pipeline has a defect class for parts and a consolidation step for parts, and
nothing in between that ever authored a part list. Parts are what the generator did to the
asset, not what the pipeline asked for. That is the missing stage this technique names,
present here in its purest form.

## The three cases, walked under both policies

All three are recorded measurements in the tree, not invented scenarios.

**Case 1 — four independent rolls of one prompt.** Recorded live at `assetClass: 'prop'`:
0/100 on all four, 16-50 floater fragments and 35-56 substantial parts every time, at 20
provider credits per generation. *Policy A (current):* commission the subject whole, grade
the result, discover it arrived as tens of parts nobody chose, route to finishing to join
them back. The tree's own conclusion is that re-rolling these buys nothing but the bill,
and the finding code that fires is never the part count. *Policy B (cut plan):* the
subject's parts are named before the spend; each is commissioned as its own closed region
and graded against its own budget, so a failing part costs one part's credits rather than
the whole subject's. **Predicted better**, and the mechanism is that the 35-56 parts stop
being an uncontrolled output and become a small authored number.

**Case 2 — the decimation pair.** A generated mesh at 1,482,446 faces with 2 components
and 1 floater grades warn; its decimated game mesh at 46,791 faces has 17 components and
16 floaters and grades fail. Decimation multiplied the specks. *Policy A:* one dense
whole-subject mesh enters one decimation and the fragmentation is discovered afterwards.
*Policy B:* each planned part is decimated against its own share of the budget, so a part
that shatters is identifiable and re-commissionable alone. **Predicted better on
diagnosis**, and explicitly *not* predicted better on the floater count itself — the
technique makes no claim there and this application does not invent one.

**Case 3 — the fail distribution.** 10 of 52 meshes fail, every one on floaters, none on
the part count. *Policy A and B are the same here*, and this is the case that bounds the
claim: a cut plan does not touch the dominant defect in this corpus. **No difference
predicted.** Reporting it is the point — the technique's value is in what the spend buys
and what a failure costs to isolate, not in the fail rate.

## What would falsify the prediction

If planned per-part commissioning produced the same or worse total credit spend per
accepted asset — because N part generations at 20 credits each exceeded one whole-subject
generation plus its re-rolls — the prediction is wrong. That number is measurable from the
job stores the pipeline already keeps, and it is the arm to run first.

## What this realisation cannot do

It cannot yet grade a part against a planned budget, because no part list exists to
divide a budget across; the face budget is applied to the assembled object. Until a cut
plan is an artifact in the pipeline, the per-part arithmetic this subject's neighbour owns
has no input.

## Return condition

When the pipeline gains a part-list artifact on the image side, the credit-spend-per-
accepted-asset arm above becomes runnable from the existing job stores and this
application is owed a measured verdict.
