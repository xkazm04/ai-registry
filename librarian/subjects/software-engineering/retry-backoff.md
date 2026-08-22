---
subject: retry-backoff
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# retry-backoff

First touch: [[2026-08-22-1]], the pilot of the external-reconcile lane — an
application written against a world-class tree outside any consumer repo.

## State

Six techniques, applications now on two stacks: rust (circuit-breakers,
durable-retries, from the consumer repo) and node (storm-control, from
`awslabs/smithy-typescript`). The single-stack debt this subject carried is
cleared; four techniques still have no application on any stack.

## Open leads (banked, with return conditions)

Three candidate upward lessons for the technique layer, observed in the smithy
reconcile but NOT yet applied — each needs a second independent sighting before
it earns a technique edit, per deepen's convergence rule:

- **Success-denominated retry budgets.** storm-control words the aggregate cap
  as "a stated fraction of recent request volume" (a windowed measure); smithy
  implements it with no window at all — the bucket refills only from successes,
  so capacity self-scales to the success stream. If another major tree does the
  same, the technique's wording should admit both denominators.
- **Evidence-gated pacing.** Adaptive send-rate limiting that stays fully OFF
  until the first throttling error — storm control with zero calm-weather cost.
  Candidate addition to the "pace the release" bullet.
- **Bounded trust of server backpressure.** `retry-after` hints honored but
  clamped into `[computed, computed + 5s]` — respects the dependency without
  letting a broken header schedule an unbounded sleep. Belongs to backoff-design
  if it recurs.

## Declines

- Did not stamp `verified_against` on the node application: its contract is a
  stack runtime version, and the truthful pin here is a third-party library
  version + commit, which lives in the application's prose. If external
  reconciles become a standing lane, the profile may want a field for this —
  a proposal for the profile's owner, not a unilateral edit.
