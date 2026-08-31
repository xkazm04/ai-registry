---
layer: application
type: application
subject: agent-memory
technique: consolidation
stack: sql
verified_on: 2026-08-31
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The read-back nobody ran (SQLite knowledge store)

A desktop agent-orchestration app keeps a workspace knowledge store: 1,306 belief
rows, with a separate evidence table binding a belief to the files it came from.
The evidence table carries `refs` (a JSON array of source paths), `quote` (the
material the belief was drawn from) and — already, in the shipped schema —
`verified_at`.

That last column is the amendment's whole subject. The store was built with a
place to record that a citation had been read back. Nothing has ever written to
it.

## What was measured

Both arms run over the same population: the 103 evidence rows carrying a quote,
of which 74 have at least one `refs` entry that resolves to a file present in the
tree today.

- **Arm A — referential integrity**, which is what the pipeline performs: does
  the cited source exist? **74 of 74 pass.** Every reference resolves.
- **Arm B — the read-back**, which is what the amendment prescribes: does the
  quoted material actually occur in the cited file? Normalize whitespace, take
  the quote's literal spans, substring-match against the file. **14 pass, 60
  fail.**

So the check the store already has a column for separates 60 rows that the check
it actually runs cannot distinguish from the other 14. Referential integrity
passed all 74 of them.

## What the failing 60 are, stated honestly

They are **unconfirmable against the current source**, which is not the same as
fabricated. The 60 collapse two populations this measurement cannot separate:

- a quote that paraphrases or reformats rather than reproducing, and
- a quote that was accurate when recorded and has since drifted, because the
  cited file changed and nothing re-checked it.

Both are exactly what a read-back catches and both are invisible to a resolve
check, which is the amendment's claim. Neither is an accusation about any
particular row. A store that ran the check on write would have distinguished
them at the moment the distinction was cheap; running it now, after drift, can
only report the union.

That is itself the finding: **the read-back is a write-time instrument.** Its
value decays, and a store that defers it converts a checkable claim into an
unresolvable one at no visible moment.

## The structural fact, which nobody designed

The reachability half of the same amendment shows up in the adjacent tables and
is starker. The store holds **693 memory nodes and 14 edges** — 20 nodes, 2.9%,
participate in any relation at all, so 673 are reachable from exactly one place.
And the partition barely partitions: of 29 contexts, one holds 555 of the 693.

Nobody chose that. It fell out of writing nodes with a `context_id` and adding
the edge table later, which is the ordinary way a store acquires a single-home
assignment. The consequence is the one the amendment names — an item relevant in
a second place cannot be found from it, and improving the item's title cannot
help, because a title is only read once the reader is already in the right
neighbourhood.

## What this realization cannot do

The verification arm here is a substring match, so it is sound when it passes and
merely suggestive when it fails; a semantically faithful paraphrase scores as a
failure. A store adopting this should bind the quote **by value at write time** —
store the exact span, not a rendering of it — which converts the check from a
fuzzy match into a set lookup and removes this application's own ambiguity. The
measurement also cannot see rows whose `refs` point outside the tree: 209 refs
were recorded and 103 resolved, and what the other 106 point at was not
established.
