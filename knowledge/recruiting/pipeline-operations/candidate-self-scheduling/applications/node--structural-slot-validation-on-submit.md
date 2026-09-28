---
layer: application
type: application
subject: candidate-self-scheduling
technique: structural-slot-validation-on-submit
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
---

# Structural slot validation on a public token route (kp)

Re-read at kp `20d0a8db3` on 2026-09-28. The first reading (2026-08-20) cited
lines that have all moved. The conjunction itself is unchanged. Refusals now
answer with codes, and the label is no longer what a candidate reads.

kp is a TypeScript/Next.js hiring app with a SQLite store. Its candidate
self-scheduling link is `POST /api/schedule/[token]`, an unauthenticated,
bearer-token endpoint. It books an interview, advances a pipeline entry, sends
a candidate email and an interviewer brief, and writes a calendar event. The
whole trust boundary is collapsed into one pure module,
`app/_lib/schedule-slots.ts`, extracted from the store so the proposal side and
the validation side share one derivation and cannot drift.

## The invariant is written down at the top of the file

`app/_lib/schedule-slots.ts:7-12` states it as a header comment, along with the
incident that produced it:

> a candidate-submitted booking is only ever persisted as a slot the server
> itself would have offered. The POST handler used to trust `body.slot` (display
> label) and `body.slotAt` (ISO) verbatim — letting a token holder book an
> out-of-hours/weekend/past time, and inject arbitrary text as the label, which
> is stored and rendered into confirmation and reminder EMAILS and the recruiter
> activity feed.

Both halves of the technique are in that sentence: the timestamp was a range
problem, and the label was a publishing channel. The fix is one function.

## The conjunction, clause by clause

`offeredSlotFor` (`schedule-slots.ts:221`) is the membership test. Every clause
maps onto one in the technique:

| Clause | Code | Guards against |
| --- | --- | --- |
| parseable, bounded string | `typeof … === "string"`, length ≤ 40 (`:222`) | a hostile payload shape |
| in the future | `ms <= nowMs` → null (`:225`) | a tab left open overnight |
| within the window | `ms > nowMs + MAX_SLOT_AHEAD_MS` (`:155`) | a replayed / hand-edited instant |
| business day **in the anchor zone** | `if (p.weekday === 0 \|\| p.weekday === 6) return null; // weekend in the interview zone` (`:227`) | a Saturday booking |
| one of the offered times | `TIMES.find(...)` over `KP_INTERVIEW_TIMES` (`:228`, `TIMES` at `:90`) | 09:07 instead of 09:00 |
| exact to the instant | `ms !== zonedInstant(...)` → null (`:237`) | stray seconds, or the same `hh:mm` in a *different* zone |

The last clause is the one most implementations omit, and the comment at
`schedule-slots.ts:236` says why it is there: *"the slot's identity is the
instant, not just the displayed hour"*. A payload carrying 10:00 in some other
offset renders as an offered time and is still refused.

Two design choices are worth copying. The accept window is
`(SLOT_HORIZON_DAYS + 1) * 86_400_000` (`:155`, with `SLOT_HORIZON_DAYS = 21` at
`:150`). It is deliberately one day wider than the proposal horizon, so a picker
loaded just before midnight stays confirmable after the rollover. Validation is
structural rather than *"is this in the list `proposeSlots` would return right
now"*, which would be a moving target. And `nowMs` and `tz` are injectable
parameters, which is what makes the trust boundary unit-testable without a
clock or a database (`app/_lib/schedule-slots.test.ts`).

## The label is re-derived, and no longer what a candidate reads

`slotLabel` (`schedule-slots.ts:169`) is the single minting point, called by
`proposeSlots` (`:209`) and by `offeredSlotFor` (`:238`) alike. The route takes
`const slot = offered.label` (`app/api/schedule/[token]/route.ts:342-346`). The
comment above it says *"the client's body.slot is ignored entirely"* (`:340`),
and `slot?` is still in the body type (`:193`) and never read. The client's
string is discarded rather than sanitized.

