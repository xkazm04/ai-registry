---
layer: application
type: application
subject: plan-entitlements
technique: capability-gate-predicates
stack: node
---

# Entitlement gates in the Ascent scan-billing path

A four-state charge decision as pure arithmetic, wired by one resolver that
both the read gate and the write gate call, over a tier model that carries the
allowance the gate enforces and the figure the pricing page renders.

## The enumerated decision, kept pure

`src/lib/plans.ts:200` declares the decision type —
`type ScanCharge = "unlimited" | "allowance" | "credit" | "denied"` — and
`decideScanCharge` (`:208-217`) is the whole rule in four lines of arithmetic
over `{ unlimited, allowance, usageThisMonth, balance }`. It performs no
input/output; the comment states the contract explicitly ("Pure — the caller
supplies the org's plan-derived allowance, its month-to-date metered usage,
and its credit balance"), which is what makes every combination unit-testable
and what lets the two gates share it.

The four states earn their existence at the call sites: `"allowance"` tells
the caller the run is free and should not debit, `"credit"` tells it to debit,
and only `"denied"` is the paywall — `src/lib/entitlement.ts:79-89` turns that
one state into a `402` carrying a machine-readable `code:
"INSUFFICIENT_CREDITS"` and the current balance, which is exactly the
"machine-readable plus human-actionable" refusal the technique asks for. A
boolean gate could not have distinguished the middle two.

## One resolver, two gates

`resolveScanCharge` (`plans.ts:226-233`) is the single place where a stored
plan string is turned into the `{unlimited, allowance}` pair that
`decideScanCharge` consumes. Its comment names the reason in the technique's
own terms: it exists so "the input assembly can't drift between the two
billing-sensitive paths" — the read gate `checkScanEntitlement` and the write
gate `consumeScanCredit`. This is the one-door rule realized at the level of
*input assembly*, which is the subtler half: two callers can share a pure
function and still disagree if each assembles its arguments differently.

## The unknown-tenant fix, as an incident

`entitlement.ts:58-64` is this subject's canonical bug, found and fixed:

> A configured DB that matched NO org row (deletion / casing / typo) is an
> UNKNOWN organization, not a real free org with monthly headroom.

The write gate already denied on `orgExists: false`; the read gate ignored it,
so a phantom slug with usage `0 < free allowance` reported
`allowed: true, withinAllowance: true` — a lookup failure rendered as a grant,
and the two gates disagreeing about the same tenant. The fix (`:64-76`) makes
`allowed`, `withinAllowance` and `allowanceRemaining` all condition on
`orgExists`, so absence refuses on both paths.

Note the deliberate contrast a few lines away: `planFeatures`
(`plans.ts:180-182`) resolves an *unrecognized plan string* on a real org down
to the free tier. That fallback under-grants and is safe; the `orgExists`
fallback would have over-granted. Same shape, opposite correct default — which
is why they are two code paths.

## Headroom for batch callers

`ScanEntitlement.allowanceRemaining` (`entitlement.ts:34-39`) exists because
of a real defect recorded in its own comment: batch paths capped on `balance`
alone, so "a Free org with 0 purchased credits but its included monthly free
scans … had every bulk scan/import skipped". The field returns
`max(0, allowance − usage)`, and `Number.POSITIVE_INFINITY` on the unlimited
plan (`:70-74`) — an explicitly declared sentinel rather than a null a caller
must interpret. Bulk callers size against `balance + allowanceRemaining`.

## Where the repo falls short of the standard

The capability gates themselves are **not** data-driven.
`planAllowsWhiteLabel`, `planAllowsSkillsLibrary`, `planAllowsMemory`,
`planAllowsByom` and `planAllowsPdfExport` (`plans.ts:237-288`) each re-open
the tier vocabulary inline (`id === "team" || id === "enterprise"`) instead of
reading a capability flag from `PLAN_FEATURES`. The quantitative side of the
model is exemplary — `includedCredits`, `seats`, `retentionDays` are fields
the gates read — but the boolean capabilities live in five hand-written
predicates. Adding a tier means editing all five, and the pricing card's
`features` bullets (`:78`, `:93`, `:105-113`) are hand-typed prose that no
gate reads, so a capability can move tiers without the card noticing. The
standard stands: capabilities belong in the model as flags the predicates
index.
