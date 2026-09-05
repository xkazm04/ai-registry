---
layer: application
type: application
subject: audit-logging
technique: record-axis-predicate
stack: rust
verified_on: 2026-09-05
verified_against: rust@1.85
---

# One module of clock predicates over a bitemporal graph store

A bitemporal knowledge-graph server (Rust over Postgres, runtime SQL
strings rather than compile-time query macros so the build needs no
database) had carried `recorded_at` / `invalidated_at` on every fact since
its graph migration and rewound only the world clock on reads. The
decision record that fixed it counted the hard-coded filter first — 26
occurrences in the graph module, 54 across the store — and the fix is the
technique almost verbatim, with two details the technique took from here.
The floor witnessed is the README's `Rust 1.85+`; the pipeline pins
`stable` with no toolchain file.

## The module

`crates/utopia-store/src/record_axis.rs` is the whole surface. Its module
comment states the rule in one line — *the predicate is composed only
here; a defence scattered across read sites fails silently when one is
missed, SQL raises nothing and the compiler says not a word* — and cites
the earlier incident that taught it (a nullable column whose `<>`
comparison ran empty with green tests, and the database-backed test that
incident left behind). Every function takes a table alias and a
parameter position and returns the SQL fragment:

- `facts_held_at(alias, param)` — `recorded_at <= coalesce($n, now()) AND
  (invalidated_at IS NULL OR invalidated_at > coalesce($n, now()))`, the
  null-means-now degeneration exactly as the technique writes it;
- `derived_held_at` — the same over `derived_at`, so a rewound graph keeps
  the edges the engine had drawn *by then*;
- `violation_open_at` and `conflict_open_at` — findings, with different
  column names (`detected_at` / `decided_at` plus a status) and the rule
  that a decided row with no decision stamp counts as never open, "rather
  than give March's graph a contradiction discovered today";
- `document_live_at` and `chunk_live_at` — tombstones and superseded
  passages;
- `merge_in_effect_at` and `entity_visible_at` — the case the technique
  calls hard.

The graph reads call these by name (`graph.rs` at the `facts_held =` /
`derived_held =` format arguments, six sites at the pinned commit) and
compose nothing of their own.

## The in-place rewrite and its ledger

Entities have no record clock: a merge is `UPDATE facts SET subject_id =
target`, and the row keeps only its post-merge shape. The tree's answer is
what the technique now states as its rule. `entity_merges` carries
`created_at` / `reverted_at` and arrays of the facts it moved;
`entity_visible_at` says an entity is a node at T when it existed by T and
no merge *in effect at T* absorbed it, and `owner_at` reads a fact's
subject or object at T back from the merge's arrays through a SQL function
— **only when a moment is supplied**. With no moment the raw column is
used, because wrapping the column defeats its index and "now" is the path
every draw takes; replay pays the function, and replay is rare. The
comment says so in those terms.

The test that pins it, `a_merge_rewinds_with_the_second_clock.rs`, walks
three moments because each breaks differently: before the merge the
absorbed entity must grow back with its own facts; during, it is gone;
after a revert, it is back. Its sibling `the_second_clock_can_be_rewound.rs`
is the technique's both-directions assertion over facts.

## Write paths, and the boundary that stayed

`confirm_fact`, `reject_fact`, the adoption undo and the dedup lookups
keep `invalidated_at IS NULL` — the module comment lists them and says
why: guards on the current row; a correction is never made as of March.
The full-text index is the stated limit: it holds one version of a base,
so a timed search over it returns correct hits and misses history's, and
the record says this is separate work, not a filter.

## What this realization cannot do

- **Nothing enforces that a new read calls the module.** The rule is a
  comment and a convention; a read that writes its own clause compiles.
  The tree's protection is the database-backed test per table, and the
  count in the decision record is what a reviewer diffs against.
- **The world clock and the record clock share one `Option<DateTime>`
  shape**, and the API keeps them as two parameters (`at`, `as_of`). The
  interface control that would expose the second one to a person is still
  open at the pinned commit, so the separation is enforced at the API and
  not yet tested at the screen.
- **`owner_at` is correct and slow by design**; nothing measures how slow.
  A base with many merges rewound to an early moment has no budget stated.
