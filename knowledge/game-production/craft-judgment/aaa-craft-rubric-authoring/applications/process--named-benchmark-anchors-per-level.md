---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: named-benchmark-anchors-per-level
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Ten lenses, forty anchors, and one level that names a class of studio

The `pof` ARPG production tool grades generated deliverables through ten markdown craft
lenses. Each opens with a benchmark-anchors section giving the four gauged levels a reference.
The technique was already largely followed there: every lens names shipped products for its
upper levels, states what about each product is the anchor, and describes the floor as a class
of output. Nothing checked that. A lens edit that replaced a product with an adjective would
have passed every test, and the stored gauges would simply have started clustering mid-scale.

## What was read

All 40 anchor bullets. Twenty-nine of the thirty upper-level bullets (A2 to A4) name at least
one titled product. The exception is the production-process A3 bullet, which reads "mid-size studios running a textbook
milestone ladder", a class of studio rather than a product, which the technique reserves for the
floor only. The other lenses' floors are classes of output, as written. Not found: a pin on any
anchor's release, so live-service anchors can drift without a lens edit; left as a note.

## What changed

A test parses each lens's anchor bullets and requires a named product at A2 to A4 and none at
A1. The one known gap is listed in a two-sided allowlist: it must be deleted when the lens
names a product. The lens itself was not edited, because a change bumps its version and
re-projects every stored gauge under it as ungauged; that is an owner decision.

## The pair

Target, upper-level anchor bullets with no named product the check can see: A 1 of 30 with
nothing watching, B 1 of 30 now watched (a second would fail the build). Replay with the
allowlist emptied fails on exactly that entry (1 of 40). Floor: the nine craft test files, 169
tests (40 of them new), green; lens files unchanged, so no gauge was re-projected. Shipped
as `eef0b7e4` on the project's default branch.

## Not measured

Whether the A3 gap moves production-process grades: no stored gauges on the machine used.
Whether the existing named products pass the two-practitioner recognisability test is a human
read this run did not make.
