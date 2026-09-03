---
layer: technique
type: technique
subject: guest-execution-bounding
technique: instruction-budget-for-fuzzing
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a fuzzer feeding the interpreter cannot tell a non-terminating input from a slow one, a generated program must halt deterministically without a wall-clock timeout, deciding whether a termination counter belongs in the production dispatch loop, an evaluation that takes far longer than its instruction count predicts]
---

# Instruction budget for fuzzing

## The concern

A fuzzer that executes generated programs will generate one that never halts. Without
help, the harness sees a process that has not returned and must decide, on a clock,
whether that is a loop or a slow input; it decides wrong on a slow machine, records a
timeout, and the timeout is filed as a flake. The technique gives the interpreter a
hard **instruction budget** - a count that decrements on every dispatch and, at zero,
raises an uncatchable failure - so that a non-terminating program terminates at a
known instruction with a named outcome, and the clock is freed to mean something else.

The boundary with the fuzz-portfolio technique
[stage-ordered-fuzz-targets](../../../../engineering-process/build-and-release/test-input-generation/techniques/stage-ordered-fuzz-targets.md)
is that it owns *where* the budget sits in a pipeline's set of targets - on the deepest
stage, as the oracle that turns non-termination into a finding - and this technique
owns how the interpreter implements the counter so that the finding is deterministic
and uncatchable.

## Count instructions, not cost, and count them down to a stop

The budget is a plain count of dispatched instructions, not a cost-weighted budget.
The yield budget weights instructions because it approximates time; the termination
budget does not, because its consumer wants a number that is easy to reason about -
"this program ran sixty-five thousand instructions" - and a weighted count has no such
reading. The check sits at the very top of dispatch, before the instruction executes:
if the remaining count is zero, raise; otherwise decrement and proceed. Raising before
executing means the instruction at which the budget expired never ran, so the state the
harness inspects is a state the program actually reached.

The failure is engine-class and uncatchable, for the same reason every ceiling's
failure is: a generated program can contain a handler around its infinite loop, and a
catchable budget failure would be caught and the loop resumed with the budget already
at zero - which, depending on the order of check and decrement, either raises on every
subsequent instruction forever or wraps. Uncatchable, the failure unwinds to the
harness, which records "budget exhausted" as the result of that input. That result is a
legitimate outcome of the target, distinct from a crash and distinct from success
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)); a
harness that maps it to "passed" has told itself that every infinite loop is fine.

## The budget is a build-time feature, not a production setting

The counter is a compare and a decrement on every instruction of every evaluation, and
production evaluations do not want it. The technique gates it behind a **build-time
feature**, so that the production binary carries no counter and no branch, and the
fuzzing binary carries both. The default when the feature is on is a budget of zero,
which raises on the first instruction - an intentional loud default: a fuzz target that
forgot to set a budget finds out immediately, rather than running one input forever.
A middle-stage target that only compiles can set the budget to zero on purpose and
never execute, which is the same setting read the other way.

This is the one ceiling in the subject that is *not* a runtime limit in the limits
object, and the distinction is deliberate: the limits object's ceilings are for the
embedder and cost nothing when unset; the instruction budget is for the harness and
costs something on every instruction, so it is compiled out rather than defaulted off.

## Time over budget is a defect signal, not a timeout

With the instruction count fixed, wall time is bounded by construction - some number
of instructions at some cost each - and the harness can state, beside the target, how
long that budget should take: a fraction of a second, on any machine it runs on. An
input that takes materially longer than that has found something: an instruction whose
cost is not what its weight says, a native routine that is quadratic in the argument,
a pathological path through the collector. That is a finding about the interpreter and
it is recorded as one. The naive harness suppresses it as a slow test, and the
quadratic native routine ships. The gate reads the measured time against the predicted
time for the budget, not against a fixed timeout that means the same thing on every
input ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Decision rules

- Give the deepest fuzz target an instruction budget; check at the top of dispatch
  before executing; raise an uncatchable engine-class failure at zero.
- Count instructions, not cost, so the number has a plain reading.
- Gate the counter behind a build-time feature; the production binary carries no
  branch for it.
- Default the budget to zero under the feature, so a target that forgot to set one
  fails on its first instruction rather than running forever.
- Treat budget exhaustion as a result class of the target, never as a pass and never
  as a crash.
- Record the expected wall time for the budget beside the target, and treat time well
  over it as a finding about the interpreter.

## When not to use it

A production embedder wanting a hard stop wants the runtime limits - recursion, slots,
iterations - which cost nothing until breached, or a yield budget with a host-side
deadline; the instruction budget's per-instruction branch is the wrong price for a
production loop. An interpreter that already exposes an instruction-count hook to the
host as a supported feature, at a cost it has measured and accepted, can use that hook
here instead of a second counter - the technique is about the property, not about a
second mechanism.
