---
layer: application
type: application
subject: combat-pacing-and-dramatic-arc
technique: intensity-and-threat-tension-curve
stack: node
status: forged
---

# The tension curve in a browser-side encounter simulator

A TypeScript encounter simulator in the `pof` project builds the curve as a pure
module, `src/lib/combat/tension-curve.ts`, consumed by the choreography simulator in
`src/lib/combat/choreography-sim.ts`.

## The model

`computeTensionCurve` (`tension-curve.ts:100`) takes a flat list of
`{ timeSec, source, target, damage, isCrit }` events plus `totalDurationSec`, `playerMaxHp`
and `playerDied`, and returns samples, beats, `peakTension`, `climaxTimeSec`, `dynamicRange`
and a one-line `summary`.

- **Basis, declared as defaults** (`:101-102`): `sampleStepSec` 0.5s, `windowSec` 2s, halved
  into a symmetric `half` so the window is centred on the sample. The 2s window is chosen to
  match the choreography sim's 2s alert buckets (`choreography-sim.ts:292`) — the same
  agreement rule the technique states, made explicit in the file's header comment.
- **Intensity** (`:115`): `flux += e.damage * (e.isCrit ? 1.35 : 1)` over every event inside
  the window. Both directions of damage count.
- **Threat** (`:118-120`): player health is reconstructed by accumulating only events with
  `target === 'Player'`, giving `hpFrac`, and `threat = 1 - hpFrac`.
- **Blend** (`:124-128`): `0.45 * intensity + 0.55 * threat`, then
  `if (hpFrac < 0.25) tension += 0.18` — the near-death emphasis. This is the nonlinearity the
  technique calls for; the comment on the line names it as such.
- **Smoothing** (`:131-142`): a radius-1 moving average on `tension` only. `intensity`,
  `threat` and `hpFrac` are emitted unsmoothed in the same sample, which is what lets the
  dead-zone detector work on raw flux later.
- **Spread over the interior** (`:150-153`): `dynamicRange` drops the first and last samples
  because edge windows integrate fewer events. The technique's rule about excluding edge
  windows from spread statistics is this line.
- **Purity** (header comment, `:12`): "Pure + deterministic (no wall-clock / RNG): same input
  → same curve." The module is unit-testable and screenshot-stable as a consequence.

## The deviation the standard does not lower

`:125` computes `intensity = flux / maxFlux`, where `maxFlux` is the maximum observed **in
this encounter**. That is self-normalization, and the technique forbids it. The consequence is
live in the file: every encounter with any activity peaks at intensity 1.0 somewhere, so
`peakTension` is not comparable between two encounters, and a trivial fight and a lethal one
can both report a 90% climax. Inside a single fight the shape is still correct, which is why
the defect is invisible in use — the beats fire sensibly and the summary reads well. The fix
is to divide by a fixed external reference (effective player HP per second at intended
difficulty) and keep the observed maximum only as a diagnostic. Until then, `peakTension`
should be read as within-fight and never charted across encounters.

## Beat detection over the same samples

`detectBeats` (`:164`) applies the taxonomy, and each rule lands on the signal the technique
prescribes:

- **Climax** (`:175`): global max where `peakTension >= 0.2` — an existence threshold, not a
  placement judgment.
- **Near-death** (`:180`): regions where `hpFrac < 0.25`, detected on the threat side, one
  beat at each region's lowest point.
- **Comeback** (`:184-190`): the region ends before `duration * 0.8`, the player did not die,
  and at least one player-sourced event occurs after the recovery point — the continued-action
  test.
- **Breather** (`:194-206`): a local minimum tested against `prefixMax` and `suffixMax`, both
  needing to exceed the valley by more than 0.2, with a 3s minimum spacing between breathers.
  Prominence, not depth.
- **Dead zone** (`:208-216`): runs where `blended[i].flux === 0` lasting at least 2s, and
  bounded — `events.some(e => e.timeSec < t0) && events.some(e => e.timeSec > t1)` — so a quiet
  head or tail does not fire.
- **Anticlimax** (`:218-226`): `duration > 6`, `peakTension >= 0.3`, climax in the first 60% of
  samples, and the last 15% averaging below half the peak.
- **Flat pacing** (`:228-230`): `duration > 5 && dynamicRange < 0.18`.
- **The activity gate** (`:144`, `:155-159`, `:255`): `hasActivity = maxFlux > 0`; with no events the
  beat list is empty and `buildSummary` returns "No combat activity to pace." rather than
  emitting a confident set of pacing defects about a fight that never happened.

## Where the curve meets the envelopes

`choreography-sim.ts:269-313` runs the duration checks on the same timeline before invoking the
curve: player death under 5s is `critical` ("too punishing") while a later death is only a
`warning` ("survival not guaranteed"); over 45s is spongy; under 3s with enemies present is
trivial; combined enemy HP over 5x the player's effective HP is tedious. The 2s buckets at
`:292-312` then read both tails — an over-full bucket (enemy damage above 40% of effective
player HP) is a `critical` burst spike reported as a percentage of health, and an entirely
empty bucket is an `info` dead zone. Only the two curve beats with no bucket-level equivalent,
`anticlimax` and `flat-pacing`, are promoted into the alert list at `:323-329`; dead zones are
deliberately not promoted twice.
