---
layer: application
type: application
subject: candidate-self-scheduling
technique: withdraw-is-not-cancel
stack: react
status: forged
verified_on: 2026-08-20
---

# Three endings on one candidate page (kp)

kp's candidate scheduling surface is `app/schedule/[token]/` — a server page
that renders one client component and nothing else. That component,
`SchedulePicker.tsx`, is unusually small for what it does, because it was
deliberately reduced to a single responsibility, stated in its own docblock
(`SchedulePicker.tsx:10-17`): *"this component owns ONLY the order in which the
states win — that ordering is the logic"*.

## The ordering, as code

`SchedulePicker.tsx:34-78`, in source order:

1. `s.error` → an alert, nothing else rendered;
2. `!s.invite` → loading copy;
3. `s.closedReason` → `<DeadLinkCard />` — **before** the booking branch;
4. `s.confirmed && !s.rescheduling` → `<BookedCard />`;
5. otherwise → `<SlotPicker />`.

Step 3 preceding step 4 is the technique's "a dead link beats a booking" rule
compiled. A withdrawn or expired invitation that still carries a `slot_at`
renders the terminal card, never a confirmed time nobody will attend. Step 4
preceding step 5 is "a booking beats the picker": the picker only re-appears
when the candidate explicitly opts in via `startReschedule`, which flips
`s.rescheduling` — a picker never sits over a live booking by default.

The server enforces the same ordering independently rather than trusting the
client to. `GET /api/schedule/[token]` returns `closed: true` with an empty slot
list first (`route.ts:75-87`), and `POST` refuses every mutation with `410 Gone`
on the same predicate (`route.ts:189-191`). The React ordering is a rendering
decision layered on a server decision, not the only copy of it.

Expiry is derived at read time, not stored: `isScheduleInviteExpired`
(`app/_lib/schedule-slots.ts:51`) is a pure function of the row's `created_at`
and the TTL (`INVITE_LINK_TTL_DAYS = 7`, `:43`), and only a still-`pending`
invite can expire. There is no sweep job, no `expired` column, and therefore no
window in which a cron outage leaves a dead link live or marks a live link dead.

## Three endings, kept apart

kp models the endings the technique separates, and the candidate surface offers
two of them side by side on the booked card:

| Act | Control | Server | Result |
| --- | --- | --- | --- |
| "I can't make this time" | RSVP cancel button (`BookedCard.tsx:144-151`) | `cancelAttendance` (`schedule-store.ts:567`) | slot freed, invite returns to `pending`, `attendance_status = 'cancelled'`, **picker comes back** |
| "I can't do this round" | withdraw link (`BookedCard.tsx:156-163`) | `declineScheduleInvite` (`schedule-store.ts:590`) | terminal `declined`, slot freed, reminders reset, link can never book again |
| company/recruiter ending | not on this surface | `no_show`, or a recruiter action | recorded separately |

The two are visually and semantically distinct — a primary/secondary button pair
for the RSVP, and a small underlined text link for the exit — and the client
treats them as different mutations: `withdraw()`
(`use-schedule-invite.ts:238-259`) posts `{ withdraw: true }` and then latches
`setClosedReason("declined")`, so the surface flips to the terminal card without
a refetch. The store's docblock draws the same line explicitly: a decline is
*"distinct from cancelAttendance, which frees the slot but returns the invite to
'pending' for re-booking"*.

The pipeline consequence is right in both directions, and both comments say so:
a cancelled time *"means 'find another', not 'reject'"*
(`schedule-store.ts:566`), and a withdrawal *"is surfaced, not silently
regressed (the recruiter decides)"* (`:589`). Neither writes a rejection
onto the candidate's entry. `declineScheduleInvite` is also reachable from a
`pending` invite as well as a `confirmed` one, so a candidate can withdraw
before ever booking — a candidate-side ending, not a cancelled event.

## The exit is placed after the alternatives

`BookedCard.tsx` renders, in order: the confirmed slot, join / add-to-calendar /
"different time", the RSVP row, then the withdraw link, then — only when
`capReached` — the proposal form (`BookedCard.tsx:165-168`). The escape hatch
being the *last* thing on a card whose exit link sits above it is the one
ordering the technique would invert: a candidate who cannot make any time meets
the exit before they meet the alternative. On the unbooked path the placement is
correct — `SlotPicker.tsx:82-97` renders the escalation as the empty state's
primary content when the server sets `noSlots`.

The terminal card itself is honest about *which* ending happened:
`DeadLinkCard.tsx` branches on `closedReason === "expired"` for its own copy and
shares a generic "no longer active" card for the state-machine closes.

## The record behind the surface

The same honesty rule runs past the terminal states.
`scheduledSealOutcome(advanced)` (`app/_lib/schedule-slots.ts:472`) derives a
sealed decision's fields from whether the linked pipeline entry actually
advanced: a clean `interview_scheduled` when it did, and
`interview_scheduled_unconfirmed` with *"(Booking stands, but the pipeline stage
did not advance — reconcile required.)"* when it did not. The comment above it
(`:460`) names the bug it fixed — the seal used to assert a clean outcome
unconditionally, producing a tamper-evident record of a pipeline state that was
never reached. A booking that did not advance now says so.

## Deviations from the standard

- **Withdrawal is one-way.** `declineScheduleInvite` is terminal by design and
  there is no un-withdraw; the technique asks for reversibility while the round
  is still live, because "I can't make any of these this week" and "I no longer
  want this job" both reach for the same link.
- **No reason is captured.** The withdraw button posts a bare `{ withdraw: true }`
  — no optional free-text field, so the candidate's own words for why never
  reach the record.
- **No confirmation step.** The exit is a single click on a live booking
  (`BookedCard.tsx:156-163`), which is a heavy consequence for a mis-tap next to the
  RSVP buttons.
- **Only the candidate's zone is named.** `useTzLabel`
  (`use-schedule-invite.ts:34`) renders "All times in your timezone (GMT+2)" and
  `useSlotLabel` formats in the candidate's locale, but the interviewer's anchor
  zone is never shown alongside — `schedule-slots.ts:78` acknowledges this as an
  open follow-up. The dual render the anchoring technique requires is half-built.
