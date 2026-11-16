---
subject: embedded-db
domain: software-engineering
last_touched: 2026-11-16
dry_streak: 2
---

# embedded-db

First touch: [[2026-08-22-2]], external reconcile against `sqlite/sqlite`
@ `45f4f1c` (3.54.0). Gained `c--journal-and-durability-modes` — second stack;
single-stack debt cleared. `c` declared as a bundle extra stack for this.

## Open leads (banked, convergence rule applies)

- **The contract's two halves have opposite persistence** — journal mode is in
  the file header, sync level per-connection; boot assertion is two acts at two
  frequencies. SECOND SIGHTING of "persist the verdict" (with golang-migrate's
  dirty flag, same wave).
- Environment-derived defaults must never override a signed clause
  (`setDefaultSyncFlag` gated on `bSyncSet==0`).
- "Checkpoint returned OK" and "checkpoint completed" are different facts —
  verify maintenance by measured journal size, not return code.
- Sidecars can outlive every connection — delete/reset clause should be an
  invariant, not advice.

## Cross-subject proposals (for owning subjects)

- Per-connection contract re-assertion belongs in the POOL BUILDER →
  connection-pooling.
- SQLite's commit-time auto-checkpoint as the canonical counter-example →
  quiet-window-maintenance (also grades the existing rust application's
  unconditional TRUNCATE against the PASSIVE→TRUNCATE spectrum).
- `VACUUM INTO` / `sqlite3_backup_*` as the engine-native snapshot primitives →
  migrations' snapshot contract.

## Applied to the technique layer

- 2026-08-22-3: **opposite persistence of the two halves** applied to `journal-and-durability-modes` ([[2026-08-22-3]]).

## 2026-08-27 — intake, the analytical quadrant ([[2026-08-27-duckdb-changing-physics-of-analytics]])

**The golden path's opening definition denied too much and was corrected.** It defined
embedded as "against a file the application owns, on a machine the application does not",
and all seven techniques were transactional-embedded disciplines. Two clarifications
added: *embedded* is a **placement, not a location** (server-side accelerator, CLI step,
sandboxed runtime all qualify; the duties enumerated are the end-user placement's, which
is the hardest one), and form factor is **independent of workload shape**.

Gained `analytical-reads-off-the-serving-store` (8th technique) + a `node` application.
The technique's strongest claim is not from the source: **an analytical read routed
through a single-writer store buys the entire contention surface of
`single-writer-holder-discipline` for a workload that never needed exclusion**, and the
tell is an operating instruction rather than a benchmark — an analysis script that must
run against a copy because something holds the store. Two connected trees carry that
instruction verbatim, and one of them pays it to benchmark the incumbent at all.

## Open leads (added 2026-08-27)

- **The remote-scan case is unaddressed.** The new technique assumes the analytical
  engine reads a local export. An in-process columnar engine scanning object storage
  changes the freshness contract and reintroduces a wire the technique's argument
  assumes away. Return when a connected project's analytical path reads remote objects.
- **Storage-decision-names-its-call-site** (proposed rule, not added). A storage decision
  that was measured, documented and never landed is invisible to every gate. May belong
  to an engineering-process subject rather than here — see open question 4 of
  `docs/subject-proposal-storage-engine-selection.md`.

## Cross-bundle boundary (do not link)

`llm-observability/analytics-store-design/analytical-copy-partitioning` holds the same
fork from the other end: it shapes the derived copy, this subject decides which reads
leave the serving store. Same fork, opposite ends, discriminator stated in prose on each
side. Neither absorbs the other; cross-bundle links are forbidden.

## 2026-09-01 - fate recorded for the maturity ladder

