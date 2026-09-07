---
subject: cross-provider-benchmark-operations
domain: llm-observability
last_touched: 2026-09-07
touched_by: external-reconcile
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

- Group.aggregate stores sample_count per metric key, so a group mean over a
  partial subtask set is detectable in the artifact - citable by
  partial-run-never-green.

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

## 2026-09-07 - a fifth truncation cause, from a 892-word video

[[2026-09-07-two-models-one-game-benchmark]]. A practitioner's cross-vendor comparison
was cut short on one arm by a subscription usage limit and not on the other; he says he
cannot compare token use, then reports the comparison anyway - which
`partial-run-never-green` already forbids, so the source's own error is a catch.

The gap sits next door to that catch. **`partial-run-never-green` says "all truncation
causes converge on one state" and enumerates four - cost ceiling, operator cancel,
pre-flight refusal, crash.** An enumeration is a claim, and every member of that one is
something the harness or its operator did. A halt imposed by the *target* is a fifth, and
it does not converge in the same way: it indicts the account rather than the provider, it
is **reproduced** by re-running where ill health is transient by construction, and it is
correlated with the target under test - which makes it the only cost signal available
when the plan is not priced per call. That technique also pushes the case away explicitly
("do not entangle it with the product's usage-limit machinery") - correct while you own
the harness, unavailable when the thing under test is sold as a plan.

Landed `entitlement-exhaustion-is-not-ill-health`: the discriminator is not the status
code (a burst limiter and an exhausted allowance return the same one) but **the stated
wait measured against the budget the run has to give it**, with a response naming no wait
recorded as ambiguous rather than sorted. Golden-path chain item 3 gained a clause saying
why both halves of `budget-preflight-and-ceiling` fail when the ceiling is not yours.

**Convergence carried the +1**: the fleet's memory harness recorded the same shape
independently on 2026-09-05 about its own internals - "any cap that can bind before the
declared budget is a predicate of the arm and belongs in the run header" - after a
hard-coded ceiling spent 665 of 6,000 given tokens and made every number in that arm a
fact about the ceiling. Inside the harness there, outside it here.

## Applied

`rust--entitlement-exhaustion-is-not-ill-health`, and the seam was **chosen to falsify**.
It largely succeeded: that runner already renders provider-side absence separately from
money-side absence and comments on the distinction in this technique's own terms, feeds
its breaker on generation failures only, fails open when every target is indicted, and
tests the winner paired on the cases both completed. The coverage half of the technique is
**already-covered** there and the application says so. What survives is one rule, missing
structurally: eleven typed error variants upstream - one of them the exact discriminator,
with a doc comment insisting it be kept distinct - collapsed to a boolean one line before
the breaker and the report. Ship 0: another session held uncommitted work in that file.