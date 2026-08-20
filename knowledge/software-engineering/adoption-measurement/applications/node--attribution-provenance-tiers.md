---
layer: application
type: application
subject: adoption-measurement
technique: attribution-provenance-tiers
stack: node
status: forged
---

# Fidelity tiers on an AI-usage signal, and the tier that had to be deleted

The source app (`C:\Users\kazda\kiro\ascent`) joins git-derived AI-adoption
signals with a spend/usage layer whose quality depends entirely on what the
customer connected. Two modules carry the tiering: the connector registry
`src/lib/integrations/providers.ts` and the model that consumes it,
`src/features/bought/delivery/ai/aiDeliveryModel.ts`.

## The ladder is declared once

`src/lib/integrations/providers.ts:13` holds the vocabulary:

```ts
export type Fidelity = "measured" | "allocated" | "seats-only";
```

with the meanings stated at `:6-11` — measured means the vendor attributes
spend to the exact repository (telemetry resource attributes carry it);
allocated means the vendor reports above repository level and the app
distributes it by git-attributed AI volume; seats-only means the vendor
reports seats and engagement but no spend, "so no cost figure exists to
report and none is invented". `FIDELITY_META` at `:34-42` pairs each tier
with the label and note the UI renders, so the tier travels to the reader
rather than living only in the type system. This is the standard's
observed / allocated / declared ladder, with seats-only as the declared tier
named after its source.

## The consumer degrades, it never rounds up

`aiDeliveryModel.ts:46`:

```ts
const fidelity: ModelFidelity = usage?.hasMeasured ? "measured" : usage?.hasAllocatedCost ? "allocated" : "none";
```

The comment above it at `:42-45` records the sharpest reconciliation lesson
in this subject: the flag read is `hasAllocatedCost`, **not** `hasAllocated`.
A seat-reporting connector produces genuine allocation records whose cost is
legitimately zero; entering the allocated branch on those "would divide a
zero total across every repo and render the whole fleet as '$0 / shadow AI' —
connected-looking and entirely wrong". Having an allocatable record and having
an allocatable quantity are different facts, and the standard's
"prove the allocation basis is non-degenerate" rule is this comment
generalized.

`:53-60` shows the other half: the allocation *weight* was improved from a
self-declared marker rate to trailer-grounded commit counts, because "a commit
trailer is evidence the tooling itself wrote, while the marker rate leans on
self-declared PR descriptions". The comment then closes the loop explicitly —
"this remains the 'allocated' tier ... it does not replace [the measured
path]". A sharper divisor is still a divisor; tier upgrades come only from new
observation.

## The fabricating tier was deleted, not blurred

`aiDeliveryModel.ts:10-15` is the doctrine in full:

> W3c RETIRED THE "simulated" TIER. It filled the spend columns from an FNV
> hash of the repo name — plausible dollar figures, seat counts and plan
> assignments that no provider ever reported. The UI blurred them behind a
> "locked" treatment, but the MODEL still produced them, so every derived
> total (annual spend, idle spend, ungoverned spend, cost/AI-PR) was
> arithmetic over fabricated input.

The lock was presentation; the values were still in the payload and still
propagated through every derived total. `:17-18` states the companion rule
that makes deletion safe: `none` ≠ "$0 spent" — the money cells render empty
with a connect prompt rather than as currency, and the two spend-derived
verdicts (`shadow`, `idle`) are withheld entirely.

The durable guard is a test. `docs/features/org-dashboard/org-intelligence.md`
`:892-898` records it: **"A test pins that spend cannot vary with a
repository's name."** That is the standard's regression check — an output that
changes when a unit is renamed was derived from the name, and a name is not a
measurement. It is what stops the tier returning in a new costume.

## Where the same ladder shows up on the adoption side

`src/lib/org/adoption.ts:8-25` types the adoption signals themselves —
per-contributor AI share from commit attribution, per-team share from
code-ownership attribution — and the file header at `:1-5` marks the whole
module as "pure assembly over existing aggregates ... NO new commit-history
ingestion". Team-level shares there are commit-weighted rollups of observed
per-commit attribution: measured at the commit, aggregated for display, which
is the honest reading. `src/lib/db/org-signals.ts:15-31` is where the tiering
discipline reaches the underlying rates — `revertRate` is documented as
"Null only when the stored blob predates the field — never a fabricated 0 for
an unmeasured repo", and `aiTrailerRate` is explicitly labelled "the
trailer-GROUNDED attribution rate", null under a five-merge floor. Absent
rather than zero, and provenance in the field's own name.

## Deviations from the standard

- The tier is a single scalar on the whole model rather than a property of
  each figure, so a surface mixing a measured adoption rate with an allocated
  cost figure carries one badge for both. The standard asks the tier to travel
  with each number.
- `ModelFidelity` (`aiDeliveryTypes.ts:8`) and `Fidelity`
  (`providers.ts:13`) are two vocabularies for one concept with different
  member sets (`none` versus `seats-only`). They are mapped correctly today;
  the standard's one-authority rule would collapse them.
