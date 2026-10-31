---
layer: application
type: application
subject: sql-console
technique: introspection-architecture
stack: rust
verified_on: 2026-10-31
verified_against: rust@1
---

# One parameterized introspection door, and the deleted second one

Schema browsing in the vault's database surfaces runs through exactly two
Tauri commands — `introspect_db_tables` and `introspect_db_columns`
(`src-tauri/src/commands/credentials/db_schema.rs:184-216`, both
`#[requires(privileged)]`) — which delegate to `introspect_tables` and
`introspect_columns` in `src-tauri/engine/src/db_query.rs:904-1091`. The
client hook `src/hooks/database/useTableIntrospection.ts` is their only
consumer, and the NL lane's schema context
(`src-tauri/src/commands/credentials/nl_query.rs:323-390`) calls the same
two engine functions — one schema truth for the browser, the editor, and
the model.

## The clicked name is a bound value

```rust
// db_query.rs:1045-1077 (abridged)
let safe_name = table_name.replace(|c: char| !c.is_alphanumeric() && c != '_', "");
match credential.service_type.as_str() {
    "neon" => execute_neon_parameterized(&fields,
        "SELECT column_name, data_type, is_nullable, column_default \
         FROM information_schema.columns \
         WHERE table_schema = 'public' AND table_name = $1 \
         ORDER BY ordinal_position", &[&safe_name]).await,
    "planetscale" => execute_planetscale_parameterized(&fields,
        "SELECT column_name, column_type, is_nullable, column_default \
         FROM information_schema.columns \
         WHERE table_schema = DATABASE() AND table_name = ? \
         ORDER BY ordinal_position", &[&safe_name]).await,
    "supabase" => introspect_supabase_columns(&fields, &safe_name).await,   // OpenAPI spec, not SQL
    "convex" | "notion" | "airtable" => /* API-family introspection */ …
    other => Err(AppError::Internal(format!("Column introspection is not supported for '{other}'."))),
}
```

Every element of the technique is present in that block:

- **Catalog query, name as data.** The SQL families query
  `information_schema.columns` with the table name bound (`$1` / `?`) — the
  identifier never enters query text.
- **Belt and braces at the door.** `safe_name` (`:1045`) reduces the name to
  `[alnum_]` *before* binding. The technique's reason is visible three lines
  down: for the API families (`supabase` via its OpenAPI spec, `convex`,
  `notion`, `airtable`) the name travels into a URL or path segment, not a
  bound parameter, and one sanitizer applied once covers every transport.
- **Fixed query texts selected by request kind.** There is no free-text
  lane through these functions; a family the match does not know gets an
  explicit "not supported" error, not a guessed query.
- **The door audits and scrubs like the executor.** Both functions write a
  `db_query:introspect_*` audit line on credential decrypt (`:946-955`,
  `:1034-1043`) and pass through `finalize_result` (`:1002`, `:1081`), the same
  duration/sanitize path the execute lane uses.

## The second door was deleted, on purpose

`src/features/vault/sub_databases/introspectionQueries.ts:1-8` is the
one-validation-door story in the repo's own words: the former frontend
`getListTablesQuery` / `getListColumnsQuery` / `getRedisKeyScanCommand`
builders *"were a weaker second implementation and have been deleted."*
What remains in that file is connector-family classification and
`getSelectAllQuery` (`:152-178`) — a **clipboard** helper that emits a
quoted `SELECT * FROM "name" LIMIT 100;` for the user to paste, never
executed by the app. That is the emitted-versus-executed line the technique
draws; the quoting there is courtesy (the comment at `:155-157` records the
`order-items` → `order MINUS items` bug it fixed), not defense.

## The client cache is honest about being a cache

`useTableIntrospection.ts:28-75` keeps module-scoped Maps (tables, columns,
key scans) that survive tab switches and remounts, bounded at 50 / 200
entries with oldest-first eviction (`boundedSet`, `:59-65`), and cleared
per credential by `clearCacheForCredential` (`:67`). `fetchTables(skipCache
= true)` (`:184`) is the user-invokable refresh; the tables tab wires it
(`tabs/TablesTab.tsx:86`). Progressive disclosure holds: tables on connect,
columns on selection (`:240` region), nothing counted eagerly.

## Deviations against the standard

- Both SQL-family table introspections hard-code a single namespace
  (`table_schema = 'public'` at `:966`; `DATABASE()` at `:977`) — the
  browser has no namespace level.
- Row counts are not surfaced at all (neither estimate nor on-demand exact),
  which is the conservative side of the technique's rule but leaves the
  browser without the size signal users expect.
- Schema-shaped execution errors (unknown column/table) are not treated as
  staleness signals; refresh is manual only.

Re-checked 2026-10-31 at personas@22260d77: the engine moved into the
extracted crate (`src-tauri/engine/src/db_query.rs`; anchors above updated),
and table introspection is now paged. `introspect_db_tables` takes
`limit`/`offset` and calls `introspect_tables_paged` (`db_query.rs:914`);
the SQL families append a numeric `LIMIT {} OFFSET {}` (fetching one extra
row to set `truncated`), and the hook asks for one 50-name viewport
(`TABLE_PAGE_SIZE`, `useTableIntrospection.ts:34`) with `fetchMoreTables`
(`:220`) for the rest, sharing in-flight first-page requests per credential
(`_inflightTables`, `:46`). The unpaged `introspect_tables` (`:904`) remains
for the NL schema context. Column introspection is unchanged. This
strengthens progressive disclosure and does not change the verdict; the
single-namespace and no-row-count deviations still hold.
