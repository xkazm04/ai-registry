---
layer: technique
type: technique
subject: conversational-assessment-validation
technique: judged-quality-as-a-separate-axis
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-predictor-cannot-grade-its-own-labels, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [measuring interviewing craft that has no crisp boundary, setting the pass mark for a model-judged conversational metric, a single quality score is being used to gate a release]
---

# Judged quality as a separate axis

Interviewing craft cannot be gated categorically. Whether a follow-up genuinely
narrowed rather than repeated, whether a probe was directive about topic but
neutral about content, whether the conversation actually covered the
competencies, whether the register stayed warm without grading — these are read,
not detected. They need a judge, they carry noise, and their gate must sit
**below full pass** on purpose.

The axis exists to answer a different question from the reliability axis. That
one asks *did the instrument do something it must never do*. This one asks *is
the interview any good*. Both must be reported; only the first has a veto.

## Why the two axes must never be averaged

A combined score does damage in both directions. It lets a leak be offset by
gracious phrasing, and it lets a stylistic quibble hold a release that is
perfectly safe. Worse, a single number destroys the diagnostic value of both
axes: nobody can tell from a drop whether the instrument became unsafe or merely
became duller.

There is also a hard measurement reason to keep the gate off the judge.
Where the operational gate reads only model-judged quality scores, measured
recall of real defects in deployed multi-turn agents runs around one fifth, and
the misses are structured rather than random. Turn-local faults are caught
reliably; the cross-turn faults — a state the agent never escapes, a guardrail
that quietly stopped applying, a referent that went stale six turns ago — are
missed, because a turn-shaped rubric has no category for them. In the same
studies the judge frequently *noticed* the anomaly and filed it under a category
the gate did not read. A judge is a regression floor beneath human transcript
review, not a replacement for it, and never the thing that decides a release.

## Designing the metrics

**Judge the conversation, not the turn.** The unit of judgment is the arc:
did the follow-up at turn six narrow what was thin at turn five, did coverage
close by the end, did the register hold across the whole session. Turn-local
scoring is what produces the blind spots above, and turns inside a conversation
are not independent observations anyway — each is conditioned on the last, so a
per-turn denominator overstates the sample by a wide margin. Report
per-conversation rates and carry the conversation count with them
([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

**Derive binary facts, not scores.** A judge asked for a number out of ten will
not give the same transcript the same number twice, and the run-to-run drift
routinely exceeds the effect being measured. Ask instead for facts that are
true or false — did the follow-up narrow, was the probe neutral, was the claim
verified, was every competency reached — and aggregate those into rates. Binary
facts compare across runs; absolute judge scores do not.

**Prefer double-barrelled conditions and label them as lower bounds.** A metric
that requires two things at once ("narrowed *and* stayed neutral") reads lower
than either part, which is exactly right: it cannot be inflated by satisfying
the easy half, and when it moves, something real moved. State the lower-bound
nature beside the number or the next reader will "improve" it by splitting it in
two.

**Keep the judge independent of the author.** A judge built from the same
instructions that drive the interviewer will grade the interviewer's
interpretation of those instructions as correct by construction
([a-predictor-cannot-grade-its-own-labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels)).
The judge reads the transcript and a rubric written for reading transcripts, not
the interviewer's own brief.

## Setting and holding the pass mark

A quality gate is a threshold on a noisy rate, and it must be set from measured
run-to-run variance rather than aspiration. The rule: **the bar sits far enough
below the observed ceiling that a passing instrument does not fail for noise,
and far enough above the observed floor that a real regression cannot slip
under.** If those two constraints cannot both be met, the metric is too noisy to
gate on and belongs in the report rather than the gate.

Two implementation choices do most of the work of keeping a judged axis stable.
**Pin the judge**, model and version, and change it as a deliberate,
re-baselined event: an unpinned judge silently re-scales every rate underneath
you and the change looks like an instrument regression. And **define a
regression as a move of more than one point on a five-point scale**, per
conversation, rather than any downward movement — a one-point drop on a
five-point judged scale is inside the noise for most rubrics, and treating it as
a signal is how a team learns to ignore the axis.

Record the reason beside the number — what variance it was derived from, over
how many conversations, on which version of the rubric. A threshold with no
recorded rationale loses every deadline argument, because the person who set it
is not in the room.

And bind the verdict to what produced it. A quality run certifies one brief
version judged by one rubric version
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged));
a rubric edit re-opens the gate rather than inheriting the last pass.

## Procedure

1. **Write each craft property as a question with a true/false answer about a
   whole conversation.**
2. **Give the judge the transcript and the property, not the brief.**
3. **Run the full behaviour cast**, and compute per-conversation rates with
   their counts.
4. **Calibrate against human reading** on a sample every release — agreement is
   the weaker check; the stronger one is whether the judge caught the defects a
   human found.
5. **Set thresholds from measured variance** and record the derivation.
6. **Report the axis beside the reliability axis, never blended into it.**

## Decision rules

- **When a quality metric fails while every reliability invariant passes, ship
  or hold on judgment — but never let it be silently waived.** A waived gate
  with no record becomes a permanently ignored gate.
- **When a judged rate moves by less than its observed run-to-run spread, it did
  not move.** Do not tune against it; that is optimising the instrument against
  judge noise.
- **When the judge and a human reader disagree systematically on one property,
  retire the metric rather than re-prompting the judge.** A property the judge
  cannot see is a property a human must read.
- **When a defect class keeps reaching production despite green quality runs,
  suspect the rubric has no category for it** — that is how cross-turn failures
  hide — and add the category before adding cases.
- **When a quality property turns out to be crisply decidable, promote it to the
  reliability axis** and give it a deterministic check. The axes are a design
  choice, not a taxonomy — and the promotion runs one way only. Demoting a
  categorical property to the judged axis to escape a failing gate is the move
  this whole split exists to prevent.
- **When a judged property can be approximated by a rule, build the rule
  anyway** and report it as an ungated count beside the judged rate. The count
  has no variance, so it shows a fix landing turn-over-turn while the judged
  rate is still inside its noise band.
- **Require a verbatim offending quote with every low score.** A judge that
  cannot point at the turn it disliked is producing an opinion, and an opinion
  cannot be acted on, argued with, or checked for being wrong.

## When not to use it

Do not put a categorical property here to avoid the pain of a full-pass gate —
leakage, verdicts and language drift do not become negotiable by being judged.
Do not use a judged axis at all where the cast is too small for a rate to mean
anything; report the transcripts and read them. And do not let this axis stand
in for validating the *scores* the interview eventually produces: whether the
resulting rating separates candidates is the neighbouring practice on assessment
instrument validation, and whether it predicts anything is calibration.
