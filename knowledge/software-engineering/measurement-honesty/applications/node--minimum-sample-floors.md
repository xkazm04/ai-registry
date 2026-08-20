---
layer: application
type: application
subject: measurement-honesty
technique: minimum-sample-floors
stack: node
status: forged
verified_on: 2026-08-20
---

# A `>= 5` sample floor across every derived pull-request rate

A Node analyzer folds a repository's recent pull requests into a `PrStats`
object of roughly twenty derived values (`src/lib/analyze/pulls.ts:290-340`).
Six of them are rates that feed scored dimensions. All six are gated behind the
same explicit sample floor, and the code says why in the same place it applies
it.

## The swing-width argument, as written

The comment on `reviewedRate` (`pulls.ts:299-306`) is the clearest statement of
the rule in the codebase:

> at 1–4 human-merged PRs a single unreviewed (e.g. self-merged) PR swings the
> rate 25–100pts, drags D6 through prRigor's 0.5 weight, and can flip the rigor
> axis / posture near the 50 threshold off a meaningless sample.

Every clause is a step of the argument: swing width, the weight that transmits
it, the threshold it can cross, and the decision that then changes. The floor is
not chosen for statistical elegance — it is chosen because below it the metric
reports the composition of the sample rather than a property of the repository.
`aiGovernedRate` records the migration that produced the number: the floor used
to be `>= 3`, at which "a single unreviewed AI PR in a 3-PR window swings the
rate ~33pts and can flip the rigor axis / posture." Five is called out as "the
minimum where the rate isn't dominated by one PR."

## Null, never zero — and the same floor everywhere

The refusal value is `null`, and the comments repeatedly insist on the
distinction: a fabricated `"0% reviewed"` would both "drag D6" *and* "feed the
LLM auditor a stated falsehood" — the second consequence being one this
technique's general form does not anticipate: in an LLM-assisted pipeline, a
fabricated zero is not merely displayed, it is *narrated* by a downstream model
that treats it as established fact and reasons onward from it.

The floor is applied uniformly, with the lockstep requirement written into the
code as an instruction to future editors — "Keep this floor in lockstep with
aiGovernedRate's `>= 5` below":

| rate | denominator | floor |
| --- | --- | --- |
| `reviewedRate` | human-merged PRs | `mergedHuman >= 5` |
| `aiGovernedRate` | AI-involved PRs | `aiInvolved >= 5` |
| `aiTrailerRate`, `aiPreReviewedRate` | merged PRs | `merged >= 5` |
| `reworkRate` | merged PRs | `merged >= 5` |
| `aiReworkRate` | AI-involved merged PRs | `merged >= 5 && aiInvolvedMerged >= 5` |

`aiReworkRate` is the instructive one: a ratio whose numerator and denominator
are drawn from *different* subsets floors on **both**, because either one being
thin is enough to make the quotient meaningless.

Note also what is *not* floored, and correctly so: `analyzed`, `merged`,
`totalCount` and the `avg*` values are counts and means, not ratios, and the
technique's "counts, not rates" exclusion applies to them directly.

## Absence surviving the fold

The floor only pays off if `null` survives aggregation. `src/lib/db/org-signals.ts:110-118`
computes volume-weighted fleet rates and states the contract: "A nullable rate
(reviewedRate / aiGovernedRate — 'no sample') contributes only where present and
stays null when NO repo carries it, preserving the null-vs-measured-0
distinction." The accumulator skips `v == null` with the comment `// "no sample"
— not a measured 0`, tracking `wsum` and `sum` in the same pass so an all-absent
fleet yields `null` rather than `0/0`.

The sort at `org-signals.ts:101-108` extends the same discipline to *ordering*, a
place absence is usually lost: the risk-first sort coerces a null rate to
`Infinity` so that "those rows sort after every measured one instead of
masquerading as 0% coverage." A null that survives the arithmetic but is coerced
in the comparator is laundered at the last possible moment, in the one place
nobody reviews for honesty.

## Downstream renormalization

Refusing a rate leaves a hole, and the consumer closes it the way the sibling
technique requires: below the floor "applyPrSignals renormalizes prRigor over
the measurable hygiene/stability terms" (`pulls.ts:305-306`). The dimension is
scored on what was measurable, not penalized for what was not there to measure.
