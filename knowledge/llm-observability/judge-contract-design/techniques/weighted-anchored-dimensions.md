---
layer: technique
type: technique
subject: judge-contract-design
technique: weighted-anchored-dimensions
status: forged
laws: [no-retroactive-restatement]
shared_with: []
use_when: [writing a new rubric, replacing a holistic 1-10 score, making judge samples comparable across time]
---

# Weighted anchored dimensions

The concern: a judge score must mean the same thing on every call, for
every sample, across model upgrades, and months later when someone reads
the trend. A holistic "rate this answer 1–10" cannot deliver that — the
judge invents a private meaning for 7, and a different one tomorrow. The
technique decomposes the score into named dimensions, each with an explicit
yardstick, and composes the overall from declared weights.

## The shape

Each dimension carries four things:

- **A stable key** — an identifier-like string (`correctness`,
  `faithfulness`, `concision`). It is the join key between the contract,
  the judge's structured response, and every stored verdict. Renaming a key
  is a contract change, not a cosmetic edit.
- **A description** — what this dimension measures, one or two sentences,
  written for the judge, not for a human reviewer.
- **A weight** — the dimension's relative share of the overall. The
  overall is the weighted mean: sum of score×weight over sum of weights.
  Weights encode product priorities; correctness typically dominates
  (a 0.5 / 0.2 / 0.2 / 0.1 split over correctness / completeness /
  faithfulness / concision is a sane default for answer quality).
- **Anchors** — explicit level descriptions on a narrow scale normalized
  to 0–1: "1.0 = fully correct and verifiable; 0.5 = minor error; 0 =
  wrong or unsupported." Anchors are the yardstick. Without them, two
  samples of the same judge disagree not because the candidate is
  ambiguous but because the scale is.

## Decision rules

- **When a quality axis matters independently, give it its own dimension**,
  because a folded-in axis can neither be weighted, floored, nor trended.
  Three to six dimensions is the working range; past that, weights stop
  expressing priorities and the judge's per-dimension attention thins.
- **When writing anchors, describe observable properties, not adjectives.**
  "Cites a source for every claim" is scoreable; "high quality" is not.
  Keep the scale narrow — three anchored levels beat ten unanchored ones,
  because a judge discriminates coarsely and a fine unanchored scale just
  adds noise that averaging cannot remove.
- **When tempted to tune a weight after seeing results, version the
  rubric instead.** The contract is stored and referenced by identity;
  verdicts point at the version that scored them. Editing weights in place
  restates every historical verdict — the exact restatement the accounting
  law forbids. A new version is cheap; a corrupted trend line is not.
- **When comparing scores across rubric versions, announce it.** The
  comparison may still be useful, but it is an estimate over two
  yardsticks, and the reader must learn that from the report itself.

## What this is not

Anchored dimensions do not make a judge deterministic — they narrow its
variance and stabilize its meaning. Sampling and agreement measurement
still apply on top. Nor is the weighted mean the pass decision: a mean is
tradeable by construction, and non-tradeable requirements belong to floors,
not weights. And when a dimension's yardstick is mechanically decidable —
equality, pattern, parseability — it should not be an anchored opinion at
all; type it as a mechanical kind instead.

## When not to use it

For a pure preference comparison ("which of two answers is better"), a
dimensional rubric is overkill and a pairwise contract with its own
counterbalancing is the right instrument. And for a gate that is entirely
mechanical — schema validity, exact extraction — a rubric of mechanical
kinds with no judged dimension at all is cheaper, exactly reproducible, and
makes no model call.
