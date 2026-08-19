---
layer: technique
type: technique
subject: generated-output-grading
technique: two-grader-disagreement-rule
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [gating a decision on a machine judgement, a vision grader's verdict feels wrong, deciding how many judges a grading pipeline needs]
---

# Two-grader disagreement rule

A single vision model grading an image is an opinion, not a measurement. The
rule: **anything that gates a real decision on a machine judgement asks two
independent graders, and treats disagreement as a first-class verdict —
"needs a human" — rather than something to average, break by seniority, or
quietly resolve in favour of the answer you wanted.**

The founding observation is mundane and repeatable: two competent vision
models, shown the same render with the same question, return opposite booleans
on a genuinely arguable property — one says the image is flat, the other sees
the soft contact shadow and says it is not, while agreeing on every colour.
Both answers are defensible. That is precisely the case a single-judge
pipeline silently converts into whichever opinion it happened to hire.

## Why two, and why disagreement routes to a human

Judge disagreement is not noise to be suppressed; it is **information about
the question**. Fields where two graders agree are behaving as measurements —
the property is well-enough defined that independent instruments converge.
Fields where they split are revealing either an under-specified rubric field
or a genuinely borderline image, and both of those are human work. Published
practice agrees on the shape: inter-judge agreement between distinct models
runs meaningfully below strong human baselines, and the systematic error from
*which judge you chose* exceeds the stochastic error within one judge — so
re-running one judge many times narrows the error bars around its bias without
touching the bias. A second, genuinely different judge is the cheapest
instrument that can see the first one's blind spot.

Two is the working number because the third judge buys surprisingly little at
real cost: majority-of-three converts borderline cases into confident wrong
answers exactly when the two-judge rule would have surfaced them. Prefer
2-agree-or-human over best-of-3 whenever a human escalation path exists at
all; reserve three-judge majorities for fully unattended pipelines where no
human can be in the loop, and log the split votes even then.

## Procedure

1. **Choose two graders that are actually independent** — different model
   families, not two sizes of the same family, which share training biases
   and fail together.
2. **Same schema, same instruction, same image** to both. Any difference in
   the question contaminates the comparison.
3. **Compare per field, not per grade.** Two graders can agree the render is
   on-brief while splitting on flatness; the split field escalates, the
   agreed fields stand.
4. **Escalate disagreements to a human queue** with both grades and both
   descriptions attached — the descriptions usually show *why* they split,
   which is what the human actually adjudicates.
5. **Feed the adjudications back.** A field that humans keep resolving the
   same way has a sharpenable definition; sharpen it and the disagreement
   rate on that field is your regression test. Rising disagreement after a
   judge upgrade is drift detection you get for free.

## Cost discipline

Doubling every grade doubles recognition cost, so apply the rule where the
verdict is load-bearing and a single grader where it is advisory:

- **Two graders**: gates that discard or ship work, model/provider verdicts,
  style standardization decisions, any number that will be quoted later.
- **One grader**: in-loop progress signals, exploratory sweeps, per-render
  telemetry — provided their aggregates are labeled as single-judge.
- Recognition is typically an order of magnitude cheaper than generation, so
  for gate decisions the second opinion is almost always affordable relative
  to what a wrong verdict costs downstream.

## Decision rules

- When the two graders disagree on an *unconditional-fail* field, the safe
  default while awaiting the human is fail-closed: treat the render as
  unusable for shipping but keep it for diagnosis.
- When disagreement on a field exceeds roughly one cell in five, stop
  escalating that field per-cell — the field itself is broken; fix its
  definition before grading anything else with it.
- When you cannot afford a second grader at all, say so in the output:
  label every aggregate as single-judge. An unmeasured error bar is not a
  zero error bar.

## When not to use it

Skip the rule for deterministic checks (counts by pixel, aspect ratios) —
two instruments only help where instruments can differ honestly. Skip it for
pure taste calls, which belong to a human from the start, not after a
disagreement. And do not use agreement between two graders as proof of
*correctness* — two judges sharing a bias agree confidently; the human
calibration layer exists because agreement bounds precision, not truth.
