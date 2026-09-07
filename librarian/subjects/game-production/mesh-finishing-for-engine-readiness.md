---
subject: mesh-finishing-for-engine-readiness
domain: game-production
last_touched: 2026-09-07
dry_streak: 0
---

# mesh-finishing-for-engine-readiness

First touch by `/intake`: 2026-09-07, a 3D-AI creature build-walkthrough
([[../../sources/2026-09-07-3d-ai-creature-workflow]]). A mature subject that absorbed
three of the run's candidates as catches and gave up one seam at its downstream edge.

## State

6 -> 7 techniques, 3 -> 4 applications.

Landed:

- `techniques/texture-pass-must-consume-the-bake.md` - the ordering constraint between
  the bake and whatever colours the asset afterwards. Anchored on **L13, declaring an
  input is not consuming it**, which is precisely a normal map that rides along on the
  material and is never read; L13 was cited by two techniques and neither was in this
  lane.
- `applications/node--texture-pass-must-consume-the-bake.md` - `applied: simulation`,
  `ab_verdict: not-better`, `proof: structural-only`.

## The seam, and why the golden path could not see it

The subject's chain is one-directional and exhaustively argued - reduce, unwrap, bake,
bind - and it **ends at bind**, handing texture authoring to a neighbouring concern. That
handoff is correct and it hid the fact that a downstream stage can *invalidate* the most
expensive thing the bench produces. The subject models mesh **version** provenance with
great care ("every operation must name the version of the mesh it ran on") and had nothing
on what happens to the maps once the asset leaves.

## The apply step refuted the technique, and the technique is better for it

The seam was chosen to falsify. In the consumer tree the re-texturing module accepts
**only a prior task id from its own provider**, ground-truthed against that provider's
SDK - so a bench-baked mesh cannot be submitted at any price and the technique's central
procedure step (probe the service) is unrunnable rather than merely uninformative.
Generator-textured and bench-baked are disjoint product lines there; nothing crosses.
The technique gained "When the round trip does not exist at all", which relocates the
routing decision from after finishing to commissioning time. This is the third
consecutive round in which a seam chosen to falsify produced a better finding than
confirmation would have.

## Owed

A paired arm, when any pipeline in the fleet adopts a texturing engine that accepts
user-supplied meshes. Until then the bench-baked line has no budgeted colour engine
downstream of it, in the corpus or in the tree.
