---
layer: technique
type: technique
subject: peer-benchmarking
technique: cohort-minimum-size
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [setting the floor below which no peer position is shown, a benchmark launches with few participants, deciding how a suppressed comparison is worded]
---

# Cohort minimum size

A corpus below a certain size cannot carry a position, and the failure is
not gentle. This technique is the floor, the argument for wherever you put
it, and the shape of the refusal below it.

## Why small corpora are confidently wrong

With a corpus of four peers, a rank has five possible values: beat none,
one, two, three, or all four. Rendered as a percentage, the top of that
ladder reads **"better than 100% of your peers"** — the strongest sentence
the surface can produce, generated from the weakest evidence it will ever
have. One peer joining or leaving moves the reader two rungs. The number is
not imprecise in a way the reader can discount; it is precise-looking and
unstable, which is the worst combination an instrument can have.

This is not a matter of choosing a better estimator. Position estimates from
small samples carry confidence intervals wide enough to span most of the
scale, and the intervals are widest exactly at the extremes — the region
where a benchmark's language is most emphatic. Published guidance on
distribution-position estimation converges on sample counts in the tens
before an interval narrows to a few points of rank, and higher for tail
positions in skewed data. Whatever floor you pick, pick it knowing that
single digits are not in the running.

## The second, independent argument: small cohorts leak

A peer corpus is data about other customers. At n=3, a participant who knows
two of the three has learned the third's number by subtraction; at n=1 the
"benchmark" is a direct disclosure. Privacy practice has a name for this
family of thresholds — a minimum group size below which an aggregate is
suppressed — and it lands in the same numeric neighbourhood as the
statistical argument for entirely different reasons.

Two independent arguments converging on one threshold is a strong signal.
**Take the stricter of the two.** And note the asymmetry: the statistical
floor could in principle be lowered by a better method; the disclosure floor
cannot be lowered by any method at all.

## Setting and holding the floor

- **It is a named constant, not a literal.** A threshold spelled inline at a
  call site is a threshold that exists in three slightly different values
  within a year. Name it, and name it where every surface that ranks can see
  it ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
- **Different surfaces may hold different floors — deliberately.** A quiet
  internal insight panel and a public-facing register carry different
  disclosure risk and different reader consequences, so two floors is a
  legitimate design. What is not legitimate is two floors that exist by
  accident, uncommented, each unaware of the other. If they differ, each one
  states what it is protecting and why it differs.
- **The floor is counted after the filter, not before.** Corpus size means
  *comparable* peers ([comparability-filters](./comparability-filters.md)).
  Counting raw rows and then filtering is a floor that lets through cohorts
  it was built to stop.
- **Count peers, not measurements.** One prolific organization contributing
  four hundred items is one peer. The unit of the corpus is whatever unit is
  being ranked — see
  [population-vs-scalar-ranking](./population-vs-scalar-ranking.md).
- **Exclude the subject from its own corpus** when the position is "how many
  others am I above"; include it consistently if the position is "where do I
  sit in the whole field". Either is defensible; drifting between them
  between surfaces is not.

## Narrowing spends the corpus

A peer group defined by attributes — segment, size band, dominant technology
— is a division of the corpus, and the floor applies to every slice
independently. Practically this means a product usually carries **two floors
of the same value applied at two scopes**: one for the broad corpus, one for
each narrowed cohort. They are separate constants because they answer to
separate populations, and they must be checked separately: a broad corpus
comfortably above the floor says nothing about the cohort carved out of it.

Two rules keep narrowing honest:

- **A subject with no clear segment gets no cohort comparison.** Assigning it
  to the nearest segment to avoid an empty tile fabricates the peer group.
- **A cohort position and a broad position are separate claims, separately
  labelled and separately suppressible.** Rendering one where the other was
  requested — silently falling back to the broad rank when the cohort is too
  thin — swaps the question without telling the reader.

## Refusal is an output, not an error

Below the floor the surface produces a *stated absence*, never a blank, a
zero, a dash, or a dimmed number that readers will still quote. This is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success): "we
did not compute a position" and "your position is low" must be spelled
differently, all the way to the last consumer, including generated prose and
exports.

The wording rule has one hard edge: **the refusal states the policy, not the
count.** "Not enough comparable organizations to place you yet" is a
disclosure about the product. "Only 3 peers matched" is a disclosure about
other customers — the exact leak the floor exists to prevent, handed over in
the act of enforcing it. The same applies to anything derivable from the
count: a progress bar to the threshold, a "2 more needed" nudge, a list of
who nearly qualified.

Where a refusal would leave a surface empty, the honest substitutes are
absolute rather than relative: the subject's own value, its own trend, its
distance from a published target. A benchmark that cannot rank can still
inform.

## When not to use this

- **When the comparison is not a rank.** Showing a corpus median as context
  alongside a score is a weaker claim than a position and can survive a
  smaller — though never a leaking — corpus. Be explicit that it is context,
  and never let it be re-derived into a rank downstream.
- **When the "peers" are internal units of one tenant.** Team-to-team
  comparison inside one organization has no cross-tenant disclosure problem,
  but it inherits a sharper one: small internal cohorts identify people. The
  floor there is governed by the ethics of naming humans, not by this
  technique.
- **For fixed reference distributions.** Ranking against a published,
  external, static distribution is not a cohort at all; its sample-size
  question belongs to whoever published it, and your obligation is to say
  whose distribution it is.

## Smells

- A rendered "top 0%" or "better than 100%" anywhere in the product.
- Threshold literals appearing in more than one place, with different values.
- A suppression message that names the corpus size.
- The floor checked against a count taken before the comparability filter.
- A position that changes materially week to week without the underlying
  score moving.
