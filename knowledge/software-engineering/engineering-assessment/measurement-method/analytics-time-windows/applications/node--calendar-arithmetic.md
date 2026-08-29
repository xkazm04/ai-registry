---
layer: application
type: application
subject: analytics-time-windows
technique: calendar-arithmetic
stack: node
verified_on: 2026-08-20
---

# Calendar arithmetic across four surfaces of one product

The interesting thing about this codebase's calendar handling is that it is
not in one place — it appears in scheduling, in allowance metering, in trend
bucketing and in week alignment, and each site independently arrived at part
of the same rule. That convergence is the argument for the shared vocabulary.

## Monthly cadence: calendar step with day-of-month clamping

`nextScanFor` (`src/lib/db/org-watch.ts:28-42`) implements "monthly" as same
day-of-month next month, and its comment states the cost of the alternative
precisely: a flat 30-day step walks the date backwards through the calendar
(31st → 30th → 29th …) so a monthly report drifts off its slot and fires
**12.2 times a year instead of 12**. Overflow clamps to the target month's
last day (Jan 31 → Feb 28/29) via the day-0-of-next-month trick
(`src/lib/db/org-watch.ts:37-39`).

Two further details the technique now carries as rules:

- **The mixed policy is deliberate and declared.** `daily` and `weekly` stay
  exact-duration steps (`src/lib/db/org-watch.ts:41`), on the stated reasoning
  that a clock shift moving a scan by an hour is irrelevant and a fixed step
  is cheaper and more predictable. Only month-and-longer cadences take the
  calendar.
- **The cadence table is keyed on the canonical vocabulary.** `SCHEDULE_DAYS`
  (`src/lib/db/org-watch.ts:11`) is a `Record<Schedule, number>` over the
  shared `Schedule` type, so a missing or extra cadence is a compile error
  here rather than a divergence between the route validator and the scheduler.
  Anchoring the step on the *intended* slot rather than the wall clock
  (`nextSlotFrom`, same file) is the neighbouring scheduling subject's
  concern, not this one's.

## Allowance metering: the calendar month, with its trade-offs named

`countMeteredScansThisMonth` (`src/lib/db/credits.ts:275-289`) is the best
example in the repo of the technique's "name the trade-off *and* what else
must change" rule. The window is the universal-time calendar month, resetting
at 00:00 on the 1st, and the comment enumerates the accepted costs: users west
of the canonical zone see the reset mid-evening on the month's last day, and
the window is not anchored to the billing anniversary, so an org subscribing
mid-month gets a bounded first-month double allowance. Then the load-bearing
sentence:

> User-facing copy (the allowance line, the pricing page) says "resets on the
> 1st (UTC)" to match. Anyone "fixing" this to billing-cycle anchoring must
> also update that copy and the reconciliation surfaces that assume calendar
> months.

That is a boundary decision that has enumerated its own dependents. It is also
the enforcement-boundary rule in action: the displayed period is the enforced
period, even though a local-time month would read more naturally.

## Rolling-window starts are calendar days, not millisecond offsets

`resolveWindow`'s `30d`/`90d` branches (`src/lib/window.ts:113-126`) snap to
canonical-zone midnight N *calendar* days back via `addDaysInZone`. The
comment records two successive fixes: a raw `N × 86.4M ms` offset made the
baseline an arbitrary wall-clock instant that flickered within a calendar day,
so a boundary-day scan landed on either side of `start` depending on the hour
the page rendered; and the intermediate `startOfDay(now − N×DAY)` still had a
clock-shift seam where a flat 90 nominal days could snap to the adjacent
calendar day.

## Week alignment: floor to the weekday, then index

`weekIndex` (`src/lib/db/org-signals.ts:318-327`) is the phase problem solved
exactly as the technique prescribes. An upstream provider emits Sunday-aligned
weekly series; a naive `floor(ms / WEEK_MS)` bins on the epoch grid, which is
Thursday-anchored, so two entities' observations on opposite sides of a
Thursday boundary *within the same provider week* land one bucket apart and
their series sum out of phase. The fix floors the instant to its Sunday
midnight first and indexes after; `weekStartMs`
(`src/lib/db/org-signals.ts:333-337`) is the exact inverse via the 3-day
epoch offset.

