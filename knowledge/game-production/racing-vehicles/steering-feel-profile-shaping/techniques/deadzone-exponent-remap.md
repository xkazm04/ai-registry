---
layer: technique
type: technique
subject: steering-feel-profile-shaping
technique: deadzone-exponent-remap
status: forged
laws: [one-authority-per-quantity, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [turning a raw drag or stick axis into a steering target, choosing a dead zone and response exponent per feel profile, a thumb at small deflection does nothing or does too much]
---

# Dead zone, rescale, then exponent

The first stage of the pipeline converts a raw signed axis in the range minus one to one into a shaped target in the same range. It has three operations and the order is not negotiable: remove the dead zone, rescale what is left to fill the full range again, then apply the power curve to the magnitude and restore the sign. The result is a pure function of the raw value and two profile numbers, with no state, which is what lets it be tested at the edges and switched live.

## The procedure

Take the magnitude of the input. Subtract the dead zone and divide by one minus the dead zone, then clamp to the unit range. Raise the clamped value to the profile exponent. Multiply by the sign of the input. Inputs inside the dead zone clamp to zero and return exactly zero; an input of full deflection returns exactly full output, whatever the dead zone and exponent are.

The rescale is the step naive implementations omit. Subtracting a dead zone without dividing leaves the maximum output at one minus the dead zone, so a profile with a bigger dead zone also has less peak steering and the two settings are secretly coupled. Dividing makes the curve continuous at the dead zone's edge (output starts from zero, no step) and keeps the top of the range intact, so the dead zone changes only where the curve begins, and the exponent changes only its bend.

## What the exponent trades

A value of one is linear after the rescale. Above one, the middle of the range is flattened: small inputs produce proportionally smaller outputs, which gives centre precision and a calm straight line, and the edge ramps harder to compensate. Below one, small inputs are amplified, which suits a short thumb travel where small movements must register. The relation to travel matters: a profile with a short drag distance wants an exponent at or below one, because the player has little range to spend on fine corrections; a profile with a long distance can afford above one.

Neither direction is an improvement in itself. Players who complain that the vehicle weaves on a straight want the middle flattened; players who complain that it does not respond to a nudge want the middle strengthened. State the complaint the profile answers beside its row.

## Decision rules

- **Dead zone before exponent, always.** Applying the power curve first moves the dead zone's effective size with the exponent, and a tuning table can no longer read its dead zone as a number of anything.
- **Bound the dead zone.** A dead zone above roughly one fifth of the range is a feature that hides the control; validate an upper bound at load, and reject a profile outside it rather than clamp silently. Published guidance for racing controllers favours small dead zones, around a tenth, because smooth steering matters more than flick speed; on glass, with a relative anchor, far smaller values suffice since there is no spring to rest against.
- **Require a finite, positive exponent.** A zero or negative exponent is a data error that produces a step or a singularity, and a non-finite one poisons every downstream product. Validate every numeric field at load and name the field in the failure.
- **Special-case the exact endpoints.** Zero, one and an exponent of one return their input untouched. It saves work and, more importantly, keeps the identity cases exactly identity, so a neutral profile is bit-for-bit transparent rather than approximately so.
- **Keep the function allocation-free.** A power function in the hot path is called every step; on some runtimes the library routine allocates. An exponential-of-logarithm form avoids it and is exact enough for a bent axis; confirm the claim with an allocation measurement after warm-up rather than assuming it.
- **Test the contract, not the curve.** Assert that the value just inside the dead zone is exactly zero, that full deflection in either direction is exactly plus or minus one, and that the function is monotonic. The exact shape between is a taste decision and belongs in the trace bands.

## When not to use it

- **For an axis that is already a physical wheel with its own calibration.** A hardware wheel's dead zone and linearity belong to its driver; shaping again doubles the effect.
- **For digital left and right buttons.** There is no continuum to bend; a ramp (the slew stage) is the entire feel.
- **As the only knob for a sluggish vehicle.** A flat curve shapes the input; if the vehicle is slow to rotate the cause is downstream in authority or yaw response, and no curve here repairs it.

## The failure this prevents

A profile advertised as "tighter" shipped with a bigger dead zone and no rescale; its peak output fell short of full, so the car understeered in the very corners the profile claimed to improve, and nobody could say why because each setting looked independent in the table. The rescale makes the settings independent in fact as well as in the table.
