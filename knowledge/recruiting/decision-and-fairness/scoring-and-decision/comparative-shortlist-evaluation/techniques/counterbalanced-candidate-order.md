---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: counterbalanced-candidate-order
status: forged
laws: [inference-must-look-like-inference, say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [handing more than one candidate to a model in one prompt, narrating a comparison with a language model, asking a model for a pairwise or listwise judgment, auditing a generated comparison for order effects]
---

# Counterbalanced candidate order

Any model step that reads more than one candidate at once can be moved by *where*
each person sits in the prompt. This covers a narrator writing the comparison, a
pairwise judge, and a listwise ranker. So the order the candidates arrive in is an
input to the output, and an unrecorded one. The technique makes it a controlled
input: fix the claims before the model sees the people, run the step under more
than one order, and let no claim through that depends on the order.

## What the evidence says

Two findings carry this, and both come from direct measurement.

- **Model judges favour a position.** Pairwise judgments by language models have
  been shown to flip when only the order of the two items changes, and rankings
  "can be easily hacked by simply altering their order of appearance". The fix
  that literature settled on is to evaluate under several orders and aggregate.
- **Comparing brings out preferences that rating alone hides.** Asked to pick
  between two candidates with equivalent records, most models tested picked the
  one listed first well above chance. The same models also favoured one gender's
  names in the pairwise frame, an effect that was negligible when each candidate
  was rated alone.

The second point is the reverse of what holds for people. Human evaluators rely
*less* on stereotypes when judging candidates jointly than separately, so a side-by-side view is a
debiasing mode for a reviewer. A model given the same side-by-side view is
exposed to an effect the separate view would not have triggered. The two cases
need different handling, and a design that carries the human finding over to the
model gets it backwards.

## Procedure

1. **Decide the comparative claims deterministically first.** Leader or none,
   separation status, robustness status, cohort size and withheld fields are
   computed by code, as the rest of this subject requires. The model receives
   them as inputs and is forbidden to change them. This alone removes the largest
   order effect, because a model that is not asked who wins has no winner to put
   in position one.
2. **Present the candidates in a recorded order that does not encode the verdict.**
   A score-sorted list tells the model the ranking before it reads a word. When
   the ranking is already supplied as an input, the candidate blocks can follow a
   neutral order, such as a stable shuffle keyed on the run, and that order is
   recorded.
3. **Run order-sensitive steps under at least two orders.** Reverse the list,
   swap the pair, or run a small balanced set of rotations for a larger field.
   For a narrator, compare the claims each run makes: which candidate is
   described as stronger on which dimension, which risks are named. For a judge,
   compare the verdicts.
4. **Emit only what survives the reorder.** A claim made under one order and
   contradicted under the other is not emitted, or is emitted as undecided. A
   pairwise verdict that flips with the order is a tie on this evidence.
5. **Seal the orders used and the agreement,** so the record states whether the
   narration was checked and against how many orders.

## Cost, and the cheaper floor

Counterbalancing doubles, or more, the calls on the step it guards. For a
narrator that only restates deterministic claims, a cheaper floor is acceptable:
a deterministic post-check that the prose asserts no order, lead or robustness
the inputs forbid, plus a swapped-order rerun on a sample of runs as an audit.
If that audit shows disagreement at any meaningful rate, the step moves to full
counterbalancing. For a model whose output *is* a comparative judgment, the
floor does not apply. Such a judgment is counterbalanced or not used.

## Decision rules

- When a model is asked who leads, the design has already failed step 1. Fix
  that before counterbalancing anything.
- When the candidate order in a prompt is the score order, and the score order
  is not an input the model is told it may not change, treat every comparative
  sentence it produces as possibly order-driven.
- When a reorder changes a claim about a protected characteristic's proxy, or
  about a named person's relative strength, drop the claim and record the
  disagreement. That is a finding about the model, not about the candidates.
- When the field is larger than a handful, balanced rotations beat random
  shuffles: every candidate should occupy the first and the last position at
  least once.

## When not to use it

Do not use counterbalancing as permission to let the model decide. Agreement
across orders shows the output is not order-driven. It does not make a model's
choice between two people a sound comparison, and the deterministic claims still
govern.

Do not rotate the order of a surface a human reads as a ranking. The compare
table's row order is the score order, deliberately. Counterbalancing applies to
model inputs, and to review queues where the order carries no meaning.

Do not report per-order outputs to a candidate. They are instrumentation about
the model.
