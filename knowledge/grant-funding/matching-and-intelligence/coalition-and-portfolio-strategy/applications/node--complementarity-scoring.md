---
layer: application
type: application
subject: coalition-and-portfolio-strategy
technique: complementarity-scoring
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: complementarity scoring in a coalition proposal engine

How a TypeScript match engine (`grant-writing-nonprofits`, a Next.js grant
platform for small nonprofits) realizes complementarity scoring — and the
adjacent capacity-floor conversion, lead selection, and subgrant split — as one
pure, deterministic module: `src/features/match-engine/coalition.ts`.

## The conversion that feeds it

The pipeline starts in the eligibility layer. `eligibility.ts:233-242` implements
the capacity gate: when the award floor exceeds the org's annual revenue, the
`award_fit` check fails hard, and the fail detail carries the forward pointer —
"Minimum award … exceeds your annual revenue — likely a capacity mismatch.
**Reachable as a coalition with complementary partners.**" The same function
shows the honest-null branch (`eligibility.ts:225-232`: revenue unset →
`status: "unknown"` with an instruction to supply it, never pass/fail) and, just
above at lines 220-224, the floor/ceiling asymmetry lesson as an incident
comment: collapsing both bounds to the one published value made a
high-ceiling/no-floor grant trip the capacity check. The fix is
`const floor = lo ?? 0; const ceil = hi ?? Infinity;` — missing floor defaults
down, missing ceiling defaults up.

## The score

`coalition.ts:29-47`:

```ts
function complementarity(orgKw: Set<string>, peer: OrgProfile): number {
  const pk = [...kwSet(peer)];
  if (pk.length === 0) return 0;
  const fresh = pk.filter((k) => !orgKw.has(k)).length;
  return fresh / pk.length;
}
```

Mission keywords are normalized in `kwSet` (lowercase + trim, line 29-31) and
the score is the fraction of the *peer's* keywords new to the org — the
"what do they add?" denominator, with the empty-set → 0 rule (missing data never
scores high). `partnerScore` (lines 43-47) adds the sameness constraint as a
binary same-state indicator (`sameRegion + complementarity(...)`), so a
same-region partner outranks an out-of-region one at any complementarity level —
the constraint is additive with weight 1 against a 0-1 complementarity term,
i.e. region strictly dominates.

## Assembly, lead, split

`proposeCoalition` (`coalition.ts:53-98`) is the whole chain:

- **No coalition nobody needs**: returns `null` when there is no finite positive
  floor or when `org.revenueUsd >= floor` (line 59-60).
- **Consent and greed**: candidates are the caller-supplied *consenting* peers,
  filtered to `revenueUsd > 0`, ranked by `partnerScore` with a revenue
  tie-break (lines 62-67), then added greedily until combined revenue clears the
  floor (lines 69-75) — the smallest coalition that clears.
- **Honest shortfall**: `reachable: combined >= floor` (line 92) — a coalition
  that falls short is still returned with its combined figure visible, never
  dressed as reachable.
- **Lead = highest capacity**: line 77-78, with the rationale in the comment —
  "most able to carry compliance/reporting" (lead-applicant-selection's default
  rule, reasoning attached).
- **Proportional split**: lines 80-89 — `share = revenue / totalRevenue`,
  rounded to two decimals, lead sorted first. The anchor proposal, not a
  verdict; negotiation happens outside the module.

## Craft notes

The module is deliberately pure and deterministic — no I/O, no LLM, caller
resolves profiles — which makes the coalition proposal unit-testable
(`coalition.test.ts`) and keeps the money-adjacent math out of any stochastic
path. The funder-side signal that motivates coalition tiering in the portfolio
lives in the intelligence dataset: `wellspring-index/data.ts:169` records a
state workforce funder whose program "accepts coalitions of 3+ small employers —
single-org applications under-perform 4-to-1," the kind of signal that moves a
solo application down a difficulty tier and a coalition application up one.

Deviation worth noting: the sameness axis is hardwired to HQ state
(`hqStateAbbr`), while the technique calls for a grant-specific choice of
coherence axis — the standard stays; the module implements its most common case.
