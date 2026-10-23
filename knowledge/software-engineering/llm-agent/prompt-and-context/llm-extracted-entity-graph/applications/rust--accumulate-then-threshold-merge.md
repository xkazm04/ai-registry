---
layer: application
type: application
subject: llm-extracted-entity-graph
technique: accumulate-then-threshold-merge
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96
applied: experiment
ab_verdict: not-better
---

# Accumulate-then-merge in a per-key outcome store

Read against a desktop agent runtime's execution-knowledge store at its working-tree HEAD
`14377374ef`. The toolchain witness is `rust-toolchain.toml:6`, `channel = "1.96.1"`; the
crate's own floor, `rust-version = "1.80.0"` at `src-tauri/Cargo.toml:222`, is lower, so the
pinned channel is the runtime this tree is built and tested on.

This tree is **not** an LLM-extracted entity graph, and that is why it is the useful seam.
It holds one row per `(persona, knowledge_type, pattern_key)`, merges every completed
execution into the row with an `INSERT ... ON CONFLICT DO UPDATE`, and has a single caller
that runs once per finished execution (`src-tauri/src/engine/execution.rs:2558`). The
technique's merge operator is exactly the question the store has to answer, with numbers
where the graph has prose. The seam was chosen to falsify: if the technique's order
contract were universal, this store would satisfy it or be wrong not to.

## What was read, and what the store does per attribute

`src-tauri/db/src/repos/execution/knowledge.rs:103-118` is the whole merge. Sorted by the
technique's own test, *does an ordering of the same evidence agree?*:

| Attribute | Rule | Order-independent? |
| --- | --- | --- |
| `success_count`, `failure_count` | `success_count = success_count + ?7` | yes: a sum |
| `avg_cost_usd`, `avg_duration_ms` | `avg_cost_usd = avg_cost_usd * 0.8 + ?9 * 0.2` | no: exponential moving average |
| `confidence` | `confidence = confidence * 0.8 + CAST(?7 AS REAL) * 0.2` | no: the same average over 0/1 |
| `recentResults` | last ten outcomes, read-modify-write under an immediate transaction (`:58`, `:92`) | no: a window |
| every other `pattern_data` key | `pattern_data = ?6` | no: last write wins |

The EMA is a choice, not an accident. The comment above it records that the earlier
cumulative form "shrank each new sample's weight to 1/(N+1)" and that "the figures never
tracked recent reality". The store's consumers (the cost-quality advisory, the failure
lines injected into the next prompt) want *current* behaviour, so the attribute that
answers them is meant to depend on arrival order.

## The experiment

The upsert's `ON CONFLICT` statement was run verbatim against an in-memory SQLite table
with the same unique key, no product code changed, and one pattern replayed over 40
executions (30 early successes at 0.01 USD, then 10 late failures at 0.05 USD) in the
arrival order and in 200 random permutations of the same 40 outcomes.

| Attribute | Arrival order | Across 200 permutations |
| --- | --- | --- |
| `success_count` / `failure_count` | 30 / 10 | 30 / 10 in every one |
| `confidence` | 0.107 | 0.393 to 0.985, 200 distinct values |
| `avg_cost_usd` | 0.0457 | 0.0106 to 0.0343, 192 distinct values |
| `recentResults` | ten failures | 122 distinct windows |
| `sample_error` | the last failure's text | 10 of the 11 distinct texts won in some order |

Two readings the arithmetic forces. **The count half of the contract holds**: the fields
that are sums are identical under every ordering, which is the technique's "same evidence
set, fragment count identical either way" claim, observed on a store that never heard of
it. **The derived half does not, and cannot without losing the reason it exists**: the
lifetime success rate of the same 40 outcomes is 0.75, the stored `confidence` is 0.107,
and the 0.64 gap *is* the drift the store was built to show. Replacing the EMA with a
count-and-sum merge would converge under reordering and would hide that a pattern which
worked thirty times has just failed ten, which is the figure the consumer reads.

The verdict is therefore **`not-better`** at the experiment mode, with the floor declared:
the target (convergence under reordering of `confidence` and the averages) can move only by
dropping the recency weighting, and the floor (the store tracks a regression within about
ten executions) would fall. The technique is not wrong; it does not reach a store whose
purpose is recency. The boundary is written into the technique.

## What the seam also showed

- **The counts are not idempotent.** Replaying the same 40 executions twice gives 60 / 20,
  not 30 / 10: nothing compares `last_execution_id` or an execution id set before adding.
  This is latent, not live, because the one caller fires once per completed execution; it
  becomes live the day a backfill or a retry path re-extracts. It is the store-side form of
  the technique's "deduplicate across stored and new, or the store grows on a no-op".
- **`confidence` is a rate only by courtesy.** It is the moving average of a 0/1 series,
  and its first value is 1.0 or 0.0 from one execution. A reader weighing a row cannot
  tell one execution from thirty from the number; the count column beside it is what
  carries that, which is the technique's `count-carries-predicate` obligation met by
  layout rather than by design.
- **The failure line is a sample, not a summary.** `sample_error` is overwritten by the
  latest occurrence (`src-tauri/src/engine/knowledge.rs:198`, stored by the `pattern_data = ?6` at
  `src-tauri/db/src/repos/execution/knowledge.rs:104`), so
  the prompt middleware that shows it (`src/lib/execution/knowledgeMiddleware.ts:46`)
  shows whichever failure came last. That is first-write-wins's mirror image, the third
  operator the technique rejects, and it is acceptable here only because the field is
  labelled a sample.

## What this realization cannot do

It cannot be re-derived: a row holds no fragments, so a different smoothing constant means
discarding history rather than recomputing it. It carries no provenance beyond the last
execution id, which the technique's re-expression section would call a derivation that
names nothing it consumed. Those are costs the store pays knowingly for staying one row
per key.
