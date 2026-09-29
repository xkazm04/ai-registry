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

## 2026-09-29 (second pass, dp-psm-0929b) - a twin of the run above, the landing carried a splice, and a rejection is a status in the systems read

**Depth rung:** L2 for the applications re-checked (kp at `ca3d48934`, every claim the first pass made about the deleted filter bar, the kit off-board section, `stage-migration/route.ts`, `pipeline-stages.ts` and `decision-config-schema.ts` re-resolved by hand). L2 for one new claim, from two independent readings: kp's tree and the Greenhouse Harvest API page fetched raw (`status` is one of `active`, `rejected`, `hired`, `converted`; the documented rejected application still carries `current_stage`; a hired one has none). One search-result reading of Lever's archive behaviour agrees (an unarchived opportunity returns to the stage it was archived from) and is not counted. No blind training-data lane.

**How the run started:** dispatched on the same finding as the pass above, with no live claim on the board, so it found that pass's edits uncommitted in the shared checkout. They had already landed on origin as `6f6eb365`; the shared tree was 23 commits behind. The work was rebuilt from origin in a detached worktree, and the shared tree's copies were not touched.

**Found in the landing itself:** `techniques/off-axis-candidate-recovery.md` had two decision rules spliced into its own front matter (`lay- When the surface...er: technique`), a byte-offset insertion. It reached origin; why the gate let it through was not investigated. Repaired: `layer: technique` restored and both rules placed under Decision rules. The two rules were re-checked against kp before being kept (`resolveStageFilter` has no caller outside tests; "Move all to..." is a loop of `moveEntry` calls at `PipelineKitOffBoard.tsx:44`).

**New at golden-path level, from two readings:** where a closure lives is a modelling choice. kp stores `active | rejected | declined | rematched | role_closed` as a status and has one terminal stage, `Hired`; Greenhouse's API keeps rejection as a status with the stage retained. The golden path and the gate technique had assumed a rejection moves the candidate onto the terminal stage, so the "resolve by outcome before position" trap was stated as universal. It is conditional: where closure is a status, position is already right for a rejected candidate and the obligation moves to the population, which must keep closed candidates in the denominator by their kept stage. kp meets it in the two computations read (`db/analytics.ts:355-368` filters no status; `analytics-cohort.ts:148-150` separates `reached` from `current`); every other consumer of `status` was not read.

**Also landed:** the tombstone technique's axis-version re-check now says only the first check protects anybody when the moves run before the write; the gate application gained a closure section; line citations moved (test `:66`, benchmarks `:67`), and README and mount citations became section anchors because a sibling's uncommitted README edit moves them.

**Verified, left alone:** the citations in the three applications that this pass re-resolved by hand, apart from those corrected above. The `screenStageOutcome` shortfall and the orphaned deep-link notice both still hold at `ca3d48934`.

**Not evaluated:** a web lane on the golden path's other claims, a blind lane, Greenhouse's behaviour for `converted` prospects, the Settings composer, whether kp's README still describes the deleted filter bar (it does; not fixed, kp carries sibling edits to that file).

Return condition: a kp change to `screenStageOutcome` or the kit filter surface, or the applications clock on 2026-12-29.

### Impact (second pass)

The subject digest moved again (revision 2 to 3). kp joins it through eleven context pairs, all `state: unknown` per the pass above; no stale verdict, no `/conform --stale` queue from this landing.

### Applied (second pass)

The closure condition is a golden-path rule that gained a condition. No project can be A/B'd on it: kp is the implementation it was read from, and no other joined project stores closure as a terminal move. Row recorded `unapplied`, return condition: when a project models a rejection as a move onto the terminal stage.

## 2026-09-29 (third pass, dp-psm-0929e) - the first blind and web lanes; the screening set was too wide, a stage ends in one decision, withdrawn is not rejected

**Why a third pass on a subject answered three times today:** the earlier passes were tree-only and said so ("no web lane and no blind lane, so nothing here earns technique-level convergence"), and set a return condition: a kp change to `screenStageOutcome`. This pass ran the missing lanes, executed the pure functions, and made that change. It began from a stale local checkout (47 ahead, 69 behind) and found the earlier ledgers only after writing its edits; the content was identical at both tips, so nothing was lost, and the landing was rebuilt on origin/main in a detached worktree. The shared tree's copies of the edited files were not touched.

**Depth rung:** L3 for the screening set, the permission table, the landing stage and the validator (kp pure functions run at `7340988e2` in a detached worktree over nineteen constructed axes; a patch applied, measured before and after, tested, and landed as `5f990d590`). L2 for the vendor and selection-rate claims (a web lane fetched documentation; the fetch tool summarises pages, so only text it returned in quotation marks is treated as read, and search-derived readings are marked as leads). L1 for the blind lane (ten probes, no tools). Lanes: tree with executed witnesses, blind training-data, web counter-evidence (six claims).

