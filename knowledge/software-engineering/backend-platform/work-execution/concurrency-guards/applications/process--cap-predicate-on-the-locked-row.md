---
layer: application
type: application
subject: concurrency-guards
technique: cap-predicate-on-the-locked-row
stack: process
status: forged
verified_on: 2026-11-06
counterpart: external
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Process: a capped enqueue that read as atomic, re-measured on our own schema

A coding-agent service capped the number of plan revisions per run. Its first version locked
the run row in a leading clause and counted child rows in the insert's condition, with a
comment saying a blocked caller would count the winner's row. Its architecture record
measured the statement over cap every time under a forced interleave, measured a firmer lock
over cap too, and moved the count to a counter column on the run row, compared inside the
update's condition. It states the rule as: such a predicate may reference only columns of the
row the statement locks.

That record's numbers were read and not trusted. The probe below was written from scratch on
a two-table schema of our own, without any of the source's code.

## The run

PostgreSQL 17.6, a binary already on the machine, a data directory in scratch, local
connections only, read committed. Cap 3, starting at 2 rows. One holder runs the statement in
a transaction and waits 0.6 s before committing. A waiter starts 0.2 s in, and a third session
confirms from the activity view that the waiter is on a lock. 25 runs per form, plus one
sequential control per form.

Target: rows above the cap. Floor: the sequential control reaches exactly the cap.

| Form | Over cap | Waiter blocked | Rows/counter at end | Sequential control rows |
|---|---|---|---|---|
| lock clause, count in insert condition | 25/25 | 25/25 | 4 / - | 3 |
| real update, count in insert condition | 25/25 | 25/25 | 4 / - | 3 |
| count subquery in the update's condition | 25/25 | 25/25 | 4 / - | 3 |
| counter compared in the update's condition | 0/25 | 25/25 | 3 / 3 | 3 |
| counter bumped always, cap on insert half | 0/25 | 25/25 | 3 / 4 | 3 |
| advisory lock, then count in a later statement | 0/25 | 25/25 | 3 / - | 3 |

Rows one, two, four and five repeat the source's measurements, and row three confirms a warning it
states without one. **The last row limits them.**
The source's sentence reads as universal, and a form it does not list holds too, because a new
statement takes a new snapshot. That form is what an existing technique in a neighbouring bundle
prescribes for multi-rule caps, so the two do not conflict. They are separated by whether the
read sits in the statement that waited.

## Reading

Target moved and floor held, on our own schema. Verdict `unmeasurable` against a project,
because no managed project has this statement shape. A capped search across the fleet's trees
turned up only documents and one check-then-insert on another store, which is a different
mechanism. Return when a project enforces a cap with a lock and a count in one statement, with
the instrument above pointed at that statement.
