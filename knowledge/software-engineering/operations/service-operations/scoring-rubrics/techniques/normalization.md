---
layer: technique
type: technique
subject: scoring-rubrics
technique: normalization
status: forged
laws: [count-carries-predicate]
shared_with: []
---

# Normalization

Raw signals arrive incomparable: milliseconds and percentages, counts and
ratios, higher-is-better and lower-is-better, ranges spanning six orders of
magnitude next to ranges spanning one. Normalization is the mapping of each
into a common scale so weights can combine them — and it is the hardest
honest step in the whole rubric, because a plausible mapping can decide the
ranking before any weight is applied, and nothing on the surface shows it.
A weight is at least visibly a judgment; a normalization looks like plumbing.

## Declare the frame: what is the floor, what is the ceiling

Every normalized value answers "relative to *what*?", and the answer is a
declared design decision, never a library default or an accident of the
current sample:

- **Fixed anchors** — a declared floor and ceiling with meaning ("zero
  failures maps to full marks; ten or more maps to zero"). Fixed anchors are
  for **tracking**: the same raw value normalizes identically today and next
  quarter, so movement in the score means movement in the subject. Their
  cost: anchors are claims about what "good" is, they need rationales like
  weights do, and they go stale as the cohort improves — a ceiling everyone
  has reached discriminates nothing.
- **Cohort-relative** — floor and ceiling derived from the current
  population (best and worst in the group, or chosen percentiles). This is
  for **ranking within the group now**: it spreads the cohort across the
  full scale and stays discriminating as the group improves. Its costs are
  the mirror image: yesterday's score and today's are not comparable
  (the frame moved, not necessarily the subject); one entity's improvement
  lowers everyone else's number; and a single outlier stretches the frame
  so the rest of the cohort compresses into indistinguishability — prefer
  percentile anchors or clamps over the raw min and max.

Choosing cohort-relative for a trend line, or fixed for a leaderboard, is
not a nuance — it is the wrong instrument. The same underlying signal may
legitimately ship both normalizations to serve both questions, but then
each rendered number says which frame produced it: a normalized value that
travels without its frame is a count without its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## For a movement question, the floor is the baseline — not zero

The frame error with the shortest path to a misled reader is the progress
meter: current value over target value, rendered as "how far along are we".
It answers a different question than the one the reader asked. Current-over-
target is **attainment** — standing relative to a goal — and its implicit
floor is zero, which is almost never where the subject started. A subject at
forty-five that sets a target of fifty shows a ninety-percent-full bar on the
day the goal is created, having moved nothing; the remaining ten percent of
the bar is ninety percent of the work. **Progress** — distance travelled —
requires a floor the attainment framing does not have: the value at the
moment the target was set, captured then, because it is unrecoverable
afterwards. If no baseline was stored, "progress since we set this goal" is
not computable, and the honest responses are to store one going forward, to
label the meter as attainment, or to answer the movement question with a
trend fit over the retained series instead of a point-in-time ratio.

Two rules follow. **Capture the baseline at creation**, not at first read;
a target created without one can never be re-baselined truthfully. And
**reject a target that is already met at creation** — with the current value
named in the refusal, so the setter can pick a better one. Otherwise the goal
is stamped achieved on its first evaluation and pollutes the record of
completed goals with a milestone representing zero movement, which is worse
than a misleading meter: it is a fabricated accomplishment.

## Polarity: invert before you combine

Half of real signals are lower-is-better. Every one of them is inverted
during normalization so that, after the step, **more is always better in
rubric space**. The inversion is per-dimension and explicit — a declared
`inverted` property on the dimension, not a scattered `1 - x` at some call
sites — because the failure mode is grotesque and silent: one un-inverted
dimension in a ten-dimension composite rewards the worst performers on that
axis, and the composite still looks plausible on every individual example a
reviewer eyeballs.

## Clamp at the edges, and mean it

Real data exceeds every assumed range. The mapping defines behavior beyond
its anchors — almost always a clamp to the floor or ceiling — so a single
pathological input saturates rather than dragging the composite outside its
stated scale or, subtler, stretching a cohort-relative frame until everyone
else's differences vanish. Clamping is also a disclosure duty: a dimension
pinned at an anchor is a fact the breakdown shows ("at or beyond the
ceiling"), because a clamped value has *lost information* and the reader
deciding on it deserves to know.

## Nonlinearity is policy, disclosed like policy

A linear map treats the step from terrible to bad as equal in value to the
step from good to excellent. Often that is false — the first improvements
matter most, or only excellence counts — and a curve (diminishing returns,
thresholds, bands) encodes the truth better. Fine: but a curve is a policy
choice with more free parameters than a weight, so it gets the weight
treatment — declared shape, one-line rationale, versioned changes — and the
default in the absence of an argued case is linear, because every parameter
added to the mapping is another place the ranking can be decided invisibly.

One property of the curve is non-negotiable: **monotonic, wherever the
input is continuous**. A stepped mapping on a continuous signal creates a
region where the subject's score *improves as its situation worsens* — the
value just below a step boundary scores less than the value just above it
on the wrong side. Steps survive review because each band looks reasonable
alone; the defect lives at the boundary, where nobody looks. Bands are
legitimate as a *presentation* of a monotonic score (see the banding rules
in score-explanation); they are not legitimate as the scoring function
itself when the underlying quantity is continuous.

## Normalize per dimension, not per source

The unit of normalization is the rubric dimension — the thing a weight will
multiply — not the data source. When one dimension summarizes several raw
signals, the sub-combination happens first, in raw space where the units
still mean something, and the dimension normalizes once. Normalizing early
and averaging normalized values through multiple layers compounds frame
choices until nobody can state what the final number is relative to.
