---
subject: migrations
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# migrations

First touch: [[2026-08-22-2]], external reconcile against `golang-migrate/migrate`
@ `18966c7` (v4.19.1 era). Gained `go--error-propagation` — second stack; the
single-stack debt is cleared.

## Open leads (banked, convergence rule applies)

- **Persist the verdict, don't just report it** — the dirty flag as a durable
  ledger field beside the version. SECOND SIGHTING already exists (SQLite's
  page-1 journal byte, same wave): first candidate for a technique edit.
- Record the attempted version, not the last-completed one — names what manual
  repair must do.
- Refusal enforced at every advancing entry point (five public verbs, one guard
  each) — one unguarded verb voids the flag.
- Close streams WITH their error — a plain close converts a source failure into
  a valid-looking empty payload and thence a ledger lie.
- Interruption is a fourth outcome ("stopped, work remains"), not success.

## Cross-subject proposals (for owning subjects)

- Pipe/stream boundaries closed with their error → a resilience-side home.
- Nil-by-default library logger = diagnostics not propagated → observability.

## Applied to the technique layer

- 2026-08-22-3: **persist the verdict** applied to `error-propagation` ([[2026-08-22-3]]).
- 2026-08-22-10: `error-propagation` now cites the promoted `unknown-is-not-a-value` law ([[2026-08-22-10]]).

## 2026-09-01 - fate recorded for the maturity ladder

Hint fate (from [[2026-08-22-2]] and the application's own close): **confirmed** - unconditional halt with leniency structurally inexpressible, failed-state verdict persisted in the ledger, refusal a distinct typed verdict at every entry point. Counterpart golang-migrate/migrate @ 18966c7. Recorded by [[2026-09-01-1]] so the subject meets the `reconciled` definition in [[standard]]; nothing else changed.
## 2026-09-03 - `/intake` lightrag (run `intake-lightrag-0902`, intake 2.2.0, Opus workers)

New technique `migrate-from-data-shape`: when half the backends have no atomic home for a version marker, the migration decides from the shape of the data it finds; `schema-drift-detection` is the two-authority problem and presumes a replayable step chain with a recorded version - this is the zero-marker answer, where the convergence test and the boot assertion transpose and the integrity sweeps carry over.

## Intake 2026-09-05 (`intake-utopia-0905`, source `github:deeplethe/utopia`)

**Two golden-path amendments, both boundary cases:** § "Two roads" gained the merge as
a third road (a version-indexed runner plus a file-level merge: two branches each add
step 25, both green, the merged chain never ran; refuse duplicate numbers explicitly and
run the chain on a fresh store in the pipeline, twice). § "The drift class nobody's
compiler catches" gained the nullable column as a second member (`<>` against null
selects nothing and raises nothing; inner joins become silent filters; a nullability
migration is a query audit with a database-backed test on the mostly-null paths).

**Applied to personas as an experiment, unmeasurable:** its migrations are Rust modules
in one registry list, so a duplicate is a compile error and the merge boundary does not
apply; the 22 `<>`/`!=` comparisons found are against keys and NOT NULL columns as far
as this run could read without the schema in hand. Instrument that would measure: a
schema-aware audit of each comparison column's nullability.
