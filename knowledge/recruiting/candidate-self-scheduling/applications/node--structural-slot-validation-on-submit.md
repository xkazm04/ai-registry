---
layer: application
type: application
subject: candidate-self-scheduling
technique: structural-slot-validation-on-submit
stack: node
status: forged
---

# Structural slot validation on a public token route (kp)

kp is a TypeScript/Next.js hiring app with a SQLite store. Its candidate
self-scheduling link is `POST /api/schedule/[token]` — an unauthenticated,
bearer-token endpoint that books an interview, advances a pipeline entry, sends
a candidate email and an interviewer brief, and writes a calendar event. The
whole trust boundary is collapsed into one pure module,
`app/_lib/schedule-slots.ts`, extracted from the store precisely so the
proposal side and the validation side share one derivation and cannot drift.

## The invariant is written down at the top of the file

`app/_lib/schedule-slots.ts:7` states it as a header comment, along with the
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

`offeredSlotFor` (`schedule-slots.ts:177`) is the membership test. Every clause
maps onto one in the technique:

| Clause | Code | Guards against |
| --- | --- | --- |
| parseable, bounded string | `typeof … === "string"`, length ≤ 40 | a hostile payload shape |
| in the future | `ms <= nowMs` → null | a tab left open overnight |
| within the window | `ms > nowMs + MAX_SLOT_AHEAD_MS` (`:132`) | a replayed / hand-edited instant |
| business day **in the anchor zone** | `p.weekday === 0 \|\| 6` on `zonedParts(ms, tz)` | a Saturday booking |
| one of the offered times | `TIMES.find(...)` over `KP_INTERVIEW_TIMES` | 09:07 instead of 09:00 |
| exact to the instant | `ms !== zonedInstant(...)` → null | stray seconds, or the same `hh:mm` in a *different* zone |

The last clause is the one most implementations omit, and the comment at
`schedule-slots.ts:189` says why it is there: *"the slot's identity is the
instant, not just the displayed hour"*. A payload carrying 10:00 in some other
offset renders as an offered time and is still refused.

Two design choices are worth copying. The accept window is
`SLOT_HORIZON_DAYS + 1` (`:127`, `:132`) — deliberately one day wider than the
proposal horizon, so a picker loaded just before midnight stays confirmable
after the rollover; validation is structural rather than *"is this in the list
`proposeSlots` would return right now"*, which would be a moving target. And
`nowMs` and `tz` are injectable parameters, which is what makes the trust
boundary unit-testable without a clock or a database
(`app/_lib/schedule-slots.test.ts`).

## The label is re-derived, not validated

`slotLabel` (`schedule-slots.ts:137`) is the single minting point, called by
`proposeSlots` and by `offeredSlotFor` alike. The route takes
`const slot = offered.label` (`app/api/schedule/[token]/route.ts:294-297`) and
`body.slot` is read into the body type and then never used — the client's string
is discarded rather than sanitized. That stored label is what flows into
`dispatchInterviewConfirmation`, `dispatchInterviewerBrief` and the recruiter
activity feed, which is exactly why it must be server-authored.

kp then splits *stored fact* from *rendered form* correctly: the English label
is the canonical stored value, and `app/_lib/use-slot-label.ts` re-formats the
ISO instant in the candidate's active locale at display time, degrading to the
stored label when the ISO is unparsable. The record keeps one canonical
sentence; the reader gets their own.

## State first, slot second

The route resolves the invitation before it looks at the payload. The
dead-capability gate at `route.ts:189` refuses every mutation with `410 Gone`
when `isScheduleInviteExpired(invite)` (derived from the row's age, not a stored
flag — `schedule-slots.ts:51`) or the status is terminal. This is the
technique's "state checks run first" rule, and it is *duplicated* on the GET
(`route.ts:75-87`) so the page renders a terminal card rather than a picker that
cannot book.

Failure copy is uniform, as the technique requires: `"That time isn't one of the
offered slots — please pick from the list."` (`route.ts:296`) for every clause
of the conjunction. Which invariant failed is never enumerated.

## Membership is not availability

`offeredSlotFor` proves the slot was *offerable*; it says nothing about the
interviewer's calendar since the page loaded. `route.ts:311` re-checks with
`slotStillFree` at the moment of booking, and only a definite `false` refuses —
an unknown answer books, because an outage must not block a candidate. That
refusal returns `409` with the same shape as a kp-side collision, so the picker
refreshes and re-offers instead of accusing the candidate of an invalid
submission. The three-valued free/busy contract behind it belongs to the
calendar-integrity subject, not this one.

## Idempotency and the double-submit

`route.ts:262-267`: a confirmed invite hit again *without* a reschedule intent
echoes the existing booking rather than creating a second one. The RSVP branch
is handled deliberately **before** this echo (`route.ts:239`) so a legitimate
RSVP is not swallowed by it. On the reschedule path the same idea appears in the
store — re-picking the current `slot_at` returns the invite unchanged
(`app/_lib/schedule-store.ts:519-521`).

## Deviations from the standard

- The **recruiter path books through the same validator** in one place
  (`app/api/schedule/route.ts:277`, `offeredSlotFor` on a `reschedule` action),
  which is stricter than the technique needs but harmless; elsewhere the trusted
  path correctly uses the wider `dateSlotToIso`/`gridSlotToIso` resolvers.
- Business-day exclusion is **weekends only**. There is no holiday calendar, so
  an offered slot can land on a public holiday in the anchor zone; the standard
  asks for holidays too.
