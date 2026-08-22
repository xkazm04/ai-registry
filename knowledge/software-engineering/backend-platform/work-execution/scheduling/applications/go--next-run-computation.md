---
layer: application
type: application
subject: scheduling
technique: next-run-computation
stack: go
verified_on: 2026-08-22
---

# Next-run computation in the Temporal server Schedules subsystem (Go)

Citations are against `temporalio/temporal`, `ServerVersion = "1.32.0"`
(`common/headers/version_checker.go:26`), commit `6805cae` (2026-08-21). Two schedulers
share one spec compiler — the legacy workflow one (`service/worker/scheduler/`, source of
bare `spec.go` / `calendar.go` citations below) and the CHASM one (`chasm/lib/scheduler/`),
which imports the legacy package for exactly this function: "if next-run math lives in
more than one place, one copy is already wrong", honored by construction. External-tree
reconciliation, so the pin is prose, not `verified_against`.

## 1. Three shapes, normalized at the door

The three shapes are the literal proto surface: structured calendar, interval, and a
start/end window (`spec.go:295-299`, where `StartTime` clamps the search). The rest is
sugar *compiled away at authoring time* by `canonicalizeSpec` (`spec.go:143-214`): legacy
calendar strings parse to structured calendars (`:148-155`), excludes likewise
(`:158-165`), and each cron string decomposes into a structured calendar *plus* an interval
*plus* a timezone (`:170-187`) — `@every 5m` becomes an interval, not a calendar walk;
cron strings disagreeing on timezone are rejected, not last-write-wins (`:175-178`).

The door is the frontend: `canonicalizeScheduleSpec`
(`service/frontend/workflow_handler.go:6930-6953`) runs on `CreateSchedule` (`:3879`) and
`UpdateSchedule` (`:4696`), rejects with `InvalidArgument`, and **writes the canonical
form back into the request** (`:6951`). Ranges are checked per field (`spec.go:237-243`:
hour 0-23, day-of-month 1-31, year 2000-2100) and intervals must be ≥ 1s with
`0 <= phase < interval` (`:255-270`) — no rule can first fail to parse when it comes due.

## 2. Compute in the rule's frame, store as a universal instant

`compiledCalendar` carries its own `*time.Location` (`calendar.go:18-27`) and `matches` /
`next` convert into it first (`:96-98`, `:115-117`) — calendar math in the author's wall
clock. `rawNextTime` returns the minimum over all calendars and intervals as
`time.Unix(...).UTC()` (`spec.go:344-368`), so downstream comparison is plain arithmetic.

## 3. Totality, with a bounded search and a warn tier

"Never again" is the zero time: nothing matched (`spec.go:364-366`), the result passed
`EndTime` or `maxCalendarYear` (`:301-303`, `:328-330`), or the walk ran off year 2100
(`calendar.go:33-35`, `:159-161`). The outcome the technique does not name is a spec whose
excludes swallow every candidate: `GetNextTime` loops `rawNextTime` → `excluded`
(`spec.go:313-331`) under two bounds — soft `warnIterations` (default 86 400), which sets
`ComputeLimitWarning` and keeps searching, and hard `maxIterations` (default 1 209 600),
which returns `ErrComputeLimitExceeded`
(`common/dynamicconfig/constants.go:3587-3600`). The caller degrades instead of crashing:
`checkNextScheduleResult` (`chasm/lib/scheduler/spec_processor.go:212-240`) emits
`schedule_compute_limit_warning` / `schedule_compute_limit_exceeded`
(`common/metrics/metric_defs.go:1575-1582`) and returns a zero wakeup — the schedule stops
arming until edited, visibly.

**Deviation.** `spec.go:316-318` claims the hard bound is "Disabled by default
(maxIterations == math.MaxInt)"; it is disabled only when the getter returns ≤ 0
(`:308-311`) and the shipped default is 1 209 600 — a configuration that ships nowhere.
And the legacy path builds its `SpecBuilder` from `dynamicconfig.NewNoopCollection()`
(`service/worker/scheduler/workflow.go:233-237`), so an operator override of either bound
reaches only the CHASM path (both wired at `chasm/lib/scheduler/fx.go:22-23`).

## 4. Jitter is seeded by schedule identity, and clamped

