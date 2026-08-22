---
layer: application
type: application
subject: migrations
technique: error-propagation
stack: go
verified_on: 2026-08-22
---

# Error propagation in golang-migrate

How the most widely deployed standalone migration runner in the Go ecosystem
realizes the error-propagation technique. Citations are against
`github.com/golang-migrate/migrate/v4`, commit `18966c7` (2026-07-05, `master`;
newest tagged release `v4.19.1`, module `go 1.25.0`). This reconciles an
external tree, not the consumer repo the sibling applications cite, so the pin
lives in prose rather than in `verified_against`, whose contract is a stack
runtime version. The setting is the technique's easier half — an operator tool —
but golang-migrate is embedded in application startup as often as it is run as a
CLI, so the boot contract applies to it directly.

## 1. The halt is the entire shape of `runMigrations`

`runMigrations` (`migrate.go:723-772`) is a `for` over a channel in which every
exit is a `return` on the first bad thing seen: an `error` arriving on the
channel is returned verbatim (`:731-732`); a failing `SetVersion` returns
(`:738-740`, `:750-752`); a failing `Run` returns (`:744-746`); an unrecognized
payload returns a typed complaint rather than being skipped (`:767-768`). No
`continue`, no recovery, no accumulation — the technique's "no mercy clauses in
the chain" is here structurally inexpressible.

## 2. The dirty flag: outcome 3 written into the ledger, not just the log

The strongest thing in this tree is that the technique's third boot outcome
survives process death. Around each step the runner writes the ledger twice:

```go
SetVersion(migr.TargetVersion, true)   // migrate.go:738 — before the body runs
databaseDrv.Run(migr.BufferedBody)     // :744
SetVersion(migr.TargetVersion, false)  // :750 — clean, only on success
```

A failed step — or a process killed mid-step — leaves `dirty = true` persisted
beside the version. "Failed at step *j*" is not a transient message on a console
nobody attached to; it is a fact in the store, readable by the next boot. That
is a stronger answer than the technique's own framing, which assumes the runner
is alive to report. The recorded number is the step's *target* version, so the
durable reading is "attempting *j*, unfinished". Repair is separately named,
never a side effect of running again: `Force` "does not check any currently
active version" and "resets the dirty state to false" (`migrate.go:362-379`).

## 3. Refusal is a distinct verdict, spelled at every entry point

Every command that would advance the chain re-reads the version and refuses on
dirty: `Migrate` (`migrate.go:222-224`), `Steps` (`:248-250`), `Up` (`:275-277`),
`Down` (`:297-299`), `Run` (`:335-337`) — five entry points, one guard, no way
around it. The verdict is typed and carries the version: `ErrDirty` (`:48-53`),
message `"Dirty database version %v. Fix and force version."` The sentinels
`ErrNoChange`, `ErrNilVersion`, `ErrLocked`, `ErrLockTimeout`,
`ErrInvalidVersion` (`:29-34`) are the rest of the vocabulary, and
`ErrNilVersion` keeps "never migrated" apart from "nothing pending" (`Version`,
`:383-394`) — outcome 1 split from its degenerate cousin.

## 4. The store's own words reach the operator

`database.Error` (`database/error.go:8-27`) is a four-field envelope —
`OrigErr`, `Err`, `Query`, `Line` — and the Postgres driver fills all four: it
converts the server's byte `Position` into line and column
(`database/postgres/postgres.go:301-305`), prefixes `"migration failed: "` plus
the server's own `Message` and `Detail` (`:306-312`), and attaches the failing
statement (`:313`; `:315` for the non-`pq` fallback). That is "operation in
flight" and "underlying error verbatim", plus a line number into the migration
file; the CLI exits non-zero on any of it (`internal/cli/log.go:37-44`).

## 5. Deviation — a source read failure is logged, then recorded as success

Migration bodies are prefetched in goroutines, and at all **nine** call sites
the buffering error is only logged (`migrate.go:352-354`, `:443-445`, `:471-473`,
`:497-499`, `:517-519`, `:570-572`, `:618-620`, `:683-685`, `:708-710`, each the
shape `if err := migr.Buffer(); err != nil { m.logErr(err) }`).

`Buffer` (`migration.go:122-165`) returns early on a `Peek` failure (`:148-150`)
or a partial `WriteTo` (`:156-159`), and its `defer` closes the pipe writer with
a plain `Close` (`:135`) rather than `CloseWithError` — indistinguishable from
end-of-input, so the reader sees EOF. `runMigrations` then hands `Run` an empty
or truncated body; Postgres treats a blank statement as success
(`postgres.go:292-294`, `strings.TrimSpace(query) == ""` → `return nil`); and
`:750` writes `dirty = false` at that step's version. **The ledger now states
that a step ran which never ran** — or ran halfway — and the process exits 0:
the forbidden "log the error but mark the step done", arriving as a plumbing
accident rather than a policy choice, and permanent, because a ledger advanced
past reality can never again be distinguished from an honest one.

## 6. Deviation — two more collapses of outcome 3 into outcome 1

**Graceful stop.** `runMigrations` checks `m.stop()` before each step and returns
`nil` when set (`migrate.go:726-728`); `read` does the same and stops producing
(`:453`, `:483`, `:550`, `:662`); the CLI wires SIGINT to that channel
(`internal/cli/main.go:138-147`). Ctrl-C partway through a five-step chain
returns no error and exits 0, its only evidence a `"Stopping after this running
migration ..."` line on stderr. The store is left clean at an intermediate
version, which is *safe* — but "applied everything pending" and "stopped after
two of five" become one spelling, indistinguishable to any script.

**A missing ledger.** `Postgres.Version` maps an absent migrations table to
`NilVersion, false, nil` (`postgres.go:396-400`, on `undefined_table`), beside
the legitimate empty-table case (`:393-394`). The table is created at open
(`ensureVersionTable`, `:453`), so later absence means something removed it — and
the runner answers "no migration has been applied", offering to replay the whole
chain against a possibly-populated database. The technique's instrument
assertion is missing at the one layer that could make it. Smaller instance: the
CLI compares `err != migrate.ErrNoChange` by identity, not `errors.Is`
(`internal/cli/commands.go:152`, `:163`, `:170`, `:182`, `:189`) — safe only
while `ErrNoChange` travels unwrapped, and `unlockErr` (`migrate.go:951-958`)
already `errors.Join`s onto it.

## 7. Not present by scope

No snapshot, so the "where the snapshot is" field has nothing to name. No
telemetry path: diagnostics go to `m.Log` or nowhere (`migrate.go:974-979`), and
`Log` is nil unless the embedder sets it, so a library consumer that forgets it
loses every non-returned diagnostic — including all nine buffering errors above.
No retry policy, correctly: halt plus the dirty flag makes retry-on-next-run an
explicit operator act.

## Reconciliation summary

Confirmed: unconditional halt with leniency structurally inexpressible; the
failed-state verdict persisted in the ledger rather than only reported; refusal
as a typed, version-carrying error at all five advancing entry points; repair as
a separately named operation; the store's verbatim error, failing statement and
line number carried to the operator; non-zero exit. Deviations: buffering errors
swallowed at nine sites, able to write a false "applied" into the ledger and
exit 0; graceful stop returning `nil`; a missing ledger table reported as a
fresh store. Not present by scope: snapshots, telemetry, retry policy. The
standard stays; the deviations are the finding.
