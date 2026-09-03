---
layer: application
type: application
subject: subprocess-lifecycle
technique: liveness-and-heartbeats
stack: react
status: forged
verified_on: 2026-09-03
verified_against: react@19.2
applied: code
ab_verdict: better
proof: ab-paired
---

# A late tick is evidence about the host, not the peer

The desktop app's cloud health monitor is a React hook that polls the
orchestrator every thirty seconds on a timer chain and, on a failed poll,
enters a reconnect loop with exponential backoff and eventually a terminal
error. The version witness is the frontend's `package.json`, which pins
React 19.2; every citation below was read against that tree on 2026-09-03.

The technique's amendment says a watcher tick that fires long after it was
armed - the host slept or was suspended - must not on its own declare the
peer dead. This tree had the exact failure the amendment names: after a
laptop resumes, the first tick lands minutes late, before the network is
back, the poll throws, and the hook stamped a reconnecting state for a
connection that was never gone.

## What changed

`src/features/agents/sub_deployment/hooks/useCloudHealthMonitor.ts` now
arms every health timer through one helper that records when it was armed
(`:56-64`). When the tick fires more than twice the poll interval late, the
first failure re-probes once after a three-second grace; only the re-probe's
failure starts the reconnect loop (`:81-88`). An on-time failure is untouched,
and the generation guard that discards stale callbacks is unchanged.

## The paired proof

Both arms ran the same test file under fake timers, with the clock jumped
ten minutes before the tick and the probe rejecting once then resolving
connected.

| arm | late tick, re-probe answers | late tick, re-probe also fails | on-time failure (control) |
| --- | --- | --- | --- |
| A - original hook | entered reconnect (fail) | probed once, not twice (fail) | entered reconnect (pass) |
| B - with the guard | stayed connected, no error | entered reconnect | entered reconnect |

Three of three pass on B; two of three fail on A with the assertions the
amendment predicts. Typecheck and lint were clean, and the project's own
pre-commit hooks ran on the commit.

## What the realization cannot do

The guard is a wall-clock comparison against the time the timer was armed,
so it detects a sleep only when the tick actually fires late. A host that
resumes and immediately fires an on-time tick into a network that is still
negotiating gets no grace, and a sleep shorter than one poll interval is
invisible. The re-probe grace is a constant, not derived from any measured
resume time; if the field shows resumes routinely taking longer than three
seconds to restore the network, the constant is the knob and this document
is the place it was chosen.
