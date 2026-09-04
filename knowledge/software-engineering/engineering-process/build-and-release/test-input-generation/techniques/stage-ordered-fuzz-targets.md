---
layer: technique
type: technique
subject: test-input-generation
technique: stage-ordered-fuzz-targets
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [fuzzing a pipeline of several stages through one end-to-end target, a fuzzer's findings are dominated by one shallow stage, an input that never terminates cannot be told from a slow one, deciding how many fuzz targets a multi-stage system needs]
---

# Stage-ordered fuzz targets

## The concern

A pipeline - a parser feeding a compiler feeding an executor, a decoder feeding
a validator feeding a store - is usually fuzzed once, end to end, because that
is the target that is easiest to write and the one that looks most like
production. It is also the target that finds the least, for a reason that is
structural rather than statistical: **a crash at stage k masks every defect at
every later stage on that input.** The generated input that would have
exercised the executor's rarest path never reaches the executor, because the
compiler asserted on it first, and the fuzzer records one shallow finding
where three were available. This is
[swarm-feature-sampling](./swarm-feature-sampling.md)'s masking argument
moved one axis over - there a feature that is always on suppresses the
condition another defect needs; here a stage that always runs first suppresses
the inputs a later stage needs.

The technique is one target per stage, each consuming that stage's own input
type, ordered so that upstream crash sets are drained before downstream ones
are read, with a deterministic budget on the deepest stage so that
non-termination is a finding and not a hang.

## One target per stage, each with the stage's own oracle

Each stage gets a target whose input is what *that stage* consumes and whose
oracle is the strongest one that stage admits:

- **The front stage** (a parser, a decoder) admits an idempotency oracle:
  what it produces, printed and re-consumed, must reproduce itself. The
  generator here is usually structural - it builds a syntax tree rather than
  bytes - and over-approximates, which is why the round trip is asserted on
  the normalised second hop; [model-based-oracle](./model-based-oracle.md)
  carries that rule.
- **The middle stages** (a compiler, a validator, a planner) admit assertion
  oracles: internal invariants that must hold of any well-formed input, per
  [inside-out-invariants](./inside-out-invariants.md). A middle-stage target
  exists *specifically* to drain the assertion failures that would otherwise
  block the deep target; that is its stated justification, and it is worth
  writing down beside the target so nobody deletes it as redundant.
- **The deepest stage** (an executor, a store) usually admits only crash-and-
  budget as an oracle, and the technique is honest about that: a deep target
  finds terminations, not wrong answers. Where a reference exists, the deep
  target is where a model oracle pays; where none does, say so.

The upstream stages double as the downstream target's generator and
normaliser: the executor target generates a tree, prints it, and parses it
again *to remove invalid inputs* before executing, so the deep target is
never fed what the front stage would have rejected. The generator's reach is
still the ceiling ([generator-bounds-the-space](./generator-bounds-the-space.md));
the gate reads what the stage was handed
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and what it was
handed is what the stages above let through.

## Order by depth, and drain before reading

Run and triage the targets in pipeline order. A finding in the front target is
fixed before the middle target's findings are read, because a fraction of the
middle target's inputs are the front target's crashes in disguise; the same
holds one stage down. Reading the deep target's findings first is the common
mistake, because they look the most serious, and it produces a queue of deep
findings whose minimal reproductions turn out to be shallow crashes.

The corollary for coverage claims: a deep target that reports nothing is not
evidence about the deep stage until the stages above it have run long enough
to be quiet themselves
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
A green executor fuzzer over a crashing compiler has fuzzed the compiler's
crash path.

## A budget makes non-termination a finding

The deepest stage of an executing pipeline can loop forever on a generated
input, and a fuzzer cannot tell a loop from a slow input without help. Give
the stage a **deterministic budget** - an instruction count, a step count, a
fuel - after which the stage stops with a distinct, uncatchable outcome, and
treat that outcome as a legitimate result of the target, not a timeout.

The budget converts time into a diagnostic. With the count fixed, wall time is
bounded by construction, so an input that takes far longer than the budget
predicts is a finding about the stage under test - a pathological path, a
quadratic somewhere - rather than a flake to suppress. State the expected time
per budget unit beside the target so the threshold is a number and not an
impression. A wall-clock timeout in place of a budget loses this: it fires at
the same point on a slow machine and a slow input, and the harness subject's
flake lifecycle then absorbs what was a defect.

## Decision rules

- **One target per stage whose input type differs from its predecessor's.**
  Two stages that consume the same type share a target.
- **Justify the middle targets in writing** as drains for the deep target;
  they are the ones a tidy-up deletes.
- **Triage in pipeline order**; a deep finding is not minimal until the
  stages above it are quiet on its input.
- **Budget the deepest stage deterministically**, and record time-over-budget
  as a finding class of its own.
- **Never let the deep target's generator emit what the front stage would
  reject**; route through the front stage as a normaliser.

## When not to use it

- **A single-stage system.** One target, one oracle; the ordering has nothing
  to order.
- **Stages that cannot fail independently** - a pipeline whose middle stage is
  total and cannot crash on any front-stage output has no masking to remove,
  and the middle target is dead weight.
- **When the deep stage has a model oracle cheap enough to run end to end.**
  Then the end-to-end target is the strong one, and the stage targets are
  its drains rather than the other way round.
