---
layer: application
type: application
subject: interview-calendar-integrity
technique: real-duration-conflict-window
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# One collision predicate, run inside the write transaction (kp)

The technique first said to check your own bookings against a coarse hour key and
keep the real interval for the external calendar. kp's store did something
weaker than either until 2026-09-22, and the repair is the evidence for the
corrected rule.

## The gap

`confirmScheduleInvite` and `rescheduleScheduleInvite` in `app/_lib/schedule-store.ts`
refused a booking only on exact `slot_at` equality. That held while every booking
sat on the fixed `KP_INTERVIEW_TIMES` grid at one length. Two later changes ended
it: the pool now books any `HH:MM` (`dateSlotToIso`, `proposedSlotFor`) and each
invite can carry its own `duration_min`. The commit that closed the gap
(`671d424e1`) names the cases: a 14:30 booked beside a 14:00, and a 15:00 inside a
90-minute 14:00, *"on every path except the grid book, which patched it with a
pre-read outside the transaction."* That patch was an hour-bucket check, so it
caught the first case and never the second: 15:00 is a different hour.

## The predicate

`bookingCollides(candidate, existing, tz)` in `app/_lib/schedule-slots.ts` is the
one predicate. It answers true on either of two tests:

- the half-open real intervals `[start, start + length)` overlap, so back-to-back
  is not a clash;
- the two start in the same interview-zone hour (`hourBucketKey`), because the week
  grid speaks in whole hours and shows that hour as taken.

Its inputs are defended. A null length is a legacy row and reads as
`DEFAULT_INTERVIEW_MINUTES`, *"never zero, which would let anything book on top of
it"*, and a length is clamped to twelve hours so *"a corrupt 10^6 would otherwise
block a month"*. An unparsable instant never collides; the validators own that
rejection.

## Where it runs

Both store transactions are `.immediate()`. Each now reads the workspace's other
confirmed rows within `BOOKING_COLLISION_REACH_MS` (twelve hours either side, the
widest interval the clamp allows), excluding the invite's own row, and calls the
predicate before writing. The read and the write hold one lock, and better-sqlite3
is synchronous, so there is no await between them. The route's own hour-bucket
pre-read was deleted: the store's `taken` result is the single refusal, and it
surfaces as the same `409 SCHEDULE_SLOT_TAKEN`. The slot proposer takes the same
booked intervals plus the offered length, so a slot an off-grid or long booking
runs into is not offered, calendar connected or not.

The commit message records the acceptance as eleven of eleven (nine red cases and
two guards beforehand); the pinned cases are in `app/_lib/schedule-collision.test.ts`,
which this run read for its existence and did not re-run.

## What it adds to the technique

- The own-bookings check is the interval **or** the bucket. The bucket alone misses
  the panel that runs into the next hour; the interval alone misses the ten-past and
  half-past pair the grid already draws as one taken hour.
- The authority sits in the transaction. A pre-read outside it survived as a
  patch on exactly one path.
- Equality was a valid guard only under a fixed grid. Anything that lets a booking
  land off-grid or at another length makes it a hole.

Untested here: the external-calendar half. `busyQueryWindow` (in
`app/_lib/calendar/free-busy.ts`) already takes the offered length, and the test
that pins the 90-minute span is in `app/api/schedule/calendar-conflict.test.ts`;
this note did not re-run it.
