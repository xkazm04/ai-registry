---
layer: application
type: application
subject: data-access
technique: transactions-and-units-of-work
stack: node
verified_on: 2026-08-22
---

# Units of work in the Prisma v8 SQL runtime (Node)

How Prisma's rewritten SQL runtime realizes the units-of-work technique.
Citations are against `prisma/prisma` commit `dd6c12b` (2026-08-21), monorepo
version `8.0.0-rc.4`, packages `2-sql/5-runtime`, `3-extensions/sql-orm-client`,
and the target facades under `3-extensions/`. This reconciles an external tree,
not the consumer repo the sibling applications cite, so the pin lives here in
prose rather than in `verified_against`, whose contract is a stack runtime
version.

## 1. The scope is a value, and the operation never opens anything

The technique's first structural fix — *pass the scope explicitly* — is the
shape of this runtime. `RuntimeScope`
(`packages/2-sql/4-lanes/relational-core/src/runtime-scope.ts:23-26`) is two
methods, `query` and `execute`; `RuntimeQueryable`, `RuntimeConnection`,
`RuntimeTransaction` and `TransactionContext` all extend it
(`packages/2-sql/5-runtime/src/sql-runtime.ts:100-141`). Every ORM operation
takes a scope it cannot distinguish from a plain connection, so nesting is
unrepresentable: the operation has no `begin` to call. The layering is stated,
not merely observed — `ExecutionContext`
(`packages/2-sql/4-lanes/relational-core/src/query-lane-context.ts:102-127`)
*"explicitly excludes runtime concerns like adapters, connection management,
and transaction state."* Only a connection can begin a boundary: `Runtime`
exposes `connection()` and no `transaction()` (`sql-runtime.ts:100-114`), and
`RuntimeConnection.transaction()` (`:117`) is the single door, implemented at
`:757-759` over the driver's `beginTransaction()` (`wrapTransaction`,
`:820-880`).

## 2. The boundary is a callback scope, and rollback is the default path

`withTransaction` (`sql-runtime.ts:961-1087`) is the unit of work; the boundary
owner is the function, not the caller's discipline. *Rollback is the path on
any error* is implemented as scope exit rather than per-branch cleanup: any
throw from the callback runs `transaction.rollback()` (`:1046`) and rethrows
the original error, and the commit (`:1063`) is reached only by falling off the
end of the callback. The facades re-export this one implementation — Postgres
`packages/3-extensions/postgres/src/runtime/postgres.ts:341-372`, SQLite
`packages/3-extensions/sqlite/src/runtime/sqlite.ts:296-342` — one boundary
implementation in the product, not one per target. Both wrap the context with
`Object.create(txCtx)` rather than a spread, reason written down
(`postgres.ts:361-364`): spreading would evaluate the live `invalidated` getter
once and freeze it. The guard in §4 works only because the facade refused the
convenient spelling.

## 3. Failure *of the boundary* is classified, and the connection is evicted

Here the tree exceeds the technique as drafted: a commit or rollback that
itself fails leaves the connection in an indeterminate protocol state, and
pooling it spreads one transaction's failure across every later caller. So
rollback failure after a callback error destroys the connection (`:1048`) and
raises `RUNTIME.TRANSACTION_ROLLBACK_FAILED` (`:1050`) with the *original*
error as `cause` — the boundary failure never masks why the callback aborted.
Commit failure attempts a best-effort rollback (`:1069`) before raising
`RUNTIME.TRANSACTION_COMMIT_FAILED` (`:1074`); the comment at `:1065-1067`
enumerates the three server states a failed `COMMIT` can leave behind and
argues that a *succeeding* rollback proves the connection round-trips and is
safe to pool, so only a failing rollback destroys it (`:1071`). The disposal
verbs carry the rule at the interface — `release()` "only when the connection
is known to be in a clean state", `destroy(reason)` "evicts the connection so
it is never reused" (`:118-129`); the healthy path releases in a `finally`
(`:1083-1084`).

## 4. Escaping the boundary is refused, not silently allowed

