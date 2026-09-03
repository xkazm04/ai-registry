---
layer: application
type: application
subject: embedded-tracing-collector
technique: mark-finalize-remark-sweep
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Mark, finalize, remark, sweep, in the Boa engine's `boa_gc` crate

Boa (github:boa-dev/boa, commit `665f03924a54e5162be227e7e909612e36f6e35a`,
workspace version 0.22.0 at `Cargo.toml:29`; the stack witness is
`Cargo.toml:30`, `rust-version = "1.91.0"`) documents its cycle at
`core/gc/src/lib.rs:209-221`: "Mark -> Finalize -> Mark -> Sweep", with the
third step justified as "Mark again because `Finalize::finalize` can
potentially resurrect dead nodes". The same comment records the alternative
the authors considered and did not take - "Mark -> Sweep -> Finalize" for a
"more concurrent structure" - which is the ordering that cannot offer a
finalizer an intact heap.

## The four passes as written

`Collector::collect` at `lib.rs:225-278` runs `trace_non_roots` (the root
count), then `mark_heap`, asserts the tracer queue is empty, and only if the
returned `Unreachables` holds any strong or weak entries runs `finalize` and a
second `mark_heap` (lines 236-245). The comment at line 242 notes the second
mark reuses "the tracer's already allocated capacity". `sweep` follows
unconditionally (lines 248-254), and weak maps are cleared after it, with the
reason stated at line 256: "since the process dereferences GcBoxes".

The queue is `Tracer` at `core/gc/src/trace.rs:20-56`: a `VecDeque` of erased
pointers, documented as "used to trace `Gc<T>` non-recursively".
`trace_until_empty` pops, skips already-marked nodes, marks, and calls the
node's `trace_fn` through the vtable, which enqueues children rather than
descending. `Gc::trace` at `core/gc/src/pointers/gc.rs:333-335` is one line:
`tracer.enqueue(self.as_erased_pointer())`.

`finalize` at `lib.rs:422-438` runs each unreachable strong cell's
`run_finalizer_fn` and each unreachable ephemeron's `finalize_and_clear`. The
vtable that makes this possible over a list of headers is
`core/gc/src/internals/vtable.rs:5-59`: four function pointers (`trace_fn`,
`trace_non_roots_fn`, `run_finalizer_fn`, `drop_fn`) plus the cell's
`TypeId` and its size, built once per type as a `'static` constant.

## The sweep guard, and the structural fact

`lib.rs:44` declares the thread-local `GC_DROPPING`; `DropGuard` at lines
97-114 sets it on construction and clears it on drop; `sweep` (line 451) and
`dump` (line 510) each hold one. `finalizer_safe()` at lines 116-121 returns
the negation. The comment at lines 95-96 promises: "During this phase,
attempts to dereference a `Gc<T>` pointer will trigger a panic."

The tree does not keep that promise in release builds. `Gc::inner_ptr` at
`core/gc/src/pointers/gc.rs:307-312`, which every dereference goes through
(`deref` at lines 359-365 calls `inner()` which calls it), guards with
`debug_assert!(finalizer_safe())`. The ephemeron handle, by contrast, guards
with a release-mode `assert!(finalizer_safe())` at
`core/gc/src/pointers/ephemeron.rs:97`. Two handle types, one flag, two
strengths of guard - and the documented one is the weaker. This is the
deviation the technique's release-mode rule exists for: the comment describes
the debug build, and a traced type whose drop dereferences a `Gc` in a
release build reads freed memory instead of panicking.

The polarity of the flag is as the technique states. The derive's generated
`Drop` at `core/macros/src/lib.rs:412-423` runs `Finalize::finalize` only `if
::boa_gc::finalizer_safe()` - that is, only *outside* a sweep. `Gc::drop` at
`gc.rs:367-373` does the same, and `Gc::finalize` at lines 320-328 is where
the decrement lives, so a handle dropped during a sweep leaves its target's
count untouched, with the comment "We don't call inner_ptr() to avoid
overhead of calling finalizer_safe()".

## Two more places the tree falls short of the technique

**No finalize-once flag.** `GcHeader` (`core/gc/src/internals/gc_header.rs:15-18`)
carries only `ref_count` and `non_root_count`; `GcBox`
(`core/gc/src/internals/gc_box.rs:8-12`) adds a vtable and the value. Nothing
records that a cell has been finalized, so a cell that a finalizer
resurrected and that later becomes unreachable again is finalized a second
time. The technique's once-across-all-cycles rule stands; the tree does not
implement it.

**Bookkeeping shrink that is `shrink_to_fit` in disguise.** `collect` ends at
`lib.rs:275-277` with `gc.strongs.shrink_to(gc.strongs.len() >> 2)` and the
same for `weaks` and `weak_maps`. `Vec::shrink_to` never reduces capacity
below the current length, so the `len() >> 2` argument is dead: the effect is
identical to `shrink_to_fit()`. The intent - keep a quarter of the length as
headroom, or shrink to a quarter - cannot be recovered from the call, and a
reader who takes the argument at face value believes the collector keeps
headroom it does not keep. The shrink itself is the technique's rule; the
argument is a fact the tree could not have set out to prove.
