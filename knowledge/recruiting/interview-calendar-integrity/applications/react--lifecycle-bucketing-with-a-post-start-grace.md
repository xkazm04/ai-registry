---
layer: application
type: application
subject: interview-calendar-integrity
technique: lifecycle-bucketing-with-a-post-start-grace
stack: react
status: forged
---

# The vanishing interview, and the partition that fixed it (kp)

## The incident

kp's recruiter Schedule tab computed its `upcoming` bucket as
`confirmed && Date.parse(slotAt) >= now`. The header comment on
`app/features/hiring/schedule/scheduleInviteLifecycleBuckets.ts:1` records what
that cost:

> *"A confirmed interview therefore VANISHED from the entire panel the instant
> its start passed: it couldn't be `upcoming` (now in the past), couldn't be
> `awaiting` (that bucket is `status !== "confirmed"`), and couldn't be
> `attention` (only flagged rows) — so the recruiter lost sight of the call they
> were about to run (or had just finished and needed to mark no-show /
> next-step)."*

This is the technique's central failure exactly: three independently-authored
predicates that covered most of the timeline and left a hole one interview wide,
opening at the moment someone was most likely to be looking.

## The partition

`InviteBuckets` is now five buckets — `attention`, `upcoming`, `today`,
`awaiting`, `closed` — and `bucketInvites` assigns them as an ordered cascade,
first match wins, with **terminal fates first**:

```
const closed = invites.filter((i) => closedReason(i, nowMs) !== null);
const live = invites.filter((i) => !closed.includes(i));
const attention = live.filter((i) => i.needsMoreSlots || i.needsReconcile || hasPendingProposals(i));
```

The comment on the terminal-first ordering names the reason: a declined /
no-showed / expired invite *"must not appear as an actionable attention/awaiting
row even if a stale flag (`needsReconcile`) lingers on it."*

**The grace window.** `RECENT_WINDOW_MS = 4 * 60 * 60 * 1000` keeps an
at-or-just-past confirmed slot in `today` — *"long enough to cover the interview
itself plus immediate no-show / next-step follow-up, short enough that old
bookings don't accrete in a live agenda (the panel is not a history log)."* The
same change removed the `>=`-at-`loadedAt` flicker, so a slot exactly equal to
"now" stays visible either way.

**Derived fates.** `closedReason` returns `"expired" | "declined" | "no_show" |
null`, with `expired` derived at read time via `isScheduleInviteExpired` rather
than stored. The same function feeds both the bucketing and the rendered label,
so *"the rendered reason can't drift from the bucketing"* — the technique's
one-function rule, implemented.

**Purity for testability.** The module is extracted from the `.tsx` specifically
so the partition is unit-testable under bare `node --test`; the `ScheduleInvite`
import is type-only so the store's `better-sqlite3` is not pulled in.

## One predicate for two eligibilities

`canReinvite` does not author its own notion of "still on the interview track".
It calls `isEntryReminderEligible` from `app/_lib/pipeline-status.ts` — *"the
SAME rule the reminder sweep uses… Reused here so the Closed-bucket re-invite and
the reminder eligibility can't drift."* Null (no linked entry, or a join the
agenda read did not make) resolves to eligible, mirroring the reminder rule
rather than inventing a second default.

## The display-window union

The same class of bug appears in the week grid, and
`app/features/hiring/schedule/ScheduleCalendar.tsx:92` fixes it the way the
technique prescribes — the hour rows are *"the configured interview hours + the
proposal window, UNIONED with any hour a real booking/pick already occupies — so
no booking can land on a row the grid doesn't render (the off-hour-vanish bug,
re-openable by `KP_INTERVIEW_TIMES`)."* `extraHours` collects hours from `picks`
and `bookedMarkers` and feeds `interviewGridRows`. Configuration describes what
is offered; it does not decide what exists.

## Deviation — the hole is deferred, not closed

`scheduleInviteLifecycleBuckets.test.ts` covers the boundaries well: the
just-passed slot staying in `today` (:58), the exactly-at-`now` non-flicker
(:90), the recent-window boundary (:96), no double-counting across buckets (:82),
terminal rows never reaching attention despite a stale flag (:125), and
`canReinvite`'s shared rule (:152).

But the partition is still not **total**, and one of those tests names it:
*"future confirmed → upcoming (sorted), old-past → dropped"* (:70). In
`bucketInvites`, a confirmed interview whose slot is older than
`recentWindowMs` matches no branch, with the comment *"intentionally not shown;
keeping it would grow the agenda without bound."* An interview that happened, has
no recorded outcome, and is more than four hours old therefore disappears from
every bucket — the original vanishing bug, deferred by four hours rather than
removed. `awaiting` cannot catch it, because that bucket is still keyed on
`status !== "confirmed"` rather than on *happened, no outcome recorded*.

The standard stays as written: the interview leaves the live agenda into an
explicit **awaiting-outcome** bucket, which escalates rather than archives,
because an interview conducted and never recorded is a candidate stalled for
reasons entirely internal to the company. Unbounded agenda growth is a real
concern and the right answer to it is escalation plus an explicit archive action,
not silent omission. The remaining test to write is the one the technique names:
sweep clock values across an interview's whole life and assert membership of
exactly one bucket at every step — the assertion that would have failed here.
