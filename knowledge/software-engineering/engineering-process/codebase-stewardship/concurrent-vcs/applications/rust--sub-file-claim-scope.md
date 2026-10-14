---
layer: application
type: application
subject: concurrent-vcs
technique: sub-file-claim-scope
stack: rust
status: forged
verified_on: 2026-10-14
---

# A claim scheme that locks functions, read against the price list (Rust)

Read in the `rtk-ai/grit` tree (crate version 0.4.0, commit
`0f3c9d04abe9525b1884f3a0ade890e54a6d9ffe`), a command-line coordination layer
that lets several coding agents work on one repository at once by claiming
syntax-tree symbols instead of files. The tree pins no compiler version (its CI
installs the current stable toolchain), so no `verified_against` is written.
Every citation below was opened in a clone on 2026-10-14; the quoted fragments
are checkable with `check-anchors` against that commit.

**decision.** The unit of a claim is a function, method, class or other symbol
parsed from the source, not a path. A claim is a blocking lock with a time to
live, renewed by a heartbeat; a refused claim lists the free symbols in the same
file, and can queue or wait with backoff.

**forces.** The project's premise is many agents editing one codebase in
parallel, routinely inside the same file. A path lock would serialize them; the
line-level merge would have combined their edits.

**buys.** Parallelism inside a file, and a refusal an autonomous agent can act
on.

**rejects.** Path or file claims, and an advisory ledger nobody enforces.

## What the tree does that the technique asks for

- **Leases, not bare locks.** Every lock row carries a time to live and the
  `heartbeat` command renews it; expired rows are deleted inside the claim
  transaction (`src/db/sqlite_store.rs:73-77`).
- **The refusal carries the alternative.** A blocked claim prints the unclaimed
  symbols of the same files (`src/cli/mod.rs:603 "let available = db.available_symbols_in_files(&files)?;"`).
- **All-or-nothing inside the timed wait.** Between retries the session releases
  what it was granted (`src/cli/mod.rs:625 "(all-or-nothing: either all symbols are claimed or none)"`).

## Where each hole is open

- **Identity.** Units are keyed by file and bare name
  (`src/parser/mod.rs:357 "id: format!("`), and the symbol table upserts on that
  key, so a type and its implementation block become one row and two same-named
  methods in different classes become one lock.
- **Containment.** The lock table is flat (`src/db/mod.rs:92-100`); a claim on a
  class and a claim on one of its methods are independent rows and both are
  granted.
- **The remainder.** Nothing claims the import block or a file header. The
  project's own benchmark prepends a header line to every touched file
  (`scripts/lib/common.sh:89 "forces merge conflicts when multiple agents touch same file"`),
  which is a remainder edit in both arms; the tool arm's failure counter reads
  unresolved conflict markers after the tool has already aborted the merge
  (`scripts/sweep/bench.sh:146 "grep -c"`), and the chart script draws the tool's
  failures from a literal (`tests/gen_graph.py:50 "grit_fail =    [0,    0,    0,    0,    0,    0]"`).
  The published zero-failure line is therefore not a measurement, and the
  remainder conflicts it would have shown are the hole this section is about.
- **Creation.** A claim on a symbol that is not in the index fails the lock
  table's reference to the symbols table; the fix for that only turned the raw
  constraint error into advice to re-run the indexer
  (`src/db/sqlite_store.rs:12-23`).
- **Index currency.** Symbols are indexed once, at `init`, and the source's own
  deferred list records that re-running `init` leaves stale rows for removed
  symbols (commit `db8b0685`). Line ranges are never refreshed after a merge.
- **Dependents.** The optional `--with-deps` claim takes shared locks on every
  transitive callee, resolved by bare name (`src/parser/mod.rs:104-114`), so
  every same-named function anywhere in the tree is locked as a dependency.
- **Multi-unit acquisition.** Without `--wait`, or once the wait expires, the
  session keeps the symbols it was granted and returns an error for the rest; with
  `--queue` it also enqueues for the rest (`src/cli/mod.rs:612 "return if blocked.is_empty() || queue {"`),
  which is hold-and-wait. Symbols are tried in the order the caller gave them.

## A defect the replay found beside the holes

The embedded-database backend grants a shared-to-exclusive upgrade beside other
readers: when the requesting agent already holds any row on the symbol it
updates that row's mode without looking at the others
(`src/db/sqlite_store.rs:99 "existing.iter().any(|(a, _, _)| a == agent_id)"`).
Replaying the backend's statements in order with an embedded database on
2026-10-14 (A shared, B shared, A exclusive) granted A and left rows
`[(A, write), (B, read)]`; a positive control (A exclusive, then B exclusive)
blocked as expected. The object-store backend of the same interface refuses that
sequence. The full record is in the concurrency-guards path's
`shared-claims-by-announce-and-verify` application.

## What this realization cannot do

It cannot tell whether two agents' edits will conflict, only whether they named
the same row. Its enforcement is the claim itself: nothing at merge time compares
what an agent changed with what it claimed, although each symbol's content hash
is computed and stored (`src/db/mod.rs:89 "hash        TEXT"`) and never read
again.