The label's role has narrowed since the first reading, in the direction the
server-authored-labels technique asks for. The docblock (`:161-168`) now calls
it *"DELIBERATELY ENGLISH, and deliberately no longer what a candidate reads"*.
It records the incident: a Czech candidate in Prague was told "Tue 9 Jun ·
10:00" in a Czech email, in a zone the letter never named. Letters now format
`slot_at` in the candidate's captured zone through
`comms-dispatch.formatSlotForLetter`. The route passes `slotAtIso` and
`candidateTz` to `dispatchInterviewConfirmation` (`[token]/route.ts:414-428`),
and the English label is only the fallback there. The label still reaches the
approval event (`:391`) and the interviewer brief (`:449`). The stored label is
now an operator-side audit column. The fact is the instant, and every
candidate-facing sentence is composed from it at send time.

`app/_lib/use-slot-label.ts` re-formats the ISO instant in the candidate's
active locale at display time and now appends the browser's zone
(`zone ? \`${label} · ${zone}\` : label`, `:56`), degrading to the stored label
when the ISO is unparsable (`:46-48`).

## State first, slot second

The route resolves the invitation before it looks at the payload. The
dead-capability gate refuses every mutation with `SCHEDULE_LINK_CLOSED` (410,
`[token]/route.ts:219-221`) when `isScheduleInviteExpired(invite)` holds or the
status is terminal. Expiry is derived from the row, not a stored flag
(`schedule-slots.ts:67-79`). Its anchor is now `created_at`, or the
cancel-reopen stamp when a candidate freed a booked slot, so a re-opened link
ages on its own clock instead of arriving already dead. This is the
technique's "state checks run first" rule, and it is *duplicated* on the GET
(`[token]/route.ts:98-110`) so the page renders a terminal card rather than a
picker that cannot book.

Failure copy is uniform, as the technique requires. Every clause of the
conjunction answers `SCHEDULE_SLOT_NOT_OFFERED` (400, `[token]/route.ts:344`),
whose English text is *"That time isn't one of the offered slots. Please pick
from the list."* (`messages/en.json:1722`). Which invariant failed is never
enumerated, and since the move to codes the client renders the message in the
candidate's language.

## Membership is not availability

`offeredSlotFor` proves the slot was *offerable*; it says nothing about the
interviewer's calendar since the page loaded. The route re-checks with
`slotStillFree` at the moment of booking (`[token]/route.ts:359-362`), and only a
definite `false` refuses. An unknown answer books, because an outage must not
block a candidate. That refusal answers `SCHEDULE_SLOT_TAKEN` (409), the same
code as a kp-side collision (`:499`, `:527`), so the picker refreshes and
re-offers instead of accusing the candidate of an invalid submission. The
three-valued free/busy contract behind it belongs to the calendar-integrity
subject, not this one.

## Idempotency and the double-submit

`[token]/route.ts:313-315`: a confirmed invite hit again *without* a reschedule
intent echoes the existing booking rather than creating a second one. The RSVP
branch is handled deliberately **before** this echo (`:291`) so a legitimate
RSVP is not swallowed by it. The echo still does not compare the requested slot
with the booked one. The store's re-confirm behind it (09dc4afd9) is now
idempotent only for the same `slot_at` (`schedule-store.ts:451-453`). On the
reschedule path the same idea appears in the store: re-picking the current
`slot_at` returns the invite unchanged (`schedule-store.ts:584`).

## Deviations from the standard

- The **recruiter path books through the same validator** in one place
  (`app/api/schedule/route.ts:352`, `offeredSlotFor` on a `reschedule` action).
  That is stricter than the technique needs, but harmless. Elsewhere the
  trusted path correctly uses the wider resolvers (`dateSlotToIso` /
  `gridSlotToIso`, `:206`, `:208`, and `proposedSlotFor` for an accepted
  proposal, `:400`).
- Business-day exclusion is **weekends only**. There is no holiday calendar, so
  an offered slot can land on a public holiday in the anchor zone; the standard
  asks for holidays too. The weekend test is repeated in five places
  (`schedule-slots.ts:203`, `:227`, `:281`, `:328`, `:468`). A holiday rule would
  have to reach all five, which is the drift the one-generator rule warns about.
- **Daylight saving is assumed away, and tested for the case that exists.**
  `zonedInstant` (`:134-135`) is *"accurate except inside the ~1h DST
  gap/overlap; the offered times (10:00/14:00) never sit in a transition"*. Two
  tests pin the offered grid across the Europe/Prague transitions of 2027
  (`schedule-slots.test.ts:405`, `:427`). The assumption holds for the grid and
  for the proposal hours (08:00-18:00), because both lie outside the European
  transition hour. It is an assumption about the configured zone's transition
  hour, and nothing in the code checks it.
