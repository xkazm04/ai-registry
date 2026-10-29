---
layer: technique
type: technique
subject: live-system-demo-film
technique: music-bed-sized-to-the-finished-cut
status: forged
laws: [cost-per-usable-output, output-never-outruns-evidence]
shared_with: []
use_when: [adding a background music bed to a narrated demo film, choosing between several generated music candidates, deciding how loud a bed sits under a voice, a script change moved the length of the film]
---

# A music bed, sized to the finished cut

A narrated demo film of a working system can sound bare: a voice over a screen
recording with nothing underneath. A quiet instrumental bed changes how it feels
without changing what it claims. The case that taught this added a low-tempo
instrumental bed under a film that had already been approved without one, and the
operator's verdict was that the bed improved the feel of the demo. Three rules
make that safe and cheap.

## Audition candidates against the voice, not alone

- **Generate five, vary the mood and keep the energy low.** Slow tempo, a sparse
  arrangement, no lead melody and no drops. A bed is graded on how little it asks
  for, so candidates that differ in instrumentation and mood and agree on
  restraint are the useful set.
- **Mix each candidate under the chosen voice at the intended level.** A track that
  is pleasant on its own can fight a voice, and the operator cannot judge a bed
  from the bed alone. A short sample of the voice under each candidate, at the
  final bed level, is the audition.
- **Expect a concurrency limit.** Generation services cap simultaneous requests
  per subscription. Run the candidates two at a time; a rejected request costs
  nothing but the retry.
- **Keep the candidates short.** Forty-five seconds is enough to judge; the
  finished bed is generated once.

## Generate the final bed once, to the length of the finished cut

- **The length is the film's length, from the first beat's start to the last
  beat's end, plus a short tail for the fade.** Not an estimate, not a round
  figure. A bed shorter than the film ends before it; a longer one is cut off by
  the film and wastes the difference.
- **Generate it after narration is final.** Narration sets the hold of every beat
  and so the length of the film. Re-narrating a line inside the span moves the
  length, and the bed is generated again. Order the work: script, voice, narration,
  then music, then capture; a bed made earlier is spent twice.
- **A length change is a new bed.** Treat the bed as derived from the narration and
  the prompt together and let the pipeline's staleness check regenerate it, not a
  person remembering to.

## Set the level low, and let the mix duck it

- **The bed sits at one tenth of full scale, about twenty decibels down,** before
  the mix lowers it further under speech. The operator's target was "volume down";
  at that level the bed is felt in the pauses and absent while someone is talking.
- **Loudness is mastered after the mix.** Check the finished film against the
  loudness target, not the bed alone. A bed adds energy and can push a
  peak-limited master a fraction under the target; that is acceptable within the
  tolerance, and worth reading in the render's own report.
- **Judge the final film, not the stems.** The only listening that counts is the
  rendered film with the voice on top.

## Failure modes

- **A bed generated before the script settled.** The length is wrong by the amount
  the script moved, and the fade lands in the middle of the sign-off.
- **A bed with a melody.** It competes with the voice for the same frequencies and
  the same attention.
- **A bed approved at full level.** It sounded fine alone and masks consonants when
  it is under speech.

## Decision rules

- When a film has a bed, generate it last, to the measured length of the finished
  cut plus a fade tail, because the narration decides the length.
- When choosing among beds, mix each under the chosen voice at the final level,
  because the question is how it sits under speech.
- When the level is set, set it low and let the mix duck it, because the bed is
  heard in the pauses and should never be noticed during a sentence.
