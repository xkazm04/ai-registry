---
domain: game-production
subject: hand-tracked-timing-windows
last_touched: 2026-10-10
touched_by: intake
dry_streak: 0
depth: L1
---

# hand-tracked-timing-windows

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-09 - `/forge`, founding (run `b78a2519`, branch `autopilot/accepted-idea-delivery-b78a2519`)

This is N2 of `docs/subject-proposal-immersive-interaction.md`, a Phase-1 draft at status
`draft`. It is the second subject of the `immersive-interaction` ring. Order: expert draft,
outside hardening, then reconciliation against `mage-arena-vr` `master` at `be7583a`, read-only.

The one-copy split is kept. The subject owns only how an onset is recovered from a tracked
sensor. The general rule that a window is judged from the input's onset stays with
`realtime-combat-semantics` as a later EXTENDS, and that subject is not edited here. Three
rules are cited and not restated: measurement from `controller-latency-instrumentation`, loss
release from `neutralise-on-every-loss-path`, and widths in data from
`canon-as-single-source-of-thresholds`.

**Depth L1.** Four techniques and two cpp applications. There is one source tree and no device.
Every figure is a model (held or extrapolated 30 and 25 Hz camera streams) or synthetic (72 Hz
procedural clips).

**Outside hardening.**
- Published headset hand-tracking latency is widely spread: about 45 ms against motion
  capture, 14-230 ms against a robot arm, and about 70 ms against about 128 ms in one
  informal frame-count comparison. That spread is why the subject demands a measured, labelled
  figure per device and runtime.
- Velocity-threshold onsets are biased late, and a two-threshold backward search corrects it.
- Shipped hand-tracking games suspend release checks under low confidence, wait several frames
  after re-acquisition and freeze or colour the hand on loss. A fast-motion tracking mode
  trades loss for jitter.

**Upward lessons from the source.**
- **The settle trap.** The walk back meets stillness before motion. Bridge a bounded,
  measured settle tail only while the hand is in the pose region, then walk the fast region.
- **Bound the walk.** Stop at the last lowering, and for a first raise at the first sample
  seen in the lap.
- **Freshness.** A hand first seen already raised is not fresh.
- **Re-sent poses.** A re-sent pose carries the last measured speed.
- **Speed span.** Speed is measured over one camera period and along the motion's direction.
- **The grid is the error floor.** Once the onset is recovered, the sweep shows no latency
  dependence, and a strict ±1-frame bar fails on the grid alone.

**Deviations recorded.**
- The live session judges the perfect at the raise event, and the recovered onset feeds only the
  tests' resolver.
- No detector reads confidence or tracking state, although the clips carry `conf`.
- The tracking-loss pause is planned for V3 and is not built.
- There is no capture timestamp, because the runtime stamps predicted display time.
- Device latency is unmeasured.

**Open, with return conditions.**
- **Onset in the live session.** **Return:** the session back-dates the fresh tick, with a
  replay showing the perfect count against injected latency.
- **Device latency.** **Return:** the flash-method figure at V2 (8 Nov) with n, date, device,
  runtime version, build and command.
- **`confidence-gated-detection` and `tracking-loss-as-a-game-state` have no application.**
  **Return:** a detector that reads confidence, and the loss state built (V3).
  *(2026-10-10: `confidence-gated-detection` has been applied as an experiment; see below.)*

### 2026-10-10 - `/intake apply confidence-gated-detection` (run `intake-apply-cgd-1010`)

First application of `confidence-gated-detection`, an experiment on `mage-arena-vr` `master`
at `6aa7a57`. It reached `not-better` with `proof: ab-paired`, and the applied row is in the
project's `.ai/applied.jsonl` (pushed). The instrument was a line-for-line port of the ward
detector and the absorb resolver. It reproduced 22/22 values of the suite's own timing report
before any arm was read. The corpus was 28 raises, each with one confidence dip near the confirm
frame, giving 9,960 trials per arm at each confidence level.

**The seam was chosen to falsify two claims.**
- The first claim was that deferral costs the player nothing. The live session opens the window
  at the raise event, so it could break here. It did: on dips the tracker got right, a deferral
  cost 3.9-13.4% of guard time.
- The second claim was that a reward from below the floor is the defect to count. The eligibility
  gate took that count to zero, and phantom perfects did not move (1.3-5.4% against 1.8-4.7%).

**What landed.** The technique gained four things:
- the timing gate as a hold, which cut phantoms to 0.2-0.5%;
- the condition that deferral is free only when the verdict waits for it;
- a deferral bound sized from the observed dips (three samples lost 20% of perfect time on
  six-sample dips);
- a second count in step 5.

Two decision rules were added. The asymmetry the forge run named shows up again here: the tests
judge on onset and the live session judges at recognition. That split is now a measured cost,
not only a deviation.

**Open.**
- **Onset in the live session** stays first in the ship order. Gating before it moves the window.
- **Device corpus.** **Return:** at V1 (4 Nov), read the dip lengths and the pose error per
  confidence band before choosing the floor (0.2 here, a guess) and the bound.
