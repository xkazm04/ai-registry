---
layer: application
type: application
subject: asset-class-poly-budgeting
technique: provider-face-limit-conversion
stack: node
status: forged
---

# Node: a pure face-budget module with conversion and delivered-vs-requested grading

PoF (`C:\Users\kazda\kiro\pof`) realizes the unit doctrine in one dependency-free
module, `src/lib/visual-gen/face-budget.ts`. It is worth reading as a whole because its
header comment (lines 1–26) is the argument, not documentation of the code: one number
("40k faces") was being carried across three layers that each meant something different
by it —

- `src/lib/visual-gen/polycount-presets.ts` authors the budget with **no unit stated**;
- a provider's `face_limit` counts the faces it is asked to emit, and in QUAD mode a
  face is a quad, so the same 40k delivers ~80k triangles;
- `src/lib/visual-gen/mesh-critique.ts` measures through trimesh, which triangulates on
  load, so every measurement is in **triangles**.

The header also carries the incident that motivated the module: a controlled retopology
test ("10 Minutes vs 10 Hours", 2026-08-14) commissioned a 15K budget, received 15K
QUADS, and caught it only at review — *"I should have said 15K triangles"*. The same
source recorded a provider ignoring a low-poly request entirely and returning 150K.

## The declared unit

```ts
/** The unit every authored face budget in PoF is written in. */
export const FACE_BUDGET_UNIT = 'triangles' as const;
```

The constant is interpolated into every human-readable reason string the module emits,
so a grading message reads `a 15000-triangles budget cannot be confirmed without a
triangle count` — the unit teaches itself at the point of failure.

## Conversion at the edge

`quadBudgetFromTriangles` (line ~57) floors:

```ts
export function quadBudgetFromTriangles(triangles: number): number | undefined {
  if (!usable(triangles)) return undefined;
  return Math.floor(triangles / 2);
}
```

with the comment stating why — *rounding up would authorise a mesh past the budget it
was derived from*. `trianglesFromQuads` is the inverse, needed by diagnosis. `usable()`
is the guard shared by every entry point: finite, numeric, positive. Anything else
returns `undefined` rather than a fabricated number.

`providerFaceLimit(request)` is the single call site the adapter uses. It takes the
pair, not a bare number:

```ts
export interface BudgetRequest {
  triangleBudget: number;          // always FACE_BUDGET_UNIT
  topology: TopologyKind;          // 'triangles' | 'quads'
}
```

and halves only for `'quads'`. That the request models topology explicitly is what
stops the halving from being hardcoded on the assumption that quad mode is always used.

## Grading

`gradeFaceBudget(measuredTriangles, request)` (lines 104–129) returns
`{ verdict, requestedTriangles?, measuredTriangles?, ratio?, reason? }` with
`verdict: 'honored' | 'over' | 'unmeasured'`. Two guards run before any arithmetic:
no usable request yields `unmeasured` with *"no face budget was requested for this mesh
— nothing to hold the delivery to"*, and no usable measurement yields `unmeasured` with
a reason naming the budget that could not be confirmed. Neither ever yields `honored`.

The tolerance and the trap band are named constants with their reasoning attached:

```ts
export const BUDGET_OVERRUN_TOLERANCE = 1.1;                       // decimators land NEAR a target
const QUAD_TRAP_BAND: readonly [number, number] = [1.8, 2.2];      // attribute the unit trap
```

Inside the band, the `over` verdict's reason names the mechanism and points at the fix
by function name (`providerFaceLimit`); outside it, the reason says the provider did
not honour the request and offers the two real options — re-request with an explicit
face limit, or decimate before shipping. The verdict is `over` either way: the
attribution changes the message, never the outcome.

`measuredTriangles` is supplied by the Tier-1 critique in
`src/lib/visual-gen/mesh-critique.ts`, whose `faces` are triangles because trimesh
triangulates on load — the module comments say so at the point of use rather than
trusting the reader to remember.

## What this application demonstrates about the technique

- The conversion is a **named pure function**, not arithmetic at a call site, and the
  inverse is exported alongside it.
- The floor is a **decision with a written reason**, not a rounding accident.
- Every unusable input produces **no number at all**, which propagates as `unmeasured`
  rather than as a false pass — the project's stated dominant honesty rule.
