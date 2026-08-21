---
layer: application
type: application
subject: interview-run-of-show
technique: question-kit-grounded-in-named-evidence-gaps
stack: process
status: forged
---

# A gap-anchored kit generator, its taxonomy, and its catch-all

`pipeline/jobfit/interview.py` builds the question kit. Its module docstring states the
grounding rule outright: it uses "the existing job_fit signals (missing skills,
must-prove evidence, recruiter risk flags) plus the candidate profile to generate 8-12
likely interview questions split into behavioral, technical, and red-flag-defense
buckets, each with a STAR-style answer scaffold drawn from the candidate. **Every
question is tied to a specific evidence gap** so the user knows exactly what experience
to surface."

## Every question carries its gap

The `InterviewQuestion` record has an `evidence_gap` field that is populated on every
construction, and the values are named gaps rather than topics:

- `"AI delivery quality (evaluation, validation, monitoring)"` — `interview.py:208`
- `f"Ramp-up plan for missing skill: {skill}"` — `:229`
- `f"Recruiter risk: {flag}"` — `:263`
- `"Self-assessed gap (no recruiter flag detected)"` — `:285`

The gap is derived from a specific upstream signal (`job_fit.missing_skills[3]` at `:221`,
`job_fit.recruiter_risk_flags` at `:246-250`), so a question exists because *this*
record left *that* thing open.

## The scaffold is four named parts, filled from the record

`StarScaffold` gives every question a `situation` / `task` / `action` / `result`, and
each is written against the candidate's own material rather than as a heading. From the
AI-delivery question at `:210-216`:

> situation: "Pick the highest-impact AI delivery in your timeline — something using
> {matching_label}."
> task: "State the quality bar you committed to and who held you accountable to it."
> action: "Show the eval setup: dataset, metrics, baseline, regression checks,
> prompt/version control, human review."
> result: "Close with what the metric did over time and what you would build first if
> you started again."

The `action` field is doing the technique's "what a good answer contains" job — it
enumerates the specifics whose absence is the tell.

## The red-flag-defence question

`_red_flag_questions` (`:242`) filters out the no-op flags ("no major …", `:249`) and
then, for each real one, mints a question that names the worry out loud (`:257-259`):

> "A recruiter reading your CV might worry that {humanized.lower()}. How do you address
> that head-on?"

Its scaffold's opening line is the craft lesson this subject takes from the repo,
verbatim at `:265`:

> "Acknowledge the concern in one sentence — **defensiveness reads worse than the gap
> itself**."

And when no flags exist, the bucket is not skipped — `:277-292` mints the inverted
question instead: "Walk us through the weakest part of your CV against this role and how
you would compensate for it", with the scaffold note "Pick one real gap — interviewers
reward calibration, not bravado." A clean record still gets a calibration probe.

## The catch-all, and the incident that produced it

`app/_components/results/interview/buckets.ts` is the taxonomy's single source of truth,
and its header records the failure it exists to prevent. `interviewKit.questions[].bucket`
is an unconstrained string from model output, so a question can carry `"situational"` or
a typo like `"behavioural"`. The tiles and filter chips were hardcoded to the three known
buckets, so an off-taxonomy question "was counted in 'All' yet showed in no tile and was
hidden by every specific filter chip: it silently vanished from filtered views while the
tiles undercounted."

The fix is `classifyBucket` (`buckets.ts:34-36`), which folds every unknown value into
`OTHER_BUCKET`, and `groupBuckets` (`:46-56`), whose contract is stated as the invariant
the technique asks for: "The returned counts always sum to `questions.length`, so the
tiles never undercount." `buckets.test.ts:36` pins the ordering — Other comes last —
and the module is deliberately JSX-free so the grouping is unit-testable without a DOM.

## The signals checklist

The cross-cutting checklist rides the plan rather than the kit:
`run-of-show.ts:145` builds `signals` as `[...focusAreas, s.signalDepth,
s.signalMustHaves, s.signalQuestions]`, with the comment at `:142-144` explaining that
the chronology *is* the run-of-show checklist, so `signals` carries only what is
cross-cutting. It is a flat `string[]` rather than a grouped shape because, per the type
comment at `:22-24`, there was never more than one group.

## Deviations

- The kit's `_MAX_QUESTIONS = 12` (`interview.py:19`) is set independently of the plan's
  `MAX_QUESTIONS = 6` in `run-of-show.ts`, so the kit routinely generates twice what the
  plan can carry, and the plan's `.slice()` decides which half is lost. The two caps
  should be one negotiation.
- The catch-all exists at the rendering layer only. The generator itself emits from a
  fixed set of three buckets (`:40-42`), so a genuinely novel gap type has no bucket to
  be minted into — the "other" group only ever catches drift, never a deliberate new
  category.
- `_humanize` (`:349`) truncates a flag to 200 characters before embedding it in the
  question text. A silently truncated worry can become an ungrammatical or misleading
  question; the standard wants the worry stated in full or restated deliberately.
