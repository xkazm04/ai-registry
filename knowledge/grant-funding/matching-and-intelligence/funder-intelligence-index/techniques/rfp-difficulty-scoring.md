---
layer: technique
type: technique
subject: funder-intelligence-index
technique: rfp-difficulty-scoring
status: forged
laws: [honest-null-over-forced-guess, small-samples-stay-silent]
shared_with: []
use_when: [labeling funders or programs by competitiveness, helping applicants triage where to spend proposal hours, mapping award rates to an ordinal scale]
---

# RFP difficulty scoring

Applicants do not think in percentages; they think in "is this worth eighty
hours?" Difficulty scoring is the translation layer: a small ordinal scale —
extreme / high / moderate / approachable — derived from the observed award
rate, so a reader can triage a list of opportunities at a glance without
doing base-rate arithmetic. It is a *presentation* of a measurement, and its
whole discipline is staying honest about that: the label must be a pure
function of published numbers, never an editorial adjustment.

## Calibrate the bands to the real spread

The mapping only works if its thresholds reflect how funder selectivity is
actually distributed, which is far more skewed than intuition suggests.
Sector-wide, foundations typically fund somewhere between 15% and 30% of
applicants; local and state government programs often run higher; national
research funders sit near 20%; and the national-scale flagship foundations
that dominate applicant attention run in the low single digits. A band
scheme drawn from that spread puts its cut lines low: award rates under
roughly 2% are *extreme* (statistically, a lottery with an essay
requirement), under ~6% *high*, under ~15% *moderate*, and above that
*approachable*. The exact thresholds matter less than two properties:

- **The scale discriminates where applicants actually browse.** Most of the
  funders a nonprofit shortlists cluster under 10%; a naive scheme centered
  on 50% would label them all "hard" and discriminate nothing.
- **The thresholds are constants, published in the methodology.** A reader
  comparing two indexes — or the same index across cycles — must be able to
  check that "high" still means what it meant.

## Difficulty is per program before it is per funder

A funder-level difficulty is an average over programs whose selectivity can
differ by an order of magnitude — one program drawing eight times the
applications of another at similar award counts, or one flagship open call
skewing the whole funder's mean. Where program-level cells clear the
publication floor, score them separately and let the funder-level label be
explicitly the aggregate. Where they do not, the funder-level label stands
alone — never back-fill program difficulty by copying the funder's label
down, because that manufactures precision the data does not contain.

## The rate is the input, and the rate has a floor

Difficulty inherits every guard on the award rate beneath it. A label
computed from a rate that would itself be suppressed is a suppressed label:
per [small-samples-stay-silent](../../../_laws.md#small-samples-stay-silent), a
program with eleven observed applications gets no difficulty badge, however
tempting the UI slot. And when no rate exists at all — a newly listed
opportunity, an off-panel funder — the honest output is *unrated*, per
[honest-null-over-forced-guess](../../../_laws.md#honest-null-over-forced-guess),
not a default of "moderate". An unrated opportunity tells the reader "we
don't know yet"; a defaulted one tells them a lie shaped exactly like
knowledge.

## What difficulty must never absorb

The label is a function of observed selectivity, full stop. Three things do
not belong in it:

- **Effort.** A 40-page federal application at 40% award rate is easier to
  *win* and harder to *write* than a two-page letter at 3%. Effort is a
  separate, useful signal; folding it into difficulty makes both unreadable.
- **Fit.** "Hard for you" is the win-probability estimate's job, which
  conditions on the applicant's own band. Difficulty is unconditional — the
  same label for every reader — and that is its value: it is the stable
  landmark the personalized number moves against.
- **Vibes.** Program-officer reputation, anecdote, strategy notes — these
  are legitimate qualitative signals and belong in a clearly separate
  free-text field with its own provenance, never blended into the ordinal
  label. A reader must be able to trust that the badge is arithmetic.

## Decision rules

- When an observed award rate exists above the publication floor → map it
  through the fixed thresholds; display the rate beside the label so the
  label never travels alone.
- When the rate is below the floor or absent → *unrated*, visibly distinct
  from *approachable*.
- When observed and curated rates disagree for the same funder → the label
  follows whichever rate the merge policy published (see the per-cell merge
  in the golden path); never average the two.
- When re-tuning thresholds → re-label the entire index in one pass and note
  the change in the methodology; a scale whose meaning drifts per row is
  worse than a blunt one.
