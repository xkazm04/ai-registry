---
layer: application
type: application
subject: candidate-self-scheduling
technique: withdraw-is-not-cancel
stack: react
status: forged
verified_on: 2026-09-28
verified_against: react@19
---

# Three endings on one candidate page (kp)

Re-read at kp `20d0a8db3` on 2026-09-28. The first reading (2026-08-20) cited
lines that have all moved. The ordering and the three endings are unchanged.
The withdrawal deviations all still hold, and the zone deviation is half closed.

kp's candidate scheduling surface is `app/schedule/[token]/`, a server page
that renders one client component and nothing else. That component,
`SchedulePicker.tsx`, is unusually small for what it does, because it was
deliberately reduced to a single responsibility, stated in its own docblock
(`SchedulePicker.tsx:15-23`): *"this component owns ONLY the order in which the
states win — that ordering is the logic"*. The docblock now adds *"An ACTION
error rides ABOVE whichever of those won, never instead of it."*

## The ordering, as code

`SchedulePicker.tsx:70-129`, in source order:

1. `s.error` with no invite → an alert, nothing else rendered (`:70-77`). An
   error on a loaded invite is now a banner above the winning state (`:79-83`),
   so a failed action no longer hides the booking it failed against.
2. `s.closedReason` → `<DeadLinkCard />` (`:86-88`), **before** the booking branch;
3. `s.confirmed && !s.rescheduling` → `<BookedCard />` (`:90-110`);
4. otherwise → `<SlotPicker />` (`:112-129`).

Step 2 preceding step 3 is the technique's "a dead link beats a booking" rule
compiled. A withdrawn or expired invitation that still carries a `slot_at`
renders the terminal card, never a confirmed time nobody will attend. Step 3
preceding step 4 is "a booking beats the picker": the picker only re-appears
when the candidate explicitly opts in via `startReschedule`, which flips
`s.rescheduling`. A picker never sits over a live booking by default.

The server enforces the same ordering independently rather than trusting the
client to. `GET /api/schedule/[token]` returns `closed: true` with an empty slot
list first (`[token]/route.ts:98-110`), and `POST` refuses every mutation with
`SCHEDULE_LINK_CLOSED` (410) on the same predicate (`:219-221`). The React
ordering is a rendering decision layered on a server decision, not the only
copy of it.

Expiry is derived at read time, not stored. `isScheduleInviteExpired`
(`app/_lib/schedule-slots.ts:67-79`) is a pure function of the row and the TTL
(`INVITE_LINK_TTL_DAYS = 7`, `:45`), and only a still-`pending` invite can
expire (`:71`). The anchor is `created_at`, or the cancel-reopen stamp when the
candidate freed a booked slot (`:74-77`). There is no sweep job, no `expired`
column, and therefore no window in which a cron outage leaves a dead link live
or marks a live link dead.

## Three endings, kept apart

kp models the endings the technique separates, and the candidate surface offers
two of them on the booked card:

| Act | Control | Server | Result |
| --- | --- | --- | --- |
| "I can't make this time" | RSVP cancel button (`BookedCard.tsx:153-160`) | `cancelAttendance` (`schedule-store.ts:638`) | slot freed, invite returns to `pending`, `attendance_status = 'cancelled'`, **picker comes back** |
| "I can't do this round" | withdraw link (`BookedCard.tsx:163-172`) | `declineScheduleInvite` (`schedule-store.ts:661`) | terminal `declined`, slot freed, reminders reset, calendar event removed (`[token]/route.ts:236`), link can never book again |
| company/recruiter ending | not on this surface | `no_show`, or a recruiter action | recorded separately, sealed with a recruiter actor |

The two are visually and semantically distinct: a primary/secondary button pair
for the RSVP, and a small underlined text button for the exit. The client
treats them as different mutations. `withdraw()` (`use-schedule-invite.ts:264-285`)
posts `{ withdraw: true }` (`:272`) and then latches
`setClosedReason("declined")` (`:279`), so the surface flips to the terminal
card without a refetch. The store's docblock draws the same line explicitly
(`schedule-store.ts:652-653`): a decline is *"distinct from cancelAttendance,
which frees the slot but returns the invite to 'pending' for re-booking"*.

