---
layer: application
type: application
subject: agent-chaining
technique: handoff-figures-carry-their-population
stack: rust
verified_on: 2026-09-18
verified_against: rust@1.80
applied: code
ab_verdict: better
proof: ab-paired
---

# Handoff figures carry their population: the chain cost ceiling

The stack is witnessed by the `personas-db` crate's `rust-version = "1.80.0"`
pin. Both arms below ran on that crate's own test suite, at commit `dc71e0b`
(arm A) and in the fix, `1ce23dde3` (arm B).

Where the technique lands: the chain relay's cost ceiling in
`src-tauri/db/src/chain.rs` (`evaluate_chain_triggers`), fed by
`src-tauri/src/engine/execution.rs`, where each completed hop computes
`chain_cost_total = chain_cost_in + result.cost_usd` and forwards it in the
next payload as `_chain_cost_usd`.

Anchors, at `1ce23dde3`:

- `src-tauri/src/engine/execution.rs:2684 "let chain_cost_total = chain_cost_in + result.cost_usd;"`
  (the path-shaped running total)
- `src-tauri/db/src/chain.rs:316 "the whole cascade before firing any further link and record a single"`
  (what the ceiling claims to govern)
- `src-tauri/db/src/chain.rs:404 "crate::repos::execution::traces::count_by_chain_trace_id(pool, ctid)"`
  (the breadth guard's tree-wide membership)
- `src-tauri/db/src/chain.rs:366 "let chain_cost_usd = chain_cost_usd.max(cascade_cost_usd);"`
  (arm B)
- `src-tauri/db/src/repos/execution/executions.rs:1669 "the accumulated"`
  (the live summary's maximum over carried totals)

## What the tree said about itself

Three figures in this repository are called the chain's cost, and they measure
three populations:

- **The guard** compared `_chain_cost_usd`, which is the parent **path's**
  running total plus this hop. Its comment says the check halts "the whole
  cascade".
- **The breadth guard beside it** counts links with an indexed query over
  every trace row sharing the `chain_trace_id`, which is the **whole tree**.
  So the repository already had the tree-wide membership query and used it for
  one axis only.
- **The live chain summary** (`repos/execution/executions.rs`,
  `accumulated_cost_usd`) reports the **maximum** carried total across
  in-flight runs, labelled "USD spent by the chain". The trace detail view
  sums priced spans across every trace instead.

Under fan-out, sibling branches never see each other's cost, so the ceiling was
a path ceiling described as a cascade ceiling.

## Proof (ab-paired)

- **Target:** the spend at which the ceiling halts a fan-out whose branches sum
  past it while each path stays under it.
- **Floor:** every existing chain and traces test stays green, and the crate's
  failure set is unchanged.
- **Arm A (HEAD):** root 0.20, two branches 0.50 each, ceiling 1.00. Branch A's
  carried total is 0.70, so **the next link fired at 1.20 spent**.
- **Arm B:** the guard takes the larger of the carried total and a trace-wide
  sum of recorded execution cost (the same trace-row membership the breadth
  guard counts, deduplicated by execution). The same scenario **halts with
  `budget_exceeded`**. A single-path control at 0.70 still fires.
- **Floor held:** `chain::` 53/53, `traces::` 6/6. The full library run has 13
  failures in unrelated modules, and the failure set is identical at HEAD
  (1064 pass there, 1066 with the change).

## What this realization cannot do

- A hop whose own cost or trace row is not recorded yet is missing from the
  sum. Taking the larger of the two figures keeps the guard at least as strict
  as before, but when siblings dominate it can still under-read by the current
  hop's cost.
- Spend that is running and not yet booked is invisible. The reserved-spend half
  of the budget guard is still unbuilt.
- The live summary's maximum-over-paths figure was left as found. Two surfaces
  still show "chain cost" over different populations, which the technique's
  fourth rule says to resolve by renaming one of them.
