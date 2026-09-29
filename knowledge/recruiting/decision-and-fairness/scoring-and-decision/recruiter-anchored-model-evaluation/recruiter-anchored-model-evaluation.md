---
layer: golden-path
type: golden-path
subject: recruiter-anchored-model-evaluation
status: forged
use_when: [deciding whether machine-written hiring text may reach a recruiter or a candidate, a model comparison came back with every model scoring the same, writing the rubric a judge model will score generated artifacts against, a benchmark cell looks bad and nobody knows whether the model or the plumbing failed]
techniques:
  - decision-anchored-score-bands
  - task-definition-matches-the-real-deliverable
  - evidence-grounded-correctness
  - unverifiable-is-not-fabricated
  - separate-quality-from-reliability
  - never-judge-a-fallback-as-the-models-work
---

# Recruiter-anchored model evaluation

A hiring process now runs on machine-authored text. The advert a candidate
reads, the summary of a résumé a recruiter skims before a call, the fit
assessment beneath a shortlist position, the rejection message, the outreach
sequence, the interview brief handed to a panel — all of it is drafted by a
model and then, in the good case, edited by a person. Every one of those
artifacts is a decision surface: somebody acts on it, and the person acted upon
is a candidate.

So there is a gate. Somebody, at some point, decides that a generated artifact
is good enough to put in front of a recruiter or a candidate. That decision is
usually made by a rubric nobody wrote down, applied by a model nobody
calibrated, on a scale nobody anchored. This subject is the craft of making that
gate real: **defining the deliverable in the terms a practitioner would use,
defining every score band by the decision that band implies, and grounding
correctness in the evidence that was actually supplied.**

The unit of judgment here is an *artifact*, not an instrument and not a score.
That is the seam with the neighbouring practices. Validating a work sample —
whether it separates people who differ, whether it can be gamed — is instrument
validation. Validating a machine interviewer — whether a live policy survives
every behaviour a candidate can produce — is conversational validation.
Validating that a number predicts something — whether a fit score tracks an
outcome — is calibration. This subject sits before all three and beside all
three: **is this piece of generated text fit to be seen by a person in a hiring
process, and how do we know.**

## The rubric is the experiment

The most expensive mistake in this domain is treating the rubric as
boilerplate around the interesting part. The rubric *is* the measurement. A
judge prompt reading "score this from one to ten, be critical" is not a strict
evaluator; it is an unspecified one, and unspecified evaluators do a very
particular thing.

They compress. Asked for a number on an abstract quality scale with no
description of what each number means, a judge model clusters its answers in a
narrow middle band and refuses the tails. Across a whole matrix of models and
use cases you then get a table where everything sits within a point or two of
the same mediocre centre, and the table gets read as a finding — *all of these
models are about equally unremarkable* — when it is not a finding about models
at all. It is a property of the question. The tails were never available.

The tell is diagnostic and worth learning: **when a model comparison produces
almost no spread, suspect the rubric before the models.** Real generation
quality across a modern model matrix on a hard drafting task is not
uniform. If your instrument says it is, your instrument has one usable band.

Compression has a direction, and the prompt sets it. "Be critical" on an
undescribed scale tends to pile answers in the middle; a lenient prompt piles
them at the top; and an anchored rubric can move the pile rather than remove
it. In the measured matrix recorded in the applications, re-anchoring moved
the pile from the middle of the scale to the top: nearly all judged answers sat
on two adjacent integers and the top integer was never awarded. Both ends of
the scale need a probe, not only the middle, and whether a top-heavy table is
genuine quality or a lenient judge is only decidable with a known-bad artifact
planted in the run. The same matrix also shows the rubric is the first suspect
and rarely the only one: it was one of five causes of the flat table, beside output ceilings that truncated
large deliverables, templates shipped as model output, prompts that starved the
model of the evidence it was asked to use, and a stale seed corpus. Suspect the
harness before the models, and read the judge's own issue lists before trusting
a low cell.

