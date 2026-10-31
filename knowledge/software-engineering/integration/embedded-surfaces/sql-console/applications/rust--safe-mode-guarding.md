---
layer: application
type: application
subject: sql-console
technique: safe-mode-guarding
stack: rust
verified_on: 2026-10-31
verified_against: rust@1
---

# The authoritative guard in the Rust executor

The trusted side of the two-sided guard is `execute_query_cancellable` in
`src-tauri/engine/src/db_query.rs:686-726`, reached from the single Tauri
command `execute_db_query` (`src-tauri/src/commands/credentials/db_schema.rs:224`,
`#[requires(privileged)]`). Every console author — the Console tab, the
saved-query editor pane, and the NL chat lane — calls that one command.

## Where the gate stands

```rust
// db_query.rs:703-726 (abridged)
if !allow_mutation && is_mutation(query_text) {
    return Err(AppError::Validation("This query appears to modify data … \
        Enable write mode or confirm the mutation to execute it."));
}
if !allow_mutation && has_multiple_statements(query_text) {
    return Err(AppError::Validation("Multiple SQL statements are not allowed \
        in safe mode. Run one statement at a time, …"));
}
let credential = cred_repo::get_by_id(pool, credential_id)?;
```

Both checks run on `query_text` — the exact `&str` that the per-family
driver receives a few lines later — *before* the credential is even loaded.
The gate sees its target; nothing between the check and the dispatch
rewrites the string. `allow_mutation` defaults to `false` at the command
boundary (`db_schema.rs:243`, `allow_mutation.unwrap_or(false)`), so a
caller that forgets the flag gets safe mode, not write mode.

## The classifier survives obfuscation

`is_mutation` (`db_query.rs:561-588`) is built from three tokenizer-grade
helpers, all in the same file:

- `extract_first_keyword` (`:255`) strips leading line and block comments
  and whitespace before reading the verb — so `/* UPDATE nothing */ SELECT
  1` is a read, and `ATTACH/**/DATABASE` cannot hide its verb from a
  separator trick (the deny-list at `:2838-2857` reuses the same function
  for exactly that reason, per its comment).
- An unclosed block comment returns the sentinel `"__UNCLOSED_COMMENT__"`,
  which `is_mutation` maps to `true` (`:564`, "fail-safe") — the fail-closed
  rule for unparseable input.
- `WITH` does not short-circuit to "read": `cte_body_has_mutation` (`:340`)
  runs `strip_sql_literals` (`:404`, single-quoted, double-quoted, and
  dollar-quoted forms) and then token-splits the remainder on
  non-`[A-Za-z0-9_]` and tests each token against `CTE_MUTATION_VERBS`
  (`:293-295`: DELETE, INSERT, UPDATE, MERGE, REPLACE, UPSERT, TRUNCATE,
  DROP, ALTER). Token-exact matching is why `updated_at` and `deleted` do
  not false-positive; literal stripping is why `WHERE note = 'DELETE FROM
  t'` does not either. The unit tests at `:3389-3414` and `:3440-3452` pin all three cases.

## One statement per request in safe mode

`has_multiple_statements` (`:496-504`) strips literals, trims a trailing
`;`, and asks whether a `;` remains. The comment at `:711-719` records the
reason it exists: the raw pass-through connectors forward the whole payload
verbatim, so `SELECT 1; DELETE FROM users` would classify as a read by its
first statement and the tail could execute if the endpoint honors stacked
statements. Safe mode therefore refuses batches outright; write mode is
exempt because the user has confirmed a mutation.

## Bounds the guard travels with

The same executor bounds what a permitted statement can cost: `QUERY_TIMEOUT
= 60s` (`:32`), `MAX_ROWS = 500` (`:27`) injected as `LIMIT 501` when a read
carries no top-level `LIMIT` (`:89-126`, literal-stripped scan for an
existing `LIMIT`), `MAX_RESPONSE_BYTES = 8 MB` on the transport (`:48-65`),
and a `CancellationToken` threaded through to an interrupt handle on the
local engine path (`run_local_sqlite_guarded`, `:2721`). Failures pass
through `sanitize_error` (`:148`), which redacts every credential field
value regardless of length.

## The gap the counter-evidence shows

The executor's parameter is a raw `&str`, and the repo has a second door
that never met it: `src-tauri/src/companion/jobs/connector_use.rs:1525-1549`
guards a model-authored mutation lane with `lower.starts_with(v)` over seven
verbs including `drop`, then calls the driver directly. Nothing in the type
system required that lane to pass through `is_mutation`. That is the
"executor demands a classified statement" section of the technique,
motivated by measurement rather than taste.

Re-checked 2026-10-31 at personas@22260d77: the executor moved into the
extracted engine crate (anchors above updated) and the guard has widened,
not weakened. `cte_body_has_mutation` is now `body_has_mutation`
(`db_query.rs:510`), and `is_mutation` runs it for `SELECT`, `VALUES` and
`EXPLAIN` as well as `WITH`, against `CTE_MUTATION_VERBS` plus a
`READ_SHAPED_WRITES` list (`:307`) that catches `SELECT ... INTO`,
`FOR UPDATE`, `nextval(...)` and `EXPLAIN ANALYZE <mutation>`. Both
`body_has_mutation` and `has_multiple_statements` now fail closed on an
unterminated literal or comment. `execute_query_cancellable` also gained a
`ddl_only` flag that runs `validate_ddl_only` ahead of the safe-mode checks
(`:698-700`). The companion lane no longer calls the driver directly: after
its `starts_with` verb check and a single-statement check it runs through
`agent_sql_guard::run_agent_mutation` (`src-tauri/db/src/agent_sql_guard.rs:179`),
a SQLite authorizer that refuses writes to the companion's own runtime
tables. It still never meets `is_mutation`, and the executor still takes a
raw `&str`, so the type-system gap this section names still stands.
