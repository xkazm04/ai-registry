---
layer: application
type: application
subject: versioning-snapshots
technique: snapshot-scope
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Snapshot scope — the persona version snapshots

Two coexisting version stores in this repo apply the technique from opposite
ends, and a third mechanism embodies the field-log alternative. Together they
are a complete worked example — including the failure modes.

## The full-graph copy: `persona_versions`

`src-tauri/db/src/repos/lab/versions.rs::create_version` is the canonical
set-based full-graph capture. One connection, two `INSERT … SELECT`
statements:

1. The head row copies the persona's behavioral surface directly from the
   live table — `name, description, system_prompt, structured_prompt,
   model_profile, max_budget_usd, max_turns, timeout_ms, design_context` —
   and mints `tag = 'experimental'` at creation (`versions.rs:79-86`).
2. The owned children follow: `persona_version_tools` is populated by
   selecting through the `persona_tools` assignment table and **embedding**
   each tool's definition as a JSON object (`json_object('name', …,
   'category', …, 'description', …)`, `versions.rs:96-102`) — an explicit
   embed-vs-reference decision. The version means *those* tools as they were,
   not whatever the tool ids resolve to later; a prompt restored without its
   tools would be the chimera the technique names.

Scope notes against the technique's checklist: fresh child ids
(`hex(randomblob(16))`), copies keyed to the new version id, execution
history and ratings excluded (they belong to the entity). Two gaps:

- The two inserts run on one connection but are **not wrapped in an explicit
  transaction**, so the head-then-tools copy is a two-statement capture; a
  failure between them leaves a tool-less version row.
- `SELECT COALESCE(MAX(version_number), 0) + 1` runs as a separate statement
  with `.unwrap_or(1)` on error (`versions.rs:52-60`), and the DDL
  (`migrations/incremental/e03_p2p_and_telemetry.rs:307`) declares **no UNIQUE(persona_id, version_number)**
  — the version-identity technique's constraint backstop is absent.
- Largest of all: the 2026-08-17 census
  (`docs/concepts/golden-paths/definition-version-history.md` §0) measured
  this whole store at **zero callers and zero rows ever written** — the
  best-scoped snapshot in the repo is the dead one, while the narrower
  `persona_prompt_versions` (prompt + design fields, no tools) is what every
  writer writes.

## The conditional door that diffs one field

`src-tauri/db/src/repos/execution/metrics.rs::create_prompt_version_if_changed`
(:152) is the dedupe gate on the working store's capture door — and a
measured instance of the technique's warning about conditional capture: it
compares **only `structured_prompt`**, and its sole caller guards the entire
call behind `if let Some(ref new_sp) = input.structured_prompt`. A
system-prompt-only edit never reaches the version writer; the census counted
16 of 25 historical rows with `system_prompt IS NULL`. The scope declared by
the snapshot columns and the scope enforced by the change gate are two
different scopes, and nothing cross-checks them.

## The field-log shape, done right

`src-tauri/db/src/repos/resources/persona_change_log.rs` is the repo's
exemplar of the golden path's *other* history shape: `write_diff` (:232)
takes the **caller's connection** so the history row commits atomically with
the edit it records; `compute_changes` (:65) diffs 19 fields explicitly from
the already-loaded row (no re-read race); secrets are redacted at capture;
retention is enforced at write time (200 rows per persona). Choosing between
this and the snapshot stores is exactly the "what moves together" decision
the golden path describes — the persona's independently-edited fields suit
the field log; a whole-prompt rollback suits the snapshot.

Re-checked 2026-10-31 at personas@22260d77:

- `create_version` (`versions.rs:45-119`) now runs in **one IMMEDIATE
  transaction** — head row, tools and read-back — and additionally writes
  `parent_version_id` and `created_at`. The first gap (the two-statement,
  untransacted capture) is **resolved**. The version-number read still uses
  `.unwrap_or(1)`, now inside that transaction, and the DDL still declares no
  `UNIQUE(persona_id, version_number)` (only the non-unique `idx_pv_version`,
  `e03_p2p_and_telemetry.rs:327`). `create_version` still has no production
  caller — only the module's own tests call it.
- `create_prompt_version_if_changed` (now `metrics.rs:164`) diffs
  `structured_prompt` **or** `core_profile`, and it has three callers
  (`db/src/repos/core/personas.rs:1201`,
  `src/engine/management_api.rs:1577,1707`); the persona-update caller now
  gates on `sp_changing || cp_changing` (`personas.rs:1174-1189`). A
  system-prompt-only edit still never reaches the version writer, so the
  finding's core — the declared snapshot scope and the enforced change-gate
  scope differ — stands, narrowed from one field to two.
