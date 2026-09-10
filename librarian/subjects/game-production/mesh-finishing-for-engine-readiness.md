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

## Architecture review - 2026-09-10 (re-review after the compression revert)

Read all 12 documents at current bytes, and read (not executed) the module the three Node
applications are about: `src/lib/visual-gen/mesh-finish.ts` in the `pof` working tree.
This supersedes the earlier 2026-09-10 record on this note, whose digest the revert
invalidated, and it upgrades two of its `reverify` rows to concrete findings.

**The golden path has a word that inverts its own rule.** Under "Unwrapping is the gate
on baking" it reads: "With no texture space there is nothing to write into, so a bake
requested on an unwrapped mesh is not a degraded bake, it is not a bake." Everywhere else
in the subject — the technique, the ordering arrow, the application — "unwrapped" means
*has been through the unwrap*, i.e. has UVs. As written the sentence says a bake on a mesh
with UVs is not a bake, which is the opposite of the section it sits in. This is a
one-word defect and it sits in the load-bearing paragraph of the ordering argument.

**Two applications disagree about how the bake is sized, and the source settles it against
the older one.** `node--high-to-low-bake-coverage` (verified 2026-08-30) says "`bakeSize`
defaults to 1024 — a starting point for a single-object asset";
`node--texture-pass-must-consume-the-bake` (verified 2026-09-07) says the bench "sizes the
bake from texel density rather than a flat default". At source, `resolveBakeSize` returns
an explicit `bakeSize` first, then `bakeSizeForExtent(targetExtentM)` from a
`texel-density.ts` module whose own header describes the flat 1024 as the thing it exists
to replace, and only then falls through to `1024`. So 1024 is now the last resort for an
asset of unknown real-world extent, not the default. The newer application is right and
the older one is stale on this point — and the technique's step 4 ("choose the resolution
as a texel density, not as a number ... a fixed default is a starting point ... not a
specification") is what the repo went on to implement, which is worth recording as the
standard leading the realisation rather than following it.

