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

**2026-10-13, tracking-loss-as-a-game-state applied (simulation, better).** The tree has the
technique's pause half (1.5 s at the session) and no coast or release at the ward, so a guard
outlives its hand ten times over a 0.15 s window and is undrawn while it holds. One decision rule
added: the pause bound and the coast bound are two numbers. Nothing was executed (no engine, no
kept detector port). **Return:** the same V1 device corpus; read gap lengths before choosing the
coast bound, then run the cases on a JS port.

## Architecture review 2026-10-31

First architecture review. All nine documents read; three internal inconsistencies found (golden path deferral wording, tracking-loss pause bound, tracking-loss application return condition) plus one source-backed addition (OpenXR focus loss). Overall clarify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/hand-tracked-timing-windows",
  "date": "2026-10-31",
  "baseline": "2fbbde6db",
  "digest": "sha256-b2:b5df788755fdb170",
  "disposition": "clarify",
  "trigger": "pending: no architecture-review record existed for this subject",
  "intended_benefit": "A tracked-hand reward window is judged against the motion's onset with sensor latency, confidence and loss budgeted explicitly, so the same canon width is fair on every device and runtime.",
  "failure_if_ignored": "Windows judged at classification are late by the pipeline and vary per player; widths get tuned to the author's device; rewards come from guessed poses or held wards outlive the hand.",
  "boundary": "Owns only onset recovery from a tracked sensor and what latency, confidence and loss do to a window. Window semantics, latency measurement, loss release in general and threshold storage belong to the cited neighbours; button inputs skip it.",
  "coverage": "All 9 documents (golden path, 4 techniques, 4 cpp applications) read in full. Relative links checked. Two primary sources read (OpenXR XR_EXT_hand_tracking spec source; Meta Fast Motion Mode doc). The private source tree was not reopened, nothing was executed, no device evidence exists, and no verified_on date was refreshed.",
  "counterexamples": [
    "A game whose window opens at recognition (the source's live session) loses 3.9-13.4% of guard time to a confidence deferral that costs nothing under an onset-with-horizon rule; the deferral rule holds only once the horizon exists.",
    "A single-player pause on loss needs seconds before it fires while a held ward must release inside a 0.15 s window; one bound cannot serve both.",
    "OpenXR's core hand extension exposes no scalar confidence, only per-joint tracked bits and isActive, so a confidence floor there is a derived signal.",
    "A higher-rate tracking mode (Meta FMM) reduces loss in fast motion but may increase jitter, so the onset threshold measured in one mode does not carry to the other."
  ],
  "sources": [
    {
      "url": "https://github.com/KhronosGroup/OpenXR-Docs/blob/main/specification/sources/chapters/extensions/ext/ext_hand_tracking.adoc",
      "result": "Read the XR_EXT_hand_tracking source. 'pname:time is an basetype:XrTime at which to locate the hand joints', and the sample passes 'frameState.predictedDisplayTime'; nothing in the returned struct carries a capture time or a scalar confidence. Supports the onset technique's claim that some runtimes stamp a pose with the predicted display time the game asked for. Per-joint POSITION_TRACKED bits support 'per joint where the tracker reports that detail'. 'If the returned pname:isActive is false, it indicates the hand tracker did not detect the hand input or the application lost input focus' adds a runtime-level loss mode the tracking-loss technique did not name."
    },
    {
      "url": "https://developers.meta.com/horizon/documentation/unity/fast-motion-mode/",
      "result": "Read. 'FMM optimizations may increase jitter, impacting high accuracy interactions like direct touch or typing' and 'enable it only if you observe high tracking loss due to fast hand motion'. Supports the confidence technique's rule to measure confidence and jitter in both modes before switching to a higher-rate mode. No figures quoted into the documents depend on it."
    },
    {
      "source": "Internal consistency and arithmetic across the nine documents",
      "result": "Checked: 6 samples at 72 Hz is 83 ms; phantom ranges 1.8-4.7% (A) and 1.3-5.4% (B-8) match the application's table; 1.5 s / 0.15 s is ten windows and 1.5 / 0.1 is fifteen; 84 frames at the 60 Hz kernel is 1.4 s; 0.4 m in 0.1 s is 4 m/s. All relative links resolve. Found three inconsistencies: the golden path's 'bounded few samples' deferral against the technique's rule to size the bound from dips and its free-only-where-the-verdict-waits condition; the tracking-loss technique's pause 'subject to the same coast bound' against its own later decision rule that they are two numbers; and the tracking-loss application's return condition naming 'the project's JS port' after saying no runnable port was kept."
    },
    {
      "source": "mage-arena-vr private tree (be7583a, 6aa7a57, a7b5c6d)",
      "result": "Not reopened. Application anchors are carried as quoted; no verified_on date refreshed."
    }
  ],
  "documents": {
    "hand-tracked-timing-windows.md": {
      "disposition": "clarify",
      "reason": "Sound and consistent with its techniques except one sentence: 'A brief dip should defer the decision for a bounded few samples' predates the 2026-10-10 lesson in confidence-gated-detection ('Size the bound from the dips, not from \"a few samples\"' and 'Deferral is free only where the verdict waits for it'). Align it."
    },
    "techniques/onset-recovered-from-tracking-history.md": {
      "disposition": "keep",
      "reason": "The two-phase walk, release bound, gap stop and grid-floor section are coherent and match the application. The predicted-display-time claim is supported by the OpenXR XR_EXT_hand_tracking text, which locates joints at a caller-supplied time and returns no capture time."
    },
    "techniques/sensor-latency-inside-the-window-budget.md": {
      "disposition": "keep",
      "reason": "Three quantities with three owners, the horizon derived from high-percentile latency plus hold plus one sample, and desk results labelled as models: internally consistent and correctly deferring measurement to the instrumentation subject."
    },
    "techniques/confidence-gated-detection.md": {
      "disposition": "keep",
      "reason": "The eligibility/timing split, the hold, the deferral conditions and the two-count step 5 match the application's figures exactly. The higher-rate-mode rule is supported by Meta's Fast Motion Mode documentation (FMM 'may increase jitter')."
    },
    "techniques/tracking-loss-as-a-game-state.md": {
      "disposition": "clarify",
      "reason": "Two changes. (1) State 3 says the pause is 'subject to the same coast bound so that flicker does not pause the game', contradicting the 2026-10-13 decision rule 'the pause bound and the coast bound are two numbers'; the application says the same. (2) OpenXR defines isActive false as 'did not detect the hand input or the application lost input focus'; runtime-level loss should name focus loss."
    },
    "applications/cpp--onset-recovered-from-tracking-history.md": {
      "disposition": "keep",
      "reason": "Self-labelled model/synthetic throughout, deviations recorded under 'Where the tree falls short'. Anchors at be7583a not reopened; verified_on left at 2026-10-09."
    },
    "applications/cpp--sensor-latency-inside-the-window-budget.md": {
      "disposition": "keep",
      "reason": "The classification-time deviation and missing horizon are recorded as deviations against an unchanged standard; device latency is explicitly unmeasured. Anchors not reopened."
    },
    "applications/cpp--confidence-gated-detection.md": {
      "disposition": "keep",
      "reason": "Arms, positive control and the not-better verdict are internally consistent (table ranges match the technique's quoted figures; 83 ms is six 72 Hz samples). Anchors at 6aa7a57 not reopened."
    },
    "applications/cpp--tracking-loss-as-a-game-state.md": {
      "disposition": "clarify",
      "reason": "Body says 'the earlier confidence application kept no runnable port', but the return condition says to run the cases 'on the project's JS port of the detector', which does not exist. Say the port is to be rebuilt. Otherwise sound; anchors not reopened."
    }
  }
}
```

### Re-record after applying 2026-10-31

All four clarify items applied in place; the record below is against the new digest.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/hand-tracked-timing-windows",
  "date": "2026-10-31",
  "baseline": "2fbbde6db",
  "digest": "sha256-b2:f0979baa254dabd2",
  "disposition": "keep",
  "trigger": "re-record after applying this run's clarify items",
  "intended_benefit": "A tracked-hand reward window is judged against the motion's onset with sensor latency, confidence and loss budgeted explicitly, so the same canon width is fair on every device and runtime.",
  "failure_if_ignored": "Windows judged at classification are late by the pipeline and vary per player; widths get tuned to the author's device; rewards come from guessed poses or held wards outlive the hand.",
  "boundary": "Owns only onset recovery from a tracked sensor and what latency, confidence and loss do to a window. Window semantics, latency measurement, loss release in general and threshold storage belong to the cited neighbours; button inputs skip it.",
  "coverage": "All 9 documents (golden path, 4 techniques, 4 cpp applications) read in full. Relative links checked. Two primary sources read (OpenXR XR_EXT_hand_tracking spec source; Meta Fast Motion Mode doc). The private source tree was not reopened, nothing was executed, no device evidence exists, and no verified_on date was refreshed.",
  "counterexamples": [
    "A game whose window opens at recognition (the source's live session) loses 3.9-13.4% of guard time to a confidence deferral that costs nothing under an onset-with-horizon rule; the deferral rule holds only once the horizon exists.",
    "A single-player pause on loss needs seconds before it fires while a held ward must release inside a 0.15 s window; one bound cannot serve both.",
    "OpenXR's core hand extension exposes no scalar confidence, only per-joint tracked bits and isActive, so a confidence floor there is a derived signal.",
    "A higher-rate tracking mode (Meta FMM) reduces loss in fast motion but may increase jitter, so the onset threshold measured in one mode does not carry to the other."
  ],
  "sources": [
    {
      "url": "https://github.com/KhronosGroup/OpenXR-Docs/blob/main/specification/sources/chapters/extensions/ext/ext_hand_tracking.adoc",
      "result": "Read the XR_EXT_hand_tracking source. 'pname:time is an basetype:XrTime at which to locate the hand joints', and the sample passes 'frameState.predictedDisplayTime'; nothing in the returned struct carries a capture time or a scalar confidence. Supports the onset technique's claim that some runtimes stamp a pose with the predicted display time the game asked for. Per-joint POSITION_TRACKED bits support 'per joint where the tracker reports that detail'. 'If the returned pname:isActive is false, it indicates the hand tracker did not detect the hand input or the application lost input focus' adds a runtime-level loss mode the tracking-loss technique did not name."
    },
    {
      "url": "https://developers.meta.com/horizon/documentation/unity/fast-motion-mode/",
      "result": "Read. 'FMM optimizations may increase jitter, impacting high accuracy interactions like direct touch or typing' and 'enable it only if you observe high tracking loss due to fast hand motion'. Supports the confidence technique's rule to measure confidence and jitter in both modes before switching to a higher-rate mode. No figures quoted into the documents depend on it."
    },
    {
      "source": "Internal consistency and arithmetic across the nine documents",
      "result": "Checked: 6 samples at 72 Hz is 83 ms; phantom ranges 1.8-4.7% (A) and 1.3-5.4% (B-8) match the application's table; 1.5 s / 0.15 s is ten windows and 1.5 / 0.1 is fifteen; 84 frames at the 60 Hz kernel is 1.4 s; 0.4 m in 0.1 s is 4 m/s. All relative links resolve. Found three inconsistencies: the golden path's 'bounded few samples' deferral against the technique's rule to size the bound from dips and its free-only-where-the-verdict-waits condition; the tracking-loss technique's pause 'subject to the same coast bound' against its own later decision rule that they are two numbers; and the tracking-loss application's return condition naming 'the project's JS port' after saying no runnable port was kept."
    },
    {
      "source": "mage-arena-vr private tree (be7583a, 6aa7a57, a7b5c6d)",
      "result": "Not reopened. Application anchors are carried as quoted; no verified_on date refreshed."
    }
  ],
  "documents": {
    "hand-tracked-timing-windows.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the confidence paragraph's 'defer the decision for a bounded few samples' now reads as a bound sized from the dips the tracker produces on a correct pose, and states that deferral is free only where the verdict waits for a resolution horizon, matching confidence-gated-detection. Boundaries, four timestamps and the naive-build list are otherwise sound and match the techniques."
    },
    "techniques/onset-recovered-from-tracking-history.md": {
      "disposition": "keep",
      "reason": "The two-phase walk, release bound, gap stop and grid-floor section are coherent and match the application. The predicted-display-time claim is supported by the OpenXR XR_EXT_hand_tracking text, which locates joints at a caller-supplied time and returns no capture time."
    },
    "techniques/sensor-latency-inside-the-window-budget.md": {
      "disposition": "keep",
      "reason": "Three quantities with three owners, the horizon derived from high-percentile latency plus hold plus one sample, and desk results labelled as models: internally consistent and correctly deferring measurement to the instrumentation subject."
    },
    "techniques/confidence-gated-detection.md": {
      "disposition": "keep",
      "reason": "The eligibility/timing split, the hold, the deferral conditions and the two-count step 5 match the application's figures exactly. The higher-rate-mode rule is supported by Meta's Fast Motion Mode documentation (FMM 'may increase jitter')."
    },
    "techniques/tracking-loss-as-a-game-state.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: (1) the lost-state pause is now 'subject to its own pause bound, longer than the coast bound', matching the decision rule that the two are separate numbers; (2) runtime-level loss now names the application losing input focus, from the OpenXR isActive definition."
    },
    "applications/cpp--onset-recovered-from-tracking-history.md": {
      "disposition": "keep",
      "reason": "Self-labelled model/synthetic throughout, deviations recorded under 'Where the tree falls short'. Anchors at be7583a not reopened; verified_on left at 2026-10-09."
    },
    "applications/cpp--sensor-latency-inside-the-window-budget.md": {
      "disposition": "keep",
      "reason": "The classification-time deviation and missing horizon are recorded as deviations against an unchanged standard; device latency is explicitly unmeasured. Anchors not reopened."
    },
    "applications/cpp--confidence-gated-detection.md": {
      "disposition": "keep",
      "reason": "Arms, positive control and the not-better verdict are internally consistent (table ranges match the technique's quoted figures; 83 ms is six 72 Hz samples). Anchors at 6aa7a57 not reopened."
    },
    "applications/cpp--tracking-loss-as-a-game-state.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the return condition now runs the cases on a JavaScript port of the detector rebuilt for the purpose, since the body says the confidence application kept no runnable port. Simulation verdict, falsifiers and the two-bounds lesson otherwise sound; anchors at a7b5c6d not reopened, verified_on unchanged."
    }
  }
}
```
