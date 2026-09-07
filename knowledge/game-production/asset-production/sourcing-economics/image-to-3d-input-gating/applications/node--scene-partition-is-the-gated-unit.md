---
layer: application
type: application
subject: image-to-3d-input-gating
technique: scene-partition-is-the-gated-unit
stack: node
status: forged
verified_on: 2026-09-07
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Residue, in a pipeline that has no partition yet

This tree is the honest half-case for the technique, and the split is worth stating first
because it is what makes the measurement meaningful. The subject's scene lane has **two**
rules — gate the partition, and report residue as its own state — and only the second one
had a seam here. The first has none, for a reason the tree states out loud: the input gate's
own prompt (`src/lib/visual-gen/input-gate.ts:29`) asks a vision model for
*"exactly one subject, no scene clutter or companions"*. This pipeline generates one asset
per submit. There is no cut, so there is nothing to check the cut against.

The residue rule needs no partition, though. It only needs a stage that reports what it
collected, and the claim it makes there is the strong one: **a produced artifact that no
recognizer claimed is in no field at all, and is indistinguishable from an artifact that was
never produced.** That is testable wherever a set is assembled from evidence.

## The seam

`src/lib/catalog/packaging/collect.ts` assembles a package from what a run's sibling steps
actually produced — the module's founding rule, in its own header, is *"never invent
content"*. It sorts every string it walks into three states, which is already the shape the
technique asks for: `files` (a produced file it resolved), `dataUrls` (art embedded in the
artifact), and `unresolved` — documented there as

> A reference that IS a served artifact but whose disk location could not be derived.
> Reported, never dropped: a package that silently omits a mesh looks identical to one that
> never had it.

That sentence is the technique's residue rule, written independently by someone who had
been burned. The header records the burn: an anchored serve-route regex stopped matching
provider-qualified mesh URLs, "packaging then treated them as prose and DROPPED them, so a
row whose selected candidate was a Tripo cloud mesh shipped a package silently missing its
model."

**The fix covered that one pattern and left the shape intact.** `unresolved` is only ever
reached by a string that already matched a serve-route regex. Everything else is sorted by
`FILE_EXT`, a literal list of the formats that existed when it was last edited, and a string
that matches neither is silently prose. So the denominator is still derived from the same
patterns whose drift caused the incident.

## The paired measurement

Same collector, same fixed inputs, one variable: two additional sibling steps emitting four
real artifacts in formats the list does not carry — `.usdz` and `.usd` (the containers a
physics-carrying export is restricted to) and `.ply`/`.spz` (splat environments). Both are
formats this pipeline would plausibly acquire next, which is the point: the failure is not
about exotic strings, it is about *the next format*.

| | files | meshes | dataUrls | unresolved |
| --- | --- | --- | --- | --- |
| A — as shipped, without the two steps | 6 | 4 | 1 | 1 |
| B — as shipped, **with** them | 6 | 4 | 1 | 1 |
| C — with the residue channel, with them | 6 | 4 | 1 | **5** |

A and B are byte-identical. Two entire producing steps contributed nothing to any field,
and the shipped catalog suite passed **18/18** across both — because a format nobody
enumerated has no case, which is exactly why per-case coverage cannot reach this.

The first arm attempted was a different one and it **refuted the hypothesis**, which is why
the measurement above is the right one. Drifting `FILE_EXT` itself — an ordinary refactor
splitting it into image/audio/data groups and dropping the mesh group — was caught: 5 of 18
tests went red. The enumerated formats are well covered. What is not covered, and cannot be,
is the unenumerated one, and only the failed arm made that distinction visible.

## What shipped

A `looksLikeUnenumeratedArtifact` guard: path-shaped, under `generated/`, carrying an
extension `FILE_EXT` does not list → reported as `unresolved` with a reason, instead of
falling through as prose. Committed with two tests — one that goes red without the change,
and a negative control asserting prose, bare directory references and UE object paths still
report nothing, so the manifest's `missing[]` does not become noise. Full catalog suite
after: 269 passed, 1 skipped, unchanged.

## What this realization cannot do

It reports a **shape**, not an expectation. It catches an artifact the collector saw and
could not classify; it still cannot catch a step that was supposed to produce something and
produced nothing at all, because nothing here declares what a step owes. That is the
technique's step 1 — the declared inventory — and it is genuinely absent from this tree,
which has no brief-side manifest to check against. Recorded rather than papered over: the
evidence floor installed here raises the fail-loud boundary from *"a reference I recognized"*
to *"a reference I saw"*, and stops short of *"a reference I expected"*.

The partition rules are untested here for want of a partition. If this pipeline acquires
scene-mode generation, the gate at `input-gate.ts:29` is the first thing that breaks: it
would refuse every valid input, because a scene input is multi-subject by construction and
that prompt is written to fail exactly that.
