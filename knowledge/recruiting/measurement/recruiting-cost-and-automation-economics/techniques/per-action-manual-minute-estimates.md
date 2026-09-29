---
layer: technique
type: technique
subject: recruiting-cost-and-automation-economics
technique: per-action-manual-minute-estimates
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds, inference-must-look-like-inference]
use_when: [building an hours-saved model, reviewing a time-saved constant, deciding which automated actions count toward a saving]
shared_with: []
---

# Per-action manual-minute estimates

An hours-saved figure is a sum over actions, and each term is *one action
multiplied by an estimate of how long a person would have taken to do it*.
This technique is about that estimate: where it comes from, how it is
written, and — the half that is usually skipped — which action kinds are
deliberately given a value of nothing.

The estimate must be **per kind of action**, not a single blended
minutes-per-action. A blended figure hides the mix, and the mix is what moves
between customers: a workspace whose volume is mostly one cheap action kind
and a workspace whose volume is mostly one expensive kind will report the
same saving under a blend, and both will be wrong in opposite directions.

## Procedure

1. **Enumerate the action kinds the system actually records.** Work from the
   recorded event vocabulary, not from a feature list. If two features emit
   the same event kind, they share one estimate and that is fine; if one
   feature emits three kinds, it needs three.
2. **For each kind, write the human sentence.** "A person reads a résumé and
   fills in a structured scorecard." "A person reads a CV and forms a
   judgement about fit." The sentence is what the minute figure is an
   estimate *of*, and without it the number cannot be argued with, only
   overwritten.
3. **Estimate against the deliberate, unhurried version of the task.** Not
   the rushed version and not the best case. A structured scorecard filled
   properly is a task in the tens of minutes; skim-reading and scoring a CV
   is single-digit-to-low-double-digit minutes. If your estimate implies a
   recruiter working faster than a recruiter has ever worked, it is inflating
   the saving.
4. **Assign zero, explicitly, to every kind that does not displace labour.**
   This is a decision to record, not an omission. See the exclusion rules
   below.
5. **Sanity-check the total against a published per-hire figure.** Multiply
   your estimates by a realistic action mix for one hire and compare against
   the manual hours a hire is generally held to take. An order-of-magnitude
   disagreement means an estimate is wrong or an exclusion is missing — the
   check is coarse, and it catches the errors that matter.
6. **Keep the estimates in one place, each with its sentence and its
   reasoning.** Scattered constants drift; a table of them is reviewable in a
   meeting, which is the only review that will ever actually happen.

## What gets zero, and why the zero list is the credible part

Assign no saving to:

- **Actions a human never performed.** If the manual process had no
  equivalent step, nothing was displaced. Novel capability is worth
  something, but it is not *saved labour*, and mixing the two makes both
  unfalsifiable.
- **Actions that only record or transition state.** A status change, an
  audit entry, a notification dispatch. These are bookkeeping the system does
  for itself.
- **Actions a human still checks afterwards.** A draft that a recruiter reads,
  edits and approves saved part of a task, not the task. This has its own
  technique — a human click is not saved labour — and its rule is: if the
  human is still in the loop, the estimate is the *residual*, and if the
  residual has never been measured, the honest value is zero.
- **Volume the system induced.** Where a capability made an action so cheap
  that it happens far more often than a human process would have attempted,
  the excess is not displaced labour. If you cannot separate induced from
  displaced volume, cap the counted actions at a plausible human throughput
  and say that you did.
- **Retries, duplicates and re-runs.** A human does the task once.
- **Failure and sentinel events.** A dispatch that failed, a guard that fired
  on an unrecognised input, a degraded-mode marker. These are recorded in the
  same event stream as the successes and are the easiest kinds to sweep into a
  saving by accident — and each of them usually *created* human work rather
  than displacing it. A saving model that pays out for its own failures is
  not merely inflated, it is inverted.

A published exclusion list is disproportionately persuasive, and for a good
reason: it is the only evidence available to a reader that somebody on your
side tried to make the number smaller.

## Decision rules

- When an estimate cannot be justified in one sentence, it is a guess and
  must be labelled as a default and made editable, never shipped as a
  constant. [Inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
  applies to money exactly as it applies to a judgement about a person.
- When a new action kind is added and no estimate is written for it, its
  saving is zero until someone writes one. Never fall back to a blended
  average for unknown kinds — that turns every new feature into an automatic
  increase in the reported saving.
- When two action kinds differ by more than a factor of three, never merge
  them for tidiness. The factor of three is the whole information content.
- When an estimate is raised, the raise needs the same one-sentence
  justification the original did, and the surface's figure changes retroactively
  for every past period. Decide in advance whether history is restated or the
  estimate is versioned by date; silently restating history is how a saving
  chart acquires a slope nobody earned.
- When the reported saving is quoted outside the product, it carries its
  action count and its estimate basis with it
  ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
  "Nine hours" alone is a marketing number; "nine hours, from a hundred and
  forty assisted actions at the stated per-action estimates" is a claim.

## When not to use this

Do not use per-action estimates where the actual duration is recorded. If the
system knows how long the human step took before automation — because it
timed it, or because the task still runs both ways for some cohort — use the
measurement and retire the estimate. An estimate is what you use in the
absence of evidence, and it must retreat the moment evidence exists.

Do not use this model to make a claim about *quality*. Minutes saved says
nothing about whether the automated output is as good as the human one; a
saving computed over actions whose quality has never been evaluated is a
statement about throughput only, and must be worded as one
([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).

Do not extend the model to actions performed on behalf of a candidate to
imply a candidate benefit. Time the organisation did not spend is not time
the candidate gained.
