---
subject: pre-publish-fillability-forecast
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# pre-publish-fillability-forecast

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian" (run dp-ppf-0929, registry HEAD at dispatch 58adea0f). The subject was at revision 2 from 2026-08-20; its three applications had not been re-verified since, and kp had redesigned the Coach panel on 2026-09-16.

## 2026-09-29 - a delta sums the wrong way, a zero is not free, a stamped input is not a stated one

**Depth rung:** L3 for the three claims below (each run against kp's real scorer, before and after), L2 for the regulatory wording (primary texts read by a source lane, one spot-checked here). Lanes: a tree re-read of kp at 70dd2319d; a blind training-data lane (no tools) on six probes; a web counter-evidence lane on four claims; the executed witnesses.

**Refuted, and the golden path and techniques changed:**
- **"Deltas never sum ... the arithmetic sum of independent deltas exceeds the effect of removing both."** Backwards for hard gates. A delta is the people a gate blocks *alone*, so the sum is at most the joint effect: deltas of 1 and 1, five restored by removing both. The blind lane reached the same inequality unprompted (high confidence), and a source lane found the method's known limit (one-at-a-time designs miss interactions; Saltelli and Annoni 2010; the hitting-set duality of minimal correction sets, Bacchus and Katsirelos 2015). The intuition it was defending is true of the *marginal* count of who each gate fails, which is a different number.
- **"A zero delta is a finding ... a gate that costs nothing here."** One of four readings. A pool where every excluded candidate fails two gates gave `eligible 0` and `looseGates []`: no lever on the pool the gates jointly empty. Earned at technique level (counterfactual-gate-loosening, new "Masked gates" section and step 6): witness plus the blind lane's convergence plus the sources.
- **"A zero delta usually means the threshold ... the pool is not close."** For skills, a pair can clear a bar no single demotion does (score 49, singles 52 and 52 and 50, pair 57, bar 55). The blind lane gave the general form. must-have-demotion-delta now runs the pairs before saying "not close"; and records that demoting *everything* is not a bound (49 again: demoting a held must-have removes the credit for it).
- **Pay technique, rule 6 "the guard generalises past currency".** True and incomplete: nothing in the tree applied it to the role's own side. An ad with no pay got a stamped market band compared with itself and a clean "not below market"; an ad with pay and no level was judged against a level it never claimed; a EUR range was read as CZK (-95%). New rule 7. The seeker-side flag in the same tree already had the rule, and a code comment claimed the coach did too.

**Added:** the pool cap as part of the base (a recency prefix of the record, not the record); a "A count is not an exemption" section on the AI Act's recruitment point, marked as inference where it is one; two failure modes.

**Corrected against the texts (wording that had landed uncommitted from a sibling run and been swept into 001fbb4a):**
- GDPR Art. 5(1)(b) bars *incompatible* further processing; the gate is Art. 6(4) plus notice under Art. 13(3). German-authority (2024) and ICO guidance read for practice. Recital 162 recorded as the open counter-argument.
- Directive 2023/970 Art. 5(1) does not fix "before the interview": "in a published job vacancy notice, prior to the job interview or otherwise". Transposition status is secondary-source only.
- AI Act high-risk date: Regulation 2026/1744 sets 2 December 2027 for Annex III systems (recital read here from the Publications Office text). The Commission's Annex III draft guidelines are non-binding and final text is expected at the end of 2026.

**Verified, left alone:** the eligible-versus-qualified distinction, the reuse-the-production-scorer doctrine (all fixes went through the same two helpers), staged-never-applied, the top-versus-floor pay test, the currency-silence rule, the phantom work-mode guard (still in `ko_filter`), the three-state salary type. The blind lane's attack on "hard versus soft is asserted" and on the eligible/qualified inconsistency did not survive a read: the golden path already names both.

**Landed in kp (local commits, not pushed; kp main carries unpushed sibling commits):** d790fdf67 (joint gate pass; phantom pay and level silence), fb942a9af (pair fallback), 0c6c9e39c (the posting's own currency first). 27 winnability tests, 9 new.

**Not evaluated:** any measurement of how a recruiter reads the joint row (nothing renders it); the small-pool suppression the golden path asks for (kp emits a verdict at any pool above zero; recorded, not fixed); US state pay-range rules beyond what the pay technique already says.

**Handoffs:** (1) `check-bundles` is red on trunk for a file this run did not touch, `portable-candidate-credentials/applications/spec--revocation-without-a-beacon.md` (filename must be `spec--trust-state-resolution` or `...--<witness>`); it belongs to whichever sibling committed it. (2) The panel needs a ledger row kind for a joint finding (`editable: false`) before the new payload fields reach a recruiter.

## Impact
Map read from this run's generated commit (kp rebuilt from a clean worktree): one project joins this subject, kp, 4 contexts, all `unknown`, never judged. So 0 stale verdicts under this subject and nothing for `/conform --stale`. The table's 20 stale verdicts sit under eval-harness, agent-cli-transport, module-design, docs-sync, app-shell, combining-signals-into-a-hire-decision, table and candidate-consent-and-retention, none of them mine.

## Saturation ledger
Rung L3 for the lever arithmetic and the pay guard; L2 for regulation. Last-pass yield: three golden-path flips, one absolute corrected, three kp fixes. Dry streak 0. Clocks: the AI Act guidelines are final at the end of 2026 and Czech and German pay-transparency transposition is pending (Czech bill approved by the government 2026-08-31); re-read the regulatory paragraph by 2027-01-31 or when either lands. Event: a ledger row for `jointLoosen` / `jointDemote` landing in kp.

## Banked leads
- The ledger drops zero-delta rows (`derivePatterns`), so a masked gate is invisible even with `jointLoosen` on the wire. Return condition: kp grows the row kind.
- The coach levers only two gate kinds; seniority, work mode and early-career cost are unmeasured. The single-pass alternative (read each candidate's failed-gate set from `ko_filter`'s reasons) would give every gate and every subset in one pass; it holds only while the filter reports every failure and none short-circuits, which `ko_filter` does today. Return condition: a run wanting more than the two lever kinds.
