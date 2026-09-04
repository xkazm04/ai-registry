---
subject: cross-provider-benchmark-operations
domain: llm-observability
last_touched: 2026-09-04
dry_streak: 0
---

# cross-provider-benchmark-operations

Touched by `/intake` on 2026-09-04 from `github:duckdb/duckdb-wasm` @ `def100b4`
— a source from an entirely different domain (a browser-embedded analytics
engine) whose **comparative benchmark suite** turned out to carry a measurement
discipline this subject lacked.

## State

6 → 7 techniques. Landed **`handicap-disclosure-in-the-result-row`**.

The rule: in a comparative benchmark, the handicap applied to a target to make
the workload runnable is **part of the measurement** and belongs as a typed field
on the result row, at the finest grain where it is true. A workload that cannot
be weakened into something runnable gets its own verdict ("not expressible"),
never a slow number and never a missing cell.

## Why it was not already covered

The subject owned six techniques about *running* a fair comparison — matrix
runs, frozen samples, determinism stamping, budget ceilings, cancellation,
failure clustering — and the corpus owns
`a-claim-carries-its-sample-and-its-basis` for sample size. None of them owns the
case where the **task itself changed** for one target.

The boundary the worker drew and I kept: `determinism-stamping` records how
*pinned* a call was; this records how *equal* the case was. And
`target-matrix-runs`' "normalize at the generation adapter, never in the dataset"
is explicitly excluded — absorbing a request-shape difference is adapter work,
while the handicap begins where the task changed.

## The evidence, and why the source class matters

A vendor publishing a benchmark **it wins** attached, per result, a string naming
exactly how each competitor's workload had to be weakened ("does not support
arithmetic operations and nested subqueries… some queries with nesting were
dropped"). The mechanism is not the string, it is the **carriage**: the field is
in the result schema, spreads into the same flat object as the timings, survives
serialization into the published result set as a column, and is read back by the
comparison surface — so no rendering path can show the number without it.

Two of my readings were wrong and the worker corrected both against the tree; I
verified both corrections:

- The concession is cleared for exactly four query ids, so it is **per-benchmark,
  not per-system** — the granularity rule is in the source, not invented.
- The cell renders `{value} *` **at rest**, plus a hover tooltip. The asterisk is
  the load-bearing half: a hover-only concession dies the moment the chart is
  screenshotted. I had recorded this as "wraps the cell", which undersells it.

**The strongest case for the discipline is exactly when the publisher wins**,
because that is when the omission is most self-serving and least likely to be
challenged. That framing is in the technique.

## One thing the source does NOT do, written as the standard anyway

A cell with no entry renders as a bare dash with no reason attached, so "not
expressible" and "not run" are indistinguishable there. The technique's third
clause closes that gap rather than lowering the rule to what the tree does.

## Lead banked in the source note

The same harness sets `minSamples: 1` for a cross-system comparison, so a
published competitive number may stand on a single sample. Return condition: when
a run mines a second comparative harness that *does* set a floor, the pair is a
technique about where the floor belongs — the harness or the renderer.
