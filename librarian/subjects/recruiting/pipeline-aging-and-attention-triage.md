---
subject: pipeline-aging-and-attention-triage
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# pipeline-aging-and-attention-triage

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 2cfe873e; worked from origin/main dad733f4 because the primary checkout was four commits behind. The applications were verified 2026-08-20 (node, process) and 2026-09-20 (react).

## 2026-09-29 - the tree lane: the consumer adopted the techniques, and three applications described a tree that no longer exists

**Depth rung:** L2 for the applications (kp at ef5a31a8a, cited lines re-resolved against `aging-policy.ts`, `attention.ts`, `automation.py`, `automation-pass.ts`, the stage-sla route). L1 for the golden path and techniques: no web lane, no blind training-data lane, no counter-evidence lane run.

**What moved in kp:** commit `1f62d70c5` (2026-09-23) cites this subject's three techniques as what it encodes. One aging clock now serves the board, the sidebar badge and the policy pass; the tier is `none | aging | stalled` with stalled at 2x the SLA; a terminal role and a non-positive SLA never age; the policy pass is handed the tier and no longer applies its own flat 21/30 cut except as the bare-CLI fallback. Per-column cadences moved from localStorage onto the workspace axis as team data behind `pipeline:write`. On 2026-09-25 the old board, its attention strip and its SLA editor were deleted.

**Landed in applications (verified_on 2026-09-29):**
- **process / two-tier alerts.** Rewritten: four of five recorded deviations are closed (global cut, inverted vocabulary, ratio below 2x, terminal alerting). The vocabulary inversion is kept at the storage layer but bridged once by `AGING_TIER_ALERT`. Remaining: the fallback is still one global untunable cut, and `int(x or 0)` on the fallback path.
- **react / per-stage thresholds.** Table moved to `aging-policy.ts`; resolution order gains the team `slaDays`; overrides section rewritten as team data (bounded 1-365 in the schema, capability-gated, migration offered not imported). The "approximation confined to per-board overrides" claim is void for cadence. The strip section is removed.
- **node / attention queues.** `pipeline` predicate now delegates to the one clock; a sixth key `companion` is recorded as a deliberately non-queue (its only affordance would clear nothing); the strip deviation is replaced by the kit view's blended `attention` ordering.

**Landed in techniques and golden path:** two-tier alerts gains "an alert is an event: once per stint, per tier" (drop it when the same pass advances the entry, preview through the same function as the commit) and a decision rule; the golden path gains the "daily repeat" failure mode. Single deployment, one incident: kept as a rule inside an existing technique, not a new one.

**Verified, left alone:** the stalled-multiple range (kp's 2x sits at its low edge and is documented as such), the closed approval taxonomy with its unmet unrecognised-count pairing (no consumer counts them, re-searched), the per-column-id override divergence.

**Not evaluated:** override actor and date (the route writes scope `team`, no actor seen; the store's audit trail was not read); whether the kit view's rows state a per-row reason; whether the kit's SLA editor marks a custom policy; the other two golden-path claims about ranking order against the kit view. No web lane and no blind lane, so nothing here earns technique-level convergence. Return condition: a consumer deviation, or 2026-12-29 for the applications clock.

**Not landed:** no new technique.

## Impact

`build-registry-map` at the landing: kp joins the subject through four contexts and carries no judged verdict against it, so no stale verdict and no `/conform --stale` queue. The other mapped projects have no pair with this subject. kp's own map file showed no diff, so nothing was committed there. The run rewrote the other projects' maps on disk for the recruiting bundle digest only; those working-tree changes were left uncommitted.

## Applied

The one rule that flipped into the technique (once-per-stint alerts) was already realised in kp before the landing, from kp's own incident; no `applied.md` row is owed because there is no measured better/not-better to record against it. It is the consumer's evidence, not a registry-driven change.
