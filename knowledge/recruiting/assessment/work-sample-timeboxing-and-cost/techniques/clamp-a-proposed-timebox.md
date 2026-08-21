---
layer: technique
type: technique
subject: work-sample-timeboxing-and-cost
technique: clamp-a-proposed-timebox
status: forged
laws: [uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor]
use_when: [a hiring manager or generator proposes an exercise length, enforcing a timebox policy mechanically, a produced exercise carries a duration field]
shared_with: []
---

# Clamp a proposed timebox

Nobody proposing an exercise length is the party who pays for it. A hiring
manager proposes hours out of coverage anxiety; a role brief inherits a number
from the last requisition; an automated case generator emits whatever duration
the tasks it invented seem to need. All three are **inputs**. The policy band is
the decision, and it is applied by clamping every proposed value into the band at
the point of production — before a candidate is ever shown a number.

The technique is deliberately mechanical because the alternative is social. A
policy that depends on someone declining a manager's request for six hours is a
policy that erodes one exception at a time, and the erosion is invisible because
each exception was reasonable.

## Procedure

1. **Express the policy as a band per level: a floor and a ceiling.** The floor
   matters as much as the ceiling — a fifteen-minute "exercise" is not a
   measurement and wastes the invitation.
2. **Clamp at every seam that can write the number, not only the one that
   generates it.** The generator is the obvious writer; the human review gate,
   the manual edit form and any import path are writers too, and a cap enforced
   in one place while another accepts a working week is not a cap. The
   reviewer's editing power is real and should be preserved — but it is the
   power to correct a case, not to overrule the policy on candidate effort, and
   the two are easy to conflate when the edit is just a number in a field.
3. **Clamp in the record, not at the surface where it is displayed.** A
   display-layer clamp means the underlying record still carries the unclamped
   number, and something downstream will eventually read it — a calendar block,
   an email template, a report on candidate effort. The same applies to defaults:
   a data model whose default duration sits above the cap will silently
   manufacture over-policy exercises for every path that does not set the field.
4. **Clamp before any dependent scoping is computed.** Task count, phase timing
   and any mid-exercise event schedule derive from the duration. Deriving them
   from the unclamped value and then clamping the display produces an exercise
   whose stated length no longer matches its contents.
5. **Resolve an unusable proposal downward, not upward.** Missing, unparseable,
   zero, negative, or absurd values resolve to the level's *default*, which sits
   at or below the middle of the band — never to the ceiling. Where the system is
   unsure and the consequence lands on the candidate, it fails toward the person
   ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
6. **Record the clamp as an event, not a silent adjustment.** Store what was
   proposed, what was applied, and by which rule. A silent maximum function
   destroys exactly the evidence that would show a pattern of managers requesting
   double the policy — which is a policy conversation you can only have if the
   requests survived.
7. **Where an override above the ceiling exists at all, make it named and
   expiring.** An exercise shipped above the policy maximum imposes hours on
   people; it carries the name of whoever authorised it
   ([every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)),
   a reason, and a date after which it reverts. An unnamed override is how a
   ceiling becomes a suggestion.
8. **Report the clamped value everywhere the candidate sees it** — invitation,
   brief, timer, confirmation. One number, one source. Two numbers in two places
   is the defect candidates report as "it said two hours but the timer said
   four", and it destroys trust in everything else you told them.

## Decision rules

- **When the proposal is inside the band, apply it unchanged and record nothing
  special.** Clamping is for the exceptions; logging every no-op buries the
  signal.
- **When the proposal exceeds the ceiling, clamp and tell the proposer.** They
  scoped tasks against a number that is no longer in force, so their task list
  must shrink. Clamping the number and leaving the tasks produces an
  impossible-to-finish exercise, which is worse than either the tasks or the
  number alone — the candidate is now failing at a length nobody agreed to.
- **When the proposal is below the floor, clamp up and check the tasks.** An
  under-scoped exercise usually signals a task list too thin to discriminate.
- **When the same proposer is clamped repeatedly, that is the finding.** Escalate
  it as a policy issue, not as a per-exercise correction.
- **When a candidate has already been invited under a number, do not re-clamp
  their exercise.** The published number is the agreement. Fix the policy for the
  next cohort and honour the current one.

## When not to use it

- **Where the duration is genuinely negotiated with the candidate** — an
  accommodation granting extra time, a split-sitting arrangement — the negotiated
  value is a decision about that person, not a proposal to be clamped. The clamp
  governs the *design*; adjustments extend it deliberately, and must not be
  silently pulled back to the ceiling by a validator that cannot tell the two
  apart. Keep them as distinct fields.
- **Paid engagements** have a scope and a rate, not a band.

## What it does not do

A clamp bounds the number, not the work. An exercise whose tasks take four hours
does not become a two-hour exercise because a validator wrote "2" in a field —
the candidate discovers the truth at minute one hundred and twenty, and their
experience is of a broken promise plus an unfinished submission. The clamp is
only honest when the same seam is also empowered to force the task list down, or
to refuse to ship the exercise. Pair it with the cold-run calibration in the
hard-cap technique: the clamp enforces the published number, and the cold run is
the only thing that verifies the number is true.
