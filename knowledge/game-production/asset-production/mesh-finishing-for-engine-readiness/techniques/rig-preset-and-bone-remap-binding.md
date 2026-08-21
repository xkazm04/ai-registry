---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: rig-preset-and-bone-remap-binding
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient, one-authority-per-quantity]
shared_with: []
use_when: [binding a generated character to a skeleton, retargeted animation deforms wrongly, choosing a target skeleton for an asset class]
---

# Rig presets and bone remapping

Automatic rigging looks like one operation and is three: a **named target skeleton**, an
**explicit source-to-target bone mapping**, and a **verification that the mapping is
total**. Treat it as one and you get a character that imports cleanly, binds without
error, and folds in half the first time real animation plays on it.

## The target skeleton is a declared artifact

A target skeleton is not "a humanoid rig". It is a named preset carrying, at minimum: an
identifier, a bone count, a root bone name, whether it has finger bones, whether it has
face bones, and its inverse-kinematics chains stated as start-bone and end-bone pairs. A
useful reference humanoid runs around **67 bones** with five chains — spine from pelvis to
head, an arm chain per side from clavicle to hand, a leg chain per side from thigh to
foot. A stripped indie skeleton at roughly **25 bones** drops the fingers and is markedly
cheaper to animate. A full facial rig runs into the hundreds and is a different class of
asset with a different authoring path.

Those numbers are selection criteria, not trivia. Bone count is the cost driver for
skinning and for animation memory; finger bones decide whether a hand can hold anything;
face bones decide whether performance capture is even possible. Pick the preset from the
asset's role, and state which preset the asset was bound to alongside the asset, because
two skeletons with identical joint topology and different naming conventions are not
interchangeable and a downstream retarget must know which it has.

## The mapping is explicit, tabular, and single-sourced

Source skeletons — whatever produced the animation or the auto-rig — use their own naming
convention, usually with a vendor prefix. The mapping from those names to the target's is
a table of pairs, authored once per (source convention, target preset) combination and
owned in exactly one place. Two copies of a bone table in two parts of a pipeline is the
classic silent divergence: both look right, one is stale, and the symptom appears as an
animation defect rather than as a data defect.

Where a target has no mapping table, say so explicitly and route to the custom path. A
skeleton that requires bespoke retargeting is a legitimate state; an empty table treated
as a complete one is not.

## Procedure

1. **Select the preset by asset role** and record its identifier with the asset.
2. **Resolve the source convention** from the incoming skeleton's actual bone names, not
   from what the producer was expected to emit.
3. **Look up the mapping table** for that pair. Missing table → refuse and route to the
   documented manual path, naming what is missing.
4. **Verify totality.** Every bone the target requires for its declared chains must be the
   target side of some mapping row. A chain whose start or end bone is unmapped is a limb
   that will not animate. Report the unmapped set, not a boolean.
5. **Verify the reverse direction too** — source bones with no target are usually benign
   (leaf bones, twist helpers) but a large unmapped remainder means you resolved the wrong
   convention.
6. **Normalise the export contract before the round trip.** The conventions that break a
   skeleton in transit are few and always the same: leaf-bone insertion on export, an
   armature whose root object is not named as the engine expects, extra objects riding
   along in the selection, and axis or scale conventions that flip the character onto its
   back on import while the authoring tool played it perfectly. Fix these in the exporter's
   settings, not in the engine afterwards.
7. **Play real animation on it and look at the result.** Not a frame, not the bind pose —
   a full clip, rendered.

## Decision rules

- **Structural success is not a rig test.** Bound, imported and resolved is the floor. The
  binding is only proven when animation data has driven it and the deformation has been
  watched; nothing below that rung implies it.
- **An unmapped required bone is a hard failure, not a warning.** It cannot degrade
  gracefully — the limb simply does not move.
- **The mapping table has one owner.** Everything else reads it.
- **Prefer transferring skinning weights from an already-correct body over a generic
  auto-rigger** when one exists. Weights authored against the exact target skeleton
  deform better than any generic solve, and the transfer is a cheap operation.
- **A rigid accessory takes a single-bone binding.** Do not solve weights for something
  that does not deform.

## When not to use this

- **When the asset does not deform.** Props, architecture and static set dressing take no
  skeleton; binding them adds cost and a category of defect for nothing.
- **When the character will be rebuilt by a parametric conform** rather than bound as-is.
  That path produces its own skeleton and its own weights, and a prior binding is discarded.
- **When the source is a template-free learned rigging model** whose output skeleton is
  emitted per asset. There is no preset to map to until you have named and frozen the
  skeleton it produced, at which point this technique applies to that frozen artifact.