The pipeline consequence is right in both directions, and both comments say so:
a cancelled time *"means "find another", not "reject""* (`schedule-store.ts:637`),
and a withdrawal *"is surfaced, not silently regressed (the recruiter decides)"*
(`:660`). Neither writes a rejection onto the candidate's entry.
`declineScheduleInvite` accepts `status IN ('pending','confirmed')` (`:669`), so
a candidate can withdraw before ever booking: a candidate-side ending, not a
cancelled event.

## The exit is placed before the alternative

`BookedCard.tsx` renders, in order: the confirmed slot, join / add-to-calendar /
"different time" with the remaining-changes count (`:131-133`), the RSVP row,
the withdraw button (`:163-172`), and then, only when `capReached`, the proposal
form (`:174-177`). The escape hatch being the *last* thing on a card whose exit
sits above it is the one ordering the technique would invert. A candidate who
cannot make any time meets the exit before they meet the alternative. On the
unbooked path the placement is correct: `SlotPicker.tsx:86-102` renders the
escalation as the empty state's primary content when the server sets `noSlots`
(`:101`).

The terminal card is honest about *which* ending happened. `DeadLinkCard.tsx`
branches on `closedReason === "expired"` (`:12`) for its own copy and shares a
generic "no longer active" card for the state-machine closes. Its help line
(`messages/en.json:2124`) still reads *"please reply to your latest email from
the hiring team"*. For a withdrawn candidate who wants back in, that email is
the only door.

## The record behind the surface

The same honesty rule runs past the terminal states.
`scheduledSealOutcome(advanced)` (`app/_lib/schedule-slots.ts:572`) derives a
sealed decision's fields from whether the linked pipeline entry actually
advanced: a clean `interview_scheduled` when it did, and
`interview_scheduled_unconfirmed` with *"(Booking stands, but the pipeline stage
did not advance — reconcile required.)"* when it did not. The comment above it
(`:560-566`) names the bug it fixed: the seal used to assert a clean outcome
unconditionally, producing a tamper-evident record of a pipeline state that was
never reached. A booking that did not advance now says so.

## Deviations from the standard

- **Withdrawal is one-way.** Still true. `declineScheduleInvite` is terminal by
  design (`schedule-store.ts:651-660`), and neither route has an un-withdraw. A
  recruiter can only re-invite a closed invitation, which mints a new token
  (`canReinvite`, `scheduleInviteLifecycleBuckets.ts:62-63`). The technique now
  adds that an undo re-opens the round rather than the released slot, which
  kp's re-invite already does, but from the recruiter's side only.
- **No reason is captured.** Still true. The client posts a bare
  `{ withdraw: true }` (`use-schedule-invite.ts:272`), the server type is
  `withdraw?: boolean` (`[token]/route.ts:200`), and `declineScheduleInvite(token)`
  takes nothing else (`:229`). The candidate's own words for why never reach the
  record.
- **No confirmation step.** Still true. `onClick={onWithdraw}`
  (`BookedCard.tsx:168`) posts straight away, a heavy consequence for a mis-tap
  next to the RSVP buttons.
- **The interviewer's zone is named on one surface of three.** Half closed
  since 2026-08-20. The propose form now says *"Working hours are 08:00-18:00 in
  the interview timezone ({zone})."* (`ProposeSection.tsx:50-52`,
  `messages/en.json:2127`), fed by `interviewTz` (`[token]/route.ts:174`). It
  names the zone as a raw IANA identifier. The picker (`SlotPicker.tsx:105-106`)
  and the booked card (`BookedCard.tsx:101-102`) still say only *"All times
  shown in your timezone ({zone})."* (`en.json:2108`). `schedule-slots.ts:101`
  still lists the dual-zone picker as a follow-up. The recruiter's week grid
  names the interview zone (132e99cfa). The mirror the anchoring technique now
  asks for, the candidate's local hour on the interviewer's view, is not built.
