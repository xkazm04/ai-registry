---
layer: application
type: application
subject: transactions-over-a-replicated-log
technique: snapshot-read-plus-verify-log
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# A bbolt snapshot beneath a Raft log (OpenBao, Go source tree)

OpenBao at `6b5f82e1` implements interactive transactions on its integrated
storage backend: hashicorp/raft above go.etcd.io/bbolt, one FSM per node.
The RFC (`website/content/community/rfcs/transactions.mdx`) is the design
argument; `internal/physical/raft/transaction.go` is the caller-side
transaction; `internal/physical/raft/fsm.go` is the apply side. This
application records where the tree confirms the technique, where it goes
further, and two alternative designs in the same tree that make the
trade-off legible.

## The prohibition, argued in the RFC

The RFC's "Implementing Writable Transactions" section lays out three
designs and names the failure the technique opens with. Designs 1 and 2
hold or persist the bbolt write transaction across the Raft round trip;
the RFC's verdict at `transactions.mdx:109` is that "problems with Raft
could result in the bbolt transaction being held indefinitely, even when
the application thinks they have attempted a commit". Design 3 - roll the
local transaction back, convert reads to verifications, ship
verify-plus-write - is chosen, with the cost stated in the same paragraph:
more conflicts under parallel writes, and log entries that grow with the
read set. The forces the RFC cites are the technique's premises verbatim:
bbolt admits one write transaction and no upgrade or nesting
(`transactions.mdx:52-54`); only one node writes cluster-wide, "so we do
not need any distributed locking mechanism" (`:60`); and the server is
co-located with its data, unlike the one-shot APIs of etcd and rqlite
(`:74`), which is what makes a local read snapshot available at all.

## Begin: index, then snapshot, then a read-only bbolt transaction

`newTransaction` (`internal/physical/raft/transaction.go:193-270`) takes a
transaction permit (`:198`, pool sized by
`physical.DefaultParallelTransactions = 64`, `sdk/physical/physical.go:15`),
reads the applied index (`:206`), and only then opens `db.Begin(false)`
(`:210`) - a read-only bbolt transaction. The comment at `:201-205` states
the ordering rule of the sibling technique in the tree's own words: the
other order means "the WAL could be incremented and we could be missing
items not present in the transaction". `AppliedIndex()`
(`internal/physical/raft/raft.go:1232-1243`) deliberately reads the FSM's
own latest index rather than the raft library's, "which may be behind
raft.AppliedIndex() due to the async nature of the raft library" - the
index is a fact about the apply loop, not the log. A writable transaction
also registers its start index with the fast-apply tracker (`:215-217`).

## Reads and writes: what produces a verification

