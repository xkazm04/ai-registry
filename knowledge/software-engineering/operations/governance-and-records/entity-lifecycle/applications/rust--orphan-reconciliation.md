---
layer: application
type: application
subject: entity-lifecycle
technique: orphan-reconciliation
stack: rust
verified_on: 2026-08-30
verified_against: rust@1.80
---

# The vector store a cascade cannot reach — and the sweep that could not see it

The desktop agent app keeps persona memories in the main relational
database and their embeddings in a **separate vector database file**:
`persona_memory_embedding` plus its meta table, declared with a bare
`memory_id TEXT PRIMARY KEY` and no possible foreign key across the file
boundary (`src-tauri/db/src/repos/core/memories.rs:1818-1832`). That
makes memory deletion a cross-store delete, and the tree exhibits both
halves of the technique — the parts it built, and the incident that maps
exactly onto the parts it skipped. The sections below are the dated
specimen of that before-state; the resolution at the end closes it.

## Reapers exist, but no registry — so the doors diverge

The vector reaper is `spawn_delete_memory_embeddings` (`:1775`), called
from `batch_delete` (`:959`). But there is no enumerable registry of
delete doors deriving one cascade: `crud_delete!("persona_memories")`
(`:1154`) and `delete_all` (`:1180-1186`, the delete-all-memories door)
remove rows with **no vector companion at all**, and the relational
`ON DELETE CASCADE` from personas cannot cross the file. Each door
remembers, or forgets, the reaper independently — the folklore-cascade
failure the registry exists to kill.

## The failure is quiet where the technique demands loud

The reaper is fire-and-forget: it silently no-ops when the recall runtime
or an async handle is absent, and an actual failure is logged at *debug*
level with the rationale "orphan vectors are inert for recall"
(`:1770-1790`). Nothing flows back to the delete door; no durable record
of the owed cleanup exists. The consumer's own measurement (deviation
register, 2026-08-17) is the bill: after an authorized purge of all
personas, `persona_memories` went to 0 while **all 5,158 vectors
survived — a 100% orphaned store** — and the register notes current
research showing "deleted" embeddings are reconstructible from index
files, so orphan vectors are a privacy liability, not inert debris.

## Every sweep runs parent-first — the direction that cannot find an orphan

The tree has three reconcilers, all enumerating the relational side:
`gc_archived_memory_embeddings` walks `tier = 'archive'` rows in the main
DB (`:2077-2091`), `backfill_memory_embeddings` walks live memories
(`:2157-2170`), and the boot scrub `cleanup_orphan_rows`
(`src-tauri/db/src/lib.rs:481-501`) deletes relational rows whose persona
is gone — relational → relational. No code enumerates the vector store
asking whether each `memory_id` still has a parent, and an orphan is by
definition absent from every side these sweeps read. The one honest
detail worth copying: `gc_archived_memory_embeddings` counts only ids
that actually held a vector, so "already-clean archived rows return 0 and
the sweep [is] idempotent across repeated ticks" (`:2095-2098`) — the
report-honesty half of the technique, attached to a sweep pointed the
wrong way.

The compensating pattern on the *write* side is correct: embed-on-create
failure never fails the memory insert and is explicitly handed to the
backfill ("memory persisted; backfill will cover it", `:2064-2072`) —
creation has a reconciler; destruction does not.

## Resolved 2026-08-30 (personas commit `5ca272bff`)

Destruction now has its reconciler, and the shape is the technique's.
`src-tauri/db/src/repos/core/memory_reaper.rs` adds the enumerable
registry (`MEMORY_REAPERS`, `:52`) from which the cascade, the receipt
and the sweep all derive — the module header (`:13-23`) states the three
derivations in the technique's own terms. The ledger is
**write-ahead**: `memory_reaper_ledger` lives in the main DB with no
foreign keys, outside every cascade (owned by migration
`e15_memory_reaper_ledger.rs`), and the debt is recorded *before* the
fire-and-forget reapers dispatch, resolved on confirmed success — the
honest form where "record on failure" cannot be implemented at a door
whose reapers are async and may not run at all. The dependent-side walk
the previous sections found missing exists as
`reconcile_memory_vector_orphans` — report mode by default, apply as the
explicit flag — and six delete doors are wired through the module. The
archive door is deliberately **unledgered** (`:350-354`, "Door 6" in the
tests at `:813-816`): its parent row survives, so the parent-first
archived-GC sweep is its repair path, and writing it to the ledger would
let the sweep's existence check resolve the debt without paying it —
the surviving-parent exclusion the technique now carries. The standing
~5,158 orphans from the 2026-08-17 purge remain report-only pending an
operator apply, which is the report-before-apply discipline, not a gap.
