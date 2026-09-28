---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: robustness-status-taxonomy
stack: node
verified_on: 2026-09-27
verified_against: node@24
applied: code
ab_verdict: better
---

# One predicate for the sealed status and the panel (Node/TypeScript)

The five statuses are a closed union in the shared types
(`app/features/shared/groupEvalTypes.ts:46`), with the epistemology written above
them (`:31-45`) and derived in one place, `assessRobustness` (`:108`). The server
seals it. The fairness panel
(`app/features/hiring/decisions/groupEval/GroupEvalFairnessPanel.tsx`) renders it.
The taxonomy was right on the server and wrong on the screen, because the panel
decided `not_varied` for itself, from a different signal.

Read 2026-09-27 against the tree's main at `4ca00a8d2`; fixed at `d7194ea64`.

## The defect: a side channel standing in for the fact

The panel branched on its own variance read:

```
const adjusted = candidateIds.some((id) => (weightNotes?.[id]?.length ?? 0) > 0);
if (!adjusted) { /* "not tested" copy */ }
```

`weightNotes` is each candidate's weight rationale, and since 2026-08-11 the
proposer writes one for every candidate. "Baseline <archetype> weights kept" is a
note. So `adjusted` was true on every run. A uniform no-op that the server sealed
as `not_varied` rendered the full matrix, the "robust order" pills and the
"agrees" line. That is the false pass the `not_varied` status exists to prevent,
reached through the one surface a recruiter reads. The panel never branched on
`robustness === "not_varied"` at all. It honoured `insufficient_sample` and
`unavailable` from the prop, and re-derived the third.

## The fix

`schemesVary(fairness)` compares the scheme vectors, the same test the server
used inline. It is now exported next to `assessRobustness`, which calls it, and
the panel reads `robustness !== "not_varied" && schemesVary(fairness)`. The
status and the screen share a predicate and cannot disagree again.

The test *a baseline note on every candidate is still a no-op* pins the fixture:
a uniform matrix whose candidates all carry the baseline note. It also asserts
from the source that the panel reads through `schemesVary` and not through the
notes. Robustness and alignment suites: 30/30 green. The one TypeScript error in
the tree is in an untracked file this change did not touch.

## Measured

A harness drove the pipeline's own deterministic `fairness_check` over three
cohorts built from the tree's test fixtures, then applied both reads to the
output:

| cohort | schemes | A: panel as shipped | B: shared predicate |
| --- | --- | --- | --- |
| two bau seniors, no high-trust evidence | identical | robust-order copy | not tested |
| three thesis-only students | identical | robust-order copy | not tested |
| observed must-have vs none (the tree's own test pair) | differ | robust-order copy | robust-order copy |

A contradicts the sealed status in 2 of 3; B in 0. The two uniform cohorts are
the commonest real shape: a shortlist of one archetype where nobody backs a
must-have with high-trust evidence.

## The lesson the technique took from this

The decision rule was added to
[cross-scheme-weight-robustness](../techniques/cross-scheme-weight-robustness.md):
read variance from the scheme vectors, never from a channel that usually
accompanies variation. The same tree had already fixed this on the server. The
second reader of the same fact kept the old signal for five weeks. A status
derived in one place is only single-sourced if every surface consumes it rather
than re-deriving it.
