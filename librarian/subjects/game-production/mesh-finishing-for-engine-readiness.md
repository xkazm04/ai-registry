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
      "path": "pof/src/lib/visual-gen/mesh-finish.ts",
      "result": "Read, not executed. Confirms UNWRAP_FACE_CEILING = 200_000, BAKEABLE_MAPS = ['normal','ao','diffuse','roughness'] and DEFAULT_SMOOTH_ANGLE = 30, and establishes that resolveBakeSize prefers an explicit size, then bakeSizeForExtent, and reaches a flat 1024 only as a fallback — which refutes the older application's 'bakeSize defaults to 1024'. Also establishes the file is 635 lines, not the 484 an application reports. Establishes nothing about any Blender behaviour."
    },
    {
      "path": "pof/src/lib/visual-gen/texel-density.ts",
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

## Intake 2026-09-18 - a generator's atlas is not an authored layout (lead, render tie)

Source: [[2026-09-18-smart-uv-unwrap-review]]. `pack-existing-vs-smart-unwrap` weighs one
axis, seam visibility. Measured over 7 generated meshes in pof, the provider's own layout
starts less even than a fresh projection (p95 1.42-1.58 vs 1.12-1.17). Reduction then
multiplies its badly-stretched share 4-10x, and island-scale averaging does not recover it.
The amendment scored 3/0/2. A blind operator pair at a 1024 bake tied, so nothing landed.
**Owed:** a render pair that could separate the arms (a 2048+ bake with texel-scale
close-ups, or an in-engine hero view). If one does, the technique gains a boundary for
generator-emitted coordinates. **Also owed:** the golden path's opening ("unwrapped lump")
is dated. All 7 provider meshes arrived with a UV layer, and hosted learned unwraps now
ship. That is a scoped `/deepen` dispatch, not an intake edit. The
`node--unwrap-only-the-low-poly` line citations remain drifted (the ceiling is now at
`mesh-finish.ts:22`), as the 2026-09-10 review already recorded.

## Intake 2026-09-20 - the path named only in a "when not to use"

Source: [[2026-09-20-ai-3d-character-in-a-day]]. 7 -> 8 techniques, 4 -> 5 applications.

Landed `techniques/conform-target-is-not-a-remap-row.md` plus two golden-path clauses.

**The subject named this pipeline exactly once, to route away from it.**
`rig-preset-and-bone-remap-binding`'s "when not to use" closes with "when the character
will be rebuilt by a parametric conform ... that path produces its own skeleton and its
own weights". That is the only occurrence of the concept across all 3,259 techniques in
the corpus (uncapped grep, with the exclusion line itself as the known positive, after a
`--prose` map at `--top 40` returned no asset-production subject). The golden path's "what
finishing does not decide" hands off five concerns and this is not among them, so the path
was excluded at technique level and caught by nothing.

**The one-directional order rests on an unstated premise**, now stated: *the shipped mesh
is derived from the generated one.* Where a rigged template exists it need not be - the
template is deformed to the generated mesh's proportions and ships, nothing is reduced,
the coordinates were authored before the run, and binding comes first because it arrived
with the template. That is not a violation of the order; it is a different bench.

**The fetched primary inverted the easy version.** The vendor confirms joints and skin
weights are generated automatically (hence no mapping table by construction) and then
names the boundary: an "estimate joints from mesh" setting preserves the hierarchy while
producing non-standard joint *orientations*, which is what a retarget reads. So a conform
target owes a different verification, not none - and "conform targets need no check" would
have been wrong in the expensive direction.

**Apply, `code`, `better`, shipped.** The seam (pof `rig-presets.ts`) was chosen to
falsify: if the preset table already separated the two kinds, the technique is a catch.
It held a conform target in the remap table - 584 declared bones, 0 mapping rows, 10 of 10
required chain endpoints unmapped, which by this subject's own rule is five limbs that
will not animate and is in fact an artifact of asking a remap question. Three readers of
the field, each blind differently, including a UI guarded on `length > 0` so the one
preset with no mapping displayed no mapping problem. pof `a0878ba1`, not pushed.

**Owed:** the conform row's real obligation - joints inherited rather than estimated - is
prose with no instrument behind it. Return when a fleet tree can read an exported rig's
joint orientations. **Not re-landed deliberately:** the quality claim (a conformed template
deforms better than a generic auto-rig) is already in this subject's decision rules, is
render-bound, and no local instrument on this machine can arm it.

**Unrelated to this run, noticed while reading:** the 2026-09-10 review's one-word defect
in the golden path ("a bake requested on an unwrapped mesh is not a bake") is still
present at current bytes. This run did not touch it - it is a `clarify` row already
recorded, not an intake finding.
