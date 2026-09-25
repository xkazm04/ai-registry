---
layer: application
type: application
subject: companion-identity
technique: disk-truth-db-index
stack: rust
status: forged
verified_on: 2026-09-23
verified_against: rust@1.96
applied: experiment
ab_verdict: better
---

# The companion brain as a folder, with SQLite as its index (Athena)

Personas keeps its companion's durable self in `~/.personas/companion-brain/`
and treats the embedded database as an index over it. The layout is declared at
the top of `src-tauri/src/companion/disk.rs:1-15`: `constitution.md`,
`identity.md`, and directories for `episodes/`, `semantic/{user,projects,world}/`,
`procedural/` and `reflections/`. `brain_root()` (`disk.rs:30-39`) resolves it,
honouring a `PERSONAS_HOME` override for tests.

Re-read 2026-09-23 at personas `1b8161096`; toolchain pinned in
`rust-toolchain.toml` (channel `1.96.1`), manifest floor `rust-version = "1.80.0"`
(`src-tauri/Cargo.toml:218`).

The inversion is stated where the writes happen. The terminal channel's writer
comments its own line `# disk first — source of truth`
(`.claude/skills/athena/brain.py:189`), and cycle reports keep "markdown on disk
under `cycles/<date>-<id>.md` as the source of truth, a `body_excerpt` in the node
index, and a **`companion_fts` mirror row**"
(`docs/features/companion/README.md:486`).

## The index is a contract on the write door

The same paragraph continues: the FTS mirror "is a contract rather than an
optimization: `brain::keyword` reads `companion_fts` with BM25 and it is the only
retrieval lane that compiles on the shipped non-`ml` build, so a node kind that
skips it is stored, looks fine, and never comes back from a search"
(`README.md:486`). Tags carry the same requirement — mirrored into
`companion_fts.tags` as `tag:<name>` tokens, because "a tag that lived only in a
column would classify nothing findable on the non-`ml` build" (`README.md:550`).

## The rebuild exists for vectors, and was needed for exactly the predicted reason

**Memory → Rebuild search index** (`README.md:558-562`) re-embeds every memory with
no vector or a vector written under a different embedding model. It is idempotent
— "a second pass finds nothing left to do" — and reports one of three outcomes,
including "this build ships without an embedding model and so cannot rebuild",
which keeps *could not run* distinct from *nothing to do* (`README.md:560`).

Its justification is the technique's argument, arrived at the hard way: "Semantic
recall only ever indexed a memory **at the moment it was written**, so anything
that arrived any other way had text and no vector, permanently: a portability
import, a brain directory restored from a backup, a write made while the embedder
was down" (`README.md:562`).

## A lifecycle field that lived only in the index, and its repair

