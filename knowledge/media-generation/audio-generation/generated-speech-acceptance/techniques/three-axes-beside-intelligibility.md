---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: three-axes-beside-intelligibility
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [scoring a cloned or requested voice, a clip reads every word and sounds like nobody in particular, someone proposes one combined speech score, a predicted-quality number is being read as a pass, comparing similarity numbers from two runs]
---

# Three axes beside intelligibility

One clip gets three instruments and three numbers. Intelligibility (the
round-trip technique) asks what was said. Speaker similarity asks who said it.
Predicted signal quality asks how it sounds. There is no fourth composite
number, because the axes fail independently and the remedies differ: a
missing word goes back to the text and the render, a wrong voice goes to the
reference and the conditioning, a defect in the signal goes to a listener.

## Why no composite

An average lets a strong axis pay for a broken one. A clip that is clean and
close to the requested voice and drops a clause scores well on two of three
and has failed the only axis the listener cannot forgive. The reverse also
holds: every word correct in the wrong voice fails a cloning brief outright. So
the verdict is a vector, with a threshold per axis taken from what the brief
committed to. If the brief names a target voice, identity is gated; if it
requests a stock voice, the identity axis is recorded as not applicable, which
is a stated state and not a pass. An axis that was not run reports
"unmeasured", never green.

## Axis two: speaker similarity

Similarity is the cosine between two embeddings from a speaker-verification
model, one for the render and one for the reference voice. Four rules keep it
honest.

- **The embedding model is part of the metric.** The scale belongs to the
  model: the same pair of clips scores differently under two embedding models,
  and a number is comparable only within one. Name the model beside the score.
  A pipeline that uses one embedding model on one benchmark and another on a
  second benchmark reports two incomparable series under one word.
- **Calibrate the scale.** Score two natural clips of the same speaker against
  each other, and two natural clips of different speakers. Those anchors say
  what "same voice" and "different voice" look like on this model. A render at
  the same-speaker anchor is as close as the instrument can see; a render near
  the different-speaker anchor is a different voice.
- **Prefer a held-out natural clip as the comparison.** Scoring against the very
  clip fed to the generator rewards a generator that copies the clip's channel:
  its noise, its codec, its room. Similarity to a held-out clip of the same
  speaker measures the voice.
- **Know the blind spot.** An embedding captures timbre far better than
  prosody, accent or speaking style. A flat, wrong-emotion delivery in the right
  timbre scores well. Style is a different axis, judged by a different
  instrument (the last technique in this subject).

## Axis three: predicted signal quality

A predicted-quality estimator is a model trained to reproduce the mean opinion
scores that listeners gave to a specific collection of clips in specific
listening tests. Three facts bound its use. It tracks listener averages much
better across whole systems than across single clips: the same estimator that
correlates strongly with system means correlates noticeably less with a single
clip's rating, so the per-clip number carries wide error. Listening tests carry
their own biases, which is why such estimators learn a domain identity and why
a score does not transfer cleanly to a language, a domain or a recording
condition the estimator never saw. And a high predicted score can coexist with
a dropped word, since the estimator is not asked what was said.

Predicted-quality estimators also come in more than one family: one trained to
mimic listener ratings of naturalness on synthetic speech, another trained on
noise-suppression listening tests and reporting signal, background and overall
scores. They answer different questions and share only a name and a one-to-five
range. Name the estimator beside the number, and never put two families in one
column.

So the role is a **screen**. It ranks systems and it routes clips: the lowest
band goes to a listener, and a shortfall against a previous run flags a
regression. It does not issue an acceptance verdict, and a report that reads
"quality passed" from this number alone is claiming more than the instrument
supports.

## Run order and cost

The three instruments are models, and running them together is a resource
problem before it is a scoring one. Synthesize every clip first, release the
generator, then load the scorers, so that generator and scorers never compete
for one accelerator; a run that fails on memory produces no verdict at all, and
that absence is unmeasured, not pass. Cache the embedding of each reference
once. Score cheap axes on every clip and route only the flagged remainder to a
person.

## Decision rules

- When the brief names a voice, gate identity; when it does not, mark it not
  applicable and still watch consistency of the voice across clips.
- When similarity comes from a different embedding model than the last report,
  do not put the two in one column.
- When only the predicted-quality axis fails, send the clip to a listener before
  discarding it, because the estimator is wrong on single clips more often than
  it is wrong on systems.
- When any axis failed to run, the clip has not passed on it.

## When not to use this

A fixed stock voice with no requested reference does not need the identity
axis against a reference; a consistency check between clips replaces it. A
single deliverable that a person will hear in full before release does not
need the screening axis, and a subject that only ever delivers short prompts to
a listener may run intelligibility alone, as long as the report says the other
two axes were not measured.
