---
layer: application
type: application
subject: windowed-inference-over-oversized-inputs
technique: schedule-parity-by-realized-cut
stack: python
verified_against: python@3.12
verified_on: 2026-09-17
applied: code
ab_verdict: better
proof: ab-paired
---

# Two names for one clip, disagreeing about whether the cut counts (Python)

How the technique lands in a public Python speech service (`xkazm04/gravitone`,
commit `1a04e2c`, 2026-09-17). The stack witness is the runtime the repository pins
for itself; every blocking gate runs through the same interpreter.

The seam is two functions twelve hundred lines apart that name the same clip. One
builds a cache key and enumerates its own completeness — *everything that can change
the audio, and nothing that can't* — and excludes the segmentation on the grounds that
it is derived from the text. The other computes a segmentation version and folds it
into a durable digest, on the grounds that *seams are audible, so they are part of the
artifact's identity rather than an implementation detail*. Both sentences are written
down, both are confident, and they contradict each other.

## Why this seam could have refuted the technique

The unit's rule, stated at its own altitude, prescribes the obvious repair: two paths
computing one derived value must share one computation, so the key should import the
segmentation authority. That repair is implementable here in one line. If it had
worked, the residual this technique carries would not exist and the honest verdict
would be `not-better` with the covered half cited.

## Arms and the two assertions

Both assertions had to hold on one arm, and they pull in opposite directions.

- **T1 — separate when the seams move.** A body that is one unit under the shipped
  chunk budget and three units under a tiny one must get different keys.
- **T2 — agree when they do not.** A single-sentence body, one unit under every
  budget, byte-identical audio, must get the same key under two different budgets.

| arm | T1 | T2 | score |
| --- | --- | --- | --- |
| **A** — as shipped | fail (the tuples printed identical) | pass | 1 of 2 |
| **B1** — import the segmentation policy, the unit's rule applied literally | pass | **fail** | 1 of 2 |
| **B2** — the **realized** cut: the policy version plus the unit lengths the chunker actually returned | pass | pass | **2 of 2** |

**B1 is the refutation, and it is the finding.** Sharing the policy scored exactly what
doing nothing scored; it moved the failure from one assertion to the other. The policy
is too coarse — two identical policy strings cut a ragged input differently — and too
fine — one policy change renames every result, including the ones whose seams never
moved. The shared authority has to name the realized value.

## Floor

**F1, tolerance 0**, measured with the project's own runner, one module per run across
all 109 modules: 103 green, 6 non-green. All six are environmental and were re-run on
the arm-A baseline with identical results and identical causes — two need an optional
speech dependency that is absent (verified by asking the import system, not by reading
the error), one reads a generated certification file, and three collect no tests.
Byte-compilation is clean on both arms.

**F2** — unchanged-configuration cache hits still work: the cache module's 26 cases and
the determinism module's 14 are green on B2. At the topology the product actually ships
(single worker, cap of one, the chunker short-circuiting), the new key component
reduces to the body's own stripped length, so the key is effectively unchanged where
the product ships and the correction bites only where the defect can fire.

## Positive controls, and the one that found something

- **PC1** — T1 was run against arm A first and failed, printing both identical tuples.
- **PC3** — the runner reported its test count before any edit.
- **PC2 — the gate can see the seam.** Dropping the text from the cache key entirely
  left the determinism module **green at 14 of 14**: the one module that names the cache
  key asserts voice separation and never text separation. Widening the run turned the
  cache module red with two failures and the long-form module red with one. So the floor
  is real, but not where a reader would look for it. That is reported to the project's
  owner as a gap in its own gate, not repaired here.

## What was corrected in passing

The cache key's docstring claimed the text is stored verbatim *because segmentation is
derived from it*. That was false — the segmentation also depends on the chunk budget
and the batch cap — and the branch fixes the sentence along with the key. A comment
that states a derivation the code does not perform is the same defect one layer up.
