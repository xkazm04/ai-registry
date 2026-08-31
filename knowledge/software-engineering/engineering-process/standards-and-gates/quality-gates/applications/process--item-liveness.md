---
layer: application
type: application
subject: quality-gates
technique: item-liveness
stack: process
verified_on: 2026-08-31
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Two item pipelines with a collection-level clock (process, markdown ledgers)

This repository runs two long-lived item pipelines as markdown ledgers, and
they are the nearest seam to this technique in the fleet: a **graded source
queue** (`librarian/harvest/queue.md`, 177 entries, every one at status
`queued`) and a **candidate watchlist** (`librarian/watchlist.md`, 56 rows).
Both are exactly the shape the technique addresses — items admitted on a
grade, expected to be worked over months, with no scheduled exit.

## Running the technique's diagnostic, and finding its precondition missing

The technique's central practical claim is that last-touched is free
because a staged pipeline already records dated per-item activity as a side
effect of operating. Running that against these two ledgers returned the
condition rather than the number: **there is no per-item trail to derive
from.**

The queue's entire temporal surface is two header fields, `created` and
`updated`, both dated to the day the file was written. Each row carries
`id`, `pri`, `source`, `type`, `class`, `target`, a rationale sentence, an
expected `yield`, and `status` — and nothing else. The watchlist is the same
shape with a single `updated` line. An entry untouched since admission is
byte-identical to one worked yesterday, so the arithmetic the technique
recommends has no input, at any price.

This is the amendment the technique now carries. It was written assuming a
pipeline whose rows accumulate dated history; the flat status queue is the
common shape that has none, and there the diagnostic costs a schema change
rather than nothing.

## The count that carries no liveness predicate — present, and currently harmless

The queue's header reads `entries: 177`, `statuses: queued`. That number's
honest predicate is *admitted and not yet drained*, and it will be read as
*queued work in progress*
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
The two coincide today and will diverge monotonically, because the
numerator only grows and nothing removes a row.

The same holds for the corpus's other item population, the **leads banked
in source notes with return conditions**: 74 notes declare 138 leads, and a
lead's only date is the date of the note that created it. That date is
derivable — the notes are named `YYYY-MM-DD-slug.md` — which makes the
leads the one population here where the cheap diagnostic *does* work.

## Why this is `unmeasurable` and not a verdict

The effect cannot be measured on this tree, and the reason is the tree's
age rather than its design: the queue is three days old and the entire lead
population is zero to one week old. Under any staleness threshold worth
using, **zero items are stale**, so both arms return the same number and
the comparison is empty. Reporting `better` here would be reporting the
technique's premise back as its result.

What the tree does show, structurally, is that the instrument which would
detect the problem does not exist — so when the first cohort does age out,
nothing will surface it. A young queue and an abandoned queue render
identically, and they will keep rendering identically.

**The instrument that would make this measurable**, named as the technique
requires: a per-entry `touched` date on the queue row, written by whatever
moves an entry's status, or a join from the entry `id` back to the run and
applied ledgers, which already record dated events but do not carry queue
ids. Either makes last-touched derivable; neither is more than a column.

**Return condition:** re-run when the queue's oldest still-`queued` entry
passes 90 days — approximately 2026-11-26 for the founding cohort — at
which point the two arms can differ and the verdict becomes real. The lead
population reaches the same threshold earlier and is the cheaper first test,
because its dates are already derivable from the filenames.

## What this application cannot claim

It does not show that these pipelines are accumulating dead work; it shows
that they could not tell anyone if they were. That is a claim about
observability, not about health, and the distinction is the whole reason
this row is `unmeasurable` rather than a rejection of the technique.
