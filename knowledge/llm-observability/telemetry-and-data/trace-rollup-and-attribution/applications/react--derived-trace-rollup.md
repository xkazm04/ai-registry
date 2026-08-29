---
layer: application
type: application
subject: trace-rollup-and-attribution
technique: derived-trace-rollup
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: which of two colliding span ids owns the children

*Verified against the project tree at `bf2a1e249`.*

The technique's tolerance rules are written for the backend fold. This is what
one of them looks like when the tree is rebuilt a second time in the client —
which is what happens in a desktop app that streams spans into a live inspector
rather than re-fetching a computed trace.

## The seam

`buildParentIndex` in
`src/features/agents/sub_executions/detail/inspector/traceInspectorTypes.ts:26`
builds the `span_id -> parent_span_id` map the collapse walk climbs. It existed
for a good reason, documented at the function: resolving each hop with
`spans.find(...)` was O(n) per hop, quadratic against the backend tracer's
10,000-span ceiling. The body was three lines:

```ts
for (const span of spans) {
  index.set(span.span_id, span.parent_span_id ?? null);
}
```

`Map.set` on a repeated key overwrites. So two events reporting the same
`span_id` collapse to one entry, and the **last** one to arrive owns the id for
every child that links to it. The technique's rule is the opposite: two events
with one span id are two distinct calls that collided; the first occurrence owns
the id so children attach deterministically, and the later claimant is marked so
the reader sees a collision rather than an inexplicable twin.

The consequence of last-writer-wins is not a wrong number — the totals are
computed elsewhere — but a **non-reproducible shape**. Producers batch and
retry, so the same trace re-read can hang the same subtree under a different
parent. That is precisely the property derivation is supposed to buy: the same
event set always yields the same view.

## A and B

- **A:** `index.set(...)` unconditionally — last arrival owns the id.
- **B:** `if (index.has(span.span_id)) continue;` before the set — first
  occurrence owns the id.

## What was read

A new case in the existing suite
(`src/features/agents/sub_executions/detail/inspector/__tests__/traceInspector.test.ts`)
feeds the same four events in two orders and asserts the parent of the collided
id follows the first occurrence in each. Under A it fails on the first
assertion (`expected 'a' to be 'root'`). Under B, `vitest` over
`traceInspector.test.ts`, `useTraceData.test.ts` and `TraceInspector.test.tsx`
is green at 60 tests — the neighbours matter here because `useTraceData.ts:270`
is the one production caller and the virtualized inspector consumes the index
downstream.

## The structural fact: the tree is derived twice, and only one copy has rules

The file's own header records that this module used to ship a parallel
`TraceSpan`-based copy of `buildSpanTree`/`flattenTree` that **drifted** from
the canonical `UnifiedSpan` implementation in `libs/traceHelpers`, and that the
fix was to re-export rather than re-implement. The parent index survived that
consolidation as a local, because it is an index and not a tree — and it is the
one piece of the derivation that carries a malformed-input rule. So the
codebase independently arrived at the technique's "serve both views from one
definition" discipline for the tree, and left the index outside it, which is
where the tolerance rule then went missing. Consolidation moved the code that
looked like a duplicate and left the code that behaved like one.

## What this realization cannot do or prove

- **Only half the rule is applied.** The technique requires the later claimant
  to be *marked* so the reader sees two calls that collided. Nothing in this
  tree renders such a mark, and adding a `duplicates` return with no consumer
  would be a dead export the project's own dead-code gate would flag. First-wins
  linkage without disclosure is strictly better than last-wins, and it is still
  a silent handling of a producer bug.
- **The test proves determinism, not correctness.** It shows the index no longer
  depends on arrival order. It does not show that a real producer in this system
  ever emits a colliding span id — no fixture, log or incident in the tree was
  found that does. The change is insurance whose premium is one line.
- **Nothing here tests the totals under collision.** The technique's standard is
  "malformed input may degrade the tree, never the totals". This application
  only touched the tree.
