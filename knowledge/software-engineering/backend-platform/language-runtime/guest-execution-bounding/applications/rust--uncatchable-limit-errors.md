---
layer: application
type: application
subject: guest-execution-bounding
technique: uncatchable-limit-errors
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Uncatchable runtime limits in the Boa engine

Boa (`boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
`rust-version = "1.91.0"` at `Cargo.toml:30`) is an embeddable JavaScript engine whose
VM carries a `RuntimeLimits` object, raises a limit breach as an engine-class error that
`catch` cannot see, and - after a v0.22 fix - counts native re-entries in the recursion
depth. This document cites the limits object, the catchability predicate, the unwind,
and the re-entry accounting, and records one place where the tree and its own docs
disagree about a default.

## The limits object and its defaults (`core/engine/src/vm/runtime_limits.rs:1-27`)

`RuntimeLimits` holds four fields - `stack_size`, `loop_iteration`, `backtrace_limit`,
`recursion` - and `Default` sets them at lines 20-25: `loop_iteration: u64::MAX`
(unlimited, with `disable_loop_iteration_limit` at line 53 spelling the sentinel as a
named operation), `recursion: 512`, `backtrace_limit: 50`, `stack_size: 1024 * 10`.

**Structural fact - the docs and the tree disagree on the stack default.**
`docs/vm.md:318-321` says "By default we allow 512 levels of recursion, a stack size of
1024, and practically unlimited loop iterations." The tree says 10,240 slots. The
handoff's scouts flagged this and the tree is the design; the doc is the naive reading.
It is also the concrete case of the golden path's derivation rule: `1024 * 10` is
written as a product, but nothing beside it says ten *of what* - the number is not
derived from the recursion limit times a frame width, and an embedder tuning one has
no stated relation to the other.

The guest can read and set every limit through `$boa.limits` when the CLI's debug
object is enabled (`docs/boa_object.md:278-345`); the accessors exist only behind that
flag.

## Catchability is a class predicate (`core/engine/src/error/mod.rs:304-317, 818-822, 850-854`)

`RuntimeLimitError` is a three-variant enum - `LoopIteration`, `Recursion`,
`StackSize` - at lines 306-317, each with its own message. It converts into
`EngineError` and then into `JsError` (lines 850-854), which is the only path that
constructs one; `JsError`'s internal `Repr` is `Native` (a guest-visible error object)
or `Engine`. The predicate at lines 818-822 is exactly the technique's rule:

```rust
pub(crate) const fn is_catchable(&self) -> bool {
    self.as_engine().is_none()
}
```

No message matching; class alone. The enum survives to the host as a typed value the
tests branch on (`TestAction::assert_runtime_limit_error(..., RuntimeLimitError::Recursion)`).

## The unwind skips handlers and stops at the early-exit frame (`core/engine/src/vm/mod.rs:803-837`)

`handle_error` captures the backtrace first (lines 804-813, with the comment that
errors caught by internal handlers such as async module evaluation must still carry
positions), then tests `!err.is_catchable()` at line 817. On an uncatchable error it
loops (lines 818-832): break if the current frame has `exit_early()`, otherwise record
the frame's `env_fp`, pop the frame, and continue; then truncate `environments` to the
recorded depth and truncate the value stack to the last popped frame
(`truncate_to_frame`), and return `ControlFlow::Break(CompletionRecord::Throw(err))` to
the native caller. The handler search (`find_handler`) never runs. `EXIT_EARLY` is bit
zero of `CallFrameFlags` (`core/engine/src/vm/call_frame/mod.rs:26`).

The flag is set by the native entry points: `JsObject::call` in
`core/engine/src/object/operations.rs:451-461` pushes the calling convention, resolves
`__call__`, then sets `exit_early` on the frame the call pushed (lines 452-455, handling
the case where the callee pushed no frame) before entering `context.run()` at line 458
and popping the frame at 461. `construct` does the same at lines 507-517.

## Native re-entry is counted in the depth - the undercount fix (`core/engine/src/vm/mod.rs:90-95, 1017-1033`)

**Structural fact.** `Vm` carries `host_call_depth: usize` (line 95), documented at
lines 90-94 as "number of nested host calls that re-enter the VM via `Context::run()`",
incremented by `JsObject::call` and `construct`. `check_runtime_limits` at lines
1017-1033 computes

```rust
let recursion_depth = (self.vm.frames.len() - 1).saturating_add(self.vm.host_call_depth);
```

with the comment that `host_call_depth` accounts for accessor calls and that 1 is
subtracted for the dummy frame at index 0, then compares against `recursion_limit()`
and, separately, `stack.stack.len()` against `stack_size_limit()`. The increment and
saturating decrement bracket `context.run()` at `operations.rs:457-459` (call) and
`513-515` (construct). This is the fix `CHANGELOG.md:88` records as "vm: avoid stack
overflow on recursive accessor calls" (PR 4699): before it, the depth was
`frames.len() - 1` alone, and a getter that read its own property overflowed the
process stack at a guest-frame count well under 512.

The check runs at all four call boundaries: guest call and construct
(`core/engine/src/builtins/function/mod.rs:991, 1108`) and native call and construct
(`core/engine/src/native_function/mod.rs:339, 403`); the native site's comment at
lines 337-338 says outright that the check is kept although native functions push no
frame, because the native stack and the VM stack will eventually be combined.

The regression tests are the technique's recommended ones: `core/engine/src/vm/tests.rs:558-575`
(`recursion_in_async_gen_throws_uncatchable_error`, a thenable whose `then` getter
reads itself, limit 128) and `578-595` (`recursion_in_setter_throws_uncatchable_error`,
a setter that assigns its own property), both asserting `RuntimeLimitError::Recursion`
rather than a crash. `recursion_runtime_limit` at lines 407-434 covers the direct case.

## Deviation recorded

`check_runtime_limits` compares `recursion_limit() <= recursion_depth` and
`stack_size_limit() <= stack.len()` *before* the frame is pushed, as the technique
asks; but the stack-slot check compares the current length, not the length after the
push, so a call whose prologue, arguments and register file together exceed the
remaining headroom is admitted and the overflow is caught one call later. The
recursion side is exact; the slot side is late by one frame's width.