The horizon rule sits beside it: `ACTIVITY_HORIZON_WEEKS = 26`
(`src/lib/db/org-signals.ts:316`) bounds the zero-filled grid **anchored at the
newest scan week**, not at the present, so one entity last scanned a year ago
cannot stretch the grid back and dilute the trend to ~90% zeros.

## Labels interpolated from the constants that bucket

`DUE_BUCKET_LABEL` (`src/lib/db/org-insights.ts:347-355`) renders
`Due within ${DUE_SOON_DAYS} days` / `Due within ${DUE_MONTH_DAYS} days`
rather than the words "this week" / "this month". The comment records the
defect: "Due this month" read as calendar-aligned and mis-bucketed a July-29
against an Aug-1 item on July 1, when the cutoff was in fact a rolling 31
days. The vaguer "within a month" is gone because a month is 28-31 days and
the cutoff is exactly 31 — the label and the arithmetic now cannot disagree,
because one is derived from the other.

## Deviation

`src/lib/db/org-signals.ts` performs its week arithmetic in universal time
(`Date.UTC`, `getUTCDay`) while the dashboard window snaps in the canonical
org zone. Both are declared, and the canonical zone defaults to universal
time, so no split brain exists today — but the coupling is by coincidence of
configuration rather than by construction. If the canonical zone is ever
overridden, this grid keeps its universal-time weeks while the window moves,
which is precisely the split-brain signature the
[canonical-zone](../techniques/canonical-zone-single-source.md) technique
describes.

---

## A second tree: nominal slots that refuse to assert what happened

*Added 2026-08-29 from a different codebase — a desktop scheduling calendar,
resolved against its tree at `c2a3c5fa1`. The sections above are unchanged and
their citations were **not** re-resolved on this date; the document's
`verified_on` still records when those were last checked.*

Everything above computes period *edges*. This surface computes the same
edges and then faces the question the technique does not yet reach: once a
nominal slot lies in the past, **what is allowed to fill it**. The answer here
is a four-state model plus a tolerance derived from the grid rather than
declared beside it, and both fall out of calendar arithmetic rather than out
of the rendering.

### The four states, and the one that is a refusal

`CalendarEvent.kind` (`src/features/schedules/libs/calendarHelpers.ts:24`) is

```ts
  kind: 'projected' | 'past-success' | 'past-failure' | 'past-unknown';
```

and the doc above it (`:15-23`) defines the fourth member as the absence of
evidence, not a fourth outcome: "a past slot with NO matching run record
(skipped, rate-limited, out-of-window, over budget, or the app was closed) OR
a matched run that hasn't resolved yet. Never a fabricated outcome — it means
'we can't assert what happened'."

The comment recording why (`:285-290`) is the load-bearing artifact, because
it names the defect the four-state model replaced:

> The calendar used to colour every past projected slot green/red from the
> trigger's OVERALL health, so a slot the engine SKIPPED (rate-limited,
> out-of-window, app closed, over budget) rendered as a confident
> past-success. It was asserting history it didn't have.

That is a *calendar* defect, not a status-badge defect. Generating a grid of
nominal slots is cheap and correct; the grid then looks like a record of what
happened, and the only honest way to keep it from becoming one is a fourth
state that says the arithmetic produced this cell and nothing observed it.
`matchPastSlotsToRuns` (`:334-365`) enforces the direction: outcomes are
initialised to `past-unknown` for every slot (`:339`) and upgraded only on a
matched record (`:360-363`), so the fallback is structural rather than a
final `else`. When no history is available at all, the array returns unchanged
(`:340`).

### The tolerance is derived from the grid it is matching against

Binding a nominal slot to a real run needs a window, because a scheduler tick
fires near the slot rather than on it. The base window is a declared constant
— `SLOT_RUN_TOLERANCE_MS = 90_000` (`:300`), justified at `:294-299` as
covering tick lag plus poll jitter. The mechanism worth transplanting is what
happens next (`:345-347`):

