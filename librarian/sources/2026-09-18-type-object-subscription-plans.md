---
source: youtube:IdwdqdywNOM
kind: youtube
url: https://www.youtube.com/watch?v=IdwdqdywNOM
title: This Design Pattern Replaces an Entire Class Hierarchy
author: ArjanCodes
words: 2642
extracted: 9
accepted: 1
declined: 0
leads: 1
already_covered: 7
untriaged: 1
dispatched: 0
applied: 1
shipped: 1
run_id: intake-IdwdqdywNOM
siblings: 0
fetches: 1
---

# Type Object over a subscription hierarchy: where the plan table lives

**Class:** second-hand practitioner explainer. One speaker teaches a pattern
from the published literature (the Type Object pattern) on a toy
subscription system: subclasses per plan, then parallel per-plan dictionaries,
then a plan object the subscription references, then a pricing strategy
composed into that object. No measurements and no production system. Expected
yield, stated before triage: catches, with at most one boundary. The corpus
owns this pattern twice: generically in `gameplay-runtime-patterns` (game
bundle) and applied to tiers in `plan-entitlements`.

**Board:** 0 live siblings at claim. The primary checkout was on
`harvest/live-system-demo-film`, 45 commits behind `main`. Every registry
write landed in the `main` worktree (`C:/t/main-land`, clean at the time), and
the stale checkout was restored.

**Declared focus** (`extract`, widened to the sibling lane; read the joins
first): it applies only weakly. A single-topic explainer has no joins. The
yield came, as it did in the last two runs, from the fleet seam hunt and not
from the source.

## Triage

Upper-layer rows were scored under v2.5. There were no currency rows.

| # | Shape | Title | Prior art | Impact | Read | G/R/C | Decision |
| - | - | - | - | - | - | - | - |
| 1 | technique | Stop storing configuration in a class tree | game `gameplay-runtime-patterns/data-driven-type-objects-over-subclass-growth` | none | likely catch | - | catch |
| 2 | technique | Choose by what varies: a label, data, or behaviour | game `.../pattern-selection-by-force-present` ("variance in numbers -> one type reading a data row") | none | likely catch | - | catch |
| 3 | correction | Parallel per-plan maps crash on a forgotten key | `data-driven-type-objects` ("an absent entry is not a default"); `tier-model-single-source` (add a tier, count the files) | none | likely catch | - | catch |
| 4 | technique | A subscription has a plan; it is not a plan | `tier-model-single-source`, `inherited-tier-not-cloned-tier` (pointer to the root tier) | none | likely catch | - | catch |
| 5 | technique | The plan table lives in code or in a store, and the store loses the gates | `plan-entitlements`: nothing owns where the model lives or who may edit it | new-technique | partial -> real gap | 3/0/2 | **accept** |
| 6 | correction | Copying features onto each customer's record drifts | `inherited-tier-not-cloned-tier` | none | likely catch | - | catch |
| 7 | technique | Loading plans from the database is slower | tier model as static table; absorbed into row 5 ("cache the resolved tier, do not fork it") | none | thin | - | catch |
| 8 | technique | Put fixed vs usage pricing behind a strategy the plan holds | `usage-pricing-models` (five shapes, one axis); the plan-entitlements/cost-metering seam | none | likely catch | - | catch |
| 9 | technique | The software bundle has no general home for variation modelling | only the game bundle carries it; `HOME IF NEW` resolved to an unrelated category | new-technique | partial | 2/1/2 | untriaged |

**Row 5, the promoting question** was: does `plan-entitlements` say where the
tier model lives, or who may change it through what door? It does not. A grep
of the golden path and all nine techniques for deploy, runtime, schema,
console and editing finds only deployment *mode*. A missing stage, not a
missing opinion. The source only establishes the trade-off (fixed plans as
immutable module constants, editable plans as database rows, "flexibility at a
cost"). The sharper half, that editing a subscribed tier is a bulk downgrade
that skips the lifecycle handler, is this run's own inference. So one fetch
was spent on the payment provider's entitlements documentation, which markets
the editable catalog ("without needing to change your codebase") and states
that "existing subscriptions will create active entitlements for any product
feature changes at the start of the next billing period", delivered through
the same entitlement-updated event as an upgrade or cancellation. Primary
fetched and read by the director: RISK 0. There is an independent convergence
for the load-time half: the game bundle's own rule, "the load-time check is
what replaces the compiler". GAIN 2 + 1.

**Row 9** is banked, not declined. Its home is contested (no software-bundle
subject models domain variation), and it would restate a technique that
already exists one bundle over. Return: a second source on domain modelling,
or a software subject whose scope names it.

## Landed

- `software-engineering/operations/service-operations/plan-entitlements/techniques/live-catalog-edit-is-a-lifecycle-event.md`,
  plus the golden path (`techniques:` list, one paragraph under "The model is
  declared once", one line in the technique index). Three gates a store-resident
  model loses (compiler -> load-time schema; deploy -> a narrowing is a
  per-tenant lifecycle event at a period boundary; review -> an offer nobody
  should inherit is a new tier). **Corrected before landing by its own apply
  step:** the draft said a code catalog escapes gate two. The kp seam refuted
  that, and the technique now says gate two is not a property of the store.
- Application `node--live-catalog-edit-is-a-lifecycle-event.md` (kp,
  `applied: code`, `ab_verdict: better`, `proof: ab-paired`).

## Apply (Phase 7.5)

**Seam chosen to falsify** the claim that a code catalog escapes the bulk
downgrade. kp keeps its tier model in `app/_lib/billing/plans.ts` and already
does gate three well (`legacy: true`: withdrawn from sale, still honored). A
CAUGHT outcome would teach that the technique is store-only. It was not caught.
On 2026-08-16 one deploy gave every paid tier two new capped meters where it
had unlimited publishing (Starter and BYOM to 3 posts a month, Growth to 10,
plus a billed `hires` overage). The same commit rewrote the three number-pinned
tests to derive from the catalog.

- **Target:** narrowings surfaced before merge. **Floor:** 0 flags on
  widening, adding or retiring transitions.
- **A:** the existing suite, 0 of 5 transitions flagged.
- **B:** an acknowledged-baseline detector (a new cap counts as a fall from
  unlimited), replayed over all 6 versions of `plans.ts`. It flags only
  `275141050` (8 caps, 4 tiers) and 0 elsewhere, including the BYOM
  withdrawal and the `ai_candidates` raises inside the flagged commit.
  Mutation on HEAD: a narrowing goes red, a widening in the same edit stays
  silent.
- **Shipped** kp `83085b027` (test, 4/4, `tsc --noEmit` clean) and `4774f4531`
  (`.ai/applied.jsonl` row). Not pushed.

## Lead

- **ascent's operator plan control.** ascent has an admin `PlanControl` surface
  and an org-plan route beside a code catalog. Whether an operator edit there
  can narrow a paying org outside the lifecycle path was not read. Return: the
  next `/intake apply live-catalog-edit-is-a-lifecycle-event --project ascent`.

## Directions

n/a (a video, no design record).
