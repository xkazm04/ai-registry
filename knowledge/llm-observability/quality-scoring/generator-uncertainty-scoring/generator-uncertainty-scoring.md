---
layer: golden-path
type: golden-path
subject: generator-uncertainty-scoring
status: forged
use_when: [scoring output quality without a rubric or a judge, judge spend has no ceiling against production volume, deciding whether a confidence number may gate a response in the serving path, a serving API exposes token probabilities and nothing consumes them, a score is needed at generation time with no ground truth available]
techniques:
  - score-source-kinds
  - scorer-cost-class
  - probability-calibration-is-not-agreement
  - generator-vs-itself
  - score-source-ensembling
---

# Generator uncertainty scoring

A generator uncertainty score is a quality number computed from the
**generator's own output distribution** — the token probabilities the
serving API already returned alongside the text, or the agreement among
several responses the generator drew for the same input. It consults no
rubric, calls no second model, and compares against no reference answer.
It answers one question only: *how firmly did the model commit to what it
just said?*

Every other subject in this category presupposes a judge — a metered model
call scoring a candidate against a stored contract. The presupposition is
load-bearing and, until this subject, unstated. The contract subject types
each dimension as judged-by-model or decided by a local mechanical check
and calls that "one pipeline, two sources of score." The calibration
subject enumerates three quantities — judge-vs-human, judge-now-vs-judge-
then, judge-vs-itself. The trace-scoring subject declares, without
condition, that the scoring loop is asynchronous and read-only against the
serving path, and offers exactly one justification: the judge is a metered
call and "score everything" is a cost function with no ceiling.

A score computed from the generator's own distribution is **neither of the
two sources**, adds a **fourth quantity**, and falsifies the **premise** of
that invariant. That is the whole reason this subject exists as a subject
rather than as four footnotes: the mechanism is one mechanism, and split
across four files its premise would have stayed unwritten.

## What the number measures, and what it does not

The naive reading is that a confidence score is a probability of
correctness. It is not, and the gap is the first thing a practitioner must
internalize. A single-generation score reads how peaked the model's own
distribution was over the tokens it emitted. A multi-sample score reads how
much the model's answers agree with each other when asked the same thing
repeatedly. Both measure **self-consistency**. Neither has any channel to
the world through which correctness could enter.

So a model that is confidently, stably, repeatably wrong scores high. This
is not a corner case; it is the characteristic failure, and it is why a raw
uncertainty score is a *rank* statistic and not a probability. The measured
form of the gap is stark: on a short-answer open-domain question-answering
benchmark, a raw multi-sample confidence score carried an expected
calibration error of **0.428** — the number printed was on average more
than four tenths of its own scale away from what it delivered — which a
fitted monotone rescaling pulled to **0.031**. The ordering was informative
throughout; the level was fiction until labels made it otherwise
([probability-calibration-is-not-agreement](./techniques/probability-calibration-is-not-agreement.md)).

The corollary is a boundary the subject carries permanently. This
instrument can tell you which of two responses the model was surer of. It
cannot tell you that either one is true. Where truth is the question and a
reference exists, a mechanical dimension answers it exactly and for free;
where truth is the question and no reference exists, a judge reading against
a rubric is still the instrument, and this score is a prioritizer deciding
which cases the judge or the human sees first.

## Cost class is the first selection input, ahead of accuracy

Practitioners reach for the most accurate scorer. In this subject that
ordering is wrong, because the tiers differ in cost by orders of magnitude
and by *kind*, not by degree
([scorer-cost-class](./techniques/scorer-cost-class.md)):

a **single-generation white-box** score computed from token probabilities
the serving call already returned, at no extra call, token or millisecond,
reachable only where the serving API exposes them at all; an **N-sample
consistency** score that works against any model returning text and
multiplies generation cost and latency by N; and a **judge**, a separate
metered call to a second model carrying its own contract, drift and
calibration obligation.

