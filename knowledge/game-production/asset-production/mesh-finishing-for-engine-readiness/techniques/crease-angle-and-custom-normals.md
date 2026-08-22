---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: crease-angle-and-custom-normals
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass, refuse-rather-than-destroy]
shared_with: []
use_when: [a reduced mesh shades faceted or blotchy, deciding whether to re-smooth generated geometry, a smoothing pass appears to do nothing]
---

# Crease angle and authored normals

Two mechanisms decide how a surface shades, and they are not additive. An **angle rule**
smooths any edge flatter than a threshold and keeps sharper ones hard. **Authored
per-vertex normals** state the shading direction explicitly, per corner, and where they
exist they override the angle rule completely. A finishing stage that applies the angle
rule without asking whether authored normals are present is running an operation whose
outcome it has not established.

The rule: **normals have exactly one authority per mesh.** Determine which one owns them,
apply that one, and record which it was.

## The threshold, and what it is for

A crease angle of **30 degrees** is the workhorse default. Its virtue is that it
simultaneously serves two shapes that want opposite treatment: a hard-surface bevel meets
its neighbouring face well above 30 degrees, so the edge stays crisp and reads as
manufactured; an organic body's facets meet well below it, so the whole form smooths into
a continuous curve. Move the threshold up towards 60 degrees for mechanical assets whose
chamfers are shallow, down towards 15 for faceted stylised work where you want the planes
to read. Below about 10 degrees it stops smoothing anything useful; above 80 it smooths
edges that should be hard and the silhouette loses its structure.

The angle is a shading decision, not a geometry one. It does not change a vertex position
and it does not change the face count.

## Procedure

1. **Inspect the input for authored per-vertex normals before planning the pass.** This is
   a property of the incoming data, so it is a measurement, not an assumption.
2. **If authored normals are absent, apply the angle rule** at the class-appropriate
   threshold, after reduction. Record what was applied, threshold included — the run
   report should say which rule ran at which angle, not merely that shading "was done".
3. **If authored normals are present, refuse the pass and say why.** The correct reason is
   that the source's own normals carry better information than an angle threshold can
   reconstruct. A refusal that is reported is a result; a skip that is silent is a mystery
   for whoever debugs the shading later.
4. **Never clear authored normals to force the pass through.** Measured on real generated
   output: clearing them and re-running the angle rule rewrote **99.9% of the exported
   normals by a mean of 73 degrees**. That is not a re-shade, it is a wholesale
   replacement of measured direction with inferred direction.
5. **Report a no-op as a no-op.** On generated input that already carries authored normals
   and is already fully smooth, the pass changes **zero** normals. Reporting that honestly
   is what stops the next engineer from re-adding the step under the belief it was
   forgotten.

## Decision rules

- **Authored normals present → angle rule refused, with reason.** No exceptions for
  convenience.
- **Authored normals absent and the mesh imported faceted → angle rule applied.** This is
  the input class the rule genuinely serves: interchange formats that carry no normal data
  and arrive flat-shaded.
- **A threshold of zero means "no shading pass"**, not "smooth everything". Give the
  disabled state its own value rather than overloading a boundary value.
- **The threshold is per asset class, stated with its unit.** Degrees, measured between
  adjacent face normals. A number handed between a planner and an executor without that
  basis is not a specification.
- **A changed-normal count of zero and an unrun pass are different states.** Emit them as
  different fields. "Nothing changed" is evidence about the input; "nothing ran" is
  evidence about the plan.

## The general lesson

The measured no-op is the valuable part of this technique, and it generalises past
shading: **before adding a normalising step to a pipeline, measure whether the input
already satisfies the property the step establishes.** Generative and third-party inputs
frequently arrive already conforming, because the tool that produced them did the work.
A step that fires anyway is at best wasted time and at worst — as here — an active
downgrade, and it will be invisible because the output still looks like output.

The measurement that settles it is cheap: count how many values the step changed. Zero
means remove the step for this input class. A large fraction changed by a large magnitude
means look hard at which side had the better information before you keep it.

## When not to use this

- **When the engine's own import settings own the shading.** Some importers recompute
  normals on ingest according to their own threshold; applying a second authority upstream
  produces a mesh whose shading is decided twice and by neither.
- **When hard edges are carried as explicit edge marks rather than by angle.** A mesh with
  authored sharpness marks has an authority already; the angle rule would be a third.
- **When the asset is destined for a normal-map bake that will supply the shading.** The
  bake's tangent basis, not the crease angle, then dominates what the surface looks like,
  and the low-poly's own smoothing should be chosen to suit the bake rather than to look
  correct on its own.
