---
layer: application
type: application
subject: transactions-over-a-replicated-log
technique: capture-index-before-snapshot
status: forged
stack: python
verified_on: 2026-10-22
verified_against: python@3.11
applied: experiment
ab_verdict: not-better
---

# A dataset mirror whose label comes from the rows it read (fleet project, Python client)

This is the technique applied outside a replicated log: a mirror client takes
a full snapshot from a paged export, then follows a change feed from a
resume stamp. There is no log index to read first, so the client derives the
stamp as the largest `updated_at` among the exported rows. The python
version floor is the one the client package declares for itself. The
question is the one the technique asks of any such label: is it a floor on
what the snapshot contains, or a ceiling?

## What was read

The tree confirms the label is derived after the read, not captured before
it. The server orders the export walk by `(updated_at DESC, key DESC)`,
the same order as its paged record listing, so the first page carries the
head of the dataset and every later write is stamped above it. The label is
therefore the head as of the walk's first page, which is what capturing it
first would have produced. The structural fact is that the safety is a
property of the walk's order, not of the client, and nothing in the
client states it.

## The experiment

Both arms ran the project's shipped client unchanged, against a fake origin
in a scratch directory outside the tree: six keys, a snapshot, then one
incremental run. Mid-walk, after two rows, one already-read key is
rewritten and one new key is added, both stamped after everything present.
The fake origin's walk order was the only variable. The floor was the
no-concurrent-write control, which must converge in every order.

| Walk order | No concurrent write | Rewrite + add mid-walk |
| --- | --- | --- |
| stamp, newest first (the tree) | converged | converged |
| stamp, oldest first | converged | converged |
| stable key | converged | **diverged: the rewritten key keeps its old value** |

Target moved: the order that does not walk by the stamp loses a write
permanently, with no error and a green run. Floor held: all three orders
converge without concurrency. Changing the client to capture the head
first would move nothing in this tree, so the verdict at this seam is
`not-better`, ship 0. The finding is the boundary, which went back to the
technique as a section on labels derived from the contents.

## What this cannot show

The fake origin stamps writes from a monotonic clock. A writer that stamps
a later revision with an earlier time, for instance a batch applied with
the origin's stamps, can land below a derived label whatever the walk order
is; that case is not exercised here. Ties on one stamp are not exercised
either. The drop-in repair (read the feed head before the first page) was
reasoned, not run.

Return condition: a second export surface ordered by something other than
the stamp, or a mirrored dataset that carries origin stamps.
