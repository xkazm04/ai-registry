---
layer: application
type: application
subject: generative-provider-routing
technique: unspent-budget-is-a-defect
stack: next
status: forged
verified_on: 2026-09-16
verified_against: next@16.3.3
applied: code
ab_verdict: better
proof: ab-paired
---

# Next.js — the saving that left no record

The sibling `node` application taught a one-directional spend meter to see
downward, inside a line where every candidate is a paid vendor. This tree has a
shape that line does not: one of its production paths is **computed**, spends
nothing, and is therefore invisible to a meter that counts calls. It is the
technique's path-substitution case standing in a real router, and the defect it
exposes is not that the diversion happens — the diversion is correct — but that
it was the only outcome of four that produced no record.

## A router with four outcomes and one of them free

A game-asset service routes a generation request on the subject's geometry
before spending anything. Some subjects — the ones whose form *is* their
endpoints and their slack — come back from an image-to-3D provider as a blob
touching neither end, so the router computes them instead. The module says so in
its own header: the scope rule is deliberately blunt because
`src/lib/visual-gen/linear-prop-routing.ts:24` "the expensive half is the credit, and only `procedural` spends".

The decision is a three-valued type,
`src/lib/visual-gen/linear-prop-routing.ts:42` "route: 'procedural' | 'advise' | 'generate'",
and the call site expands it to four observable outcomes
(`src/app/api/visual-gen/generate/route.ts:126` "Three outcomes, and only one refuses"):
an overridden diversion generates and is stamped, an advisory generates and
carries the advice, a clean subject generates silently —
`src/app/api/visual-gen/generate/route.ts:132` "`generate` → nothing is attached at all, so the happy path stays silent"
— and a diversion refuses.

## The asymmetry nobody designed

Three of those outcomes end in a provider call, and all three carry the routing
decision as structured data on the response. It is carried on every branch that
can succeed: each of the route's four success returns — one per provider and
mode — closes with `shapeRoute` on a 202, as at
`src/app/api/visual-gen/generate/route.ts:217` "inputGate, shapeRoute }, 202)".
The fourth — the only one that saves anything — returned the decision as prose
inside an error body and nowhere else.

So the tree's shape said something its author had not set out to say: **the
outcomes that spend are recorded, and the outcome that saves is not.** That is
the technique's blind spot reproduced structurally rather than argued. Nothing
downstream could count diversions, separate a deliberate one from a malformed
request, or answer what the routing saved over a week — while the same
information about every *spending* outcome was one field away.

The line's own tests had the asymmetry written into them and it read as normal:
the advisory case asserts a typed field,
`src/__tests__/api/visual-gen-shape-route-wired.test.ts:76` "expect(body.data.shapeRoute.route).toBe('advise')",
while the diversion case asserted only that a string contained a substring. A
suite can be entirely green and still encode which half of a decision is
considered worth keeping.

## What was changed, and what it cost

The transport already had the slot: the error helper takes an optional payload,
`src/lib/api-utils.ts:14` "export function apiError(message: string, status = 500, details?: unknown)",
and it is house style elsewhere in the service. Passing the routing decision
through it is one argument —
`src/app/api/visual-gen/generate/route.ts:144` "if (overrideShapeRoute !== true) return apiError(shapeRefusal, 400, promptRoute)"
— and the diversion now reports in the same shape a completed call does.

**Paired against the route as it stood.** Target: routing outcomes whose
decision is machine-readable, 3 of 4 → 4 of 4. Floor, declared before the
change: the router's verdicts and its refusal text do not move, and the suite
stays green.

| Arm | The new assertion | The five standing tests | Wider suite |
| --- | --- | --- | --- |
| A — route as it stood | fails: `body.details` undefined | 5 pass | — |
| B — decision on `details` | passes | 5 pass | 1,693 pass, 3 skipped; `tsc --noEmit` clean |

Arm A is the negative control and it matters more than arm B: it is what proves
the new assertion reads the thing it claims to read rather than passing on
anything. The refusal text assertions are among the five that did not move, so
the caller-facing half is untouched —
`src/__tests__/api/visual-gen-shape-route-wired.test.ts:122` "expect(body.details.route).toBe('procedural')"
is an addition beside them, not a replacement.

## What this realization cannot do

It records that a diversion happened; it does not price one. The saving is still
unquantified, because the request that was diverted never produced an estimate
of what it would have cost, and the technique's floor report has nothing to read
here — there is no consumption band for this capability in this tree at all. A
count of diversions is the first of the two numbers, and the cheaper one.

It is also scoped to one router. The service has other free paths — a mesh-derived
icon at `src/lib/visual-gen/icon-from-mesh.ts:14` "DEPICTS the shipped asset by construction, for zero provider credits"
among them — and none of them was
touched. The structural claim generalizes across the line; the fix does not.

Finally, the routing rule this all rests on is a word count, stated as blunt by
its own author (`src/lib/visual-gen/linear-prop-routing.ts:34` "export const SCOPE_WORD_LIMIT = 4"),
and recording its decisions makes its error rate *countable* for the first time
without making it lower. That is the point — an unmeasured heuristic deciding
spend was the prior state — but it should not be read as having improved the
routing.
