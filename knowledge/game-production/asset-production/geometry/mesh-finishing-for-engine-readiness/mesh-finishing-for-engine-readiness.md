---
layer: golden-path
type: golden-path
subject: mesh-finishing-for-engine-readiness
status: forged
use_when: [turning a generator's raw mesh into an engine-ready asset, designing an automated retopology-unwrap-bake stage, deciding which texture channels may honestly be baked, scripting a content-creation tool with no interactive session]
techniques:
  - unwrap-only-the-low-poly
  - crease-angle-and-custom-normals
  - high-to-low-bake-coverage
  - pack-existing-vs-smart-unwrap
  - rig-preset-and-bone-remap-binding
  - headless-dcc-capability-limits
---

# Mesh finishing for engine readiness

A generative model hands back a dense, single-shell, unwrapped lump of geometry. It looks
correct in a turntable preview and it is unusable: too heavy to instance, with no texture
coordinates to paint into, no seam control, no skeleton, and all of its detail carried in
vertices rather than in maps. The finishing bench is the stage between that lump and an
asset an engine will accept — reduce, unwrap, bake, bind.

The bench is unglamorous and it is where most machine-assisted asset pipelines quietly
fail, because every one of its operations is order-dependent, every one of them has a
version of the mesh it must run on, and the tools that perform them will happily run them
on the wrong version and report success. This subject is that discipline: which operation
runs on which version, what the operation is allowed to claim afterwards, and how to find
out what your automation surface can actually do before you build a pipeline on it.

## The order is one-directional, and every arrow is load-bearing

High-density source → reduced topology → unwrap → bake → bind. Each arrow destroys the
premise of the step before it, which is why running them out of order does not merely
produce a worse asset, it produces a meaningless one.

**Reduction invalidates coordinates.** Texture coordinates describe a surface. Rebuilding
the surface leaves the coordinates describing geometry that no longer exists. Any unwrap
performed before reduction is discarded work at best and silently wrong at worst.

**Unwrapping is the gate on baking.** A bake writes into texture space. With no texture
space there is nothing to write into, so a bake requested on an unwrapped mesh is not a
degraded bake, it is not a bake. Pipelines that treat unwrap as optional and bake as
independent produce empty maps that pass a file-exists check.

**Baking is the only step that recovers what reduction removed.** Reduction throws away
surface detail; the high-to-low bake is the mechanism that puts that detail back as
shading information on the cheap mesh. Skipping it does not save a step — it converts a
detailed source into a plain low-poly and calls the result finished.

**Binding is last because it is the only step that cares about deformation.** A skeleton
bound before reduction is bound to vertices that are about to be deleted.

The corollary that catches teams: direct low-poly generation, where the generator is asked
for the cheap mesh straight away, is a different product from a finished asset. It is
acceptable for small simple props with a modest texture pass afterwards, and it is a
dice-roll for anything that must hold up close to camera — clean one run, unusable the
next. For anything that has to bake, generate the dense source and finish it. The upstream
question of *whether the generator is the right tool at all*, and the choice between
finishing a defective mesh and regenerating it, belong to the economics of regeneration
versus repair — a separate concern that owns the defect-to-remedy map. Finishing assumes
that decision has already been made and the answer was "repair".

## Every operation must name the version of the mesh it ran on

This is the single most useful habit on the bench, and it is a reporting discipline rather
than a geometry one. A finishing run touches at least three distinct meshes: the dense
source, the reduced result, and — where symmetry is exploited — an authored half that is
mirrored. Operations that look interchangeable are not: an interior-geometry cull is
meaningful only on the full-density mesh before reduction, an unwrap is meaningful only
after it, a bake reads one and writes for the other.

So the run's report states, per operation, which version it ran against and what it did.
An operation that did not run says why. An operation that ran and changed nothing says
that too, and says it *differently* from one that was refused — "the cull ran and removed
zero faces" and "the cull was refused because the mesh was above its ceiling" are opposite
facts, and a single absent count collapses them into one unreadable state.

The same rule applies to the operations that have structural blind spots. A cull that can
only see geometry welded into one continuous shell is blind to a body hidden under a
separate chest plate — the most common shape of occlusion on an assembled character. When
such an operation reports zero, the report must carry the reason its zero is not evidence
of absence, along with the count of shells it could not evaluate. A tool that cannot
distinguish "nothing was hidden" from "I cannot see hiding places" is a tool whose output
must be annotated by the pipeline that drives it.

## Shading has exactly one owner

Reduction ruins smooth shading; the reflex is to re-shade everything with an angle-based
smoothing pass. That reflex is right for meshes that arrive faceted with no normal data,
and it is destructive for meshes that arrive with authored per-vertex normals — those
override the angle rule entirely, so the pass is either a no-op or, if you clear the
authored normals to force it through, a wholesale downgrade of better information to
worse. Decide which authority owns the normals, apply exactly that one, and record the
decision. This is the concern of
[crease-angle-and-custom-normals](./techniques/crease-angle-and-custom-normals.md).

## What a bake may claim

A high-to-low bake transfers geometric truth from a dense surface to a cheap one. That
places a hard line through the channel set: **a channel the source geometry encodes is
derivable; a channel that was an authoring decision is not.** Surface direction, ambient
occlusion, curvature and thickness are all functions of the high-density shape and can be
recovered. Metalness is not a property of shape — it is a statement about material
identity that a human or a material author decided — and no amount of ray-casting between
two meshes will produce it.

The failure this prevents is the quiet one. A pipeline asked for a full material set,
unable to produce one channel, and emitting three maps plus silence gets read downstream
as a complete set. The rule is that a channel which cannot be derived is **named as absent
with its reason**, never faked with a plausible constant and never omitted. Deriving
material property channels from a flat colour image — a genuinely useful technique with
its own acceptance rules — is a neighbouring concern about texture authoring, not about
geometry transfer; the two must not be confused, because one produces measurements and the
other produces estimates. The bake side is
[high-to-low-bake-coverage](./techniques/high-to-low-bake-coverage.md).

## Binding is a mapping with a named target, not a button

Automatic rigging presents as a single operation and is really three: a *named target
skeleton* with a declared bone count and its inverse-kinematics chains, an *explicit
mapping* from whatever the source names its joints to what the target expects, and a
*verification that the mapping is total* over the bones the target requires. A binding
step that skips the second produces a skeleton whose bones are named plausibly and whose
animation retargets into a folded, flattened, or crumpled character. A step that skips
the third ships a mapping with holes and discovers them when a limb does not move.

State the target by name and version alongside the asset. Two humanoid skeletons with the
same joint topology and different naming conventions are not interchangeable, and a
mapping table authored against one is not evidence of anything about the other. See
[rig-preset-and-bone-remap-binding](./techniques/rig-preset-and-bone-remap-binding.md).

Structural success is not the end of the ladder here. A rig that imports, resolves and
binds can still deform incorrectly, and only played animation shows it — a rig test is not
complete until real motion data has run on it and been looked at.

## The automation surface will tell you a call exists, never that it works

Every content-creation application with a scripting interface has a headless mode, and
every headless mode has a set of operations that *resolve* — the function is present, the
introspection is clean, the arguments type-check — and then do nothing, or exit fatally.
The reason is structural: the operations depend on a context the headless mode does not
construct (a window, an editor loop, a physics scene, a ticking clock), and the binding
layer that exposes them to a script has no way to express that dependency.

This is the most transplantable thing on the bench, because it is not about geometry at
all. It is the general trap of confusing an interface's existence with its behaviour in
the mode you will actually ship. The discipline is to live-probe every operation in the
exact headless configuration you will run, and to record the result with the version it
was probed against, because the answer changes between releases in both directions. The
method is [headless-dcc-capability-limits](./techniques/headless-dcc-capability-limits.md);
its conclusion, once you have run it, is usually a sentence of the form *this mode is an
asset-authoring tool, not a simulation host* — a boundary you can then design around
instead of discovering at three in the morning.

## What finishing does not decide

The bench is a set of transformations, not a set of judgments, and it is worth stating
what it hands off. It does not set the face budget — budgets per asset class, in a
declared primitive, are their own subject, and the bench consumes one rather than choosing
one. It does not decide whether the mesh was acceptable in the first place; structural
acceptance, floater detection and defect classification run ahead of it and route to it.
It does not fix world scale — generators normalise their output to a unit-sized box
regardless of what the object is, and correcting that is an import-edge decision with its
own authority. It does not judge whether a tiling material reads correctly, nor whether the
finished asset's material stays inside a shader's sampler ceiling.

Finishing's own job is narrower and fully checkable: the right operations, on the right
version of the mesh, with every refusal and every blind spot stated out loud.
