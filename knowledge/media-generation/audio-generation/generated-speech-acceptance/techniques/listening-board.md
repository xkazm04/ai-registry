---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: listening-board
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [choosing between speech generators or voices after the scorers have run, a speaker-similarity ranking and a listener disagree, presenting cloned voices for a decision, the scores of two candidates are close, deciding which clips a decision-maker must hear, the same engine was run on two devices and someone asks whether the voice changed]
---

# The listening board

The golden path ends on a rule this subject's other techniques cannot
discharge: the scorers narrow what a person must hear, they do not replace
hearing. This technique owns the hearing. A **listening board** is the
artifact a listener decides from — every candidate's clips laid out so that the
comparison the decision needs is the comparison the ear actually makes — and
the record of what the listener decided, beside what the scorers said.

It exists because an unstructured listen produces an impression, and an
impression cannot overrule a number. A board produces a verdict per question,
and a verdict can. When the two disagree, the disagreement is a finding about
the scorers, not noise around them.

## Group by line, not by candidate

A listener compares what is heard close together. A board organised by
candidate — every clip from engine A, then every clip from engine B — asks the
ear to hold a voice in memory across minutes, and it compares whichever lines
happened to be memorable. So the board is organised **by line**: one sentence,
every arm, adjacent. The listener's question becomes "which of these said
*this* better", which is a question the ear answers well.

Choose the lines for what the scorers cannot hear, not for coverage:

- **a short opening line**, where onset, the pause before speaking and pace
  are exposed;
- **a connected reply of two sentences**, where prosody has to carry across a
  boundary;
- **a long line carrying numbers, a proper name and a closing question**, where
  number reading, name stress and a final rise either survive or do not.

Three well-chosen lines are enough for a ranking whose differences are
several-fold. They are not enough to separate close candidates, and the board
says so rather than implying it.

## Put the anchors on the board, not only in the scorer

The similarity axis is calibrated by two anchors — the same speaker saying
something else, and a different speaker
([three-axes-beside-intelligibility](./three-axes-beside-intelligibility.md)).
The board carries the same anchors as audio, at the top of every cloned table:

- **the reference** each clone was given, so the target is one play away;
- **a held-out natural clip of the same speaker**, never shown to any engine,
  which is what "as close as possible" sounds like — and is the ceiling the
  similarity scale was set against.

A listener who has just heard the ceiling judges a clone against it. A
listener who has only heard the clones judges them against each other, and the
best of a weak field sounds like success.

## Everything measured is audible

Every clip that produced a number is reachable from the board, including runs
kept out of a median and takes from a device variant, each labelled with why it
is there. A clip the listener cannot reach cannot overrule its score, so a
board that shows only the chosen takes has quietly let the scorer decide the
rest ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)):
the unheard clips were not accepted, they were not examined.

Device variants go side by side. For a generator that samples, two runs on two
devices are two takes, and differ the way two takes of one actor do; label
them as takes, so the listener is not invited to hear a device effect that is
not there. For a generator that does not sample, a difference between device
runs is a real finding, and "no difference" is a listening verdict worth
recording, because it is what licenses letting the device be chosen for speed.

## Like for like, one clip at a time

Only one clip plays at a time; starting a clip stops the last. Present every
clip in the same container at a stated sample rate, with leading silence
treated consistently, and match loudness where the board supports it — a
louder clip is rated better regardless of voice, and a lossy clip beside an
uncompressed one is recognised by its codec. Where the decision should not know
the brand, randomise the order and hide the names until after the pick; where
it may, say that the board was labelled. Scorers run on the original renders,
never on the listening copies.

The numbers sit under each clip — speed, similarity, error rate — printed and
subordinate. They are there so the listener can see what the instrument said
about the clip being heard, and so a disagreement is visible at the moment it
happens.

## Ask the questions the scorers cannot answer

A board ships with a short **listen-for list**, and each item is derived from a
known blind spot of an instrument on the board:

- **Timbre, or timing too?** An embedding hears timbre far better than delivery.
  A cloner that continues its reference like a recording can copy the
  reference's pauses and pace along with its voice, and the similarity score
  does not object. Whether that is wanted is a listener's call.
- **Texture.** Does a smaller or faster model keep the grain, breath and edge
  of the voice, or produce a generic voice of the right register?
- **The long line.** Numbers, the name, and whether the closing question rises
  — the round-trip error rate hears the words, not the intonation.
- **Device takes.** Is the voice the same, or only the words?
- **Made against chosen.** Is a voice authored from words or a sample worth its
  cost over a stock voice, heard on the same line?

The list turns "which do you like" into answers per axis, which is what lets a
verdict be recorded and compared later.

## Record the verdict beside the ranking

The output of the board is a record, not a mood:

- **the listener's choice per use** — a listener can pick one candidate for
  live replies and another for prepared content, and the uses are recorded
  separately;
- **the scorers' ranking beside it**, from the same clips;
- **where they disagree, the audible cause if one was heard, or "cause not
  traced"** — never an inferred one;
- **who listened and how many** — one listener's verdict is a product decision
  and a preference, not a population opinion score, and the record says so
  ([output-never-outruns-evidence](../../../_laws.md#output-never-outruns-evidence)).

Two readings follow from the record. **A scorer lead smaller than the set can
resolve is a tie**, and a tie is broken by the listener, not by the second
decimal. And **a listener who overrules the top score is evidence about the
score**: if it happens repeatedly on the same kind of clip, the blind spot has a
name and the next board adds a question for it.

## When not to use this

A regression check on a fixed, already-accepted voice, where nothing is being
chosen and the scorers are calibrated, does not need a board; route the clips
the screens flag to a listener instead. And a board is not a consent check:
a clone the listener loves is still a likeness, and whether it may exist or
ship is decided outside this subject.
