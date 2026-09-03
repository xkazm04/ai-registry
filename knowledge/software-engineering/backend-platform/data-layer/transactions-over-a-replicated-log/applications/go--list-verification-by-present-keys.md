---
layer: application
type: application
subject: transactions-over-a-replicated-log
technique: list-verification-by-present-keys
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# Present keys, reconciled keys, and one hash (OpenBao, Go source tree)

OpenBao at `6b5f82e1` verifies lists inside a Raft transaction through a
shared `Lister` helper (`sdk/physical/listing.go`) that every seeking
backend uses, plus a `verifyListOp` log operation
(`internal/physical/raft/transaction.go:67-97`). The tree confirms the
technique's central rule, sharpens its limit arithmetic, and - on my
reading, unverified by execution - carries a mismatch between what commit
hashes and what apply re-hashes.

## Two lists out of one cursor walk

`Lister.ListPage` (`listing.go:172-311`) returns two slices, and the
comment at `:193-196` states why: "those we expect to be returned to the
caller (i.e., the reconciled list), and the list of keys present in
storage from our underlying view. This lets callers know what was actually
read and use it for conflict detection." The loop appends every raw key the
cursor visits to `presentKeys` before any filtering (`:218-219`), then
skips keys the transaction deleted (`:221-224`, via the `Deleted` hook the
transaction supplies at `transaction.go:479-486`), merges keys the
transaction inserted in sorted order (`:237-267`, `:284-300`, via
`Inserted`, `:487-500`), and trims the reconciled list to the caller's
limit (`:302-310`). The `Deleted`/`Inserted` pair is validated as
all-or-nothing (`:77-79`): a backend either reconciles or does not.

The transaction then hashes `presentKeys`, not `keys`
(`transaction.go:507-513`): the limit it records is `len(presentKeys)` -
the number of raw keys the cursor actually consumed - and the parameters
`{prefix, after, limit}` are serialized into the verification's key
(`:77-97`) so the hash carries its predicate. This is the technique's rule
exactly, and it answers the limit arithmetic more precisely than the draft
did: the storage query is not "the caller's limit plus the deletions" but
"however many raw keys it took to fill the reconciled page", and that count
is the limit apply must replay.

## Collapse to the higher limit

Lists are keyed `prefix -> after -> limit` (`:182`, `:520-537`). A second
list of the same prefix and after keeps only the verification with the
larger limit (`:526-537`), because a longer walk from the same start point
covers the shorter one. The comment at `:515-519` notes the tree stops
short of collapsing across different `after` values sharing a prefix. That
is the dispatch's "verify at a higher limit only", and the technique now
states it.

## The re-execution at apply, and where it diverges

`doVerifyList` (`transaction.go:985-1006`) parses the parameters, tries the
fast path (`canFastWriteBypassList`, `:966-969`, keyed on any modified key
under the prefix, `:835-867`), and on a miss calls `listPageInner`
(`internal/physical/raft/fsm.go:603-607`) with the stored prefix, after and
limit, then hashes the result against the verification (`:1000-1002`).

`listPageInner` builds a `Lister` with no `Deleted`/`Inserted` hooks and
returns its **first** result - `results, _, err := ...` at `fsm.go:605` -
which is the reconciled `keys` slice: entry names relative to the prefix,
folders collapsed to one `name/` entry, keys at or before `after` dropped,
trimmed to the limit. Commit hashed `presentKeys`: raw full paths, one per
key visited, including the ones `after` filtered and every key under a
folder. The two agree only when every visited key is a direct child with
no `after` filtering. For a prefix with nested keys (`foo` and `foo/bar`
under `""`: present `foo\nfoo/bar`, replayed `foo\nfoo/`) or for any
non-empty `after` (the seek lands on `after` itself, which is present but
not returned), the hashes differ and the transaction is refused.

The refusal is in the safe direction - a false conflict, never a false
pass - and it is masked by the fast path, which skips the re-hash unless a
later index wrote under the listed prefix (`:835-867`). That is why the
conformance matrix does not surface it: `Test_RandomOpsTransactionalBackends`
(`cross_test.go:90-98`) interleaves direct writes with in-transaction
lists over nested paths (`:961-1084`) and compares error-or-not across
backends, but a direct write under a listed prefix changes the reconciled
list on every backend, so raft's refusal agrees with the in-memory
backend's. No test in `internal/physical/raft` names `doVerifyList`. I
record this as a deviation from the technique's "apply re-executes the
query storage ran and hashes the same thing": the query is the same, the
hashed projection is not. The repair is one line - return the second slice
from `listPageInner` - and a test that forces the slow path with a nested
prefix. I could not run the suite from this environment; the reading
stands on `listing.go:310` and `fsm.go:605`.

## The invalidation-checking alternative's list logic

The pebble backend keeps `presentKeys` per `prefix -> after -> limit` as
well (`internal/physical/pebbledb/pebbledb.go:395-424`) and, instead of
re-executing at commit, checks each in-flight write against each recorded
list (`:662-744`): a complete list (limit 0) conflicts when the write's
presence status would change (`:689-701`); a bounded list conflicts when
the written key falls between two returned keys or when the list had room
for it (`:703-742`). That is the technique's rule turned inside out - the
list is fixed and the writes are tested against it - and it is the shape a
store takes when it can afford a write lock at commit and cannot afford a
replay.
