---
subject: candidate-ai-disclosure-and-explanation
domain: recruiting
last_touched: 2026-09-26
dry_streak: 0
---

# candidate-ai-disclosure-and-explanation

First touch by `/deepen`, a single-subject run (dp-cad-0926). The Curator lane
dispatched it on the scan finding "never swept by the librarian", 3 points and
the only reason. The subject had two stacks, nothing expired, and 6 consults from
one contributor. Registry HEAD at dispatch was 55c6bce2. The primary checkout's
main was 136 behind origin, so the run worked from origin/main in a detached
worktree. The consumer was read at kp's local main, 84952e18c. Three sibling
deepen runs held other recruiting subjects on the board; none held this one.

## 2026-09-26 - a name is not a decision, selection and approval are two facts, expiry opens erasure not a blank view

**Depth rung:**
- **L2 primary:** the 2025 access-right judgment on automated-decision
  explanations and the 2023 credit-scoring judgment; the regulator guidelines on
  automated decisions (2018), on transparency (2018) and on the right of access
  (2023, with the worked job-application example); one 2026 state statute's
  definition of meaningful review; the UK's 2025 automated-decision provisions;
  the recourse and counterfactual papers; applicant-reaction studies; a 2025
  human-AI hiring experiment; placebic-explanation studies; a
  simplified-disclosure study.
- **L3 empirical:** a code A/B in kp, using a probe over the real redaction
  function plus the unit suite, with a mutation check.

**Lanes:**
- counter-evidence (web, unconstrained);
- regulatory currency (web);
- training-data-only (blind);
- consumer tree, read and then changed.

**Landed** in f05c806d (commit d3fc56e9 before the rebase):
- **Flipped, three-state attribution (web + blind + tree):** an operator identity
  is necessary, not sufficient. Routine approval of machine output without
  influence on the result is still solely automated. A machine-selected,
  person-approved decision renders as two facts. Selection stays with the machine
  and the approval sits beside it, shown only for a named approver who could have
  removed this person. The reconciliation test is rewritten, because "no adverse
  kind renders automated" pushed the fix toward upgrading.
- **Flipped, consent gating (web + blind):** an expired basis is the trigger to
  erase. It is not a reason to show the subject nothing while the record exists.
  The rule is parity: never less than any internal reader can see. The golden
  path and the allowlist technique both changed.
- **Conditioned, decisive facts:**
  - A rank cut-off has no threshold to show (web + blind).
  - A conjunctive floor is a valid counterfactual, shown as "below", never
    "required" (tree).
  - Contestable is not actionable recourse (web).
  - The caveats sealed with the pair cross with it (tree; the technique's own
    inference rule, extended).
  - Score feedback lowers rejected applicants' self-evaluation, so frame the
    score as about the application; never withhold it, since it is their data
    (web).
- **Conditioned, trade secrecy (web + blind):** the controller is not the judge of
  its own claim. Contested material goes to the authority or court.
- **Conditioned, review right (web + blind):**
  - "Any point" means for as long as the record is held, said out loud.
  - Reasons are allowed, never required.
  - A reply-to address is a contact route.
  - Independence includes not anchoring on the output.
- **Conditioned, notice (web + blind):**
  - The human clause is true only of an approval that could change the outcome.
  - "Three to five sentences" is a legibility budget, not a proven comprehension
    gain.
  - The first layer is set by what has most impact or would surprise.
- **Corrected, golden path:** the formula *alone* fails the duty. Satisfaction is
  not the measure, because placebic explanations score alike (web only; supports
  an existing claim).
- **Applications:**
  - All three re-verified to 2026-09-26, with version witnesses.
  - The react wrong-law gap was closed at the source on 2026-09-08. Two residual
    paths still serve the EU default to candidates: the server resolver's
    store-failure fallback, and an unknown regime id.
  - Three new node applications: attribution, decisive facts, and the review
    right.

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Explanation standard: concise, intelligible, own data, contestable | confirmed; the formula *alone* fails; the counterfactual is one sufficient form, not mandatory | web + blind |
| Trade secrecy never extinguishes the facts | confirmed on wholesale refusal; balancing is the authority's, case by case | web + blind |
| Show the score-threshold pair, never a rank | conditioned: no threshold under rank cut-offs; contestable, not recourse; feedback has a cost | web + blind + tree |
| "A person decided" = an operator identity in the record | refuted as worded: token involvement is still automated | web + blind + tree |
| Three states, fail toward the machine | confirmed; missing the selected-and-approved case | blind + tree |
| History empty once consent expired | refuted: access reaches data until erased | web + blind + tree |
| Held data derived from the record; erasure confirmed by effect | confirmed; the tree still confirms erasure by completion | blind + tree |
| Review at any point, no reason, authority to reverse | conditioned: bounded by retention; reasons allowed | web + blind |
| No legal assertion from a default regime | confirmed; tree closed its gap, two residual paths | blind + tree |
| Short layered notice, repeated, on the posting too | conditioned: brevity unproven for comprehension; the advance-notice timing is confirmed | web + blind |

