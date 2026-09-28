---
layer: application
type: application
subject: connector-catalog
technique: shipped-vs-operator-ownership
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# One refresh, two keys: a boot seeder that inserts by id and updates by name

*Verified against the project tree at `bbd070723` (toolchain pinned to rust
1.96.1, rusqlite 0.38, SQLite through r2d2). The store readings come from the
operator's own install, opened read-only.*

The golden path's measured instance of the boot-time clobber comes from this
tree, and the clobber is still there. Reading the writers one by one found
three things the technique did not yet say. The refresh's two statements
disagree about identity. A feature writes into one element of a list column
the vendor owns. And the operator doors that would make the clobber visible
are closed by the UI, not by the store.

## The refresh

`seed_builtin_connectors` (`src-tauri/db/src/lib.rs`) runs inside `init_db`
on every launch, after migrations. It walks a generated
`&[BuiltinConnector]` (`db/src/builtin_connectors.rs`, built from
`scripts/connectors/builtin/*.json`) and runs two statements per row:

- `INSERT OR IGNORE ... VALUES (id, name, ...)`, keyed on the primary key
  `id`;
- `UPDATE ... SET label, icon_url, fields, healthcheck_config, metadata,
  category, services, events, resources, updated_at = now WHERE name = ? AND
  is_builtin = 1`, keyed on `name`.

There is no revision stamp and no comparison. Nine columns and the timestamp
are rewritten on every boot. `color` and `name` are missing from the list, so
those are the columns where an edit survives. That is the accident-survivor
signature the technique names, still in place at this commit.

## The writers, enumerated

| Writer | Door | Columns | Reaches a shipped row? |
| --- | --- | --- | --- |
| Boot refresh | `seed_builtin_connectors` | nine + `updated_at` | every row, every launch |
| Edit door | `repos/resources/connectors.rs` `update`, IPC `update_connector` (privileged) | any, incl. `name` | yes, no `is_builtin` guard; no UI caller in `src/` |
| Delete door | generic `crud_delete!`, IPC `delete_connector` (privileged) | the row | yes, no guard; the UI calls it only to roll back a row it just created |
| Import confirmation | `n8n_transform/confirmation.rs`, `register_connector_services_txn` | `services` | yes. It matches over every row, and the install read here holds only shipped rows |
| Retirement | the seeder's hand-written `DELETE ... 'builtin-local-scraper'`, a migration's `DELETE ... WHERE name IN (...)` | the row | shipped rows only |

The import writer is the victim that exists today. It appends
`{"toolName": ..., "source": "import"}` to a connector's `services`. The
credential injector's primary match reads that list at run time
(`engine/runner/credentials.rs`), so the entry is how an imported tool finds
its connector. The entry already carries its origin. The refresh ignores the
tag and replaces the whole list from the shipped copy.

## The replay

The five cases below replay the SQL verbatim from the tree against the
table's real schema, with a second seeder run standing in for the next launch:

1. The import appends a tool, then a reboot: the entry is **gone**.
2. The edit door changes `label` and `color`, then a reboot: the label
   **reverts** and the color **survives**.
3. The edit door renames `name`, then the vendor ships a corrected field
   schema: the row **never receives the fix**. There is also **no duplicate**.
   The insert keys on `id`, which still exists, so it is ignored. The update
   keys on `name`, which no longer matches. The rename has silently forked
   the row out of vendor ownership, with no marker anywhere.
4. The delete door removes a shipped row, then a reboot: the row is
   **resurrected**.
5. A boot with nothing shipped changed: every row's `updated_at` is
   **rewritten**.

## The store confesses, under the condition that makes it evidence

The install holds 135 shipped rows, the same set the binary ships. Their
`created_at` values span **34 distinct instants from 2026-03-12 to
2026-09-16**: the rows arrived across six months of upgrades. Their
`updated_at` holds **one value, the last boot**. A shared timestamp could
also be an install or a bulk migration. Here it is neither, because the
creation spread proves the rows are older than the stamp.

The same store holds **0 rows carrying an import-tagged service**. That zero
cannot tell "never imported" from "imported and reverted". Telling them apart
is the evidence the clobber destroys.

## The change landed (the apply row)

Commit `12e6944a2` changes the seeder to carry the installed row's
import-tagged entries across the refresh (`refreshed_services`). Shipped entries still refresh. An import entry
yields when the shipped list starts naming the same tool. When there is
nothing to carry, the shipped string passes through byte-for-byte, so every
row without an import entry is written exactly as before. A boot-path test
runs `init_db` twice around the import writer's own UPDATE. It **fails on the
old seeder and passes on the new one**. A unit test pins the tool-name
dedupe and the pass-through.

What was left alone, and why:

- **The split key.** Neither the rename nor the delete is reachable from the
  UI today, so the change stays out of the boot path.
- **The revision gate.** It needs a stamp column and a migration, which is
  more than one finding.

Both are recorded as the project's deviations.
