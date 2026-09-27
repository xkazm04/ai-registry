---
layer: technique
type: technique
subject: combining-signals-into-a-hire-decision
technique: promote-floor-calibrated-against-real-outcomes
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-predictor-cannot-grade-its-own-labels, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [choosing the threshold at which a combined score may advance a candidate, replacing a round-number cutoff with a derived one, checking whether a threshold is supported by enough resolved outcomes]
---

# A promote floor calibrated against real outcomes

Every combined score eventually meets a number that decides something, and that
number is almost always invented: 70 because it looks like a pass mark, 80
because it sounds selective, 60 because the first cohort clustered above it. An
invented floor is the most consequential unexamined constant in a hiring system —
it converts a soft score into hard adverse action, and it cannot answer the only
question that matters about it: *what happened to the people on each side of it?*
This technique derives the floor from resolved outcomes, states the sample it
rests on, and refuses to derive one when the evidence is too thin.

## The loop

1. **Fix the outcome definition first, in writing.** What counts as a good
   outcome — hired and still performing at some horizon, passed probation, a
   manager rating at a fixed interval — is a policy decision, not a modelling
   one. Choose it before you look at any data, or you will choose whichever
   definition flatters the current threshold.
2. **Collect resolved outcomes only.** A candidate in flight has no outcome. A
   file with no recorded result is not a negative result
   ([law](../../../../_laws.md#absence-of-evidence-is-not-evidence)) — it is excluded
   from the calibration set and counted in a coverage figure.
3. **Band the score range.** Group resolved outcomes into contiguous score
   bands. Bands, not per-point rates: a per-point curve over dozens of outcomes
   is noise rendered at high resolution.
4. **Compute the hire (or success) rate per band**, each band carrying its own
   count — and require a minimum count *per band*, not only in total. A band of
   twenty people has a standard error of about eleven points around a 50% rate,
   so adjacent bands are usually indistinguishable; a band of three is an
   anecdote.
5. **Check monotonicity within a tolerance.** The rate should rise with the
   score. It will not do so perfectly; small inversions between adjacent bands
   are sampling noise, and a tolerance says how much inversion is acceptable
   before the curve is declared non-monotonic and the calibration refuses.
6. **Pick the floor as the lowest band whose success rate clears a stated
   threshold, and derive the threshold from what the two errors cost.** A
   false advance and a missed good hire rarely cost the same; the threshold at
   which advancing pays is the cost of a false advance divided by the sum of
   both costs. A majority (50%) is that threshold only when the costs are
   equal. Say which ratio you assumed. Below the floor, the score is not
   evidence for advancing. Where the floor has adverse impact, it must also
   be defensible as a *minimum proficiency* standard, not as an optimum: a floor
   that rejects a band in which nearly half would have succeeded has to say why.
7. **Fall back explicitly** when any precondition fails: too few resolved
   outcomes, a non-monotonic curve, no band clearing the rule. The fallback is a
   documented default floor, *labelled as uncalibrated*, never a silently
   computed number from insufficient data.

## Every threshold in that loop states why-this-number

Five constants appear above — minimum resolved-outcome count, minimum count per
band, band width, monotonicity tolerance, success threshold — and each is itself
an invented number
unless documented. Beside every constant, write a sentence saying what it
protects against and what changes if it moves. "Fewer than this many resolved
outcomes and a single hire moves a band's rate by more than the gap between
adjacent bands" is a why-this-number; "seems reasonable" is not. And every
rendered calibration carries its sample — resolved count, window, coverage
against total decisions ([law](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis));
a curve that cannot say how many people it saw is decoration.

## Three mechanics that decide whether the loop is honest

- **The bands are fixed in advance and not fitted.** Choose cut-points that are
  legible and anchored to something meaningful — anchor the lowest band to the
  live floor, so that band is exactly the "would not normally be promoted"
  region — and then leave them alone as outcomes accumulate. Fitting the band
  edges to the observed rates is a second, subtler form of grading your own
  labels: it guarantees a clean-looking curve out of any data. Fixed bands also
  make two calibrations a month apart comparable, which fitted ones never are.
- **State the interval convention, and check the top edge.** Band membership as
  a half-open test silently drops the maximum score from the top band unless the
  upper bound is set past it. The best-performing candidates vanishing from the
  calibration set is the kind of bug that makes a floor look under-supported for
  months.
- **The sample you report is the sample the bands hold.** An outcome with no
  recorded score, or a legacy out-of-range one, belongs to no band — so counting
  it in the headline "resolved" figure advertises more evidence than the curve
  actually rests on. Filter first, then count, and assert the invariant: the
  band counts must sum to the in-range total. When they do not, a band edge has
  a gap or an overlap; fail loudly rather than publish a floor derived from a
  sample that does not match the number shown to the human.
- **Deduplicate the corpus by identity, not by insert.** Every recorded outcome
  is counted individually, so the same real-world fact recorded twice — a form
  re-submitted, a manual entry duplicating an automatic one — is two data points
  where there was one. At the sample sizes hiring actually operates on, a single
  duplicate can move the suggested floor by a whole band. Upsert on a stable
  reference, and treat "a different outcome for the same person" as a new fact
  rather than a correction, since one person can genuinely reach two decisions on
  two requisitions.

## The small-sample caveat is part of the output

Hiring calibration operates in a data regime that would embarrass any other
statistical practice: a team may resolve a dozen outcomes a year. The honest
response is not to refuse forever — an uncalibrated round number is worse — but
to carry the caveat *with the floor itself*, so its thinness travels wherever the
number is displayed or acted on rather than being dropped when it is copied into
a slide. Below the comfort threshold but above the refusal threshold, the floor
is usable and explicitly provisional; review it on a schedule rather than
treating it as settled.

## The self-grading problem, which is not optional to address

A floor that rejects everyone below it produces no outcomes below it. The
calibration set therefore contains only people the floor already approved, and
the resulting curve measures the floor's internal consistency, not its validity
([law](../../../../_laws.md#a-predictor-cannot-grade-its-own-labels)).

Three responses, in order of preference:

- **A clean arm.** A deterministic, stable holdout of candidates who scored
  below the floor and were advanced anyway. Deterministic matters: a random
  holdout re-rolled on each run invalidates any approval set built on it, and a
  membership that shifts when the threshold shifts turns the threshold control
  into a device for sparing one specific person. Deterministic must still mean
  *independent of the candidate*. Assign membership by a hash of a stable id,
  never by arrival order, source or anything that correlates with who the
  candidate is. Count holdout hires in the adverse-impact figures, and keep
  downstream raters blind to membership, or the arm's outcomes are rated by
  people who know it is the arm. Credit scoring ran this experiment for
  decades: lenders that occasionally accepted below-cutoff applicants found
  that an accepts-only sample mostly damages *where the cut-off sits*, less the
  ranking, and that statistical reject inference was no substitute for the arm.
- **Natural experiments.** Periods when the floor moved, requisitions where it
  was waived, hiring-manager overrides. Weaker, but real evidence from outside
  the selected region. Where different reviewers see comparable files and some
  are more lenient than others, comparing their outcomes recovers part of what
  a holdout would, with no candidate advanced on purpose.
- **Say so.** Where no clean arm exists, state on the curve that it measures
  consistency within the advanced population and is not evidence that the floor
  is correctly placed. This is the minimum; it is not sufficient for a floor
  that drives adverse action at scale.

## Decision rules

- **When resolved outcomes are below the minimum, do not compute a floor.**
  Use the documented fallback and label it uncalibrated.
- **When the band curve is non-monotonic beyond tolerance, refuse.** A curve
  that does not rise with the score is telling you the score does not predict
  the outcome; picking a floor off it anyway propagates a broken instrument.
- **When no band clears the success threshold, refuse and fall back** rather
  than lowering the threshold until a band qualifies. The threshold moves only
  when the stated cost ratio moves.
- **When the floor moves, version it** and record which floor each past decision
  was made under. Re-scoring history against a new floor rewrites verdicts
  nobody made.
- **Never round the derived floor to a friendlier number.** The rounding is a
  new, uncalibrated threshold wearing the calibration's authority.
- **One floor, in one place.** The threshold the advice is computed against and
  the threshold the pipeline actually promotes on must be the same value read
  from the same source. A hardcoded cutoff living beside a calibrated one is not
  a redundancy, it is a guaranteed divergence — and the recruiter sees the
  calibrated number while the system acts on the other one.
- **Render the conclusion as a finding, not as a sentence.** The engine decides
  *which* of a small closed set of conclusions holds (insufficient sample, weak
  trend, raise, lower, already calibrated) and with what numbers; the words are
  composed at display time. Prose frozen at computation time cannot be read in
  another language, and cannot be re-checked against the numbers it claims.
- **Never present outcomes from a different team or role family as this
  team's** — see the per-team technique. A floor depends on the local base rate
  and bar, so pooled outcomes enter only as a named prior that local outcomes
  overrule, and a floor pooled without a label is contamination.

## When not to use this

- **When the outcome you can measure is not the outcome you care about.**
  Calibrating against "passed probation" when probation is rubber-stamped
  produces a floor that predicts an administrative event. Better no floor than a
  floor validated against a formality.
- **When outcomes are systematically unavailable for a protected subgroup**, the
  calibration will be derived from a non-representative slice and will encode
  that skew as a threshold. Fix coverage first.
- **For a first-of-its-kind role.** With no comparable resolved outcomes, there
  is nothing to calibrate against; use a documented default, a human gate, and a
  commitment to revisit — not a fabricated derivation.
