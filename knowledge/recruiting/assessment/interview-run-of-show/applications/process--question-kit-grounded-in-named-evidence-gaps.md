---
layer: application
type: application
subject: interview-run-of-show
technique: question-kit-grounded-in-named-evidence-gaps
stack: process
status: forged
verified_on: 2026-09-29
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

- `"AI delivery quality (evaluation, validation, monitoring)"` — `interview.py:260`
- `f"Ramp-up plan for missing skill: {skill}"` — `:280`
- `f"Recruiter risk: {flag}"` — `:308`
- `"Self-assessed gap (no recruiter flag detected)"` — `:332`

The gap is derived from a specific upstream signal (`job_fit.missing_skills[:3]` at `:211-214`,
`real_risk_flags(job_fit)` at `:299`, which reads `recruiter_risk_flags`), so a question exists because *this*
record left *that* thing open.

## The scaffold is four named parts, filled from the record

`StarScaffold` gives every question a `situation` / `task` / `action` / `result`, and
each is written against the candidate's own material rather than as a heading. From the
AI-delivery question at `:255-262`:

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

`_red_flag_questions` (`:295`) takes only `real_risk_flags` and, for each of the first three
(`_RED_FLAG_TARGET`, `:70`), mints a question that names the worry out loud (`:305-307`):

> "A recruiter reading your CV might worry that {humanized.lower()}. How do you address
> that head-on?"

Its scaffold's opening line is the craft lesson this subject takes from the repo,
verbatim at `:310`:

> "Acknowledge the concern in one sentence — **defensiveness reads worse than the gap
> itself**."

And when no flags exist, the bucket is not skipped — `:325-339` mints the inverted
question instead: "Walk us through the weakest part of your CV against this role and how
you would compensate for it", with the scaffold note "Pick one real gap — interviewers
reward calibration, not bravado." A clean record still gets a calibration probe.

### The worry has to be a worry: the non-finding that became a question

The defence question is only honest if its premise is a finding. `recruiter_risk_flags` is
a free-text list from a model with no "return empty when clean" contract, so a clean CV
came back as a sentence saying so ("No significant concerns identified"). The original
guard tested for one substring, "no major", so every other phrasing passed through as a
flag and produced the question "A recruiter reading your CV might worry that no
significant concerns identified. How do you address that head-on?" - a defence question
asking the candidate to explain away an absence, an antipattern card at confidence 0.4 on
the recruiter-facing panel, and a phantom entry in the gap count. Fixed on 2026-08-21
(`029471eba`): `is_no_risk_statement` (`interview.py:48`) is one shared predicate for the
kit, the gap count and the soft-signal panel, matching a leading negative quantifier
followed only by intensifiers and then a risk noun, whole-string for the bare "none / n/a",
and validated against 13 realistic real flags, including ones that open with "No" ("No
evidence of Kubernetes in the CV"), with zero false drops. Two lessons for the technique:
the same predicate must feed every consumer of the list, or they disagree about what a
gap is; and the guard is a heuristic over free text, so its failure direction matters -
it is built to under-drop, keeping a doubtful entry as a question rather than silently
deleting a real concern.

## The catch-all, and the incident that produced it

`app/_components/results/interview/buckets.ts` is the taxonomy's single source of truth,
and its header records the failure it exists to prevent. `interviewKit.questions[].bucket`
is an unconstrained string from model output, so a question can carry `"situational"` or
a typo like `"behavioural"`. The tiles and filter chips were hardcoded to the three known
buckets, so an off-taxonomy question "was counted in 'All' yet showed in no tile and was
hidden by every specific filter chip: it silently vanished from filtered views while the
tiles undercounted."

The fix is `classifyBucket` (`buckets.ts:34-36`), which folds every unknown value into
`OTHER_BUCKET`, and `groupBuckets` (`:44-54`), whose contract is stated as the invariant
the technique asks for: "The returned counts always sum to `questions.length`, so the
tiles never undercount." `buckets.test.ts:36` pins the ordering — Other comes last —
and the module is deliberately JSX-free so the grouping is unit-testable without a DOM.

## The signals checklist

The cross-cutting checklist rides the plan rather than the kit:
`run-of-show.ts:144` builds `signals` as `[...focusAreas, s.signalDepth,
s.signalMustHaves, s.signalQuestions]`, with the comment at `:142-143` explaining that
the chronology *is* the run-of-show checklist, so `signals` carries only what is
cross-cutting. It is a flat `string[]` rather than a grouped shape because, per the type
comment at `:22-24`, there was never more than one group.

## Deviations

- The kit's `_MAX_QUESTIONS = 12` (`interview.py:71`) is set independently of the plan's
  `MAX_QUESTIONS = 6` in `run-of-show.ts`, so the kit routinely generates twice what the
  plan can carry, and the plan's `.slice()` decides which half is lost. The two caps
  should be one negotiation.
- The catch-all exists at the rendering layer only. The generator itself emits from a
  fixed set of three bucket literals (`behavioral`, `technical`, `red-flag-defense`; the rendering layer's `KNOWN_BUCKETS`, `buckets.ts:18`, is the same three), so a genuinely novel gap type has no bucket to
  be minted into — the "other" group only ever catches drift, never a deliberate new
  category.
- `_humanize` (`:394`) truncates a flag to 200 characters before embedding it in the
  question text. A silently truncated worry can become an ungrammatical or misleading
  question; the standard wants the worry stated in full or restated deliberately.
- `is_no_risk_statement` keeps the original `"no major" in text.casefold()` test verbatim
  (`interview.py:58`), and that test is a bare substring: a real flag such as "No major
  production experience with Kubernetes" is dropped as a non-finding. The new regex is
  conservative; the legacy marker beside it is not, and it is the one direction the
  guard's own comment says it must not fail.
- **The defence question fires by list position, not by the feature.** The cap
  `_RED_FLAG_TARGET = 3` (`interview.py:70`) slices `flags[:3]` in the order the model
  emitted them. Executed against `_red_flag_questions` at kp `7665a75ca` (the file last
  changed 2026-08-21): two records carrying the identical "Unexplained 14-month employment
  gap" flag, one with it first of three flags and one with it fourth of four. The first
  gets the gap question; the second gets three other questions and none about the gap. So
  whether a candidate is asked depends on how many other flags the model happened to
  emit. This generator is a candidate-side rehearsal kit ("so the user knows exactly what
  experience to surface"), so no interviewer is asking anything unevenly; the finding
  matters the day the same generator feeds an interviewer's pack, and the standard's
  "the same question for every record that shows the feature" then fails on the cap.
- **No proxy filter on the flag text.** The standard keeps the defence question for
  things the candidate chose. Executed: a flag "Career break of 2 years, appears to be
  parental leave" becomes "A recruiter reading your CV might worry that career break of 2
  years, appears to be parental leave. How do you address that head-on?" Nothing between
  `real_risk_flags` and the template tests for a caregiving, health or service proxy, and
  the template asks how to address it, which invites the reason rather than the work.
  The rehearsal framing softens the harm (the candidate is told a recruiter might read
  it that way, not asked by one); it does not make the flag one the candidate chose.
- **The scaffold sentence the standard quoted is the product's own.** "Defensiveness
  reads worse than the gap itself" is the string at `interview.py` `situation=`, and an
  exact-phrase search on 2026-09-29 found no outside source for it. The technique now
  holds it as craft, not finding; this application is the only place it is attested.
