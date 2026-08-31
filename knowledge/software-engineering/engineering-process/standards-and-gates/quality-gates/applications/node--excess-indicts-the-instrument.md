---
layer: application
type: application
subject: quality-gates
technique: excess-indicts-the-instrument
stack: node
status: reconciled
applied: experiment
ab_verdict: not-better
proof: ab-paired
verified_on: 2026-08-31
verified_against: node@24
---

# Excess as a scope signal, tested against a real frozen baseline

The technique claims an implausibly large finding population is evidence about
the checker's scope declaration before it is evidence about the codebase, and
that the shape which separates the two is **distribution**: misconfiguration
clusters on a boundary the configuration draws, debt spreads the way the code
does. This is the run that tested that claim on a tree where the trap it
describes had already been sprung.

## The seam

A web application repo carries a committed ratchet baseline whose predicate
block names its counters explicitly and whose comment forbids pipeline
auto-update. Three of its buckets come from an unused-code scanner configured by
a checked-in config file declaring `entry` and `project` globs:

| bucket | baselined value |
| --- | --- |
| unused files | 230 |
| unused exports | 1329 |
| unused types | 735 |
| instrument: files walked | 982 |

**230 unreachable files out of 982 walked is 23.4% of the codebase**, measured
once and frozen as a floor a week before this run. That is the exact composition
the technique warns about: a large founding population, consumed by a ratchet
that will defend it downward forever and can never re-raise the question. The
scanner's own authors put their self-suspicion threshold at 20 unreachable files;
this tree was at eleven and a half times that and nothing asked.

## Arms

Same tree, same instrument, same invocation — the two arms are the two readings
of one number.

- **A — current practice.** The 230 findings are debt. They were baselined as
  debt, and the ratchet enforces them as debt.
- **B — technique applied.** Bucket the 230 by directory prefix, compute each
  bucket's unreachable rate against that directory's total file count, and
  compare to the overall 23.4%. Investigate every bucket the test flags.

Arm B was run first as a pure re-measurement to confirm the instrument still
reproduces the frozen numbers. It does: 230 / 1329 / 735, identical to the
baseline. Whatever the arms disagree about, they are not disagreeing about the
measurement.

## What arm B found

The distribution test separated the population sharply, and by its own rules it
worked:

| bucket | unreachable / total | rate | vs overall |
| --- | --- | --- | --- |
| the largest feature directory | 52 / 259 | 20% | **0.9x** |
| an application-component directory | 38 / 43 | 88% | 3.8x |
| a query-filter library | 19 / 29 | 66% | 2.8x |
| a link-sharing library | 18 / 19 | 95% | 4.0x |
| a search-refinement library | 12 / 12 | **100%** | 4.3x |
| a card-component directory | 8 / 8 | **100%** | 4.3x |
| a scoring library | 6 / 7 | 86% | 3.7x |

The single largest contributor — 52 findings, 23% of the whole population — sits
*below* the base rate at 0.9x and is textbook distributed debt. Seven other
buckets fire at 2.4x–4.3x, several at total directory saturation.

Then each flagged cluster was checked for referrers outside itself, and the
result is the one that matters: **all seven were genuine dead code. None was a
root or resolution error.** Two clusters had no referrer of any kind; one was
reached only by other files already in the findings; one 19-file library had
exactly one live importer pulling exactly one of its files, leaving the other 18
correctly reported.

## Verdict: not-better, and the confound is the finding

The technique's diagnostic claim does not hold on this tree, and it fails for a
structural reason rather than a measurement one: **dead code arrives in whole
features.** An abandoned feature leaves its whole directory unreferenced, so
"nothing declares a root here" and "this island is genuinely dead" predict the
*same* distribution. Clustering cannot choose between hypotheses that make
identical predictions. On this tree it fired seven times and was right about
misconfiguration zero times — a checker shipping this test as written would have
accused the configuration seven times in one run and been wrong seven times.

The technique keeps the sampler and gains the second stage, which is what
actually decided all seven cases here and cost about a minute each: a referrer
check per cluster, where only a **live, rooted importer whose imported files the checker
still calls unreachable** indicts the instrument.

## What the tree said that nobody built it to say

The eight-file component directory reporting 100% unreachable has exactly one
reference from anywhere in the live codebase, and it is **a documentation comment
in a component that is very much alive**, telling the reader to use the dead one
instead and explaining how the two differ. The surviving code's own guidance
points at eight files nothing imports. Nobody designed that; it fell out of code
being deleted around prose that stayed. It is a carrying cost of exactly the kind
the elimination subject prices — a dead exemplar that the next reader, or the
next code-writing agent, finds and copies — and the referrer check surfaced it
for free while answering a different question.

It also carries a caution the technique now states: a reference found by text
search is not a reference. Had the check counted that comment as a live importer,
the cluster would have been misfiled as a resolution error.

## What this realization cannot do

The distribution test is computed from a report, so it inherits every blindness
the scanner has: it cannot see files the `project` glob never admitted, which is
the failure mode most likely to *be* a scope error. It ranks by directory prefix,
which is a proxy for the configuration's real boundaries and a poor one wherever
roots are declared per-file rather than per-tree. And nothing here was shipped
into the project: the run measured, and the 230 findings and their baseline stand
untouched.
