---
layer: technique
type: technique
subject: political-compass-from-votes
technique: matching-model-choice
status: forged
laws: [missing-is-not-zero, provenance-or-nothing]
use_when: [choosing the distance model that turns answers into matches, evaluating whether a scaled answer format or a spatial map is worth its sensitivity cost, reviewing a compass for imputed answers or projection presented as measurement]
shared_with: []
---

# Matching-model choice

"Alignment = matches ÷ comparable" reads like the absence of a model. It is not.
The questionnaire field has spent two decades comparing the family this formula
belongs to — per-issue distance metrics (city-block, euclidean, inner-product,
and published hybrids that average two of them), spatial models that first
project everything onto a low-dimensional plane, answer scales from binary to
five-point with or without a midpoint, and salience weights on top — and its
controlled comparisons keep producing the same result: with identical inputs,
a majority of users can receive a different top match under a different
reasonable model. Choosing the model is therefore a first-class design act of
this subject, not an implementation detail of the scoring rule.

## The record's structural dividend — and its exact boundary

The record-based design holds one genuine advantage here, and it should be
claimed precisely rather than vaguely. A ballot is binary: yes or no, with
everything else non-positional. When both sides of the comparison are binary
per-issue positions, the major metric families collapse into each other — the
city-block distance, the euclidean ordering, and the simple agreement rate all
rank entities identically over the same comparable set. One whole axis of the
model-sensitivity finding — *which distance metric* — is closed by the data
shape itself.

The boundary: that is the **only** axis it closes. Everything else that made
questionnaire matches model-sensitive transfers whole — which questions enter,
how non-answers are treated, who may be ranked, whether issues are weighted,
and whether results are projected. The honest claim is "the metric choice is
neutralized by binary ballots", never "the model went away".

## Decision rules

- **Default to the agreement rate over comparable positional pairs, and say
  why.** It is not the naive choice; over binary positions it is the entire
  well-behaved metric family at once, and it has a plain-language reading the
  disclosed rule can print. Deviating from it (scaled answers, weights)
  re-opens metric sensitivity and must be justified on the result surface,
  not just implemented.
- **The citizen's skip is a non-positional answer.** A skipped question enters
  neither numerator nor denominator for any entity — the same bucket
  discipline the record side applies to abstention applies to the citizen
  side. No imputation, ever: filling a skip with the scale midpoint
  manufactures a centrist position the citizen never expressed, the exact
  fabrication the abstention model exists to block, and the field's own
  simulation work advises exclusion over imputation.
- **Salience weighting belongs to the reader's lens.** Letting a citizen mark
  questions as more important is legitimate — as a reader recomputation under
  the lens boundary, never inside the authoritative number. A published
  default weighting other than "equal" is a model choice with the full
  sensitivity cost and needs the full disclosure treatment.
- **A low-dimensional map is an illustration, not a measurement.** Projecting
  entities onto a two-axis plane requires choosing the axes and an issue-to-
  axis loading — a strong model imported silently under a familiar picture.
  If a map renders, it is labeled as a projection of the published per-issue
  computation, and no rank or score is derived from positions on it.
- **Adaptive question ordering breaks comparability.** Selecting the next
  question from previous answers shortens sessions, and the field shows
  shortened fixed subsets degrade match fidelity badly — but a per-citizen
  question set means no two readers answered the same instrument, and the
  published board stops being one artifact. The compass draws one fixed set
  per methodology version; session-shortening belongs in how many of that
  set a citizen answers, guarded by the minimum-answers floor.

## When not to use this

- **As a license to explore models per release.** The model is part of the
  published methodology; comparing candidates happens before publication, and
  a change ships as a visible methodology event, not a tuning commit.
- **Where answers are genuinely scaled.** A design that adds graded answer
  options ("agree in part") has left binary ground and owns the full metric-
  choice problem — this technique then demands the comparison be made and
  disclosed, not that the agreement rate be kept past its validity.
