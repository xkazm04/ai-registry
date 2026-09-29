---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: phantom-terms-and-silence-insertions
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [a transcript passed the entity gate and still lists a skill the candidate never mentioned, enabling or enlarging a recognition vocabulary list, a transcript contains text from a stretch where nobody was speaking, choosing what the entity metric must count]
---

# Count the terms that were heard and never said

The entity gate asks whether every term the candidate spoke survived. That is a
recall question, and it cannot see the opposite error: a domain term that
appears in the transcript and was never spoken. Measure that side too, call it a
phantom, and treat a phantom as unconfirmed until the candidate has said it.

## The concern

A recall-only gate has one blind spot, and it is the one a scorecard is worst at
forgiving. A transcript in which every spoken skill survived and one extra skill
was added passes with a perfect recall figure. The scorecard then credits a skill
nobody claimed, with a quote to support it, in a fluent record.

Three separate mechanisms produce a phantom, and they are worth telling apart
because each has a different control.

- **A substitution is a loss and a gain at once.** One technology heard as another
  removes the first and adds the second. Recall counts the first and never mentions the second. The
  gate still fires on the loss, so the phantom looks redundant, but it is the very
  string the earlier turns and the interviewer's echo will repeat, and it is the
  heard form a read-back must be able to name.
- **Vocabulary biasing can insert the term it boosts.** Priming a recogniser with
  a role's terms raises the prior of every listed term everywhere, including where
  it was not said. A recognition vendor's own tuning guidance says as much: boosted
  key terms can be transcribed when they were not spoken, and no parameter
  removes the effect. The remedy for a substituted skill can therefore manufacture
  a different one.
- **A recogniser can write text over a stretch with nobody speaking.** Audits of
  open speech models have found fabricated phrases in a small share of transcripts,
  more often around long non-speech stretches and for speakers who pause more. A
  candidate who is thinking, or reading, or slow, is the candidate whose silence
  gets filled.

The third connects back to the rule that silence is never evidence about the
speaker. A long pause is a channel condition, and it is also an input that some
recognisers turn into words.

## The procedure

1. **Add the precision side to the entity metric.** For each interview with a
   reference, list the lexicon terms that occur in the transcript and not in the
   reference. Report that list beside the missing list. Both come out of the same
   alignment; the second is a set difference.
2. **Fail on a phantom the same way as on a deletion.** A transcript that adds a
   skill is as unfit to score as one that lost one. Whether a phantom fails the
   session or only marks the term unconfirmed is a policy choice; that it is
   reported is not.
3. **Run a null-audio control before a vocabulary list ships or grows.** Send
   silence, room noise and speech that contains none of the lexicon through the
   same recogniser with the list switched on, and count the lexicon terms that
   come out. The count for the shipped list is the number to record. It is cheap,
   it needs no labelled interviews, and it is the only check that sees the biasing
   cause directly.
4. **Treat a confusable pair inside one list as a measured decision.** Boosting both
   members of a pair the recogniser already swaps, or that sound or spell alike,
   raises the prior of the wrong answer as well as the right one. Keep
   the pair only if the control shows the net effect.
5. **Do not transcribe what was not detected as speech.** Gate the recogniser on
   speech detection, and treat a transcript segment that lands in a stretch with no
   detected speech as suspect. A second, independent recogniser that disagrees on
   a span marks it for review; agreement between two runs of one model does not.
6. **Say which side was measured.** A figure that reports recall only is a
   half-figure, and the record should say so
   ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Decision rules

- **A phantom is unconfirmed, never asserted.** It may appear on the scorecard as a
  term the transcript contains and the candidate has not confirmed
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
- **List every lexicon term the transcript contains in the read-back**, not only the
  ones the interviewer meant to verify, because a phantom that is never read back
  is indistinguishable from a skill. This does not make the read-back reliable; see
  the read-back technique for how far it can be trusted.
- **A term that shows up in speech and nowhere else the candidate submitted is a
  flag, not an error.** Interviews legitimately surface new things. The flag sends
  it to the read-back
  ([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).
- **Never widen the lexicon to catch phantoms.** The lexicon checks the channel. A
  larger one raises both sides of the count and buys nothing.

## When not to use it

- **Text-channel interviews.** No recognition step, no phantom.
- **Interviews with no reference and no read-back.** The set difference needs a
  reference; without one the technique reduces to steps 3 to 5, which are still
  worth running on the recogniser itself.
- **As a replacement for the recall gate.** Deletions and phantoms are different
  errors with different remedies, and both are reported.
