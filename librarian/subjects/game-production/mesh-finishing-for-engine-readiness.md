---
subject: mesh-finishing-for-engine-readiness
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
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

## Architecture review - 2026-09-10

Read and assessed all 12 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/mesh-finishing-for-engine-readiness",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:20c2e8fd2b3b7542",
  "disposition": "reverify",
  "coverage": "All 12 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Custom normals may themselves be defective, and angle thresholds are asset/tool policies. Zero is a valid explicit angle distinct from an absent setting; an idempotent no-op on one asset does not justify removing normalization generally.",
    "Version, mode and prerequisites bound capability claims. Failed probes can share initialization or permission causes and do not prove universal impossibility; probing may have side effects and is not authorized merely by reading this document.",
    "Separate deriving maps from geometry from transferring authored source materials. Roughness, metallic and color signals may be baked from materials. Low geometry need not envelop the source when ray/cage settings provide coverage."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/geometry/mesh-finishing-for-engine-readiness/mesh-finishing-for-engine-readiness.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://docs.blender.org/manual/en/latest/render/cycles/baking.html",
      "scope": "Official manual search evidence for image-bake UV prerequisites, material passes and ray/cage controls. No DCC execution or provider round-trip was performed."
    }
  ],
  "documents": {
    "mesh-finishing-for-engine-readiness.md": {
      "disposition": "reverify",
      "reason": "Reverify universal reduce/unwrap/bake/bind ordering, claims that reduction always destroys UVs, source-map inference versus material transfer and texture-stage incompatibility. Two UV techniques are repaired; the bake and binding claims still require reconciliation."
    },
    "techniques/crease-angle-and-custom-normals.md": {
      "disposition": "reverify",
      "reason": "Custom normals may themselves be defective, and angle thresholds are asset/tool policies. Zero is a valid explicit angle distinct from an absent setting; an idempotent no-op on one asset does not justify removing normalization generally."
    },
    "techniques/headless-dcc-capability-limits.md": {
      "disposition": "reverify",
      "reason": "Version, mode and prerequisites bound capability claims. Failed probes can share initialization or permission causes and do not prove universal impossibility; probing may have side effects and is not authorized merely by reading this document."
    },
    "techniques/high-to-low-bake-coverage.md": {
      "disposition": "reverify",
      "reason": "Separate deriving maps from geometry from transferring authored source materials. Roughness, metallic and color signals may be baked from materials. Low geometry need not envelop the source when ray/cage settings provide coverage."
    },
    "techniques/pack-existing-vs-smart-unwrap.md": {
      "disposition": "clarify",
      "reason": "Repaired repacking as a UV change requiring dependent-map transfer, tangent-basis checks, material-aware overlap interpretation and explicit fallback. Joining objects does not guarantee one atlas or draw call."
    },
    "techniques/rig-preset-and-bone-remap-binding.md": {
      "disposition": "reverify",
      "reason": "Rigid held objects need not require finger bones, and facial morphs need not require face bones. Bone mapping must follow the target contract; helpers can inherit motion without a literal one-to-one remap."
    },
    "techniques/texture-pass-must-consume-the-bake.md": {
      "disposition": "reverify",
      "reason": "A black-box unchanged output does not prove an input was unread. Uniform color can be intentional, and provider-textured source assets may transfer color in a later bake even without a mesh-upload round trip."
    },
    "techniques/unwrap-only-the-low-poly.md": {
      "disposition": "clarify",
      "reason": "Repaired the mandatory fresh-unwrap claim: suitable retained target UVs are reusable. Requested polygon counts are not measured counts, and timeout is not proof of intrinsic unwrappability."
    },
    "applications/node--high-to-low-bake-coverage.md": {
      "disposition": "reverify",
      "reason": "The historical consumer bake refusal is a local capability limit, not proof that authored material signals are non-derivable or unbakeable. Recheck cage/ray coverage and map semantics. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--texture-pass-must-consume-the-bake.md": {
      "disposition": "reverify",
      "reason": "The historical not-better structural result does not establish visual quality or permanently disjoint product lines. A types package is not a runtime-version witness; investigate source-texture transfer before asserting no route exists. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--unwrap-only-the-low-poly.md": {
      "disposition": "reverify",
      "reason": "The historical argv sequence is planned execution, not inspected UV output. The reported normal no-op on one asset does not establish a general removal rule. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--headless-dcc-capability-limits.md": {
      "disposition": "reverify",
      "reason": "The historical headless engine probes apply only to their version, mode and prerequisites. Failure to access an operation in that setup does not prove universal absence. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