**Refuted or conditioned, and the text changed:**
- **"Everything before the gate, minus homework" as the screening set.** Executed: a `custom`, `scoring` or early `offer` column before the first interview was in the set, so it was offered "Screen with AI" and could be named as the landing place of an already-assessed candidate (`screenedLandingStage` returned the homework column on the enterprise preset). The golden path says a custom stage is "never counted as screening". Replaced by entry and screening roles intersected with the gate. A screening-role column *behind* a human interview is post-gate and advisory. The homework subtraction was the one exception the earlier passes had met; the intersection needs none.
- **The permission table read the default axis (kp).** Executed both ways: on any board with renamed ids a screen was advisory everywhere (the earlier passes saw only this), and on the shipped enterprise preset the post-gate `Screened` column advanced a candidate on a clean verdict, against the comment promising "a late screen informs and moves nobody". Fixed in kp (`5f990d590`, local main, unpublished): the outcome takes the workspace axis and asks the role at the entry branch.
- **"Each stage runs exactly one activity".** Conditioned to one decision point. The blind lane (rounds as children of a gate stage) and the web lane (vendors put several interviews in one stage; the practitioner boundary is the decision point, a parallel loop is one stage) reached it independently. The harm of the stacked column stays argued, not measured; no source quantifies it.
- **Closure.** Both shapes ship in the systems read (a status beside the stage; a stage typed `Archived`). Rejected stays in a step's denominator; under the US selection-procedure guidelines a voluntary withdrawal ends applicant standing at every later step, so it leaves those denominators (quoted from the extracted text; Q&A 15). The blind lane's claim that the disposition-beside-the-stage shape is "what the vendors do" was too broad, as one of them types archive as a stage.
- **Cross-team comparability "not a canonical funnel".** Read precisely, every vendor that reports across pipelines keeps a small shared spine (three to six buckets) above the teams; the role vocabulary is that spine. What is refused is position or name as the spine. Golden path reworded, not reversed.
- **"At least one terminal, terminal stages last" versus "exactly one".** The technique contradicted itself; the shipped validator refuses zero and two (executed). Corrected to exactly one.
- **The length fallback of the gate.** Unreachable on a board that passes the validator (a terminal is required); the technique's test axis is one the product refuses. The real edge is entry, screening, terminal: the gate is the terminal.
- **A retired stage resolves to "no position, false".** Contradicted the tombstone technique's own promise that role and position keep an old cohort computable, and the shipped implementation follows the first: closed candidates keep a removed id, and no metric file reads the retired list, so a candidate interviewed and then rejected on a removed Interview column counts as never having advanced. The gate technique now resolves a retired stage through its tombstone role and keeps "false, counted" for ids never declared. Derived, not measured: the analytics loop was read, not run.
- **"The migration is the guarantee".** The general config route accepts the axis phase with no occupancy check (read, not run), so the migration route's own header overstates. Rule added to the tombstone technique.
- **A one-sentence meaning per stage.** No shipped stage object carries a description and no study was found; the technique now says it rests on its argument. kp keeps the sentence per role and refuses a per-stage `meaning` key.

**Applications:** three corrected against kp `7340988e2` (a quoted error string that never existed in `app/` and was removed on 2026-09-02; a uniqueness citation that was a presence check; the deep-link finding overstated as "says nothing", when the Matches section renders; seven name-coupled read sites the consumer's own triage omits; the un-retire hole is API-only). Two `spec` applications added, both with refresh clocks: the vendor stage vocabularies (three months) and the selection-rate definitions (six).

**Verified, left alone:** the closed-vocabulary argument (every vendor read keeps a closed coarse type), the terminal-as-one-outcome argument, `hasAdvancedPastScreening` as purely ordinal, the off-axis notice rule, the moves-then-axis ordering, the axis-version re-check, refusal-with-count, the per-team benchmark axis, and the validator's well-formedness set (every refusal and acceptance case executed matched the technique's list).

**Not evaluated:** the type-check and the full kp unit suite (the detached tree has no dependencies; the analytics guard test fails to load on the baseline for that reason); the analytics cohort loop, the config route and the acceptance-to-terminal path (read, not run); the Python policy pass (read, not run); Ashby's full stage-type enum, Lever's documentation, any vendor's stage-removal behaviour beyond Workable and Greenhouse; the final text of New York City's rule (only the proposed rule was read verbatim); any measurement of what a stacked column does to dwell or conversion; the sentence-of-meaning claim beyond the absence of evidence.

### Impact (third pass)

`build-registry-map --project kp --out` (the fleet trees untouched): kp joins the subject through its context pairs, none judged, so no stale verdict under this subject and nothing for `/conform --stale`. The table's 20 stale verdicts sit under eval-harness, agent-cli-transport, module-design, docs-sync, app-shell, combining-signals-into-a-hire-decision, table and candidate-consent-and-retention. kp's map committed locally as `c35a63321` with a pathspec; kp is unpushed (its main carries earlier sessions' commits and live edits from another session in the pipeline orbit files).

### Applied (third pass)

One `code` row: the screening set and permission table, landed in kp. Three `unapplied` rows with return conditions (one decision point; tombstone-resolved measures; withdrawn apart from rejected). A correction to the entry/terminal text needs none.

### Saturation ledger

Rung L3 for the screening set and permission table, L2 for the vendor and regulation paragraphs, L1 for the sentence-of-meaning and stacked-column claims. Last-pass yield: one rule replaced, one contradiction fixed, one condition on a golden-path absolute, one comparability claim reworded, one tombstone gap and one write-door gap found, four citation errors corrected, two applications added. Dry streak 0. Clocks: vendor documentation by 2026-12-29; the selection-rate page by 2027-03-28 or when New York City's final rule is read verbatim. Events: kp's analytics loop run with a retired-stage fixture; a project that records a candidate withdrawal; kp publishing `5f990d590`.

### Banked leads
- The role stamped at event time versus resolved at report time (the blind lane's strongest argument against a role vocabulary): what happens to history when a stage's role is edited after it holds candidates. Nothing in the subject addresses it. Return when a project lets a live stage's role change, or a source is found.
- A `converted` prospect status (Greenhouse) and a job transfer (SmartRecruiters) are outcomes that are neither hired nor rejected; the closure paragraph names neither. Return when a project has a fifth outcome.
- Greenhouse counts candidates who bypassed a stage in that stage's total, and Lever says skipping distorts data (search-derived): the conversion-basis discipline owns skips; check that it says so.
