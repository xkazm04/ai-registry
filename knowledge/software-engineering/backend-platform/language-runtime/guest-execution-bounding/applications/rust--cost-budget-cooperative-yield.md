---
layer: application
type: application
subject: guest-execution-bounding
technique: cost-budget-cooperative-yield
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Cost budgets, the second dispatch table, and the counted loops in Boa

Boa (`boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
`rust-version = "1.91.0"` at `Cargo.toml:30`) generates two 256-entry opcode dispatch
tables from one instruction definition so that only the async run loop pays for a
budget, and it counts loop iterations with an explicit opcode that the native
`String.prototype.repeat` also charges. This document cites the cost model, the budget
loop and the fuzz counter, and records one structural fact about who actually calls
the budgeted loop.

## A static cost per opcode (`core/engine/src/vm/opcode/mod.rs:127-132`)

The `Operation` trait every opcode implements declares `const COST: u8` beside `NAME`
and `INSTRUCTION`. Across the opcode tree the declared costs are small integers - the
distribution at this commit is 0, 1, 2, 3, 4, 5, 6, 8 and one 15 - with `Call` at 5
(`core/engine/src/vm/opcode/call/mod.rs:93`) and `IncrementLoopIteration` at 3
(`core/engine/src/vm/opcode/iteration/loop_ops.rs:30`). A weight, not a cycle count.

## Two tables from one macro (`core/engine/src/vm/opcode/mod.rs:412-457`)

The opcode macro emits `OPCODE_HANDLERS: [OpcodeHandler; 256]` at line 412 and
`OPCODE_HANDLERS_BUDGET: [OpcodeHandlerBudget; 256]` at line 422, the second typed with
an extra `&mut u32`. The budget handler generated at lines 445-457 differs from the
plain one by exactly one line at 449:

```rust
*budget = budget.saturating_sub(u32::from($Variant::COST));
```

followed by the same decode, `pc` advance and `operation` call. Adding an opcode to
the macro adds it to both tables.

## The yielding loop and the blocking loop (`core/engine/src/vm/mod.rs:953-1013`)

`run_async_with_budget(budget: u32)` (lines 953-986) indexes `OPCODE_HANDLERS_BUDGET`,
and after each instruction checks `if runtime_budget == 0 { runtime_budget = budget;
yield_now().await; }` (lines 979-982) - refill and yield, never throw. `yield_now`
(lines 1037-1055) is a one-shot future that wakes its own waker and returns `Pending`
once. `run()` (lines 988-1013) indexes `OPCODE_HANDLERS` and has no budget arithmetic
at all. The doc comment at lines 950-951 calls the unit "clock cycles" in quotation
marks.

The default budget is 256: `Script::evaluate_async` at `core/engine/src/script.rs:192-194`
delegates to `evaluate_async_with_budget(context, 256)`, whose doc at lines 199-204
states the caveat verbatim - the engine "can't determine exactly how many CPU clock
cycles a VM instruction will take", every instruction has a cost "that depends on its
individual complexity", and embedders should "benchmark with different budget sizes".

**Structural fact - the budgeted loop has one caller.** A grep for
`run_async_with_budget` across `core/engine/src` finds its definition and one call, at
`script.rs:211`. Module evaluation and promise jobs enter the VM through `run()`, the
blocking loop; the design record's framing that "module evaluation and promise jobs run
inside a host's async executor" describes where the *executor* runs them, not which
loop they dispatch through. An embedder that wants a module's evaluation to yield
does not get it from this path at this commit.

## The fuzz instruction counter (`core/engine/src/vm/mod.rs:777-801`)

`execute_one` carries, under `#[cfg(feature = "fuzz")]`, the termination counter: if
`instructions_remaining == 0`, return `EngineError::NoInstructionsRemain` as a throw -
engine-class, therefore uncatchable by the predicate the sibling application cites -
otherwise decrement and execute (lines 781-790). The check precedes execution. The
counter is a plain count, not a cost. It is set through `ContextBuilder::instructions_remaining`
(`core/engine/src/context/mod.rs:1188-1190`), and because `ContextBuilder` derives
`Default` (line 1009) the counter is zero unless set: under the feature, a target that
forgets it raises on the first instruction. The VM fuzz target sets `1 << 16`
(`tests/fuzz/fuzz_targets/vm-implied.rs:12-18`) and the bytecompiler target sets `0`
on purpose (`tests/fuzz/fuzz_targets/bytecompiler-implied.rs:14`) so it never
executes. `tests/fuzz/README.md:52-56` states the time-over-budget rule: with the
instruction count fixed, a program that takes "more than a second or so" likely
indicates an issue in the VM.

## The loop counter and its placement (`core/engine/src/bytecompiler/statement/loop.rs:135-138`)

`IncrementLoopIteration::operation` (`loop_ops.rs:13-24`) reads the limit, compares
`previous_iteration_count >= max` *before* incrementing, and stores with
`wrapping_add` on the frame's `loop_iteration_count`. The compiler emits it at six
sites - `loop.rs:138, 199, 334, 462, 500` and `core/engine/src/bytecompiler/iterator.rs:60`
(the spread-to-array loop) - and the comment at `loop.rs:135-137` states the placement
rule: after the condition check, before the body, so the limit counts body executions
including the first. The test `loop_iteration_limit_counts_body_executions`
(`core/engine/src/vm/tests.rs:351-404`) asserts, at limit 10, that `for`, `while`,
`do-while`, `for-of` and `for-in` each complete at exactly ten and each fail at
eleven with the guest's own counter reading 10.

The native loop charges the same counter: `String.prototype.repeat` at
`core/engine/src/builtins/string/mod.rs:737-739` calls
`crate::vm::opcode::IncrementLoopIteration::operation((), context)?` once per
repetition under the comment "Charge each repetition against the VM loop-iteration
limit", and `core/engine/src/builtins/string/tests.rs:107-125` asserts that
`'x'.repeat(100)` at limit 10 raises `RuntimeLimitError::LoopIteration` - the loop
failure, not a range error. `CHANGELOG.md:199` records it as a v0.22 feature.

## Deviation recorded

The budget check at `vm/mod.rs:979` runs after the instruction, and `saturating_sub`
floors at zero, so an instruction whose cost exceeds the remaining budget is executed in
full and the overshoot is forgotten rather than carried into the next budget. With
costs of at most 15 against a budget of 256 the drift is small, but a host that sets a
budget in the tens will yield later than the arithmetic predicts.
