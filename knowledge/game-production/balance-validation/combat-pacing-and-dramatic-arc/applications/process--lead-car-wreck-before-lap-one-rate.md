---
layer: application
type: application
subject: combat-pacing-and-dramatic-arc
technique: lead-car-wreck-before-lap-one-rate
stack: process
status: forged
verified_on: 2026-10-01
---

# Opening-fairness gate on a six-car combat racer: a simulated and device-scripted record

A Fire TV combat racer (six cars per race, five divisions, human lead plus rivals) names the
gate in its progression plan and tunes it in its combat-economy plan. Everything below is
simulated or driven by a script. No human fairness sample exists, and the source says so.

## The named metric and its first failure

`docs/concepts/DEATH-RIDE-PROGRESSION.md:86 "Early-wreck fairness (a named metric): under 5% of events may end for the human before the end of lap one"`
(source repo root `firetv-deathride`) is the gate as a single sentence, with its unit
(events), its boundary (end of lap one), its target (under 5%) and its driver qualifier (a
reasonable driver). The same line records the failure that motivated it: "Phase 1 hardware
sessions exceeded this". The repair is assigned as data (armour, starting health, weapon
damage), "measured by the simulation and then felt by the owner" — the felt tier is left to a
person.

The first tuning pass recorded the opening burst in time rather than in rate:
`docs/concepts/deathride/W4-weapons-and-damage.md:42 "first wreck 1.58-6.02 seconds, 4.35 wrecks/race"`
over 20 physical races, "not acceptable opening pacing". After the cut and a visible
four-second start-protection and weapon-arming period (no ammunition spent before it
expires), the same line reports first wreck 8.35-18.07 seconds over 20 races on all five
tracks and calls the sample "tuning evidence, not a human balance verdict".

## The failed coefficients are kept

Source repo root `firetv-deathride-content`:
`docs/concepts/deathride/C3-combat-economy.md:19 "The initial Crown diagnostic wrecked 39/40 lead drivers before lap one. The next coefficient still wrecked 10/40. Those logs are retained."`
That is the technique's coefficient log in one sentence: baseline 39 of 40, one intermediate
step at 10 of 40, then the accepted series. The final damage multipliers are
"0.10/0.12/0.14/0.15/0.16 for the five divisions, shared by every entrant; practice remains
1.0" — one scalar per division, symmetric across the field, a rising series with no step
wall, and an unscaled sandbox. The accepted experiment is "four scenarios x 2,000 actual
six-car races = 8,000; all entries resolve, all terminal hashes are distinct within each
scenario, no one-shot kills, and zero lead-car early wrecks": the instrument asserts that it
had input (every entry resolved, distinct terminal states) before it reports zero. The same
sentence retains the other half of the gate: "Crown retains 154 later lead wrecks (1,846 lead
finishes)", about 7.7% of the 2,000 lead outcomes in the top division, so the zero was not
bought by removing danger.

## The proxy declaration is already there, in one clause

The same line closes: "The lead is a Club-decision AI proxy, with field skills declared per
scenario; this is not a human fairness sample or coverage of every loadout/course
combination." Driver policy, per-scenario skills and coverage exclusions are all present as
prose, and the sample is named as not human. (Source repo `firetv-deathride`:)
`docs/concepts/deathride/G1-REPORT.md:9 "Numerical correctness is not evidence that those encounters are fair or enjoyable."`
and the device session table at `:32-34` ("Both wrecked" for all three scripted races, 15.78 s
to 27.48 s, one "during lap one") is the counterexample the technique says to treat as a
defect in the model until shown otherwise: the scripted pursuit controller on real hardware
ended every race with both human cars wrecked, which a pass in simulation cannot explain away.

## Deviations the standard does not accept

- The gate lives in prose in two documents and in a one-off experiment, not as a field a
  report generator emits. A re-run after a weapon change would need someone to remember it.
- The proxy declaration is a clause, not a block with the five mandatory fields; "Human
  sample: none" is implied by "not a human fairness sample", not stated as a mandatory line.
- The G1 balance table reports "Under 5 s / all wrecks" (`G1-REPORT.md:46`), a time-to-wreck
  share of all vehicles, which is a different quantity from the lead-car opening rate; the two
  are easy to mistake for each other because both carry a "5" in their name and both sit
  below it (0.72% to 3.64%).
- Per-course rates for the multiplier sweep are not shown in the cited lines; only the pooled
  per-division count is.

## Upward lessons taken into the standard

The retained later-wreck count beside the gate; the discarded sweep whose class and course axes
rotated in lock-step (recorded at `G1-REPORT.md:44 "Review caught an initial use of the same modulo rotation for both"`, with the corrected
scenario used instead); and the observation that a start-protection window moves the first
wreck to just after it, which is why the multiplier is the lever and the window a companion.
