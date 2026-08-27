---
subject: machine-paced-delivery
domain: software-engineering
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# machine-paced-delivery

First touch: [[2026-08-27-managing-15-agents-solo-founder]], intake of a
first-party practitioner dialogue (two solo founders comparing their own agent
fleets). Gained `human-gate-capacity` (6 techniques now). Golden path amended in
three places: the opening enumeration, a new section after `proposal-not-push`,
and the `hitl-approval` boundary line.

## What the gap actually was

Not an omission. `proposal-not-push` already states *at machine pace the
reviewer is the bottleneck* - the subject knew. The gap was the **asymmetry**
between how the two bottlenecks are treated: the machine one gets four measures,
distribution discipline, denominators and an ordered demand-reduction section;
the human one gets one sentence, no capacity model, and only per-item slimming.
The subject scaled its first server against machine-paced arrival and routed the
whole output into a second server whose rate was never written down.

Generalizes, and this is the part worth carrying: **a constraint stated in prose
in one technique and modelled thoroughly in another is a finding shaped like an
asymmetry.** Slug maps cannot see it and a summary cannot see it. Only opening
both files does.

## Boundary, as now written in both directions

- `hitl-approval` / `review-queues` - whether a **single** decision can be made
  well: the surface, the context in place, honest batching by homogeneity.
- `machine-paced-delivery` / `human-gate-capacity` - the **rate** at which
  decisions are demanded, and whether it is one a person can meet.

A perfect queue with an unsurvivable arrival rate still launders blind
approvals. `review-queues` names that hazard; it does not own the cause.

## Open leads (banked, convergence rule applies)

- **Unattended capacity buys defect work, never selection.** Both practitioners
  converged on it unprompted, which is in-source convergence and not the
  cross-run kind. This is what would raise `human-gate-capacity` from technique
  to doctrine - it says what the freed capacity is *for*, where the technique
  currently only says to reduce arrival. Return when a second, independent
  source from another run reaches the same rule. Untriaged, not declined.
- **The two mechanisms that instantiate the technique's levers** sit untriaged
  in the same source note: risk-scoring a change so only above-threshold items
  reach a human (lever three), and bounding the review loop plus approving an
  artifact cheaper than the diff (lever two). Both attach to
  `human-gate-capacity` rather than competing with it. The second carries its
  own measured cost boundary in-source - the practitioner who tried the recorded
  walkthrough could not make it run without exhausting the session budget.
- **`verification-throughput-as-constraint`'s prioritization rule is stated for
  the runner queue only** - "human-authored work outranks machine-authored work"
  governs admission to CI. Nobody has stated the ordering rule at the human gate,
  which is where it now binds. Not written, because no source has said anything
  about it yet.

## Hazard for a later run

`stage: solo` on `human-gate-capacity` is a floor claim, and the golden path
argues the subject's floor is one person. If a future reconcile puts this
subject against a large-team tree, check whether the independence section still
reads correctly there - it is written from the one-person case outward, and the
team case may want the inverse framing.
