---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: failure-clustering-recommendations
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [turning a scorecard into prompt or routing changes, a benchmark report must end in actions, diagnosing why a target's mean dropped]
---

# Failure clustering and recommendations

A mean score is a summary; a decision needs a diagnosis. The last stage of a
benchmark run groups its low-scoring cases by dimension and by pattern, and
closes the report with concrete, actionable recommendations — because the
operator reading the scorecard is about to do one of three things (change a
prompt, change a model, change nothing), and a report that does not speak to
that choice will be skimmed for its headline number and discarded, taking
the whole run's spend with it.

## Clustering

Work from the per-case evidence, which the run recorded precisely so this
stage could exist:

1. **By dimension first.** A weighted rubric scores each case on named
   dimensions; aggregate failures per dimension per target. "Completeness
   is the lowest dimension for target B" is already more actionable than
   "B scored 0.74" — it names the muscle that is weak.
2. **By case pattern second.** Within a weak dimension, group the failing
   cases by what they share — tags from the dataset (multi-part questions,
   a specific input language, long inputs), floor-hits versus soft misses,
   and the judge's own per-case reasoning, which is stored per sample for
   exactly this audit. The intersection — "completeness fails concentrate
   on multi-part questions" — is the diagnosis.
3. **Keep the trail auditable.** Every cluster must be expandable back to
   its member cases and their verdict details. A recommendation that cannot
   show its cases is an opinion with formatting.

## Recommendations

A recommendation is concrete when it names the change and the evidence:

- **Prompt-level**: "completeness lowest on multi-part questions → add an
  explicit checklist step to the prompt variant under test."
- **Methodology-level**: "judge shares a family with the leading target →
  re-run pairwise with a neutral judge before trusting that column."
- **Routing-level** — the one the whole subject exists for: "the cheaper
  model sits within a few percent of the leader at a fifth of the cost →
  prefer it for this workload." Cost-aware recommendations are only
  possible because the run measured cost and latency on the same calls as
  quality; this is where that discipline pays out.

Two guardrails keep recommendations honest:

- **Never dress a recommendation as a verdict.** "Within a few percent" is
  a lead; whether the gap is statistically real belongs to the sibling
  gating discipline, and a recommendation that implies significance it
  never tested launders opinion into evidence. Phrase leads as leads.
- **Say what the clustering could not see.** Inline case lists in a report
  are bounded previews — cap them, and accompany every clipped list with
  its total, logged, and truncated counts so a reader can never mistake a
  preview for the population. And when some verdicts failed to persist,
  report that count too: "the cases are missing" must be a recorded fact,
  not something an operator infers from a suspiciously short list. Absence
  presented silently reads as "no failures", which is the exact lie the
  run existed to prevent.

## Decision rules

- **When a cluster is one case, it is an outlier, not a pattern** — surface
  it in the case list, keep it out of the recommendations. Recommendations
  built on n=1 train operators to distrust the section.
- **When two targets fail the same cluster, the dataset is talking, not the
  models** — a shared failure pattern across targets usually means the
  cases are ambiguous or the rubric under-specified; route that finding to
  dataset review, not to prompt surgery on every target.
- **When a mechanical (non-judged) dimension dominates failures, fix it
  first** — a malformed-output cluster is cheap to fix and pollutes every
  judged dimension downstream of parsing.
- **When the same recommendation appears three runs in a row, it has become
  a backlog item, not a report line** — recommendations that never convert
  to changes are the first sign the benchmark program is decorative.

## When not to use it

Skip the recommendation stage for calibration and smoke runs — their purpose
is instrument health, not product decisions, and generating routing advice
from a calibration set teaches readers to ignore the section. Clustering
also adds little to tiny datasets (a dozen cases); below the size where
patterns can recur, just show every failing case with its reasoning.
