---
layer: technique
type: technique
subject: judge-contract-design
technique: bias-counterbalancing-instructions
status: forged
laws: [the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [writing a pairwise preference prompt, writing a rubric judge prompt, batching cases into one judge call]
---

# Bias-counterbalancing instructions

The concern: model judges carry systematic, replicated biases — they
reward length (verbosity bias), they prefer answers by position in a
pairwise comparison (position bias), and they favor outputs styled like
their own (self-preference). Left unaddressed, these do not add noise;
they add a *constant*, which is worse — noise averages out across samples,
a constant silently trains the entire product toward longer, first-listed,
self-styled outputs, because whatever optimizes against the judge inherits
the judge's taste. The technique counters each known bias twice: once as
explicit prompt text, once as structure that makes the residual bias
measurable.

## The instruction layer

The counter-instructions live in the prompt contract itself, stated as
directives, not hints:

- **Anti-verbosity** — "penalize unnecessary length; do not reward
  verbosity" in rubric prompts; "do not prefer an answer merely for being
  longer or more verbose" in pairwise prompts. The asymmetric phrasing is
  deliberate: the judge should *penalize* padding, not merely refrain from
  rewarding it, because concision left unstated loses to fluency.
- **Anti-provenance** — "judge only the output's quality for the input;
  ignore which system produced it." This blunts self-preference and any
  brand or style tell the candidate leaks.
- **Anti-position** — in pairwise prompts: "the A/B ordering is arbitrary
  and must not influence you," plus content-only framing ("decide on the
  merit of its content; ignore style, tone, length, formatting") and an
  explicit tie outlet — "if they are equally good (or equally bad), answer
  Tie." Without a tie option, a judge facing two equal answers is forced
  to break the tie with exactly the bias you told it to ignore.
- **Anti-comparison, for batches** — when several independent cases share
  one call, say so at critical emphasis: cases are unrelated, must be
  scored independently, never ranked against each other, and each must
  receive the score it would receive alone; case order is arbitrary and
  carries no meaning. Batching is a transport optimization; unstated, it
  becomes a ranking exercise.

## The structural layer

Instructions mitigate; structure measures. Pair every instruction with a
mechanical counterbalance so residual bias surfaces as observable
disagreement instead of hiding as a constant:

- **Pairwise: swap the ordering.** Run both A-then-B and B-then-A; a
  verdict that flips with the swap is position bias made visible, and the
  honest aggregate treats a flip as a tie, not a win for either seat.
- **Batched: rotate case order between samples.** Any residual position
  effect then shows up as cross-sample disagreement — which the contract
  already measures — instead of biasing every sample identically in a way
  no agreement number can see.
- **Verbosity: record length beside the score.** The anti-verbosity
  clause alone is measurably gameable — published benchmark work has
  shown an instruction-only judge's preference swinging by tens of points
  when only the candidate's verbosity changes. The structural pair is to
  stamp each candidate's length on the verdict and read scores
  length-conditioned — trend score against length, or report a
  length-adjusted preference beside the raw one — so residual length bias
  surfaces as a measured coefficient instead of a hope that the clause
  worked.
- **Anchors are themselves a counterbalance:** a dimension anchored to
  observable properties gives verbosity nothing to attach to; holistic
  scores are where length bias does its damage.

## Decision rules

- When adding a new judged surface (rubric, pairwise, batch), carry the
  full instruction set from the start; biases do not wait for scale.
- When a bias has a structural counterbalance available, never rely on the
  instruction alone — instruction-only mitigation cannot tell you whether
  it worked.
- When counterbalanced runs disagree (order-flip, rotation spread), report
  the disagreement rather than averaging it away silently; it is a
  property of the instrument the calibration process needs to see.
- Keep the instruction text stable and versioned with the contract — a
  reworded anti-bias clause is a contract change, because it can shift
  scores without any candidate changing.

## When not to use it

Mechanical dimensions need none of this — a regex has no taste. And do not
pile on speculative counter-instructions for biases you have not observed
or that lack literature support: every added directive dilutes the judge's
attention to the ones that are load-bearing, and an unmeasurable
instruction is decoration. Counter the biases that are documented and
counterbalance-measurable; leave the rest to calibration against human
agreement, which is the neighboring discipline's job.
