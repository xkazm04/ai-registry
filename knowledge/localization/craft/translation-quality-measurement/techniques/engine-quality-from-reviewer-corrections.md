---
layer: technique
type: technique
subject: translation-quality-measurement
technique: engine-quality-from-reviewer-corrections
status: forged
laws: [coverage-is-counted-not-claimed]
shared_with: []
use_when: [reviewers already approve or correct machine pretranslations and nothing records what they changed, wanting a per-locale engine quality signal without buying an estimator, deciding which locale's engine costs reviewers the most work, an approval rate is about to be quoted as quality]
---

# Engine quality from reviewer corrections

Wherever machine output passes through a review step, reviewers already produce
the most direct quality measurement a pipeline can have: what they changed. An
estimator predicts how an annotator outside the loop would score a segment. A
correction *is* the loop — the work the engine caused a real reviewer, on this
product's strings, today — and recording it costs nothing beyond keeping the
machine's text beside the human's final text.

## The mechanism

One production system, described by its operator, scores its own machine output
this way:

1. Keep every unit's machine pretranslation, unmodified, beside whatever the
   reviewer finally commits.
2. A pretranslation **approved unchanged** scores a flat maximum.
3. For a pretranslation the reviewer **rejected** and replaced, compute a
   surface-overlap score between the machine's text and the human's final text.
4. Store the **mean per locale per day**, and beside it two operational numbers:
   **time to review** and **the age of the unreviewed queue**.

The two operational numbers are not decoration. They are what keep the mean
readable, as the traps below show.

## What its operator reported

First-party, vendor-stated figures from that one system — not independently
replicated, with no published sample definitions:

- In an early phase, about **65% approved unchanged** and about **95% "usable"**,
  a term the source does not define, so it compares to nothing.
- At more than 20,000 strings, about **50% approved unchanged**, about 70% in the
  best locales.
- About **90% approved unchanged when the suggestion came from translation
  memory** rather than from the engine.
- The engine was a **per-locale custom model trained on the product's own
  memory**, not a generic one, so the figures describe a tuned engine and set no
  expectation for an untuned one.

Read them as evidence of shape, not as targets: the rate spreads by tens of
points across locales, falls between the early phase and scale (the source does
not say why), and differs by about forty points between suggestion sources.

## Rules

- **Split by suggestion source before averaging.** Memory matches approved at ~90%
  and engine suggestions at ~50%, averaged into one number, measure the memory hit
  rate as much as the engine. Engine quality is the mean over engine-sourced
  units only.
- **Treat a drop as the earliest regression signal the store gets.** A sustained
  per-locale fall in the approved-unchanged rate arrives before any user report
  and before the next probe run. It triggers the probe set in
  [regression-detection-under-a-moving-engine](./regression-detection-under-a-moving-engine.md);
  it is not a verdict on its own. Compare like with like — an early-phase rate
  against a large-corpus rate is a change of corpus, not of engine.
- **Read the overlap as volume, never severity.** It measures how much a reviewer
  rewrote. A one-word correction can be the critical mistranslation and a full
  rewrite can be a register preference; the typology types a correction, this
  only counts it.
- **Name it for what it measures.** "The work the engine caused reviewers" is a
  truthful label. "Quality" is not, because it says nothing about units nobody
  opened.

## The trap: it only sees what reviewers see

A locale nobody reviews produces no corrections, and a mean over no data is not a
good score but a missing one — which a dashboard carrying the last value forward
shows as steady.
[Coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
applies directly: the mean is reported beside the count of units reviewed that
day, and a locale with no reviews reports nothing, visibly.

The subtler failure is a team that **stops reviewing without stopping
approving**. Under time pressure more units are approved unchanged, and the
metric reports rising quality at the moment scrutiny fell. That is why review
time and queue age sit beside the mean: a rising approved-unchanged rate together
with falling time per unit, or a growing unreviewed queue, is a reviewing problem
dressed as an engine improvement.

The last bias is selection. Reviewers open what they choose, which is rarely
random, so the rate describes the reviewed population; a statement about the
whole store still needs the random draw of
[human-review-sampling-under-a-budget](./human-review-sampling-under-a-budget.md).

## Where it sits among the instruments

Against [reference-free-quality-estimation](./reference-free-quality-estimation.md)
it is the inverse trade. An estimator covers every unit but must be bought,
calibrated and distrusted segment by segment; this covers only reviewed units but
measures what matters there directly — per locale, daily, at no extra cost. A
pipeline with reviewers runs this first and points the estimator at the locales
and units the reviewers never reach.

## When not to use it

- **Where there is no review step.** No corrections, no signal; a store with no
  human in the loop needs the estimator.
- **Across teams or reviewer populations.** Strictness differs between people, so
  a rate from one team is not comparable to another's without calibrating the
  reviewers against each other first.
- **As a per-unit judgment.** One approval is one reviewer's decision on one day;
  the signal lives in the daily mean.
