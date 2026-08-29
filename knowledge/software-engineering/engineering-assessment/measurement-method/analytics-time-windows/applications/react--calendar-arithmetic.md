---
layer: application
type: application
subject: analytics-time-windows
technique: calendar-arithmetic
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# Nominal slots that refuse to assert what happened

*Verified against the project tree at `c2a3c5fa1`. Split out of the node-stack
application on 2026-08-29: that document computes period edges in a server
codebase; this one is a desktop scheduling calendar and a different tree.*

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
