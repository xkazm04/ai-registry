---
layer: application
type: application
subject: adaptive-music-authoring
technique: stem-and-voice-budget-derivation
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# Stem and voice budget derivation in a sound-effect scene without music

A VR game carries no score, but it does hold long-running looped beds beside its
one-shot effects, and it declares a simultaneous-playback budget in a data file that a
director enforces. The technique's central claim, that a held voice is a voice whether or
not anyone hears it, applies to those beds exactly as it would to music layers, which
makes the scene a place to try to break the derivation.

## What the scene declares

- **One authority, one unit.** A single data row states the global budget as 12 and says
  what it counts: one-shot voices only. Per-cue limits sit beside it, with the engine's
  own per-cue concurrency object built from the same number so the two cannot disagree.
- **Yield order is stated.** Critical cues are reserved and always admitted; the lowest
  bands are refused first when the budget binds, and the row says why raising the limit is
  the wrong repair.
- **Beds are outside the number.** The row's own note says loops are beds and are not
  counted against the budget.

## The experiment

The seam was chosen to falsify the technique's claim that the unseen terms are the ones
derivations forget: if the declared 12 were the whole answer, a peak derived from the
data would equal it. Reading the declared cue table, the peak is the budget plus the
reserved critical cues (two, one voice each) plus the looped beds (three), which is 17,
not 12. The scene's per-cue caps sum to 24 for one-shots alone, so the global 12 is the
binding term for non-critical sound, as designed.

Held against the technique:

- The reservation carries its unit, and the ordering is declared. Both held.
- The derivation's forgotten terms were present exactly where the technique predicts:
  the beds and the reserved cues sit outside the declared number, so the real peak is a
  sum no file states.
- The engine-side total is not declared anywhere in the project's config, so 17 has no
  ceiling to be compared against. The scene's authority over the total is therefore
  one level short: it owns a subtotal, and the platform default is the real limit.
- The shipped worst-case test asserts that one-shot voices never exceed the global
  budget during a four-orb volley. That bout holds no critical cue, so it cannot show
  the reserved cues pushing the count past 12, and loops are excluded by construction.

The technique held; it was not amended. The finding sits in how the scene's number is
read: a subtotal declared in one unit, with the remaining terms (reserved cues, beds)
named in a comment rather than derived in a check.

## What remains open

No project change was made. A fitting change is a test that derives
`budget + reserved critical cap + looped beds` from the data row and compares it with a
declared engine ceiling, and a declared ceiling for the target headset. Neither the
ceiling nor an instrument to read the engine's live channel count (a headless editor
run) was available, so the number the derivation would be compared against does not
exist yet. Verdict `unmeasurable`; return condition: the operator names the engine's
voice ceiling for the target device, or a headless editor can report peak live channels
in the Brennic opening.
