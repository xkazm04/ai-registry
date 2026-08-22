---
layer: application
type: application
subject: data-access
technique: row-mapping
stack: rust
verified_on: 2026-08-18
---

# Row mapping in the Rust data layer

The repo has both halves of the technique — a single-declaration mapper
generator and a skip-and-log collection primitive — and also the two
hazards the technique warns about, live in its flagship repo module.

## One declaration, derived mapper: `row_mapper!` (`src-tauri/db/src/macros.rs:100-128`)

```rust
row_mapper!(row_to_group -> PersonaGroup {
    id, name, color, sort_order,
    collapsed [bool],
    description [opt],
    created_at, updated_at,
});
```

Field list declared once; the mapper function is expanded from it, columns
addressed **by name** (`row.get(stringify!($field))`), never by position.
The sibling CRUD macros (`crud_get_by_id!` `:141`, `crud_get_all!` `:179`,
`crud_update!` `:251`) derive the read, list, and partial-update functions
from the same table/mapper declaration — the technique's "adding a field
is a one-site edit" property, delivered by macro expansion. 44 mappers are
generated this way; 125 more are hand-written `fn row_to_*` in the same
name-addressed shape (counts from the 2026-08-14 sweep in
`docs/concepts/golden-paths/row-to-struct-mapping.md`).

`crud_get_by_id!` also implements the single-record honesty rule: it maps
`QueryReturnedNoRows` to a typed `NotFound` naming the entity
(`macros.rs:153-158`), while a decode failure stays a `Database` error —
absent and unreadable never share an answer.

## The collection policy: `collect_rows` (`src-tauri/db/src/repos/utils.rs:33-58`)

The degrade-visibly primitive, exactly per the technique: per-failure it
logs context, row index, and error; then a `skipped_count` summary; then
returns the survivors. The repo's own golden-path sweep sharpened the
policy into the two-consumer rule the technique now carries: user-facing
list reads *propagate* (`rows.collect::<Result<Vec<_>,_>>()`, e.g.
`executions.rs:328`) because a silently short list is a lie the user acts
on, while background sweeps use `collect_rows` (e.g.
`sweep_zombie_executions`, `executions.rs:1830`, whose comment says why: a
dropped row would "never be reaped — log it instead of dropping it").
107 call sites; the known defect class is *placement* — sites using the
wrong policy for their consumer — not the primitive itself.

## The two live hazards

- **Per-field tolerance laundering schema drift.** `row_mapper!`'s `[opt]`
  kind is `row.get(col).ok().flatten()` — "column may not exist in schema"
  (`macros.rs:87,116-118`) — and `opt_str` goes further, defaulting a
  missing column to a literal `"working"` (`:120-123`). This is the
  technique's "resilience is for damage, not programmer error" violation
  in generated form: a schema/mapper disagreement fails *every* row, and
  these kinds convert that loud statement-level fact into silent defaults,
  per row, forever. The hand-written flagship mapper `row_to_execution`
  (`executions.rs:77-121`) carries the same posture at smaller stakes:
  `thinking_level`, `director_score`, `execution_config` use
  `.unwrap_or(None)` on the *get itself*, so a genuinely mangled value and
  a missing column both decode as "not set" with no record of either.
- **The banned third option, at scale.** The 2026-08-14 sweep counted 179
  sites of `filter_map(|r| r.ok())` / `.flatten()` /
  `.unwrap_or_default()` over collected row sets — silent skip spelled
  three ways, outside both legal policies. The primitive that would have
  made them visible existed the whole time.

## Naming the columns is a detector, not a style preference (2026-08-22)

The lane that converted this crate's positional reads to named ones —
**1,115 → 881 `row.get(<ordinal>)`, 346 → 293 wildcard selects**, across seven
files completely — was justified in the abstract as readability and
`ALTER TABLE` safety. It paid for itself concretely on the first file.

`list_items_by_persona_id` (`src-tauri/db/src/repos/execution/executions.rs:262`)
had returned `Err(InvalidColumnName("business_outcome"))` **on every invocation
since 2026-05-11** — roughly three months. The commit that added the column
touched three mappers at once; two read a wildcard and absorbed it silently,
and the third, the only hand-written projection of the three, has been broken
ever since. Its sole caller is the command behind the persona execution list,
so a user-facing surface returned an error the entire time and nothing in the
repository could have noticed: a column name is a string, no other caller
shared the mapper, and the file's own test module never invoked the function.
It surfaced because converting a positional read forces you to check the
projection against the schema.

Three rules came out of the conversion, each earned:

- **Never infer a column name from a field name.** Every mapping was checked
  three ways — the migration DDL, the explicit projection, the model struct —
  which mattered five more times in seven files (`evidence_json`, two aliased
  aggregates, `avg_dur`, `day`).
- **Prefer a loud failure to a tolerant hatch.** `row_mapper!`'s `[opt]` escape
  was used **zero** times in the conversion; three mappers were hand-written
  rather than trade a `PREPARE`-time error for a silent `None`. One behaviour
  change was named rather than buried: a mapper that previously leaned on
  `[opt]` now fails at `PREPARE` when a column is missing.
- **A case-only mutation does not prove a probe.** Every converted file gained
  a schema-probe test, and each was proved capable of failing by corrupting a
  column name and watching the probe name the table, column and offset. One
  attempt failed to fail — mutating `detail` to `detaiL` passed, because the
  store matches column names case-insensitively.

## The corollary: static rules that key on column names go UP

The census re-baseline after this lane recorded three rules **rising** —
`ledger-field-addressed-by-string-key` by 3, `untimed-repo-query` and
`unknown-money-as-zero` by 1 each — in exactly the repos the conversion
rewrote. Nothing got worse. Explicit projections and named reads made the
columns those rules match on **visible to a text-shaped analyzer for the first
time**; a wildcard hides a column from static analysis exactly as effectively
as it hides it from the compiler.

So: **a rise in any rule that keys on a column name is evidence the conversion
worked**, and a ratchet that only ever admits downward movement will read this
as a regression and fight it. (`pool-get-unwrapped` rose 8 for the adjacent
reason: the new schema-probe tests each open a database, and an unwrap inside
a test is the assertion.) The general form is the deletion protocol's
attribution duty applied to a *refactor*: every baseline movement, up or down,
is traced to a specific change before the lane is believed — and the first
draft of that re-baseline message claimed every movement was downward, which
was wrong. Eyeballing a ratchet is not a check.
