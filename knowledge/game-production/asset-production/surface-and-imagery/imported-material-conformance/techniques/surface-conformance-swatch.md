---
layer: technique
type: technique
subject: imported-material-conformance
technique: surface-conformance-swatch
status: forged
laws: [an-instrument-proves-it-had-input, law-and-check-share-one-source]
use_when: [building or changing a material import path, proving a surface conversion before trusting it on real assets, a spot check on one material cleared an import bug that later shipped, choosing what to test a material edge with]
---

# The surface conformance swatch

## The concern

An import edge cannot be tested with an asset. An asset is a confounded instrument: it
carries authoring decisions, art direction, an exporter's settings and the boundary
conversion all at once, so when it looks wrong nobody can say which of the four is
responsible, and when it looks right nobody can say what was proven.

The instrument this edge needs is a **known object** — an artifact authored purely so that
the correct output is stated in advance. On the transform half of this boundary that object
is a cube of a declared size. Here it is a **swatch**: a strip of quads whose material
properties are chosen, written down, and asserted after the crossing.

The swatch is cheap, it is authored once, and it is the difference between *the imports
look better now* and *the edge is correct*.

## What the swatch must contain

Each of these exists to catch a specific defect. A swatch missing one of them is silent
about exactly that defect.

- **Gloss values across the full range, at both extremes and off-centre** — the inversion's
  fixed point is the midpoint, so a swatch built around one mid value passes under the bug
  it exists to catch. This is the rule that everything else here depends on.
- **One quad per texture role**, each carrying a map whose content is recognisable when
  decoded correctly and recognisable when decoded through the wrong transfer curve — a
  stepped ramp, not a photograph.
- **A material with no factors and no maps at all**, which is a legal delivery and is the
  only way to observe the format's defaults arriving.
- **A transparent quad and a two-sided quad**, both of which default off and neither of
  which any other test will exercise.
- **An emissive quad with a texture and no factor**, which is the case where an omission
  annihilates rather than passes through.
- **A metalness pair at both extremes**, because a fully metallic default and an authored
  metal are indistinguishable in a screenshot and distinguishable in a value.

## Procedure

1. **Author the swatch and its expected output together, from the participant table.** The
   expected values are derived from the recorded conventions, not typed in by hand from a
   correct-looking run — otherwise the check enshrines whatever the pipeline did on the day
   it was written
   ([law-and-check-share-one-source](../../../../_laws.md#law-and-check-share-one-source)).
2. **Push it through the real edge**, the same path a delivery takes, with no manual step
   in the middle. A swatch imported by a special route tests a route nothing uses.
3. **Assert values, not appearance.** Read the resulting material's properties and compare
   numbers. A screenshot comparison passes on every defect in this subject, because every
   defect in this subject looks plausible.
4. **State what the swatch covered.** The report names the roles, the property ranges and
   the default cases it exercised, so a reader can see which dimensions were checked at all
   — a check that examined nothing and a check that examined everything and found nothing
   return the same clean result
   ([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).
5. **Then run one real delivery.** The swatch proves the arithmetic; a real asset proves the
   exporting side's own settings, which is where drift actually accumulates. Run them in
   that order and their failures have different owners: a swatch failure is the edge's, a
   delivery failure that follows a passing swatch is the delivering side's.
6. **Re-run it on every change to the edge, the format version or the renderer version.**
   All three move, and two of them move without anybody on the project deciding to move
   them.

## Decision rules

- **When a swatch has no value away from the midpoint, it is not a calibration, it is a
  smoke test.** Rebuild it before trusting any result it produced.
- **When the swatch passes and deliveries still look wrong, believe the swatch.** The edge
  is correct and the problem is upstream of it — in the export settings, the request, or the
  authoring. That is a real and useful conclusion, and it is unavailable to a team without a
  known object.
- **When a new defect class is found in a delivery, add its case to the swatch before
  fixing it.** Otherwise the fix is verified once, by hand, by the person least able to be
  objective about it.
- **When the swatch cannot express a case, that case is untested — say so.** A conversion
  dimension with no case is not passing; it is unexamined, and the report must be able to
  say which.
- **When the expected values and the conventions table disagree, the table is the
  authority.** If the table is wrong, fixing the table fixes the swatch, the conversion and
  the documentation at once. Fixing the swatch alone fixes nothing and hides the rest.

## When not to use it

- **As a substitute for a real delivery.** A swatch is authored by someone who understands
  the boundary, which is exactly why it cannot discover what an exporting tool does when
  nobody is watching.
- **For judging whether a surface looks good.** The swatch answers whether the number that
  went in came out. Everything about whether the material is any good is a different
  question with a different examiner.
- **Where the pipeline has one format and one renderer and no conversion at all.** There is
  nothing to calibrate, and a swatch maintained against a boundary that does not exist is a
  test that can only ever fail spuriously.
