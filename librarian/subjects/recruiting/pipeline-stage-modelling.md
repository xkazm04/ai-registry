---
subject: pipeline-stage-modelling
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# pipeline-stage-modelling

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 2cfe873e; worked from origin/main 8964e2a9 because the primary checkout was eight commits behind. All three applications were verified 2026-08-20.

## 2026-09-29 - the tree lane: kp grew a role, closed one gap, opened another, and deleted the surface one application described

**Depth rung:** L2 for the applications (kp working tree at HEAD, cited lines re-resolved against `pipeline-stages.ts`, `pipeline-axis.ts`, `aging-policy.ts`, `stage-migration/route.ts`, `decision-config-schema.ts`, `kit/PipelineKitOffBoard.tsx`, `usePipelineFilters.ts`). L1 for the golden path and techniques: no web lane, no blind training-data lane, no counter-evidence lane run against the literature.

**What moved in kp:** a seventh role, `homework`, exists and is pre-gate but not a screening column. Per-column aging moved onto the axis as `slaDays` with a role default beneath it. The old board view, its off-axis strip and its filter bar were deleted (`b7fde0c32`).

**Landed in applications (verified_on 2026-09-29, verified_against set):**
- **node / screening gate.** Line numbers re-resolved throughout. New section: the pre-gate set is now the range minus `homework`, so the "lockstep by construction" comment is true of the gate and no longer of the two sets. The aging-threshold shortfall is closed (`slaForStage` resolves override, team `slaDays`, role default). New shortfall found: `screenStageOutcome` is not axis-aware, its only caller passes no axis, and its entry branch compares the literal `"Accepted"`; on a board with a stage the shipped axis lacks the automated screen reads as advisory and nothing errors. It is absent from the consumer's own name-coupling triage.
- **react / off-axis recovery.** Rewritten. The two files it cited no longer exist. The occupant half survives as `PipelineKitOffBoard` (always offers "Move all to...", implemented as a loop of single moves). The deep-link half did not survive: `resolveStageFilter` has no caller outside tests and no kit component reads `stageFilter`, so a stale `?stage=` link filters by a column the board no longer draws and says nothing, while the consumer's doc still describes the notice.
- **node / tombstones and migration.** Line numbers re-resolved. New section: four guards the technique does not list (`source_kept` refusal, the axis-version token checked twice, coded refusals with data, the capability gate) and the corrected failure message. The re-add shortfall is narrowed: the validator refuses a stage that is both live and retired; what remains is an un-retire by dropping the tombstone, whose composer path was not read.

**Landed in techniques and golden path:** the vocabulary technique and golden path gain `homework` and the cost of adding a role; the golden path's role count and property count were miscounted before and are corrected; the aging seam states where the role default and the team cadence live; screening-gate-index gains the subtract-from-the-boundary rule and the axis-threading rule for the permission table; off-axis recovery gains two decision rules (the notice must move with a rewritten surface; a "move all" loop reports what did not move); tombstones step 4 gains the axis-version re-check. All are single-deployment field evidence kept as rules inside existing techniques. No new technique.

**Verified, left alone:** the closed-vocabulary argument, the terminal-as-one-role argument, the entry/terminal well-formedness set (moved lines only), the per-team benchmark axis (`axisFor`), the cross-team comparability claim.

**Not evaluated:** the Settings composer (whether it can un-retire an id), whether the kit view surfaces an active `?stage=` filter through a component this run did not find, the org-benchmarks k-anonymity floor, the `docs/features/pipeline/README.md` claims beyond the lines cited. No web lane and no blind lane, so nothing here earns technique-level convergence. Return condition: a kp change to `screenStageOutcome` or the kit filter surface, or 2026-12-29 for the applications clock.

**Not landed:** no new technique.

## Impact

`build-registry-map` at the landing: kp joins the subject through eleven context pairs, every one `state: unknown` (none judged), so no stale verdict and no `/conform --stale` queue. No other mapped project has a pair with this subject. The run rewrote the fleet maps on disk for the recruiting bundle digest; kp's `.ai/registry-map.json` working-tree diff was left uncommitted because kp carries sibling work in flight.

## Applied

No technique is new and no golden-path rule flipped in a way a project could try: `homework` and the subtraction rule already ship in kp, and the two shortfalls found (`screenStageOutcome`, the orphaned deep-link notice) are kp deviations reported here, not registry-driven changes. No `applied.md` row is owed. Return condition for an `unapplied` row: when kp threads the axis through `screenStageOutcome`, apply the axis-threading rule there as a simulation with a renamed-entry axis.