## Impact

- **kp: 3 contexts**, 0 judged verdicts against this subject, so nothing went
  stale. kp's map was rebuilt and committed at 421948b57 (a sibling had rebuilt it
  minutes earlier, at 16:26, against the old digest). Unrelated stale verdicts in
  kp's map: 19, under other subjects. No other fleet map joins this subject.

## Owed to kp (recorded as deviations, not fixed)

- Unknown attribution renders as no badge at all (`StatusClient.tsx`).
- The humanised-identifier fallback in the kind label is unreachable today and is
  still a standing hole.
- Erasure answers `{ erased: true }` without reading `anonymizeEntry`'s return.
- `disclosureComplianceFor()` serves the EU regime to candidates when the regime
  store fails, and `getRegime()` does the same for an unknown id. Both are logged,
  not shown.
- The review right is "reply to any message". Nothing carries the decision id,
  routes to authority, or seals the outcome, and the promise outlives erasure.
- Between consent expiry and the heartbeat sweep, the operator dossier shows
  decisions the candidate's own history hides.
- Whether screen-wave approvals are real is unmeasured. The spare rate per wave
  (`screen_wave_recruiter_spared`) is the query.

## Applied

Four rows in `librarian/applied.md` and kp's `.ai/applied.jsonl` (cf9a4b81c):
- three-state attribution: code, better (kp cf6cb58aa);
- decisive facts, the staleness caveat: code, better (kp cf6cb58aa);
- allowlist and golden path, consent parity: simulation, better;
- review right, the retention edge: simulation, better.

kp's commits sit on its local main, not pushed. That main was 60 ahead and 3
behind origin with other sessions' work, which this run did not reconcile.

## Declined

- **The 2026 regime matrix here.** The regulatory lane established that:
  - the EU employment high-risk date moved to 2 Dec 2027;
  - Colorado repealed and re-enacted its act for 1 Jan 2027, with enforcement
    stayed by a court;
  - Illinois withdrew its notice rules;
  - California's automated-decision rules bind from 1 Jan 2027;
  - UK Art 22A-D has been in force since 5 Feb 2026.

  This subject is regime-agnostic by design, and multi-jurisdiction hiring
  compliance owns the matrix. Banked there, not landed here.
- **Placebic explanations as a technique-level claim.** Web lane only, small
  studies. Landed as one sentence supporting an existing golden-path claim, not
  as a rule.

## Banked leads

- **For multi-jurisdiction-hiring-compliance:** the matrix above, with its
  sources, in the regulatory lane's report. Three items still need a primary
  fetch before landing:
  - whether Art 86 moved with the omnibus;
  - the re-enacted Colorado review wording;
  - the Illinois withdrawal notice in its register.

  Clock: California's post-use notice bill was on the Governor's desk with a
  30 Sep 2026 deadline.
- **A fourth attribution state, "a person decided with AI assistance".** Blind
  lane only. It covers a human deciding with a score in view, which Art 86's
  "based on the output" reaches. Return: when a second lane or a tree needs it.
- **Illinois's video-interview act requires consent, not notice.** Blind lane
  only. Return: for the consent-and-retention subject.
- **Erasure confirmation scope** (backups, indexes, recipients to notify). Blind
  lane only. Return: for the consent-and-retention subject, or when a tree grows a
  derived store.

## Clocks

No application clock is set; the stacks' derived windows apply. The regime
facts this subject leans on only indirectly move fast. Re-check the review and
notice conditions against the multi-jurisdiction subject by 2027-01-15, after
the Colorado rules and the California bill settle.
