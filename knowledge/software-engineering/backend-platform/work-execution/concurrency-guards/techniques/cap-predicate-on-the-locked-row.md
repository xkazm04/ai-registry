---
layer: technique
type: technique
subject: concurrency-guards
technique: cap-predicate-on-the-locked-row
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [one statement locks a parent row and counts child rows to enforce a cap, a cap held in tests and went over in production, a capped insert written as a common table expression, choosing between a counter column and a count over a child table, a blocked caller is assumed to see what the winner committed]
---

# Cap predicate on the locked row

A guarded insert can read as atomic and still let a cap through. The usual shape is one
statement: lock the parent row, count the child rows, insert if under the cap. Callers do
queue on the lock, so a reviewer watches the second caller wait its turn and concludes it
will count the winner's row. It will not.

Under read-committed isolation, on the relational store this was measured on (the
application names it), a statement's snapshot is fixed when the
statement starts. When a blocked update unblocks, the database re-evaluates its condition
against the new version of the row it was waiting for. Everything else the statement reads,
including a subquery in that same condition, still answers from the original snapshot. The
vendor's documentation states this outright: the command sees concurrent changes to the rows
it is updating and not to other rows. Other engines were not tested. Check yours before
applying the rule to them.

So the waiter counts the table as it stood before the winner committed, and both insert. The
statement was one statement, and that is what the word "atomic" hides. A firmer lock changes
nothing, because the snapshot is the defect and the lock never was.

## The fix, and why it works

Move the counted quantity onto the row the statement locks, and put the comparison in that
update's own condition. A loser matches zero rows, and zero rows is the refusal. Keep the old
count as an auditor that reads the same fact a second way, not as the enforcer.

Forced interleave, 25 runs each, at read committed, starting one under a cap
of three. Every run confirmed that the waiter really blocked.

| Form | Over cap |
|---|---|
| lock in a leading clause, count in the insert's condition | 25 of 25 |
| real update in place of the lock, same count | 25 of 25 |
| count as a subquery in the update's own condition | 25 of 25 |
| counter on the locked row, compared in the update's condition | 0 of 25 |
| counter bumped unconditionally, cap on the insert half | 0 of 25, counter runs away |
| lock as its own statement, count in a later statement | 0 of 25 |

## Boundaries

- **The rule is about one statement, not about all counting.** The last row holds because a
  later statement takes a later snapshot. Where the cap has several rules or a computed
  window and cannot fold into one column, take the lock as its own first statement and count
  afterwards. A read of "may reference only the locked row's columns" as a universal law
  throws away the form that serves multi-rule caps. What the rule forbids is reading another
  table in the statement that waited.
- **Put the cap on the update, not on the insert half.** A cap on the insert half keeps the
  row count right and passes ordinary concurrency tests, while the refused callers still bump
  the counter, so the remaining budget shrinks with every refusal. Only a test comparing
  counter to rows sees this.
- **A constraint is better where it can express the cap.** A unique or exclusion constraint
  avoids the snapshot altogether. It cannot hold a number read from configuration at run time.
- **Prove the interleave, not the outcome.** A concurrency test that does not confirm the
  waiter blocked proves a race that did not happen. Confirm it from the database's own view
  of who is waiting, and run a sequential control beside it.
- **A counter is a second copy of a fact.** It needs a reader that checks it against the rows,
  and it needs every writer of the child table to go through the statement that bumps it.
