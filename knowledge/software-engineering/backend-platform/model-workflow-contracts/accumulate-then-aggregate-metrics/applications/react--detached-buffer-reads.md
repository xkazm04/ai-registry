---
layer: application
type: application
subject: accumulate-then-aggregate-metrics
technique: detached-buffer-reads
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19.2
applied: code
ab_verdict: better
proof: ab-paired
---

# Detached buffer reads: the IPC timing ring in Personas

Personas (xkazm04/personas, public, read at master `b7bbe8c35d`; `react ^19.2.6` and
`typescript ^6.0.3` in `package.json` are the witness for `verified_against`) records
the duration of every desktop IPC call in a 500-row ring buffer and derives the
observability panel's per-command percentiles, slowest-call table and global summary
from it. It is the first long-lived metric accumulator found in the fleet. An earlier
pass over two other projects found only pure aggregation functions over a snapshot, with
no buffer to protect.

## What the tree did before

The read door was already half built. `getIpcRecords()` (`src/lib/ipcMetrics.ts:63`)
returns `ring.slice()`, or the two slices of a wrapped ring, so no caller ever held the
ring array itself. Every aggregate reads through that door: `computeCommandStats` and
`getGlobalSummary` sort a mapped copy of the durations, never the rows, and
`getSlowestCalls` copies a second time before its sort (`:122`). The array was safe.
The technique's "when not to use it" rule held as well. No aggregate reads the storage
directly.

The rows were not safe. A row is an object, and copying an array of objects copies the
references, so every row the panel was handed was the ring's own row. The append side
leaked the same way: `recordIpcCall` stored the caller's input object as the row.

## The paired proof

One test file, `src/lib/__tests__/ipcMetrics.detachedReads.test.ts`, run against the
module before and after the change. Each probe makes one write and checks whether the
next reader sees it:

| Probe | Arm A (array copy) | Arm B (frozen private row) |
| --- | --- | --- |
| write `durationMs` on a row from `getIpcRecords()`, then re-read and re-summarise | reached the ring: p99 moved | refused |
| write `ok` on the row `getSlowestCalls(1)` returned | reached the ring | refused |
| caller changes its own input object after `recordIpcCall` | reached the ring | caller's copy only |

**Target:** writes from outside the accumulator that reach the ring went from 3/3 to 0/3.
**Floor:** the `src/lib` unit suites, the devlog IPC suite and the observability
component suites (170 tests) stayed green, and `tsc --noEmit` stayed clean. The
pre-push typecheck and census gates passed on the commit.

The first run of arm A showed the technique's own failure case without being asked to.
Probe one's write raised a row to a million milliseconds, and probe two's
`getSlowestCalls(1)` then returned that row instead of the one probe two had just
recorded. Two readers of one metric disagreed, and the disagreement depended on the
order in which they ran.

## The change

`recordIpcCall` (`:44`) now stores `Object.freeze({ ...input })` (`:49`). The spread
detaches the row from the caller's object, which is the append door. The freeze makes
every later copy of the array a copy of values, which is the read door. The cost is one
shallow copy per IPC call, over a row of five scalar fields.

## What this realization shows about the standard

**A container clone is not a value clone when the rows are references.** The technique
was written where a read returns a tensor, and cloning a tensor copies its values. In a
stack whose rows are objects, the obvious clone copies the container and still shares
every row. A tree can therefore pass a review against the rule as worded ("every read
returns a clone") and still hand out its storage. Personas did exactly that. There are
two ways to close the gap. Freeze the rows at append, as here, which works when a row
is a flat record. Or copy each row at read, which works when a row holds a nested
structure that a freeze would cover only one level deep.

A second accumulator in the same tree has the same shape and was left alone.
`getTimingRecord` (`src/lib/execution/pipeline.ts:472`) returns `[...stages]` over stage
rows that the pipeline itself still writes as stages close. Its one reader, the timing
middleware, reads the rows once and then clears the record. That reader is exempt for
the reason the technique gives: it provably never writes, which stays true only until
the next edit.

## What it cannot do

`Object.freeze` is shallow, and the refusal is only loud in strict-mode code. ES
modules are strict, so a write from any module in this tree throws. A write from a
sloppy-mode script would fail silently but still would not reach the ring. A row that
someday holds an array or a nested object needs per-row copying at read, because a
freeze would protect only the top level.
