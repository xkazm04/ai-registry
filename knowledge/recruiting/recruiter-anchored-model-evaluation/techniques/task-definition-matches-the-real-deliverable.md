---
layer: technique
type: technique
subject: recruiter-anchored-model-evaluation
technique: task-definition-matches-the-real-deliverable
status: forged
laws: [say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [writing the per-use-case brief a judge scores generated hiring text against, a judge is rewarding output the workflow cannot actually use, cataloguing every machine-authored artifact in a hiring process]
---

# Task definition matches the real deliverable

Before a judge can grade an artifact it must be told what the artifact was
supposed to be — and that description must be the **real deliverable in the
domain's own language**, not a generic label like "a candidate summary".

The rule: the task definition is written as a practitioner would brief a
competent new colleague. Who reads this. What they do immediately afterwards.
What must be present. In what shape and at what length. Which domain rules
govern its content.

## Why the generic label fails

A judge told to evaluate "a candidate summary" evaluates summaries in general,
and summaries in general reward completeness and polish. The pipeline, however,
asked for three to five bullets a recruiter can absorb in ten seconds while
opening a call, each naming the evidence behind it. Against the generic label, a
polished four-paragraph essay wins. Against the real deliverable, it fails on
shape — correctly, because in the workflow it exists for, it is unusable.

This is the quiet way an evaluation becomes decorative: it keeps returning
respectable numbers while the artifacts it blesses keep getting rewritten by
hand. When practitioners routinely rewrite output the eval scored highly,
the task definition is wrong, not the practitioners.

The inverse is more damaging and much harder to spot. A stale definition that
describes a deliverable the pipeline stopped asking for — the outreach step now
produces short feed variants and a fifteen-second script, while the definition
still says "channels, copy and targeting" — marks every model down on
completeness for correctly doing the job it was given. The whole column then
reads as model weakness when it is **a judge artifact**. Any use case where all
models fail the same dimension should be treated as a suspect definition until
proven otherwise.

## Writing one

Each use case gets its own definition, and it carries five things:

1. **The reader and their next action.** "A recruiter about to open a screening
   call." "A candidate who has just been declined." The next action is what
   makes shape requirements arguable rather than arbitrary.
2. **The required parts, named.** Not "should be comprehensive" — the actual
   sections, fields or bullet count the downstream surface consumes. Anything
   the receiving surface will render is a required part; anything it will not
   render should not be asked for.
3. **The shape and budget.** Length, format, register. A brief a panel reads in
   the room and a document filed for an audit are not the same artifact even
   when their content overlaps.
4. **The inputs the artifact may draw on.** Which supplied facts are in scope,
   and the standing rule that nothing outside them may be asserted
   ([say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)).
5. **The domain rules that a general quality sense cannot see.** These are the
   highest-value lines in the definition and the ones most often missing.

## The domain rules are the point

Two recurring examples, both of which a fluent model gets wrong and a generic
rubric scores well:

**Duties are not requirements.** In a role advert, what the person will do
belongs in the descriptive prose; the requirements list holds candidate
qualifications only. A model that files "runs the weekly pipeline review" under
requirements has produced attractive text and a mis-specified advert — and a
mis-specified advert changes who self-selects out, so this is a fairness defect
wearing a formatting costume. The requirements list is also where inflation
lives, which a neighbouring practice owns; the task definition's job is to make
the misplacement visible to the judge at all.

**A sourcing pack uses only supplied job facts.** No invented pay range, no
invented benefits, no invented employee testimonial. Generated compensation and
fabricated quotes are the two most common inventions in outreach copy, they are
the most attractive to a reader, and they are promises made to a candidate by
nobody. Name them in the definition as prohibited, explicitly, because a judge
asked only for "quality" will score an invented benefit as a strength.

Every domain has its own such rules. Harvest them from the corrections
practitioners actually make.

## Two boundaries the definition must draw

**Name the parts the tool supplies, and exclude them from scoring.** Many
generated artifacts are composites: the model writes some sections and the
surrounding tool merges in a fixed skeleton unchanged — a canonical set of
interview phases, a legally reviewed closing paragraph, a standard equal-
opportunity notice. Those parts are not the model's work, they are identical in
every row, and a judge that scores them is measuring the template. The task
definition says explicitly which parts are the model's and which are merged in
and must not be scored.

**Carry the size of the deliverable.** A definition that asks for roughly eight
variants each with a script, or a rating per competency across a full scorecard,
describes a structurally *large* artifact — and if the generation budget was set
for ordinary short outputs, that artifact truncates, fails its parse, and the
pipeline ships a template instead. The observed pattern is brutal: a capable
model degrades to the deterministic fallback on the majority of attempts, the
fallback scores near the bottom, and the model is written off. Sizing the
deliverable in the definition is what lets the budget be set per use case rather
than globally, so this shows up as a configuration fix instead of a model
verdict.

## The catalogue effect

Written properly, the set of task definitions becomes a **compressed
specification of every machine-authored artifact in the hiring process**. Treat
that as a deliverable in its own right, not a by-product. Expect it to expose,
on first writing:

- two use cases that turn out to be the same deliverable with different prompt
  wording, which should be merged;
- one that nobody can describe, which is usually one nobody uses;
- a generated artifact reaching candidates that was never on anyone's list.

Keep the definitions in one place and version them. They are the shared
contract between the generation prompt, the judge and the receiving surface —
and when the receiving surface changes, the definition must change first, or the
eval starts certifying an artifact for a screen that no longer exists.

## Decision rules

- **When the generation prompt and the task definition disagree, fix the
  definition to match the deliverable, then fix the prompt.** The definition
  describes what is needed; the prompt is an attempt at it. Never derive the
  definition from the prompt — that makes the eval grade the prompt's
  self-image, and every prompt bug becomes invisible.
- **When a required part is optional in practice, say so and say when.** A judge
  penalising an absent section that was correctly absent produces exactly the
  kind of noise that makes teams stop reading the eval.
- **When the definition exceeds what a colleague could hold in mind, the use
  case is two use cases.** Split it.
- **When the receiving surface changes what it renders, re-baseline.** The
  verdict was bound to the old definition
  ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
- **When every model fails the same dimension on one use case, suspect the
  definition first.** Uniform failure is a property of the question far more
  often than of the field.
- **When a domain rule is stated in the definition, also assert it as a
  categorical check.** An invented salary should fail a rule, not merely lose
  points on a graded scale where good prose can pay for it.

## When not to use it

Do not write a task definition for an artifact with no human reader — an
intermediate structure consumed only by the next pipeline stage is validated by
its schema and its downstream effect, not by a judged rubric about deliverable
shape.

Do not stretch one definition across a family of related artifacts to save
effort. The shared parts will be right and the differences — which are where the
domain rules live — will be averaged away.
