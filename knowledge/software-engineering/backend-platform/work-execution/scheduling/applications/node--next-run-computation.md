---
layer: application
type: application
subject: scheduling
technique: next-run-computation
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A cron parser whose tests cover leap days and a timezone, and neither DST rule (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. The realization is a
scheduler for recurring agent tasks with a five-field cron expression, a per-task
timezone, a revision-guarded claim (a task is fired only if its status, revision and next
run still match the snapshot the tick read:
`src/cron/runtime/CronFire.ts:282 "function matchesScheduledSnapshot"`), crash recovery
that rewrites interrupted runs as failed
(`src/cron/runtime/CronRuntime.ts:516 "cron_run_interrupted"`), and a documented history:
its schedule semantics changed once because "Version 2 incorrectly required both
restricted day fields to match" (`docs/cron-scheduling.md:18 "Version 2 incorrectly required both restricted day fields to match."`). The claim and recovery
halves are sound; this application is about the computation.

## What the tests cover

The schedule tests run seventeen cases, all passing, and they read as a list of bugs
someone paid for: a wildcard weekday retains the leap-day search, an explicit full
weekday range does not use the shortcut, February weekdays match outside a leap year,
either day field matches in the task's timezone
(`tests/cron/cron-schedule.test.ts:107 "matches either day field in the task timezone"`).
Timezone handling exists and is tested. **No case sits on a daylight-saving transition.**

## Executed: both transition rules

The real `computeNextCronRunAt` was run in a zone with daylight saving, three consecutive
runs each, starting the night before the transition
(`src/cron/runtime/CronSchedule.ts:44 "export function computeNextCronRunAt("`).

| Expression | Night | Runs returned (UTC) | The technique's rule |
| --- | --- | --- | --- |
| `30 1 * * *` (01:30 occurs twice) | fall back, 2026-11-01 | 05:30, **06:30**, then 06:30 next day | fire on the first occurrence only |
| `30 2 * * *` (02:30 does not exist) | spring forward, 2026-03-08 | 2026-03-09 06:30, 03-10 06:30, 03-11 06:30 | fire once at the first valid instant after the gap |

On the fall-back night the task fires **twice**, an hour apart, at the same wall-clock
reading; on the spring-forward night the day's run is **skipped** entirely and the next
run is the following day. These are exactly the two outcomes
[next-run-computation](../techniques/next-run-computation.md) names as the wrong ones
("skipping the day entirely surprises authors; firing twice is worse"), and neither is
documented in the tree's scheduling document.

## What it costs here

A recurring agent task with side effects (a report, a message, a push to a channel) runs
twice on one night a year and not at all on another, in every zone that observes the
change. For an unattended scheduler that is a low-frequency and high-surprise failure:
one duplicate action and one silent absence a year per task, neither logged as a fault.
A task in a zone without daylight saving never sees it, which is the population the tests
appear to have been written for.

## Cannot say

Whether the tree's timezone library treats a nonexistent local time in a way its authors
chose; the executed behaviour is consistent with "advance to the next matching day" and
with "search forward by wall clock", and the tree states neither. The repair is one
decision made twice and written down, plus two test cases on the transition dates; it was
not applied to this tree, and there is no fleet project running its scheduler.
