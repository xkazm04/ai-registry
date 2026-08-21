---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: gate-each-cohort-not-only-the-headline
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
use_when: [building a segmented breakdown, drawing a time series for a hiring team, comparing two groups or two sources]
shared_with: []
---

# Gate each cohort, not only the headline

A gate applied to an aggregate does not protect the cells the aggregate is made
of. Two hundred candidates clear any reasonable floor; the same two hundred
split by department, source, seniority and month produce cells of eight, four,
one and zero — and those cells are what the reader clicks into, what the
extremes come from, and what gets screenshotted into a leadership deck.

The rule: **gating happens at the granularity the claim is read at, not the
granularity it was computed at.** Every series point, segment row, group arm
and drill-down cell carries its own basis and its own state, independently
evaluated.

## Why the headline gate is worse than no gate

A page that flags the top-line figure as measured has extended trust, and the
reader carries that trust downward. Moving the dishonesty one click deeper
makes it both harder to notice and more likely to be believed than if nothing
had been gated at all. Partial gating is not a partial fix; it relocates the
problem to where the audit will not look.

## Procedure

1. **Enumerate the read granularities**, not the compute granularity: every
   segmentation the interface offers, every time bucket, every arm of every
   comparison, and every export the data can leave through.
2. **Evaluate the state per cell.** The state is computed from that cell's own
   count against that claim's floor — not inherited from the parent, not
   averaged.
3. **Let the parent and child disagree.** A measured headline over refusing
   cells is the normal and correct outcome for a hiring team, and the interface
   must be able to express it without looking broken.
4. **Set a separate rule for the container.** When most cells refuse, the
   breakdown itself is the wrong granularity — say so once at the top rather
   than rendering fifteen identical refusals, which reads as a bug.
5. **Handle ordering.** Sorting a mixed list by value puts thin extremes at the
   top, which is the exact opposite of what honesty requires. Thin and refusing
   cells sort after measured ones, or the sort is disabled.

## Time series are the hardest case

A per-period figure needs a per-period minimum, and weekly cells for a hiring
team almost never clear one. This is a finding about the granularity, not about
the metric.

- **Widen the bucket** until cells clear their floor — monthly, quarterly. A
  hiring team's honest resolution is usually far coarser than a dashboard's
  default.
- **Show counts rather than rates** when the bucket cannot be widened. A weekly
  count of applications is true; a weekly conversion rate over four candidates
  is not.
- **Break the line at refusing points.** Do not interpolate, do not plot at
  zero, do not connect through a gap — a continuous line asserts continuity of
  evidence.
- **Never let a rolling window hide the underlying counts.** Smoothing makes
  thin data look like a trend and is the most effective way to render noise as
  a narrative.

## Two floors, two questions

A cohort can fail one floor and clear another, because floors answer different
questions:

- A **comparison floor** asks whether there is enough *shape* to compare —
  enough candidates to rank, at least two arms, enough variation for a
  difference to exist. Structural.
- A **statistical floor** asks whether the *proportion* computed on this cell is
  stable. Distributional.

They are different numbers and must be stated separately. Unifying them under
one constant means whichever question was asked first governs the other
forever, and the mismatch surfaces as either a permanently blocked comparison
or a rate published on four people. When a claim needs both — a comparison
between two groups whose rates matter — it must clear both, per arm.

## Decision rules

- When a segmentation produces cells that mostly refuse, offer a coarser
  segmentation rather than a page of refusals. The refusal is honest; a page of
  them is a usability failure that gets the whole gate turned off.
- When a comparison has one arm below floor, the comparison refuses — not the
  arm. A ratio with one credible side is not half a claim, it is no claim
  ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
- When a cell is highlighted as best or worst, it must be measured. Superlatives
  over thin cells are the most-quoted and least-supported numbers on any
  hiring dashboard.
- When one cell serves as the **reference** the others are measured against, it
  must clear the floor on its own before it may hold that role. This is the
  most damaging thin-cell failure and the least obvious: a group of one with a
  100% rate becomes the highest-rate reference, every other group is then
  divided by it, and one person flips the verdict for the entire analysis.
  Excluding thin cells from display is not enough — they must be excluded from
  being a baseline, a maximum, a denominator or a benchmark.
- When a filter is applied, the state is recomputed. A figure that was measured
  unfiltered and stayed labelled measured after a filter cut it to nine is the
  most common way this technique is defeated in practice.
- When a breakdown is exported, per-cell states export with it
  ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
  A spreadsheet of bare numbers has lost every gate on the page.

## When not to use this

Do not gate per cell when the cells are counts of the record rather than
derived figures. A breakdown of how many candidates sit in each stage is true
at every cell size and gating it removes the operational view a recruiter
opened the page for.

Do not use per-cell gating as a substitute for choosing a sensible default
granularity. If the default view produces mostly refusals, the fix is the
default, not more labels — a correct interface that nobody can read has not
made anyone more honest.
