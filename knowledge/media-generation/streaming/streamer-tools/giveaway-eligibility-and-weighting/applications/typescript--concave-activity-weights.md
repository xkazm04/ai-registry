---
layer: application
type: application
subject: giveaway-eligibility-and-weighting
technique: concave-activity-weights
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0
---

# Concave activity weights: Castle Control's weight curve and equalizer card

Castle Control is a desktop toolkit a human streamer runs beside Twitch and OBS. Its
giveaway module computes entry weights in Rust (`crates/cc-lots/src/weights.rs`) and shows
them to the streamer on the lottery room's "Weight & cap equalizer" card, a TypeScript model
that mirrors the Rust curve byte for byte. Citations were resolved on 2026-11-02 against the
main checkout (root `package.json` pins `"typescript": "6.0.3"`).

## The curve: base equal to the cap

`crates/cc-lots/src/weights.rs:8-9` "Integer diminishing increments: c, c-1, ..., 1, then
zero. Baseline c; weight(n) = c + n(2c - n + 1)/2, n=min(units,c)." and the implementation at
`crates/cc-lots/src/weights.rs:26` "c + n * (2 * c - n + 1) / 2". The UI mirror states its contract and repeats the
integer division: `apps/desktop/src/rooms/lottery/equalizer-model.ts:33` "Mirrors
crates/cc-lots/src/weights.rs WeightCurve::weight exactly" and `apps/desktop/src/rooms/lottery/equalizer-model.ts:39`
"return c + Math.floor(n * (2 * c - n + 1) / 2);".

The baseline of `c` rather than one is the **upward lesson** this tree gave the technique.
At cap 4 the newcomer weighs 4 and the heaviest entrant 14, so four newcomers outweigh it;
at cap 8 the figures are 8 and 44, so six do. With a baseline of one the same increments
would give 11 and 37, and the ratio would grow with the square of the cap.

## The number the room is told

`crates/cc-lots/src/weights.rs:43` "Smallest number with strictly greater combined weight;
absent for no entries." computed at `crates/cc-lots/src/weights.rs:53` "heaviest_weight / newcomer_weight + 1" — integer
division plus one, so a tie never counts as outweighing (the technique's draft said "rounded
up" and was corrected to this). The TypeScript side keeps the same rule
(`apps/desktop/src/rooms/lottery/equalizer-model.ts:64` "Same rule as cc-lots WeightTable::new: heaviest / newcomer + 1")
and labels where the heaviest figure came from (`apps/desktop/src/rooms/lottery/equalizer-model.ts:70-71` "Without entries
(a core draw before sealing) the heaviest figure is the curve's own ceiling."), which the
copy turns into a sentence: `apps/desktop/src/rooms/lottery/equalizer-copy.ts:34`
"Heaviest figure is the curve ceiling. The core publishes the frozen weight table after sealing."
The headline reads the ratio out with its arithmetic (`apps/desktop/src/rooms/lottery/equalizer-copy.ts:31` "headline:").

The card draws the curve as steps against a linear reference (`apps/desktop/src/rooms/lottery/equalizer-model.ts:13-14`
"Linear reference: every unit worth the first unit's gain.") and, for the simulated pool,
each cohort's head share beside its weight share (`apps/desktop/src/rooms/lottery/equalizer-model.ts:87` "Head count versus
weight held, per cohort"). Money is excluded in the type comment and in the copy:
`apps/desktop/src/rooms/lottery/equalizer-model.ts:8` "Activity units (chat activity, never money)." and
`apps/desktop/src/rooms/lottery/equalizer-copy.ts:9` "Money never adds weight.". A free path overrides the curve visibly:
`apps/desktop/src/rooms/lottery/equalizer-model.ts:29-30` `effectiveCurve` returns `{ kind: 'equal' }` when
`free_join_equal_odds`, and `apps/desktop/src/rooms/lottery/equalizer-copy.ts:36` "Free !join path is on: every entry gets
equal odds, so the curve is flat."

## Deviations

- **No ceiling on the ratio in the core.** The technique refuses a curve whose
  newcomers-to-outweigh number exceeds a stated ceiling. Only the card's stepper bounds the
  cap: `apps/desktop/src/rooms/lottery/equalizer-model.ts:22-24` "The contract accepts max_units 1..65535" with
  `max_units_range = Object.freeze({ min: 1, max: 8 })`. Another client can submit a cap the
  card would never offer; `crates/cc-lots/src/weights.rs:14-17` rejects only zero.
- **Live activity is unmeasured.** `crates/cc-core/LIVE-PIPELINE.md:111` "activity weighting
  and raid cohorts are not inferred" — on the live path every entrant sits at the base, so a
  concave curve chosen on the card does nothing live. That fails safe for weight; the card's
  copy describes the simulated pool (`apps/desktop/src/rooms/lottery/equalizer-copy.ts:44` "Cohorts are not part of the core
  roll, so no cohort split is shown here.") but does not yet say the curve itself has nothing
  to act on in a live roll.

Confirmed on the width rule: the proof format holds a weight in 32 bits and the seal refuses
rather than truncates (`crates/cc-lots/src/draw.rs:255` "proof weight exceeds u32"); with a
16-bit cap the largest concave weight, about 2.1 billion at cap 65535, still fits.
