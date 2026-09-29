---
layer: application
type: application
subject: analytics-time-windows
technique: calendar-arithmetic
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A monthly slot that was persisted after it clamped: the 31st never comes back

Ascent at `b3335c35` (Next 16 on Node 24.x) implements "monthly" as a calendar
step with day-of-month clamping, and does it well for one step. The other
application of this technique in this folder records that step. This one
records what happens when the result of a clamped step is stored and becomes the
input of the next.

## The step is correct, the chain is not

`nextScanFor` (`src/lib/db/org-watch.ts:33-47`) moves the day to the 1st, adds a
month, then sets the day to `min(day, daysInMonth)`. One step from 31 January
gives 28 February, and the unit test for the clamp asserts exactly that
(`src/lib/db/org-watch.test.ts:167-171`).

`nextSlotFrom` (`src/lib/db/org-watch.ts:77-88`) settles a repo after a scan. It
takes the persisted intended slot (`Repository.scanSlotAt`) as its anchor and
steps one cadence from it. Every settle then writes the result back as the new
`scanSlotAt` (`src/lib/db/org-watch.ts:199` and `:235`). The stored slot is the
clamped date. The day-of-month the repo was given, 31, is no longer stored
anywhere, so the next step starts from 28 and never reaches 31 again.

## Measured

The two functions copied verbatim into a scratch file, with a settle one hour
after each slot, starting from an anchor of 2026-01-31T00:00Z. Twelve settles:

```
2026-02-28
2026-03-28  != anchored 2026-03-31
2026-04-28  != anchored 2026-04-30
...
2027-01-28  != anchored 2027-01-31
slots off the anchored day: 11 of 12
```

Anchored on the original day (the same anchor plus k months, clamped each
time), 12 of 12 land on the last day of the month. Stepped from the previous
slot, 1 of 12 does. The repo does not miss a scan, and the period between scans
is a calendar month each time. What is lost is the day: a repo the user put on
the 31st ends up on the 28th and stays there, which is the walk backwards the
comment above `nextScanFor` (`src/lib/db/org-watch.ts:22-27`) describes for a
flat 30-day step. It arrives by a different road.

## Why the tests did not see it

`org-watch.test.ts:716-724` is titled "weekly keeps its WEEKDAY, monthly its
day-of-month, across repeated late settles". The weekly half loops eight times.
The monthly half makes one call and asserts the clamped 28 February. The title
promises a chain and the assertion checks a step, so the case that fails is the
case the title names.

## What the technique gains

The rule that a boundary is the anchor plus k units, not the previous boundary
plus one, was already in the technique as a clause about clamping. This tree
shows the clause needs a companion for *stored* schedules: the intended
day-of-month is data, and a column that holds only the clamped date has thrown
it away. Two repairs are open, and neither was applied in this run. Store the
intended day beside the slot (a schema change), or keep the original anchor and
compute slot k from it. The second needs a count of settles or a scan from the
anchor, which the existing catch-up loop already does for missed slots.

## Deviation

`nextScanFor` steps in universal time, which the tree declares, so the 00:00
problem for zones that skip midnight does not arise here.
