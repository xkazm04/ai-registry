---
layer: application
type: application
subject: alerting
technique: absence-as-a-condition
stack: next
status: forged
verified_on: 2026-09-29
verified_against: next@16
---

# Silence made readable: ascent's control ledger and systedo-case's cron health

Read at ascent `e47194fa7d` (`next ^16.3.3`, the witness for `verified_against`)
and systedo-case `45dbe922b6` (`next 16.3.3`). Neither is an evaluation loop
over user-authored rules; both are products whose worst failure is a silent
one, and both built pieces of the technique from scratch.

## ascent: unreadable is recorded, and never pages

`src/lib/db/control-observations.ts` freezes a row contract whose fourth
clause is the technique's first move: `state ∈ pass | fail | unmeasurable`, and
"UNMEASURABLE NEVER MEANS FAIL". A denied or absent read is stored as
`unmeasurable` with a null value, because inventing a fail from an unreadable
control "would report a repo that genuinely enforces protection as wide open".
The second clause is the heartbeat: one row per `(repo, control)` per 24 hours
even when nothing changed, because otherwise "no row" is ambiguous between
"unchanged" and "we stopped looking", and "the heartbeat is what makes silence
readable".

`src/lib/scan-alerts.ts` then makes the routing half explicit: an
`unmeasurable`-only batch is recorded and **never dispatched to a sink** (`:295`,
`:360`), on the reasoning that a token losing one scope turns thirteen controls
unreadable at once and paging on that would train a team to mute the channel.
That is the per-tick decision, and it is right.

What is missing is the age. Nothing counts consecutive `unmeasurable`
observations for a `(repo, control)`, so a control unreadable for a month is a
row per day that nobody is shown. The technique's second section names the gap:
a not-evaluable rule is a condition with a duration, and past a bound it is
surfaced as broken. The pieces are all there. `sinkHealth`
(`src/lib/alert-sink-health.ts:50-81`) already walks a newest-first row list and
returns `consecutiveFailures` and `failingSince` for the delivery sink; the same
shape over `unmeasurable` rows, fed from `latestObservationsFor`, would give
the control side the same "failing since" field.

## systedo-case: a heartbeat with a grace, and the map's edge

`src/lib/cron/ledgers.ts:88-97` registers a `heartbeatStep` that is due every
tick and "does nothing but succeed", so the pipe is proven in production before
any business step exists and a `ledgers` row appears in `cron_runs` every half
hour. `src/app/api/health/route.ts:17-38` is the receiver: each cron has a
maximum age derived from its schedule times `CRON_STALE_TOLERANCE = 2`, "absorbs
scheduling drift and a single missed tick without crying wolf". That is the
technique's sender-interval-inside-receiver-window rule with a grace, written as
a multiplier, and the tolerance is why one late tick does not page.

Two edges. The comment records that "a cron absent from this map is not judged",
so a new cron with no entry is invisible: a coverage hole at the exact place
the technique says the rule must be declared. And the receiver is a route in the
same application whose schedule it checks; whether anything outside it polls
`/api/health` was not established in this read, and without that the watcher
shares a failure domain with the thing it watches.
