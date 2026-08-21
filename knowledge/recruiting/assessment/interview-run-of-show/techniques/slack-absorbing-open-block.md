---
layer: technique
type: technique
subject: interview-run-of-show
technique: slack-absorbing-open-block
status: forged
laws: [say-only-what-the-record-holds]
shared_with: []
use_when: [a plan's blocks sum to less than its stated duration, deciding what an overrunning interview is allowed to sacrifice, interviews drift in their last ten minutes]
---

# Slack-absorbing open block

Every plan built from estimates has a residue. Block lengths are estimates, estimates
written as ranges get summed at their lower bounds, and rounding lands where it lands —
so the blocks reliably sum to less than the duration on the header. That residue is not
spare capacity. It is **unplanned time**, and unplanned time in a scheduled conversation
is not unused; it is improvised, by whoever is holding the clock, in the part of the
conversation nobody designed.

The remedy is one block, deliberately created, that owns the slack: an **open-discussion
block**, placed after the last scripted question and before the closing.

## What the block is for

It is a real part of the interview, not a buffer with a polite name:

- **Chasing what came up.** The answer at minute twelve that raised a question the plan
  did not anticipate is usually the most informative thread in the conversation, and a
  scripted plan with no room for it forces the interviewer to choose between the plan
  and the signal.
- **Deepening a thin answer** without stealing minutes from the question that follows.
- **Letting the candidate expand.** Many candidates have one thing they came to say. A
  block that lets them say it costs little and prevents the interview that technically
  covered everything and learned nothing.

## The rules that make it work

- **Exactly one such block per plan.** Two flexible blocks means neither is
  authoritative and the interviewer improvises which to sacrifice — which is the state
  this technique removes.
- **It has a minimum and a maximum, not a single number.** The minimum is what remains
  when the questions all run long; the maximum is the minimum plus the whole computed
  slack. The plan states both.
- **It is the designated casualty.** Say so in the plan, in words: *if the conversation
  is running long, this block shrinks first, and the closing is protected.* Interviewers
  cut something when they are over. The only question is whether the plan chose it or the
  panic did.
- **Slack is absorbed, never distributed.** The alternative — spreading the residue
  across the question blocks so every block is a little longer — hides it. Now no block
  is the flex block, every block is slightly padded, and the pacing signal each block
  gave the interviewer is wrong by a uniform amount.
- **The header and the last block must agree.** After absorption, the sum of the blocks
  equals the stated duration exactly. A plan whose header claims a length its blocks do
  not reach is making a claim its content does not hold, per
  [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds).
  Make it an assertion in whatever produces the plan; a review habit will not catch it
  reliably.

## Where it goes

Late, but never last. Placing it at the very end merges it with the closing, and a
merged block is a block that gets eaten together with the thing it was protecting. The
order that survives contact: opening → scripted questions → open discussion → closing.

Two exceptions worth knowing. In a round whose purpose is largely relational — a final
conversation with a hiring manager, say — the open block may be the largest block in the
plan, and the scripted questions exist to seed it. And in a machine-conducted round the
block should generally be small or absent, because "discuss freely for six minutes" is
an instruction an automated interviewer executes as an unstructured loop, and the round
loses the consistency that was the reason to run it by machine.

## When not to use this

- **Highly standardised comparison rounds** where every candidate must receive an
  identical stimulus. A variable-length free segment is a per-candidate difference in the
  middle of an instrument designed to be identical; there, the slack should be absorbed
  by extending the closing instead.
- **Very short rounds.** Under about twenty minutes there is no meaningful slack to name,
  and the block becomes a rounding artifact.
- **Timed assessments** whose duration is enforced by the instrument rather than by an
  interviewer's judgment.
