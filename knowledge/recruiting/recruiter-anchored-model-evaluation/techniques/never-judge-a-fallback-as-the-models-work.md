---
layer: technique
type: technique
subject: recruiter-anchored-model-evaluation
technique: never-judge-a-fallback-as-the-models-work
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, a-claim-carries-its-sample-and-its-basis, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [a pipeline substitutes deterministic output when generation fails, quality cells cluster suspiciously around one value, auditing an evaluation harness before trusting its model ranking]
---

# Never judge a fallback as the model's work

When the pipeline substitutes deterministic output for a failed generation — a
template, a rule-based summary, a cached prior version — that output is **not
the model's work** and must never enter a model's quality statistic.

Degrading rather than failing is correct behaviour: a candidate's process must
not stall because a provider was unavailable
([a-candidates-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
The defect is not the fallback. The defect is scoring it.

## The contamination, and why it is biased

A deterministic fallback has a characteristic profile: stylistically
consistent, structurally complete, mildly generic. A judge scores it in a
predictable middling band, run after run, with almost no variance. Mixed into a
model's quality cell, those rows pull the cell toward the template's score.

That would be tolerable if it were uniform noise. It is not. **The models that
fail most often receive the most template rows**, so the contamination flatters
exactly the models that deserve the worst reliability marks, and it compresses
the spread between all of them toward a single value. A matrix contaminated this
way looks like the classic symptom of an unanchored rubric — everything within a
point of the middle — and the two causes get confused. Rule out both.

The tell that distinguishes them: unanchored-rubric compression shows normal
run-to-run variance around a middling mean; fallback contamination shows an
implausible cluster of *identical or near-identical* scores, because the same
template was scored repeatedly.

## Mechanics

1. **Mark the fallback where it is emitted.** The record carries a flag set by
   the code path that substituted the output, at the moment of substitution.
2. **Never detect fallbacks by pattern-matching the text afterwards.** A good
   template resembles good generation, retrospective detection has both error
   directions, and the direction it errs in is unknowable. An unmarked row is a
   harness bug, not a scoring problem.
3. **Exclude marked rows from every quality statistic** — mean, spread, ranking,
   per-dimension breakdowns.
4. **Count them prominently on the reliability axis**, as their own category
   distinct from errors. A fallback is a successful *process* outcome and a
   failed *generation* outcome, and merging it with hard errors hides which one
   the pipeline is actually experiencing.
5. **Print the surviving sample beside every quality cell.** Exclusion changes
   the denominator, and an unlabelled denominator is how the exclusion silently
   reintroduces the bias it removed
   ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
6. **Exclude fallbacks from the performance statistics too, not just quality.**
   A template is produced instantly and costs nothing, so leaving fallback rows
   in a latency or cost aggregate lets the least reliable model post the best
   speed. Every per-cell statistic that is supposed to describe *the model* runs
   over real generations only; only the reliability rates run over all attempts.
7. **Aggregate with a median across scenarios, not a mean.** One catastrophic or
   one flattering scenario should not move a cell, and judged scores are exactly
   the kind of noisy quantity a mean mishandles.
8. **Where a cell has no surviving generation at all, emit no cell.** Not a
   zero, not a blank score — the model has not been measured here, and any
   number in that slot will be read as a measurement.

## Extend the rule to silent degradation

The same reasoning covers a defect that is harder to see and worse in effect. If
a route advertises a capability the underlying provider does not truly have —
document reading, structured output, a long context — the request can succeed
and return a well-formed artifact produced from an input that was silently
dropped on the way. Nothing errors. The judge scores fluent, generic text as
mediocre-but-acceptable, and the artifact describes **a person who was evaluated
on nothing.**

So: an artifact produced by a degraded or capability-mismatched route is treated
exactly as a fallback — excluded from quality, counted on reliability. And a
declared capability is a claim to be verified, not configuration to be trusted:
probe each route with an input whose correct handling is impossible without the
capability, and fail the route, not the model, when the probe comes back plausible
and wrong.

There is a corollary about *when* a fallback is allowed to fire, and it is the
sharpest line in this technique. **A fallback exists for runtime failures, never
for misconfiguration.** A route that was never capable of the use case must
refuse at resolution time, loudly, before any request is made. If it is allowed
to degrade instead, the misconfiguration becomes indistinguishable from a
provider outage in every report, and the artifact that was built from nothing
gets logged as a normal degraded run.

## Decision rules

- **When quality scores cluster implausibly tightly, check the fallback rate
  before rewriting the rubric.** Both causes produce a flat matrix; the fixes
  are unrelated.
- **When a row's fallback flag is missing, treat the row as unscored.** Do not
  guess from the text.
- **Distinguish a missing provenance mark from a malformed judge field.** An
  unmarked row is unusable, because nobody knows what produced it. A single
  dimension the judge formatted oddly — a fraction, a word instead of a number —
  is a transcription problem on a run that genuinely happened: recover it where
  it is recoverable, impute it from the overall score where it is not, and keep
  the cell. Voiding a whole column over one badly formatted field is how a real,
  working model comes to look on the scorecard as though it produced nothing.
- **When a fallback rate spikes on a structurally large deliverable, look at the
  output budget before the model.** A generation cut off at a token ceiling
  fails its parse and ships the template, and the resulting near-bottom scores
  are a configuration finding, not a capability finding.
- **When exclusion leaves too few artifacts for a cell to mean anything, report
  the cell as inconclusive.** Not as a low score, and not as a blank — a blank
  reads as "not run" and invites a re-run that will produce the same nothing.
- **When a fallback reaches a candidate, that is a separate finding with its own
  owner.** Whether the template was honest about being a template, and whether
  the candidate's process continued, are questions the degradation practice owns
  — but the evaluation report is usually where the rate first becomes visible,
  so surface it rather than filing it as an exclusion count.
- **When a model's quality looks strong on a small surviving sample, say so in
  the same sentence as the ranking.** The surviving runs are the easy inputs; the
  hard ones are the ones that failed.
- **When the fallback text is itself candidate-facing, evaluate it as its own
  artifact, under its own name.** It deserves a rubric — just not the model's
  column
  ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## When not to use it

Do not use this rule to exclude *bad model output* that merely resembles a
template. The exclusion is keyed on provenance — what produced this text — not
on how the text reads. A model that reliably writes template-grade filler has
earned its low score and must keep it.

Do not extend the exclusion to outputs from a retry that eventually succeeded.
The model produced that artifact; the retry count belongs on the reliability
axis, and quietly dropping expensive successes would understate cost and
overstate nothing.
