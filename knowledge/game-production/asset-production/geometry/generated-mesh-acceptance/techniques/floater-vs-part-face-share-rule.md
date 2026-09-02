---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: floater-vs-part-face-share-rule
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a gate rejects legitimately multi-part assets, distinguishing debris from body parts, one count is conflating two populations]
---

# The floater-versus-part face-share rule

A connected-component **count** cannot distinguish an assembled asset from a shattered
one. Replace it with a **distribution over each component's share of the total faces**,
and the same input yields two independent measurements where there was one ambiguous
number.

This is the general move, and it is worth more than the mesh case: *when one count
conflates two populations, replace the count with a distribution over a normalised
share.* The share is what makes it transplantable — an absolute face threshold means
something different on a 40k mesh and a 1.5M mesh, a percentage does not.

## Why the count fails

A production character is assembled, not welded: head, lashes, brows, layered eyes, an
interior mouth with teeth and tongue, body, hands, hair, cape, accessories. Every one is
its own connected component and that is correct — separable shells are the prerequisite
for expression rigging and for modular swap slots. A shattered generation is also
many-componented. One number, two meanings, opposite verdicts.

Measured on real generated character output: 375 components resolved to **61 substantial
parts plus 314 specks holding 36% of the face budget**. Those are two distinct defects —
too many parts *and* a third of the geometry being debris — and the count reported them as
one unreadable figure.

## Procedure

1. **Have the metric extractor emit a per-component face histogram**, largest first. This
   is the only new input the rule needs. Where the histogram must be capped, emit the count
   of omitted components alongside it.
2. **Compute the speck floor** as `max(absolute_minimum, total_faces × share_threshold)`.
   Working defaults: a share threshold of **0.5%** and an absolute minimum of **8 faces**.
   The absolute minimum exists so that on a tiny mesh you never promote something that is
   geometrically a handful of triangles into a "part" on share alone.
3. **Partition.** Components below the floor are specks; the rest are parts.
4. **Emit three numbers**: part count, speck count, and total faces held by specks. The
   third is what tells an operator whether the debris is cosmetic or is eating the budget.
5. **Grade the two populations against separate thresholds.** Parts over the class part
   budget is one defect class; specks over the debris tolerance is another. They route
   differently and must never share a code.

## Handling a truncated histogram

A capped, largest-first histogram means every omitted component is no larger than the
smallest one you kept. That gives you a decidable case and an undecidable one:

- **The smallest kept entry is already below the floor.** Then every omitted component is
  too — count them all as specks.
- **The smallest kept entry is substantial.** You cannot tell which side the omitted ones
  fall on. Count them as **parts**, which pushes toward the part-budget fail.

The rule behind both branches: **resolve ambiguity toward the harsher verdict, so that
neither branch can manufacture a pass.** Write the branches out explicitly and check them
against that property — a truncation policy that could produce a clean card from missing
data is a bug regardless of how reasonable it looks.

## Decision rules

- **When no histogram is present, do not synthesise one and do not relax.** Fall back to
  the old blunt count rule exactly as it was. Missing data must not become a loosening.
- **When the share threshold is tuned, tune it against a corpus and report how many
  verdicts moved.** A threshold change that moves zero verdicts changed nothing.
- **When an asset class is legitimately single-shell** — most props — the part budget does
  the work and the speck rule still applies unchanged. Do not special-case the class out of
  debris detection.
- **When debris survives a finishing pass, say so.** Decimation *multiplies* specks: one
  measured before/after pair went from 2 components and 1 speck at 1.48M faces to 17
  components and 16 specks at 47k faces — a warn that became a fail. Any routing table that
  claims the finishing stage resolves debris is claiming a cure it does not deliver.

## The adjacency corollary

The same shell structure defeats a second common assumption. An operator that finds
"interior faces" by selecting faces whose every edge has more than two face users only
finds **welded** interior. A body under separate armour, a scalp under a separate helmet
— different shells, no shared edges, nothing selected. Probed directly, a small box fully
enclosed inside a larger box and joined into one object selects zero of its faces, while a
genuinely welded shared wall selects one.

So a zero result means *no welded interior found*, never *nothing is hidden*. Culling
occluded geometry between shells needs visibility testing — ray casting or render-based —
and any pipeline that concludes "nothing hidden" from an adjacency operator is asserting
something it did not measure.

## When not to use this

- **When components are not the unit of the population you care about.** The generalisable
  move is share-over-count; the specific thresholds here are about connected components and
  faces and do not transfer verbatim.
- **As a quality judgment.** A mesh with a beautiful part distribution can still be the
  wrong shape entirely.
- **To decide that an asset is riggable.** Part count feeds that question but does not
  answer it; that is a separate, non-scoring output.
