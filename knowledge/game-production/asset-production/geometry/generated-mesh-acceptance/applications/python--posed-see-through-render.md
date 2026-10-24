---
layer: application
type: application
subject: generated-mesh-acceptance
technique: posed-see-through-render
stack: python
status: forged
verified_on: 2026-10-24
verified_against: python@3.13
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Posed see-through on a generated-hero pipeline

The version is witnessed by the interpreter embedded in the headless DCC that ran the instrument (Blender 5.2.2,
Windows ARM64, EEVEE). The tree is the PoF game project's generated-asset pipeline: a
local generator's characters are finished, decimated to roughly 38k-72k faces, fitted to
a 23-bone engine-mannequin skeleton, and gated by a Tier-1 structural script that emits
watertightness, winding consistency and a per-component face histogram from the **rest
mesh only**. Nothing in that gate renders the character, and nothing poses it.

## A and B

- **Arm A, the gate as it stands:** the structural card on the rest mesh. The four finished
  heroes are near-single-shell (17-68 components, one holding about 98.5% of the faces).
  They are the population the card was built to pass.
- **Arm B, the technique:** a two-sided unlit render, back faces flagged, six cameras, the
  rest pose plus 36 joint rotations (six bone groups, three axes, both signs). Each view is
  scored as the excess over a voxel-remeshed closed copy of the same mesh carrying
  transferred weights.
- **Instrument controls**, run first: the closed copy read 0 of 6 rest views; the same copy
  with 292 chest faces deleted fired in 3 of 6 rest views (max 2.1%).

## What was read

| Hero | Rest share | Fold-free posed views | Excess median | Excess max | Views over rest max |
|---|---|---|---|---|---|
| warrior A | 0.95% | 30 / 216 | 2.88% | 10.38% | 26 |
| warrior B | 42.1% | 22 / 216 | 39.9% | 44.7% | 5 |
| sorcerer A | 32.3% | 59 / 216 | 31.1% | 45.8% | 5 |
| sorcerer B | 0.95% | 45 / 216 | 0.93% | 1.49% | 5 |

Two different defects, and arm A sees neither:

- **Warrior B and sorcerer A show a third to two-fifths of their silhouette as back faces at
  rest.** The frames show large patches, not specks, so this is orientation (winding facing
  inward over whole regions). With single-sided engine materials those regions are culled:
  the shipped character has holes the size of its chest.
- **Warrior A opens only when posed.** In thigh-lift poses the hip and skirt plates part and
  the inside shows (excess up to 10.4%) while the closed copy stays clean. At rest it looks
  identical to sorcerer B, whose closed robe stays flat in every pose.

**Target** (see-through views found that arm A passed) moved from 0 to 3 of 4 heroes.
**Floor** (the instrument's verdict on a mesh known to be closed) held at 0 rest views, and
the planted hole fired. Verdict: `better`.

## The seam was chosen to falsify

The source's claim was about meshes with hundreds of loose islands. These heroes had been
welded down to a handful, and the cheap prediction was that posing would add nothing. A
caught outcome would have narrowed the technique to unwelded output. Instead it held for one
welded hero in four and refuted a different assumption: the first sweep counted posed folds
on the **closed** control (0% at rest, up to 16% posed). Without the closed-copy floor the
raw counts would have convicted every mesh, including the control. That floor is now the
technique's step 2.

## What this realisation cannot do

- It does not know the character's actions. The pose set is a blind joint sweep, which is
  why only 22-59 of 216 views were fold-free. A sweep driven by the project's actual attack
  and locomotion poses would keep most views.
- It renders at 192 px. Back-face specks along sharp creases near 1% are rendering noise at
  that size, which is why both clean heroes floor at about 0.95% rather than zero.
- It reports orientation and gaps in one number. The rest render separates them by
  magnitude; a normals-recompute pass before the sweep would separate them by construction.
