---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: per-cycle-read-budget
status: forged
laws: [limits-are-derived, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [a first poll of a busy source fans out into hundreds of detail reads at once, a polled replica shares a rate limit with people using the same account, deciding what a detail read left for the next cycle shows meanwhile]
---

# Per-cycle read budget

The detail reads of a polling cycle scale with the source, not with the
cycle: one list read returns two hundred items, and each item wants a diff and
a status. In steady state the [finality-keyed memo](./finality-keyed-memo.md)
absorbs most of them. On the first cycle, after a restart, or when a burst of
new items arrives, it absorbs none, and an unbounded cycle spends a shared rate
limit in seconds — often the same per-account or per-address limit the people
using the platform depend on.

The technique gives each unit of a cycle a **budget of detail reads**. Reads
past the budget are not made this cycle; the fields they would have filled are
unknown, with an issue that says how many were deferred, and the next cycle
spends its own budget on them.

## Procedure

1. **Derive the budget.** Start from the source's rate limit, divide by the
   cycle interval and by the number of units polled per cycle, and leave
   headroom for the list reads and for the humans sharing the limit. Cross
   check it against the steady-state demand — the items a typical interval
   adds — so that a normal day settles in one or two cycles. Write the
   derivation beside the constant
   ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
2. **Charge only real reads.** A memo hit costs nothing; a read that the
   budget permits is charged before it is sent, whether it succeeds or
   fails. Denied reads are counted.
3. **Render a deferred read as unknown.** The field is null with an issue —
   *N reads left for the next poll, at most B a poll; shown as unknown* —
   never zero, never the default state, never silently the last value with
   no age ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
   If the last read value is kept instead, it is shown with its age, which
   is a different and also honest choice; pick one per field and keep it.
4. **Report the count with its predicate.** The issue names what was
   deferred and the budget it was deferred under, so an operator can tell
   *the budget is too small* from *the source is in a burst*
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
   Keep the count out of the issue's identity if a change log diffs issues
   between cycles, or every change of count reads as a new problem.
5. **Rotate, or bound the re-readers.** Non-final facts are re-read every
   cycle and spend budget before new items are reached. If the items are
   always visited in the same order, a set of long-running items at the
   head of the list can starve the rest indefinitely. Either visit the
   oldest-deferred first, or reserve part of the budget for items never read.

## Decision rules

- **The budget is per unit, not per cycle,** so one busy unit cannot spend
  the reads of the quiet ones; a global cap on top is a second limit, not a
  replacement.
- **List reads are outside the budget,** because the unit cannot be written
  without them; the budget governs the optional facts that the
  [read phase](./read-phase-before-write-transaction.md) may leave unknown.
- **A list cut by its own limit is a deferral too.** When a list read
  returns exactly its page limit, the cycle cannot tell whether more
  exists; it records that as an issue, the same way it records deferred
  detail reads.

## When not to use

A source with no rate limit worth respecting and a small, fixed slice needs no
budget; the memo alone keeps it cheap. The budget earns its constant where a
first cycle's fan-out could exhaust a limit other parties share.
