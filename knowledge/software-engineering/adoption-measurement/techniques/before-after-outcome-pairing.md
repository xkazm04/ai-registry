---
layer: technique
type: technique
subject: adoption-measurement
technique: before-after-outcome-pairing
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [comparing an assessment taken before uptake with one taken after, a rollout impact claim is being assembled, one half of a before/after pair is missing]
---

# Before/after outcome pairing

## The concern

The only defensible way to put an outcome measurement next to an adoption
event is a **pair**: the same subject, the same instrument, one reading
before the adoption instant and one after. Everything weaker — comparing
adopters to non-adopters, comparing a team to the population mean, comparing
this quarter to last without an adoption anchor — imports differences that
existed before the practice arrived and attributes them to it.

The pair is also the part most often incomplete. Practices are usually
adopted before anyone is measuring, or measured before they are re-measured.
An honest pairing system spends most of its design effort on the missing
halves, not on the arithmetic of the delta.

## The procedure

1. **Fix the adoption instant.** One timestamp, recorded when the subject
   crossed the adoption threshold, minted once and carried
   (`count-carries-predicate` applies to the instant as much as to the
   counts: the threshold that defined it travels with it). A pair around a
   fuzzy or retroactively estimated instant is not a pair.
2. **Require instrument identity across the halves.** Both readings must come
   from the same assessment, at the same version, over the same scope. A
   rubric revision between the two readings makes the delta a measurement of
   the rubric. If the instrument changed, the pair is void — say so, do not
   adjust.
3. **Select the nearest qualifying readings on each side** within stated
   maximum distances from the instant. A "before" taken eighteen months
   earlier is describing a different team. State both distances alongside the
   delta.
4. **Resolve the boundary toward "after".** A reading taken at exactly the
   adoption instant belongs to the *after* side. The rule follows from what
   the before side has to mean: a state the practice provably could not have
   influenced. Anything simultaneous with adoption fails that test, and a
   tie-break that silently assigns it to *before* contaminates the baseline
   in the direction that flatters the practice.
5. **Compare only what both sides scored.** Where the assessment has
   sub-parts, a part present on one side and absent on the other is not a
   movement of zero and not a movement at all — it is out of scope for this
   pair. Include it and you publish a delta manufactured by coverage change.
6. **Emit a named status, always.** The result of a pairing attempt is one of
   a closed set — at minimum `paired`, `no-before` (adopted before assessment
   coverage began), `no-after` (adopted too recently, or never re-assessed),
   `instrument-mismatch`, and `out-of-window`. These are outputs, not error
   conditions to be swallowed: a pairing engine that returns only successful
   pairs makes the library look complete while quietly answering a different
   question (`failure-not-empty-success`).
7. **Report the unpaired population beside every set of deltas.** "Eleven
   paired, forty-three no-after" is the finding. "Eleven paired, mean delta
   +6" alone is a selection-biased highlight reel, because the subjects that
   got re-assessed are rarely a random half.

## The absolute rule: never invent the missing half

No cohort average standing in for a missing "before". No trend extrapolation
standing in for a missing "after". No population baseline silently
substituted so the row can render a number. A library of paired findings in
which some pairs are synthesized is not a slightly noisier library — it is a
generator of confident falsehoods, and the synthesized rows are exactly the
ones that will be quoted, because a fabricated baseline is usually chosen (by
the model, by the default, by the person) in the direction that shows
movement.

The correct render for a missing half is the named status and no number. Not
a zero, not a dash that a spreadsheet will read as zero, not a greyed-out
estimate. The gap is the message: it tells the program exactly which subjects
need an assessment scheduled.

## Even a complete pair is correlation

A real, instrument-identical, well-anchored pair with a real delta still does
not license "the practice caused this". The confounds are structural and
known:

- **Self-selection.** Teams that adopt early are systematically the teams
  already inclined and resourced to improve. Their trajectory was upward
  before the instant.
- **Concurrent change.** Adoption rarely arrives alone; it arrives with a
  reorganization, a hiring wave, a new leader, and a quarter of attention.
- **Regression to the mean.** Practices are adopted after a bad period more
  often than after a good one, so the "before" is disproportionately a trough
  and the "after" would have risen anyway.
- **Attention effects.** Being measured and mentored changes behaviour
  independently of the practice.

The phrasing that survives review is therefore comparative, not causal:
*"among the subjects with a complete pair, assessed capability moved by X
between the reading before adoption and the reading after; the pairing is
observational and does not establish that adoption caused the movement."*
That sentence is longer than the one the sponsor wants and it is the only one
that will still be true in a year.

## Decision rules

- If either half is missing, emit the status and stop. Do not compute.
- If the instrument versions differ, void the pair rather than normalizing
  across versions — cross-version normalization is an invention wearing
  arithmetic.
- If the paired subset is under the corpus's minimum sample floor, report the
  pairs individually and publish no aggregate delta.
- If the paired subset is a small fraction of the adopting population, the
  delta may not be reported as a program result at all; report the coverage
  gap as the result.

## When not to use this

- **Not where a controlled comparison is actually available.** If a genuine
  comparison group or staged rollout exists, use it; before/after pairing is
  the fallback for observational settings, not the preferred design.
- **Not for fast-moving metrics on a slow practice.** If the outcome varies
  weekly and adoption takes a quarter to matter, the pair is noise. Match the
  measurement cadence to the practice's payoff horizon or do not pair.
- **Not as a per-person before/after.** Pairing readings around an individual
  human's behaviour change is a personnel judgment, and whether it may exist
  at all is decided by the people-ethics subject, not here.
