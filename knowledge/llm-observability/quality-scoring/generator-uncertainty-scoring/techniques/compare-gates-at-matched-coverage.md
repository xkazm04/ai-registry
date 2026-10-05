---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: compare-gates-at-matched-coverage
status: forged
laws: [statistical-verdicts-or-no-verdict, estimation-announces-itself]
shared_with: []
use_when: [a recalibration is credited with fewer errors at an unchanged threshold, two scorers or models are compared at one nominal confidence threshold, a scorer behind a gate is swapped or its input is enriched and the threshold is kept, choosing where to put an escalation threshold, a gate's line was fitted on a different scorer than the one now answering]
stage: team
---

# Compare gates at matched coverage

The concern: a confidence gate is not a threshold, it is a **point on a
curve**. Every line admits some share of cases - its **coverage** - and is
wrong on some share of what it admits - its **risk**. Raising the line trades
one for the other, and the whole set of trades a scorer can offer is its
risk-coverage curve. Three changes teams routinely make behind a gate
rescale the score: refitting the calibration, swapping the scorer, and
changing what the scorer is shown. Each one moves coverage at an unchanged
number. So an error count read at "the same 0.9" before and after the change
is read off two different gates, and the change is credited with the
difference.

The two techniques beside this one say what a confidence number means and
how to fit it. This one says how to **compare** two gates, and it is the
comparison that most writeups get wrong, because the threshold is the only
dial in view.

## Recalibration is the case where the error is largest

A fitted rescaling that is a monotone map of the score itself leaves the
ordering of cases untouched, so at matched coverage it admits exactly the
same cases and cannot change a single error. Temperature over a label vector
is not quite that: it preserves every argmax and almost every pairwise
ordering, but not all of them. Either way, nearly all of its effect at a
fixed line is a change in **how many cases the line admits**.

That has a consequence nobody expects: **the sign of the error change at a
fixed line follows the temperature, not the improvement.** Soften an
overconfident scorer and fewer cases clear the line, so errors fall.
Sharpen an underconfident one and more cases clear it, so errors rise -
even when the fit made the number far more honest.

A published walkthrough of a small trained decision model shows the first
half in its own numbers. It reports calibration taking mistakes from 97 to 36
in a thousand "even though we haven't actually tweaked the gate", while the
cases sent to a person rose from 160 to 326. That is a gate that admitted 674 cases instead of 840. The
error count fell because the line got stricter, and the same walkthrough
then ranked two models at that one line, one admitting 718 and the other
674, which compares their calibrations rather than their decisions.

## The measurement

The same task, rebuilt: a 30-way next-action pick over a public set of
support conversations, scored by a word-feature classifier that returns a
full probability per label. Four conversation-disjoint splits - train,
select, fit the temperature, report - with 1,004 report cases, one action per
conversation, three seeds. Arm A is the walkthrough's method: errors among
admitted cases at one nominal threshold, before and after the temperature.
Arm B holds the number admitted fixed at what the calibrated line admitted,
and compares the two orderings. The floor: argmax accuracy identical in both
arms, asserted.

- Across twelve seed-by-threshold points (0.5, 0.7, 0.8, 0.9), arm A
  attributed **124** errors of change to recalibration. At matched coverage
  the two orderings differed by **19**. Arm B's difference was smaller at
  every point; the largest single one was 7 of 17.
- The fitted temperature came out above one on one seed (1.10) and below
  one on two (0.78, 0.89). On the overconfident seed, arm A read as
  recalibration cutting errors at 0.9 from 20 to 15. On the most
  underconfident seed, it read as recalibration **tripling** them, 8 to 24 -
  on the seed where the fit cut expected calibration error the most, 0.111
  to 0.049.
- The area under the risk-coverage curve moved by at most 1.4% in either
  direction, and 97-99% of sampled case pairs kept their order.

The pre-declared prediction was that arm B's difference would be under a
tenth of arm A's. It came in at 15%, so the prediction was too tight. The
pre-declared falsifier, arm B reaching half of arm A, did not fire. The
residue is real and runs in both directions, which is why it has to be
measured at matched coverage rather than assumed to be zero.

## A scorer swap, measured on a fleet gate

A grader gate refuses input images below a line on a 0-10 scale. Three
graders answered the same 88 hand-labelled inputs (19 good, 69 bad) twice,
with every repeat identical. At the shared line, with no good input refused,
they admitted **21, 14 and 28** bad inputs. At each grader's own line - the
highest that still refuses no good input - they admitted **7, 6 and 12**.

The shared line made the best grader look seven times further ahead than it
was (seven fewer bad inputs, against one). It also admitted two to three
times the bad inputs of each grader's own line. The ranking held at this
seam: a shared line exaggerates more often than it inverts. But it compares
calibrations, so nothing read at it can tell you which case you are in.
Ranking quality disagrees with both views - pairwise separation of 0.988,
0.953 and 0.984 - because a coarse scale cannot reach every coverage: a
grader that puts good and bad inputs on the same integer has no line between
them.

## Decision rules

1. **Never report a change behind a gate as an error count at an unchanged
   threshold.** Report coverage and risk together, at matched coverage:
   choose each arm's own threshold so both admit the same number of cases,
   then compare errors. Or report the whole curve and the area under it.
   One point on each of two curves compares two settings of a dial.
2. **A threshold belongs to the scorer it was fitted on.** Swapping the
   scorer, refitting its calibration or changing what it reads voids the
   number. Carry the **operating point** across the change (a coverage, or a
   tolerated error among admitted cases), and re-derive the line that hits
   it.
3. **Choose the operating point first and the threshold second.** The point
   is a trade between errors you can live with and cases you can afford to
   escalate, and it belongs to whoever owns both costs. The threshold is how
   one scorer reaches that point. Calibration's job is to make that mapping
   readable, so that a calibrated 0.9 predicts the error rate among admitted
   cases. It is not to lower the curve, and it should not be credited with
   doing so without matched-coverage evidence.
4. **Record the pair on every gated decision.** The decision names the
   scorer that answered and whose line decided it. A line inherited from a
   different scorer is disclosed as such, because it is somebody else's
   operating point applied to a scale it was never measured on.
5. **On a coarse scale, report the reachable operating points.** Integer
   scores and whole-percent probabilities admit cases in steps, and ties at
   the line make coverage jump. Matched coverage is then approximate: say
   which side you rounded to, and compare at the nearest point both scorers
   can reach.
6. **Fit, select and report on different cases.** The temperature, the
   threshold and the reported number come from disjoint sets
   ([stated-distribution-over-closed-labels](./stated-distribution-over-closed-labels.md),
   rule 6). A line chosen on the report set will match any coverage you ask
   of it.

## Failure modes

- **The credited calibration.** "Recalibration cut errors by 60% at the same
  gate", written beside an escalation count that doubled.
- **The penalized calibration.** A sharpening fit that made the number honest
  is rolled back because errors at the old line went up.
- **The one-line bake-off.** Two models or two prompts ranked by their error
  counts at 0.9, each admitting a different share of traffic.
- **The borrowed line.** A gate refits per scorer for the default one, and
  every other scorer the router can reach is silently judged on the
  default's line.
- **The rounded tie.** A matched-coverage comparison on an integer scale
  that admits a whole tie block on one side and none on the other.

## When not to use it

A pure capacity decision is already at matched coverage by construction:
when the rule is "review the lowest-confidence fifty a day", the threshold
is the capacity, and two scorers compared on that rule are compared fairly.
Where the threshold is fixed from outside - a contract or a regulation names
the number - you cannot move it, but you still report the coverage it yields
for each scorer, because that is the cost of the rule. And where the
decision is a ranking with no line at all, there is no operating point to
match; the concordance statistics the neighbouring technique lists are the
whole comparison
([probability-calibration-is-not-agreement](./probability-calibration-is-not-agreement.md)).