`addJitter` (`spec.go:388-407`) hashes the nominal time's binary encoding plus a seed
through `farm.Fingerprint32` and maps the 32-bit result onto `[0, maxJitter]` in
milliseconds. The seed is `namespaceId-scheduleId`
(`chasm/lib/scheduler/scheduler.go:469-471`) — seeded-by-identity exactly: schedules
sharing a "top of the hour" rule land on different offsets, the *same* schedule lands on
the *same* offset on every recomputation, and no clock or RNG is read, so preview,
enumeration and fire agree. The clamp is a refinement the draft lacks:
`maxJitter` is first reduced to `following.Sub(nominal)`, the gap to the *next* nominal
time (`spec.go:333-337`), so jitter can never reorder two occurrences of one schedule.

## 5. Nominal and actual are carried separately, all the way down

`GetNextTimeResult` splits `Nominal` (pre-jitter) from `Next` (post-jitter)
(`spec.go:32-39`) and every consumer keeps both: an action carries `NominalTime` and
`ActualTime` side by side (`chasm/lib/scheduler/spec_processor.go:176-183`); the started
workflow's **ID derives from the nominal time**
(`chasm/lib/scheduler/internal/request_id.go:46-49`), as does its
`TemporalScheduledStartTime` search attribute (`chasm/lib/scheduler/scheduler.go:1079-1093`);
the request ID mixes both times with namespace, schedule and conflict token
(`chasm/lib/scheduler/util.go:16-25`).

## 6. The compiled spec is a cache, with invalidation named

`Scheduler.compiledSpec` is lazy (`chasm/lib/scheduler/scheduler.go:448-461`) and busted
whenever `ConflictToken != cacheConflictToken` (`:492-503`); every mutation that should
invalidate calls `updateConflictToken` (`:505-510`). The tz-database lookup is cached on a
24-hour TTL whose comment names the reason — a mid-process tzdata change would otherwise
be pinned forever — and caches negative results too (`spec.go:41-50`, `:272-286`).

## 7. DST decisions — deliberate, and both differ from the standard

Semantics are pinned by tests (`calendar_test.go:223-247`):

- **Spring-forward gap.** `next` notices the constructed time's hour is not the intended
  one (`calendar.go:202-208`) and advances to the next hour, so `2:33:33 daily` on a night
  with no 2:33 **skips the day entirely** — the test asserts March 12 then March 14, 2022
  (`:228-234`). *Deviation:* the technique calls for firing once at the first valid instant
  after the gap; Temporal drops the occurrence.
- **Fall-back repeat.** A `dstoffset` is tracked (`calendar.go:122-126`, `:141-148`) so
  the *second* copy of a repeated hour also matches: the test asserts 1:33:33, 1:44:33,
  then both again an hour later (`:236-246`). *Deviation:* the technique says first
  occurrence only. The two pull opposite ways — a run lost in spring, one gained in autumn.
- **Day-of-month overflow.** `d > daysInMonth(mo, y)` rolls to the next month
  (`calendar.go:153-155`) and the day matcher abandons it (`:175-181`), so `day 31`
  **skips** 30-day months — acceptable, but stated nowhere an author reads.

## 8. Anchor: the epoch grid, not the previous completion

`nextIntervalTime` (`spec.go:371-375`) computes
`(((ts - phase) / interval) + 1) * interval + phase` — an absolute grid on the Unix epoch
plus a phase, never on the previous completion. The anchor is global and fixed-cadence, not
per-item; the stacking a completion anchor prevents is answered instead by overlap policy,
defaulted to `SKIP` (`chasm/lib/scheduler/scheduler.go:477-483`). Backwards clock jumps are
caught outside this function — the generator clamps `t2` to `t1` and logs `"time went
backwards"` (`chasm/lib/scheduler/generator_tasks.go:83-88`).

## Reconciliation summary

Confirmed: one compiler shared by both implementations; sugar normalized and validated at
the door, canonical form written back; calendar math in the rule's timezone, storage as a
universal instant; a total function with explicit never-again *and* a bounded, metered
answer for pathological specs; identity-seeded jitter clamped to the following nominal
time; nominal-vs-actual carried into workflow ID, request ID and search attributes;
compiled spec and tz lookup as caches with named invalidation. Deviations: spring-forward
drops the occurrence and fall-back fires twice, both opposite to the DST rules and pinned
by tests; day-of-month overflow silently skips the month; the compute-limit comment
contradicts the shipped default, which is also untunable on the legacy path. Not present by
scope: the interval anchor choice (epoch grid only, delegated to overlap policy) and the
sub-tick floor — no polling tick exists.
