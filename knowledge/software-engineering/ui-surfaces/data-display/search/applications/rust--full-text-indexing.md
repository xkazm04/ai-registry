---
layer: application
type: application
subject: search
technique: full-text-indexing
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Full-text indexing over executions (FTS5, external content)

The repo's compliant exemplar is the execution search stack: an FTS5 index
declared in `src-tauri/db/src/migrations/schema.rs:140-160`, maintained
synchronously by triggers, reconciled at boot by
`ensure_executions_fts` (`src-tauri/db/src/lib.rs:595-625`), and queried
through one sanitization door in
`src-tauri/db/src/repos/execution/executions.rs` (`build_fts5_query:374-382`,
`search:673-735`).

## Index shape — external content, scope declared

```sql
-- schema.rs:140-146
CREATE VIRTUAL TABLE IF NOT EXISTS executions_fts USING fts5(
    input_data,
    output_data,
    error_message,
    content='persona_executions',
    content_rowid='rowid'
);
```

The index is **external-content**: it stores only tokens and delegates row
storage to `persona_executions`. The searched scope is exactly three fields —
the "what was searched" contract of the standard, declared in the schema. The
`search` query joins back to the source for everything presented
(`executions.rs:698-700`: join on `rowid`, then a LEFT JOIN to `personas` for
display metadata), so the index never becomes a second authority for
presentation fields.

## Maintenance — synchronous triggers plus boot reconciliation

`schema.rs:147-160` installs the full trigger triple: after-insert,
after-delete (the FTS5 `'delete'` command carrying the *old* values), and
after-update scoped to exactly the three indexed columns. Deletions reach the
index in the same transaction — creation named its reaper.

The belt-and-suspenders half is `executions_fts_drift` (`lib.rs:561-579`) +
`ensure_executions_fts` (`lib.rs:595-625`), run on every boot: count the
source, count the index, and issue the documented rebuild
(`INSERT INTO executions_fts(executions_fts) VALUES('rebuild')`) only on
disagreement. The derivation names its recomputation, and the recomputation
is invoked by a condition, not a schedule.

Two details in this small function are the transferable craft:

- **The gate sees its target — after once not doing so.** The doc comment at
  `lib.rs:548-556` records the original bug: counting the index via
  `SELECT COUNT(*) FROM executions_fts` is answered *from the content table*
  (external-content semantics), so the drift check compared the source
  against itself and could never fire — rows the triggers missed stayed
  permanently unsearchable behind a green check. The fix counts the
  `executions_fts_docsize` shadow table (`lib.rs:566`): the index's own
  storage. This is the standard's "measure the index through its own
  storage" clause, learned here first.
- **`!=`, not `<`** (`lib.rs:578`, rationale at `:558-560`): an index with
  *more* entries than the source returns phantom hits for deleted rows —
  the same drift wearing the other sign. And when the shadow-table count is
  unreadable, the check logs and skips (`lib.rs:570-576`) rather than
  rebuilding blindly — failure spelled differently from "no drift".

The regression tests (`lib.rs:2942-3140`, `executions_fts_tests`) drive the
repair paths by deliberately dropping triggers and orphaning index entries —
the drift check is verified by breaking it, not assumed.

## The query door

```rust
// executions.rs:374-382
fn build_fts5_query(query: &str) -> String {
    query
        .split(|c: char| !c.is_alphanumeric())
        .filter(|token| token.len() >= 2)
        .take(12)
        .map(|token| format!("\"{}\"", token.replace('"', "\"\"")))
        .collect::<Vec<_>>()
        .join(" OR ")
}
```

Tokenize on non-alphanumerics, drop sub-2-char noise tokens, cap at 12 terms,
double-quote every token (doubling embedded quotes), and compose with an
operator the door chose. Raw user text can never reach FTS5's expression
syntax — no user-typed `NEAR`, `*`, or column filter survives. Both bounds
the standard's query-parsing technique prescribes (minimum token length,
maximum term count) are present.

`search` (`executions.rs:673-735`) completes the pipeline: empty translated
query short-circuits to no results (`:681-683`), limit clamped to 1..200
(`:685`), `bm25()` relevance order with a recency tiebreak (`:704-709`), and
`snippet(executions_fts, -1, '<mark>', '</mark>', '...', 18)` (`:695`)
producing the excerpt from what the engine matched, windowed around the hit.

## Where it stops short of the standard (kept as standard; noted)

- **`" OR "` join means the default interpretation is "any term"** — rung 3
  of the degradation ladder, unlabeled, rather than strictest-first with
  labeled descent. Multi-word queries return matches for *some* words with
  no disclosure.
- **No unique final tiebreaker in the ranking order.** `ORDER BY
  bm25(...) ASC, e.created_at DESC` ties at equal score + equal
  second-resolution timestamp, leaving the residual order to the engine.
- **All-noise input is empty success.** A query whose every token is under
  two characters returns the same empty vector as a genuine zero-match
  search; the caller cannot distinguish "nothing matched" from "nothing was
  searched".
