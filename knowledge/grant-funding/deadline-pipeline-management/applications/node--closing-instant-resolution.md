---
layer: application
type: application
subject: deadline-pipeline-management
technique: closing-instant-resolution
stack: node
status: forged
---

# Node: closing instants and tz-correct day math in a deadline radar

How the same grant-writing product (repo: `grant-writing-nonprofits`) realizes
closing-instant resolution — and the timezone-correct day math it composes
with — in a dependency-free date leaf shared by its radar, reminders, and
scoring.

## The leaf module

`src/features/deadline-radar/dates.ts` is deliberately a dependency-free leaf
so both the radar computation and grant scoring share one implementation
without an import cycle (header comment, lines 1-6). It holds both clocks:

**Calendar-day clock** (`dates.ts:65-98`). `parseCloseDate` pins funder dates
(US `MM/DD/YYYY` and ISO forms, defensively parsed, impossible dates rejected
by round-tripping — `safeDate`, lines 34-49) to UTC midnight; `calendarDayInTz`
projects a wall-clock instant onto the calendar day it falls on in the
business timezone via `Intl.DateTimeFormat("en-CA").formatToParts`, re-pinned
to UTC midnight; `daysUntilClose` diffs the two. The block comment at 65-74 is
the incident writeup the technique generalizes: measured from today-in-UTC, "a
job running after UTC midnight but before local midnight (e.g. a 02:00 UTC
cron = 10 PM ET the previous day) computes the day off-by-one — firing the
day-of reminder a day early, or, once daysOut goes negative, silently dropping
the single most important last-day nudge." `DEADLINE_TZ` defaults to a
configured business zone (`REMINDER_TZ` env, line 75) and every consumer takes
`tz` as an injectable parameter.

**Closing-instant clock** (`dates.ts:100-208`). `closingInstant` resolves
date + optional wall-clock time + optional IANA zone to a real UTC instant:
time defaults to 23:59, zone falls back to the business tz, and the
wall-clock→UTC conversion is the guess-then-correct offset trick
(`tzOffsetMs` + `zonedWallToUtc`, lines 108-135) with the DST caveat stated
in-line ("off by ≤1h — acceptable for a deadline"). `isPastClose`
(lines 196-208) is the composition rule made code: when the grant carries
`closeTime` or `closeTz`, expiry compares instants ("a 17:00-Brussels call
expires at 17:00 Brussels, not local midnight"); otherwise it falls back to
`daysUntilClose < 0` so time-less grants behave unchanged. An unparseable
close date returns null → "no deadline → never past" — the honest-null rule.

## Multi-cutoff resolution

`nextUpcomingDeadline` (`dates.ts:143-156`) implements earliest-future-else-
latest-past over raw ISO strings. The comment records the regression that
forced it: a two-stage call "kept only the first" cutoff and "the whole call
vanish[ed] once cutoff 1 passed, even when a later cutoff is a year out."
When all cutoffs are past it returns the latest, "so downstream expiry
correctly reads it as closed."

## The radar consumer

`src/features/deadline-radar/computation.ts:76-117` shows the two clocks
composed in the hot path: `isPastClose(now, g, opts.tz)` gates expiry by the
real instant; `daysUntilClose(now, close, opts.tz)` feeds `severityForDays`
(lines 36-41: <7 critical, <30 warning, <90 upcoming, else far) and the
band → daysOut → fit-descending sort (lines 105-116), capped at 8 rows. The
fetch layer (lines 137-144) makes its 500-row cap loud with a `console.warn`
naming exactly which deadlines may be missed — the "invisible truncation"
failure mode, made detectable.

## Notable choices

- Time and zone live as separate optional fields on the grant
  (`closeTime` / `closeTz`), so their absence selects the calendar-day
  fallback — the absence-is-information rule.
- Parsed closing times are clamped (`Math.min(23,…)/Math.min(59,…)`,
  lines 171-172) rather than rejected: a mangled published time still yields
  a deadline.
- `daysBetween` stays exported as the raw UTC primitive for
  already-normalized calendar dates; `daysUntilClose` is prescribed
  "wherever `now` is a real wall-clock instant" — the module encodes the
  two-clock boundary in its API surface instead of documentation alone.
