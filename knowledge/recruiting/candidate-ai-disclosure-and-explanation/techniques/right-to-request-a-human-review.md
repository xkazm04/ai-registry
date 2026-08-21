---
layer: technique
type: technique
subject: candidate-ai-disclosure-and-explanation
technique: right-to-request-a-human-review
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor, a-candidates-process-never-stalls-on-your-constraints]
use_when: [implementing the promise that a candidate can ask for human review, designing recourse from an adverse automated decision, auditing whether a stated review right is real]
shared_with: []
---

# The right to request a human review

If the disclosure says a candidate can ask for a human review at any point, that
sentence is a commitment to a **mechanism**, and the mechanism has four
properties. A contact address satisfies none of them.

## The four properties

1. **Reachable from where the decision was shown.** The request control sits on
   the same surface as the decision it concerns, carrying the decision's
   identifier, so the person does not have to describe what they are contesting
   and the reviewer does not have to guess.
2. **Available at any point, not within a window.** Windows exist for the
   organisation's convenience and they expire while the person is deciding
   whether to bother. "At any point" is also far cheaper to implement than a
   deadline, which needs a clock, a notice and an appeals-of-the-deadline path.
3. **Routed to a human with authority to reverse.** A review that can only
   confirm is not a review. The reviewer must be able to change the outcome and
   must not be the same automated path that produced it.
4. **Sealed back into the record, attributed to the reviewing human.** The
   review's outcome is itself a consequential decision. It names its actor, and
   it never inherits the attribution of the decision it examined.

## Procedure

1. **Accept the request without gating it.** No eligibility check, no reason
   required, no quota. A candidate's own action must never fail because of the
   organisation's constraints — an outage, a plan limit, a metered-work budget.
   Debit it if you must meter; never refuse it.
2. **Acknowledge immediately with a truthful expectation.** State that it was
   received and what happens next. Silence after a recourse request is worse
   than no recourse advertised, because it converts a stated right into evidence
   of bad faith.
3. **Present the reviewer with the decision's decisive inputs and the person's
   own data**, not with the previous rationale as the opening frame. Leading
   with the prior justification produces confirmation, which is the failure mode
   the review exists to break.
4. **Record the outcome as a new decision** with the reviewer as actor and a
   recorded reason, then let the candidate-facing history show it under the
   normal projection rules.
5. **Feed reversal rates back into calibration.** A review path that overturns a
   large share of a given automated decision kind is a measurement about that
   threshold, and it belongs to the calibration practice. A review path that
   never overturns anything is theatre and should be investigated as such.

## Decision rules

- **Do not require the person to identify a specific error.** They cannot see
  the mechanism; demanding a diagnosis as the price of review is a filter
  disguised as a form field.
- **The route survives the decision being final.** A closed requisition, a
  filled role and an expired pipeline do not extinguish the right to ask; the
  answer may be that the outcome cannot change, but it is given by a person.
- **Never route the request back through the automated path that decided.** The
  second look must be independent of the first.
- **The best implementation of this right makes it rarely needed**, because no
  adverse outcome was solely automated in the first place
  ([no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).
  Where a human already decided every decline, review is a second human look —
  and the promise was true before anyone invoked it.

## When not to use this

- **Not as compensation for an automated adverse action.** A pipeline that
  auto-declines and offers review afterwards has inverted the order. Review is
  recourse, not licence.
- **Not for non-decisions.** There is nothing to review about an event that had
  no effect on the person; offering review of one manufactures a grievance.
- **Not as the only recourse offered.** Correction of wrong personal data is a
  separate and often faster remedy, and a person whose complaint is "you have
  the wrong employment dates" should be routed to correction, not into a review
  queue.
