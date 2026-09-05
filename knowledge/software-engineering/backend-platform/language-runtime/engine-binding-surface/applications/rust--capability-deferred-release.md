---
layer: application
type: application
subject: engine-binding-surface
technique: capability-deferred-release
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.91.0
applied: code
ab_verdict: better
proof: ab-paired
---

# A destructor that always runs and is never allowed to act

The Rust bindings to a production JavaScript engine, read at commit
`49f5ab4d`. The version witness is the repository's own `rust-toolchain.toml`,
which pins `channel = "1.91.0"`; the crate declares `edition = "2024"`. Not a
guess and not a dispatch's assumption — the toolchain file is what the tree
builds against.

## The collision, exactly

A persistent handle (`Global<T>` in `src/handle.rs`) owns a cell in the
engine's heap and must reset it when dropped. The type is declared
`unsafe impl<T> Send for Global<T>` and `unsafe impl<T> Sync for Global<T>`
(`src/handle.rs:422-423`), which is the whole reason it is useful: a handle can
be stored in a structure another thread owns, moved into a task, parked in
thread-local storage. Resetting the cell, however, may only happen on the
thread that owns the isolate, or under the isolate's `Locker`.

So all three preconditions of the technique hold at once. The value travels
legally, the destructor cannot demand the capability — `Drop::drop` takes
`&mut self` and nothing else — and performing the reset without the capability
writes into a heap another thread is concurrently collecting.

Every one of `release-guarantees`' five exit paths works perfectly here. The
drop fires on early return, on panic, on cancellation. That is the point: the
release is not missing, it is *misplaced*, and the tree is the clearest
available demonstration that those are different defects.

## What the tree does

`IsolateLiveness` (`src/isolate.rs:2365-2380`) carries the queue beside the
isolate's own liveness record rather than on the handle:

```
deferred_global_resets: Mutex<Option<Vec<DeferredGlobalReset>>>,
deferred_len: std::sync::atomic::AtomicUsize,
```

The three questions the technique says a deferral scheme owes are all answered
in the tree, and the field comments answer them in the tree's own words:

- **Who drains last.** `close_deferred_global_resets` (`src/isolate.rs:2539`)
  replaces the `Some(vec)` with `None` — the queue is not emptied, it is
  *closed* — inside the same lock that performs the final drain. The `Option`
  is the closed state, so a late arrival observes a distinguishable value
  rather than appending to a vector nobody will read. It is called from exactly
  two places, and they are the two teardown paths: annex disposal
  (`src/isolate.rs:1172`) and `Locker` teardown (`src/locker.rs:197`).
- **What a late arrival does.** The `None` branch is the deliberate leak: the
  isolate is gone and the cell does not exist. The doc comment on the field
  says `None` after teardown's final drain, which is the site saying so.
- **How the drain is proven.** Three tests, each named for the checkpoint it
  exercises: `global_off_thread_drop_is_drained_on_home_thread`
  (`tests/test_api.rs:16116`),
  `shared_isolate_deferred_global_resets_drain_at_lock_boundaries` (`:15135`),
  and `shared_isolate_deferred_global_resets_race_with_teardown` (`:15188`).
  The first drops the only strong handle on another thread and asserts the cell
  is queued rather than reset, then reaches the home thread and asserts it
  drained.

The checkpoints are the structural ones the technique predicts: `Locker`
acquire and release (`src/locker.rs:250, 291, 332, 346`), and `Global`
creation and home-thread drop (`src/handle.rs:348, 444`).

## The empty-case optimisation, and what it is allowed to decide

`maybe_drain_deferred_global_resets` (`src/isolate.rs:2513`) reads
`deferred_len` with `Ordering::Relaxed` and takes the mutex only when it is
non-zero. The field's own comment states the reason — a drain checkpoint
should be a relaxed load in the common empty case rather than a mutex
acquisition — and the checkpoints are on the handle clone/drop path, so this is
not a micro-optimisation but the difference between a lock per handle
operation and none.

The technique's constraint that the hint may never decide a *final* drain is
respected structurally rather than by comment: `drain_deferred_global_resets`
and `close_deferred_global_resets` both take the lock unconditionally, and only
`maybe_drain_*` consults the counter. A relaxed load that lagged would delay a
drain to the next checkpoint; it can never cause teardown to skip one.

## What this realization cannot do

It proves the mechanism is *expressible and testable*, not that it is cheap. No
arm here measures the retention cost the technique names — the interval during
which dropped handles hold engine cells because no checkpoint has arrived — and
the tree exports no counter for queue depth, so a workload that drops many
handles off-thread and rarely locks would present as a slow leak with nothing
to point at. `deferred_len` is exactly the number that would answer it and it
is private.

Nor does the tree settle the ordering cost. Deferred resets run on a different
thread, later, in queue order, and this engine's handle resets have no
observable finalizer semantics — so the tree cannot show whether a runtime
whose releases *do* have observable effects can use this pattern at all. That
boundary is stated in the technique from reasoning, not from this tree.

The source-tree read above is `structural-only` on its own terms: it is
somebody else's repository, and the effect is a recovery path reached only by a
thread that is forbidden to act. The paired arms below come from a second tree.

## The paired proof, from a consuming tree

The technique was applied to a managed service that renders pages in a headless
browser, at the seam its own comment already named as a gap. The tree **refuted
the reading that selected it**, and that is why the row is worth more than a
confirmation: the project had already reasoned about this family. Its render
guard does the capability-free half unconditionally — aborting the render's
tasks, which needs no runtime — before consulting `tokio::runtime::Handle::
try_current()` for the half that does, and it states the failure modes in a
comment rather than hiding them. A sibling guard over a subprocess degrades to
a synchronous blocking kill when no runtime is present.

What neither had was the third answer. The render guard's no-runtime arm was a
warning and an abandoned tab, backstopped only by a periodic relaunch. The
technique's move — record the debt, settle it where the capability provably
exists — had a checkpoint waiting: the engine's `acquire`, which is `async` and
therefore has a runtime by construction, and through which every subsequent
render passes.

**Arm A** (the tree as it stood): a render guard dropped on a plain thread with
no runtime entered reports no close, ever. **Arm B** (the queue named): the same
drop reports no close either — the debt is owed, not performed — and then
reports exactly one the moment a checkpoint runs.

The measurable is closes observed after a runtime-less drop: **0 of 1 against
1 of 1**. The instrument is the crate's own recording harness, and both arms sit
in one test so arm A is a built-in known-negative — the harness is shown to
*distinguish*, not merely to pass. Thirty-two tests green against a baseline of
thirty-one; the lint gate clean.

**Verdict: better**, and the residue is nameable rather than a shrug. A runtime
that is *shutting down* still takes the successful `try_current` arm, so the
spawn succeeds and the task may never be polled. Closing that case needs the
drain reachable from a teardown path the consuming engine does not have, which
is a smaller and much more specific piece of work than the one this row did.
