---
layer: technique
type: technique
subject: adverse-impact-and-proxy-neutrality
technique: selection-rate-ratio-testing
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged, a-predictor-cannot-grade-its-own-labels]
shared_with: []
use_when: [computing an adverse-impact screen over a hiring gate, reviewing a fairness report before it leaves the building]
---

# Selection-rate ratio testing

The computation that answers "did the groups the law protects pass this gate at
comparable rates". It is small enough to write in an afternoon and easy enough
to get wrong that most published versions are wrong in the same three places:
the gate is undefined, the pool is whatever the query returned, and the output
has two states where it needs three.

## The procedure

1. **Name the gate.** A single, specific transition — application to screen
   pass, screen pass to interview, interview to offer. Not "the funnel". A gate
   is where a decision was made by a rule you can point at.
2. **Define the considered pool.** Everyone who reached the gate and had a
   decision applied, within a stated window. Withdrawals before the decision
   are not considered; they never faced the gate. Candidates still pending are
   not considered; their outcome does not exist yet and coercing them to
   "not selected" invents rejections.
3. **Compute each group's rate** as selected ÷ considered.
4. **Choose the reference group** by a rule fixed before you see the data —
   see [reference-group-selection](./reference-group-selection.md). Ties are
   broken deterministically — first in input order — so two runs over the same
   data cannot disagree about who the yardstick was.
5. **Ratio** = group rate ÷ reference rate, per group.
6. **Compare to the threshold** — the four-fifths screen where nothing else is
   codified, the jurisdiction's number where one exists, and *no threshold at
   all* where a jurisdiction has codified none.
7. **Attach the significance companion and the shortfall.** A ratio alone is
   not a finding.

## The two numbers that stop the ratio lying

**Statistical significance.** Ask whether the observed gap could plausibly
arise from chance at these cohort sizes — an exact test for small cohorts, a
standard-deviation test for large ones. A small-number difference that is not
statistically significant does not establish adverse impact, and reporting it
as one burns the credibility of every real finding you will make later.

**Shortfall.** How many additional selections would bring this group to the
reference rate. This converts a ratio into a human quantity. A shortfall of 0.6
people means the ratio failed on rounding; a shortfall of 40 people means
something is happening whatever the ratio reads. Where the two disagree,
believe the shortfall and say so in the report.

## Decision rules

- **Per gate, always; aggregate, additionally.** When a per-gate result is
  flagged and the end-to-end funnel is clean, the flag stands. A later stage
  that compensates for an earlier one does not defend the earlier one, and the
  aggregate is exactly the view that hides the gate you would fix.
- **When the score under test caused the outcomes being measured, say so in
  the report.** A screen that rejects below a floor generates the rejections
  the analysis reads; the number is then a statement about internal
  consistency, not about impact, unless a clean holdout arm exists.
- **When a group's cohort is under the floor, it does not get a ratio.** It
  gets the too-small state, and it is still listed — see
  [minimum-cohort-before-a-ratio-is-asserted](./minimum-cohort-before-a-ratio-is-asserted.md).
- **Stamp the result.** Gate, window, considered count per group, reference
  group and rule, threshold and its source (jurisdiction or internal), and the
  version of the scoring function or rule set that produced the decisions. A
  fairness verdict is bound to what it judged; a re-scored population is a new
  question and inherits nothing.
- **Never recompute silently.** A stored result whose inputs have moved is
  superseded, not refreshed. Two runs over overlapping windows with different
  answers is normal and is information; overwriting the first hides it.

## Where the data comes from

Group membership comes from the candidate's own voluntary self-identification,
collected separately from the deciding record and never joined back onto the
profile a recruiter or a model sees. If that data does not exist, this
technique does not run — and the correct output is that it did not run, not a
number derived from inferred membership. A name-to-group classifier attached to
hiring outcomes creates the sensitive data the design was built to avoid, at an
error rate that varies by exactly the groups you are trying to protect.

## When not to use this

- **When you hold no demographic data.** Ship the computation as a primitive an
  employer can run on data they hold. Do not run it on guesses, and do not let
  its existence imply it has been running.
- **As a fairness certificate.** It screens one gate for one pattern. It does
  not certify the process, the model, the rubric or the outcome, and a report
  that reads as certification will be quoted as one.
- **As a tuning target.** Adjusting cutoffs until the ratio clears, with no
  change to what the screen measures, moves the number without moving the
  fairness — and the adjusted cutoff is itself a fairness event that now needs
  its own analysis and its own justification.
