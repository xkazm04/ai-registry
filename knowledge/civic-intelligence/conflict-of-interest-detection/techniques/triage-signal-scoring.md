---
layer: technique
type: technique
subject: conflict-of-interest-detection
technique: triage-signal-scoring
status: forged
laws: [deterministic-code-owns-numbers, non-partisan-symmetry, incident-anchored-doctrine]
shared_with: []
use_when:
  - ranking conflict-of-interest leads for finite human review capacity
  - designing a red-flag score over money ties
  - a review queue is sorted by severity and reviewers are burning time on ghosts
---

# Triage signal scoring

Detection at population scale produces more leads than humans can verify,
so ranking is part of the method — and a rank is a number next to a named
person, which makes it subject to the full discipline of published figures:
computed by deterministic, reviewable code, decomposable into declared
components, identical across every surface that shows it, per
[deterministic-code-owns-numbers](../../_laws.md#deterministic-code-owns-numbers).
A model may summarize a lead; it never scores one.

## Three orderings for three questions

The central craft insight is that "rank the leads" hides three different
questions, and collapsing them is the standard failure:

- **Significance** — *how big a story is this lead if it verifies?* A
  weighted composite of the lead's red-flag structure (below). Right for
  editorial prioritization and public presentation of verified findings.
- **Review order** — *in what sequence should a human clear the queue?*
  Trust tier first (register-confirmed classes by conflict intensity, then
  everything unconfirmed regardless of money), money descending within
  tier. Owned by the corroboration technique; the point here is only that
  it is *not* the significance score, because significance rewards exactly
  the large unverified claims that review must not start with.
- **Evidence completeness** — *which lead gives the reviewer the most to
  work with?* A sum of declared evidence parts present (confirmed role,
  known period, linked decisions, money documentation), rendered with its
  decomposition beside each lead. Right for pattern-derived watchlists,
  where the goal is verdict throughput: a triage surface does not say what
  is worse, it says where the reviewer has the most in hand.

Each ordering is a pure function of the lead's own fields — no global
state, so any subset sorts identically to the whole and a lead's rank key
can be recomputed and audited in isolation.

## Anatomy of a significance score

The components that have earned their place, and the reasoning that keeps
each honest:

- **Money on a log scale.** Public-money amounts span many orders of
  magnitude; a linear term lets one giant tie flatten all other structure.
  Log-scaling means a 10x money difference moves the score by a constant
  step, so structural signals stay visible at every size.
- **Tie class as a multiplier**, not an addend — an owner-operator's
  modest money must outrank a steward's fortune, at every money level.
- **Compounding patterns as bonuses.** The strongest red flags are
  conjunctions: the *accountability triangle* — one entity that
  simultaneously holds public contracts, draws subsidies, and donates to
  the official's party, three relationships forming a closed circuit of
  money and favor — earns the largest single bonus. Clusters of
  transactions sitting just under a regulatory publication or procurement
  threshold earn a per-instance bonus, **capped** so bulk repetition of one
  trick cannot dominate the queue. A donation dimension present at all
  adds a flat term.
- **Temporal alignment twice** — the aligned amount (log-scaled) and the
  aligned *fraction*, the latter catching entities whose public revenue
  concentrates suspiciously inside the role window even when totals are
  modest.
- **Cross-pattern flags outside the class multiplier.** A signal from an
  independent detector (say, an implausible-officer pattern on the same
  entity) adds unscaled — it is evidence of a different kind and should
  not be discounted because the tie class is weak.

Weights are declared constants in one shared module — every consumer
(interactive surface, offline pipeline, export) imports the same formula,
because two hand-synced copies of a ranking function will drift, and in
this domain drift always eventually mis-ranks a named person. Rounding is
part of the formula. When a stored score's inputs have moved beneath it,
the current-formula recomputation is used and the divergence is counted,
never hidden.

## Decision rules

- **Score the whole population or nothing.** A score computed only over
  suspects launders the selection into apparent measurement, per
  [non-partisan-symmetry](../../_laws.md#non-partisan-symmetry); the
  formula's neutrality is meaningless if its input set was editorial.
- **Ship the decomposition.** Every rendered score can expand into its
  components with their weights; a score that cannot explain itself is an
  accusation with extra steps.
- **Version the formula and stamp outputs**, exactly as with the join
  rule: two lists ranked under different weights must not be confusable.
- **Change weights only against incidents, not vibes.** A weight adjusted
  because the queue "felt wrong" will be re-litigated forever; a weight
  adjusted because a measured mis-ranking is on record — with the date and
  the counts — resists erosion, per
  [incident-anchored-doctrine](../../_laws.md#incident-anchored-doctrine).
- **Ties in score break deterministically** (stable id), so re-runs never
  reshuffle equal-scored leads.

## When not to use it

A triage score must never render as a public "corruption score". It ranks
*unverified leads for internal attention*; publishing it attaches a
machine-made number to a person whose case no human has judged — the exact
harm the lead/finding boundary exists to prevent. After verification, what
publishes is the verified facts and the method, not the triage number that
got a reviewer there. Nor should the score replace the trust-tiered review
order: a queue worked purely by significance burns its scarcest resource —
reviewer attention — on the biggest unconfirmed ifs.
