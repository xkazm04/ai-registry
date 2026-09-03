---
layer: application
type: application
subject: status-vocabulary
technique: vocabulary-chain-integrity
stack: next
status: forged
verified_on: 2026-09-01
verified_against: next@16
---

# Next.js application — the map as the enumeration

Measured in the `ascent` tree at HEAD `7ed00bb9` (Node 24.x per `.nvmrc`,
TypeScript 5.9.3, Next 16.3.3). This repo has no generated wire union for
most of its display vocabularies: the hand-written presentation table *is*
where the members are written down, and the running program also needs the
member list. So the derivation runs backwards from the technique's forward
case — and the repo's landed idiom is the gate the inverse direction needs.

## The landed shape: annotate, then derive

`src/lib/integrations/providers.ts` is the exemplar — union, gate and
derivation in one file:

```ts
23: export type Fidelity = "measured" | "allocated" | "seats-only";
44: export const FIDELITY_META: Record<Fidelity, { label: string; hex: string; note: string }> = {
45:   measured: { label: "Measured", hex: "#22c55e", note: "…" },
…
52: };
54: /** Every connector tier, derived from the (type-exhaustive) meta table so it cannot fall behind the
55:  *  union. Iterate this rather than re-listing the members at a call site. */
56: export const FIDELITY_TIERS = Object.keys(FIDELITY_META) as Fidelity[];
```

The gate here is the **type annotation**, not `satisfies` — semantically
the same exhaustiveness (a missing member is a `tsc` error at the literal),
trading away key-literal narrowing, which is precisely why line 56 needs
its cast. The cast is downstream of a real check, so it is a derivation.

Same shape at HEAD, all with the gate carrying the reason in prose:

- `src/lib/scoring/gate-diff.ts:23` (`FIELD_LABELS: Record<keyof GatePolicy, string>`)
  → `:34` `Object.keys(FIELD_LABELS) as (keyof GatePolicy)[]`. Doc comment
  `:17-21`: *"A total `Record` on purpose … adding a field to `GatePolicy`
  without deciding how a drop of it reads is a compile error here, not a
  silent hole in the audit trail."*
- `src/lib/plans.ts:84` (`PLAN_CAPABILITIES: Record<PlanCapability, …>`)
  → `:134` `PLAN_CAPABILITY_ORDER: PlanCapability[] = Object.keys(…) as PlanCapability[]`
  — an **order** derived from a total map rather than hand-listed.
- `src/lib/ui.ts:8` (`DIMENSION_SHORT: Record<DimensionId, string>`) →
  `src/components/org/shared/uiConstants.ts:30`;
  `src/features/standing/governance/governanceReasons.ts:15` → `:112`;
  `src/lib/org/passport-display.ts:23` → `PassportScatter.tsx:121`.

## What the gate is worth: the fix that produced it

`DIMS` was once a hand-frozen array — `["D1", …, "D8"]` in
`src/components/org/ui.tsx` — against a nine-member rubric. Commit
`79d7d14c` (2026-06-08, *"fix(org): restore D9 Security to the fleet
heatmap"*) replaced it with the derived-from-gated-map form. The defect was
exactly the silent one the technique names: a missing member rendered as
one fewer heatmap column, and nothing anywhere failed.

## The near-miss that reads as a gate

`src/features/bought/delivery/ai/aiDeliveryTypes.ts:59-77` is the
counter-specimen, live at HEAD:

```ts
59: export const FIGURE_GROUP_OF = {
60:   prs: "adoption",
…
77: } as const satisfies Record<string, FigureGroup>;
88: // reader takes: figure: keyof typeof FIGURE_GROUP_OF
```

The `satisfies` clause is present and gates nothing that matters: its key
side is `string`, so it checks the *values* are group names and asserts no
coverage. The vocabulary is then minted as `keyof typeof` the map — derived
*from* the literal instead of checked *against* the published figure fields
of `AiRepoRoi` (`:100-116`) and `AiDeliverySummary` (`:118-132`). Fields
`shadowRepos` and `repos` are absent from the map; nothing fails, and no
test imports the file at all.

The inverse-but-safe variant sits at `src/lib/llm/transport/index.ts:13-20`:
`TransportName = keyof typeof TRANSPORTS` where the union has no
independent existence, so there is nothing for the map to drift *from*.

## Whether absence is silent

`tsc --noEmit` blocks in CI (`.github/workflows/ci.yml:26`) and in
`.githooks/pre-push:5,31` via `npm run verify` — that is what makes the
annotation gate real. Only two maps carry a runtime backstop on top:
`src/lib/plans.test.ts:280-282` (sorted key-set equality against a longhand
`Record<PlanCapability, …>` at `:265-271`) and
`src/lib/scoring/gate-policy-sources.test.ts:60-72`, whose comment `:55-59`
says a new field without a row is a compile error *"so this table cannot
silently fall behind the interface the way the fleet's fail-reason list
once did."* For `FIDELITY_META`, `FIELD_LABELS` and `DIMENSION_SHORT`, drop
the `Record<Union, …>` annotation and the drift is completely silent.