Hint fate (from [[2026-08-22-2]] and the application's own close): **confirmed** - both journaling families realized, sidecar set named and exposed as API; the worker's citation re-check caught 7+ drift errors including two wrong test-file counts. Counterpart sqlite/sqlite @ 45f4f1c (3.54.0). Recorded by [[2026-09-01-1]] so the subject meets the `reconciled` definition in [[standard]]; nothing else changed.
## 2026-09-01 - intake [[2026-09-01-matrix-rust-sdk]]

`journal-and-durability-modes` gained "name the set from the engine": the
file-set clause said delete/reset removes the whole sidecar set, and a source
showed it honored in intent and missed in fact (`.wal` where the engine writes
`-wal`; the rebuilt store opened beside the stale journal and failed with a
bare I/O error). Sidecar names are derived by appending to the FULL file name;
the path library's extension swap is right only for the conventional name; one
test opens a store named without the extension and asserts the sidecar. Applied
at `code`, `ab-paired` 2/6 vs 6/6 over store names, **shipped** to the rust
consumer with the test (rust application). Third application for the subject's
journal technique, first on the rust stack.

## 2026-09-02 - `/intake` hermes-agent (run `intake-hermes-0902`, intake 2.1.1, Opus workers)

New technique `corruption-class-response`: the corruption CLASS decides the response - a corrupt derived index detaches (drop triggers, mark stale, serve the slow path) and keeps writing; bare structural corruption quarantines the handle and stops writing, because a handle that kept writing ~50 minutes after the first structural error checkpointed pages under wrong numbers and turned a readable file into one that would not open. None of the eight existing techniques stated the split (extension-lifecycle applies the derived/canonical distinction to what to store, not to what a damaged handle may do). Source-tree application `python--corruption-class-response`. Fleet seams by scope: pumper and tracklight both admit the force; the fleet map lists both as present for the subject, so the next step is a registry-map state on the pair, not a proposal.

## 2026-09-23 - `/deepen` currency lane ([[2026-09-23-3]])

`python--corruption-class-response` came up on its own `refresh_by` clock (2026-10-15). All ~30 anchors re-resolved against the upstream agent tree at HEAD (13,043 commits past the first read) and `verified_on` moved; the `refresh_by` override was kept (the tree moves far faster than the derived python window) at the same 43-day span. Upstream moves recorded in the application, none contradicting it: the FTS-scoped corruption check consolidated into one shared predicate, the deferred FTS retry now skips quarantined handles, and a keep-open-through-shutdown path that applies only when the WAL files were removed. Two of our own anchors were corrected (a method name and the write site of the stale marker). No technique edit. Proposal: none.

Impact: no judged verdict moved.

## 2026-11-16 - `/deepen` loop (run `filler-deepen-20261116b`, /shift filler)

Dispatched for one expired clock: `python--corruption-class-response` (override 2026-11-05). Three rounds; round 1 landed, rounds 2-3 dry.

#### Round 1 (survey round)

**Not dry; no new technique.** Read lane over the upstream agent tree at `4162ecf1` (2026-11-15, shallow clone) and personas at `8d076db46a`; counter-evidence against the engine's own pages (sqlite.org pragma, wal, wal_checkpoint_v2, dbconfig, rescode, lang_vacuum; duckdb.org concurrency; the Python sqlite3 page), all opened 2026-11-16; a blind lane written before any search.

- `corruption-class-response` **flipped (condition added)**: the canonical verdict belongs to the file, not to the handle that saw the error. The agent tree moved its quarantine to a path-keyed process latch that readers publish into and that "no marker is written to disk" for, because the file it would describe is the damaged one; the blind lane reached both halves on its own (key on the file; never store the verdict inside it). Where it must outlast a restart, the marker sits beside the store (personas does this to hold backup rotation).
- `quiet-window-maintenance` **flipped (condition added)**: a checkpoint that returned success has not necessarily completed. Banked since 2026-08-22; now converged: the C application's own source read, the engine's pragma page (the result column is 0 for PASSIVE whatever it left, 1 only for a blocked FULL/RESTART/TRUNCATE) and the blind lane. The pass record carries frames logged against frames folded, "partial" when they differ, and the harm bound reads the sidecar's size.
- `journal-and-durability-modes` corrected: the middle sync level under write-ahead journaling may lose the last commits on a power cut *or an OS crash* ("might roll back following a power loss or system crash", sqlite.org/pragma.html); the text had it surviving OS crashes. The blind lane had it right.
- `analytical-reads-off-the-serving-store` scoped: the no-contention argument holds for a plain export or a read-only open; a columnar engine's own file opened read-write is one process at a time (duckdb.org concurrency page).
- `python--corruption-class-response` re-resolved: every quotation found, every claim held; anchors re-pinned; python@3.14; `refresh_by` 2026-12-29 (same 43-day override). Upstream moves: the file-keyed latch, a reopen exception for a replaced file, the detach waiting out a busy lock on the write budget. Four of our own anchors corrected.
- `node--analytical-reads-off-the-serving-store`: the ratios are now framed as one dated measurement with the per-median run count not carried (the source tree is out of scope on this machine, so not re-read; `verified_on` stands).

Confirmed and left untouched: the 1000-page auto-checkpoint on the committing thread; WAL persistence in the header and the sync level per connection; the silent fallback when a mode cannot be set (the old mode is returned); WAL not working over a network filesystem; checkpoint-on-close enabled by default and the switch reaching Python only on 3.12; a virtual table "might" return the vtab corruption code (so absent provenance defaulting to canonical is right); the go application's multipliers (code constants pinned to a commit, not measurements); the node single-writer application's figures (dated single incidents).

Applied: `corruption-class-response` **not-better** (personas already keys the quarantine on the canonicalised path and keeps its marker beside the store); `quiet-window-maintenance` **unmeasurable** (two personas checkpoint sites log "completed" on a call that cannot report a blocked TRUNCATE as an error; whether a reader is open during the idle pass was not measured); `analytical-reads` unapplied (no fleet tree opens an analytical copy).

Banked: VACUUM under write-ahead journaling writes the overwrite through the journal, so the "up to double" disk figure may understate the transient peak until a checkpoint (one page, inference); readers in personas do not publish a structural error into the latch. The remote-scan case and "sidecars outlive connections" stay banked: no new evidence.

#### Round 2

Dry. Blind answers on pool sizing to one writer, reclamation not shrinking the file and needing up to twice the disk (sqlite.org/lang_vacuum.html), and recycled journal segments after a checkpoint all matched the text.

#### Round 3

Dry. Extension registration before the pool, single-digit-millisecond "slow" for a local store, the golden path's file-set clause and silent fallback: all confirmed, none earned. dry=2; the loop idles until 2026-12-29 (the agent-tree override) or an event.

Impact: not computed. The map regeneration is the Director's step 4 and was not run here.
