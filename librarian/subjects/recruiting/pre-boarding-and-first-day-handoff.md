---
subject: pre-boarding-and-first-day-handoff
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# pre-boarding-and-first-day-handoff

First librarian note. `/deepen` was dispatched by the Curator lane on the scan finding "never swept by the librarian" (run dp-pbf-0929, registry HEAD at dispatch 3851e5aa). The content pass had already landed an hour earlier, as 1ec9cfd6 (revision 1 to 2, 16:54), from a session that left no subject note, no `applied.md` row, no run result and no map regeneration. This run therefore did not repeat the research: it reviewed that landing's diff, checked what rests on kp code, and did the propagation and ledger work the landing owed. The research lanes of the earlier session are not in the record; what follows is what this run can vouch for.

## 2026-09-29 - a rescission needs its own door, statutory form is per clause, the renege claim is a hypothesis

**Depth rung:** L2 for the statutory anchors (the landing's applications say, per clause, whether the primary text or a secondary summary was read; several are marked unread); L3 for the two kp claims this run touched.

**The landing (1ec9cfd6), as reviewed here:**
- **New technique `rescinding-an-accepted-offer-is-a-decision-with-a-process`.** Four parts: the acceptance carries a contingency ledger, a rescission is a named human decision citing a ground, the ground selects what is owed, the record carries a distinct outcome. Its honest gaps are stated: no authoritative source on what a recruiter must hand a manager, statutory anchors marked read or not read.
- **Renege claim demoted.** "Renege rates rise with the gap and the silence" is now a practitioner's inference; the technique says no study separating the two was found, that the cohort thresholds are configuration, and that published no-show figures are vendor surveys not to be quoted as base rates.
- **Statutory form is per clause, not per contract.** The signature technique's rule "employment contracts in some jurisdictions need a qualified signature" was refuted against the statutes it named and replaced by a per-document, per-jurisdiction property the flow reads.
- **Basis and collection conditions.** Consent is a weak basis in employment; work authorisation and health need the regime's own conditions on what may be collected, when and how.

**Checked here against kp (`b65ce4b8e`):**
- The rescission application's core claim stands on a read of the guards: `actOnPipelineEntry` refuses an accept on a terminal status and has no stage guard on a reject. The probe was run by the landing session; this run did not re-run it.
- New application `node--pre-boarding-questionnaire-as-a-hire-record`, run here as a two-arm probe (the parent of the commit that added the scrub versus current main, two throwaway worktrees, deleted). An erasure of a Hired entry left a phone number, an immunisation answer and the signer name readable at A; B masked or blanked all of it. It supports the technique's new sentence that removing a feature does not remove what it collected, and adds a condition: keep the scrub keyed to table existence until a migration drops the rows.

**Not evaluated:** any live database still holding the retired rows; whether kp's UI offers reject on a hired card; the German, Czech and UK contract anchors beyond what the application marks as read; the fixed-term, termination and delivery-duty clauses the signature application maps.

**Applied:** four rows in `applied.md`: rescinding (kp, experiment, unmeasurable), questionnaire (kp, code, better), signature seam and silence gap (unapplied, kp holds no seam; return conditions recorded).

## Impact
Regenerated from this run's generated commit (282ee58e). One project joins this subject: kp, 6 pairs, all `unknown`, never judged. So 0 stale verdicts under this subject and nothing for `/conform --stale`. The whole-fleet table lists 210 stale verdicts under other subjects (table, prompt-assembly, test-harness, eval-harness, agent-cli-transport and others), none of them mine.

Side effect, recorded: reading the impact table with `build-registry-map.mjs --dry-run` rewrote all twelve fleet maps despite printing "nothing written". Those maps were then regenerated and committed locally, one commit each on the project's active branch, unpushed, only `.ai/registry-map.json` in each.

## Saturation ledger
Rung L2. Last-pass yield: one new technique, three technique corrections, a fourth application. Dry streak 0. Clocks: the statutory anchors and the silence-gap literature carry a 2027-03-29 refresh; fair-chance and consumer-report guidance move on that order. Event: a project growing any part of the accepted-to-started window, or a rescission door.

## Banked leads
- The technique's contingency ledger has no reference implementation in the fleet. Return condition: a project that models a post-acceptance check as a state.
- Primary texts not read by the landing: the 1997 FTC staff letter behind the five-day figure, the NYC code wording, the remote-applicant definition in 15 USC 1681b(b)(3)(C). Return condition: a run wanting to move those statements from "marked unread" to "read".