Read the trace-scoring invariant again with this ladder in hand. "The
scoring loop is asynchronous and read-only against the serving path" is not
a property of quality scoring. It is a **consequence of the scorer's cost
class** — true by necessity for a judge, true by economics for an N-sample
scorer, and not required at all for a scorer that reads probabilities the
serving call already produced. Naming the invariant's actual premise is the
contribution; the invariant itself belongs to that subject and stands
unaltered wherever a metered call is involved.

The ladder also fixes the degradation rule. When the serving API returns no
token probabilities the cheapest tier is *unreachable*, not *degraded*: the
system falls back to N-sample consistency, states the fallback and its cost
on the score, and never silently substitutes one for the other. An
unavailable score is a disclosed absence, never a zero
([_laws: nullable-never-zero_](../../_laws.md#nullable-never-zero)).

## This is not a demotion of judges, and the measurement says so

There is a tempting story here — cheap judge-free scorers beat expensive
judges, so stop paying for judges. The published comparison does not
support it. Across two dozen generator-and-dataset scenarios, the
best-performing **non-ensemble** scorer was a model judge in eleven
scenarios, a multi-sample consistency scorer in seven, and a
token-probability scorer in six. The judges won the plurality. What the
same experiment establishes with force is something else: a **weighted
combination** of scorers from different families beat every one of its own
components in twenty of the twenty-four scenarios.

The finding is complementarity, not replacement, and it has a mechanism.
The three sources fail on different inputs — a judge where its rubric does
not cover the failure, a consistency scorer where the model is stably
wrong, a probability scorer where fluency and correctness come apart — so
their errors are less than perfectly correlated and averaging recovers
signal. The obligations that arrive with the combination are the
interesting part, and they are the ones a cost-driven design skips: the
weights are fit against **graded labels**, and fit **per generator and per
task**, with no evidence offered that they transfer
([score-source-ensembling](./techniques/score-source-ensembling.md)).

The one place a judge genuinely sat at chance is worth stating precisely,
because it is a selection lesson and not a verdict on the instrument class:
a *small* judge model, on a *reasoning* benchmark, scored no better than a
coin across all four of its scenarios — while a larger judge on the same
benchmark was the best scorer available. That is the calibration subject's
selection-by-discrimination rule arriving from a second direction, and the
same experiment supplies a usable heuristic for it: a model's own accuracy
on a task predicted its quality as a judge of other models on that task.

## Two frames, and naming yours is the whole discipline

Sample-to-sample variation in the generator is the same physical fact in
both frames, and it means opposite things
([generator-vs-itself](./techniques/generator-vs-itself.md)).

The gating subject wants a per-case point estimate and treats generator
variance as one of three stacked noises to be stripped out of a verdict.
That is correct there: a deploy gate asks whether *this build* is worse
than the last one, and the model's spread is noise around the quantity of
interest. A generator uncertainty scorer wants exactly that spread — a
prompt the model answers five different ways is a prompt the model does not
know, and the disagreement is the signal, not the error bar around it. The
failure is not choosing wrongly between the frames but failing to say which
one a given number is in; unlabelled, the same measurement is read whichever
way is convenient.

This is the fourth quantity, beside the three the calibration subject
already names. Agreement is judge-vs-human, drift is
judge-now-vs-judge-then, repeatability is judge-vs-itself. This one is
**generator-vs-itself**, and the apparatus is identical to the
repeatability measurement — re-run a frozen input N times with everything
held constant — pointed at the other model in the room. Same rig, opposite
subject: there the spread is an instrument caveat, here it is the product
signal.

## Where a judge-free score may sit in the serving path

The subject licenses in-path consumption, and the preconditions are exact
because the temptation to skip them is strong.

A generator uncertainty score **may** gate, route, abstain, escalate, or
select among candidates *inside* the serving path when two conditions hold
together. First, the scorer's cost class adds no metered call beyond the
generation budget already committed — a single-generation white-box score
always qualifies; an N-sample score qualifies only where N generations were
going to happen anyway, as when the product already samples candidates and
picks one. Second, the decision it feeds is a **rank** decision: this
candidate over that one, this response escalated ahead of those, this
answer withheld because it sits at the bottom of today's distribution.

It **may not** carry an absolute-level claim in the serving path without
calibration on labels from the same generator and the same task — and a
threshold is an absolute-level claim wearing a small number. A floor at 0.7
asserts that 0.7 means something stable; the calibration evidence says it
does not, until fitted. Where the fit does not exist, the honest form is a
percentile against a rolling window of the same population.

And a caution the cost ladder creates rather than removes: an in-path
score is quality apparatus whose cost has been folded into product cost,
the exact arrangement
[_the quality apparatus stays unbudgeted_](../../_laws.md#quality-apparatus-stays-unbudgeted)
exists to prevent. It is admissible only while its marginal cost is
genuinely zero. The moment a "cheap" in-path scorer starts drawing extra
samples it has changed cost class, and it belongs back on the segregated,
unthrottled scoring path with everything else that costs money.

## The boundary with the neighbours, in one pass

This subject owns the third source of score and everything that follows
from *who computes it*. It does not own rubric design, anchored levels,
weights over dimensions, or the fencing of candidate text — a
generator-uncertainty score reads no prompt, so a candidate has nothing to
talk to, and all of that stays with the contract subject. It does not own
judge-vs-human agreement, the trust verdict, judge drift, or the
repeatability floor; it borrows the *apparatus* of the last of those and
points it at the generator, which is a different quantity and stated as
one. It does not own sampling policy, spend segregation, or the read-only
serving-path invariant; it supplies the **condition** under which that
invariant binds and leaves the invariant where it lives. It does not own
dataset freezing, target matrices or the choice of which model serves the
workload. And it is not the builder-side offline harness one boundary over:
that harness has assertions a human wrote and can re-read, so it can ask
whether an answer is *right*. Here there is no ground truth at generation
time — that absence is the premise of the whole subject — so the only
question available is how surely the model said it.

## Failure modes of the naive reading

- **Confidence read as correctness.** A stably wrong model scores high, and
  the score is used to skip exactly the review that would have caught it.
- **The uncalibrated floor.** A threshold set on a raw score whose average
  absolute error against reality was over four tenths of the scale, defended
  as a number because it is written as one.
- **Calibrated on average, trusted at the edge.** Average honesty bought by
  a rescaling while the worst bin barely moves — and a floor is a worst-bin
  claim, not an average one.
- **The silent tier swap.** A serving API stops returning token
  probabilities, the system quietly falls back to N samples, and the cost
  and latency of the product change without anyone deciding.
- **Zero for unavailable.** A scorer that could not run recorded as zero
  confidence, which reads downstream as a quality collapse on precisely the
  traffic nobody measured.
- **The frame collision.** The same generator spread stripped as noise by
  the gate and reported as signal by the scorer, with no label on either,
  so the two numbers disagree and nobody can say why.
- **Weights fit once.** An ensemble tuned against one generator on one task,
  then carried across a model upgrade or a new workload as though the fit
  travelled with it.

## The techniques

- [score-source-kinds](./techniques/score-source-kinds.md) — the third
  source of score: what types a dimension by who decides, why the
  stochastic-but-rubricless kind is exempt from both existing sets of
  rules, and which dimensions may take it.
- [scorer-cost-class](./techniques/scorer-cost-class.md) — the three-rung
  ladder, the token-probability precondition, the fallback when it fails,
  and the serving-path invariant restated as a consequence of cost.
- [probability-calibration-is-not-agreement](./techniques/probability-calibration-is-not-agreement.md)
  — rank statistics do not license absolute-level claims; the measured
  refutation, and why worst-bin error is the one a floor depends on.
- [generator-vs-itself](./techniques/generator-vs-itself.md) — the fourth
  quantity, the frame discriminator, and how many samples the spread is
  actually worth.
- [score-source-ensembling](./techniques/score-source-ensembling.md) —
  combining sources that fail differently, the label dependency the fit
  introduces, and the scope the fitted weights are valid over.
