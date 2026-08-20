---
layer: technique
type: technique
subject: recruiting-cost-and-automation-economics
technique: an-uncapped-ratio-as-a-denominator-alarm
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
use_when: [expressing a saving as a share of a baseline, reviewing a clamp on a percentage, a coverage figure that never seems to move, debugging a metric that looks suspiciously good]
shared_with: []
---

# An uncapped ratio as a denominator alarm

When a saving is expressed as a share of a manual baseline — "this covered
sixty per cent of the manual effort" — do not clamp the result to its
apparent maximum. Let it exceed one hundred per cent, render it as computed,
and treat the breach as a first-class alarm that the denominator is wrong.

The reflex to clamp is strong and it is wrong for a specific, generalisable
reason. The bound looks like a law of arithmetic — how could you save more
than all of it — but it is not. It is a **modelling assumption**: that the
baseline covers the same work the numerator counts, over the same population,
in the same units, for the same period. Every one of those can fail. When one
does, the ratio breaches, and the breach is the cheapest possible signal that
it happened. Clamping converts a loud, self-announcing defect into a value
pinned at the top of its range, which is indistinguishable from an excellent
result — and reads as one to everybody, including the team that built it.

The lesson is not specific to hiring. **Any bounded-looking quantity whose
bound is a modelling assumption rather than a law should be permitted to
breach, visibly.** A clamp on such a quantity is not defensive programming;
it is the deliberate suppression of the only evidence that the model is
broken. Clamp values whose bounds are laws — a probability, a fraction of a
known finite set. Never clamp a ratio whose denominator is an estimate.

## What a breach actually means

A ratio above one hundred per cent has a short list of causes, and enumerating
them is most of the diagnosis:

- **The baseline is per-hire and the numerator is per-action**, over a period
  with many actions and few hires. This is the most common cause and it is a
  unit mismatch, not an error in either half.
- **The baseline is scaled by the wrong count** — hires completed in the
  window rather than hires the work was performed against, or a count that
  small-sample rules should have refused before it reached a division.
- **The per-action estimates are inflated**, or an action kind that should
  have been excluded is being counted.
- **Ineligible rows are in the numerator** — demonstration data, seeded
  examples, retries, or a workspace's test period.
- **The periods differ.** A numerator accumulating since the beginning of
  time divided by a baseline scaled to one quarter breaches reliably and
  grows forever.

## Procedure

1. **Compute and store the raw ratio.** No clamp anywhere in the pipeline,
   including in the storage layer and the export.
2. **Define the breach threshold slightly above the bound**, not at it —
   small excesses can be rounding, and the alarm should fire on the ones that
   mean something.
3. **On breach, render the state, not the number.** The reader is not served
   by "one hundred and forty per cent"; they are served by a plain statement
   that the coverage figure cannot currently be computed for this workspace.
   *Suppressing the display is legitimate; suppressing the value is not.* How
   that state is rendered belongs to the presentation discipline; that it is a
   distinct state belongs here.
4. **Alarm the team, not only the reader.** A breach is a defect report from
   production with a full reproduction case attached. Route it somewhere a
   human reads.
5. **Record the breach with its inputs** — the numerator, the baseline, the
   period, the action counts by kind. Diagnosis after the fact is impossible
   from the ratio alone.
6. **Never fix a breach by raising the baseline until it stops.** That is
   fitting the assumption to the desired output, and it works every time,
   which is why it is dangerous.

## Decision rules

- When a clamp already exists in a shipped surface, removing it will make
  numbers appear that have always been wrong. That is the point; the wrong
  numbers were being shown all along, at the cap.
- When the ratio is near but below the bound for a customer, treat it with the
  same suspicion as a breach. A denominator error that lands at ninety-four
  per cent produces no alarm and no doubt, and a saving claim of ninety-four
  per cent of all manual effort should provoke both
  ([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
- When a ratio is used as a headline, the absolute figures it was computed
  from stay visible next to it. A percentage with no visible numerator and
  denominator cannot be sanity-checked by the one person best placed to do it
  — the reader who knows their own operation
  ([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- When the same ratio breaches for many workspaces, it is a model defect, not
  a data defect, and the correct response is to change or withdraw the metric
  rather than to handle the exception more gracefully.

## When not to use this

Do not leave uncapped a value whose bound is genuine. A completion rate over
a known finite checklist, a proportion of a set you enumerated, a probability
— these cannot exceed their bounds without an arithmetic bug, and there a
guard is appropriate.

Do not use an uncapped ratio as the shipped headline. Uncapped is about the
computation and the alarm, not about showing a reader an impossible number as
though it were a result. The value is uncapped; the *display* has a defined
state for the breach.

Do not treat the alarm as the whole honesty story. A ratio that never
breaches has not been validated — it has merely never been caught. The
breach detects one failure mode of the denominator; the others still need the
baseline, exclusion and dating techniques.