Score compression is only the most visible of a family of judge pathologies that
are by now well documented and worth designing against explicitly: judges reward
length independent of substance, they prefer whichever candidate output they
saw first (or last, depending on the judge), and they systematically fail to
penalise errors in text whose style resembles their own. None of these are
fixed by telling the judge to be objective. They are reduced by removing the
judge's discretion over what the scale means — which is the whole programme of
this subject — and by mechanical countermeasures: randomise presentation order,
never let a model be the sole judge of its own family's output, and prefer
questions with checkable answers over questions of taste. Two of those are
properties of a particular run, not of a design, and are worth checking there: a
harness can declare its judge independent and then route a target through the
judge's own engine, and a pointwise judge has no order to randomise but does have
run-to-run inconsistency to measure
([decision-anchored-score-bands](./techniques/decision-anchored-score-bands.md)).
The size of each bias is also judge-specific: reported verbosity effects range
from negligible to large across vendors, and self-preference appears to run
partly through how familiar the text is to the judge rather than through family
membership ([Wataoka et al. 2024](https://arxiv.org/abs/2410.21819)), so a judge
from another vendor lowers the risk without removing it.

## Anchor the bands to a decision, not to an adjective

The repair is small to write and changes everything downstream. Do not define
score five as "good" and score three as "mediocre". Adjectives are exactly the
thing the judge has no shared referent for. Define each band by **the action a
practitioner takes with this artifact in hand**:

- ship it as it stands;
- ship it after a small edit;
- usable as a draft — the shape is right, the substance needs work;
- misleading or badly incomplete — it would mislead the reader or omit
  something the reader needs;
- unusable — it does not do the job at all.

Now the bottom band is reachable, because "would this mislead a recruiter" is a
question with an answer, whereas "is this poor" is a question with a mood. And
the top band is reachable too, which matters more than teams expect: a rubric
that makes excellence unreachable cannot show a model improving, so it cannot
justify a model change, so it stops being consulted.

There is a second, quieter benefit. Decision anchors make the score *portable
across readers*. A recruiter, an engineer and a compliance reviewer can disagree
violently about whether a summary is "strong" and agree immediately about
whether they would send it unedited. That is what makes a judged number
arguable — and a number nobody can argue with is a number nobody can correct.
[decision-anchored-score-bands](./techniques/decision-anchored-score-bands.md)
carries the construction, including the rule that the number of bands is set by
the number of genuinely different actions, not by a preference for round scales.

## Judge the deliverable that was actually asked for

A rubric can be perfectly anchored and still measure the wrong thing, because
the judge was told to evaluate "a candidate summary" when what the pipeline
asked for was *three to five bullets a recruiter can skim in ten seconds before
a screening call, each bullet naming the evidence it rests on.* Those are
different artifacts. Judged against the vague description, a beautiful
four-paragraph essay scores well and is useless in the workflow it was built
for.

So each use case in the evaluation gets its own task definition, written in the
domain's own language, describing the real deliverable: who reads it, what they
do next, what must be present, and in what shape. Write it as the practitioner
would brief a competent new colleague. This has a side effect worth planning
for: **the set of task definitions becomes a compressed specification of every
machine-authored artifact in the hiring process** — which is often the first
time anyone has written that down, and it will expose two use cases that are
secretly the same and one that nobody can describe.

A task definition also has to say which parts of a composite artifact are the
model's at all. Many generated deliverables are assembled: the model writes some
sections and the surrounding tool merges in a fixed skeleton unchanged — a
canonical interview structure, a reviewed closing paragraph, a standing notice.
Those parts are identical in every row, and a judge that scores them is
measuring the template with the model's name on the column.

Task definitions also carry the domain rules that a generic quality scale cannot
see. Duties belong in a role's descriptive prose, while the requirements list
holds candidate qualifications only — a model that files "will run the weekly
pipeline review" under requirements has produced fluent text and a
mis-specified advert, and only a domain-aware task definition catches it. A
sourcing pack may use only the facts supplied about the role and must never
invent pay, benefits, or testimonials — an invented benefit is a promise made to
a candidate by nobody
([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).
These rules live in the task definition, not in the judge's general instincts.
[task-definition-matches-the-real-deliverable](./techniques/task-definition-matches-the-real-deliverable.md).

## Three questions, not one number

Collapsing an artifact to one score destroys the diagnosis. Score at least
three dimensions, each against **its own question**, and never average them
into a headline that stands in for the diagnosis:

- **Is this about this candidate, or could it be pasted onto any candidate?**
  The single most common failure of generated hiring text is generic praise
  with the name changed. It is fluent, it is inoffensive, and it carries no
  information — which makes it worse than a blank field, because a blank field
  does not look like evidence.
- **Is every claim supported by the evidence provided?** Not "is it true" —
  supported, by what was in the input.
- **Is every part of the asked deliverable present, in the asked shape?**
  Completeness against the task definition, not against a general sense of
  thoroughness.

Then instruct the judge, explicitly, to use the whole range on every dimension —
a flawless artifact must reach the top band, a broken one the bottom, and across
a set of models most outputs should not land on the same number. That last
sentence is not decorative; without it, anchored bands still get under-used at
the tails.

Two mechanical points make the dimensions trustworthy. Decide the *structural*
facts deterministically before the judge sees anything — schema validity,
presence of required fields — and hand the judge that verdict alongside the
output, so it reads rather than re-derives it. And aggregate across scenarios
with a median, not a mean: judged scores are noisy, and one catastrophic
scenario should not decide a cell.

Keeping the dimensions separate is what makes the result actionable: a model
that is specific and grounded but keeps dropping a required section has a prompt
problem, and a model that is complete and generic has a retrieval problem. The
averaged score says only "six".

The rule is against the composite *replacing* the dimensions, not against ever
composing them. Choosing one model for one job needs a single ordering, and the
defensible version weights the dimensions by what each kind of error costs (an
invented claim is worse than an untidy one), fixes the weights before the result,
prints them beside the pick, and keeps the three medians in the record for whoever
has to challenge it
([separate-quality-from-reliability](./techniques/separate-quality-from-reliability.md)).
A floor on the dimension that carries harm — a contradicted claim — acts as a
veto rather than a weight, and a reliability figure gates the composite instead
of entering it.

Resolution is the other half of trusting a judged number. A judged cell built
from a handful of scenarios cannot separate models a fraction of a point apart:
published measurements of judge-scored benchmarks put the noise floor of a
single judge above the size of the improvements usually claimed
([Ask Which, Not How Good, 2026](https://arxiv.org/abs/2609.27787)), and adding
scenarios does not lower the part of that noise that belongs to the judge.
Report the interval, treat a difference inside it as a tie, and for the close
cluster at the top of the table run a second judge, repeated judgements, or a
pairwise pass rather than reading the order.

## Grounding: unverifiable is not fabricated

The grounding dimension has a failure mode severe enough to deserve the
subject's sharpest rule, and it is the one most teams get backwards.

A judge reads the artifact against an evidence excerpt — the parsed résumé
fragment, the supplied role facts, the interview notes. It finds a claim not
present in that excerpt. The naive rubric calls this a fabrication and
penalises it. That is wrong, and it is wrong in a way that systematically
misranks models.

The excerpt is not the world. It is a truncated slice of a longer document,
chosen by a retrieval step, capped by a context budget. A claim outside it may
be false, or it may be perfectly true and simply held by the part of the
document the excerpt did not carry — or by the model's general knowledge of a
technology, a certification, an industry. **Only a direct contradiction of the
supplied evidence is a grounding failure. Everything else is unverifiable, and
unverifiable is a different verdict with a different consequence.**

Get this backwards and you build an evaluation that rewards models for saying
less, and you punish the ones that read further into the document. Get it right
and the grounding dimension measures what it claims to
([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
This mirrors the distinction the faithfulness literature draws between a claim
that contradicts the source and one the source neither supports nor denies; they
are separate categories with separate costs, and only the first is a lie.

The rule is tied to the excerpt being a slice. When the judge holds the whole
record the artifact was built from, a specific checkable assertion about the
person — an employer, a credential, a date, a figure — that the record does not
carry is unsupported, and an unsupported figure in a document about to leave the
building is a defect to repair, not a neutral. Two working systems in the
evidence sit on either side of this line for exactly that reason: a judge over a
truncated excerpt calls the same absence unverifiable, and a deterministic gate
over the full source set blocks it. Decide which you hold before choosing the
label, and never let the truncated case's leniency migrate to the whole-record
case.

Note the downstream consequence, which belongs to a neighbouring practice but
must be honoured here: *unverifiable* is a real state that the artifact should
be allowed to express, and the refusal-and-labelling practice owns the grammar
for saying so. The evaluation's job is not to punish the model for having the
courage to mark something uncertain. See
[unverifiable-is-not-fabricated](./techniques/unverifiable-is-not-fabricated.md)
and [evidence-grounded-correctness](./techniques/evidence-grounded-correctness.md).

## Quality and reliability are different axes with different pass marks

An evaluation of generated artifacts is measuring two unrelated things, and
blending them corrupts both.

**Reliability** asks: did the generation attempt actually produce the artifact?
Did the call complete, did it return within budget, was the output the shape the
pipeline needed, did every required field arrive. These are categorical facts
about the pipeline. **Quality** asks: given that an artifact arrived, is it any
good? That is a judged matter of degree.

They must be reported side by side and never averaged, because they have
opposite remedies. A model that produces excellent text and fails one call in
five needs infrastructure work. A model that never fails and writes generic
filler needs a different prompt or a different model. One blended number says
neither. And the pass marks differ in kind: a reliability failure at any
material rate is disqualifying for a candidate-facing path, because the
candidate does not experience the average
([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)),
while a quality gate sits deliberately below full marks because judged scores
carry noise. Two conditions keep that from being misread. A fallback that ships
a labelled, gated template is a degraded delivery, not a stalled process, so the
disqualifying bar belongs on failure to deliver anything, and the fallback rate
gets its own bar. And a floor has to be resolvable at the size of the cell it is
applied to: with four attempts per cell a 0.9 floor is the rule "no fallback at
all", because one fallback already reads 0.75, and a perfect four out of four
cannot be told from three out of four at any usual confidence. Apply the floor to
pooled attempts, or with an interval, or a single row will decide the routing.

This two-axis split is shared craft with the practice on validating machine
interviewers, but the axes are not the same axes. There, reliability means
conversational invariants — no leaked instructions, no verdict delivered to the
candidate, no language drift. Here, reliability means the artifact-production
attempt itself. Do not import one axis's checklist into the other.
[separate-quality-from-reliability](./techniques/separate-quality-from-reliability.md).

## A fallback is not the model's work

The rule that follows from the split, and the one that is broken most often in
practice: **when the pipeline substitutes deterministic output for a failed
generation, that output must never be scored as the model's quality.**

Most mature pipelines degrade rather than fail — a template, a cached prior
version, a rule-based summary — because a candidate's process must not stall.
That is correct behaviour, and it is also a contaminant. A deterministic
fallback is stylistically consistent, mildly generic and structurally complete,
so a judge scores it in a predictable middling band. Feed those into a model's
quality cell and you have averaged a model's real output with a template's, and
the resulting number describes neither. Worse, the contamination is *biased*:
the models that fail most often get the most template rows, which pulls their
quality toward the template's score. The direction is the sign of the template's
score minus the model's, not a constant. A rich template scored in a middling
band flatters the unreliable model; a thin stub — an empty scorecard, a skeleton
case design — scores far below any real answer and punishes it, and in the
measured records the judged fallbacks all landed below the same operation's
real answers. Either way the comparison flattens toward one value.

The mechanics: mark every fallback at the moment it is emitted, in the record
itself, not by pattern-matching the text afterwards; exclude marked rows from
every quality statistic; count them, prominently, on the reliability axis; and
carry the surviving sample size beside every quality number, because a cell
built from three surviving runs is not comparable to one built from thirty
([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
[never-judge-a-fallback-as-the-models-work](./techniques/never-judge-a-fallback-as-the-models-work.md).

Four extensions of the rule earn their place. Exclude fallbacks from **every**
statistic that describes the model's answer, not just quality — including a
structural pass rate, which a template passes by construction and which would
otherwise read "valid 100%" for a model that never once served — and give every
report of the same run one definition of the model's own rows. But do not assume
the premise that a template is instant and free: whether the row's time and
spend include the failed generation that preceded it is a property of the
record. Where they do, the fallback rows are the slow, paid ones, and dropping
them from the per-answer figures is right only if the cost of the failed
attempts is reported on the reliability axis beside them. Third, a mark that
compares the final output with the template catches a whole payload replaced
and misses a hybrid: a coercion that keeps the model's numbers and backfills an
empty rationale from the template still passes as the model's own. Where
backfill is per field, the record needs a per-field or per-row provenance mark,
or the hybrid rows are judged as the model's. And watch where the fallbacks come from — the most
common cause is not a provider outage but a limit the team set themselves. An
output budget tuned for short artifacts truncates a structurally large
deliverable, the truncated output fails its parse, the template ships, and a
capable model is written off on numbers that describe a configuration. Check
that the budget binds every arm alike: an arm run through a route with no output
ceiling never shows the truncation, so the artifact falls on the arms that have
one and reads as a difference between vendors.

The same discipline catches a nastier class of defect. If a route claims a
capability the underlying provider does not truly have — document reading,
structured output, a long context — the request can succeed, return a
well-formed artifact, and be based on nothing, because the part that mattered
was silently dropped on the way. That is not a reliability failure by any
naive definition: nothing errored. It is a *person evaluated on an empty
prompt*, and the evaluation will happily score the resulting fluent, generic
text as mediocre-but-acceptable. The defence is to treat a declared capability
as a claim to be verified with a probe whose output is impossible without the
capability, and to treat an artifact produced by a degraded route as a fallback:
excluded from quality, counted on reliability. The same class covers a route
that lacks a capability it claims to have in the other direction: a text-only
route asked to research the open web will answer, fluently and with no sources,
from what it already holds. Declare such a capability only where a door that
actually opens it exists.

## What this subject does not own

The scaffolding around a judged evaluation — how provider seats are held, how
runs are metered and priced, how responses are cached, how judge calls are
traced and retried, how a matrix run is scheduled — is the neighbouring
observability practice's territory, and it is a genuinely separate discipline.
This subject owns **what the judge is asked to judge and how its bands are
anchored to a hiring decision.** When those two are confused, teams build
excellent telemetry around a rubric that measures nothing.

Its method also needs a fixed input: the excerpt the judge grounds against is
frozen, and the same scenarios can be run through every arm. An artifact whose
input is a live search of the open web has no such excerpt and cannot be judged
this way; it needs a check on the sources it cites, and a measured matrix should
list it as unmeasured rather than score it on a proxy.

Equally, this subject stops at the artifact. Whether the *score* attached to a
candidate predicts anything, whether the instrument separates people, whether a
shortlist ordering is fair — all downstream, all elsewhere.

## The failure modes of the naive reading

**"We already have an eval — it scores every output one to ten."** An unanchored
scale is a compression device. Check the spread before trusting the ranking.

**"The judge is a strong model, it knows what good looks like."** It knows what
*fluent* looks like. What "good" means for a screening summary read in ten
seconds before a call is a domain fact that has to be supplied.

**"The judge reached both ends of the scale, so it is calibrated."** That shows
the tails exist, not that the judge puts an artifact where a recruiter would.
In a study of two expert domains, judges agreed with domain experts on overall
preference about two times in three, and a later comparison found judges agreeing
with each other more than with the human labels, so have the people who receive the artifact place a small
sample blind and report the agreement beside the scores
([decision-anchored-score-bands](./techniques/decision-anchored-score-bands.md)).

**"We average the dimensions for the leaderboard."** Then the leaderboard cannot
tell a grounding problem from a formatting problem, and every fix is a guess.

**"Anything not in the evidence is a hallucination."** Then the evaluation
rewards models that say less, and the excerpt's truncation is silently promoted
to ground truth.

**"The pipeline never crashed, so reliability is fine."** A silently dropped
attachment, a degraded route and a template fallback all return a clean success.
Reliability is measured on what the artifact was built from, not on the absence
of an exception.

**"One bad cell means the model is bad."** It may mean the model never ran. Look
at the surviving sample before ranking anything.

**"A judged score is a verdict."** It is a reading, bound to one rubric version,
one task definition and one evidence excerpt
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
Change any of the three and the gate re-opens. And no artifact clears this gate
into a candidate's hands without a person who owns having sent it
([every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)).
