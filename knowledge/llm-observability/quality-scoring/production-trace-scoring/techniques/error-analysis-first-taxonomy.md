---
layer: technique
type: technique
subject: production-trace-scoring
technique: error-analysis-first-taxonomy
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, estimation-announces-itself]
shared_with: []
use_when: [standing up scoring for a surface with no rubric yet, deriving judge dimensions from real traffic instead of a template, deciding when manual trace reading has been enough, keeping review batches honest against unknown failure modes]
---

# Error-analysis-first taxonomy

Every other technique in this subject presumes a rubric and a judge
already exist. This one is about the step before them: on a surface with
no scoring yet, the failure modes are not known, and a rubric written from
a generic quality template measures the failures someone imagined rather
than the ones the traffic contains. The technique: **read traces first,
build a bottom-up failure taxonomy, and only then derive the dimensions a
judge will score.** Metrics that precede error analysis are the most
expensive way to formalize a guess.

## The reading loop

- **Open-code, then cluster.** Read real traces and note each failure in
  free words before any category exists; group the notes into named
  failure modes only once repetition forces it. Categories invented in
  advance absorb everything and explain nothing.
- **Stop at saturation, not at a quota.** A few dozen traces is the
  typical scale of a first pass, but the stopping rule is the observation
  that new traces stop yielding new failure modes — saturation is a
  property of the stream, not a count to hit. Record how many traces the
  pass read and what the last new mode was; the next pass starts from
  that record.
- **Every review batch keeps a random slice.** Each targeted sampler has
  a stated blind spot: judge-flagged traces re-find only failures the
  judge already detects, feedback-flagged only what users bothered to
  report, cluster- and outlier-picked only what the features encode. A
  guaranteed random remainder in every batch is the only channel through
  which an unknown-unknown can arrive. This is the review-side mirror of
  [errors-always-oversampling](./errors-always-oversampling.md): that
  technique guarantees coverage of known-bad traffic in judging; this one
  guarantees exposure to unclassified failure in reading.

## Ground truth is a person, and their reasons travel

Labels for the taxonomy come from one or at most two named principal
domain experts — a committee's compromise labels blur exactly the
distinctions a rubric will later need. Two disciplines make the expert's
judgment transferable:

- **Every label carries a written critique** explaining the ruling,
  detailed enough that a newcomer could apply the same reasoning to the
  next trace. The critique, not the label alone, is the asset.
- **Critiques are recycled into the judge contract** as worked examples
  when the taxonomy graduates to dimensions — the cheapest supervision a
  judge can get, and already in the expert's own words. Inter-annotator
  agreement, where a second expert exists, is measured per the golden-set
  discipline before anyone trusts the labels.

## Graduation

The taxonomy's clusters become anchored dimensions; the labeled traces
become the first stratified golden set; the judge is calibrated against
it before any verdict drives anything. From that point the subject's
other techniques own the loop — sampling, idempotency, drift, coverage —
and this one goes dormant.

## When not to use it

A mature surface with a validated rubric does not re-derive its taxonomy
on a schedule — recalibration, not re-reading, is the standing loop.
Re-open this technique when the product or traffic shifts materially: a
new capability, a new user population, a judge flagging failures the
taxonomy has no name for. And never let the taxonomy pass silently into
aggregate claims — counts read over open-coded categories are estimates
by construction, and say so.
