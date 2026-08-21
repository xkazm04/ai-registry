---
layer: application
type: application
subject: interview-calendar-integrity
technique: idempotent-event-lifecycle-with-orphan-surfacing
stack: node
status: forged
verified_on: 2026-08-20
---

# One event per interview, and the orphan it names (kp)

`app/_lib/calendar/event-sync.ts` is kp's write-back seam. Its header comment
states the three invariants the technique asks for, in order.

## The booking is the source of truth

*"Every function here is best-effort and returns a state instead of throwing. A
Google outage must never turn a confirmed interview into an error response, a
half-committed booking, or a rolled-back slot"* (`event-sync.ts:20`). The
symmetry with the read axis is explicit: *"Same contract free/busy already holds:
unknown proceeds."*

## One event, keyed by the interview

`syncInterviewEvent` (`:84`) is create-or-update on the persisted handle:

```
let result = invite.calendarEventId
  ? await updateInterviewEvent(invite.calendarEventId, input, invite.workspaceId)
  : await createInterviewEvent(input, invite.workspaceId);
```

`calendar_event_id` on `schedule_invites` is *"the provider handle that makes the
lifecycle idempotent"* (`docs/features/scheduling/README.md`). The lifecycle
table at `README.md:112` maps every transition onto exactly one verb: first
confirm CREATEs; a reschedule (candidate self-serve or recruiter) PATCHes *"the
same event — never a second one at the new time"*; attaching or changing a
meeting link PATCHes the existing event's location and *"never creates one"*; a
withdrawal, RSVP-decline, recruiter cancel or no-show DELETEs. On withdrawal the
stored id is cleared *"so a re-booking creates a fresh event"* — the technique's
clear-on-successful-delete rule.

## The five write-back states, on their own axis

`CALENDAR_EVENT_STATES` (`free-busy.ts:65`) is `written | not_connected | failed
| removed | orphaned`, and the README calls it *"a second axis from the free/busy
`CALENDAR_STATUSES`, sharing only the `not_connected` spelling"* — exactly the
two-axis separation the technique requires.

`removeInterviewEvent` (`:118`) deletes *"exactly the event kp created (never a
search-and-guess)"*, and on failure:

```
return record(invite.token, result.ok ? "removed" : "orphaned");
```

with the comment naming the dangerous orphan direction — *"a stale entry is still
sitting on someone's calendar"* — and keeping the event id *"so a later attempt
can"* retry. This is where the standard's second orphan direction came from: the
draft only had the local-handle-is-dead case; the more costly one is the
interview that closed while its invitation stayed live on somebody's calendar.

## Repair a live interview, surface a closed one

The `gone` branch (`:99`) is the technique's step 8 in code:

```
if (!result.ok && result.reason === "gone") {
  result = await createInterviewEvent(input, invite.workspaceId);
}
```

with the comment *"The event kp wrote was deleted in Google by hand. That is not
a failure to report to the recruiter — it is a cue to write the interview back
onto the calendar."* Automatic repair for a live interview, `orphaned` and a
human for a closed one.

## Body composition and the second invitation

*"The event's BODY is not invented here"* (`:33`): `interviewCalendarEvent`
(`app/_lib/calendar-links.ts:82`) already composes title, description (stage,
join link, reschedule URL) and location for the `.ics` and the add-to-calendar
template URL, and the written event is that same object — *"so the real calendar
entry and the link-only fallback can never disagree."*

`google-calendar.ts:164` suppresses the provider's own mail: *"NO `sendUpdates`,
on purpose: kp owns the candidate's confirmation email"*, otherwise Google sends
a second, un-branded invite for one interview. Both of these are upward lessons
the draft did not have.

## Rendering by actionability

`ScheduleCalendarEventChip.tsx` renders `failed` and `orphaned` as chips — *"the
two a human can act on"* — and the rest as quiet single-line facts, with
`written` linking straight to the event. Copy is set-equality guarded against
`CALENDAR_EVENT_STATES` by `calendar-status-i18n.test.ts`; end-to-end coverage
against real routes with a stubbed edge is
`app/api/schedule/calendar-writeback.test.ts`. Tenancy: the event is written to
`invite.workspaceId`'s connection only.

## Deviation

There is no bounded-retry ladder on the write axis. `failed` and `orphaned` are
recorded honestly and a later action retries, but nothing schedules that retry
with backoff and a terminal give-up — an orphaned entry sits until a human acts.
The standard stays: an orphaned event is the state where a person may be about to
attend a cancelled interview, and a bounded background retry closes most of them
before anyone has to look. (kp does implement exactly this discipline one seam
over, for reminder dispatch, in `app/_lib/interview-reminder-policy.ts`.)
