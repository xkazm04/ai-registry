---
layer: technique
type: technique
subject: steering-feel-profile-shaping
technique: baseline-preset-preserved
status: forged
laws: [one-authority-per-quantity, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [introducing a shared shaping pipeline over a vehicle that already has a feel, keeping scripted drivers calibrated while human profiles change, proving a refactor did not move the old behaviour]
---

# Keep the old feel as a named preset

A feel pipeline is usually introduced over a game that already has a feel. The existing coefficients were tuned, raced against and implicitly accepted by whoever has been playing it, and they are also the calibration of everything else: rival drivers, difficulty ladders, recorded replays and regression baselines were all produced by that behaviour. A new pipeline that replaces it reshuffles all of those without saying so. The technique is to express the old behaviour *as one of the new profiles*, with values that make every new stage transparent, and to keep it selectable and untouched.

## The procedure

Name the old feel as a profile in the same table as the new ones. Choose its values so that each added stage is neutral: the dead zone and exponent equal the old input mapping (a linear exponent of one, the old dead zone); the steer slew and throttle rise at rates so large that one step covers the whole range, so the filters pass the input unchanged; the authority, yaw response, stability and brake scale at one, with a flat speed blend; the throttle exponent at one. Every field is still present and still consumed, so the profile is an ordinary row rather than a special mode.

Then prove it. A test runs the old scenario and compares against the pre-refactor behaviour: a baseline race or a recorded state hash, not a hand argument. Where the refactor deliberately changed something (an ambiguous input combination now resolved one way for all profiles) the test records that and the profile's notes name it. The claim is "the preset preserves the old *coefficients*, and one named behaviour changed", not "bit-identical", unless it was proved bit-identical.

## What else keeps using the baseline

Scripted drivers and tests keep running through the baseline. A rival that was calibrated for the old feel should not silently inherit a human profile's lag and authority, because difficulty ladders and reaction budgets were set against it. The cost is that the shaped path is exercised only by human inputs, so a trace of a human profile is not a trace of the rivals. State the split in the documentation of the pipeline and in the trace header. A pipeline that quietly shapes some drivers and not others is two pipelines; a stated split is a decision.

## Why a preset rather than a flag

A boolean for "legacy mode" invents a second code path that must be maintained and tested forever and invites the fix applied to one path and not the other. A transparent row has one path, uses the same validation as any profile, and can be selected from the same menu. The neutral values are also documentation: reading them says exactly what the old behaviour did and, by contrast, what the new stages add.

## Decision rules

- **The preset is the control group.** Any claim that a new profile is better is made against the baseline's row in the same trace table, which is why it must remain selectable.
- **Never edit the baseline to make a new profile look better.** If its coefficients change, every baseline test changes meaning; add a new profile instead.
- **Neutral means exactly neutral.** Use exact endpoints and the large-rate convention so that an identity pass leaves values bit-identical; an approximately neutral stage is a very small, hard-to-find change.
- **A default is a separate decision.** Which profile is the human default is a design verdict, written down as proposed until an owner confirms it, and unrelated to which profile is the baseline. They may differ, and usually should.
- **The baseline stays valid under the validator.** Large rates and exponents of one must pass load-time validation, or the preset cannot exist.

## When not to use it

- **A new game with no prior feel.** There is nothing to preserve; make the first profile the reference row and keep it for the same control-group reason.
- **When the old behaviour is a known defect.** Preserving a bug as a preset is acceptable only as a labelled control, never as a default.

## The failure this prevents

A shared pipeline was introduced, the old coefficients were ported with small improvements, and a month later the difficulty ladder felt different and nobody could say when it changed, because there was no row that behaved like the old game. The baseline row turns "the game changed" into a diff of one table against another.
