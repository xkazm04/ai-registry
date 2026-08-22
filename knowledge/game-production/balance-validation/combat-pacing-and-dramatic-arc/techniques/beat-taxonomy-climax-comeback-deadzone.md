---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: beat-taxonomy-climax-comeback-deadzone
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [converting a tension curve into designer-readable findings, deciding whether a lull is authored or accidental, diagnosing a fight that tests fine but feels flat]
---

# Beat taxonomy: climax, comeback, dead zone

The named concern: mine a tension curve for the small set of named moments a designer
actually acts on, each with a stated detection rule and a stated design meaning. A beat that
fires but implies no action is a metric, not a beat.

## The beats

Each entry is a signature over the curve plus what its presence — or absence — tells you.

**Climax.** The global maximum of the blended curve, reported when it clears a low existence
threshold — enough to say a peak happened at all. *Meaning:* where the fight's high point is,
in seconds. Do not fold "was it late enough" into this detector; report the peak and its time
plainly, and let the anticlimax rule below judge its placement. A detector that silently
declines to report an early peak leaves the reader with no peak at all.

**Near-death.** The threat term alone crosses a stated survival floor — a small remaining
fraction of the defender's resource. *Meaning:* the fight got genuinely close. This is
detected on the threat term rather than the blend on purpose; a near-death during a quiet
moment still counts, and the blend would dilute it.

**Comeback.** A near-death region that ends comfortably before the encounter does — before
roughly the last fifth of its runtime — where the defender survives *and* goes on acting: at
least one further offensive event after the recovery point. *Meaning:* the strongest beat in
the vocabulary. The continued-action test is what makes it a comeback rather than a lucky
finish; without it, any near-death in a won fight would qualify. Its absence across a large
sample means the fight has no reversal built into it, usually because the player has no
resource or cooldown to spend on turning a losing state around.

**Breather.** A local minimum of the blended curve with prominence on both sides: the running
maximum before it and the running maximum after it each stand above it by a stated margin —
around 0.2 on a zero-to-one curve. Enforce a minimum spacing between breathers, a few seconds,
so one broad valley is not reported as three. *Meaning:* authored recovery. A long fight with
no breather is exhausting regardless of its difficulty band.

**Dead zone.** A run of at least one window in which the *raw* activity signal is exactly zero,
bounded by real events on both sides. *Meaning:* absence of design. See the separation rule
below — this is the beat teams get wrong.

**Anticlimax.** A real peak that lands early — in the first sixty percent of the encounter —
followed by a tail whose average tension over the closing stretch sits below half the peak.
Require a minimum encounter length before testing it, or every short fight is an anticlimax.
*Meaning:* the fight was decided before it finished. The usual cause is an opponent whose
remaining health outlives its ability to threaten.

**Flat pacing.** Interior curve spread below a stated floor — under about 0.18 on a
zero-to-one curve — across an encounter long enough to have had a shape. *Meaning:* the fight
has no arc. This is the finding the whole subject exists to produce, and the one a scalar
difficulty number can never surface.

## Separating a breather from a dead zone

To the eye they are the same object: a low stretch. The mistake is to try to separate them by
depth, with a breather above some threshold and a dead zone below it. That produces a knob
nobody can set. Separate them by **which signal they are defined on**:

1. **A breather is relative, on the smoothed blend.** It is a prominence feature — a valley
   that is a valley *because* of what surrounds it. In a fight that never rises, no stretch
   has prominence, so no breather is detected, which is correct: that fight has flat pacing,
   not rest.
2. **A dead zone is absolute, on the raw activity signal.** Not "low" — *zero*. Nothing
   consequential happened for at least a window's length. No prominence test is involved, so a
   quiet stretch inside an otherwise quiet fight still fires, which is also correct.
3. **Interior only, for the dead zone.** Require real events both before and after the run.
   A quiet head or tail is a boundary artefact of where the timeline was cut, not a stall —
   and a quiet tail that follows an early peak is an anticlimax, which is a different finding
   with a different fix. Reporting it twice teaches the reader to discount the report.

Because they are computed on different signals, the two can legitimately overlap, and that
overlap is informative: a prominent valley that also contains zero activity is a breather the
designer did not author.

## Decision rules

- Detect on the term that carries the meaning, not always on the blend. Near-death is a threat
  event. Climax is a blend event. Dead zone is a blend event with context. Mixing this up
  produces beats that fire for the wrong reason and are consequently untrustworthy.
- Every threshold in the taxonomy is stated in the output with its basis. "Climax at 14.2
  seconds, tension 0.81, threshold 0.75 over one-second windows" is a finding; "climax
  detected" is a rumour.
- Aggregate beats across trials as rates, never as averages of the curve. *Near-death in 12%
  of runs* is the useful statement, and it is invisible in a mean curve.
- Absence of a beat is a reported value, not an empty field. No climax detected must render as
  a finding — a fight with no detected beats is the definition of flat pacing, and a blank
  section reads as a pass.
- Gate the whole taxonomy on there being any activity at all. A timeline with no consequential
  events must short-circuit to a stated *nothing to pace* rather than running every detector
  over a zero curve, which would emit a confident list of pacing defects about a fight that
  never happened.
- Order the report by what the designer will change, not by timestamp. A missing comeback
  outranks a two-second dead zone.

## When not to use this

- **On encounters shorter than a few multiples of the window length.** With four windows in
  the whole fight, every detector is measuring its own parameters. Report the encounter as
  below the analysable floor instead.
- **On a single trial as evidence.** One near-death is an anecdote. Beat rates over a sample
  are the claim; a single run is a replay to watch, not a verdict.
- **As a scoring rubric.** Counting beats and summing them into a pacing score reintroduces
  exactly the scalar this subject exists to escape. The beats are a list of findings, and the
  list is the deliverable.
