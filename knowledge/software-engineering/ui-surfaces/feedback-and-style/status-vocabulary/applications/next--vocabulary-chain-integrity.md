---
layer: application
type: application
subject: status-vocabulary
technique: vocabulary-chain-integrity
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Next.js application — the map as the enumeration

Re-resolved in the `ascent` tree at HEAD `62c252dd` (Node 24 per `.nvmrc`,
Next 16.3.3); first measured 2026-09-01 at `7ed00bb9`. This repo has no
generated wire union for most of its display vocabularies: the
hand-written presentation table *is* where the members are written down,
and the running program also needs the member list. So the derivation runs
backwards from the technique's forward case — and the repo's landed idiom
is the gate the inverse direction needs.

## The landed shape: annotate, then derive

The idiom is a union, a total-`Record` annotation over it, and a key-list
cast downstream of that annotation:

```ts
// src/lib/scoring/gate-diff.ts
22: const FIELD_LABELS: Record<keyof GatePolicy, string> = { … };
34: const FIELDS = Object.keys(FIELD_LABELS) as (keyof GatePolicy)[];
```

The gate here is the **type annotation**, not `satisfies` — semantically
the same exhaustiveness (a missing member is a `tsc` error at the literal),
trading away key-literal narrowing, which is precisely why line 34 needs
its cast. The cast is downstream of a real check, so it is a derivation.
The doc comment at `:17-21` carries the reason in prose: *"A total
`Record` on purpose … adding a field to `GatePolicy` without deciding how
a drop of it reads is a compile error here, not a silent hole in the audit
trail."*

Same shape at HEAD:

- `src/lib/plans.ts:84` (`PLAN_CAPABILITIES: Record<PlanCapability, …>`)
  → `:134` `PLAN_CAPABILITY_ORDER: PlanCapability[] = Object.keys(…) as PlanCapability[]`
  — an **order** derived from a total map rather than hand-listed.
- `src/lib/ui.ts:8` (`DIMENSION_SHORT: Record<DimensionId, string>`) →
  `src/components/org/shared/uiConstants.ts:30`;
  `src/features/standing/governance/governanceReasons.ts:15` → `:112`;
  `src/lib/org/passport-display.ts:23` → `PassportScatter.tsx:49`.

### The exemplar half that evaporated

At the 2026-09-01 measurement the headline specimen was
`src/lib/integrations/providers.ts`, which held both halves in one file: a
`Fidelity` union, `FIDELITY_META: Record<Fidelity, …>` over it, and
`FIDELITY_TIERS = Object.keys(FIDELITY_META) as Fidelity[]` with a doc
comment instructing call sites to iterate the derived list rather than
re-listing members. On 2026-09-20 the gate is still there — the union at
`:23`, the annotated map at `:63` — and **`FIDELITY_TIERS` does not exist
anywhere in the tree**. The derivation was removed; nothing replaced it;
the map is now consulted only by key.

That asymmetry is worth more than the exemplar was. The *gate* is load-bearing
for the rest of the file and survived; the *derivation* was a convenience for
whoever wanted the member list, and when its last consumer went, it went
with no trace and no failure. A published citation to the derived-list half
of this idiom should therefore be treated as the perishable half.

## What the gate is worth: the fix that produced it

`DIMS` was once a hand-frozen array — `["D1", …, "D8"]` in
`src/components/org/ui.tsx` — against a nine-member rubric. Commit
`79d7d14c` (2026-06-08, *"fix(org): restore D9 Security to the fleet
heatmap"*) replaced it with the derived-from-gated-map form. The defect was
exactly the silent one the technique names: a missing member rendered as
one fewer heatmap column, and nothing anywhere failed.

## The near-miss that reads as a gate

`src/features/bought/delivery/ai/aiDeliveryTypes.ts:53-71` is the
counter-specimen, live at HEAD:

```ts
53: export const FIGURE_GROUP_OF = {
54:   prs: "adoption",
…
71: } as const satisfies Record<string, FigureGroup>;
82: // reader takes: figure: keyof typeof FIGURE_GROUP_OF
```

The `satisfies` clause is present and gates nothing that matters: its key
side is `string`, so it checks the *values* are group names and asserts no
coverage. The vocabulary is then minted as `keyof typeof` the map — derived
*from* the literal instead of checked *against* the published figure fields
of `AiRepoRoi` (`:94`) and `AiDeliverySummary` (`:112`). Fields
`shadowRepos` (`:123`) and `repos` (`:113`) are absent from the map;
nothing fails, and no test imports the file at all.

The inverse-but-safe variant sits at `src/lib/llm/transport/index.ts:13-20`
(`TRANSPORTS` at `:13`, the union at `:18`, the derived list at `:20`):
`TransportName = keyof typeof TRANSPORTS` where the union has no
independent existence, so there is nothing for the map to drift *from*.

## Whether absence is silent

`tsc --noEmit` blocks in CI (`.github/workflows/ci.yml:37`) and in
`.githooks/pre-push:5,51` via `npm run verify` — that is what makes the
annotation gate real. Only two maps carry a runtime backstop on top:
`src/lib/plans.test.ts:307` (sorted key-set equality against a longhand
`Record<PlanCapability, …>` at `:291`) and
`src/lib/scoring/gate-policy-sources.test.ts`, whose comment at `:78-79`
says a new field without a row is a compile error *"so this table cannot
silently fall behind the interface the way the fleet's fail-reason list
once did."* For `FIDELITY_META`, `FIELD_LABELS` and `DIMENSION_SHORT`, drop
the `Record<Union, …>` annotation and the drift is completely silent.

## An ungated cast over the level vocabulary

The failure this technique names — a cast standing in for the gate — is
also live here, over the maturity ladder. `LevelId` is an independent
union (`src/lib/types.ts:8`); `LEVELS` (`src/lib/maturity/model.ts:249`) is
a plain `MaturityLevel[]`, so its *entries* are checked and its *count* is
not; and `LEVEL_BY_ID` (`:435-437`) is
`Object.fromEntries(LEVELS.map(…)) as Record<LevelId, MaturityLevel>`.
Omit a member from the array and the cast manufactures a total type over
a short object — and the consumers dereference it directly
(`src/features/standing/overview/Trajectory.tsx:21`,
`src/components/report/RoadmapSandboxParts.tsx:104-105`), so the drift
signal is not weakened but converted into a runtime failure the type
system has promised cannot happen. It is the same repo, two directories
from the idiom it does correctly.
