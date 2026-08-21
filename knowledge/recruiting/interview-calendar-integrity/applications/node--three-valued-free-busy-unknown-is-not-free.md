---
layer: application
type: application
subject: interview-calendar-integrity
technique: three-valued-free-busy-unknown-is-not-free
stack: node
status: forged
---

# Three-valued free/busy in a Next.js scheduling API (kp)

kp is a TypeScript/Next.js hiring app with a SQLite store. It added a Google
Calendar free/busy check to its self-scheduling flow in W1.4, and the whole
integration is built around the third value.

## The three-valued edge

`app/_lib/calendar/free-busy.ts` is pure overlap maths (`isSlotFree`,
`filterFreeSlots`, `busyQueryWindow`, busy-span merging).
`app/_lib/calendar/google-calendar.ts` is the network edge.
`app/_lib/calendar/available-slots.ts` joins them.

The contract lives at the edge: **`fetchBusy` returns `null` for "we do not
know" and `[]` for "checked, nothing in the way"**. The README states plainly
why they are never conflated — *"treating an outage as an empty calendar would
confidently offer busy times"* (`docs/features/scheduling/README.md:50`). The two
values are structurally different types, so no caller can accidentally treat one
as the other; `[]` flows into `filterFreeSlots` and removes nothing, while `null`
short-circuits to the unfiltered list.

## The degraded output is the pre-integration output

`proposeFreeSlots` composes `proposeSlots` (kp's own booked slots, business days,
`KP_INTERVIEW_TIMES` evaluated in `KP_INTERVIEW_TZ` — see
`app/_lib/schedule-slots.ts`) and then *filters* it by the calendar answer. When
the answer is `null`, the filter is skipped and the caller gets exactly the list
kp proposed before the integration existed. The README makes this an explicit
product commitment: *"Scheduling worked without Google and must keep working when
Google is down, the grant is revoked, or nobody ever connected an account."*

Confirmed end to end by the keyless path: without `GOOGLE_OAUTH_CLIENT_ID` /
`GOOGLE_OAUTH_CLIENT_SECRET`, every offer reports `not_connected` and the
pre-integration slot list is served unchanged.

## Three statuses, one of which is a claim

`CALENDAR_STATUSES` (`free-busy.ts:37`) is the canonical list:

| Status | Source | Claims a check? |
| --- | --- | --- |
| `checked` | `fetchBusy` returned an array | yes — the only one |
| `not_connected` | `isCalendarConnected` false | no |
| `unavailable` | `fetchBusy` returned `null` while connected | no |

The two non-checked states are kept apart even though both produce an unfiltered
grid, exactly as the technique requires: `not_connected` is a steady-state fact
the recruiter can fix, `unavailable` is an incident (outage, revoked grant,
per-calendar error).

The convenience boolean is **derived, not stored**: `calendarChecked` is exactly
`status === "checked"` — one truth, no drift.

## The catalog guard

`app/_lib/calendar/calendar-status-i18n.test.ts` enforces set-equality between
`CALENDAR_STATUSES` and the recruiter copy catalog under
`scheduleTab.lifecycle.calendarStatus.*` in all four locales, and does the same
for `CALENDAR_EVENT_STATES` against `scheduleTab.lifecycle.calendarEvent.*`. A
new status cannot be added without copy that explains it — the mechanical
enforcement the technique asks for.

## Scope narrowness as the disclosure boundary

The OAuth scopes granted at consent time are deliberately `calendar.freebusy` and
`calendar.events` only. The README's summary is the technique's strongest form:
*"kp can learn **that** someone is busy, never **why**."* The disclosure boundary
is enforced by never having fetched the data, not by remembering not to render a
field.

## Confirm-time re-check on the same axis

`slotStillFree` (`available-slots.ts:95`) returns `Promise<boolean | null>` —
three-valued by construction. `null` covers both the unplaceable-instant case
(line 101, delegated to `offeredSlotFor`) and the lookup-failed case (line 103),
and both MUST proceed to booking. `app/api/schedule/calendar-conflict.test.ts`
pins the 90-minute span, the confirm-time refusal, both unknown paths, and a null
`durationMin`.

## Coverage of the standard

Confirmed: the null/empty distinction, the pre-integration fallback, three
statuses with only one claiming, the derived boolean, the catalog set-equality
guard, narrow scopes, and the three-valued confirm-time re-check that never
blocks. No deviation found on this technique — this integration is where the
standard's spine was hardened.
