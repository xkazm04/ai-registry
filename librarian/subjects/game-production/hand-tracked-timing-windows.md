---
domain: game-production
subject: hand-tracked-timing-windows
last_touched: 2026-10-09
touched_by: forge
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