```ts
    let tol = baseToleranceMs;
    if (i > 0) tol = Math.min(tol, (slot - slotTimes[i - 1]!) / 2);
    if (i < slotTimes.length - 1) tol = Math.min(tol, (slotTimes[i + 1]! - slot) / 2);
```

The per-slot tolerance is capped at **half the gap to each neighbour**, so no
window can reach past the midpoint between two slots and no run can satisfy
two of them. The docstring states the case it protects (`:328-333`): a
sub-three-minute cadence, where a flat 90-second window is wider than the
spacing. The rule generalises past this surface — *any* constant tolerance
placed against a generated grid is wrong as soon as the grid is finer than the
constant, and the cap is the only form that stays correct across cadences
without a per-cadence table.

Two supporting disciplines keep the binding honest. Each run is consumed by at
most one slot, nearest-first (`consumed` at `:341`, the `dist <= tol && dist <
bestDist` search at `:349-359`) — so a single late run cannot paint a row of
slots green. And a backfilled run stamps its time far from any nominal slot,
so it simply fails to match (`:331-333`), leaving the genuinely-missed slots
reading `past-unknown` "rather than borrowing the backfill's outcome". The
half-gap cap, the one-run-one-slot rule and the boundary behaviour each have a
test (`matchPastSlotsToRuns.test.ts:64-73`, `:74`, `:55-62`, `:48-53`), which
is unusual for arithmetic of this kind and is what makes the cap safe to
change.

### Period generation lives in one subsystem, by deletion

The technique's rule that two subsystems sharing a period name must resolve it
from the same code is realised here in the strongest available form: the
consumer deleted its copy. `calendarHelpers.ts:82-91` records that the
client-side cron parser and fire-time generator were removed on 2026-05-01
"because they re-implemented cron with semantics that drifted from the engine
(e.g. accepting `*/100 * * * *` as a valid minute step where the engine
rejects it)", with the decision record named inline. Fire times now come from
the scheduler's own expansion over an IPC boundary
(`useCronPreview.ts:105-118`), and the calendar keeps only grid geometry —
week and month ranges padded to week boundaries (`calendarHelpers.ts:61-78`),
day stepping (`:41-57`).

The residual local stepping obeys the anchor rule. `generateIntervalFireTimes`
(`useCronPreview.ts:226-250`) walks whole intervals from the scheduler's own
next-fire anchor (`steps = Math.ceil(...)`, `:240`) rather than from the
present, and returns `[]` when the anchor is null (`:233`) instead of
inventing a phase — the same "never subtract a duration from now and call the
result a period start" discipline, applied to a cadence whose phase belongs to
another system.

Two more refusals sit on the read path rather than the arithmetic. History is
capped at 168 hours (`useCronPreview.ts:7-10`), and slots older than that
"render honestly as `past-unknown`" rather than being dropped from the grid;
and a history fetch that fails does **not** fall back to trigger health
(`:157-160`) — the comment states that unknown "is the honest state, not a
fabricated outcome", and leaves a breadcrumb so a persistently-failing read is
diagnosable. Interval triggers, which have no meaningful nominal past, plot
their real runs and fabricate no slots at all (`:192`).

### Limits of this half

- **One unknown covers two different unknowns.** A slot the scheduler
  deliberately declined and a slot whose history the surface could not read
  both render as `past-unknown` — the technique's honest refusal, but the
  decider's reason never crosses the read boundary, so the calendar cannot
  distinguish "skipped, and here is why" from "we did not ask". The surface
  is correct and uninformative in exactly the way the scheduling subject's
  observability technique predicts.
- **The half-gap cap assumes an ascending, single-trigger slot list.** It is a
  precondition in the docstring, not a checked one; a caller passing an
  unsorted array or two triggers' slots gets a silently wrong tolerance.
- **Nothing measures the base constant.** 90 seconds is reasoned about but not
  derived from observed tick lag, and no instrument would notice if lag grew
  past it — the failure would present as slots going unknown, which is
  indistinguishable from slots genuinely not running.
- **The stack differs from the rest of this document.** The mechanisms above
  are TypeScript in a desktop client, not the server-side node surfaces cited
  in the earlier sections; the arithmetic transplants, the IPC boundary does
  not.
