---
layer: application
type: application
subject: model-routing
technique: effort-calibration
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# Judge spread, measured — the tie-instrument question answered before it was asked

A self-hosted benchmark and evaluation product selects the model that grades every
other model's output. Witness for the version read: the workspace toolchain
pinned to `1.96.1` in `rust-toolchain.toml`, and the framework document's
judge-selection section.

The technique's amendment says a tie is a property of the instrument before it is
a property of the tiers, and that a panel whose members pull in different
directions on a stylistic axis cancels into an apparent parity. This tree answers
that question empirically, and its answer is sharper than the amendment's.

## Spread is the selection criterion, not accuracy

Four candidate judges were measured against a small human-labelled golden set,
and the column the product selects on is neither error against the human labels
nor correlation with them. It is **spread** — the gap between the score a judge
gives good answers and the score it gives bad ones — on the stated grounds that a
judge with a narrow spread cannot separate quality from deflection *at any
threshold*, so every scorecard, gate verdict and pooled digest downstream inherits
the error.

The measurements make the point concretely, and they are the reason this is not a
restatement of the amendment:

- The cheapest judge had respectable error and correlation and the **worst
  spread**. It scored a correct, complete answer below its own pass line while
  scoring evasive non-answers well above zero — an instrument that would report
  most comparisons as ties regardless of the candidates.
- The most expensive judge failed differently and, as the document says, more
  dangerously: healthy extremes but generous in the middle, passing a half-answer
  and a factually wrong answer at similar scores. Price bought nothing here, which
  is the technique's second inversion showing up in the *instrument* rather than
  in the candidates.

The same-family hazard is handled explicitly rather than noted: the document
records that its default judge grades same-family candidates and routes that case
to a pairwise comparison with randomized order.

## Verdict

`not-better`. The tree already selects its judge on discriminating power and
already knows what the amendment warns about, so there is nothing to adopt. As
with the arena row, this is prior conformance rather than refutation, and it is
the strongest corroboration the amendment has: an independent tree, measuring
rather than reasoning, arrived at "an instrument that cannot separate manufactures
ties" and made it the selection criterion.

The half the amendment adds that this tree does **not** carry is what happens
*after* a tie is found: the tree picks a better judge, while the amendment governs
the record when no better judge is available — naming the instrument beside the
tie, and filing a cheaper tier's measured win under quality rather than under
cost. Those are complementary, and the tree's own caveats line is where the first
of them would go.

## What this realization cannot do

The golden set is twelve items, one rubric, one domain, with human labels the team
produced itself, and the document states all four limits rather than implying a
general result. So the ranking of judges is a local finding, and the transferable
part is the *criterion* — select on spread — not the table. A reader copying the
winning judge rather than the method has taken the one part of this that does not
travel.
