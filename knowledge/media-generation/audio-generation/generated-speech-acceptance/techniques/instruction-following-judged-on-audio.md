---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: instruction-following-judged-on-audio
status: forged
laws: [output-never-outruns-evidence, checkability-routes-the-pixel]
shared_with: []
use_when: [scoring whether speech follows a style, emotion or role instruction, the judge model a benchmark used has been retired, comparing style scores across two judge versions, deciding what a listening judge may and may not decide]
---

# Instruction-following judged on audio

Whether speech carries the requested emotion, delivery style or role has no
deterministic checker. It is scored by a judge model that listens to the audio
and a rubric that says what to look for. A judge is an instrument: it has an
identity, a version, a run-to-run spread, and a lifespan shorter than the
benchmark that used it. Most of the discipline is treating it as one.

## Route by checkability first

Before a judge hears anything, take out what code can check. Speaking rate,
duration, loudness, pitch level and the presence of a pause are measured, not
judged; a judge asked about them adds noise to a fact. The judge is reserved
for attributes only a listener can verify: whether the emotion reads as
intended, whether the delivery fits the scene, whether the role sounds like the
role. Every attribute has one authority, and a judge that also "checks" the
speaking rate creates two authorities that will disagree.

## Design the judgment

A workable judgment is narrow. Ask a per-item verdict against a rubric that
names the attributes the instruction actually commits to and tells the judge to
ignore what it does not (naturalness and pronunciation are other axes), and
average the verdicts over the item set. Tell the judge not to trust the
description over its own hearing, and to treat degree words ("very excited") as
demanding, since a delivery is usually less intense than the words describing
it; a published rubric for this task says exactly that. Fix the rubric
text and the prompt: they are part of the instrument, and a reworded rubric is a
different judge.

## Score the natural reference through the same judge

Where the benchmark ships reference recordings the instructions were derived
from, score them through the same judge. The result is the judge's own reading of
material that is right by construction, and it is rarely close to perfect,
especially on the most subjective task. It is a reference, not a ceiling: a
strong synthetic system can score above its own reference recordings, which
says the judge is generous, not that the system is better than a person. Report
the reference row beside every system row.

## When the original judge is gone

Judges retire: a preview model is withdrawn, an alias moves, a vendor sunsets a
version. Then the new judge's score is not the published score, and putting the
two in one row repeats the comparability failure. The repair is a **replay**:

1. Run the replacement judge over the benchmark's own reference recordings,
   using the benchmark's rubric verbatim.
2. Compare each axis's aggregate to the published aggregate for the reference
   row.
3. Take the tolerance from the replacement's own run-to-run spread: repeat the
   replay several times, and treat two aggregates as aligned only if the gap is
   inside that spread. A tolerance chosen by feel ("broadly aligned") lets a
   move of a couple of points in either direction pass on some axes and not
   others, with no principle.
4. State the outcome per axis: aligned, shifted (by how much, in which
   direction), or not established.
5. Name which published aggregate was the target. The reference row of one
   benchmark appeared in two published sources, the paper's table and the
   project's own repository, and the two differed by up to nearly four points
   on individual cells, more than the replay itself moved. Where the publisher
   gives two, run the comparison against both and treat the distance between
   them as the least tolerance the replay can claim. A replay compared against
   an unnamed one of them is compared against an unstated number.

In one such replay, over a benchmark's English and Chinese reference audio,
the replacement judge moved individual axes, against the repository's row, by
up to about two points in either direction (one axis up by 1.5, another down
by 2.2), and about four against the paper's row; the two runs also had
different numbers of scored items, and the write-up called the result
broadly aligned. Without a tolerance from the replacement's own spread that
sentence has no content: a shift of two points may be inside the judge's
ordinary run-to-run range or well outside it, and only a repeated replay says
which. A judge held at zero temperature narrows that range without erasing it;
measure it.

The replay certifies an **aggregate**. It says the replacement gives about the
same overall reading of the reference set. It does not say the replacement would
have given any single item the verdict the original gave: two judges can agree
on the average and disagree on half the items. Never use it to carry
item-level rows across, and never use it to convert an old judge's numbers into
the new one's scale.

## Count the items the judge could not score

A judge call fails: the response is unparseable, the request is blocked, the
service errors. Retry a bounded number of times, then record the item as
unscored, exclude it from the denominator, and report the valid and unscored
counts beside every rate, per instruction type. The exclusion is defensible
here because the loss sits on the instrument's side, but a rate over fewer
items than the published one is a slightly different figure, and the counts are
how a reader knows.

## State the judge everywhere

The judge's identity goes in the table header of every result it produced: the
family, the exact version or date, the rubric version. A bare "judge score" is
a number from an unnamed instrument. If a preview alias was used, record the
resolved version, because the alias will move. Do not mix judges inside one
table; a second judge means a second table.

## Guard against self-preference

A model tends to favour outputs resembling its own family's. When the judge
belongs to the same family as one of the systems under test, that system's score
carries an unquantified tilt; say so beside the row, or add a judge from
another family. This is a caveat on the number, not a calibration; whether
the judge agrees with people is measured against human labels in a different
craft, and this technique stops before any agreement statistic.

## Decision rules

- When an attribute is measurable by code, measure it and drop it from the judge.
- When the judge changed, replay before comparing, and leave the comparison
  empty if the replay is not inside the spread.
- When the judge shares a vendor family with a system under test, flag the row.
- When the reference recordings score below perfect, publish that row; do not
  normalize systems to it.

## When not to use this

A single project that scores its own runs with one frozen judge version never
crosses a judge boundary, and the replay is unneeded; the header discipline still
applies. Nor should a judge decide anything a listener must own: a clip going
to an audience is heard by a person before it ships.
