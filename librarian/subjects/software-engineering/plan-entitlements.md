---
subject: plan-entitlements
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# plan-entitlements

First touch: [[2026-09-02-1]]. Class: MATURE (6 techniques; was 3 applications
node ×2 + process; 6 consumer deviations on the floor).

## State

6 techniques, 5 applications (node ×2, process, **elixir**, **spec**). The
elixir application is the corpus's first on that stack; `stacks:` was widened
for it this run. The spec application carries `refresh_by: 2026-12-02` (vendor
landscape, ~3 months) — the first clock this subject has.

## What run 2026-09-02-1 changed

- `entitlement-lifecycle-revocation`: a **retries-exhausted** state (does not
  entitle) and four qualifications — active is provider good-standing, not
  proof of payment; the retries-exhausted end is provider-configured, so the
  product bounds its own grace; period end vs termination timestamp, leeway on
  the order of a day; refund is charge-level. Downgrade guard step 3: **compare
  state, never delivery order or event timestamps**. New section: an unknown
  tenant at grant time is a retry, not a refusal. Survival ladder gains its
  rule: stop the reversible side, keep the side whose stopping loses data.
- `capability-gate-predicates`: gate-vs-grant distinction; rollout flag vs
  entitlement separated by the "would it change on upgrade" test.
- `price-book-authority`: drift detector keys on the price identifier, not the
  product (immutable prices).
- Golden path: release-flag seam; the "not cancelled" trap.
- One blind-lane claim refuted the other way: providers do NOT leave
  paused-collection access to the merchant; the technique honours the verdict.

## Open leads (banked, with return conditions)

- **Seat / quantity entitlements** — blind-lane prediction, no primary material.
  Return when a tree with per-seat billing is read.
- **Two-cycle + margin + grace** as a quota-enforcement rule — single origin,
  kept in the elixir application. Return on a second sighting; home may be
  cost-metering.
- **A feature-flags subject does not exist** in this bundle; the golden path's
  release-flag seam has nothing to link to. Forge candidate if consumers ask.

## Cross-subject proposals (placed)

- webhook-ingestion: provider behaviour changes with the endpoint's
  acknowledgement latency (a checkout waits on the webhook response before
  redirecting; an unacknowledged invoice-created delays finalization). Recorded
  on [[webhook-ingestion]].
