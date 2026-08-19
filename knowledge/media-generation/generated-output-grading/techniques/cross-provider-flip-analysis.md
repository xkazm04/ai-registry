---
layer: technique
type: technique
subject: generated-output-grading
technique: cross-provider-flip-analysis
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when: [deciding whether a failed render indicts the prompt or the model, choosing between two image generators, a generator keeps failing one kind of brief]
---

# Cross-provider flip analysis

A failed render has two possible authors: the brief that asked badly, or the
model that could not deliver. Fixing the wrong one wastes the fix — rewriting
a good brief to accommodate a weak model degrades every other model it runs
on, and swapping models to escape a bad brief carries the bad brief along.
Flip analysis is the attribution instrument: **run the identical graded matrix
on two generators and diff it cell for cell. A cell that fails on both indicts
the prompt. A cell that flips — fails on one, passes on the other — indicts a
model.** The disagreement between generators, not either one's absolute score,
is what carries the diagnosis.

## Prerequisites

The diff is only valid if the generator was the *only* variable:

- **Same briefs, same style blocks, same aspect, same grading schema, same
  judge.** Any second difference contaminates every flip.
- **The generator must be an explicit parameter of the harness**, selected per
  run — never an environment side effect or a router's silent choice. If
  routing decides, you cannot re-run the grid on the other side, and the
  comparison dies before it starts.
- **Both grids persist into one index, keyed by generator**, so any two
  slices diff without re-rendering. The judgements are the durable artifact;
  the comparison survives even if images are cleaned up.

## Reading the diff

Work through four readings in order:

1. **Fails-on-both** → the brief is the suspect. Two unrelated architectures
   agreeing that a brief is undrawable is strong evidence the brief, not the
   drawing, is the problem. Rewrite it before spending another render.
   One caveat before convicting the brief: rule out a shared mechanical cause
   first — e.g. both models truncating a long prompt, so neither ever saw the
   clause they "failed". Re-run with the head of the prompt only.
2. **Flips** → a model ceiling. But a single flip is a coin still in the air —
   generation is stochastic, and one cell can flip on luck. The convincing
   forms are *replicated* flips: the same failure surviving many unrelated
   prompt variants on one model (a miss that persists across six different
   style framings of the same subject is not a wording problem), or —
   strongest of all — **directional unanimity**: when every flipped cell in
   the grid flips the same way, there is no task on which the losing model
   won, and the comparison has become a verdict.
3. **Failure texture** — group failures by axis before concluding. A failure
   that concentrates *by subject* across all styles (one model leaks glyphs
   on every brief that names a text-magnet object) tells you which nouns to
   starve out of briefs; one that concentrates *by style* tells you a style
   block fights that model's priors; one spread thinly everywhere is the
   model's base reliability.
4. **The economics** — convert the diff to money last, and use the right
   denominator: price per *usable* output (passes the gate, including
   unconditional fails), not price per render. The inversion is the recurring
   punchline of these comparisons: a generator costing nearly twice as much
   per render coming out half the price per usable plate, because usability
   differed by 3–4×. Per-render pricing had picked the wrong winner.

## Decision rules

- When the flip verdict is directional and replicated, standardize on the
  winner and demote the loser to fallback — but keep the loser in the routing
  chain for the work where its weakness does not matter; a verdict is
  per-capability, not per-brand of goodness.
- When flips are scattered and non-directional, you have measured parity plus
  noise, not a winner. Increase samples per cell before deciding anything.
- When fails-on-both dominates the grid, stop comparing models — you are
  benchmarking your own brief-writing, and the cheapest improvement is
  editorial.
- Never conclude from ungraded cells. A cell missing either side's grade is
  excluded from the diff and reported as excluded; coverage is part of the
  finding.

## When not to use it

Flip analysis needs a matrix — do not attempt it on a handful of ad-hoc
renders, where every "flip" is a sample-size artifact. It also cannot rank
three-plus generators in one pass with any elegance; run pairwise against the
incumbent instead. And it is the wrong tool when the two candidates differ on
an axis the grading schema does not measure (latency, licensing, reference
support) — the diff only sees what the grades see, and a decision made on it
alone silently zero-weights everything else.
