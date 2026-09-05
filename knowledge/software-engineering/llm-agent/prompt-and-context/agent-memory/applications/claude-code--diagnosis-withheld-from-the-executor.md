---
layer: application
type: application
subject: agent-memory
technique: diagnosis-withheld-from-the-executor
stack: claude-code
verified_on: 2026-09-04
verified_against: claude-code@2.1.260
applied: experiment
ab_verdict: better
proof: before-after
---

# A research method that reads its own diagnosis while producing the evidence

The witness for the version above is the harness reporting itself —
`claude-code 2.1.260` — and the artifact under revision carries a second one: the
skill file's own frontmatter declares `version: 2.5.0`, which is the state both
sides of the reading below were taken against. The instrument ran on
`node@24.14` with its built-in SQLite and no dependencies.

This registry's own source-mining method is an instance of the loop this
technique describes, and it is worth reporting because it is configured the way
the ablation measures as *worse* — deliberately, for a reason, and at a cost
nobody had counted.

## The three layers, and who reads which

| Loop role | The lane | Gate |
| --- | --- | --- |
| immutable traces | one dated note per mined source | none — append only |
| accumulated diagnosis | a run scorecard and a lessons file | none — append only |
| the artifact under revision | the method file itself | a version bump plus a skill checker |

The method's own first phase instructs the executing run to **read the
scorecard's latest declared focus before extracting anything**, and gives the
reason: it is the input that makes the method improve across runs rather than
merely repeat. So the executor reads the diagnostic layer by design, and the
run's own outputs are the evidence a later reflection phase uses to revise the
artifact. That is the contaminated configuration, arrived at for a good motive.

## The measurement

Instrument: every numbered imperative inside a *declared focus* block of the
scorecard, scored present iff some four-consecutive-word phrase of it appears
verbatim in the gated method file.

The first version of this instrument scored bag-of-words overlap and **failed
its own assertion**: a known-negative — a focus item written the same week and
demonstrably not in the method file — scored 1.00, because the method file is
long enough to contain almost any single content word somewhere. That failure is
the reason the predicate is phrase-level, and it is worth recording, because the
bag-of-words version would have reported a comfortable number.

Asserted against three positives whose text is in the method file by direct
reading, and two negatives:

| | count |
| --- | --- |
| declared-focus blocks | 56 |
| distinct numbered imperatives | 83 |
| carried by the gated file (strict phrase match) | **9** |
| not carried | 73 |
| shorter than the window (undecidable) | 1 |

Strict matching *understates* carriage, so 73 is an upper bound on absence and
had to be sampled rather than quoted. Twelve were hand-checked in both
directions. Eight sampled as likely-absent were all genuinely absent. Of four
sampled as likely-present-but-reworded, **two had in fact landed** — one focus
item asking that a category listing be read before believing a map result is in
the file as a placement veto that counts the category before scoring, and one
asking that forces be mapped rather than the concern is in the file as a rule
that a proposal cite forces and never features. A third had landed partially.

So carriage is somewhere in **9 to roughly 25 of 83**, and the diagnostic layer
is carrying the clear majority of what it tells the executor without the gate
ever having read it.

## The worst instance is the technique's promotion-signal clause, exactly

One item dominates. A demand to close a named gap "in writing" appears **27
times** across the scorecard, and the text itself counts the failures: *sixth
deferral*, *seventh*, *eighth*, *ninth*, *tenth*. The gated method file mentions
it **zero times**.

That is this technique's last section observed in the field. The loop kept
telling its executor the same thing for ten consecutive rounds through the only
channel it had, and the channel with no gate on it is the one that carried the
message. Read as an access problem it looks like discipline failure; read as a
promotion backlog it is a specific, actionable list with its own priority order
already written by repetition count.

## What A and B were

A before/after rather than a paired A/B, because a control is impossible here:
the same eighty-three items cannot be delivered to a run that did not read them.
The change instant is fixed at the current head of both files, the instrument is
the same on both sides, and **the missing half is not invented** — no estimate is
offered for what mining quality would have been under the withheld
configuration.

- **A (as configured)** — the executor reads the diagnostic layer; 9-25 of 83
  imperatives are gated, the rest are not.
- **B (the technique applied)** — the recurring imperatives are promoted into the
  gated artifact, where a version bump and the skill checker see them, and the
  diagnostic layer keeps the diagnosis rather than the instruction.

A live instance of A came up inside this very run and changed its result. The
paired-comparison instrument above printed both arms' intermediate state, which
is an instruction that appears in the diagnostic lane and **not** in the gated
method file; it caught both arms returning zero from a broken schema
substitution, which is the difference between "the column is missing" and "the
DDL never parsed". The rule earned its keep at n=1 while living in the layer the
gate does not read.

## Verdict, and what was deliberately not done

`better`, on the technique's diagnostic claim: reading a repeated
executor-needs-the-store signal as a promotion backlog produced a ranked,
countable list where the access framing produced a shrug.

Nothing was promoted into the method file by this run. That lane has its own
bar — a lesson is carried into the artifact only after the scorecard has
confirmed it across three runs — and a source-mining run editing the method
mid-flight is the one change a fleet of parallel readers cannot absorb quietly.
The finding is filed as the next change rather than made.

## What this realization cannot show

The ablation's actual number — that the executor's access costs final quality —
is not testable here. Its effect size was measured over a scored task
distribution with many runs per arm; a method whose runs are heterogeneous
sources mined once each has no such distribution, and no single session can
produce one. What this tree can confirm is the *mechanism's precondition* — that
task-solving instruction accumulates in the ungated layer and is delivered to the
executor — and it confirms it at 83 items and one ten-round repeat.
