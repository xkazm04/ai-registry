---
layer: technique
type: technique
subject: judge-contract-design
technique: mixed-rubric-honesty
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
use_when: [combining mechanical and judged dimensions in one rubric, reporting agreement for a mixed rubric, aggregating multi-sample judge verdicts]
---

# Mixed-rubric honesty

The concern: the moment a rubric mixes mechanical checks with judged
dimensions, three quiet dishonesties become available — double-counting a
check, flattering the judge's stability, and reporting confident numbers
where no judgment occurred. Each is individually invisible on a dashboard.
The technique is the set of rules that closes all three, and they are
rules, not preferences.

## Rule 1 — not narrated, not double-counted

A mechanical dimension is invisible to the judge: it appears in neither
the prompt's dimension narration nor the response schema the judge fills
in. Filter at the single place the dimension list is rendered, and share
that filter between the prompt builder and the schema builder so the two
can never drift into asking for different shapes. The failure this
prevents is subtle: a narrated mechanical dimension gets scored twice —
once exactly, once as an opinion — and when the two disagree, the weighted
overall contains a contradiction no reader can see. It also spends tokens
asking for an answer the engine will discard, and invites the judge to let
its opinion of the mechanical axis bleed into neighboring dimensions.

## Rule 2 — agreement is a sampled-judgment-only statement

Cross-sample agreement exists to measure the *judge's* stability: run k
samples, compare their per-sample overalls, report the spread. A
mechanical dimension is evaluated once and is exactly reproducible —
folding it into agreement drags every mixed rubric toward perfect
agreement in proportion to its mechanical weight, hiding exactly the
instability the number exists to expose. So: agreement, samples-parsed and
parse-failure counts cover the sampled (judged) dimensions alone, computed
over per-sample overalls weighted across judged dimensions only — while
the verdict's `overall` covers every dimension. Two aggregates, two
scopes, both disclosed. A reader who cannot tell which scope a number
covers has been misled by construction.

Two boundary cases follow from the same principle. Agreement is measured
over the samples that actually *parsed*, not the count requested — a lone
surviving sample has nothing to disagree with and honestly reports full
agreement alongside a parse-failure count that tells the real story. And
an all-mechanical rubric took no samples at all: it is in full agreement
by construction, with zero samples disclosed beside it.

## Rule 3 — absence of judgment is never a score

When no sample parses even after the repair path, there is no judgment —
so there is no score. Surface the raw failing output as an error state,
never a confident-looking 0.0 fail: a zero is a measurement of the
candidate; a parse failure is a measurement of the judge, and writing the
second as the first corrupts the candidate's trend with the instrument's
malfunction. The same posture applies to operator errors (a misconfigured
mechanical check is a loud configuration failure naming the dimension) and
to cost (a verdict with no priced samples records null cost, not zero).

## Rule 4 — every paid sample leaves an audit trail

Samples beyond the first were billed; their reasoning is the audit trail
for the mean they moved. Keep every sample's per-dimension reasoning in
index order, not just the first — when a mean surprises a reader, the
question is always "which sample dragged it", and a verdict that discarded
the other reasonings cannot answer. Cost, latency and tokens are accounted
even for samples that failed to parse: the call burned real money, and
hiding it under-reports the judge's true expense.

## Decision rules

- When adding a dimension, decide its kind first; the narration filter,
  the agreement scope and the schema all key off it.
- When reporting a mixed verdict, place `agreement` beside
  `samples_parsed` and `parse_failures` — the three are one disclosure.
- When a reader asks "why did this pass", the answer must be assemblable
  from the verdict alone: per-dimension scores, weights, floor hits, and
  reasonings — mechanical ones included.

## When not to use it

None of this matters for a single-kind rubric — all-judged rubrics have no
narration filter to get wrong, and all-mechanical rubrics have no
agreement to flatter. The rules exist for the mix; adopt them the moment
the second kind enters the contract, not after the first contradiction
ships.
