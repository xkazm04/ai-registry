---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: unwrap-only-the-low-poly
status: forged
laws: [a-number-carries-its-unit-and-basis, refuse-rather-than-destroy]
shared_with: []
use_when: [an unwrap hangs or never finishes, ordering a retopology and unwrap stage, a finishing run reports success with no usable texture coordinates]
---

# Unwrap only the low-poly

An automatic unwrap on a raw generated high-density mesh does not produce a bad layout. It
produces tens of thousands of islands, or it does not return at all. The rule is
absolute: **the unwrap runs on the reduced mesh, and only on the reduced mesh** — so the
unwrap request is not an independent flag, it is a request that is *conditional on a
reduction having been planned*, and the pipeline enforces the condition rather than
documenting it.

## Why the high-poly cannot be unwrapped

An angle-based projection cuts a new island wherever the surface bends past its threshold.
On a hand-modelled or retopologised surface the bends are deliberate and sparse. On a
dense reconstruction from a generative model, micro-curvature is everywhere: the
threshold is exceeded thousands of times, the island count approaches the face count, and
packing degenerates into a problem the packer cannot solve in bounded time. The two
observed outcomes are an atlas of unusable slivers with no texel density anywhere, and a
process that pins a core and never terminates.

Reducing first removes the micro-curvature that was generating the cuts. The same
algorithm on the same shape at a fraction of the density produces an island count in the
tens, not the tens of thousands.

## Procedure

1. **Make the unwrap conditional on a reduction target.** If no target face count was
   supplied, the unwrap does not run. This is a plan-time decision computed before any
   process is spawned, not a runtime discovery.
2. **Apply a face ceiling to the reduction target itself.** Even a requested reduction can
   be too generous to unwrap. A working ceiling is **200,000 faces** as the post-reduction
   target; above it, refuse the unwrap and say the target must come down. State the number
   with its unit and its basis — *faces, counted on the reduced mesh, after reduction* —
   because the same figure means something different as triangles, as quads, and as a
   count on the source.
3. **Refuse, do not silently drop.** A refused unwrap emits a reason naming the condition
   that failed and the action that would satisfy it. A caller that asked for texture
   coordinates and received a mesh without them, with no explanation, will ship the mesh.
4. **Propagate the refusal downstream.** A bake requested alongside a refused unwrap is
   also refused, for the stated reason that there is no texture space to write into. Never
   run a bake into a mesh whose coordinates were not created this run.
5. **Record which version was unwrapped** in the run report, so a later stage can tell
   whether the coordinates it sees are the ones this pipeline authored.

## Decision rules

- **No reduction target → no unwrap.** Not a warning; a refusal with a reason.
- **Reduction target above the ceiling → no unwrap**, with the ceiling and the requested
  target both named in the reason.
- **Unwrap refused → bake refused.** Dependent operations fail together and say so.
- **The ceiling is a property of the unwrapper, not of the asset class.** Do not conflate
  it with the asset's face budget, which is smaller and set elsewhere for different
  reasons. The ceiling is the point past which the tool stops working; the budget is the
  point past which the asset costs too much. Passing the ceiling is not permission.
- **A mesh that arrives with authored coordinates is a different case.** The rule bans
  *projecting* a high-poly, not *keeping* a layout the source already had — that choice is
  the pack-versus-project decision and it still happens after reduction.

## Why a refusal beats an attempt

An unwrapper that hangs is worse than one that declines, and not only because of the
wasted core. A hung sub-process inside an automated finishing stage produces a run with no
verdict: no output, no error, and a timeout that looks identical to a crash, a network
stall, or a missing executable. The refusal converts an unbounded, unattributable failure
into a stated precondition failure that names its own remedy. That is a result, and it is
the better one.

The same instinct governs the reduction's neighbours. Any operation whose cost is not
bounded by something the pipeline controls gets a ceiling and a refusal path, and the
ceiling is expressed in the unit the operation actually scales with.

## When not to use this

- **When the asset is a small, simple prop and no bake is planned.** A generator asked
  directly for cheap topology, with a light texture pass afterwards, skips this stage
  entirely. That path has a quality ceiling and is a dice-roll for hero assets, but for a
  crate it is the cheaper correct answer.
- **When the source is already clean production topology.** A hand-authored or
  deterministically remeshed quad mesh at a sane density is not the case this rule
  defends against; unwrap it directly.
- **When the layout must survive rather than be recreated.** If the reduction preserved
  the source's coordinates well enough to re-pack, re-projecting throws away authored
  seams that are usually better than anything an angle threshold will find.
