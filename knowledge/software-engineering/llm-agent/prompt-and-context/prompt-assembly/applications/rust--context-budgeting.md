---
layer: application
type: application
subject: prompt-assembly
technique: context-budgeting
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Context budgeting in the companion prompt (Rust)

`src-tauri/src/companion/prompt/` (one file, `prompt.rs`, until a 2026-08-22
split by seam) implements most of the technique's
vocabulary literally — allocations, honest truncation, a summarization
threshold, and a per-turn spend ledger — while the persona engine side
supplies the measured counter-example for the "total needs an owner" rule.

## Named allocations, split on purpose

The fleet index blocks (persona / context / skill listings) share a
combined budget: `INDEX_TOKEN_BUDGET = 1200` tokens (`indexes.rs:9`), converted to
bytes via a stated estimator (`CHARS_PER_TOKEN = 4`, `indexes.rs:12`) — the
budget's unit and its conversion predicate are both in the source, not
folklore. The split is explicit and defended by a compile-time assertion:
`PERSONA_INDEX_CHARS` 5/12, `CONTEXT_INDEX_CHARS` 4/12,
`SKILL_INDEX_CHARS` 3/12, with `const _: () = assert!(… <= INDEX_CHAR_BUDGET)`
(`indexes.rs:18-23`). The scene digest gets its own independent line item
(`SCENE_TOKEN_BUDGET`, `scene.rs:8-11`) — per-feeder budgets, not one pool.

## Truncation that names what it dropped

The `BoundedBlock` builder (`indexes.rs:25-65`) enforces each cap with a
`footer_reserve`: rows are dropped once `out.len() + row.len() +
footer_reserve > cap`, and the reserved space renders a footer stating
the block's *true total* — "the footer is what makes a truncated list
honest, so it must never be the thing that gets squeezed out"
(`indexes.rs:159-160`), locked by the
`index_blocks_stay_under_budget_with_200_fixtures` test (`tests.rs:176`). The
prompt even warns the model about the epistemics of absence: the list "is
truncated for prompt budget, so absent here does NOT mean" nonexistent
(`indexes.rs:187`). The notice is in the prompt, aimed at the model — not only in a
log aimed at the operator.

## Summarize by threshold, and the summary replaces the material

Recall synthesis fires only when raw recall exceeds
`SYNTHESIS_TOKEN_THRESHOLD = 5000` estimated tokens
(`recall_synthesis.rs:60`, checked at `prompt/recall.rs:107`); below the
threshold, chunks ride verbatim. When a briefing is produced it *replaces*
the raw memory sections in `compose()` rather than joining them
(`compose.rs:99-103` comment: doctrine fed the synthesis, so it is not rendered
raw alongside). Synthesis is best-effort — any failure falls through to
raw chunks, so the summarizer can never break a turn.

## Measure the spend

`compose()` returns a `PromptBlockSizes` ledger; the caller runs exactly
one `warn_over_budget()` per composed prompt (`build.rs:251-252`, `budget.rs:238`), and
per-block sizes plus content hashes persist to the `companion_turn` row —
the per-section spend record the technique's last section demands, queryable
after the fact.

## The feeder side: value-ranked packing to a line item

`src-tauri/db/src/memory_recall.rs` is the feeder discipline:
`pack_by_budget` (`:204`) greedy-packs active-tier memories into the
recall line item by decayed value, with one deliberate nuance — the first
over-budget candidate is admitted when the selection is empty, "an
over-budget memory is better than an empty section" (`:198-201`). The
same shape appears on the frontend in
`src/features/plugins/research-lab/sub_reports/buildSynthesisPrompt.ts`:
list caps (40/40/60), per-item truncation (240/300 chars), and section
headers carrying the *true* totals so the model can see the gap between
counted and shown.

## The counter-example: sections capped, total unowned

Every block above honors its cap — and the persona engine's production
prompt still had no owner of the sum: the runner's post-assembly appends
(memories, reviews, team context) landed outside every cap, measured at
44.5% of production prompt bytes with the team block alone at ~29.6 KB
median (the legacy corpus study (`docs/concepts/golden-paths/prompt-assembly.md`)).
Per-section budgets composed into no prompt budget, exactly as the
technique warns.

Re-checked 2026-10-31 at personas@61029d7ae0: every anchor above moved
with the 2026-08-22 split of `prompt.rs` into `prompt/` and was
re-pointed; the constants, ratios, footer reserve, compile-time assertion,
threshold and one-audit-per-prompt call read the same. Two facts the
section did not state. The research-lab `buildSynthesisPrompt.ts` is gone:
the plugin was removed from the tree on 2026-09-15, so the frontend
instance of the shape no longer exists, and the Rust feeder is the only
one left. And recall synthesis is compiled only under the `ml` feature
(`prompt/recall.rs:95-100`; it was gated the same way on 2026-08-18): a
build without `ml` returns no briefing and always rides raw chunks. The
counter-example still stands structurally: the runner still re-binds
`format!("{prompt_text}…")` after assembly (`engine/runner/mod.rs:1516`,
`:1578`, `:1610`, `:1645`, `:1694`; `prepared_run_cache.rs:156`), and the
44.5% figure is the study's, not re-measured.
