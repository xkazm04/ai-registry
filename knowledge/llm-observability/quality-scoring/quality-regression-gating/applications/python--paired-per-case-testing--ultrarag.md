---
layer: application
type: application
subject: quality-regression-gating
technique: paired-per-case-testing
stack: python
status: forged
verified_on: 2026-09-30
verified_against: python@3.11
applied: experiment
ab_verdict: better
---

# A paired test that fills an absent case with zero (UltraRAG)

UltraRAG is an open RAG framework with an evaluation server that compares two ranked
retrieval runs with a per-query permutation test. This document reads it at commit
`a763d34432007fcd1b261209f222bb10df907beb`. The Python witness is its declared floor
(`pyproject.toml:10` "requires-python"). **Executed in a narrow sense:** the tree's own
mean and permutation functions were lifted out by syntax tree and run on synthetic
per-query scores, so the numbers below are structure and never magnitude. The tree was
not modified.

## What the design gets right

The test is paired on the query, which is the technique's central move: one difference
per query, resampled by sign (`servers/evaluation/src/evaluation.py:365` "s += d if random.getrandbits(1) else -d"), and an empty difference list is refused as p = 1.0
(`servers/evaluation/src/evaluation.py:357` "if not diffs:").

## Where it departs from the technique

The technique says pair on the intersection and disclose what was dropped. This tree
pairs on the **union** and fills the hole with zero
(`servers/evaluation/src/evaluation.py:628` "qids = sorted(set(per_a.keys()) | set(per_b.keys()))"; `servers/evaluation/src/evaluation.py:610` "return row[key] if key in row else 0.0").
A query one run never answered is scored zero for that run, so the test compares a run
against its own failure to answer and reports it as a quality difference.

**The measurement.** Two runs score identically on the twenty queries both answered; one
of them answered nothing for thirty more. Through the tree's own functions: zero-filled
union, mean difference 0.280, p = 0.0000; intersection, mean difference 0.000, p = 1.0000.
The same inputs produce a significant win and a perfect tie depending on the pairing,
and the output row carries neither the count of filled queries nor a caveat
(`servers/evaluation/src/evaluation.py:650` "bool(p_val < 0.05)").

Three smaller departures share the file:

- **The resampling is unseeded.** The module imports the random generator and never seeds
  it (`servers/evaluation/src/evaluation.py:5` "import random"). Five calls on the same
  eight differences at 200 resamples returned p = 0.095, 0.065, 0.095, 0.120 and 0.075,
  so a verdict near the threshold flips between runs of the same comparison.
- **The p-value has a floor of exactly zero.** It is the raw count over the resample
  count (`servers/evaluation/src/evaluation.py:368` "return cnt / n_resamples"), so a
  strong effect reports p = 0.0, which no finite permutation test can establish. The
  add-one form gives at least one over the resample count plus one.
- **Nothing is corrected for the number of comparisons.** One call tests every metric at
  every cutoff in its list and marks each against the same 0.05, so six cutoffs across
  three metrics is eighteen independent chances to be significant.

## What the realization cannot do

The structural fact is in the fleet, not in this tree: the paired runner of a connected
observability project aligns on a case identifier, keeps the intersection, and returns
the retained and dropped counts beside the deltas, with a test named for the case where
two targets error on different cases. That is the same technique built on the other pole
of the same choice. This tree cannot be audited into that shape by adding a caveat,
because the zero is written before the test sees the data.
