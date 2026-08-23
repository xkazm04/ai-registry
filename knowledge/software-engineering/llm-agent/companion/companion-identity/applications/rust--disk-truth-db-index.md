---
layer: application
type: application
subject: companion-identity
technique: disk-truth-db-index
stack: rust
status: forged
verified_on: 2026-08-23
---

# The companion brain as a folder, with SQLite as its index (Athena)

Personas keeps its companion's durable self in `~/.personas/companion-brain/`
and treats the embedded database as an index over it. The layout is declared at
the top of `src-tauri/src/companion/disk.rs:1-15`: `constitution.md`,
`identity.md`, and directories for `episodes/`, `semantic/{user,projects,world}/`,
`procedural/` and `reflections/`. `brain_root()` (`disk.rs:29-38`) resolves it,
honouring a `PERSONAS_HOME` override for tests.

The inversion is stated where the writes happen. The terminal channel's writer
comments its own line `# disk first — source of truth`
(`.claude/skills/athena/brain.py:189`), and the app's cycle reports keep
"markdown on disk under `cycles/<date>-<id>.md` as the source of truth, a
`body_excerpt` in the node index, and a **`companion_fts` mirror row**"
(`docs/features/companion/README.md:469`).

## The index is a contract on the write door

The same line continues with the sharpest observation in the feature docs: the
FTS mirror "is a contract rather than an optimization: `brain::keyword` reads
`companion_fts` with BM25 and it is the only retrieval lane that compiles on the
shipped non-`ml` build, so a node kind that skips it is stored, looks fine, and
never comes back from a search" (`README.md:469`). Tag classification carries
the same requirement — tags are mirrored into `companion_fts.tags` as
`tag:<name>` tokens, because "a tag that lived only in a column would classify
nothing findable on the non-`ml` build" (`README.md:497`).

## The rebuild exists, and it was needed for exactly the predicted reason

**Memory → Rebuild search index** (`README.md:505-509`) re-embeds every memory
with no vector or a vector written under a different embedding model. It is
idempotent — "a second pass finds nothing left to do" — and it reports one of
three outcomes, including "this build ships without an embedding model and so
cannot rebuild", which keeps *could not run* distinct from *nothing to do*.

Its justification is the technique's argument, arrived at the hard way:
"Semantic recall only ever indexed a memory **at the moment it was written**, so
anything that arrived any other way had text and no vector, permanently: a
portability import, a brain directory restored from a backup, a write made while
the embedder was down" (`README.md:509`). An index maintained only incrementally
left three whole classes of arrival permanently unsearchable, and the model
guard that drops mismatched vectors could not be acted on until this command
existed.

## Seed-if-absent, and a version-gated law upgrade

`ensure_initialized` (`disk.rs:50-114`) is idempotent first-run init. The
constitution is written fresh only when the file is missing (`disk.rs:75-86`);
after that "it's user-owned; we never overwrite arbitrary edits from the embedded
copy unless the canonical version stamp has bumped" (`disk.rs:66-69`). The
upgrade path (`disk.rs:87-107`) is gated on a stored
`companion_constitution_version` setting, runs once per bump, and copies the
existing file to a timestamped `constitution.bak-<ts>.md` before replacing it.
`identity.md` is seeded through `write_if_absent` (`disk.rs:109-112, 117-123`) and never
overwritten by init.

The cost of that design is documented rather than hidden: "The constitution is
read from `~/.personas/companion-brain/constitution.md`, not from the repo at
runtime. An upgraded install keeps its existing file, so Athena will not know a
newly added op exists until that file is refreshed. A feature can look broken on
an upgrade for this reason alone" (`README.md:764`).

## Portability

Export carries two tiers — **core self** (`identity.md`, a whitelist of portable
preferences, the conversation roster) and **learned memory** (facts,
procedurals, goals, backlog, rituals, decisions, each as its markdown body plus
its sidecar row) (`README.md:517-519`).

- **Paths are de-anchored.** `relative_brain_path`
  (`src-tauri/src/commands/core/data_portability/export_athena.rs:7-34`)
  normalises every `companion_node.file_path` to a root-relative name, accepting
  an absolute path only when it sits under this machine's brain root and
  rejecting it otherwise — because "an absolute path in a bundle names a
  directory on the exporting machine, and the importer would create it"
  (`export_athena.rs:9-15`). It uses an `is_anchored_path` check rather than
  `is_absolute()`, since a Windows rooted-but-prefixless path also discards the
  root it is joined onto (`export_athena.rs:17-22`).
- **Every drop is reported and travels with the bundle.**
  `collect_athena_export` documents the rule directly: "Every drop (an unreadable
  markdown body, an oversize file, a cap) is reported through `export_warnings`,
  because a memory silently missing from a bundle is indistinguishable from a
  memory that never existed" (`export_athena.rs:36-42`). An unresolvable brain
  root warns and returns `Ok(None)` rather than erroring
  (`export_athena.rs:52-60`), and a missing brain database says which tiers were
  omitted rather than "reporting a suspiciously small brain"
  (`export_athena.rs:69-79`).
- **The exclusion list is gated by name.** Conversation history, doctrine,
  `constitution.md`, reflections, identity backups and the machine-local tables
  deliberately do not travel, and "a test asserts every one of those exclusions
  **by name**, both as a forbidden JSON key and as a forbidden node kind or file
  path, and additionally seeds sentinel strings and asserts they are absent from
  the serialized bundle. A future section cannot quietly widen the payload"
  (`README.md:523-530`).
- **Import is explicit about collision.** It "merges additively with dedup; it
  does not replace", deduplicating by content rather than id, and counts matched
  items as skipped and reports them (`README.md:534`). `identity.md` is the one
  genuine replacement, backed up first through the same timestamped path the
  companion's own diff op uses (`README.md:536`).
- **The bundle carries text and never vectors**, so everything imported starts
  unsearchable; a re-embed is fired in the background on import and the manual
  rebuild is the fallback (`README.md:540`).

## Where it falls short of the standard

**The person's own law does not travel.** `constitution.md` is excluded from the
bundle because it is compiled from documentation shipped in the binary and
rebuilt on the target (`README.md:527`). That is sound for the shipped baseline
and wrong for the amendments — the file is explicitly user-owned between version
bumps (`disk.rs:66-69`), so any clause the operator added is left on the old
machine with nothing reporting its absence.

**Rebuild is a UI action, not a reconciliation.** The command re-embeds items
whose vectors are missing or stale (`README.md:507`), which repairs the vector
lane; nothing walks the folder and reconciles the node index against the files
on disk, so a document that exists with no row — the mirror direction of the
"stored but unfindable" defect the docs name at `README.md:469` — has no
detector.
