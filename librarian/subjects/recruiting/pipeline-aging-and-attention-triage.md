---
subject: pipeline-aging-and-attention-triage
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
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

## 2026-09-29, second pass (dp-paat-0929b) - an offer has three owners, the cost of silence was correlational, a reinstated entry starts a new stint

The first pass above (L1/L2, tree lane only) left the golden path and techniques unchallenged and listed four things unevaluated. This pass ran the missing lanes and read those four: override actor (none recorded), the kit editor's marker (none), per-row rationale (waiting rows only), and the ranking claims. It was dispatched from a checkout that was behind origin and worked from a local main that had not seen the first pass; the landing was rebuilt on origin/main.

**Depth rung:** L3 for the offer clock, the stint edges and the citation re-read (real kp functions and store run at `dd0669e3a`, a detached worktree, main checkout untouched); L2 for the legal and evidence claims (primary texts read by the web lane: the CJEU SCHUFA judgment and WP251 as extracted text, the Alertmanager and SRE Workbook pages; the AI Act wording is from a secondary fetch and unverified against EUR-Lex). Lanes: a tree lane with executed witnesses, a blind training-data lane (no tools, nine probes), a web counter-evidence lane (six claims).

**Refuted or conditioned, and the techniques changed:**
- **"Ten days in an offer stage is a stall" / one dwell clock for the offer role.** The stage changes hands twice. Executed: kp's resolver reads the stage and the move timestamp only, so an offer four days into a seven-day window reads aging, one seven days into a fourteen-day window reads stalled (the tier starts at day six), and an unsent draft ages exactly like a sent offer. The blind lane reached the three-owner split unprompted at high confidence. The per-stage technique now splits the role (unsent: dwell; sent: the deadline; lapsed: measured from the deadline); the golden path's example is conditioned and two failure modes are added ("the offer that ages inside its own window", "the copied clock").
- **"Every day of silence measurably costs acceptance" and "the candidate is almost certainly holding another process open".** Both were stated as fact. The evidence found is observational and about time *to* offer (one firm, n = 3,012); vendor data on time in the offer stage cannot separate cause from selection and disclaims causation; multi-offer shares are 59% (a 2019 survey, n over 1,000) and 44% in a 2025 quarter down from 72% two years earlier (analyst summary, secondary only). Rewritten as an argument about the candidate's cost, with the evidence's limits stated.
- **"Stalled at two to three times aging".** No published basis: service-desk escalation runs at fractions of time to breach, error-budget alerting derives tiers from burn rate, alarm-management standards constrain priority counts. Now a starting prior with a distribution-based replacement. The blind lane agreed (medium-high).
- **Once-per-stint alerts.** Held, and bounded. Re-notification is the tooling default and two reminders beat one in a trial (a reminder trial, not a recruiter feed). The rule is about the feed: the persistent state view and the stalled tier carry the rest. Section added; not a reversal.
- **"Resume, not restart" on reactivation.** True only while nobody was told anything. After a sent outcome the stint it ended is over. Executed in kp: un-reject restarts (right), role reopen keeps the old anchor so months of closure count as dwell (right only if closing did not tell the candidate, which the aging code cannot see). The blind lane said restart on reactivation; the registry's candidate's-wait argument survives for the administrative case, the blind lane's for the reinstated one.
- **Per-queue cap.** A judgment with no numeric basis (alarm-management figures are alarm rates and the rarity of the top priority; no number for concurrent flags exists). A cap must show the true total. Ranking is inside the automated-decision line only while rows beneath it stay reachable (WP251: review by someone with authority and competence to change the outcome; SCHUFA: a score a decision-maker draws strongly on can itself be the decision). Whether a dwell-only ordering is "profiling" under the AI Act's narrow-procedural exemption is open; nothing found addresses it.
- **Override keying by role.** Widened: role is the default key, column identity where two columns share a role (kp's route, recorded as a reasoned divergence before; now the technique's own condition).

**Applications re-read (kp `dd0669e3a`):** seven line citations were stale and are corrected (`STAGE_SLA_DEFAULTS` :62-64, `STAGE_ROLE` :95, `AttentionCounts` :27-53, `attentionCounts` :65-82, `attentionStale` :95-102, the rename comment :68-72, `slaForStage` :76-89, aging-policy :31-90). Findings: the orbit view's `isStale` and the tab's are copies of the clock (no stalled tier, an unknown date read as zero, a comment calling one "the product's one aging clock"); the stage-SLA write records a timestamp and no actor, no audit event, and the kit editor carries no custom-policy marker; approval kinds have a static write-site guard as a test (`approval-kinds.test.ts:69-93`) and no runtime count; the kit view states a reason for waiting rows and none for aging rows. `verified_against` added (node@24, react@19).

**Verified, left alone:** the role table and its monotonic shape, the homework exception, terminal exclusion in both mechanisms, unknown dwell resolving to no tier on the tier path, the tier-to-event mapping and its documented inversion, the alerts never setting an action, the closed approval taxonomy, the axis as a parameter, the `AgingTierSyncTest` bound, the deleted attention strip. Not one of these needed a word changed.

**Not evaluated:** any measurement of how recruiters read an aging row or act on a stalled one; whether closing a role tells candidates (decides the reopen anchor); kp's offers table in production (the offer cases are constructed inputs run through the real functions, not real offers); the AI Act sources against EUR-Lex; the "pipeline README lists this module" claim in the node application; the Python side beyond `automation.py:178,220-233,973`.


## Impact

`build-registry-map` at the landing: kp joins the subject through four contexts and carries no judged verdict against it, so no stale verdict and no `/conform --stale` queue. The other mapped projects have no pair with this subject. kp's own map file showed no diff, so nothing was committed there. Second pass: kp's map was rebuilt and committed locally (unpushed, from the primary checkout's own corpus); the subject's pairs stay `unknown`, so still 0 stale verdicts. The run rewrote the other projects' maps on disk for the recruiting bundle digest only; those working-tree changes were left uncommitted.

## Applied

Second pass: three simulation rows and one `unapplied` row in `librarian/applied.md` (offer-role owners, reinstatement stint, once-per-stint, capped strip), all `unmeasurable` or `unapplied` with the instrument named. The first pass's reasoning for once-per-stint stands: the rule came from kp's own incident, so its row records the executed witnesses and not a registry-driven improvement.

First pass:

The one rule that flipped into the technique (once-per-stint alerts) was already realised in kp before the landing, from kp's own incident; no `applied.md` row is owed because there is no measured better/not-better to record against it. It is the consumer's evidence, not a registry-driven change.

## Saturation ledger
Rung L3 for the offer clock and the stint edges, L2 for the evidence and legal paragraphs. Last-pass yield: one role split, two claims reconditioned, one prior relabelled, one cap bounded, one rule widened, seven citations corrected, four deviations found in the tree. Dry streak 0. Clocks: the legal paragraph rests on the AI Act's Annex III guidelines (final text expected at the end of 2026), so re-read it by 2027-01-31 or when they land; the offer-window evidence by 2027-03-31. Event: kp resolving the offer role from the offer's sent state and deadline, or reading the closing notice before anchoring a reopen.

## Banked leads
- A per-stage stalled point from a team's own withdrawal hazard instead of a multiple: needs a project with stage history and a sample; return when one has it and the funnel-metrics sample discipline is met.
- kp's `isStale` copies (orbit view, tab state) as a consumer deviation to `/conform`; return when the map carries a judged pair for this subject in kp.
