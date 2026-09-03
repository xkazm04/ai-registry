---
layer: application
type: application
subject: embedded-db
technique: derived-capacity-limits
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The limit tree in OpenBao's integrated storage

OpenBao's integrated storage is bbolt beneath a hashicorp/raft log, with the
cluster's own log chunking in front of it, so it has more leaves than a
single-process store: a transport chunk, a permit count, a memory target, a
cipher ceiling. Citations are against `openbao/openbao` at
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go 1.27.0`, `go.mod:12`). The
tree states nearly every derivation the technique asks for, in a comment
beside the number; where it falls short, it falls short in exactly the way
the technique predicts, and one of its own RFCs names the consequence.

## The branches, written beside the numbers

`internal/physical/raft/raft.go:85-86` is the technique's first two
derivations verbatim:

```go
defaultMaxEntrySize    = uint64(2 * raftchunking.ChunkSize)
defaultMaxTxnSize      = 8 * defaultMaxEntrySize
```

The leaf is `go-raftchunking`'s `ChunkSize` (v0.7.1, `go.mod:58`), 512 KiB,
so the default entry is 1 MiB — the figure the split-mount-tables RFC quotes
as `max_entry_size` — and the default transaction is 8 MiB. The struct
fields carry the reasoning (`raft.go:168-176`): the entry is "2x the Raft
chunking size for optimal performance", the transaction "8x the entry size
to allow for a balance between performance without unduly limiting the
number of operations". A reviewer can recompute both by substitution.

The per-transaction cache is the shared-divided-by-permits derivation.
`sdk/physical/physical.go:14-15` sets `DefaultParallelOperations = 128` and
`DefaultParallelTransactions = 64`; `sdk/physical/cache.go:19-24` sets
`DefaultCacheSize = 128 * 1024` and `TransactionCacheFactor =
DefaultParallelTransactions`, with the comment "a multiple of cache size to
reduce transactions by, to avoid high memory usage"; `cache.go:270` applies
it when a transaction clones the cache: `newCache(b, c.size /
TransactionCacheFactor, ...)`. The worst case — every transaction permit
held, every clone full — is the shared cache, as the technique requires.

The page-size derivation is `sdk/logical/storage.go:30-33`:
`DefaultScanViewPageLimit = 2500`, "should roughly fit in 2MB of memory
assuming an excessively long path length (400 characters)". The derivation is
written, which is the standard; what a reviewer notices on recomputing is
that 2500 × 400 is 1,000,000 bytes, so the stated target is met with a factor
of two in hand. Under count-carries-predicate that is a derivation whose
predicate does not reproduce its number exactly — harmless here, but the kind
of gap that becomes a real one once someone doubles the constant to "use the
headroom". `namespace_store.go:1477` and `storage.go:110` are the consumers.

## The margin, and the counter that counts itself

`internal/vault/barrier/keyring.go:17-22`:

```go
// 10% shy of the NIST recommended maximum, leaving a buffer to account for
// tracking losses.
AbsoluteOperationMaximum = int64(3_865_470_566)
```

3,865,470,566 is 0.9 × 2³², the AES-GCM ceiling from NIST SP 800-38D that
`docs/internals/rotation.mdx:66-73` cites. The margin's *reason* is written
(tracking losses); its *arithmetic* is not — it is a round 10%, not the
product of persistence interval and peak encryption rate the technique asks
for. Recorded as a deviation, with the note that 429 million operations of
slack against a count persisted on an interval is comfortably safe; the
standard still wants the interval-times-rate written so the next person can
check that it stays so when the rate changes.

The counter mechanism confirms the rest of the section. Encryptions
accumulate in `UnaccountedEncryptions` (`aes_gcm.go:1187-1193`) and are
folded into the keyring and persisted periodically by `persistEncryptions`
(`aes_gcm.go:1250-1271`) — the periodic persistence that creates the
tracking loss in the first place. The tree taught the draft the "counts
itself" clause: `newEncs := upe + 1` with the comment that "persistence
performs an encryption, perversely we zero out after persistence and add 1
to the count" (`:1256-1261`). And the ceiling is enforced at the point an
operator can set it: `KeyRotationConfig.Sanitize` clamps any `MaxOperations`
above `AbsoluteOperationMaximum` down to it (`keyring.go:251-253`), and the
API refuses values outside `[AbsoluteOperationMinimum,
AbsoluteOperationMaximum]` with the range in the error
(`logical_system_rotate.go:511-512`) — silent clamp on the stored config,
loud refusal on the request.

## The pinned constant and the lowered limit

`internal/physical/raft/transaction.go:32-40` is the technique's "constants
are pinned" section in one declaration: `maxEntrySizeMultipleTxnOverhead =
11`, "bytes of overhead a single Put entry has versus a transaction,
excluding the size of the path. Verified by
`TestRaft_Backend_PutTxnMargin`." The transaction's put check
(`transaction.go:286-290`) enforces the entry limit against the encoded
size — `valueSize >= maxEntrySize - keySize - overhead` — so the constant
is load-bearing, and the test is what stops an encoding change from
producing entries eleven bytes over a limit the transport enforces later.
The same check also enforces a leaf the technique lists: bbolt's
`MaxKeySize` (`:286-288`, and again on the bare `Put` at `raft.go:1719`).

Lowering is handled the way the technique asks. `raft.go:1702-1708` warns on
read when a stored value exceeds the current limit — "retrieved entry value
is too large, has raft's max_entry_size been reduced?" — naming the size and
the limit.

## Where a branch is detached from its leaf

`raft.go:489-507` parses `max_entry_size` and `max_transaction_size`
independently: each starts from its own default and is overwritten if
configured. `defaultMaxTxnSize` is 8 × the *default* entry, not 8 × the
*configured* one, so an operator who raises `max_entry_size` to 4 MiB keeps
an 8 MiB transaction limit — a 2× multiple where the comment beside the
struct field says 8×. The derivation is written, and it is a comment.

The RFC that split the mount table names this as its own residual risk. Its
problem statement (`website/content/community/rfcs/split-mount-tables.mdx`,
"Problem Statement") says the 1 MB entry "usually works out to about 14k
mounts" because the whole table is one compressed entry, rejects upstream's
answer of a second, larger tunable for that one entry, and splits the table
one mount per entry under a transaction instead. Then it states the
consequence the technique derives: transactions "will still have a size
limit (about 8 times larger than `max_entry_size`)", and the operation most
likely to hit it is "the initial migration to the new format (if
`max_entry_size` was raised but `max_transaction_size` was not)". That is
the detached branch, seen from the migration it endangers. The migration
itself is `internal/vault/mount.go:840-851`: performed only when the barrier
is `logical.TransactionalStorage`, inside a write transaction, and the
comment carries the one-way clause — "going backwards (from a
transaction-aware storage to not) is not possible without manual
reconstruction" — which the RFC's Downsides section restates as the
accepted cost, with a snapshot restore as the only reverse path.

## One number nobody derived

`raft.go:881`, `config.MaxAppendEntries = 64`, sits between the derived
constants with no comment and no formula; the neighbouring comment explains
`BatchApplyCh`, not the 64. Under the technique it is a placeholder that
should be labelled as one. It is the only bare capacity constant found at
the anchors, which is itself the finding: the tree's discipline is real, and
the exception is visible precisely because everything around it says where
it came from.
