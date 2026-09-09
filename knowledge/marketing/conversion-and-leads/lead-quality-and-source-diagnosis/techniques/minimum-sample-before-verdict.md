---
layer: technique
type: technique
subject: lead-quality-and-source-diagnosis
technique: minimum-sample-before-verdict
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero, label-convention-as-convention]
shared_with: []
use_when: [setting the lead-count floor for a source verdict, deciding whether a drift alert may fire, gating a win-rate claim on the qualified count]
---

# A minimum sample before any verdict

## The concern

A lead source produces tens of leads a month, not thousands. Every rate this subject
computes is a ratio of two small counts, and every verdict - junk, spam, mis-targeted,
worse than last month - is a claim that a small ratio is on one side of a line. The
minimum sample is the rule that stops the claim until the counts can carry it, and
it applies to alerts as strictly as to diagnoses.

## The procedure

1. **Name the floor per stage, on that stage's denominator.** A qualification-rate
   verdict needs enough leads. A win-rate verdict needs enough qualified leads. A
   thirty-lead floor with a third qualifying leaves ten qualified, and ten is not a
   sample on which "does not close" can be said. Two floors, not one.
2. **Run the floor before any other test.** In the cause taxonomy, "volume" is tested
   first; a source below the floor is diagnosed as too little data and nothing else,
   whatever its rates look like.
3. **Gate the drift alert the same way.** A period-over-period change in cost per
   qualified lead is a ratio of two ratios; on eight qualified leads last period and
   six this period, a twenty-five percent rise is arithmetic, not evidence. The alert
   needs both periods above the qualified floor, or it renders as "thin" rather than
   "worse".
4. **Render the thin state as thin.** The row shows its counts, its rates are shown
   greyed or withheld, the score is excluded from ranking, and the copy says "too few
   leads to judge" - never a zero, never a blank, never a verdict with a caveat
   underneath it.
5. **Say when it will be judgeable.** At the source's current lead rate, how many
   days until the floor; a report that says "re-run in three weeks" is more useful
   than one that says nothing.

## What the floor is

Thirty leads is the convention most lead-quality tools ship, and it is a convention:
it comes from the rule of thumb for a proportion's normal approximation, not from
any property of leads. A more honest floor is derived from the verdict's own line.
To say "the qualification rate is below thirty-five percent", the upper bound of the
rate's confidence interval must sit below thirty-five percent; with a fifth of leads
qualifying that needs roughly fifty leads at the conventional ninety-five percent,
and a source at thirty percent qualifying needs several hundred before the claim
holds. A stack that cannot compute an interval per verdict uses the convention and
labels it; a stack that can should show the interval and let the floor follow from
the line.

The same arithmetic on the win rate is harsher, because the qualified count is a
fraction of the lead count. A source needs on the order of a hundred leads before
its win rate carries any verdict at all, and a lead-generation business with three
sources and forty leads a month has one source, at most, it can judge per quarter.
That is not a defect in the method; it is the domain, and a module that judges
everything every month is lying about it.

## Decision rules

- **When a source is below the floor and its rates look terrible, say "too few
  leads" and set severity low, because** the terrible rate is the most likely
  thing to be noise, and a high-severity "volume" verdict contradicts itself.
- **When a source is below the floor and the business wants to act anyway, offer the
  form-side action and refuse the budget action, because** hardening a form is
  reversible and cheap and cutting a source is neither.
- **When the floor is passed on leads but not on qualified, diagnose qualification
  and refuse the win-rate and pricing branches, because** each branch needs its own
  denominator.
- **When the display shows a band colour on a thin source, remove it, because** a
  colour is a verdict and the floor forbids one.
- **When aggregating across sources to a blended rate, the blend may be judged when
  the total clears the floor even if no source does, because** the blend's
  denominator is the sum; the per-source rows stay thin.

## When NOT to use

- Not to withhold counts. Counts are always shown; only rates and verdicts are gated.
- Not on illustrative data as if it were thin real data; illustrative rows are
  labelled illustrative, which is a different state.
- Not as a permanent excuse. A source that never clears the floor after a quarter of
  spend has a finding of its own: it is too small to ever be judged, and a source
  that can never be judged is a source that should not be paid for blind.
