---
layer: technique
type: technique
subject: candidate-self-scheduling
technique: propose-your-own-times-escalation
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [no offered slot works for the candidate, the reschedule cap is exhausted, designing the empty state of a slot picker]
---

# Propose-your-own-times escalation

When the offered grid cannot serve the candidate, they must be able to propose
times of their own. The proposal window is deliberately **wider** than the
offered grid, the proposal is **not** a booking, and it lands in a human's
queue with an honest promise attached.

## Why wider, and why that is the whole point

A candidate reaches this control precisely when the grid has failed them. Their
constraint is, by construction, one the grid does not accommodate: a night
shift, a current job with no daytime privacy, a timezone where your business
hours are their small hours, a caring responsibility that owns every afternoon.

Building the proposal form on the same generator as the picker is therefore the
single most common way to ship this feature uselessly. It re-imposes the exact
constraint the candidate has already told you they cannot meet, and it does so
while appearing to offer help — which is worse than offering nothing, because
the candidate now concludes that their situation is simply not accommodated
here.

So the proposal surface allows what the grid forbids: evenings, early mornings,
weekends, weeks beyond the booking window, and a free-text constraint for
everything a time picker cannot express ("only after 19:00 my time", "any
morning except the 14th"). The company may still decline any of it. Declining a
proposal costs a message; refusing to let it be made costs a candidate.

## The proposal is not a booking

Keeping these separate is what makes the wider window safe. A proposal:

- writes **no calendar event** and holds no time;
- does **not** advance the invitation to a booked state — the picker stays
  available, because a proposal is a request, not a commitment;
- does **not** spend a reschedule attempt
  (reschedule-cap-with-a-recruiter-bypass);
- is answered by a **human**, who either offers a matching slot, books it
  directly on the authenticated path, or replies that none of it works and says
  what does.

Because a human answers, the structural strictness of the booking path does not
apply here (structural-slot-validation-on-submit). Validate proposals only for
sanity: in the future, a bounded number of them, bounded free text, and
attributed to the candidate as their own words.

## The promise must be bounded and true

The commonest way this control disappoints is a vague confirmation — "thanks,
we'll be in touch" — with nothing behind it. State exactly three things: that a
person will read it, roughly when they will respond, and that the invitation
stays live meanwhile. Then make each true: emit an event the recruiter's queue
actually surfaces (the pipeline-attention subject owns how it is ranked), and do
not let the invitation expire silently while a proposal is outstanding. An
expiry that fires on a candidate who did everything asked of them is the exact
failure this technique exists to prevent.

## Procedure

1. **Render the control on the picker itself**, not only after exhaustion. A
   candidate who can see no workable time on the first screen should not have to
   book a bad slot to discover the alternative exists.
2. **Offer both structured proposals and a free-text constraint.** Structured
   times are actionable; the text carries the constraint the picker cannot
   express, and often makes the recruiter's counter-offer right first time.
3. **Bound it**: a small number of proposed times, a length-capped note, and a
   limit on repeat proposals — the bounds are anti-abuse, not gatekeeping, and
   they are generous.
4. **Emit an attention event** carrying the invitation, the proposed times and
   the note.
5. **Keep the invitation live and the picker available** until a human resolves
   the proposal.
6. **Close the loop explicitly.** Every proposal ends in a human reply — an
   offered slot, a booked slot, or a clear "we can't do those; can you do any of
   these?". A proposal that ages out unanswered is worse than a grid that never
   offered the hatch.

## Decision rules

- **When the picker's grid is empty for a candidate, the escape hatch is the
  primary action**, not a footnote link.
- **When a proposal arrives outside every business rule, still route it to a
  human.** The rules describe the default offer, not the boundary of what the
  company can agree to.
- **When a proposal is declined, the reply names an alternative.** A bare
  decline returns the candidate to the dead end with less hope than before.
- **When the invitation would expire while a proposal is open, extend it.** The
  deadline measures the candidate's responsiveness, and they responded.
- **Never let a proposal be auto-declined by a rule.** A human answers, because
  the outcome of a wrong automatic decline is a candidate dropping out of the
  process without a person ever seeing why.

## When not to use this

Do not offer it as a substitute for a working grid. If most candidates for a
role reach the escape hatch, the grid's parameters are wrong — too narrow a
window, one interviewer, a business day that excludes the population you are
hiring from — and the fix belongs upstream in how the invitation is generated,
not in a queue of manual proposals.

Do not offer it where the time genuinely cannot move: a fixed assessment
sitting, a scheduled group session, a statutory deadline. There, say so plainly
and offer the alternative that does exist (a later cohort, a different format).
A hatch that leads nowhere is worse than an honest closed door.
