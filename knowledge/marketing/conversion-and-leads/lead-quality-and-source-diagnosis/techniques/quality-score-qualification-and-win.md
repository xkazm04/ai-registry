---
layer: technique
type: technique
subject: lead-quality-and-source-diagnosis
technique: quality-score-qualification-and-win
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero, one-target-one-threshold]
shared_with: []
use_when: [ranking lead sources by quality, building a per-source quality figure, deciding what a source's headline number should be]
---

# Quality score from qualification and win

## The concern

A business with five lead sources wants one column it can sort by. The column that is
easiest to compute - leads, or cost per lead - ranks sources by how well they fill a
form. The column the business needs ranks sources by how much of what they send turns
into revenue. This technique defines that column: a composite of the source's
qualification rate and its win rate, reported beside both inputs, and used for
ranking rather than for verdicts.

## The procedure

1. **Compute the stage rates on adjacent denominators.** Qualification rate is
   qualified over leads. Win rate is won over qualified - not won over leads, because
   the two failures must stay separable. Stage counts are cumulative: a record at
   "won" counts at every earlier stage.
2. **Weight the two rates and scale to 0-100.** The score is `100 x (w_q x
   qualRate + w_w x winRate)` with the weights summing to one. A qualification-heavy
   weighting (six tenths on qualification, four on win is the common convention) says
   the source is judged more on the population it sends than on what sales did with
   it, because the source controls the first and only influences the second.
3. **Report the score with its inputs.** A row shows score, qualification rate, win
   rate, cost per qualified lead. A score alone cannot tell the reader which half is
   broken.
4. **Render the absent as absent.** An unpaid source has no cost per lead and no
   return on spend; those cells are null, not zero and never infinity. A source with
   zero qualified leads has a win rate that is undefined, and the score is computed
   on the qualification half with the win half marked as not measurable rather than
   silently zero.
5. **Band for display, not for verdicts.** A green-amber-red band on the score at
   sixty and forty is a display convention; a verdict about the source goes through
   the sample gate and the cause taxonomy, never through the band colour.

## Decision rules

- **When the business has stage data past "qualified" - an opportunity stage, a
  proposal stage - keep the score on qualified and won, because** the intermediate
  stages are process artefacts that vary by team; the two the score uses are the
  ones every business has and the ones money attaches to.
- **When two sources tie on score, break the tie on cost per qualified lead, because**
  the score is a quality figure with no cost in it, and the business is choosing
  where to put the next unit of budget.
- **When a source's qualified count is below the stage floor, show the score in
  the thin-sample state and exclude it from the ranking, because** a source with two
  qualified leads and two wins scores a hundred and belongs at the top of nothing
  (see `minimum-sample-before-verdict`).
- **When the score feeds a prompt, hand it beside the counts it was computed from,
  because** a model told "score 72" invents a story; a model told "72 from 48% of 120
  qualifying and 30% of those closing" narrates the story that happened.

## Calibration and what the weights are

The weights are a convention. Nothing in the domain says six-tenths; a business
whose sales team is the constraint should weight win higher, a business whose form is
the constraint should weight qualification higher. The standard is that the weights
carry a source and a date, and are revisited when the business has enough closed
deals to regress revenue per lead on the two rates and see which one predicts it.
Until then the score says "convention, adopted on such a date" wherever it is
explained.

The 60/40 display bands are likewise a convention, and they are the same constant on
every surface that colours a score - a badge, a table cell, a prompt line - by
construction rather than by copy.

## When NOT to use

- Not as a per-lead score. This is a per-source figure over many leads; individual
  leads are scored on two axes (`two-axis-fit-engagement`).
- Not as an efficiency figure. It has no cost in it; cost per qualified lead and
  return on spend live beside it.
- Not as a verdict. "Junk" and "mis-targeted" come from their own rules with their
  own sample gates; the score ranks, and ranking a thin source is refused.
- Not across currencies. A blended score over sources billed in two currencies is
  fine (the rates are dimensionless) but the cost columns beside it must not be
  summed.
