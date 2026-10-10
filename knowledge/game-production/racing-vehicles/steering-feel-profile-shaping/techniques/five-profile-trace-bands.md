---
layer: technique
type: technique
subject: steering-feel-profile-shaping
technique: five-profile-trace-bands
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient, law-and-check-share-one-source, an-instrument-proves-it-had-input]
shared_with: []
use_when: [comparing steering feel profiles, writing the acceptance test for a profile table, a profile change claims to be tighter or looser and needs evidence]
---

# Trace bands: compare profiles by a table, and declare the bands beside the profile

A handful of named feels, each a row of numbers, is a design that can be argued about forever unless something produces comparable evidence. The instrument is a headless trace: an isolated vehicle at a pinned speed, driven by scripted inputs, reporting a few measurements per profile. The discipline is in what it reports, how it is held constant, and where the acceptable range for each profile is written.

## The fixture

One vehicle on open ground, not a lap. **Build it the way the game builds a raced vehicle**, through the same factory, data rows and flags, and assert which handling path ran. A vehicle constructed by hand with default parameters can take a different branch from every shipped vehicle. Then the bands guard a model nobody drives, and a change to the shipped model breaks nothing. In one measured case a game's bands passed 15 of 15 traces on a default-built vehicle while the same fixture, run through the catalogue factory, put 60 of 150 out of band. The handling model had been replaced the day after the bands were set. The speed is *pinned*: after each step the velocity is rescaled to the test speed, so what is measured is steering response rather than the interplay of acceleration and drag.

Pinning is safe only while the model cannot spin at the pinned speed. A model with real tyre saturation, given a full-lock step at a speed the pin keeps constant, slides and is fed energy to keep sliding. The slip column then reads a spin, and turn-in and radius describe no turn. Choose the acceptance step below that point: find the largest input whose saturated slip stays well short of a spin across the vehicles under test, and use it. In the case above, 70 of 150 full-lock traces passed forty-five degrees of slip, 7 at half lock and none at a quarter. Throttle is held constant and brake is zero. Run each profile at three speeds that span the authority blend (a parking speed, a mid speed, a near-top speed) and at four input patterns: a full step to lock, a ramp, a sine sweep and a half-lock hold. The step is the acceptance pattern; the others are for the reviewer. Use a fixed step length and a fixed trace length, and write both into the report header, since a measurement without its step and window is not comparable.

## The measurements, and why four

- **Turn-in time:** seconds from the step until yaw rate first reaches ninety per cent of its late steady value. It captures slew rise, authority and yaw response together.
- **Steady yaw rate** and the **radius** derived from speed over yaw rate. Radius is the turn's geometry; yaw rate is its intensity.
- **Saturated slip:** the mean angle between velocity and heading over a late window, in degrees. It captures how much the vehicle is sliding, not turning.
- **Recovery time:** seconds after release until yaw rate falls below a stated small threshold, which is not the same as perceived recovery of a slide and must be labelled with its threshold.

Four, because each of the common cheaper reports hides a failure. Turn-in alone rewards twitchiness. Radius alone cannot see slip: in a simulated table of five profiles, two profiles had the same radius to within two hundredths of a metre and slips of roughly twenty and thirty-nine degrees, so a radius comparison declared them equal. Slip alone ignores whether the vehicle turned at all. Recovery alone ignores the way in. The rule is that a profile is described by all four, and a proposed change that improves one must state what it did to the others.

## Bands beside the profile

For each profile, store the acceptable range of yaw rate, a maximum turn-in time and a maximum recovery time as fields of the profile's own row, and have the test read them. The profile and its acceptance live in one place, so editing a profile's character edits its band in the same diff, and a profile that drifts out of its declared range fails a build. This is the same rule as any threshold with a prose statement: the check reads the canonical row, it does not carry a copy.

Two gaps are common and worth closing. First, bands for radius and especially for slip: the headline discovery of such a table is the slip column, and a column that is recorded but never asserted can regress without a failing test. Declare a maximum saturated slip per profile, even a generous one. Second, the non-step patterns are recorded and never asserted; a cheap guard is that each is finite and positive.

## Reading the table

Order the profiles by turn-in time and read across. A profile with the shortest turn-in and the highest slip is the loose one; its character is real and its slip is the price. A profile with the longest turn-in and the lowest slip is the stable one. A profile that beats a neighbour on three columns and loses none is dominated and should be removed or repositioned, because a table of five should offer five distinguishable choices. Where two rows differ in several settings, the table cannot attribute a column difference to one of them; if a claim names a cause, sweep that setting alone first.

## Labelling

Every table states: fixed step length, trace length, speeds, which pattern the table row is from, and that the vehicle is isolated. It states that the figures are simulated and not human-felt. Recovery is defined by its threshold. The report also carries the count of traces it ran, so that an empty run cannot read as a pass.

## Decision rules

- **Compare on four columns, and attribute causes only with a one-setting sweep.**
- **Hold speed.** Unpinned speed makes slip and radius depend on acceleration; the fixture isolates steering.
- **Declare the bands in data, assert them in the test, write the results to a report file the reviewer can open.** The report is the evidence; the assertion keeps it true.
- **Assert the scope.** The test asserts the profile count and the trace count before it asserts anything else.
- **Assert the path.** The fixture comes from the game's own vehicle factory, and the test asserts the handling branch it took. When the game gains a handling model, the bands move to it in the same change, or the test fails.
- **Never convert a band into a feel claim.** A profile inside its band is within its declared model behaviour; whether it feels good is a human verdict.

## When not to use it

- **To pick a default.** The table narrows the choice and states the costs; the choice is the owner's.
- **As a substitute for lap evidence.** An isolated vehicle shows the response; a lap shows the interaction with walls, other vehicles and the track.

## The failure this prevents

A tuning pass made a profile feel sharper by raising authority and was accepted because radius and turn-in both improved. The slip column, never printed, had doubled. The next playtest report said the vehicle felt like it was on ice, and the table that would have shown it had never been asked for the column.
