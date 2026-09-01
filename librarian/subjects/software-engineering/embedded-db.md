---
subject: embedded-db
domain: software-engineering
last_touched: 2026-08-27
dry_streak: 0
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
