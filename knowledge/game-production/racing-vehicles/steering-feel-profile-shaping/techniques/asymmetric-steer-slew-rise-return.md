---
layer: technique
type: technique
subject: steering-feel-profile-shaping
technique: asymmetric-steer-slew-rise-return
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a steering target jumps faster than a thumb or a vehicle can follow, release of the touch snaps the vehicle straight, choosing separate build-up and return rates per feel profile]
---

# Asymmetric steering slew: one rate out, a faster rate back

A touch axis is a step machine. A tap lands at some deflection in one frame and a release returns to zero in one frame, and a vehicle fed those steps directly turns in with a jerk and straightens with another. The remedy is a slew limit: the value the vehicle sees chases the shaped target, moving at most a stated amount per second. The craft is that two rates are needed, not one, and that choosing which of them applies at a given instant is a decision with a right and a wrong answer.

## The procedure

Hold one piece of state per vehicle: the filtered steer. Each step, compute the difference between the shaped target and the filtered value, clamp that difference to plus or minus the chosen rate times the step length, and add it. The units are *full-lock fractions per second*: a rise of four means a full deflection takes a quarter of a second to reach; a return of eight means a full release takes an eighth. State the unit in the table header, because a bare "ten" is meaningless without it.

The rise rate governs building a turn; it forgives a jabbed thumb, because a spike is spread over several frames. The return rate governs unwinding; it is faster because a player who lifts a thumb means *straight now*, and a slow return reads as the vehicle ignoring the release. A return of twice the rise is a reasonable starting point, and it is what a widely copied engine vehicle sample hard-codes for both analog and keyboard steering. Treat it as a start, not a norm. Shipped titles disagree: some expose a single steering speed with no separate return, and at least one simulation's manual advises a keyboard return *slower* than the rise. Both suit a model whose own self-aligning behaviour already does the unwinding. The faster return is argued for a touch release, where letting go is the intent. A profile that wants a lively feel raises both; a stable one lowers the rise and keeps the return brisk.

## Choosing the direction

The naive rule selects the return rate when the target is exactly zero and the rise rate otherwise. It handles release to centre and nothing else, and its defect shows in easing off: a player at full lock who relaxes to a third of lock has a target that is still non-zero, so the slow rise rate applies to a movement that is *toward* centre. The vehicle straightens at the build-up pace and feels sticky.

The rule that matches the intent chooses by the direction of the magnitude: if the target's magnitude is lower than the filtered magnitude, or the signs differ (a reversal passes through centre), use the return rate; otherwise use the rise rate. A sign flip is a return followed by a rise, and the filter will run it that way if the rule is applied each step. This costs one comparison and removes the sticky-ease defect *at the input*. In one measured case, on a simulated couch racer across four profiles and eleven vehicle setups, the rule shortened input lag on every partial ease and reversal (by one to eight frames, growing with the gap between the two rates). The vehicle's yaw settled faster in about half of those runs, no differently in most of the rest, and more slowly in roughly one in eleven, all on the livelier profiles. So trace the ease and reversal patterns on a profile before trusting the rule to improve it; a step, ramp and release fixture never exercises them. Where the exact-zero rule is retained, say so in the profile documentation and treat partial release as not covered by the return rate.

## Decision rules

- **Two named fields, never one.** Rise and return are separate profile fields, each validated finite and positive. A single "smoothing" number cannot express the asymmetry that is the technique's whole value.
- **A very large rate is the off switch.** A rate so large that one step covers the full range makes the filter transparent. Use it deliberately for a baseline profile (see the preserved-baseline technique) rather than adding a boolean, so there is one code path.
- **Rate-limit the target, not the vehicle's yaw.** Yaw already has a response constant in the handling model; stacking a second smoother on the same signal adds delay without a name. The slew is about the *input*; the response constant is about the *vehicle*.
- **Reset the state at session boundaries.** The filtered value is state; a reset of the race must reset it to zero, and a test should assert that.
- **Never let the limit lengthen a safety release.** The slew applies to steering. A stale or disconnected input zeroes throttle and brake outright; it must not wait for a ramp.

## How it is judged

The slew shows up in the turn-in time of a step trace (the rise rate sets a floor on it) and in the settle time after release (the return rate sets it). It does not show up in saturated radius or slip, because by then the filter has converged. Accept a slew change on the two time columns and require the other two to be unchanged; if radius or slip moves, something other than the slew changed.

## When not to use it

- **When the input device already slews.** A physical wheel with real inertia and centring force has its own dynamics; a second limiter makes it feel remote.
- **For a one-button digital steer, unless the ramp is the design.** There the slew is the entire analog feel and its rise rate should be the first thing tuned, not an afterthought.
- **At very high rates of update from a stable client.** If the client already sends a smoothed axis, shaping again means the same signal is smoothed twice; apply it in one place, the core.

## The failure this prevents

A vehicle that snaps straight on release is blamed on grip, and the fix attempted is more stability assist, which makes the vehicle heavier everywhere. The cause was an unlimited return. The opposite report, that the car "sticks" when a driver eases off, was the exact-zero selection rule; changing the rule to key off magnitude fixed it without touching any profile number.
