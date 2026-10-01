---
layer: technique
type: technique
subject: steering-feel-profile-shaping
technique: brake-never-reverses
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [a single brake control must not turn into reverse, resolving throttle and brake held together, a casual racer rolls backward or oscillates at standstill]
---

# Brake never reverses

In a game whose controller is two thumbs on glass, every extra mode is a mistake waiting to happen. A brake that is also a reverse is the commonest extra mode, and it is usually not designed: it falls out of an integrator that subtracts brake deceleration from forward speed and lets the result go negative. The player holds brake at a standstill and the vehicle rolls backward. The rule is simple and absolute: brake removes forward speed down to zero and stops there. Reverse, if the game has it, is a separate deliberate control.

## The procedure

Three small rules, each in the one place that applies it.

**Brake wins over throttle, immediately.** When brake input is above zero, propulsion for that step is zero, whatever the filtered throttle holds. Resolving a simultaneous press in favour of the brake is a safety choice: the player who presses both is trying to stop. The resolution is made on the raw brake input, not on a filtered value, so there is no ramp between pressing brake and losing power.

**Brake has a scaled magnitude.** The brake input is multiplied by a profile scale and clamped to the unit range. A profile that wants a firmer brake raises the scale; one for beginners lowers it. The scale feeds both the deceleration and any grip trade the model applies while braking (rear unloading, for instance), so it is one number with one meaning.

**Forward speed is floored at zero.** After the step's acceleration and deceleration are summed, clamp the forward component at zero before drag and before it is recombined into the world velocity. This is the clamp that prevents the reverse, and it must sit on the forward component in the vehicle's own frame; clamping the speed magnitude would not stop a vehicle already moving backward from continuing to do so.

## Why a floor and not a rule in the controller

It is tempting to enforce the rule at the client, by not sending brake when the vehicle is stopped. That cannot work: the client does not know the vehicle's speed to the precision required, the information is a tick old, and the shaping lives in the core by design. The floor is a property of the integration, so it belongs where the integration is.

## The reverse, if there is one

A reverse gear is a distinct deliberate act with its own control, its own speed cap and its own steering inversion semantics. Add it as a recovery mode (for a stuck vehicle) with its own entry condition, not by widening the brake. Until it exists, document that the vehicle never moves backward under its own control; an impact can still push it backward and the model should let that happen through the collision path, which is a different system.

## Decision rules

- **Brake override is part of the pipeline, so it applies to every profile.** A profile cannot opt out of it. If a legacy profile treated brake and throttle together differently, the change is a behaviour change and goes in the profile's notes as one.
- **Test the three situations.** Brake from speed reaches zero and stays; brake at standstill leaves position unchanged; brake and throttle together produce no propulsion. All three run at every profile.
- **Check the filter after the brake releases.** The throttle technique states the two choices; the test asserts the chosen one.
- **Keep brake scale to a narrow band.** Wildly different scales between profiles make a feel profile a difficulty setting; keep the differences within a range a player can attribute to the profile's character.

## When not to use it

- **A simulation with a real transmission.** A car with gears and a handbrake has reverse as part of its model; the rule here is for one-axis arcade controls.
- **A game where reversing is the point.** A parking game or a drift trial with a spin-around mechanic needs reverse as a first-class control; the exclusion would be an error there.

## The failure this prevents

A player holding brake through a hairpin stops, and keeps holding while they decide; the vehicle begins creeping backward into the wall they were braking for. In a trace fixture that never reaches standstill this never appears, and the first report comes from a playtester who thought the game was broken. The floor costs one clamp and the test is three lines.