The same file has moved under the older applications' feet in a smaller way:
`mesh-finish.ts` is 635 lines, not the 484 `node--unwrap-only-the-low-poly` reports, and
its line citations have drifted by tens of lines (`UNWRAP_FACE_CEILING` is at 22, not 21;
`unwrapPlan`'s refusal is near 348, not 232–244). The constants themselves are unchanged:
`UNWRAP_FACE_CEILING = 200_000`, `BAKEABLE_MAPS = ['normal','ao','diffuse','roughness']`,
`DEFAULT_SMOOTH_ANGLE = 30`. Line numbers in an application are a maintenance cost the
corpus accepts; naming the symbol is what survives, and these documents mostly do both.

The techniques themselves I would not touch. The derivable/not-derivable line through the
channel set is argued from the ray-casting mechanism rather than asserted; the
authored-normals authority rule is stated with the measured no-op behind it; the
pack-versus-project asymmetry ("one direction destroys silently, the other refuses") is
the sharpest sentence in the subject. `texture-pass-must-consume-the-bake` gained its
strongest section — the provider that accepts only its own prior task ids, which makes the
two lines disjoint at commissioning time — from an application that returned `not-better`,
and that is the shape of evidence this corpus should want more of.

What I could not verify: every Blender-side number here (0 of 30,967 normals unchanged;
99.9% rewritten by a mean of 73 degrees; `select_interior_faces` selecting 1 face on a
welded wall and 0 on an enclosed shell) is a measurement against Blender 4.2 that I did
not re-run and cannot re-run from a source read. Likewise the UE 5.8.0 probe corpus in
`process--headless-dcc-capability-limits`: reading `ue-gotchas.ts` would confirm the entry
exists, not that the probe result still holds on the current engine build. Those stay
`reverify`, and refreshing them needs a live probe, not a re-read.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/mesh-finishing-for-engine-readiness",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:f3423260876a233d",
  "disposition": "clarify",
  "coverage": "All 12 owned documents read at current bytes. src/lib/visual-gen/mesh-finish.ts and texel-density.ts read (not executed) in the pof working tree. Not evaluated: any Blender run, any UE session, any bake, any probe re-execution, any measured normal or face count.",
  "counterexamples": [
    "Taken literally, the golden path's 'a bake requested on an unwrapped mesh is not a bake' forbids the exact ordering the same section prescribes.",
    "An asset with no declared real-world extent still receives a flat 1024 bake, so the texel-density rule the technique states has a silent fallback the technique does not describe.",
    "The cull ceiling is 200k faces on the pre-decimation mesh, but the inputs this bench exists for routinely arrive far denser than that, so the operation the golden path calls meaningful-only-before-reduction is refused on the common case.",
    "A part whose normal salience is high and whose texturer refuses external meshes has no route at all: the subject's routing key is applied at commissioning, and it gives no reading for an asset already generated on the wrong line."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/visual-gen/mesh-finish.ts",
      "result": "Read, not executed. Confirms UNWRAP_FACE_CEILING = 200_000, BAKEABLE_MAPS = ['normal','ao','diffuse','roughness'] and DEFAULT_SMOOTH_ANGLE = 30, and establishes that resolveBakeSize prefers an explicit size, then bakeSizeForExtent, and reaches a flat 1024 only as a fallback — which refutes the older application's 'bakeSize defaults to 1024'. Also establishes the file is 635 lines, not the 484 an application reports. Establishes nothing about any Blender behaviour."
    },
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/visual-gen/texel-density.ts",
      "result": "Read, not executed. Its header describes the flat 1024 default as the defect it exists to replace and sets DEFAULT_TARGET_PX_PER_M = 1024, corroborating that the texel-density path is the current sizing authority. Says nothing about whether the resulting map sizes are correct for any asset class."
    }
  ],
  "documents": {
    "mesh-finishing-for-engine-readiness.md": {
      "disposition": "clarify",
      "reason": "'a bake requested on an unwrapped mesh is not a bake' inverts the rule of the section it states; every other document uses 'unwrapped' to mean 'has UVs'."
    },
    "techniques/unwrap-only-the-low-poly.md": {
      "disposition": "keep",
      "reason": "Ceiling on the reduction target rather than the input, the refusal-beats-a-hang argument and the ceiling-is-not-a-budget distinction are all correct; UNWRAP_FACE_CEILING = 200_000 confirmed at source."
    },
    "techniques/crease-angle-and-custom-normals.md": {
      "disposition": "keep",
      "reason": "One-authority-per-mesh rule, the refuse-do-not-clear order and the separate fields for no-op versus unrun are stated exactly; DEFAULT_SMOOTH_ANGLE = 30 confirmed at source."
    },
    "techniques/high-to-low-bake-coverage.md": {
      "disposition": "keep",
      "reason": "The derivable/authored split is argued from the bake mechanism; the texel-density rule in step 4 is what the repo subsequently implemented."
    },
    "techniques/pack-existing-vs-smart-unwrap.md": {
      "disposition": "keep",
      "reason": "Asymmetric-value argument, the requested-versus-applied reporting rule and the mixed-input ordering are sound."
    },
    "techniques/rig-preset-and-bone-remap-binding.md": {
      "disposition": "keep",
      "reason": "Three-operation decomposition, totality verification and the structural-success-is-not-a-rig-test rung are correct; bone counts are offered as selection criteria, not specifications."
    },
    "techniques/headless-dcc-capability-limits.md": {
      "disposition": "keep",
      "reason": "Silent-no-op versus fatal-exit split and the probe-in-the-shipping-configuration rule generalise beyond geometry and carry no unsupported claim."
    },
    "techniques/texture-pass-must-consume-the-bake.md": {
      "disposition": "keep",
      "reason": "Three-case routing plus the disjoint-product-lines section earned from a not-better application; the per-version expiry rule is stated."
    },
    "applications/node--high-to-low-bake-coverage.md": {
      "disposition": "clarify",
      "reason": "'bakeSize defaults to 1024' is stale: resolveBakeSize now prefers an explicit size, then bakeSizeForExtent from texel-density.ts, and reaches 1024 only when no extent is known."
    },
    "applications/node--unwrap-only-the-low-poly.md": {
      "disposition": "clarify",
      "reason": "The named constants and refusal shapes hold at source, but the file is 635 lines rather than the stated 484 and every line citation has drifted."
    },
    "applications/node--texture-pass-must-consume-the-bake.md": {
      "disposition": "keep",
      "reason": "The not-better verdict, the unrunnable-arm reasoning and the stated return condition are exactly what an honest negative row should look like; its texel-density claim is the one the source supports."
    },
    "applications/process--headless-dcc-capability-limits.md": {
      "disposition": "reverify",
      "reason": "Every UE 5.8.0 probe result and the 2026-07-22 Chaos Cloth naming gotchas are live-probe evidence that a source read cannot refresh; availability moves in both directions across releases."
    }
  }
}
```
