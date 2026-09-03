---
layer: technique
type: technique
subject: generated-asset-world-scale
technique: reference-skeleton-size-check
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
use_when: [validating a generated humanoid before rigging, retargeted animation slides or misses grips, deciding where the canonical character height lives]
---

# Reference skeleton size check

## The concern

A generated humanoid can be exactly the right height and still be unusable. Uniform scale
correction fixes total size and cannot fix *build*: relative limb, torso and head lengths
survive it untouched. When retargeted animation is then applied — motion authored against
the project's reference skeleton — the mismatch surfaces as foot slide, hands that miss a
weapon grip, eyeline that sits wrong in dialogue framing, and attachment sockets that land
inside the mesh.

The reference skeleton is the right instrument for both checks because it already is the
authority: it defines the canonical character height, and its bone hierarchy states the
segment proportions every animation assumes.

## Why the skeleton and not a number

Projects that keep a character-height constant separately from the skeleton end up with
two authorities for one quantity. The skeleton changes — a new reference rig, a different
proportion pass — and the constant does not, and nothing detects the divergence because
nobody compares them. Read the height from the skeleton. If the skeleton is not machine-
readable in a given context, extract the height into a derived constant that names its
source, and re-derive rather than re-type it when the skeleton changes.

## Procedure

1. **Take the reference skeleton's overall height** and the lengths of its principal
   chains — spine root to head, hip to foot, shoulder to hand.
2. **Measure the same on the delivered mesh.** Before rigging this must be geometric: the
   bounding box gives height; a landmark pass or a coarse fit gives the segment split.
   After rigging it is direct, from the bound skeleton.
3. **Grade height first**, against the class tolerance, and derive the correction.
4. **Grade proportion second**, as ratios rather than absolutes — leg length over total
   height, arm length over total height — so the check is independent of the size
   correction and survives it.
5. **Report the two separately.** "Right size, wrong build" and "right build, wrong size"
   have completely different fixes: the first is a regeneration or a modelling pass, the
   second is one number at import.
6. **Where possible, do the comparison visually as well**, with the reference figure and
   the delivery side by side. The long-standing manual habit is importing the reference
   skeleton into a modelling package purely as a size reference, and it remains the fastest
   way for a human to see a proportion problem that a ratio table understates.

## Decision rules

- **When height is correct and proportion is off, do not scale further.** Non-uniform
  correction to force proportions distorts normals and breaks rigid attachments. Send it
  back to generation with the proportion stated in the brief.
- **When proportion is off by less than the retargeter's tolerance, accept it.** Modern
  retargeting absorbs modest differences; the bar is whether the motion reads, not whether
  the ratios match to a percent.
- **When the mesh is stylised on purpose, compare against the stylised reference, not the
  realistic one.** A short heavy silhouette is a design decision; graded against a
  realistic skeleton it fails for being what it was asked to be. The reference must be the
  one this character will actually be animated against.
- **When there is no reference skeleton for a class**, there is no proportion check for it,
  and the honest verdict is that proportion was not evaluated — not that it passed.
- **When the check runs before rigging, label its result provisional.** A geometric
  landmark estimate is a weaker rung of evidence than a measurement off a bound skeleton,
  and the difference must be visible in the report rather than smoothed away.

## What this check does not prove

Passing height and proportion says the character is the right size and the right build. It
says nothing about whether skin weights deform correctly, whether the mesh is separable
into the parts a modular character needs, or whether the silhouette reads at gameplay
distance. Those are separate rungs of evidence, and structural agreement with a skeleton is
necessary for them and never sufficient. A claim of "ready to animate" names the rung it
was proven at.

## When not to use it

- **On non-humanoid assets.** A creature with a different topology has no reference
  skeleton to compare against unless the project maintains one for that body plan; invent
  the reference before running the check, not during it.
- **On props and environment pieces.** Their size authority is the level's grid and the
  design spec, not the character rig — though the character height remains the sanity
  reference a human uses to judge whether a doorway is a doorway.
- **As the sole scale check for a character that will never be animated.** A statue in the
  background needs the height check and does not need the proportion one.
