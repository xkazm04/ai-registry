---
layer: technique
type: technique
subject: game-dialogue-voice-pipeline
technique: localized-voice-timing-budget
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a spoken line is tied to a fixed-length animation or cutscene beat, a translated line overruns its clip, choosing between re-wording and speeding up a render]
---

# Localized voice timing budget

The named concern: a spoken line that is attached to something with a fixed length (a
facial clip, a gesture, a cutscene beat, a subtitle window, a camera hold) carries a
duration budget, the budget is per locale, and it is enforced on the measured duration of
the rendered take. The media craft states the same argument as delivery-rate budgeting for
narration over picture; the two must agree on the unit and on what a "line" is.

## Why a word count fails

A cap on words per line is the usual first attempt, and it passes exactly the lines that
will fail. Words are not time: the same text takes longer with a calm, weighty delivery
than with an urgent one, and a synthesized voice's pace varies with the voice, the
requested emotion and the punctuation. Words are not comparable across languages either:
translation changes line length in both directions, some languages spend more syllables on
the same meaning and others fewer, and a cap that is satisfied in the source language
says nothing about the locale that ships to the largest market. And a word cap on a canon
that contains long monologues either fails every line or is switched off for the whole
class, which silently turns the check into no check.

The quantity is **seconds of audible speech in this locale**, with its basis stated: does
it include leading and trailing silence, is it the take as rendered or after trimming, is
it at the default pace or the adjusted one
([a number carries its unit and its basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Procedure

1. **Declare the budget where the attachment is declared.** The animation, the beat or the
   subtitle window has a length; the line's catalog row carries that length as its ceiling,
   and a floor where an early cut would look wrong (a mouth that closes half a second
   before the voice ends).
2. **State the budget in the authoring brief for each locale,** not only the source. A
   translator, or a translation model, told the ceiling produces different text than one
   told only to be faithful, in the same way any generator handed a budget writes to it.
3. **Render, then measure the take,** not the estimate. Measure once per locale per line.
4. **Compare to the budget,** and route on the outcome.
5. **Record the measured duration in the catalog** so the next revision diffs against a
   number rather than against a memory.

## The order of remedies

When a locale render lands outside its budget:

1. **Re-word the line** for that locale and re-render. Most overruns have a shorter true
   phrasing, and choosing it is a translation task, not an audio task. This is the default
   remedy because it changes nothing about the performance.
2. **Ask for a different delivery** (a brisker read) only if the direction allows it and the
   speaker's characterization survives.
3. **Adjust speed slightly.** A small correction is inaudible; a large one is a different
   performance and produces the artifacts a player notices on the lines meant to be
   listened to. Set a ceiling on the correction in the catalog and treat anything past it
   as a failure of steps 1 and 2.
4. **Change the animation or the beat length,** which is a production decision with an
   owner, taken deliberately per locale and never as a reflex of the pipeline.

Some renderers can fit a clip to a fixed length by themselves. Read that as a speed
adjustment with the same limits, not as a solution: a fixed-length mode compresses or
stretches the delivery, and an adaptive mode instead lengthens the clip and can collide
with whatever follows it. Either way the collision or the strain is reported, because it
is exactly the case the budget exists to catch.

## Decision rules

- **When the duration of a take is not measured, the line's timing state is *not measured*,**
  never *within budget*
  ([grade against what ships](../../../../_laws.md#grade-against-what-ships-not-on-a-curve)
  applies: judge the locale that ships, not the source that passed).
- **When a locale differs from the source by a large factor on many lines,** suspect the
  translation brief, not the renderer, and fix it at the brief.
- **When a line is unattached (no animation, no beat),** it has no timing budget and needs
  none; do not invent one to make the catalog uniform.
- **When a budgeted line is edited,** re-measure every locale. A shortened source line can
  lengthen a translation.
- **When lip-sync is generated from the audio,** the sync clip's length follows the take;
  the budget still binds, because the clip is the thing with a fixed length.

## When not to use this

- **On barks with no animation tie,** where variable length is fine and only a global
  ceiling for interruptibility applies.
- **As a way to pick words.** A budget constrains a container; it says nothing about
  whether the line is good, and lines tuned only to fit read as uniformly clipped.
- **For the source-language script before translation exists.** Set the source budget, but
  treat it as the input to locale budgets rather than as the answer.
