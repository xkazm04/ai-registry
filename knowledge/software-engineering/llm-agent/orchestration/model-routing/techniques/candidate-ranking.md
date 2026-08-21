---
layer: technique
type: technique
subject: model-routing
technique: candidate-ranking
status: forged
laws:
  - count-carries-predicate
  - derivation-names-recomputation
shared_with: []
use_when: [deciding whether a factor joins the score or multiplies it, a candidate frozen out after two early failures, suspending exploration while the roster degrades]
---

# Candidate ranking

Classification and calibration answer a question asked offline: *what kind of
model should serve this class of call.* They cannot answer the question asked at
request time — *which of the candidates that satisfy that answer should serve
this call, right now* — because the inputs to that one change hourly: an
endpoint is refusing, a quota is nearly spent, a provider got slow this
afternoon. Candidate ranking is the technique of ordering the surviving
candidates from live measurement, in a way that stays interpretable and does not
freeze anything out permanently.

It runs strictly downstream of everything that decides *eligibility*. Policy has
already eliminated the forbidden (see routing-policy), floors the incapable (see
capability-floors), grouping has established what "the same model" means (see
model-identity). Ranking never re-admits anything those removed; it only orders
what is left.

## Ranking terms and guardrail factors are different things

The design that accretes by default sums a pile of bonuses: a success
probability, plus a latency figure in raw time units, plus a capability index,
plus a penalty for recent errors — each one hand-capped so that the orderings
"still come out right". Those caps are the tell. They exist because the terms
were never commensurable, and every cap is a constant chosen to defeat a
specific ordering someone noticed was wrong. The design has no meaning, only a
history of patches, and its next term will need a cap too.

The shape that survives separates two roles:

- **Ranking terms** describe how *good* a candidate is, and they must be
  commensurable: normalize each signal to a common bounded range and combine
  them as a **convex combination** — weights that sum to one. The result is
  bounded, interpretable, and comparable across candidates; adding a term means
  redistributing weight, not inventing a new cap.
- **Guardrail factors** describe how *dangerous* a candidate is right now, and
  they **multiply** the combined score rather than joining it. The distinction
  is load-bearing: a guardrail must never reorder healthy candidates against
  each other — it exists only to pull a candidate down as it approaches
  trouble, and to the floor when it arrives. Two guardrails recur: remaining
  headroom against the candidate's own quota, and current refusal pressure from
  the provider.

Adding a term to the sum reweights everyone. Adding a guardrail changes nobody
until the guardrail's condition is real. Confuse them and a transient refusal
permanently reorders the roster.

## Reliability is an estimate, and it has uncertainty

The naive reliability term is observed successes over observed attempts. It has
a failure mode that guarantees the worst outcome exactly when it matters: a
candidate that failed twice, out of two attempts, scores zero and is never tried
again — so it never accumulates the evidence that would clear it, and a bad
afternoon becomes a permanent exclusion. The same arithmetic makes an unmeasured
candidate indistinguishable from a broken one.

Reliability is therefore an estimate drawn from a posterior with a prior, not a
ratio:

- **An unseen candidate is uncertain, not good and not bad.** The prior says so
  explicitly, and the ranking draws from the distribution rather than its mean,
  so exploration is automatic and *proportional to uncertainty* — heavily
  measured candidates are ranked on what is known about them, thinly measured
  ones get tried.
- **Evidence decays.** A failure from last month should not outweigh a success
  from this morning; the weighting window is part of the estimator, and it is
  named (law: derivation-names-recomputation).
- **Shared priors dilute automatically.** Where starting evidence is imported
  from outside this installation, local observations must swamp it as they
  accumulate — an imported prior that never yields is a hardcoded opinion.

## Strategy is a weight vector, not a second engine

Operators legitimately want different postures: cheapest, fastest, strongest,
most reliable, hold-my-manual-order. Every one of those is the same engine with
a different weight vector — including the manual order, which is the degenerate
vector that defers entirely to a stated sequence. Implementing them as separate
selection paths produces four rankers that drift, and the guardrails end up
applied by three of them.

## Exploration is a luxury of health

Exploration is worth its cost when most candidates work: the occasional probe of
an uncertain candidate buys information cheaply. When a large share of the
roster is failing at once, the same behavior spends the call's substitution
budget on endpoints already known to be dead, and the budget is the scarce thing
during exactly that incident.

So the ranking layer carries a **coarse health state** with a stated contract:
below a healthy-candidate ratio, sustained for a grace period, exploration is
suspended and the layer follows the scored order of what remains. Three details
make it safe rather than another oscillation:

- **The entry grace exists so one bad sampling pass cannot flip the state**, and
  the **exit grace is longer than the entry grace**, because leaving too early
  re-enters immediately and the state flaps.
- **The ratio needs a minimum population.** A one- or two-candidate roster is
  either working or not; running a ratio threshold over it means the state
  tracks a single endpoint's weather.
- **The state is observable and it is a stated mode**, not an emergent
  behavior. Operators comparing a degraded window against a healthy one are
  otherwise comparing two different rankers without knowing it.

## Decision rules

- **Every score is a derived value and names its recomputation** (law:
  derivation-names-recomputation): its inputs, its window, its decay, and how to
  reproduce it. A ranking nobody can recompute cannot be debugged, only
  re-tuned.
- **Every score that travels carries its sample size** (law:
  count-carries-predicate). "94% reliable" over eleven attempts and over eleven
  thousand are different claims, and a dashboard that prints only the first
  number invites a roster change based on noise.
- **Ranking never overrides eligibility.** A high score cannot re-admit a
  policy-blocked provider or a candidate below a capability floor. If ranking
  can outvote a floor, the floor is a suggestion.
- **A success must not purge accumulated failure evidence.** Decrement it; a
  struggling endpoint always produces the occasional lucky call, and letting one
  clear the record means the case against it can never finish assembling (the
  same discipline circuit-breakers states for trip evidence).
- **Weights are data, and a weight change is a policy change.** It moves spend
  and it moves quality, so it goes through the same review the rest of routing
  policy does (see policy-governance) — not a settings toggle nobody diffs.
- **Rank the members, then the groups — never the reverse.** Ordering groups by
  an aggregate of their members' health hides the one healthy member behind
  four sick ones and retires a model that was available all along.
