---
layer: application
type: application
subject: transactions-over-a-replicated-log
technique: compose-then-conform
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# The crosstest matrix (OpenBao, Go source tree)

OpenBao at `6b5f82e1` holds its differential conformance suite in
`internal/physical/crosstest/cross_test.go`. The RFC promised it in one
sentence (`website/content/community/rfcs/transactions.mdx:351`: "a
cross-storage engine test suite to differentially compare various engines
... differential fuzzing of operations in the future"); the tree delivers
both halves. This application records how the matrix is built, what it
diffs, the one divergence it tolerates, and how the two transactional
backends detect a leaked handle.

## The matrix: every backend, every wrapper, every position

`allPhysical` (`cross_test.go:157-313`) returns twenty-four named
backends. The engines are raft (with a `pure-raft` instance on which no
transaction is ever begun, `:275`), file, in-memory with transactions
disabled, in-memory with transactions, and PostgreSQL. The wrappers are
the cache (`physical.NewCache`) and the key encoder
(`physical.NewStorageEncoding`), alone and stacked
(`raft+cache+encoding`, `:253-256`). The positions are what the technique
calls "every position", and the tree names them with a naming scheme:
`raft-in-tx+cache` is the cache wrapped around an open raft transaction
(`:208-211`), `raft+cache-in-tx` is a transaction begun through the cache
(`:203-206`); the same pair exists for the encoder (`:230-238`). The
comment at `:172-176` states the property being tested: "Inside a raft
transaction should behave the same as outside if it is writable." The
transactional matrix (`allTransactionalPhysical`, `:315-355`) holds the
subset that can begin a transaction, and `Test_ExerciseTransactionalBackends`
(`:100-140`) runs the whole scripted sequence three times - inside
writable transactions that are rolled back, inside read-only ones, and
inside writable ones that are then committed - so the same trace is
observed with the transaction as a wrapper.

## Differential, with the in-memory backend as the silent reference

Every `allDoSame*` helper (`:464-687`) runs one operation on every backend
and diffs results pairwise against whichever backend the map iterated
first (`:464-494` for lists; `:587-627` for gets), reporting both names,
both values and the diff. `exerciseBackends` (`:690-843`) is the scripted
sequence: empty root, delete of a missing key, put/get/list round trips,
nested entries and folder listing, prefix deletion leaving no artifacts,
and exhaustive pagination over ten keys with every `after` and `limit`
combination (`:804-841`). `exerciseTransactions` (`:845-958`) is the
transaction-shaped script and reads as the conflict taxonomy's test
vector: commit and rollback twice in every order fail the second time
(`:851-881`); empty transactions interleave (`:883-887`); a read-only
transaction refuses writes and its commit leaves storage untouched
(`:889-896`); same-value puts in two transactions conflict the second
committer in both commit orders (`:898-915`); disjoint keys do not
conflict (`:917-925`); read-then-write across two transactions on crossed
keys fails exactly one (`:927-950`).

The random half is `getRandomOps` (`:961-1084`) and
`executeRandomTransactionalOps` (`:1111-1224`). The generator draws from a
small alphabet - nineteen file paths including two deeply nested ones
(`:979-999`) and nine folder prefixes (`:1001-1009`) - so collisions are
frequent, and assigns each operation to one of ten transaction slots or
to direct storage (`rand.Intn(txLimit+1) - 1`, `:1040`). Begin on an
occupied slot rolls the prior transaction back (`:1147-1160`). Divergence
is detected per operation on error-or-not (`:1173-1183`), list contents
(`:1185-1203`) and entry contents (`:1205-1219`), and the failure names
the operation index. The reproduction artifact is not a seed: the ops are
serialized to a JSON file before execution (`:1112-1116`) and the file is
removed only on success (`:1223`), with a `replayOps` call left commented
at `:86` - an upward lesson for the technique, which had assumed a seed
was the natural handle.

## The one tolerated divergence

`allDoSameListNoBenchmark` (`:464-494`) and the transactional replay
(`:1196-1198`) both carry the same guard: when both results have length
zero, skip the comparison. The comment at `:484-486` declares it and names
the culprit - "This trips up the file backend, where everyone else returns
nil after deletion of an entry, but file returns an empty list." That is
the technique's declared equivalence, present in the comparison function
and nowhere else; the same rule appears in `allDoSameListPageNoBenchmark`
(`:520-550`) because the tree has two list comparators rather than one,
which is the small drift the technique warns about.

## What a wrapper must do to pass: the cache

`sdk/physical/cache.go` is the wrapper whose transactional behaviour the
matrix most constrains. `BeginTx` through the cache begins the underlying
transaction and clones a fresh, smaller cache over it
(`:265-271`, `:292-306`; size divided by `TransactionCacheFactor =
DefaultParallelTransactions`, `:22-24`, a derived limit). Commit
(`:362-387`) commits the inner transaction and then evicts every key the
transaction modified from the parent cache rather than updating it; the
comment at `:367-373` gives the reason - without a global lock "we cannot
tell if another modification to our key has occurred between when we
committed the underlying storage transaction (above) and when we go to
update this cache. Thus, removing the value from the cache is the most
optimal strategy". Rollback (`:389-397`) touches the parent not at all.
The encoder (`sdk/physical/encoding.go:113-145`) is the transparent case:
begin, commit and rollback pass straight through, and the wrapper's only
transactional obligation is to apply its key check inside the transaction
exactly as outside.

## Leak detection: two backends, two records

Both transactional backends register a `runtime.AddCleanup` finalizer at
begin. The raft transaction (`internal/physical/raft/transaction.go:234-267`)
logs the transaction's start index and the sets of keys it read, wrote
and listed - `TestRaft_TransactionLeak`
(`internal/physical/raft/raft_test.go:132-196`) pins the exact key sets -
and then releases the FSM read lock, the permit and the bbolt snapshot
(`:263-266`). The relational transaction
(`internal/physical/postgresql/transaction.go:48-67`) captures a 2 KiB
stack at begin and logs that. So the dispatch's "logs its birth stack" is
true of the relational backend and not of the replicated one, which
substitutes what the transaction touched for where it was born; both are
enough to find the leak, and the technique now names either as
acceptable. Both backends rate the log by count - the first leak at error
level, subsequent ones at debug, via an atomic counter (`transaction.go:239-241`,
`postgresql/transaction.go:54-56`) - so one leaking path does not flood
the log, which is the second upward lesson folded into the technique.
