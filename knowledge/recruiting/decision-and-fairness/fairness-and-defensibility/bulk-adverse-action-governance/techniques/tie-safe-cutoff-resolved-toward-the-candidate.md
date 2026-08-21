---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: tie-safe-cutoff-resolved-toward-the-candidate
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [selecting a bottom slice or top slice of a ranked cohort, setting a cutoff for an irreversible action, explaining why one candidate fell inside a boundary and an equal-scoring one did not]
---

# Tie-safe cutoff resolved toward the candidate

## The concern

Ranked cutoffs have ties in them — far more than designers expect, because assessment
scores are coarse. A rubric summing five integer axes, a percentage rounded to a whole
number, a rating on a five-point scale: all of them produce dense runs of identical
values, and the boundary of a bottom-N window lands inside such a run routinely rather
than rarely.

A sort must return *some* order, so it invents one. A stable sort preserves input order,
which means the tie is broken by the order records happened to arrive in the pipeline. Two
candidates who are indistinguishable on every measured dimension then receive opposite
irreversible outcomes, and the only true explanation the record can offer is "the other
one's application was written to storage first". That explanation is not defensible to the
candidate, not reproducible by anyone re-deriving the decision, and not stable across
runs — re-run the same wave on the same numbers after a re-index and the boundary moves.

## The rule

**Never split a run of tied scores at an irreversible boundary. Resolve the run as a
unit, and resolve it toward the candidate** — for an adverse bottom-slice, shrink the
window to the lower edge of the tied run, sparing everyone in it.

The symmetric option, expanding the window to the upper edge of the run, is the one to
reject explicitly. It preserves or exceeds the requested count and is over-eager: it
enlarges an irreversible adverse action in order to satisfy a target number, which is the
exact inversion of the direction
[uncertainty must resolve](../../../../_laws.md#uncertainty-resolves-toward-the-candidate). The
requested count is a preference. The rejection is permanent. Preferences yield.

## The procedure

1. Sort the cohort by score, worst first for an adverse slice.
2. Take the requested window size, after applying the rounding and floor rules the
   configuration defines.
3. Look at the score at the last position inside the window and the score at the first
   position outside it. If they differ, the boundary is clean — stop.
4. If they are equal, walk the boundary *backwards* to the first position of the tied run
   and cut there. The window shrinks; everyone holding that score is spared.
5. If walking back empties the window entirely — the whole cohort shares one score — the
   wave selects nobody. That is the correct outcome: a cohort with no dispersion has no
   bottom.
6. Record the realized count, the requested count, and the fact that a tie shrank the
   window, so the shortfall reads as a decision rather than a bug.

### Comparison precision

Compare at the precision that was displayed and sealed, not at the precision the score
happens to carry in memory. If the reviewer saw whole numbers, two scores that render
identically are tied even when their underlying values differ in the sixth decimal. A
boundary that splits a visible tie on an invisible difference is worse than an arbitrary
one, because it looks explainable and is not — and the record must remain re-derivable
from the values the record holds
([a verdict is bound to what it judged](../../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## Decision rules

- **When the boundary lands inside a tie, always shrink.** No configuration flag to
  expand instead; a per-wave choice of tie direction is a per-wave choice about who gets
  rejected, made by whoever set the flag last.
- **When the realized count falls short of the requested count, surface the shortfall
  with its cause on the preview.** A silent shortfall gets "fixed" by the next engineer.
- **When someone asks to break ties by a secondary field** — application date, source,
  completeness, response time — refuse unless that field is a validated part of the
  selection instrument. A tiebreaker is a selection criterion with no validation study
  behind it, applied to precisely the population where it decides everything.
- **When a truly random tiebreak is proposed, refuse harder.** A random split is both
  unexplainable to the candidate and unreproducible, and it makes the wave's membership
  a re-roll.
- **When the action is favourable and reversible** — a top slice advancing to review —
  resolving the tie by *expanding* is acceptable, because the asymmetry follows the
  consequence, not the arithmetic. Spare generously, advance generously, and be strict
  only where the outcome is irreversible.

## Why this beats a threshold

Teams often propose replacing the slice with a fixed score threshold, on the grounds that
a threshold has no tie problem. It does not remove the problem; it relocates it to the
threshold value, where a run of scores sitting exactly on the boundary is decided by
whether the comparison is written as strictly-less-than or less-than-or-equal — a choice
made once, in code, by someone who was not thinking about people. State the inclusivity
of the comparison in the record either way. The tie discipline is the same: equal scores
share an outcome, and the shared outcome is the favourable one.

## When not to use it

- **Not where the cutoff is a legal or contractual requirement with its own defined
  tie-handling.** Follow the defined rule and record which rule was followed.
- **Not as a substitute for fixing coarse scoring.** Dense ties mean the instrument does
  not discriminate at the boundary. Tie-safety keeps that from producing arbitrary
  rejections; it does not make the instrument fit for ranking, and a wave that spares
  half its cohort to tie-safety is telling you the ranking is not measuring anything at
  that end.
