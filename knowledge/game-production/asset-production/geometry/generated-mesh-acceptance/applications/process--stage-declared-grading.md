---
layer: application
type: application
subject: generated-mesh-acceptance
technique: stage-declared-grading
stack: process
status: forged
verified_on: 2026-08-20
---

# Re-measuring a gate's folklore, then declaring the stage

`src/lib/visual-gen/critique-stage.ts` in the PoF repo exists because a standing claim
about the Tier-1 mesh gate was tested and turned out to be right in substance and wrong in
mechanism. The methodology is the transferable part.

## The claim under test

On record since 2026-08-14 in `docs/research/impact-map.md`, and repeated verbatim in the
header of `scripts/visual-gen/pof_tripo_smartlowpoly_arena.ts`:

> the Tier-1 gate reads raw, pre-retopo provider output against FINISHED game-tier
> thresholds and fails it near 100% of the time regardless of quality

and the shipped caveat printed beside every failing verdict said the mesh *"may fail on
face count alone"*.

## The re-measurement protocol

Run on 2026-08-20 and recorded in the module docblock (`critique-stage.ts:1-45`):

1. **Take the whole real corpus, not a sample** — all 52 `.glb` files under `generated/`,
   spanning TripoSR, Tripo3D cloud, and pipeline meshes.
2. **Re-derive the metrics independently** of the production extractor: straight from the
   glTF buffers in Node, rather than trusting stored verdicts.
3. **Grade with the repo's own `scoreMesh`** at per-class thresholds, so the measurement
   tests the real rule and not a re-implementation of it.
4. **State the bias direction of the re-derivation.** This one welds vertices on exact
   position where trimesh welds with a tolerance, so it can only ever find *more* components
   — making the resulting fail rate an explicit **upper bound**.
5. **Cross-check against live production verdicts**: four independent rolls of one prompt,
   `assetClass: 'prop'`, 0/100 each, reporting 16-50 floater fragments and 35-56 substantial
   parts every time.

## What it found

- **Face count never fails a mesh.** `scoreMesh` files `face-count` as a WARN with no fail
  rule at any threshold. A 1,492,072-face mesh graded against the `modular-part` ceiling of
  12,000 scores warn / 85. *"The shipped caveat named a mechanism that does not exist in the
  code it was printed beside."*
- **The fail rate is 10 of 52 (19.2%)**, not "near 100%".
- **All ten fails were `floaters`.** Not one `face-count`, not one `parts-over-budget`.
- **Retopo multiplies the dominant defect.** `tripo3d/jinx_v32_run.glb` — 1,482,446 faces,
  2 components, 1 floater — grades warn; its decimated game mesh
  `tripo3d/jinx_v32_run_game.glb` — 46,791 faces, 17 components, 16 floaters — grades
  **fail**.

## The response: state the tier, do not re-tune the number

The docblock states the decision rule in one sentence: *"That is why this module states the
tier rather than re-tuning a face-count threshold: re-tuning the number the claim blamed
would have changed exactly zero verdicts."* Substance preserved (a post-finish bar is
genuinely applied to pre-finish geometry, and nothing on disk has ever scored a pass),
mechanism corrected.

`MeshStage` is `'raw' | 'finished' | 'unknown'`, with `unknown` documented as *"The caller
did not say. Never guessed — an unstated stage is reported as unstated."*

The remedy partition is published as data, and its membership is measured:

- `FINISH_RESOLVES` (`:61-66`) = `face-count`, `budget-over`, `parts-over-budget`,
  `components-over-budget` — because `pof_mesh_finish.py` joins every part into one object
  and decimates to a face budget. **`floaters` is deliberately absent**: joining does not
  delete specks and decimation multiplies them, and *"listing it here would let a routed
  finish claim a cure it does not deliver."*
- `REROLL_RESOLVES` (`:78`) = `empty-mesh`, `degenerate-bbox` only — the bad-draw classes.
  Everything else is determined by the stage, not the draw, and re-rolling it "buys nothing
  but the bill (20 Tripo credits per generation)".

## The safety property

`assessStage` (`:120-155`) is pure and its docblock states the constraint: *"Display +
routing only. It reads a verdict; it can never produce or soften one — there is no path here
that turns a `fail` into anything else, which is the property that keeps 'the gate is
mis-tiered' from becoming 'so ship it anyway'."*

Two refusals are coded explicitly. When `!critique?.ok || critique.verdict === undefined`
it returns the empty assessment, commented *"a missing gate must not be dressed up as a
calibration problem."* And `misTiered` is narrow by construction (`:143`): true only when
`stage === 'raw'` and there are failing codes and `unaddressed.length === 0` and
`rerollResolvable.length === 0`.

`caveatFor` (`:157-180`) derives four distinct sentences from the actual codes present —
mis-tiered, raw-with-a-mix, unknown-stage, and finished-with-unaddressed — replacing the
blanket "may fail on face count alone" string that the re-measurement disproved. The
unknown-stage sentence is the honest refusal: *"pipeline stage not declared, so this verdict
cannot say whether … is a defect or an un-finished input — declare the stage to get a tiered
reading."*