`Get` (`:338-395`) serves a key from the write buffer with no verification
when the transaction has already written it (`:345-365`; the comment at
`:349-352` gives the reason - "we were the last writer to this key ... so
there's no need to queue another verifyReadOp"), otherwise reads the
snapshot and records a `verifyReadOp` carrying a SHA-384 of `{key}value`
(`:367-384`; hash construction at `:99-117`, RFC "Verification Hashes").
A nil value hashes as a distinct value from an empty one because the key
framing is present either way and the value bytes differ.

The tree goes one step past the draft, and it is the upward lesson this
application exists to record: **a blind write is verified too.** `Put`
(`:296-320`) and `Delete` (`:409-431`) read the key's current value from
the snapshot and record a verification of that pre-image when the key has
been neither read nor written in-transaction. So a transaction that never
read a key and simply overwrote it still refuses at apply if anyone else
wrote the key first - first-committer-wins covers write-write conflicts,
not only read-write. The conformance suite pins this: two transactions
putting the same value to the same fresh key, and the second to commit
fails (`internal/physical/crosstest/cross_test.go:898-915`). Verifications
are keyed by path (`:314`, `:379`), so a key read twice or read-then-written
carries exactly one.

## Commit: the entry, in order, or nothing

`Commit` (`:542-662`) always rolls back the bbolt snapshot first (`:582`),
then returns without proposing anything when the transaction is read-only
or `haveWritten` is false (`:586-593`). The comment there is the
no-writes-no-log technique's argument: "We might have conflicted on a
verification, but we won't negatively impact an other writer ... it would
be no different than having executed in a read-only transaction." The RFC's
unresolved question 3 (`transactions.mdx:387-388`) had leaned the other
way - commit anyway "to give the caller an indication of other parallel
writes" - and the implementation reversed it. The entry is then assembled
in a fixed order (`:595-647`): a `beginTxOp` carrying the start index, the
read verifications, the list verifications, the writes, a `commitTxOp`
sentinel. `applyLog` (`raft.go:1793-1820`) checks a transaction against
`maxTransactionSize` rather than `maxEntrySize` (`:1815-1820`); the
defaults are derived, not chosen - `defaultMaxEntrySize = 2 *
raftchunking.ChunkSize` and `defaultMaxTxnSize = 8 * defaultMaxEntrySize`
(`raft.go:85-86`), with the field comments at `:168-176` stating the
multiples as advice.

## Apply: verify all, then write all, inside one bbolt update

`ApplyBatch` (`fsm.go:731-920`) runs every command of a batch inside one
`db.Update` (`:809`). A command whose first op is `beginTxOp` goes to
`applyBatchTxOps` (`:649-727`), which validates well-formedness (`:664-666`
- begin first, commit last, nothing in between), walks every verification
(`:678-682`) and returns `ErrTransactionCommitFailure` on the first
mismatch before touching a byte, then applies the puts and deletes
(`:695-720`). The long comment at `:795-808` is an incident record: an
earlier commit had wrapped each transaction in its own bbolt update, was
slower, and "we don't want to commit partial state from a previous log
entry (that succeeded) when a later log entry fails" - so the tree kept one
update per batch and moved to pre-verification, which is why "verify all
before writing any" is structural rather than a preference.

The verdict travels typed. A refused transaction does not fail the
`db.Update` (`:832-849`): the FSM appends a sentinel `FSMEntry` whose key
is `fsmEntryTxErrorKey` (`fsm.go:66-82`) and clears the error so the rest
of the batch proceeds; `applyLog` on the proposing node looks for that
sentinel and returns it wrapped in `physical.ErrTransactionCommitFailure`
(`sdk/physical/transactions.go:15`) - one of exactly three sentinels
(`:13-17`), the other two being read-only (`:14`, returned at
`transaction.go:276-278` and `:400-402`) and already-finished (`:16`,
returned at `:279-281`, `:341-343`, `:546-548`, `:668-670`).

One deviation: the invalidation hook after apply (`fsm.go:889-904`)
collects put and delete keys from every command in the batch, including a
transaction that was just refused. A refused entry therefore evicts cache
entries for keys it never wrote. The direction is safe - over-invalidation
costs a re-read - but the hook is wired to the proposed writes rather than
the applied ones.

## The fast path narrows, the hash decides

`fsmTxnCommitIndexTracker` (`transaction.go:711-867`) keeps, per applied
index, the set of keys that index modified, pruned to the lowest start
index among live transactions (`:765-772`), which `applyLog` caps by the
raft applied index so a transaction started concurrently is not lost
(`raft.go:1801-1806`, `transaction.go:257`, `:684`). At verification time
`doVerifyRead` (`:971-983`) skips the re-read when either nothing at all
was applied since the transaction began and it is first in its batch
(`canFastWrite`, `:931-936`) or no later index touched this key
(`canFastWriteBypassRead`, `:950-956`). The comment at `:946-949` is the
technique's rule in the tree's words: a hit "is not sufficient to conflict
the transaction: it only states that it might have been modified, but the
modification could be reverted in a later WAL or it could have been a
write of the same value." Metrics count hits and misses (`:973`, `:978`)
and sample the index delta on a miss (`:977`).

## Two other designs in the same tree

The relational backend (`internal/physical/postgresql/transaction.go`) has
an engine with real interactive transactions and simply uses it: `BeginTx`
at `sql.LevelRepeatableRead` (`:33-36`), which the RFC notes "roughly
correspond[s]" to the Raft semantics (`transactions.mdx:171`); a commit
with no writes becomes a rollback (`:215-217`); a real commit validates the
HA fence first (`:232`) and wraps the engine's failure in the same
commit-failure sentinel (`:236-238`), so callers see one vocabulary across
backends. That is the "when not to reach for this" case of the technique,
realized.

The pebble backend (`internal/physical/pebbledb/pebbledb.go:28-41`)
documents the other road not taken on Raft: an invalidation-checking model
where every in-flight write is pushed into every open transaction and the
conflict list is checked "while holding the write lock one last time prior
to committing". Its header comment names why Raft could not use it -
re-implementing verification without an interactive write transaction
"would necessitate holding and grabbing a global write lock". The two
designs bracket the technique: verify-at-apply when the writer is a
consensus log, invalidate-at-commit when the writer is a local lock you
can afford to hold for an instant.
