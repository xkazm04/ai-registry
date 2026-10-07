---
domain: game-production
subject: on-device-verification-harness
last_touched: 2026-10-07
touched_by: forge
dry_streak: 0
depth: L1
---

# on-device-verification-harness

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-07 - `/forge`, extension (run `forge-p9p10-1007`, branch `autopilot/technical-decision-capture-4b08c178`)

First note for this subject. One technique added, `attribute-every-stall-before-judging-it` (8 techniques now):
an independent host heartbeat clears or convicts the harness, per-request timers on the device's render thread
name every slow frame, and an unattributed slow frame is reported as an instrument gap. The golden path gained one
paragraph under "The instrument is part of the experiment". One process application against `firetv-deathride` at
`4bbae5d2`, 18 anchors held.

**Source.** Death Ride P9 and P10 (2026-10-07, one AFTKM stick, all runs **profiled**): 10 of 10 host pump stalls
(104.8–731.2 ms) in P9 and 6 of 6 (154–835 ms) in P10 started within 0.6–2 s of the probe's own `dumpsys meminfo`
and `thermalservice` sample, while the heartbeat worker recorded 0 stalls in every run; the host was at 85–100% CPU
from other sessions except one run start at 35–44%, the only run with no stall. P10's request timers attributed every
render over 100 ms to a car, start or finish request, a neighbour whose interval contained one, or a catch-up step.

**Upward lessons from the source.** The I2 budget had already required asynchronous memory sampling and the probe
uses the promise form of `execFile`; the stalls still coincided with the samples, so the draft's "move the probe off
the loop" became "an asynchronous interface is cleared by the heartbeat, not by its signature" (mechanism not
isolated — stated as correlation). A request's cost shows up in its own frame, the next interval and any catch-up;
those are one cause. Record host load per run.

**Outside hardening (research worker, quotes re-fetched).** Node's child-process and `perf_hooks` docs (sync spawn
blocks; the loop-delay histogram runs on the same loop); an Android engineer on LKML on PSS collection's 200–300 ms of
system work; Perfetto's frame timeline. Node documents async `spawn` as non-blocking, which is why the application
claims correlation, not mechanism. **Headset reach:** holds unchanged — Meta's stale-frame count is a platform-side
witness, and its Perfetto guide warns of tracing overhead; no headset harness was run.

**Deviations recorded.** The probe was not moved in either session; no injected stall proved the heartbeat can fire;
the pump flags lateness over 100 ms but the heartbeat only gaps over 150 ms; the request timers are self-reported.

**Open, with return conditions.**
- **Move the sampling off the pump loop.** **Return:** one run with sampling in its own process and the stall count.
- **A known positive for the heartbeat.** **Return:** an injected host stall that the heartbeat reports.
