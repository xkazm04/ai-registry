---
layer: application
type: application
subject: batch-undo-commit-window
technique: bounded-fanout-commit
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# An unbounded settle-all in a desktop review queue

The manual-review queue of a Tauri desktop app resolves a selected cohort
with one write per row, each an IPC call into a single embedded database
file. Before the change the handler built `Promise.allSettled(ids.map(write))`:
the width of the fan-out was the length of the selection.

## What was wrong, and what was not

The reporting half was already right. An earlier pass had replaced a
discarded `allSettled` with a counted partial-failure notice, so the
"every slot is filled" and "no rejection escapes" rules held by accident of
`allSettled`. Two rules did not:

- **Unbounded width.** A 200-row verdict started 200 writes before the first
  resolved. The store serialises writers, so the burst bought no speed and
  queued behind itself.
- **A vanished row counted as success.** An id no longer present in the live
  map resolved to an empty promise and was tallied as written, which is the
  empty-success the technique forbids. It is now not attempted.

## The change

A four-lane pool over a shared cursor, drawing from a snapshot taken at the
click. The app already owned a bounded-pool primitive, so the new helper is a
dozen lines around it. That primitive is fail-fast, so the helper catches
inside each lane and records `{failed, reason}` in the slot with the input's
index; the caller then counts failures from the outcome array.

## Measured

Same 200-row batch, same fake write with a 1 ms delay, in-flight counter:

| | peak in flight | rows written | failures reported |
| --- | --- | --- | --- |
| before (settle-all) | 200 | 200 | per-row, reason discarded |
| after (4-lane pool) | 4 | 200 | per-row, reason kept in its slot |

With two injected failures in ten rows the outcome array has ten slots, the
two failed slots carry their reasons, and the other eight lanes' writes all
land. Type check clean; the repository's golden-path census dropped one
unbounded-fan-out match, which is the gate agreeing.

Not measured: wall-clock against the real database. The pool width is a
conservative default, not a tuned number.
