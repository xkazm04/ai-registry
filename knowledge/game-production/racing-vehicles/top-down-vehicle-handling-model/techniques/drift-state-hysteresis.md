---
layer: technique
type: technique
subject: top-down-vehicle-handling-model
technique: drift-state-hysteresis
status: forged
laws: [declaring-an-input-is-not-consuming-it, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a drift or slide indicator flickers, deciding what a drift flag should drive, adding a handbrake that holds a slide, choosing entry and exit slip thresholds]
---

# Drift-state hysteresis

The named concern: turning a continuous slip angle into a discrete *drifting* state that
effects, scoring and audio can read, without the state chattering at the boundary. The
continuous physics already produces slides; this technique decides when the game declares one.

## Two thresholds, one gap

A single threshold flickers. A car sliding at the boundary crosses it upward and downward on
alternate steps, and every effect hung on the flag stutters. The remedy is the standard one:
**enter at a larger slip angle than the one at which the state is left.** In the simulation
this technique was drawn from the entry is about 0.22 radians (a little over twelve degrees)
and the exit about 0.10 (under six), so a slide has to open wide to begin and close nearly to
alignment to end. The gap between them is the hysteresis band, and it should be wide enough
that ordinary noise in slip, from a wobble in the stick or a rumble strip, cannot cross it in
one step.

Two further conditions make the state honest.

- **A minimum speed.** Below a few metres per second the slip angle is dominated by tiny
  velocity components and the state must be forced off. The same threshold used to zero slip
  in the yaw law is the right guard here, or a car creeping sideways out of a collision counts
  as drifting.
- **A held handbrake overrides the exit threshold.** While the player holds a deliberate
  slide button, the state does not drop merely because slip has closed; it drops when the
  button is released and slip is below the exit value, or when speed falls under the minimum.
  Without this clause a held slide at a shallow angle would turn the state off while the
  player is plainly still drifting.

## Evaluate after the physics, from the post-step slip

The state is a function of the slip *after* integration, not before, and it is computed in the
same step so a consumer reads a coherent car: heading, velocity and flag from one instant.
Computing it from the pre-step slip makes the flag lag the visible slide by one step, which at
a fixed sixty steps per second is invisible and in a variable-rate loop is not.

## The decision a practitioner makes first: does the flag feed back?

This is where a drift model forks, and the fork should be taken on purpose.

- **A presentation flag.** It drives smoke, skid marks, audio, camera, a score multiplier. The
  forces never read it. The physics stays continuous in slip, so there is no mode switch and no
  discontinuity to tune. Hysteresis only has to keep the *effects* steady.
- **A mode that changes the forces.** The state selects a different grip, drag or steering law.
  This is the older, more explicit arcade drift, and it works, but it adds a discontinuity at
  the threshold that the hysteresis is now load-bearing for: a flicker is a flicker in the
  car's behaviour, not only in its smoke.

Prefer the presentation flag unless the design needs a distinct driving mode. It is the cheaper
and safer reduction: the handbrake and the throttle already change the continuous laws, and
slides arise from them without a mode. Whichever is chosen, document it in the model's
interface; a flag that is read by nothing but an effect, and is assumed by every reader to
change the handling, is a defect in the documentation and eventually in the tuning.

## Procedure

1. **Name the consumers of the flag before writing it.** If the list is empty, delete the flag;
   if it is only effects, say so in the comment on its declaration.
2. **Set entry above exit, and set both from a table in radians** with the minimum speed in
   metres per second beside them.
3. **Reset the state wherever the car is reset:** restart, respawn, wreck, and any scripted
   freeze. A stale `true` makes a parked car smoke.
4. **Write three tests.** A sustained provoked slide turns the state on; the state is still on
   when slip has closed to between the two thresholds; and after release and settling it turns
   off. Add the stale-input case if the slide button can be left pressed by a disconnected
   controller.
5. **Test the band, not just the ends.** Hold slip inside the band from above and from below and
   assert opposite states; that is the proof of hysteresis, and a test that only checks the ends
   would pass a model with a single threshold.

## Decision rules

- **When the flag flickers, widen the band by lowering the exit value.** Do not add a timer;
  a timer is a second state with its own tuning and hides the same defect.
- **When effects start late, lower the entry value,** and expect more false positives from
  collisions; add the minimum-speed guard rather than raising the entry again.
- **When the design wants the player to *hold* a slide, make the handbrake override the exit.**
  When it wants slides to be short and reactive, do not.
- **When two systems need different thresholds** (smoke wants early, score wants late), declare
  two flags with two bands. One flag serving two purposes is tuned for neither.

## Measured, simulated, authored

The three-test sequence runs in a simulation and is the verified part. That a player perceives
a steady, trustworthy slide indicator, and that twelve degrees is the right place to start one,
is authored; the numbers carry no human witness.

## When not to use this

- **For a game with no slide-driven effect or score.** The state has no consumer and is dead
  weight with a reset obligation.
- **For a continuous measure that a consumer can use directly.** An effect that scales with the
  slip angle needs no flag, and smoothing the slip is simpler than gating it.
- **As the only guard against nonsense slip.** A hysteretic flag over an unbounded or noisy
  slip estimate stays steady and wrong; fix the estimate first.
