---
layer: technique
type: technique
subject: cost-metering
technique: engagement-paced-cadence
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [an always-on agent loop bills around the clock while nobody interacts with it, deciding how a self-driven loop slows when it runs out of real work, a loop's cost control must not add latency to the interactions it exists for]
---

# Engagement-paced cadence

Everything else in this subject governs calls something already decided to
make: price them, estimate them, gate them at a ceiling. A continuously
self-driven loop — an agent that keeps thinking, checking, or acting without
an external trigger — sits upstream of every one of those controls, because
its spend rate is set by a decision none of them owns: **how often the loop
wakes at all.** A ceiling caps the month; it says nothing about whether an
untended loop burns the month at full speed doing nothing, then goes dark. A
skipped-for-budget trigger is binary; a self-driven loop needs something
graduated. This technique owns that stage: cadence as a function of
engagement, so an idle loop costs almost nothing and an engaged one is never
throttled.

## Split reactivity from spontaneity

The design rests on one separation, and every defect in the naive versions
comes from blurring it:

- **Reactivity** — work driven by an external input addressed to this loop.
  Never throttled, never delayed, regardless of how deep the idle. The
  latency of a response to a human is the product; it is not the place cost
  control is allowed to shop.
- **Spontaneity** — the loop waking itself, unprompted. This is the only
  thing that spends while nobody is watching, so it is the only thing that
  backs off.

A single knob that slows "the loop" throttles both and buys cost savings
with response latency — the one trade the loop's operator did not ask for.
Splitting the trigger classes lets the schedule act on spontaneity alone
while an external input snaps the loop back to full speed instantly.

## The schedule: exponential descent with dwell, settling at a cap

The cadence is a level-based schedule: level 0 is *no pause* — while there is
real work, wakes run back-to-back — and each level above it delays the next
spontaneous wake by `base · factor^(level−1)`, capped at a configured slowest
rate. Two properties are load-bearing:

- **Dwell before descending.** The loop holds each rate for a configured
  number of empty wakes before stepping slower, so one quiet moment does not
  collapse an active period's cadence. The dwell count is the knob that
  trades presence against descent speed; the cap is the knob that sets the
  steady idle cost.
- **It settles, it never sleeps.** At the cap the loop still wakes at a slow,
  constant rate — the idle cost is a bounded number of wakes per hour, chosen
  on purpose, and the loop's liveness never depends on an input arriving.

The wake-rate at the cap is the honest cost figure to state, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate):
"wakes per idle hour" is model-independent and converts to money through the
price table, where "it backs off" converts to nothing.

## Classify the wake by what it produced

The schedule needs a verdict per spontaneous wake: did this wake do real
work? The classification is where a first implementation goes quietly wrong,
in both directions:

- **A wake that produced visible work** — an action, an observation, an
  outgoing message — resets to level 0. There is evidently something to do.
- **A wake that produced nothing** counts as empty and advances the descent.
- **A wake that produced only internal deliberation** — a thought, a note to
  self, "nothing has changed" — must count as empty, or nearly so. A loop
  that scores its own rumination as work re-fires at full speed forever: it
  will always have something to say about having nothing to do. Ruminating
  output can be allowed a faster floor than true emptiness, but it must
  descend.
- **The loop's own outputs must not count as engagement.** An outgoing reply
  re-enters the system as an event; if it resets the schedule, the loop
  engages itself and the backoff never begins. Only input addressed *to* the
  loop from outside it is engagement.

## The idle wait must not hold the loop's slot

Where the loop runs under a dispatcher that serializes work per loop, the
wait between wakes must be a scheduled future trigger, not a sleep inside the
running step. An in-step sleep holds the execution slot for the whole rest —
polling for interrupts bounds the latency but the slot is never genuinely
free — and that pins the cap low, because a long rest becomes a long-lived
busy process. With a scheduled wake, the slot frees between wakes, an
external input dispatches immediately no matter how long the current rest,
and the cap can grow to whatever steady rate the operator wants. Two
mechanical guards travel with the scheduled-wake design: the timer is a
singleton (arming kills the previous one), and a wake fires only if the
runtime that armed it still owns the loop — a wake armed before a restart
must not fire into the successor, which a liveness token checked at fire
time settles and a process-id check does not.

## A failed wake is not a resting wake

When a spontaneous wake crashes — the model call fails, the step dies — the
run must record a visible error outcome, not fall through to the same marker
an idle wake writes. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
a loop that is broken and a loop that is calmly resting must be
distinguishable at a glance; a crash recorded as rest is an outage
masquerading as economy, discovered only when someone wonders why the agent
has been "quiet" for a week. The descent schedule may treat the failed wake
as empty — spending faster because calls are failing is the wrong direction
— but the record says *failed*.

## The second lever: cheaper wakes, not just rarer ones

Cadence is the primary mechanism and suffices alone, but the wake's unit
cost is independently reducible once the schedule exists, keyed off the same
level: route deep-idle spontaneous wakes to a cheaper model, or precede the
full wake with a cheap yes/no probe — "is anything genuinely worth doing?" —
escalating to the full loop only on yes. Reactive work keeps the full model
unconditionally; the response to a human is not where the discount applies.

## Decision rules

- Throttle spontaneity only. An external input addressed to the loop
  dispatches immediately and resets the schedule to no-pause.
- Descend exponentially with a dwell at each rate; settle at a configured
  cap; never stop entirely.
- Classify each spontaneous wake by its output: visible work resets,
  emptiness descends, self-referential deliberation descends (a ruminating
  loop must not score its rumination as work).
- Exclude the loop's own outputs from the engagement test.
- Implement the wait as a scheduled wake that frees the loop's slot, guarded
  by a runtime-ownership token; an in-step sleep pins the cap low.
- Record a crashed wake as an error, never as rest; let it advance the
  descent anyway.
- State the idle cost as wakes per hour at the cap, and price it through the
  price table like any other spend class.
