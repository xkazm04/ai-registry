---
layer: application
type: application
subject: reference-parity-gating
technique: dual-anchor-scoring
stack: process
status: forged
verified_on: 2026-08-31
---

# Dual anchors in a procedural vehicle rebuild program

A public browser game rebuilds its entire playable vehicle fleet as first-party procedural
geometry, and gates each vehicle against community reference models it may study but never
ship. The program is a four-week, ~130-instrument operation with a per-vehicle score file
and a tool-written ledger, and it is the fullest worked instance of dual-anchor scoring
available in public. Read at commit `286bd2a`.

## What the two anchors are

The gate scores six components per vehicle and requires **every one at or above 90** — no
averaging. Those components split cleanly across the two authorities the technique
describes:

| Anchor | Components | Source of truth |
| --- | --- | --- |
| Profile | body curves, whole-vehicle curves, sub-assembly curves, cross-sections, disconnected-island count | the reference model, traced through the same pipeline as the candidate |
| Specification | published dimensions | published real-vehicle figures — height, body length, overall length, width |

The program states the conjunction explicitly, and the sentence is the technique's own
claim arriving from an independent author: *"a build that 'matches' a defective oracle
(sunken hull, sky-high fused turret) still fails dims, and a build that matches dims but
not the curves fails the curves. You cannot satisfy both without being actually right."*
It is labelled, in the document's own words, "the anti-gaming anchor".

## What the realization confirms about the standard

**The grace band and slope match the technique's default almost exactly.** The dimension
score is `100 − Σ max(0, pct − 1)·8` — one percent free per dimension, then eight points
per further percent. That the same shape was reached independently is the strongest
corroboration available for a parameter that otherwise reads as arbitrary.

**The specification anchor is measured from the candidate's traced output, not its
parameters.** Height and body length come from the side silhouette's band extent with a
12%-of-height threshold so protruding components do not contribute, the roof taken at a
high percentile so a two-column antenna cannot define it; width is read at pixel resolution
from the plan mask because the traced polyline quantises to ~11 cm when a long component
pins the frame. Both of the technique's steps — measure from output, and resolve at the
instrument that can actually support the row — appear here as engineering rather than as
principle, with the reason recorded.

**The independence is load-bearing and was tested by adversity.** The program's reference
models are frequently defective: fused assemblies, yawed bodies, components modelled short.
Each such case is handled by bounding a waiver to the rows the defect reaches, and the
documents state the invariant plainly — *"a cap certification never excuses dims."* The
specification anchor is the one thing no reference defect may reach, which is exactly the
property that makes the conjunction worth having.

## The structural fact the tree carries

The most useful evidence here is not the design; it is a number the program published
against itself.

An acceptance slate of twelve vehicles was assessed under a separate perceptual review.
**All twelve matched published dimensions within about 4%. All twelve failed the review** —
0/12 — and the document names the finding without softening it: *"envelope-parity is FALSE
COMFORT."* Nine of the twelve failed on a criterion as basic as whether the road wheels
could be counted in a side view.

This is a measured demonstration of the boundary the technique states in its own closing
section: the conjunction proves the candidate is the right size and the right outline, and
says nothing about whether it reads correctly. The program's response was not to re-weight
an anchor. It added a separate tier of measurable form gates ahead of detail work — wheel
exposure fraction, glacis plane targets, a falsifiable family-shape line, a
structure-merge alarm at a sub-assembly-to-body length ratio — and froze decoration until
those pass.

Read as evidence about the standard, that is a negative result about *dimensional* parity
specifically, and it is stronger than the corpus's existing general claim. The law already
says structural proof is necessary and never sufficient; this measures the gap at the point
where a team would most reasonably expect structural proof to have become sufficient, and
finds it total.

## What this realization cannot do

The two anchors are both silhouette-and-scale claims computed from orthographic masks, so
the pair certifies nothing about shading, material, hollowness or readability. The program
knows this and pays for a second, independent tier — a shaded-parity critic scoring every
view at or above 9.0/10, plus a mandatory human turntable pass — and states the resulting
rule as *"curve scores alone never certify a tank again."*

The gate is also deliberately unreachable at the time of writing: the fleet's strongest
vehicle scores a minimum of 40 against a bar of 90. The document argues this is correct —
*"it is the definition of done, not a description of today"* — which is the corpus's
grade-against-what-ships law adopted verbatim by a team that had to live with it.
