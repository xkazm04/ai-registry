---
layer: technique
type: technique
subject: interview-story-portfolio
technique: practice-score-needs-outcomes-before-it-is-trusted
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-predictor-cannot-grade-its-own-labels, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a practice rubric is being treated as a forecast of interview results, a tool declares itself calibrated after a few real interviews, deciding whether to rescale a practice rubric on interviewer feedback]
---

# Practice score needs outcomes before it is trusted

A candidate scored over many practice sessions on a fixed rubric is holding a predictor
whose accuracy is unknown. It might forecast real outcomes well, badly, or not at all, and
nothing about how it feels to use it distinguishes the cases. The only evidence is what
happened in real interviews afterwards, and that evidence is slow, scarce and noisy. The
technique is about how much evidence is enough before any claim is made, and what to say
until then.

This is the candidate-coach version of a question the hiring side asks at scale. The
employer has thousands of outcomes, a held-out sample and proper scoring rules; the
candidate has a handful of outcomes and no holdout. The employer's thresholds do not
transfer and are not borrowed here.

## Why a few outcomes calibrate nothing

A simple rule found in practice is to declare the scoring calibrated once three real
outcomes exist, and then to move the scoring by a half-point when interviewer feedback
disagrees with it. Both halves fail.

**Three outcomes are consistent with chance.** Suppose a practice score is worthless: it
has nothing to do with outcomes. With three outcomes of which one was a rejection, the
chance that the rejection happens to carry the lowest score is one in three, so a
useless rubric looks like a perfect predictor a third of the time. Four outcomes split two
and two separate perfectly by luck one time in six; five split three and two, one in ten.
Perfect agreement at these sizes is weak evidence, and imperfect agreement is no evidence
at all. When every outcome so far went the same way there is nothing to compare, which is
a degenerate sample, not a good one. [A claim carries its sample and its
basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis): a verdict that cannot
state how many outcomes support it, and how small that is, should not render.

**Outcomes are not the score.** An outcome depends on the competition for the role, the
fit between the person and the specific job, what the employer needed that week, and
internal candidates; and rejections frequently arrive with no reason at all. Even a
perfect rubric would produce a poor correlation with outcomes, so a weak correlation says
little about the rubric. The outcome is weakly the score, and the confounds do not average
out at a sample this small.

**The check grades itself.** If the rubric is adjusted after seeing the outcomes, and then
declared accurate because it now matches them, the same data both tuned the predictor and
tested it. [A predictor cannot grade its own
labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels): an adjusted score
compared against the outcomes that moved it will agree, by construction. A tuned rubric
needs outcomes it has not yet seen.

**The adjustment is finer than the instrument.** A half-point step on a coarse rubric,
applied on one interviewer's remark, is smaller than the unmeasured noise of a single
practice scoring and is far more precise than anything the evidence resolves. It also
changes the scale: a rubric moved by half a point is a different rubric, and earlier
scores on the old one are not comparable. [A verdict is bound to what it
judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged): stamp each score with the
version of the rubric it was given under, and never silently re-mean old scores.

## The states a practice score can honestly be in

Make "cannot tell yet" a first-class state with its own name, not an absence:

1. **No outcomes.** Nothing to compare. The score is a practice instrument.
2. **Too few outcomes to tell.** Some exist, and the evidence is below the point where
   agreement or disagreement means anything. State the count. This is the usual state for
   a candidate across an entire search.
3. **Enough outcomes, and the score separates them.** A claim of consistency, stated with
   its count and with the confounds named.
4. **Enough outcomes, and the score does not separate them.** The rubric needs review;
   this is a finding about the rubric, not about the candidate.

There is no fixed count that moves a candidate from state 2 to state 3, and inventing one
would repeat the mistake being corrected. The principle: the evidence must be large enough
that chance separation is rare. That is a double-digit count of outcomes for any claim of
real accuracy, and almost no candidate reaches it in one search. So the practical
conclusion is that most candidates stay in state 2 for good, and that is a legitimate
answer: the score is then used for what it can bear, to compare a candidate's answers
against their own earlier answers on the same rubric version, and to rank which areas to
work on. It is not offered as a forecast.

## When to trust external feedback over the score

Interviewer or recruiter feedback is stronger evidence than the internal score only when
it **names a specific behaviour**: "the second answer wandered", "I could not tell which
part was yours". That is a reading of a particular answer by someone who heard it. "Not
quite the right fit" is not feedback; it is a decision with a polite wrapper, and
treating it as evidence against a dimension fabricates a link. Even specific feedback
arrives after the decision and may be a rationalisation of it, so it is a hypothesis about
one dimension, tested in rehearsal, never a reason to rescale the rubric. Where feedback
and score disagree, the useful response is a targeted drill on the named behaviour and a
record of the disagreement, not an adjustment.

When practice scores are high and outcomes poor, the candidate has a short list of
factors the rubric does not measure (energy, rapport, pacing, the questions the candidate
asked, the format). They are worth investigating as hypotheses, each with something to
vary and watch; but they are also a reminder that the rubric was only ever part of the
story.

## How to report it

Every statement of accuracy carries the count and the state: "four outcomes, too few to
tell", never "calibrated". A tool or coach that has no outcomes says so before it gives a
number. And what the candidate hears about adjustments is plain: the score has not been
changed, here is what the feedback said, here is what we will practise.

## When not to use this

A candidate in a large cohort of structured, repeated interviews with scored feedback (a
programme with hundreds of participants) has the sample for a real validation, and should
be treated as the employer-side version, with proper scoring and a holdout. A coach asked
only to rank practice answers within a session needs no calibration claim at all; the
discipline begins when someone says the score predicts.
