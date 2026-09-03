---
layer: technique
type: technique
subject: adaptive-music-authoring
technique: loop-boundary-and-tail-contract
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [a loop clicks or lurches at its seam, declaring loop points for delivered music, a re-encode or a trim step broke a loop that used to work]
---

# Loop boundary and tail contract

## The concern

A piece of music that must repeat for as long as the player stands in a room has to
repeat without announcing that it repeated. The naive reading is that this is a number —
find the sample where the music comes round, write it down, done. The number is the easy
half. A loop point accurate to the individual sample still bumps, and the reason it bumps
is that two entirely different defects live at a loop boundary and only one of them is
about the number.

**Value discontinuity.** The last sample before the jump and the first sample after it are
far apart. The speaker is asked to step, and a step is a click. This one is about the
number, and it is the one everybody finds.

**Content discontinuity.** At the instant of the jump, everything still sounding stops
existing: the reverb tail of the final chord, the decay of a cymbal, a released string, a
held pad. Nothing clicks. There is a hole. The listener hears a small lurch of silence
they cannot locate, and because there is no transient to point at, the defect survives
review and ships.

## The declaration

The loop boundary is stated **in samples, at the file's own sample rate, alongside that
rate** ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
Never in seconds. A boundary in seconds is a real number that has to be rounded to a
sample by whoever consumes it, the rounding is not specified, and the rounding *is* the
click. Never in beats alone either: beats are the right unit for a musician and the wrong
unit for a scheduler, and converting one to the other requires a tempo that must then be
exactly right for the whole file.

A complete declaration carries: sample rate, channel count, total sample count, loop start
in samples, loop end in samples, and — where the piece has one — the length of the
pre-roll region before loop start. The audio and its declaration are **one artifact with
one authority** ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).
Any process that changes the sample count republishes both or refuses to run. A normalize
step that trims leading silence, a re-render at a different rate, a batch loudness pass —
each of these silently relocates a boundary that is stored elsewhere, and the resulting
defect appears weeks later in a build nobody connects to the trim.

## Fixing the value discontinuity

Cut on a zero crossing where you can, but do not mistake that for the rule. A zero
crossing in a full mix is a coincidence of the sum, and the individual instruments are not
at zero — the step is smaller, not absent. What actually removes it is that the material
either side of the join is *musically continuous*, which is a composition property, plus a
very short equal-power crossfade of a few milliseconds where the runtime supports one.

The rule: **if a fade longer than about ten milliseconds is needed to hide the join, the
join is wrong and the fade is concealing a content problem.** Lengthening the fade is the
standard wrong fix; it dips the level at the seam once per cycle, which the ear learns as
a pulse.

## Fixing the content discontinuity: fold the tail

This is the move that separates people who have shipped loops from people who have not.

1. Render the piece past its loop end — far enough that the longest decay in the mix has
   fallen below the noise floor. A generous overrun costs nothing at authoring time.
2. Take the overrun region, from the loop end forward.
3. Sum it into the head of the file, aligned so that the sample at the loop end lands on
   the sample at loop start.
4. Truncate the file at the loop end.

The decay that would have rung past the boundary is now already present in the loop's
opening. Plain repetition is seamless and the runtime does nothing clever, which matters
because the runtime is where cleverness fails on the platforms with the least headroom.

The cost is real and must be stated: the folded file's *first* pass now begins with the
previous cycle's tail already sounding, which is wrong for a piece that should enter
cleanly. So:

- **When the runtime only performs plain looping, fold the tail** — it is the only fix
  that works with no runtime support, and the wrong first pass is the price.
- **When the runtime honours a three-part declaration — pre-roll played once, region that
  repeats, tail played on exit — use it instead.** The pre-roll carries the clean entry
  and any pickup before the downbeat; the repeating region is authored so its own tail
  overlaps its own head; the exit tail plays out when the loop is released. This is
  strictly better and it is only available when something downstream supports it, which is
  a fact to establish before authoring, not after.

## What a compressed encoding does to a boundary

Any block-based compressed encoding pads. The encoder prepends a delay and appends enough
samples to fill its last block, so the decoded stream is longer than the source and offset
from it. A loop declared against the uncompressed stream and executed against a padded
decode is wrong by the delay on **every** cycle, and because the error is constant rather
than random it reads as a rhythmic stutter of fixed length — which listeners describe as
"the loop is slightly off" and engineers spend days hunting in the wrong place.

Two ways out, and the choice is made by the platform, not by preference:

- **Loop from an encoding whose sample count survives the round trip.** Costs memory or
  bandwidth; removes the problem entirely.
- **Declare the boundary in the decoder's own frames and verify by decoding and
  re-measuring.** Costs a verification step in the pipeline; keeps the compression.

The rule that covers both: **never carry a loop boundary across a re-encode without
re-measuring it.** A boundary is a measurement of one specific byte stream, and a new byte
stream is a new measurement.

## Proving it

A loop is not judged once, it is judged the fortieth time. Render several consecutive
cycles as one continuous stream and look for a periodic artifact at exactly the loop
period: a sample-delta outlier at the seam is a click; an energy notch is a truncated
tail; a level dip is an over-long crossfade concealing one of the two. Human review of a
single pass finds none of these reliably, because a single pass has no periodicity for the
ear to lock onto — and periodicity is precisely what makes a loop defect intolerable after
ten minutes and invisible after one.

## When not to use this

- **For a piece that plays once.** A stinger, a defeat cue, a fanfare has no loop
  contract. Forcing one on it truncates the tail that is the whole point of the cue, and
  its loop rungs are *deferred* with the stated reason that the class does not loop —
  never passed.
- **For a piece the runtime will always crossfade out of.** If nothing ever reaches the
  boundary, the tail fold is wasted work; declare that the piece is never looped rather
  than authoring a boundary nobody uses, because an unused boundary will eventually be
  used by someone who trusted it.
- **As a substitute for composing a loop.** No boundary treatment makes an eight-bar phrase
  that ends on an unresolved tension bearable at the fortieth repetition. The seam craft
  fixes seams; it does not fix form.
