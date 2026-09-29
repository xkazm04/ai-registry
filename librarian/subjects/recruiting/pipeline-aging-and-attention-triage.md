---
subject: pipeline-aging-and-attention-triage
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# pipeline-aging-and-attention-triage

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian" (run dp-paat-0929b, registry HEAD at dispatch 3851e5aa). An earlier dispatch the same day (dp-paat-0929) stopped as `contended`: five subject files held another session's uncommitted edits. Those edits were committed a few hours later inside `001fbb4a` (a contest-skill commit that swept the tree): the three application re-reads, the "daily repeat" failure mode and the once-per-stint section of the two-tier technique. That work had no note, no `applied.md` rows and no run result. This pass treated it as unverified input, re-read every application citation against the tree, and did not repeat it.

## 2026-09-29 - an offer has three owners, the cost of silence was correlational, a reinstated entry starts a new stint

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
Map rebuilt from `99e84ed6` for kp (main checkout untouched; committed locally as `b65ce4b8e` with a pathspec): one project joins this subject, kp, two contexts, both `unknown`, never judged. So 0 stale verdicts under this subject and nothing for `/conform --stale`. The table's 20 stale verdicts sit under eval-harness, agent-cli-transport, module-design, docs-sync, app-shell, combining-signals-into-a-hire-decision, table and candidate-consent-and-retention, none of them this subject.

## Saturation ledger
Rung L3 for the offer clock and the stint edges, L2 for the evidence and legal paragraphs. Last-pass yield: one role split, two claims reconditioned, one prior relabelled, one cap bounded, one rule widened, seven citations corrected, four deviations found in the tree. Dry streak 0. Clocks: the legal paragraph rests on the AI Act's Annex III guidelines (final text expected at the end of 2026), so re-read it by 2027-01-31 or when they land; the offer-window evidence by 2027-03-31. Event: kp resolving the offer role from the offer's sent state and deadline, or reading the closing notice before anchoring a reopen.

## Banked leads
- A per-stage stalled point from a team's own withdrawal hazard instead of a multiple: needs a project with stage history and a sample; return when one has it and the funnel-metrics sample discipline is met.
- kp's `isStale` copies (orbit view, tab state) as a consumer deviation to `/conform`; return when the map carries a judged pair for this subject in kp.