A streaming API makes it easy to hold a result past the transaction that
produced it. `invalidated` flips to `true` in a `finally` the moment the
callback returns (`:1059`), and every entry point on the context — `query`,
`execute`, and both prepared-statement bridges — checks it and throws
`RUNTIME.TRANSACTION_CLOSED` (`:948-954`). The check is re-run *between yields*
inside `guardedStream` (`:970-982`), so a half-drained cursor fails at the next
row rather than reading through a closed transaction.
`test/prepared-closed-transaction.test.ts:17-22` exists because the prepared
bridges "reach the driver by a different route than `tx.query` / `tx.execute`
and so need their own guard".

## 5. Side effects wait for commit — enforced by scope, not convention

The "cache primed with rolled-back state" hazard is closed structurally. Every
execution carries a `scope` tag stamped by the runtime — `'runtime'`,
`'connection'`, `'transaction'` (`sql-runtime.ts:773`, `:782`, `:837`, `:846`)
— and the cache middleware bypasses itself entirely when `ctx.scope !==
'runtime'`
(`packages/3-extensions/middleware-cache/src/cache-middleware.ts:165-167`, doc
`:118-122`); its buffer commits only on `result.completed === true &&
result.source === 'driver'` (`:112-116`). Rows read inside a transaction never
reach a shared cache. `test/scope-plumbing.test.ts:34-45` pins the tag on all
three surfaces so "a regression in scope plumbing surfaces here rather than via
a confusing cache-coherence bug".

## 6. Deviation: the second boundary wrapper is weaker than the first

The ORM mutation path does not use `withTransaction`. `withMutationScope`
(`packages/3-extensions/sql-orm-client/src/mutation-executor.ts:165-192`) opens
its own connection and calls a local `runInTransaction` (`:194-210`) whose
entire error handling is `rollback(); throw error` (`:204-208`). Three
properties from §3 are missing. A rollback that itself throws replaces the
original error with no `cause` chaining, losing the reason the mutation graph
aborted. Nothing is ever destroyed — whatever state the connection is in after
a failed commit or rollback, the `finally` at `:186` calls
`connection.release?.()` and pools it, the exact poisoning the sibling wrapper
spends thirty lines avoiding. And the guards are optional-shaped (`typeof
transaction.commit === 'function'`, `:200`, `:205`), so a scope missing
`commit` yields a silent uncommitted "success". The standard stays: one
boundary implementation, or two that agree.

## 7. Deviation: the ambient join happens by shape, not by type

Composability works — an ORM built inside a transaction is handed a runtime
with only `query`/`execute` (`postgres.ts:349-359`), so `withMutationScope`
falls past both `typeof` checks and runs on the caller's scope
(`mutation-executor.ts:191`), joining the ambient transaction as the technique
wants. But that production path is the branch commented *"Bare runtimes (e.g.
unit-test stubs) expose neither: run directly"* (`:190`). The discriminator is
duck-typing on method presence, and nothing separates "already inside a
transaction" from "this runtime cannot open one" — a scope of the second kind
runs a multi-statement mutation graph non-atomically and says nothing. Behavior
right, discriminator wrong.

## 8. Not present by scope

No savepoints or nested-transaction spelling anywhere, so the technique's
second composability fix is unexercised — defensible when the first is total.
No isolation-level argument on `transaction()` on any target, leaving
read-modify-write half-served: the compare-and-set half is present, since
`execute` returns `SqlStatementStats.affectedRows`
(`packages/2-sql/4-lanes/relational-core/src/ast/driver-types.ts:24-26`) and
the ORM returns it as the operation's result
(`packages/3-extensions/sql-orm-client/src/collection.ts:2036`, `:2225`), so a
conditional write's verdict is available rather than discarded. No outbox: this
layer owns no queue, and that form lands on the application above it.

## Reconciliation summary

Confirmed: scope passed as a value with no `begin` on the operation; one
callback-scoped boundary shared by every target; rollback as the default exit;
errors reaching the boundary owner unwrapped; side effects gated on scope
rather than convention; use-after-boundary refused mid-stream. Exceeded:
boundary-failure classification with connection eviction — a rule the technique
should carry. Deviations: a second, weaker transaction wrapper on the ORM
mutation path that loses error causes and pools suspect connections; the
ambient join discriminated by method presence rather than type. Not present by
scope: savepoints, isolation levels, outbox.
