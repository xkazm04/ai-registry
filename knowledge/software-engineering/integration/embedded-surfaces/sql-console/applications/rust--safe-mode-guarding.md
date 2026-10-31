---
layer: application
type: application
subject: sql-console
technique: safe-mode-guarding
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96.1
---

# The authoritative guard in the Rust executor

Described at personas@`22260d77`. The trusted side of the two-sided guard is
`execute_query_cancellable` in the extracted engine crate,
`src-tauri/engine/src/db_query.rs:686`. It is reached from the single Tauri
command `execute_db_query`
(`src-tauri/src/commands/credentials/db_schema.rs:224`,
`#[requires(privileged)]` at `:223`). Every console author in
`src/features/vault/sub_databases/` — the Console tab, the saved-query
editor pane, the Tables tab, and the chat lane's SQL blocks — calls that one
command through `executeDbQuery` (`src/api/vault/database/dbSchema.ts:73-74`).

## Where the gate stands

```rust
// db_query.rs:698-726 (abridged)
if ddl_only {
    validate_ddl_only(query_text)?;
}
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

All three checks run on `query_text`, the exact `&str` that the per-family
driver receives a few lines later, *before* the credential is even loaded.
The gate sees its target; nothing between the check and the dispatch
rewrites the string. Both flags default to `false` at the command boundary
(`db_schema.rs:243-244`, `allow_mutation.unwrap_or(false)` and
`ddl_only.unwrap_or(false)`), so a caller that forgets the flag gets safe
mode, not write mode.

The `ddl_only` flag serves a different author. Template adoption's schema
step (`src/hooks/database/useSchemaProposal.ts:192-202`) sends write mode
*and* `ddl_only`, so its statements are bounded by `validate_ddl_only`
(`db_query.rs:595`): safe `CREATE` statements and transaction control pass,
DML and destructive DDL are refused.

## The classifier survives obfuscation

`is_mutation` (`db_query.rs:561-588`) is built from tokenizer-grade helpers
in the same file:

- `extract_first_keyword` (`:255`) strips leading line and block comments
  and whitespace before reading the verb, so `/* UPDATE nothing */ SELECT
  1` is a read, and `ATTACH/**/DATABASE` cannot hide its verb from a
  separator trick. The local engine's deny-list (`:2839-2857`) reuses the
  same function for exactly that reason, per its comment.
- An unclosed block comment returns the sentinel `"__UNCLOSED_COMMENT__"`
  (`:268`), which `is_mutation` maps to `true` (`:564`, "fail-safe"): the
  fail-closed rule for unparseable input.
- A read-shaped first token does not short-circuit to "read". For `WITH`,
  `SELECT`, `VALUES` and `EXPLAIN`, `is_mutation` runs `body_has_mutation`
  (`:510`). That function strips literals with `strip_sql_literals` (`:404`;
  single-quoted, double-quoted and dollar-quoted forms, plus comment
  bodies), token-splits the remainder on non-`[A-Za-z0-9_]`, and tests each
  token against `CTE_MUTATION_VERBS` (`:293-295`: DELETE, INSERT, UPDATE,
  MERGE, REPLACE, UPSERT, TRUNCATE, DROP, ALTER) and `READ_SHAPED_WRITES`
  (`:307-316`: INTO, SHARE, NEXTVAL, SETVAL, LO_IMPORT, LO_EXPORT,
  PG_TERMINATE_BACKEND, PG_CANCEL_BACKEND). The second list catches
  `SELECT ... INTO`, `FOR UPDATE`, sequence advancement and
  `EXPLAIN ANALYZE <mutation>`; its comment records that before the
  `SELECT` arm, 8 of 9 such statements walked through safe mode as reads
  (`:567-571`). The client's `READ_SHAPED_WRITES_RE` carries the same set,
  pinned by `tests::read_shaped_writes_set_is_pinned` (`:3344`).
- Token-exact matching is why `updated_at` and `deleted` do not
  false-positive; literal stripping is why `WHERE note = 'DELETE FROM t'`
  does not either. If a literal or comment never closes,
  `body_has_mutation` returns `true` (`:515-517`): "unknown" resolves to
  "not read-only". The tests at `:3389-3420` and `:3508` pin these cases.

## One statement per request in safe mode

`has_multiple_statements` (`:496-504`) strips literals, trims a trailing
`;`, and asks whether a `;` remains; an unterminated literal or comment
counts as multiple (`:500-502`). The comment at `:711-719` records why the
check exists: the raw pass-through connectors (Neon, PlanetScale) forward
the whole payload verbatim, so `SELECT 1; DELETE FROM users` would classify
as a read by its first statement and the tail could execute if the endpoint
honors stacked statements. Safe mode therefore refuses batches outright;
write mode is exempt because the user has confirmed a mutation.

## Bounds the guard travels with

The same executor bounds what a permitted statement can cost:
`QUERY_TIMEOUT = 60s` (`:32`); `MAX_ROWS = 500` (`:27`), injected as
`LIMIT 501` by `inject_row_limit` when a lone read carries no top-level
`LIMIT` (`:89-126`, a literal-stripped scan that leaves batches untouched);
`MAX_RESPONSE_BYTES = 8 MB` on the transport (`:48`); and a
`CancellationToken` threaded through to an interrupt handle on the local
engine path (`run_local_sqlite_guarded`, `:2721`). Failures pass through
`sanitize_error` (`:148`), which redacts every non-empty credential field
value regardless of length (`:155-160`).

## The gap the counter-evidence shows

The executor's parameter is a raw `&str`, and the repo has a second door
that never meets it. The companion's `personas_database` connector has a
read lane and a mutation lane in
`src-tauri/src/companion/jobs/connector_use.rs`:

- `execute_select` admits a statement when its lowercase text
  `starts_with("select")` (`:1467`) and runs it with `prepare` and `query`.
- `execute_mutation` admits a statement when it starts with one of seven
  verbs, including `drop` and `alter` (`:1530-1537`), then runs it through
  `agent_sql_guard::run_agent_mutation` (`:1546`;
  `src-tauri/db/src/agent_sql_guard.rs:179`). That guard installs a SQLite
  authorizer and refuses any write, to a row or to the structure, against a
  table the companion schema declares, so the companion cannot rewrite its
  own ledgers, approvals or budgets (`agent_sql_guard.rs:1-23`).
- Both lanes check `is_single_statement` (`:1395-1398`), a raw
  `contains(';')` with no literal stripping. It fails closed (a `;` inside a
  string is refused), so it is stricter than it needs to be, not weaker.

The authorizer is a stronger classifier than text inspection for the tables
it protects, because the engine decides per table touched. But neither lane
passes through `is_mutation`, and nothing in the type system required
either to. That is the "executor demands a classified statement" section of
the technique, motivated by measurement rather than taste.

## History

- **Forged** (date not recorded) against the app crate. The executor was
  cited at `execute_query_cancellable` `db_query.rs:686-726`; the
  classifier's `WITH` branch was `cte_body_has_mutation` (`:340`), which
  scanned only `WITH` bodies against `CTE_MUTATION_VERBS`. The companion's
  mutation lane guarded a model-authored statement with
  `lower.starts_with(v)` over seven verbs and then called the driver
  directly (`connector_use.rs:1525-1549`).
- **Re-checked 2026-10-31 at personas@`22260d77`.** The executor had moved
  into the extracted engine crate and the guard had **widened, not
  weakened**: `cte_body_has_mutation` became `body_has_mutation`, now run
  for `SELECT`, `VALUES` and `EXPLAIN` as well as `WITH`, with the
  `READ_SHAPED_WRITES` list; both `body_has_mutation` and
  `has_multiple_statements` fail closed on unterminated input; and the
  `ddl_only` flag runs `validate_ddl_only` ahead of the safe-mode checks.
  The companion lane **no longer calls the driver directly**; it runs
  through the `agent_sql_guard` authorizer. The type-system gap **still
  holds**: the executor takes a raw `&str` and neither companion lane meets
  `is_mutation`.
