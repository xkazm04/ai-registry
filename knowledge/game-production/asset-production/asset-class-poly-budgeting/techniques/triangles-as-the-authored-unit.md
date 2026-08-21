---
layer: technique
type: technique
subject: asset-class-poly-budgeting
technique: triangles-as-the-authored-unit
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [defining a geometry budget field, auditing a pipeline for unit drift, writing a budget into a brief or a spec]
---

# Triangles as the authored unit

## The concern

Every layer of a geometry pipeline reports a count called "faces", and the layers
disagree about what a face is. Authoring surfaces report quads for a quad-dominant
mesh and n-gons as one face each. Generative services report whatever topology they
were asked to emit. Loaders and measurement libraries triangulate on import and report
triangles. A pipeline that does not *choose* one unit has silently chosen all three,
and the disagreement only surfaces when it is load-bearing.

The technique is to fix exactly one authored unit for the whole system, make it
triangles, and make the choice impossible to forget.

## Why triangles win

- **The runtime pays triangles.** Whatever an artist authored, the rasteriser consumes
  triangles. A budget is a promise about runtime cost, so it should be denominated in
  the thing the runtime is billed for.
- **Every measurement is already in triangles.** Mesh inspection libraries and engine
  importers triangulate on load. If you budget in anything else, every check has to
  convert, and a conversion in every check is a conversion that will be missing from
  one of them.
- **Quads are not universal.** A mesh may be quad-dominant, mixed, or fully
  triangulated. "Quads" is not a unit you can always measure; triangles always is.
- **It is the one unit both a human and a service can agree on.** A brief that says
  "15K triangles" is unambiguous to a contractor, to a service, and to a reviewer. A
  brief that says "15K" is a coin flip.

Vertex count is the better proxy for memory and transform cost, and a mature pipeline
reports it alongside. It is not the *budget* unit, because it is not the knob the
authoring side or the service exposes. Report it; do not budget in it.

## Procedure

1. **Declare the unit as a constant in the codebase**, exported from the module that
   owns budgets, with a name that says so. Not a comment — a value other modules can
   quote when they build a message.
2. **Name the unit in every field that holds a budget.** A field called `triangleBudget`
   cannot be filled with a quad count by accident the way a field called `faceLimit`
   can. This is the cheapest fix in the whole subject and it retires most of the risk.
3. **Interpolate the constant into every human-readable string** the system emits about
   budgets — the grading reason, the error, the report line. A message that reads
   "a 15000-triangle budget cannot be confirmed" teaches the unit to whoever reads it.
4. **Convert only at the outer edges**, in one named function per direction, never
   inline at a call site (see provider-face-limit-conversion).
5. **Write the unit into human briefs too.** Contractors, outsourcers and internal
   requests carry the same ambiguity, and the recorded incident that motivates this
   technique came from a human commission, not a machine one.

## Decision rules

- **When a service exposes a density knob whose unit differs from yours, the authored
  value never changes.** Convert at the adapter. Two authored units is two authorities
  for one quantity, and the disagreement will be invisible.
- **When a legacy field holds an un-united count, do not reinterpret it — rename it.**
  A silent redefinition of an existing number is a worse failure than the original
  ambiguity, because it invalidates every historical record without a marker.
- **When a document, ticket or brief states a bare number, treat it as unspecified**,
  not as triangles. Ask. The cost of asking is a message; the cost of assuming is a
  regeneration or a review-stage catch.
- **When reporting, always state unit and basis together.** "40k triangles at a
  mid-distance overhead camera on the desktop target" is a budget. "40k" is a rumour.

## When not to use it

- **Subdivision-surface and displacement pipelines** budget the control cage, not the
  evaluated result; the authored unit there is cage quads (or base-cage faces) and the
  triangle figure is derived per subdivision level. Declare *that* unit with the same
  rigour — the technique is "one declared unit", and triangles is its answer for
  real-time authored geometry, not a universal law.
- **Point-based, voxel or implicit representations** have no faces to count. Budget in
  their own primitive and state it.
- **A retopology brief that genuinely needs quad-flow guarantees** may state both: a
  quad target for topology quality and the triangle budget it implies. Two numbers with
  two units is fine. One number with no unit is not.
