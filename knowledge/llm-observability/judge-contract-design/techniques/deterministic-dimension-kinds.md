---
layer: technique
type: technique
subject: judge-contract-design
technique: deterministic-dimension-kinds
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [a rubric checks something mechanically decidable, judge cost or variance is too high for a factual check, an extraction or formatting requirement needs an exact verdict]
---

# Deterministic dimension kinds

The concern: rubrics routinely ask a model to confirm facts a comparison
function can decide — "the output is valid structured data", "the extracted
city equals the expected one", "the total is within 0.1 of 42". Sending
these to the judge converts a reproducible fact into a sampled opinion:
nonzero error rate, nonzero cost per verdict, and variance where none need
exist. The technique types every dimension with a **kind**. The default
kind is judged by the model; every other kind is a mechanical check the
engine runs locally at zero tokens and zero cost — and its verdict flows
through the *same* weighting, floors, threshold and aggregation as a judged
dimension. One scoring pipeline, two sources of score.

## The kind vocabulary

A small closed set covers most mechanical needs:

- **exact** — the output equals a target (with declared trim and
  case-sensitivity handling; comparisons should not fail on casing unless
  the contract says they must).
- **contains** — the target occurs as a substring.
- **regex** — a declared pattern matches anywhere in the output.
- **numeric** — the output's number is within an absolute tolerance of the
  target; a tolerant reader falls back to the first numeric token, so
  "The total is 41.95 dollars." is comparable to 42.
- **structurally valid** — the output parses as structured data, optionally
  carrying an expected value at a declared path; a path selector (a
  standard pointer syntax) narrows any of the above to one field of a
  structured output.

Targets default to the case's expected reference answer when one exists, so
the common case needs no per-dimension configuration at all. The kind field
is additive and defaulted: a rubric written before kinds existed
deserializes — and re-serializes byte-identically — as all-judged, which is
what keeps the contract's versioning story clean while the vocabulary
grows.

## Decision rules

- **When a check has a decidable truth condition, make it mechanical** —
  it becomes free, exact, and exempt from judge drift. Reserve the judged
  kind for what genuinely requires reading: relevance, faithfulness, tone,
  reasoning quality.
- **When a mechanical dimension is misconfigured — a pattern kind with no
  pattern, an equality kind with neither a target nor a case reference —
  fail loudly, naming the dimension.** Never score the candidate zero for
  the operator's mistake: that presents a configuration absence as a
  quality answer, and the candidate's trend line inherits a defect it did
  not commit.
- **When every dimension is mechanical, make no model call at all.** Zero
  samples, cost recorded as null (not zero — no spend was measured, none
  occurred), the scorer identity recorded as deterministic, and the
  determinism stamp set to exact. Claiming a model scored an all-mechanical
  rubric is a provenance lie that poisons any later judge-quality analysis.
- **When a mechanical verdict lands, record why in its reasoning field** —
  "expected 42, got 41.6, tolerance 0.1 → fail" — so the verdict is
  auditable by the same reader who audits judged reasonings. Mechanical
  does not mean unexplained.

## Failure modes

- **The opinionated fact** — schema validity judged by a model at real
  cost, wrong some percent of the time, drifting with the judge.
- **The silent zero** — a misconfigured check scoring candidates 0 forever,
  read downstream as a quality collapse.
- **The phantom judge** — an all-mechanical rubric stamped with a model
  name and a zero cost, corrupting both the cost ledger and any
  judge-agreement analysis that later joins on scorer identity.

## When not to use it

Do not force a genuinely evaluative axis into a mechanical proxy — "answer
contains the word 'because'" is not reasoning quality, and a proxy that is
easy to satisfy trains the system under test to satisfy the proxy. And do
not use mechanical kinds to re-check what the builder-side structured-output
discipline already guarantees at generation time; the rubric checks the
*product's* obligations, not the plumbing's.
