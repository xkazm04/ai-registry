---
layer: technique
type: technique
subject: deadline-pipeline-management
technique: miss-risk-scoring
status: forged
laws: []
shared_with: []
use_when: [ranking in-flight drafts by which is most likely to be missed, a calendar-only reminder treats a nearly-done and a barely-started draft identically, deciding which applications a triage lane should surface]
---

# Miss-risk scoring

Calendar thresholds are blind to finishability: a draft at 10% with two days
left and a draft at 95% with two days left get the same nudge, and only one of
them is in danger. Miss-risk scoring fuses the two signals the pipeline
already has — days remaining and draft completion — into a single 0-to-1
probability-of-missing estimate that ranks, escalates, and (just as
importantly) *silences* correctly.

## The model

Three quantities and one squash:

1. **Work left, in days.** `workLeft = effortDays × (1 − completion)`.
   `effortDays` is the estimated focused-work-days to take an application from
   zero to submittable — a single tunable (a defensible starting median is
   about five days) that converts a percentage into a time budget. Replace the
   constant with a per-organization historical median when enough completed
   applications exist to compute one; until then every draft shares the
   estimate, which is honest about what is actually known.
2. **The pressure ratio.** `ratio = workLeft / (daysOut + 1)`. The `+1` is a
   deliberate grace day: a draft with *exactly* as much work as time
   (`workLeft = daysOut`) should read as tight, not as a certain miss —
   without it, one day of work due in one day scores at the ceiling.
3. **The squash.** `score = ratio / (ratio + 1)`. Maps the unbounded ratio
   into 0..1 monotonically: ratio 0 → 0, 1 → 0.5, 3 → 0.75, approaching 1 as
   the ratio explodes. Monotonicity is the property that matters — the score
   must only rise as the clock shrinks or the remaining work grows — and the
   specific curve is less important than having interpretable fixed points.

Two boundary cases are decided before the formula runs, not by it:

- **Finished means safe.** Completion at or above 100% scores exactly 0
  regardless of the clock. A done draft that keeps generating urgency teaches
  users the scores are theater.
- **Past-due and unfinished means maximal.** Negative days-out with work
  remaining scores exactly 1, in a distinct *overdue* level — those are the
  misses most worth surfacing, not rows to filter away.

## Levels and thresholds

Map the score to a small ordinal ladder — on track / watch / at risk /
critical / overdue — with thresholds tuned against anchor cases you can
defend in a sentence. With the model above, boundaries near 0.15 / 0.33 /
0.55 make the canonical anchors land correctly: a 10%-done draft two days out
(≈4.5 work-days against 2 calendar days) lands critical; a 95%-done draft two
days out lands on-track. Tune thresholds by re-checking the anchors, never by
eyeballing the output list.

## What the score changes downstream

- **Triage lanes sort by score descending**, ties broken by soonest close —
  so a 10% draft three days out leads a 90% draft closing tomorrow, which is
  the correct ordering of misses-in-the-making.
- **On-track items are dropped from triage entirely.** The lane is signal;
  a row that says "fine" is noise wearing a row's clothes.
- **Digest subjects escalate on the at-risk count**, not the soonest date —
  "3 deadlines at risk of being missed" is actionable; "5 deadlines
  approaching" is wallpaper.
- **Each reminder row carries the decomposition** — percent done, estimated
  work-days left, days on the clock — so the recipient sees *why* the row is
  ranked where it is and can dispute the inputs, not just the verdict.

## Decision rules

- **Guard the completion signal.** The score inherits every defect of its
  completion input; a percentage inflatable by placeholder text makes the
  whole ranking confidently wrong. Completion must have a minimum-substance
  floor per section and a denominator matching the funder's actual required
  sections.
- **Keep the function pure.** Clock in, numbers out, no storage or transport
  concerns — the ranking logic is the part that must be exhaustively
  unit-tested against the anchor cases, and purity is what makes that cheap.
- **Present the score as an estimate.** Levels and phrases ("behind", "at
  risk"), not two-decimal probabilities; the model has one tunable and
  deserves exactly that much apparent precision.

## When not to use it

Do not let the risk score *replace* the calendar reminder ladder — the ladder
guarantees a floor of notice for every deadline even when the completion
signal is missing or wrong; the score decides emphasis and order on top of it.
Do not apply the score to applications with no draft underway (there is no
completion signal; that is the radar's job, not triage's). And resist adding
inputs (author availability, funder importance) before the two-signal core is
calibrated — every new input is a new way to be confidently wrong.
