---
layer: application
type: application
subject: plan-entitlements
technique: live-catalog-edit-is-a-lifecycle-event
stack: node
verified_on: 2026-09-18
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A code catalog that narrowed every paid tier in one deploy

The version witness is the tree's own `package.json` engines field
(`>=24.0.0 <25.0.0`) and its CI pin (`node-version: 24` in
`.github/workflows/ci.yml`). The seam is KP's hosted tier catalog,
`app/_lib/billing/plans.ts`, which is a code-resident model: an immutable
`PLANS` record that the gates, the billing API and the pricing panel all import.
It already implements gate three well. BYOM was withdrawn from sale with a
`legacy: true` flag whose comment states the rule exactly ("Withdrawn from
sale, still HONORED... Retiring a tier by DELETING it would silently drop
paying customers to free on the next entitlement read").

The seam was chosen to **falsify** the technique's claim that gate two, the
bulk downgrade, is a store problem that a code catalog escapes. It did not
survive: the claim was wrong, and the technique was corrected before it
landed.

## What the history shows

Six commits touch the catalog. One of them, `275141050` (2026-08-16, "billing:
price outcomes - a role taken to market, and a person hired"), replaced a
concurrency cap that every paid tier had at `null` (unlimited) with two new
monthly meters, `job_posts` and `hires`, capped on every tier. Starter and
BYOM went from unlimited publishing to 3 job posts a month, Growth to 10. The
`hires` meter is debited and billed on overage, never blocked, so it is a new
charge rather than a refusal. It reached every tenant at deploy time,
mid-period, through no lifecycle event and no downgrade handler.

It passed review because it *was* a good pricing change, and it reads like
one. The detail that makes this application worth copying is in the same
commit's body: "the three tests that hardcoded 5/100/400 now derive from the
catalog - they broke as a set on this change, which made a pricing tune look
like a regression." Rewriting number-pinned tests to derive from the model
is the right fix for a brittle test. It also removed the only instrument that
could see a limit move in either direction.

## A and B

- **A (the suite as it stood):** no test compares the catalog against any
  earlier state. Over the catalog's full history it flags 0 transitions.
- **B (a narrowing detector):** an acknowledged baseline of every self-serve
  tier's caps, failing when a cap falls, with a cap that appears where the
  tier had none counted as a fall from unlimited. Contact-sales tiers are
  excluded, because they are priced per contract.

**Target:** narrowings surfaced before merge. **Floor:** zero flags on
transitions that only widen, add or retire tiers.

Replayed over all six historical versions of `plans.ts`, B flags exactly one
transition, `275141050`, with 8 narrowed caps across 4 tiers (3 of them paid).
It flags 0 in the other four transitions, including the BYOM withdrawal and
the `ai_candidates` raises (5->25, 100->300, 400->1200) inside the flagged
commit itself. On the current tree, a mutation lowering `growth.job_posts`
from 10 to 6 while raising `ai_candidates` goes red on the first edit only.
The target moved and the floor held: **better**.

Shipped as `app/_lib/billing/plans-narrowing.test.ts` (kp `83085b027`, 4
tests, `tsc --noEmit` clean). Its failure message names the two legal paths:
mint a new id and mark the old one legacy, or update the baseline and state in
the commit when existing subscribers get the change.

## What the realization cannot do

- **It sees caps, not capabilities.** KP's model carries only numeric limits.
  A catalog with boolean capabilities needs the same check over the capability
  set, where removing a flag is the narrowing.
- **It forces a decision; it does not enforce the period boundary.** Updating
  the baseline is one line, and nothing checks that the commit actually states
  an effective date. The effective date itself would need the allowance ledger
  to key on the subscription's paid period rather than the calendar month.
  KP's own `period-anchor.test.ts` documents that it does not do this yet, and
  that is a separate open defect.
- **Whether anyone was actually narrowed is unmeasurable from the tree.**
  Metering is on only in commercial deployments with billing state, and the
  hosted subscriber count on 2026-08-16 is not in the repository. The
  instrument that would settle it is the hosted database's
  `billing_state` rows as of that date.
