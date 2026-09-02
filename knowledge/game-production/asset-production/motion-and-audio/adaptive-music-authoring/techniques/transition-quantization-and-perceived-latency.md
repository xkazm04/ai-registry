---
layer: technique
type: technique
subject: adaptive-music-authoring
technique: transition-quantization-and-perceived-latency
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [the music ignores the player or lurches, choosing a quantization boundary for a music transition, a transition that sounds right in a quiet test lurches under load]
---

# Transition quantization and perceived latency

## The concern

A music transition is scheduled against a grid measured in beats and bars, and judged by a
player whose patience is measured in milliseconds. Those are two clocks with no fixed
relationship — the ratio between them is the tempo — and every failure in this area is a
failure to reconcile them.

The two failures bracket the craft. **The music ignored me:** the state changed, the score
waited for a boundary too far away, and by the time it responded the player had stopped
connecting the two. **The music lurched:** the score responded immediately, entered off
the beat, and the player heard a mistake rather than a response. Both are worse than the
other's cure, which is why neither "always quantize" nor "never quantize" is a policy.

## The two budgets, with their units and bases

**The attribution window is wall clock.** A musical response beginning within roughly
**500 ms** of the state change is attributed by the player to their own action. Past about
**one second** the attribution is gone: the change still happens, and it reads as weather
rather than as an answer. These are perceptual figures about players, stable across
projects, and they belong to the action class rather than to the piece — a boss reveal may
take two seconds and read as ceremony, where a hit reaction taking two seconds reads as
broken.

**The grid is tempo-relative.** In common time at 120 beats per minute a beat is 500 ms, a
half-bar is 1000 ms, a bar is 2000 ms, a four-bar phrase is 8000 ms. Every one of those
numbers moves with the tempo, so a boundary choice that fits the window at one tempo may
not at another, and a score with segments at different tempos must be checked at each
([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).

## The rule

**Quantize to the coarsest boundary whose worst-case wait fits the action class's
attribution window.**

Worst case, not average. The player who triggers a change one tick after a downbeat waits
the *entire* period of the boundary, and that is the case they will describe when they
report the music feels dead. Halving the period because "on average it's fine" is the same
arithmetic error as sizing a queue by mean arrival rate.

The boundary hierarchy, coarse to fine: composed exit marker, phrase, bar, half-bar, beat,
sub-beat, immediate. Prefer the coarsest that fits, because coarser boundaries let the
composer write the transition rather than letting the scheduler cut one.

## When nothing fits, cover the gap

At 120 beats per minute, a bar-quantized combat entry has a worst case of 2000 ms against a
500 ms window. It is four times outside, and no tuning closes that.

The wrong fix is to quantize finer. Beat-quantized harmonic entries land mid-bar, which is
exactly the lurch the quantization existed to prevent, and the score now costs the same and
sounds worse.

The right fix is to **cover the gap with an immediate, unpitched accent** — a hit, a swell,
a percussive stab — and let the harmonic change land on the bar where it belongs. An
unpitched accent cannot be harmonically wrong, so it can fire on any frame; it is instantly
attributable, so the player's response is answered inside the window; and the real
transition arrives on the grid with its musicality intact. Two events, two clocks, each
satisfied on its own terms. This is the single highest-leverage move in the technique and
it is almost never in a first implementation.

## The commit horizon

Under both clocks sits a floor nobody tunes away. Output buffering costs on the order of
tens of milliseconds — a two-thousand-sample buffer at a common playback rate is about
**43 ms** — and a request has to cross from the game's thread to the mixing thread before
it can be scheduled at all. Together these define a **commit horizon** in front of every
boundary, conservatively one full buffer period plus one game frame, and a request arriving
inside that horizon cannot be honoured on that boundary.

The rule: **a request inside the commit horizon is scheduled on the next boundary, never
started early.** The naive implementation clamps a late request to *now*, and *now* is the
lurch — reliably, at exactly the dramatic moment the transition existed for, because that
is when the game thread is busiest and the request is most likely to be late.

Two corollaries. The scheduler is told the boundary the caller *wants*, and reports back
the boundary it actually used; a scheduler that silently substitutes has removed the only
signal that would have found the problem. And the horizon is stated as a number in the
build's configuration, because it depends on the buffer size, which depends on the
platform — a declared headroom that nothing checks is a wish
([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)).

## A transition already in flight

The state can change again during an overlap, and it does so most often in exactly the
place the score cares about: a fight is fading out over four bars and one straggler wakes
up. The reflex is to cancel the outgoing transition and start the incoming one from the
top, which restarts material the player has already heard and reads as a stutter.

The rule: **a reversal during an overlap resumes the interrupted state in progress; it
never restarts it.** The crossfade runs backwards from wherever it had reached, the layer
that was fading returns to full, and nothing re-enters at its own beginning. Two things
follow: the reversal decision is evaluated on a musical boundary inside the overlap rather
than on the frame the state changed, so the reversal is itself on-grid; and the condition
for reversing is stated against the same signal and the same thresholds the mapping uses,
not against a second, looser test written for the transition code.

## What must never be quantized

- **A stop.** Death, a cutscene taking over, a pause: the player has left the musical
  context, and waiting two beats to acknowledge it is the most conspicuous latency in the
  whole system.
- **A gain ramp within a layer set.** Instant response is what layering is *for*.
  Quantizing a layer ramp makes layering feel as sluggish as resequencing while still
  paying layering's voice cost, which is the worst available combination.
- **An accent covering a gap.** By construction it fires immediately; quantizing it
  reintroduces the gap it existed to cover.

## Proving it

A transition that is correct in a quiet test and wrong under load is the normal outcome,
because the commit horizon is only missed when the game thread is busy. So the measurement
is taken under load: log the requested boundary, the boundary the scheduler used, and the
delta between the declared boundary time and the first sample actually rendered. A non-zero
delta is a defect even when it is inaudible on the machine it was measured on, because the
margin it consumed belonged to a slower one.

A transition path never exercised is *not measured*, not passing
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)), and the report
states how many of the declared paths the run actually took — a scheduling test that
exercised two of eleven transitions and reported clean has reported almost nothing.

## When not to use this

- **When there is no grid.** A freely-timed ambient bed with no pulse has no boundaries to
  quantize to; crossfade on wall clock and say so in the declaration rather than inventing
  a tempo to quantize against.
- **When the transition is a hard cut by design.** A scene change that cuts picture and
  sound together does not want a musical boundary; it wants the same frame the picture
  cuts on.
