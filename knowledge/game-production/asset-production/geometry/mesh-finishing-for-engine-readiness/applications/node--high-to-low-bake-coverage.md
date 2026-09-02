---
layer: application
type: application
subject: mesh-finishing-for-engine-readiness
technique: high-to-low-bake-coverage
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The bake plan that refuses metallic by name

`src/lib/visual-gen/mesh-finish.ts` declares the bakeable set as data and checks the
request against it, rather than letting whatever Blender happens to expose decide the
contract.

```
export const BAKEABLE_MAPS = ['normal', 'ao', 'diffuse', 'roughness'] as const;
```

The type `BakeMap` (line 35) is deliberately wider than that list — it includes
`'metallic'` — so a caller can *ask* for a channel the pipeline will not produce, and the
plan can refuse it by name. `bakePlan(requested)` (lines 267–286) partitions the request
into `run: BakeMap[]` and `skipped: SkippedBake[]`, deduplicating as it goes, and every
skipped entry carries the channel and a reason string:

> "Cycles has no metallic bake pass — it needs an emission re-wire of every source
> material, which is unproven here; the map is not claimed rather than faked"

The function's own docblock states the honesty rule the technique is built on: *"Refusing
it by name beats dropping it silently, which would let a caller read a 3-map result as the
full PBR set it asked for."* The refusal is not laziness about metallic — the comment
explains exactly why it is unproven: baking it means rewiring every source material's
Metallic input through an Emission shader and baking EMIT, *"graph surgery that behaves
differently for a constant, a texture and a mix — not something to claim without a live
Blender run."* That is the technique's rule about not adding a channel on the strength of
documentation, written down at the call site.

`MeshFinishResult.bakeSkipped` carries the list back with the comment *"a partial PBR set
must never be reported as a full one"*, alongside the four per-channel path fields
(`normalMapPath`, `aoMapPath`, `diffuseMapPath`, `roughnessMapPath`). `bakeSize` defaults
to 1024 — a starting point for a single-object asset, not a texel-density specification.

## Where the neighbouring technique lives

The complementary half — deriving property maps from a flat colour image rather than from
geometry — is a separate practice in the same repo, in the generation-practice corpus at
`src/lib/visual-gen/reference-roles.ts`: *"Split the color map from the PBR material set —
AI for color, layered materials for properties."* Its rule is that AI-generated base colour
is production-usable while roughness/metalness/height are not, and that they should be
layered on procedurally. That is an estimation path; `bakePlan` is a measurement path.
Keeping them in separate modules with separate vocabulary is what stops an estimated
channel entering a set labelled "baked".

## The measured no-op that hardened the smoothing rule

The same file records the finding behind `crease-angle-and-custom-normals`. `smoothAngle`
(lines 131–143) defaults to `DEFAULT_SMOOTH_ANGLE = 30` — *"30° keeps a hard-surface bevel
crisp while letting an organic body read as curved"* — but the pass *"only ever re-shades a
mesh that has NO custom split normals"*. Measured on Blender 4.2 against real Tripo output:
a generated `.glb` already carries custom normals, every polygon is already smooth, custom
normals override the crease angle, and the pass changed **0 of 30,967 exported normals**.
Forcing it by clearing them *"rewrote 99.9% of normals by a mean of 73° — worse
information, not better."* The refusal surfaces as `shadingSkippedReason`, and the applied
case surfaces as a `shading` string that names the rule and its angle (`auto_smooth@30`).

## What the repo taught upward

The "not claimed rather than faked" formulation is the repo's, and it is the sharpest
statement of the technique's central rule. The measured 0-of-30,967 no-op is likewise a
finding a draft would not have produced — it converts "check whether the input already
conforms" from a plausible suggestion into a rule with a number behind it.
