---
layer: technique
type: technique
subject: recruiter-anchored-model-evaluation
technique: separate-quality-from-reliability
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [reporting a model comparison for generated hiring artifacts, a single blended score is being used to pick a model, a benchmark cell looks bad and nobody knows whether the model or the plumbing failed]
---

# Separate quality from reliability

An evaluation of generated artifacts measures two unrelated things, and they get
two axes, two pass marks and two reports.

- **Reliability** — did the generation attempt produce the artifact at all? Did
  the call complete within budget, in the required shape, with every required
  field, from the intended inputs? Categorical facts about the pipeline.
- **Quality** — given that an artifact arrived, is it any good? A judged matter
  of degree.

Never blend them into one number. The blend is attractive because leaderboards
want a single column, and it destroys the only two decisions the evaluation
exists to inform.

## Why blending corrupts both

The two failures have opposite remedies. A model producing excellent text that
fails one call in five needs infrastructure work — retries, a different route, a
larger budget. A model that never fails and writes generic filler needs a
different prompt or a different model. A single blended score describes neither
and ranks them as equals.

The pass marks differ in kind, too. **A quality gate sits deliberately below
full marks**, because judged scores carry run-to-run noise and a gate at the
ceiling fails for variance. **A reliability gate does not**, because the
candidate does not experience the average: a five-percent failure rate is one in
twenty candidates whose artifact never arrived, and on a candidate-facing path
that is a stalled process, not a rounding error
([a-candidates-process-never-stalls-on-your-constraints](../../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
Set the reliability bar by what happens to the affected person, not by what the
mean looks like.

This split is shared craft with the practice on validating machine interviewers,
but the axes are not interchangeable. There, reliability means conversational
invariants — no leaked instructions, no verdict spoken to the candidate, no
language drift. Here it means the artifact-production attempt itself. Importing
one checklist into the other produces a suite that passes everything.

## What belongs on the reliability axis

Everything that can be decided without reading the text for quality:

- the attempt errored, timed out, or was cut off mid-artifact;
- the output failed its schema, or a required section is absent entirely;
- a fallback was substituted for a failed generation;
- the route silently degraded — a capability the provider did not truly have, a
  dropped attachment, a truncated context — so the artifact was produced from
  less than the intended inputs;
- latency or cost exceeded the budget the workflow allows.

Check the structural facts **deterministically, in the harness**, before any
judge sees the artifact — then hand the judge the structural verdict alongside
the output. Two things follow. The judge stops re-litigating in prose what a
schema check already decided, and it can read a well-formed artifact that
violated its contract for what it is. Structural validity is aggregated by
majority across a cell, not averaged with the judged scores.

The silent-degradation item is the one that is missed, because nothing errors. An artifact
built from an empty prompt returns clean, well-formed, fluent and content-free.
Treat a declared capability as a claim to be verified by a probe whose output is
impossible without it, and treat a degraded route's output as a reliability
failure regardless of how the text reads.

## Reporting

Report the two axes side by side, per model and per use case, with counts:

- reliability as rates over **attempts** — success, error, fallback, degraded;
- quality as scores over **surviving artifacts only**, with the surviving count
  printed beside every cell.

The surviving count is not a footnote. A quality cell built from three surviving
runs is not comparable to one built from thirty, and a reader scanning a matrix
will compare them anyway unless the number is on the page
([a-claim-carries-its-sample-and-its-basis](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Decision rules

- **When a model fails reliability on a candidate-facing path, it does not ship,
  however good its quality score.** Quality cannot buy back an artifact that
  never arrived.
- **When a cell looks bad, check the surviving sample before ranking anything.**
  A poor cell over four survivors is a reliability finding wearing a quality
  costume.
- **When reliability is below the level at which the quality sample stays
  meaningful, report quality as inconclusive rather than as a low score.** A
  model that produced six artifacts out of thirty has not been measured.
- **When a stakeholder asks for one number, give the pair and the gate
  sentence** — ships or does not ship, and on which axis it failed. The pair is
  what makes the answer arguable.
- **When a reliability defect is fixed, re-run quality from scratch.** The
  surviving sample changed, and the runs that used to fail were not a random
  subset — they were the hard inputs.
- **When a reliability failure traces to a limit you set, it is your defect, not
  the model's.** An output ceiling tuned for short artifacts truncates a large
  deliverable, the truncated output fails its parse, and the template ships —
  and the resulting numbers look exactly like a weak model. Budgets belong per
  use case, sized from the deliverable.
- **When both axes are green but practitioners still rewrite every artifact, the
  task definition is wrong.** Neither axis can see a well-produced, well-written
  artifact that is the wrong deliverable.

## When not to use it

Do not split the axes for an internal experiment whose only question is "can
this model do this at all" — at that stage a single pass/fail over a handful of
inputs is the honest instrument, and two axes are ceremony.

Do not use the reliability axis as a home for judged properties that are merely
inconvenient to gate. A property is categorical because it is decidable, not
because you want a hard gate on it; moving a judged property there to get a
clean pass, or a categorical one out of there to escape a failing gate, is how
both axes lose their meaning.

The plumbing that produces these numbers — routing, retries, metering, tracing,
caching — is a neighbouring discipline. This technique owns which facts are
reported on which axis and what each gate means for a candidate, not how the
runs are executed.
