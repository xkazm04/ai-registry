---
layer: technique
type: technique
subject: translation-quality-measurement
technique: reference-free-quality-estimation
status: forged
laws: [coverage-is-counted-not-claimed, every-finding-cites-an-anchor]
shared_with: []
use_when: [scoring a machine-translated store that has no human translation to compare against, deciding which translated segments a reviewer should open first, setting a quality floor for a derived store before it is served, a quality score is about to be quoted as a pass, comparing two engine configurations on a corpus nobody has translated by hand]
---

# Reference-free quality estimation

A reference-based metric compares a candidate translation against a human
translation of the same source. In a derived-and-served store that comparison
is unavailable by construction: if a human had translated the unit, the unit
would not be machine output. The metric family with the best published
behaviour is therefore missing at exactly the point of need, and the
instrument that remains reads *source and candidate together* and predicts the
score a human annotator would have assigned. That prediction is the only
corpus-scale quality signal a derived store can have, and its properties —
not its existence — decide what may be said with it.

## What the instrument is actually good at

Two published facts bound every use of it. Sentence-level correlations with
human judgment for leading reference-free estimators sit around 0.4–0.5 on
well-resourced pairs and in-domain text; word- and span-level error
localization lands roughly between 0.3 and 0.6 F1. Both fall away on
low-resource pairs and on text outside the estimator's training domain, and
even reference-*based* metrics recover under sixty percent of pairwise human
preferences segment by segment.

Those numbers are not an argument against the instrument. They say precisely
what it is: **strong in aggregate over thousands of segments, unreliable on
any single one.** So:

- **Rank, do not grade.** The correct output is an ordering — which segments a
  reviewer opens first — not a per-segment quality label. An ordering tolerates
  per-item noise; a label does not.
- **Compare, do not certify.** A score difference between two configurations
  over the same corpus is a far better-behaved quantity than either score
  alone, because the corpus, domain and source text are held fixed and only the
  variable of interest moves.
- **Never report the raw number as quality.** The scale is the estimator's, not
  the language's. It has no unit, no calibration to any product's threshold,
  and it shifts when the estimator is replaced.

## The floor is a routing rule, not a verdict

An estimator earns a threshold only in one direction. Below the floor, the
segment goes to a human — that is a claim about attention, and attention is
cheap to be wrong about. Above the floor, **nothing is asserted**: the segment
is not reviewed, not approved, and not clean; it is merely not the next thing
to look at. A pipeline that treats crossing the floor as a pass has converted
a routing rule into a quality claim, and every defect class the estimator is
weak on — and it is weak on the rare, severe, adversarial ones — ships with the
approval attached.

Set the floor from the review budget, not from the score distribution. The
budget says how many segments a reviewer can open this cycle; the floor is
wherever the ordered list runs out of budget. A floor chosen as a round number
on the estimator's scale is arbitrary and drifts every time the estimator is
upgraded, whereas a floor derived from capacity stays meaningful and makes the
trade explicit.

## What a score may and may not be recorded as

A score is not a finding. [Every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
— a termbase row, a grammar rule, a format clause — and an estimator cites
nothing; it produces a number with no rule attached, which is the definition of
taste in this bundle. The discipline that keeps the two apart:

- The estimate is **evidence about the store**: it may be aggregated,
  compared across configurations, tracked over time, and used to route.
- A defect is **a typed finding about a segment**: produced by a rule or a
  human, citing what it breaks, remediable by someone who can act on it.
- The estimator's job ends at the handover. It selects the segments; the
  typology and the reviewer produce the findings.

And a scored store is not a reviewed store. Where a store's coverage is stated,
it states the number of segments a human actually opened against the number
assigned — [coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
— never the number scored, which is always all of them and therefore says
nothing.

## When not to use it

- **When a rule decides the case.** A skeleton break, a termbase miss, a length
  overflow, a duplicated source with divergent targets: all are decidable
  exactly, and an estimator's probability about them is strictly worse
  information than the rule's answer, at higher cost.
- **On a pair or domain the estimator was not built for.** Its degradation is
  quiet — scores stay in range and stop meaning anything. Before trusting an
  estimator on an unusual pair, seed it with a small set of segments a native
  speaker has already typed, and check the ordering agrees with theirs. If it
  does not, the estimator is a random number generator on that pair.
- **As the only instrument on a critical surface.** Legal text, safety
  instructions, payment flows and error messages that instruct a user carry
  consequences a 0.4-correlation instrument cannot bound. Those surfaces are
  the hand-authored or reviewed-and-committed case, and the measurement
  argument does not reach them.
- **Across estimator versions.** A score series that spans an estimator
  upgrade is two series drawn on two scales. Re-score the history with the new
  estimator or start a new series; never join them.
