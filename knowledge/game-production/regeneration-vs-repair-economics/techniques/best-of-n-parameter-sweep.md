---
layer: technique
type: technique
subject: regeneration-vs-repair-economics
technique: best-of-n-parameter-sweep
status: forged
laws: [a-budget-shapes-the-output, no-gate-self-certifies]
use_when: [a generator is deterministic and re-rolling changes nothing, choosing among several generated attempts, looking for free quality before paying for more attempts]
---

# Best-of-n parameter sweep

## The concern

Generate several candidates, grade each one, keep the highest. It is the cheapest quality
lever available before the paid branch, and it is the *only* self-correction lever when the
generator is deterministic — feeding the same input back returns the same output, so "try
again" is literally a no-op and the variance has to come from somewhere you control.

## What to sweep

The axes are whatever the generator exposes that changes the output without changing the
brief: input framing or crop ratio, extraction or sampling resolution, seed where one
exists, and — the largest lever, and usually upstream — the input artifact itself. Sweeping
the brief is not a sweep; it is a different asset.

Keep n small. The cost is n times the generation cost plus n gradings, which is exactly
why this belongs on the cheap side of the ledger and stops belonging there as n grows. A
sweep of three to five across one axis is the usual shape.

## Procedure

1. **Fix the base specification.** One brief, one asset class, one budget.
2. **Enumerate labelled variants**, each differing from the base along one axis, with the
   label naming the axis and its value. The label is how the result becomes knowledge.
3. **Generate each variant to its own destination**, derived from the base name plus the
   sanitised label. Candidates that overwrite each other cannot be compared.
4. **Grade each candidate with the production grader** — the same one the gate uses, not a
   cheaper proxy. Selection quality is capped by grader quality, and a proxy grader
   silently changes what "best" means.
5. **Rank on the combined score, carrying its basis**, and select the highest-scoring
   candidate that actually produced an artifact.
6. **Retain every candidate and its card.** The losers are measured pass-rate data the
   economics branch needs, and they are free once generated.

## Decision rules

- **Sweep one axis at a time unless you can afford the cross product.** A winner whose
  differing axis cannot be attributed teaches nothing about the next asset, which is most
  of the value.
- **Grading is best-effort per candidate, but an ungraded candidate never wins.** A grader
  that throws on one candidate must not abort the sweep; that candidate simply carries an
  ungraded basis and cannot be selected as best.
- **"Best" is not "acceptable".** The highest score in a batch of failures is a failure.
  Report the winner *and* whether it cleared the gate, as two separate facts — never infer
  acceptance from the existence of a best.
- **Grade absolutely, never relative to the batch.** The batch is not the standard; what
  ships is. A sweep tempts curve-grading harder than anything else in this subject, because
  a ranked list looks like a verdict.
- **The generator's own confidence is not a selection criterion.** A producer scoring its
  own output is an input to the decision, recorded as self-reported; the authority is the
  separate grader.
- **State the requested budget on every candidate and grade delivery against it.** A sweep
  is also an audit of whether a variant honours the budget it was given — a variant that
  overshoots its own requested limit is a finding, not a rounding difference.

## Sweeps as negative audits

The most durable output of a sweep is often a rejection, and rejections must be recorded at
the decision point or they get re-run. A worked shape: a vendor option promising controlled
output size was swept against the baseline across three budgeted asset classes, same model,
same settings. It overshot its own requested limit in every class by 1.26× to 1.35× where
the baseline honoured its budget every time at 0.82× to 0.96×, produced fifteen to thirty
times more fragments, and scored equal or worse on the perceptual grader in every class.
That is a completed negative audit, not an open gap — and writing it down beside the
setting, with the per-class numbers, is what stops the next session from re-benchmarking it
from scratch or, worse, enabling it on the strength of the marketing claim.

## When not to use this

- **When the generator is stochastic and cheap.** Plain best-of-n over repeated draws is
  simpler and needs no axis choice; sweep only when a parameter is doing real work.
- **When the defect is stage-determined.** No parameter value cures a property of the
  stage; the sweep will return n candidates with the same failing class and a bill.
- **When you have no grader you trust.** Selection is the grader's judgment applied n times.
  With an untrusted grader the sweep amplifies its bias instead of averaging it out.
