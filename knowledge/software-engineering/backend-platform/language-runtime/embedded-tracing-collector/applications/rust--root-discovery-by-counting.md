---
layer: application
type: application
subject: embedded-tracing-collector
technique: root-discovery-by-counting
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Root discovery by counting, in the Boa engine's `boa_gc` crate

Boa (github:boa-dev/boa, commit `665f03924a54e5162be227e7e909612e36f6e35a`,
workspace version 0.22.0 at `Cargo.toml:29`; the stack witness is
`Cargo.toml:30`, `rust-version = "1.91.0"`) ships its collector as the
`boa_gc` crate under `core/gc/`. The collector keeps no root registry. Every
`Gc<T>` handle maintains a total count in the cell's header, and the
collector computes the internal count in a pre-pass at the start of every
collection.

## The header, and the word the mark bit shares

`core/gc/src/internals/gc_header.rs:15-18` defines `GcHeader` as two
`Cell<u32>` fields, `ref_count` and `non_root_count`. The comment at lines
10-11 states the split exactly as the technique does: `ref_count` is the
number of `Gc` instances, `non_root_count` the number of those instances in
the heap. The constants at lines 3-5 show the packing - `MARK_MASK` is the top
bit of `non_root_count`, `NON_ROOTS_MASK` is the remaining 31 bits, and
`NON_ROOTS_MAX` equals the mask. `is_marked` (line 72) and `mark`/`unmark`
(lines 113-122) read and write the top bit; `non_root_count()` (line 35)
masks it out. `is_rooted` at lines 108-110 is the whole inference:
`self.non_root_count() < self.ref_count()`, with a doc note that the result is
valid only after the non-roots pass has run.

## Saturation at the total, and the panic on the total

`inc_non_root_count` at lines 40-63 increments only while
`non_root_count < ref_count`; at equality it does nothing, and a
`debug_assert_eq!` at lines 56-61 fires if the count is ever found *above*
the total, which the comment says is reachable only through direct field
writes in unsafe code or tests. The comment at lines 43-47 gives the
motivation in the technique's own terms: `non_root_count` must not exceed
`ref_count`, because that would make `is_rooted()` return false on a live
object, "which would cause a UAF".

`inc_ref_count` at lines 76-96 is the other rule. The count is computed with
`wrapping_add(1)` and then checked: `if count == 0 || count > NON_ROOTS_MAX`,
a cold, never-inlined `overflow_panic()` fires with the message "too many
references to a gc allocation". The structural fact is in the second half of
the condition. The total is a full `u32`, but its ceiling is `NON_ROOTS_MAX`
- `2^31 - 1`, the 31-bit internal counter's maximum - and the comment at
lines 87-89 says why: a `ref_count` above that value could never be matched
by saturation, `is_rooted()` would be "always true, leaking memory", so it is
treated "as a hard error identically to `u32` wrap". The ceiling on one
counter is derived from the width of the other, and the derivation is written
beside the constant. Line 90 notes the check runs before the write so the
count stays clean under `catch_unwind`.

The unit tests at lines 165-198 exercise both rules: `inc_ref_panics` sets
`ref_count` to `NON_ROOTS_MAX` and expects the panic;
`saturation_at_higher_ref_count` increments the internal count four times
against a total of three and asserts it reads three and unrooted.

## The pass, and where the counts are reset

`Collector::trace_non_roots` at `core/gc/src/lib.rs:280-298` is the pre-pass:
for every strong cell it fetches `trace_non_roots_fn` from the cell's vtable
and calls it, and for every ephemeron it calls `trace_non_roots` directly.
`collect` at lines 225-228 calls it first, before `mark_heap`. The
per-handle increment is `Gc::trace_non_roots` at
`core/gc/src/pointers/gc.rs:337-339`, which calls `inc_non_root_count` on its
target. `mark_heap` at lines 314-327 then enqueues every cell for which
`is_rooted()` holds and drains the tracer queue after each.

The reset happens in `sweep`, lines 453-460 and 477-485: a marked cell is
unmarked and has `reset_non_root_count()` called, and stays; an unmarked cell
is dropped through its vtable. No reset runs between the first mark and the
remark (lines 232-245), which is the reuse the technique describes.

## History: counting replaced runtime rooting

`CHANGELOG.md:1104`, under the 0.18.0 release (2024-03-04), records "Find
roots when running GC rather than runtime" (#3109) - the move from a rooted
bit flipped at every store to the collection-time count. `CHANGELOG.md:196`,
under v0.22.0 (2026-08-27), records "implement better way to handle root
overload in `inc_non_root_count`" (#4936) - the saturation-at-total rule and
its debug assertion, which is why the header's comment block reads as an
incident post-mortem. Both are the technique's own argument, dated.

## Where the tree diverges from the technique

The technique's rule that every way of holding a cell without a handle is
spelled unsafe holds: `GcBox` and its raw pointer are `pub(crate)`
(`core/gc/src/internals/gc_box.rs:8-12`), and the only public route in is
`Gc<T>`. No deviation was found in this technique's territory.
