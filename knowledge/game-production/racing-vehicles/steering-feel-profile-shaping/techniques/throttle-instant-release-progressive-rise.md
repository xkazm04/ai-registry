---
layer: technique
type: technique
subject: steering-feel-profile-shaping
technique: throttle-instant-release-progressive-rise
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a throttle is a held touch or a stuck-button risk, shaping launch feel without delaying lift-off, deciding what a stale or lost input does to propulsion]
---

# Throttle: rise as a ramp, release as a cliff

Throttle is the one axis where the two directions of change have different consequences for safety. A throttle that rises gradually is a feel choice; a throttle that falls gradually is a vehicle that keeps accelerating after the player has let go, and on a touch device that failure is compounded by the fact that a lost finger, a dropped connection or a stalled client looks exactly like a release. The shape is therefore asymmetric by construction: the way up is rate-limited and bent, the way down is immediate.

## The procedure

Keep one filtered throttle per vehicle. Each step, take the requested throttle, optionally bent by a profile exponent. If the request is lower than the filtered value, set the filtered value to the request at once. Otherwise raise the filtered value toward the request by at most the rise rate times the step length, never past the request. The rise rate is in *full-throttle fractions per second*: three means a full launch takes a third of a second.

The optional exponent bends only the request, and is skipped when the request is exactly zero or exactly one, or when the exponent is one; the endpoints must stay exact so that release really is zero and full really is full. An exponent above one softens the low end of a partial throttle, which suits a coarse touch travel where partial throttle is hard to hold steady; leave it at one for profiles that want a direct feel.

## Why the asymmetry is the rule

A launch from standstill is where a ramp earns its keep. The raw input is a single instant, the vehicle is at its most torque-limited, and an unramped full throttle produces a lurch that reads as a bug rather than as power. A short ramp turns that into a progression the player can feel building.

Lift-off is the opposite case. When the player releases, the intent is unambiguous and the correct response is zero propulsion this step. Delaying it for the sake of symmetry with the rise means that a driver who lifts for a corner entry carries speed they did not choose, and that every transport hiccup that drops a release turns into a runaway. The cost of the cliff is a slightly abrupt deceleration feel, which is cheap and which the vehicle's own drag already softens.

The cliff is stronger than common engine practice, and that is deliberate. Widely copied vehicle samples ramp the fall too, just faster than the rise (ten against six per second for a pad), and no engine default found makes it instant. That is defensible for a physical trigger, whose release always arrives. A touch device, or any networked controller, cannot tell a lift from a lost finger or a dropped packet, and that ambiguity is what earns the cliff. Where the vehicle model transfers weight, put any smoothing of a lift on the weight transfer, as a time constant on the load shift, rather than on the throttle. That way the power still cuts in one step.

## Stale input and the safety timeout

The throttle path must treat an input that has stopped arriving as a release. A bounded mailbox that holds the latest sample, rejects out-of-order packets and reports a stale one as zero throttle and zero brake handles the case at the transport edge; the ramp must not interfere with it. Concretely: the stale cut is applied to the *request* before it enters the ramp, and because a lower request drops the filter immediately, the cut takes effect in one step. A ramp that held its previous value across a stale gap would reintroduce exactly the runaway the cliff prevents.

## Interaction with the brake

If the brake is active, propulsion is zero regardless of the filtered throttle (see the brake technique). The design question is what happens to the filter meanwhile. Two defensible choices exist. Let the filter keep tracking the request, so releasing the brake while the throttle is still held resumes at the filtered value; or force the filter to zero while braking, so that resuming restarts the ramp. The first feels like a car that was always ready; the second feels like a deliberate launch after every stop. Pick one per game and state it, because players notice the difference in a corner-exit and the trace fixture, which never brakes, cannot.

## Decision rules

- **Cliff on any reduction.** The comparison is request below filter, not request equals zero. A partial lift (full to half) is a release of that part and cuts at once to the half; ramping down to half would be a delayed release in miniature.
- **Rise rate is a per-profile field.** Lively profiles ramp quickly, stable ones slowly. Validate finite and positive; use a very large value for a transparent baseline.
- **Test the cliff exactly.** After a step with zero throttle, the filtered value equals zero, not approximately. That test is cheap and catches the most dangerous regression in the pipeline.
- **Do not ramp AI or scripted throttle by accident.** If scripted drivers share the vehicle code, state whether they pass through the ramp; a rival that launches at a different rate from a human is a fairness question, not a detail.

## When not to use it

- **For a vehicle with a modelled drivetrain and clutch.** There the engine model already supplies a rise and a fall, and a second ramp conflicts with it.
- **When the device has a real pedal.** A physical pedal has travel and a spring; shape its range, not its time.

## The failure this prevents

A symmetric smoother on every axis, copied from steering, gave a launch that felt good and a lift-off that coasted under power for a quarter of a second. Players called it floaty in corner entries; the cause was one filter applied in both directions, and the fix was a three-line asymmetry.
