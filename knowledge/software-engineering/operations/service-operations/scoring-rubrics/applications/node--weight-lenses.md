---
layer: application
type: application
subject: scoring-rubrics
technique: weight-lenses
stack: node
status: forged
verified_on: 2026-08-20
---

# Three lenses over nine dimensions, and the two guards that keep them honest

The maturity engine in this repo grades every scanned repository against nine
dimensions (D1–D9), but not every repository is run the same way — and the
rubric says so structurally rather than apologetically.

## One dimension set, three weight vectors

`src/lib/maturity/model.ts:327-331` is the whole technique in four lines:

```ts
export const ARCHETYPE_WEIGHTS: Record<RepoArchetype, Record<DimensionId, number>> = {
  org:  { D1: 0.15, D2: 0.15, D3: 0.14, D4: 0.12, D5: 0.09, D6: 0.07, D7: 0.07, D8: 0.12, D9: 0.09 },
  team: { D1: 0.16, D2: 0.17, D3: 0.11, D4: 0.09, D5: 0.1,  D6: 0.09, D7: 0.08, D8: 0.13, D9: 0.07 },
  solo: { D1: 0.2,  D2: 0.2,  D3: 0.07, D4: 0.07, D5: 0.11, D6: 0.12, D7: 0.08, D8: 0.11, D9: 0.04 },
};
```

The lens invariant holds exactly: same nine ids in every row, every row summing
to 1, and the vectors laid out as literal columns so the *relative* claim can
be read across — CI (D3) is worth twice as much to an org as to a solo repo;
the agentic-review dimension (D4) nearly halves. The declaring comment states
the policy rather than the arithmetic: the solo and team lenses "down-weight
org-scale signals (CI, agentic review bots) and lean on tooling/tests/docs/
quality, so single-author work is judged fairly rather than being dragged to
L1–L2 for lacking infrastructure it doesn't need." That is the sentence a
lens exists to make true, and it is checked in beside the numbers that
implement it.

Two supporting details show the technique's disclosure half. `ARCHETYPE_LABEL`
and `ARCHETYPE_HINT` (`:333-345`) give each lens a display name and a one-line
explanation of *what it changed*, rendered as a tooltip on the report chip —
"the chip is otherwise an unexplained label", which is the failure mode of a
class label arriving on a score without its rationale. And `weightsFor`
(`:347-349`) resolves an unknown archetype to `org`, the strictest lens: a
named fallback rather than whatever the object happens to yield first.

The classifier is treated as a score-moving knob, as the technique requires.
The rubric-version changelog at `:34-35` records `r2` as a bump taken because
`classifyArchetype` capped star-driven "org" escalation at "team" for repos
with two or fewer active human authors — no weight was edited; the *selector*
moved, "and therefore the weights ... for viral solo repos".

## Missing weight versus configured zero

`src/lib/maturity/model.ts:351-372` refuses the plain lookup:

```ts
function lensWeightFor(lensW: Record<DimensionId, number>, id: DimensionId): number {
  const w = lensW[id];
  if (w === undefined) {
    console.warn(`[maturity/model] no lens weight configured for dimension "${id}" — ...`);
    return 0;
  }
  return w;
}
```

Both cases contribute zero to the weighted sum *and* to the denominator — the
containment measure, so a dropped dimension cannot deflate the score — but
only absence warns. The comment names the precise defect it is built for:
"lens drift: a dimension was added without updating every ARCHETYPE_WEIGHTS
lens", and notes that today every archetype defines all nine ids, "so this is
always silent in practice; it exists so a future dimension added to DIMENSIONS
without a matching entry in every lens fails loudly instead of quietly
vanishing from the headline". A guard written for a fault that has not
happened yet, at the one place where the fault would otherwise be invisible,
is the correct shape of this rule.

The same helper is used by `overallScoreFor` (`:381-397`), `axisScore`
(`:404-415`) and `axisMeasured` (`:429-434`) — the composite, the per-axis
roll-ups, and the "was this axis measured at all" predicate all read weights
through the one guarded accessor rather than indexing the vector directly.

## The invariant that had been checking the wrong vector

`src/lib/maturity/model.ts:305-317` carries the upward lesson in its own
docstring:

```ts
/**
 * Sanity check that EVERY weight set sums to 1 (within float tolerance): the base
 * DIMENSIONS weights and each ARCHETYPE_WEIGHTS lens — the lenses are what scoring actually
 * uses, so validating only the base weights left the real ones unchecked.
 */
```

The earlier check validated the canonical-looking vector while every scored
number came from a lens: green on a surface the engine never reads. The fixed
version folds the base sum and all three lens sums into one list and asserts
every element is within `1e-9` of 1, and `:497-504` fires it at module load
outside production:

```ts
if (process.env.NODE_ENV !== "production" && !weightsAreValid()) {
  throw new Error("[maturity/model] every weight set must sum to 1 (base DIMENSIONS + each ARCHETYPE_WEIGHTS lens).");
}
```

The comment above it draws the line the technique insists on between
containment and check: "the engine renormalizes defensively so a bad set can't
silently deflate scores, but a set that doesn't sum to 1 is a config bug worth
catching the moment the rubric is edited — not in production." The
renormalization keeps the number safe; the throw makes sure someone finds out.
