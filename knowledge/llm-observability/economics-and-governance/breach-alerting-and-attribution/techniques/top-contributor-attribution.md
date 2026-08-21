---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: top-contributor-attribution
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [a breach alert names the limit but not the cause, deciding what diagnostic detail an alert carries, attribution queries are slowing ingest]
---

# Top-contributor attribution

The operator's next question after any budget breach is invariant: *what is
burning the money?* An alert that does not answer it in its own payload has
delegated the diagnosis to a paged human, during the incident, against a
rolling window that keeps moving while they reconstruct it. The technique:
every breach alert carries the **top contributors to the breached window's
spend** — a short ranked list, each entry with a label, a currency figure, and
a share of the window's total — computed from rollups the system already
maintains, inside the off-path delivery task.

## The shape of the answer

Three contributors is the right k. One hides the second-order story ("the big
model, but also that new batch job"); ten is a report, not an alert. Each entry
carries **both** the percentage and the absolute figure: a share without
dollars invites panic over 90% of a trivial window; dollars without share hide
whether the top spender is dominant or merely first among equals. Sort by cost
descending, drop zero-spend rows, and compute shares against the window total
— not the top-k total, or three near-equal contributors will appear to own
100% of a window they own half of.

Labels should be decision-ready. A bare model identifier is a fact; a model
annotated with its dominant workload — "the expensive model, mostly doing
summarization" — is a lever, because workloads can be rerouted and models
swapped per workload. When the rollup can cheaply say what a contributor was
*doing*, say it in the label.

## Where it computes, and from what

Attribution runs **inside the spawned delivery task, never on the ingest
path** — it adds zero cost to admission. And it reads **existing rollups**, the
same windowed cost summaries the analytics surfaces already serve, not a fresh
scan of raw events. This constraint is load-bearing twice over: it keeps the
attribution query bounded regardless of window size, and it guarantees the
alert agrees with the console — the operator who clicks through from the alert
sees the same numbers, because they came from the same aggregation.

Note what this implies about *which* spend is attributable: rollups aggregate
priced cost, so events whose cost could not be priced contribute nothing to
attribution even though they may have contributed calls or tokens to the
breach. For a cost-metric breach this is correct; for a calls- or tokens-metric
breach, cost-based attribution is an approximation and the honest payload does
not dress it up as exact — unpriced traffic is absent from the list, not
counted at zero and ranked last.

## Best-effort degradation, disclosed

Attribution is enrichment, and enrichment never blocks delivery. The decision
table:

- **Rollup read fails** → deliver the alert without the attribution section.
  A store error degrades to absence, never to a delayed or dropped alert.
- **Rollup is empty (unscoped rule)** → omit the attribution section entirely;
  a project-wide breach with no rollup rows means the rollup pipeline is
  behind, and inventing an answer would be worse than silence.
- **Rollup is empty (scoped rule)** → do *not* go silently blank: state that
  the scope had no attributable spend in the window. A missing section reads
  as "the system didn't try"; an explicit "none attributable" is an answer
  about absence, which is itself diagnostic (the breach came from unpriced or
  out-of-scope traffic).

The payload carries attribution in two forms: a human sentence appended to the
alert text (chat channels render text), and a structured block (custom
receivers parse fields). Both are generated from one composed result — two
renderings, one computation — so they cannot disagree.

## Keep composition pure

Split the pure composition (grouping, ranking, share math, scope wording) from
the I/O that fetches rollup rows. The composition is where every subtle bug
lives — share denominators, tie handling, label annotation, empty-scope
wording — and a pure function over fixture rows makes each of those a
one-line unit test. The fetch is two queries and an error-to-empty fallback;
it needs almost no testing. Fused together, neither is testable without a
seeded store.

## When not to use this

Do not attribute along an identity axis (per key, per customer) into a
broadcast alert — that boundary has its own technique and it is a refusal. Do
not extend attribution into remediation advice ("consider capping X") inside
the alert; the alert states measured fact, and advice belongs on the
interactive surface where the operator can see context. And if a rollup does
not exist for the breached dimension, build the rollup first — attribution
computed by scanning raw events inside the delivery task is a time bomb that
detonates on the first tenant with a large window.
