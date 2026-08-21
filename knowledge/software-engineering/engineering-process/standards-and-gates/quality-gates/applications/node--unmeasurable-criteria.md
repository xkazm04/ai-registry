---
layer: application
type: application
subject: quality-gates
technique: unmeasurable-criteria
stack: node
verified_on: 2026-08-20
---

# Three resolutions in one gate evaluator

`src/lib/scoring/gate.ts` turns a maturity report into a pass/fail verdict
against a `GatePolicy`. It resolves unmeasurable conditions three
different ways in the same file, and each one carries its reasoning.

## SKIP — absence that is a fact about the subject

`minAiGovernedRate` (`gate.ts:32-46`) is the bar "at least N% of
AI-attributed merged PRs carried an approving human review." Its doc
comment states the resolution as policy, not as an implementation detail:

> **ONLY ENFORCED WHEN MEASURABLE.** `aiGovernedRate` is null with no
> token, and null under the ≥5 AI-PR sample floor. Null → the criterion is
> SKIPPED, exactly like `requireProtectedBranch`'s readable gate. Failing
> an unmeasurable repo would punish repos for having little AI activity,
> which inverts the policy's whole intent.

`requireProtectedBranch` (same block) is the older instance of the same
shape: it fires "only when governance was READABLE (a token saw the
rules), so a no-token scan never false-fails." Two independent conditions,
one rule — the skip is a property of the *policy*, expressed where the
policy is declared, not a null-check buried in the runner.

The parser that feeds it enforces the same thing at the boundary.
`parseProvenanceLite` (`src/lib/db/org-rollup.ts:29-38`) nulls the rate
when the engine declined to compute one, with the reason attached: "Both
cases must reach the gate as 'not measurable' so the criterion is
SKIPPED — failing a repo for having too little AI activity would invert
the policy this bar exists to express." Note the second detail in that
comment: `aiPrSample` is reconstructed *purely so a failure message can
say what it was measured over* — the count carries its predicate into the
verdict.

## The same skip on the other surface

`src/lib/org/governance.ts:106-115` is the fleet rollup, a second surface
evaluating the same policy over many repos. Its comment records the defect
that the technique's "skip identically on every surface" rule exists to
prevent — the rollup previously did not carry the branch-protection or
provenance fields at all, so those conditions were skipped for every repo
in the dashboard while the gate enforced them:

> the dashboard's pass-rate must match the CI gate it advertises … with
> the org's provenance bar set, a fleet view that silently skipped it
> would show repos as passing that the CI gate blocks.

The repair was to pass the fields through to a shared `evaluateGateLite`,
so the skip decision is made once. This is the technique's failure mode
observed in the wild: a second evaluator that omits an input converts that
condition into a permanent silent skip for everything it judges.

## FAIL-CLOSED — absence that is a hole in the instrument

`belowFloor` (`gate.ts:73-83`) is four lines with a paragraph of
justification, and it is the naive-comparison trap named exactly:

> A plain `score < min` quietly evaluates `undefined < 40` / `NaN < 40` to
> `false`, so an UNSCORED dimension (partial LLM output, a new dimension
> the model skipped) would slip the gate as if passing — letting the exact
> Security/Testing dimension a gate exists to enforce be bypassed by
> absence of data.

`return !Number.isFinite(score) || score < min` — the fail-closed
semantics live in the comparison helper, and `failsFloor` /
`effectiveFloor` route every call site (the two floor sweeps in the
verdict, the PR-comment shortfall table, the fleet green-path math)
through it.

## REFUSE — nothing could be measured

`isIncompleteReport` (`gate.ts:54-70`) is the third resolution. The
verdict gains a dedicated failure code, `incomplete`, whose message says
the 0 / L1 result "is not a measurement" and that the gate "fails closed
rather than certify or condemn a repository on an ingestion failure." The
comment names it precisely: *an ingestion failure wearing a verdict's
clothes.*

It also demonstrates the derive-don't-read rule. The predicate is
`report.incomplete === true || report.dimensions.length === 0`, because
"`incomplete` is stamped by the current engine, but a persisted or
reconstructed report can predate the field — and an empty `dimensions`
array means exactly the same thing."

## Deviation: the refusal reaches only one surface

`governance.ts:106-115` keeps `incomplete` in its failure-reason tally
"for shape completeness" and leaves it at 0, because the fleet path scores
from persisted numbers and "cannot observe an empty-dimensions report."
The comment is honest about the gap and names the repo gate as the surface
that fails such a scan closed. The standard is unchanged: a rollup that
cannot detect an incomplete assessment is counting incomplete scans as
either passes or ordinary failures, and the honest resolution — a fourth
state on the rollup, or persisting the completeness flag alongside the
numbers — is still owed.