Backlog items (the companion's self-promises and capability gaps) are written as
markdown under `backlog/<kind>/<id>.md` plus a `companion_node` row and a
`companion_backlog_item` row (`write_item`, `companion/brain/backlog.rs:111-158`).
Until 2026-09-03 `resolve_item` updated only the index; the module header now
records why that was wrong — "An audit record that contradicts the truth is not an
audit record" — and the two consequences: the re-embedder re-derived a resolved
promise's vector from its unresolved text, and "any future index rebuild reading
these files … would have restored all of them" (`backlog.rs:15-31`). Resolution is
now written to both, with one definition of what a status implies
(`importance_for_status`, `backlog.rs:59-64`; `resolve_item`, `:160-230`;
`importance_from_markdown`, `:415`). There is still no rebuild-from-disk pass; the
tests assert the property a rebuild would depend on rather than "pretending a
rebuild exists" (`backlog.rs:440-445`).

Two residues, both read against the sharpened rule:

- **Write order is index first.** `resolve_item` claims the row
  (`UPDATE … WHERE status = 'pending'`, `backlog.rs:172-182`), then rewrites the
  markdown, then re-stamps the node, on the stated reasoning that "a disk failure
  leaves the index authoritative and the item already out of retrieval — the safe
  direction" (`backlog.rs:160-168`). That is safe for retrieval today and the unsafe
  direction for the rebuild the header anticipates: a crash between the two writes
  leaves a file that still says `pending`, which a rebuild would reopen.
- **`reminded_count` lives only in the index** (`bump_reminded`,
  `backlog.rs:299-314`; a second writer in `companion/proactive/mod.rs:615-632`). It
  is operational scratch, a throttle on re-surfacing, so under the technique's test
  it may stay there — provided the rebuild names that it resets it and a
  once-more reminder is accepted. Nothing names that today, because no rebuild
  exists.

## Seed-if-absent, and the version-gated law upgrade

`ensure_initialized` (`disk.rs:41-114`) is idempotent first-run init;
`identity.md` is seeded through `write_if_absent` (`disk.rs:109-112, 116-123`) and
never overwritten by init. The constitution is seeded when missing and **replaced**
on every `CONSTITUTION_VERSION` bump, with a best-effort timestamped backup
(`disk.rs:87-107`). An earlier version of this application quoted the feature
README as saying an upgraded install keeps its old file; the README has since
corrected that (`README.md:825-827`), and the upgrade path, its churn and its
amendment route are recorded in
[rust--constitution-self-model-split](./rust--constitution-self-model-split.md).

## Portability

Export carries two tiers — **core self** (`identity.md`, a whitelist of portable
preferences, the conversation roster) and **learned memory** (facts, procedurals,
goals, backlog, rituals, decisions, each as its markdown body plus its sidecar
row) (`README.md:570-572`).

- **Paths are de-anchored.** `relative_brain_path`
  (`src-tauri/src/commands/core/data_portability/export_athena.rs:7-34`) normalises
  every `companion_node.file_path` to a root-relative name, accepting an absolute
  path only when it sits under this machine's brain root — because "an absolute
  path in a bundle names a directory on the exporting machine, and the importer
  would create it" (`export_athena.rs:9-14`). It uses `is_anchored_path` rather than
  `is_absolute()`, since a Windows rooted-but-prefixless path also discards the root
  it is joined onto (`export_athena.rs:17-20`).
- **Every drop is reported and travels with the bundle.** "Every drop (an
  unreadable markdown body, an oversize file, a cap) is reported through
  `export_warnings`, because a memory silently missing from a bundle is
  indistinguishable from a memory that never existed" (`export_athena.rs:38-42`).
  An unresolvable brain root warns and returns `Ok(None)` (`export_athena.rs:52-59`),
  and a missing brain database says which tiers were omitted "rather than reporting
  a suspiciously small brain" (`export_athena.rs:68-78`).
- **The exclusion list is gated by name.** Conversation history, doctrine,
  `constitution.md`, reflections, identity backups and machine-local tables do not
  travel, and "A test asserts every one of those exclusions **by name** … A future
  section cannot quietly widen the payload" (`README.md:576-583`).
- **Import is explicit about collision.** It "merges additively with dedup; it does
  not replace", deduplicating by content, and counts matches as skipped
  (`README.md:587`). `identity.md` is the one genuine replacement, backed up first
  through the same timestamped path the diff op uses (`README.md:589`).
- **The bundle carries text and never vectors**, so everything imported starts
  unsearchable; a background re-embed fires on import and the manual rebuild is the
  fallback (`README.md:593`).

## Where it falls short of the standard

**The person's own law does not travel.** `constitution.md` is excluded "for the
same reason" as doctrine — compiled from what ships in the binary
(`README.md:579-580`). Sound for the baseline, wrong for amendments; and on the
target, the next version bump would set them aside anyway.

**Rebuild is a vector repair, not a reconciliation.** Nothing walks the folder and
reconciles the node index against the files (`backlog.rs:440-445` records the
search), so a document with no row — the mirror of the "stored but unfindable"
defect at `README.md:486` — has no detector, and the rebuild the backlog repair was
written for does not yet exist.

## Applied 2026-09-23 - write order under injected faults, modelled over the extracted order

The resolve path's own comment calls claiming the index first "the safe direction". A
script extracted the order from source (row claim, then document, then the node's
importance stamp: three writes, no transaction) and a fault-injection model walked a
failure at every boundary with one caller retry, reading three surfaces - the backlog
list, the retrieval gate (importance above zero) and the document's status. Fault points
leaving a surface false after the retry: 2 of 3 as built with no rebuild, 1 of 3 with a
rebuild from disk; 0 of 3 either way with the document written first and claim plus stamp
in one transaction. No-fault behaviour and the double-resolve refusal held in both arms.
The stated safety never existed: the write that takes the item out of retrieval is last,
so a document failure leaves it retrievable, pending, and refused on retry. This is a
model of the extracted order, not an executed run. The reminder counter is index-only
(3 of 3 rows at 0, one of its two writers dead code) and no rebuild exists yet, so "the
rebuild names what it resets" is unmeasurable. Not hunted: 5 documents against 3 index
rows, the 2 without rows being test-fixture promises that a rebuild from disk would
import. `better`. Return: when a rebuild from disk lands, check it names what it resets
and what it adds.
