---
layer: technique
type: technique
subject: on-device-verification-harness
technique: separate-active-race-from-transition-windows
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a soak report has one frame-time or latency figure for a whole session, a worst frame happens at a menu or load boundary, a performance claim is about to be stated over all windows]
---

# Separate active-play windows from transition windows

The named concern: a session on a device is made of phases with different cost profiles, the
live play the player feels and the transitions around it, such as menus, countdowns, scene
builds and results. Windows of measurement are labelled by phase, reported as separate
populations, and the maxima of both are kept.

## Why one figure lies in both directions

Pool a transition into active play and its single long frame, a scene being built or a
resource being disposed, sets the maximum for the whole run. The report then says the game
stutters during play when the stutter is during a load that the player is looking at a
loading cue for. In the other direction, drop the transition from the report to make the play
number clean, and a real hitch is gone from the record: if the next change moves that work into
play, nothing remembers it was there. The honest report has two rows.

This also decides what a budget is. A play budget, a worst frame a player will notice while
driving, and a transition budget, how long a cue may hold the screen and whether input is
safe during it, are different requirements and take different measurements.

## The structure

Record every sample inside a window of fixed length with: the phase at the window's start, the
phase at its end, the count of samples, the exact quantiles and the exact maximum. A window
whose start and end phases differ **straddles** a transition and is labelled so, and is not
assigned to either population; it is counted and reported on its own line. Define "fully
active" as a window whose entire span was in the live phase, and define it in the report.

Then summarise per population: the number of windows and samples; the worst window ninety-
fifth percentile and the worst window maximum, saying that they come from different windows
when they do; and the pooled quantile only if the distributions were kept in a mergeable
form. A mean of window percentiles is not a figure anyone should print.

Counts of samples across overlapping windows are sums of rolling populations when the poller
reads more often than the window length or leaves gaps. Say so beside the sum.

## Procedure

1. Have the game publish its phase in the same query that publishes frame statistics, so the
   phase and the window come from one read.
2. Poll windows with a ceiling on how stale each can be, and record the phase of each poll.
3. Classify after the run, not during it, with the rule written in the report.
4. For each transition type, keep its own maximum, so the scene build and the results screen
   are not one number.
5. State the budget each population is graded against, in the same units, and grade each
   against its own.
6. If a transition maximum misses its budget, list it as a miss. Do not average it into a
   neighbour.

## Decision rules

- **When a claim begins with "all windows", check the transitions first.** The claim is
  usually true of active windows and false of the set, and the sentence must say which.
- **When two runs are compared, compare like populations.** Run two's last window may be a
  transition, which makes it a different thing from run one's last window.
- **When the second run is better by less than the instrument's noise, say it is not
  distinguishable.** A difference of a few hundredths of a millisecond in a ninety-fifth
  percentile between two runs is not an improvement or a regression; a strict "no worse" claim
  that rests on it is false in one direction and unfalsifiable in the other.
- **When a transition is the worst part, move the work, then measure again.** Slicing a heavy
  build into pieces under a per-frame budget changes its distribution from one long frame to
  many bounded ones, and the report shows the slice maxima, not the promise.
- **When a budget is nominal, say what it excludes.** A geometry budget that does not count
  submission cost will be exceeded on the device by that cost.
- **When a transition holds a countdown, hold it until the work is ready.** Measure the time
  between readiness and the first live frame; a countdown that elapses before readiness hides
  the build inside play.
- **A count of discarded elapsed time is not lost simulation.** Where the game clamps a long
  step, the clamp counter rises in menus and countdowns too; read it per phase before
  concluding anything about play.

## What this does not claim

The separation is about the instrument, not about the player. It does not say transitions
do not matter; it says they are measured on their own terms. And it does not say that smooth
frame intervals feel responsive: frame time is a render-entry measurement, and the feel of the
control is a separate, differently measured quantity.

## When not to use it

A game with no distinct phases, a continuous-world title, has nothing to split, though it can
still split by region or by load. And when a harness cannot observe the phase, it must not
guess it: the windows are reported as unclassified, and any claim over them is bounded by that.

## Evidence status

Measured on one device with scripted clients across about ninety windows: the active
population's worst ninety-fifth percentile and worst maximum were reported separately from the
whole-run maximum, which was set by a transition. The population split is a reporting rule
applied after the fact, not a pre-registered one, and the budgets were authored before the
measurement and are not a human standard.
