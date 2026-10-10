---
layer: application
type: application
subject: controller-latency-instrumentation
technique: tick-sampled-versus-event-recorded-age
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Two recording bases in a racing game's host, measured against an action-latency ground truth

Verified 2026-10-10 at `deathride/main@d9990777` in the racing game's tree. Paths are relative
to its root. The host is a Kotlin server on a Fire TV stick, and the controller is a browser
page. The numbers below come from a harness that drove the shipped input mailbox with a
modelled network and the controller's real send cadence. They do not come from a phone, a
radio or a human.

## The two bases the tree already has

The stats recorder samples per simulation step: every step records the age of the latest held
input once the slot has accepted one.

- `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:321` "if(slot.input.accepted>0) metrics.inputAgeMs[id].add(slot.input.ageMs,now)"
- `deathride/README.md:40` "age when the simulation consumes the state."

The README's label is accurate for this basis: it says *state*. The optional input profile
records per arrival, from the same corrected stamp:

- `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:266` "inputSample[3]=now-timestamp"

The stamp is taken when the page sends, not when the touch happened:

- `deathride/controller/index.html:106` "const ts=performance.now();lastSent=ts"

During a race the page resends its state on a 33 ms heartbeat, and it also sends on change:

- `deathride/controller/index.html:163` "const ms=hot?33:250"

## The experiment

A scratch test in the core module drove `InputMailbox.offer` and `consume` unchanged. Arms and
conditions:

- **Phone:** the 33 ms heartbeat plus change events at a Poisson rate of four a second.
- **Network:** one-way 6 ms plus exponential jitter with a 2 ms mean, delivered in order.
- **Simulation:** steps at 60 Hz.
- **Length:** 600 simulated seconds per arm, three seeds per scenario.
- **Ground truth:** the action latency, from each change event's true time to the first step
  that consumed its message.

The positive control held: the per-arrival median came out at 7.4 ms, the model's own
6 + 2 ln 2. Seed 1 is shown below; seeds 2 and 3 agree within 0.6 ms on every median and
p95.

| Scenario | Per-step state age p50 / p95 / max | Per-arrival age p50 / p95 / max | Action latency (truth) p50 / p95 / max |
| --- | --- | --- | --- |
| Steady | 22.3 / 38.7 / 55.6 | 7.4 / 11.9 / 29.0 | 16.3 / 24.3 / 36.8 |
| Page frozen 200 ms every 10 s | 22.4 / 38.9 / 238.8 | 7.4 / 11.9 / 29.0 | 16.5 / 25.5 / 216.4 |
| Network stalled 200 ms every 10 s | 22.4 / 38.9 / 206.0 | 7.4 / 12.8 / 205.8 | 16.5 / 25.3 / 216.4 |

n per arm: 35,999 steps, about 20,000 arrivals and about 2,400 actions.

## What it shows

- **On a steady link the per-step figure overstates action latency.** Its p95 is 38.7 ms
  against a true 24.3 ms, about 60 % high, and all of the gap is the heartbeat hold. Read as
  the latency of a steering input, it would fail a budget that the action itself meets.
- **The per-arrival figure is blind to a frozen page.** Sixty 200 ms freezes left its maximum
  at 29.0 ms, identical to the steady run. A message sent after a freeze carries a fresh stamp,
  which is coordinated omission. The per-step basis saw every freeze (238.8 ms).
- **A network stall is seen by both.** The queued messages keep their old stamps.

Verdict: `better`. Arm A is the project's single figure read as action latency. Arm B names
the bases and records the action basis. A misstates the steady p95 by 14 ms, and its other
basis misses a 200 ms controller freeze entirely. Falsifier: per-step p95 within a few
milliseconds of the action latency on this cadence, or a per-arrival maximum that rises with
the freezes. Neither happened. Limits: a modelled network and phone, with no radio
power-save and no Wi-Fi contention. The page-freeze scenario assumes the stamp is taken at
send, as the tree does.

## Deviations from the standard

- **No action basis exists.** Nothing records from the touch's own timestamp to the consuming
  step, so the latency of a player's action has never been measured, only bracketed.
- **The milestone report quotes the per-step figure as "input age"** beside a round trip. The
  label is honest about the end event and silent about the basis. A reader comparing it with
  the proposed optical rubric would read a held-state figure as an action figure.
- **The heartbeat interval is not printed beside the figure**, so the floor it adds cannot be
  seen from the report.

The scratch test was not committed to the project; it lived in a detached worktree that was
removed after the run.
