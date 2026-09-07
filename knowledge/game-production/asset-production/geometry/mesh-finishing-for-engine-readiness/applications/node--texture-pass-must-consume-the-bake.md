---
layer: application
type: application
subject: mesh-finishing-for-engine-readiness
technique: texture-pass-must-consume-the-bake
stack: node
status: forged
verified_on: 2026-09-07
verified_against: node@24
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# Texturing a bench-baked mesh, in a Node asset pipeline

## What was opened

A Next/TypeScript game-production pipeline whose asset lane runs a real finishing bench:
a runner that drives a headless DCC through join → decimate → unwrap → high-to-low bake,
emitting a normal map path and a per-map refusal list; a separate module that requests
re-texturing from the generative provider; and a critique stage that grades meshes by
pipeline stage. The bench module is a faithful realisation of this subject — it declares
its bakeable set as a constant, excludes the non-derivable channel deliberately with a
pointer to the reason, sizes the bake from texel density rather than a flat default, and
carries a measured note recording that its re-shading pass changed 0 of 30,967 normals on
generated input.

**The witness for that version:** the tree declares no engines field and pins no runtime
in CI, so the version this document is verified against is taken from the `@types/node`
dependency pin the repository actually carries — not from the machine that read it. The
headless DCC the finishing runner drives is separately pinned at 4.2 in that module's own
measured note, and every Blender-side fact here is read against that.

## The measurable, and why no behavioural arm ran

The technique's claim is that colour authored by a service which ignores the baked maps
contradicts them. The measurable would be a per-part agreement check between the returned
albedo and the baked normal, over the same part with and without the routing rule.

**No arm was runnable, and the reason is the finding.** The re-texturing module documents,
ground-truthed against the provider's own SDK reference, that its texture operation
accepts **a prior task id from that provider and nothing else**. An externally finished
mesh — precisely what the bench produces — cannot be submitted to it at any price. So arm
B does not exist: there is no configuration of this pipeline in which a bench-baked mesh
reaches that texturer and either respects or ignores its normal map.

## The structural fact

Nobody designed this tree to prove anything about the technique, and it proves something
anyway. The two paths are **disjoint by construction**:

- an asset generated and textured by the provider is coloured before it ever reaches the
  bench, and the bench's own UV mode has a branch for exactly that input — it re-packs the
  islands the textured parts already carried rather than re-projecting them, because
  re-projection would discard authored seams;
- an asset the bench bakes has no path back to that texturer at all.

The tree therefore contains the technique's conclusion as a topology rather than as a
rule. What it does *not* contain is any statement of the consequence — that choosing the
line is a commitment made at commissioning time, and that the bench-baked line has no
budgeted colour engine downstream of it.

## The verdict, and what it changed

`not-better`: the technique as written did not improve this seam, because its central
procedure step — probe the service with a strongly-baked part — is unrunnable here. The
row is worth more than a confirmation would have been. The technique gained a section for
the condition it did not survive (a texturer that accepts only its own prior task ids),
which relocates the routing decision from after finishing to before generation and makes
the two lines' disjointness the design constraint rather than a discovered surprise.

## What this realisation cannot do

It cannot report an agreement number between albedo and baked relief, because it never
produces both from one asset. The absence of a contradiction here is a consequence of the
provider's input restriction, not evidence that the contradiction is rare elsewhere — a
pipeline whose texturer *does* accept user meshes would need the probe this one cannot
run.

## Return condition

When the pipeline adopts a texturing engine that accepts user-supplied meshes — which the
re-texturing module's own note says would be required to colour bench-finished output —
the probe becomes runnable and this application is owed a paired arm.
