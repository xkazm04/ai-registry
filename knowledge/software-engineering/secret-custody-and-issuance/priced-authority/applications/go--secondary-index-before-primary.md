---
layer: application
type: application
subject: priced-authority
technique: secondary-index-before-primary
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# Token store write order and the revocation marker in OpenBao (Go, source tree)

Written against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go 1.27.0` in `go.mod:12`).
This application records the token store's create order for this
technique and, because the two are one function apart and the tree's
deletion order only makes sense with both, the marker of
[write-ahead-revocation-marker](../techniques/write-ahead-revocation-marker.md).

## Create: parent index, then primary

`internal/vault/token_store.go:1561-1565` carries the rule verbatim, in
`storeCommon`:

```go
// Write the secondary index if necessary. This is done before the
// primary index because we'd rather have a dangling pointer with
// a missing primary instead of missing the parent index and potentially
// escaping the revocation chain.
```

The function then looks the parent up and refuses when it is missing
(`:1567-1574`, "parent token not found"), writes the parent index entry
`<parentSaltedID>/<saltedID>` into the parent's view (`:1597-1598`), and
only then writes the primary under the salted ID (`:1604-1610`). A root
token's primary is additionally seal-wrapped (`:1607`). The accessor
index is written earlier in the create path: `create` calls
`createAccessor` at `:1338` (the accessor view write is at `:1245`) and
`storeCommon` at `:1344`, so both secondary handles exist before the
record does.

The dangling-pointer tolerance the technique requires is a maintenance
endpoint here: `auth/token/tidy` (`token_store.go:636-650`, handler at
`:2388`), documented as "cleaning up of leaked accessor storage entries",
which walks accessors and removes those whose primary is gone. The
sweep removes pointers only.

## Use-count tokens: the marker on the last use

`token_store.go:1649-1660` (`UseToken`) is the marker in its smallest
form. When a limited-use token is on its final use, the store does not
delete it; it sets `te.NumUses = tokenRevocationPending` (`-1`, declared
at `:73-77`) and persists, with the comment:

> revocation is deferred to the end of the call, so this will make sure
> that any Lookup that happens doesn't return an entry. This essentially
> acts as a write-ahead lock and is especially useful since revocation can
> end up (via the expiration manager revoking children) attempting to
> acquire the same lock repeatedly.

Lookups honour the marker through the `tainted` parameter of
`lookupInternal` (`:1781`): an entry "in some revocation state (currently,
indicated by num uses < 0)" is returned only to callers that ask for
tainted entries, which is the revocation path itself.

## Revoke: mark, tear down in danger order, delete the primary last

`token_store.go:2000-2130` (`revokeInternal`) is the full marker
protocol. It first consults an in-memory `tokensPendingDeletion` map
(`:2004-2009`): a revocation already in progress short-circuits to
success. It then re-reads the entry tainted, and if the persisted marker
is not yet set, sets `NumUses = tokenRevocationPending` and stores it
(`:2021-2031`); a failure to persist the marker resets the map entry to
`false` (`:2029`) so the caller can retry. A deferred function
(`:2042-2057`) deletes the primary record (`:2046`) **only if every later
step succeeded**, and on any failure stores `false` in the map so "the
next call to revokeInternal will retry" (`:2054`).

The teardown between the marker and that deferred delete runs in the
order the technique gives: the cubbyhole first (`:2061-2063`, "This should
go first as it's a security-sensitive item"), then the token's leases via
the expiration manager (`:2069`), then the parent index (`:2073-2106`),
then the accessor index (`:2111-2118`), then the children are orphaned
or, under a tree revocation, already gone (`:2123-2130`). The
primary is the last write, in the defer. This inverted the draft's
"primary first" deletion order for the marked case, and the technique
now states both orders and the fact that decides between them.

## Where the tree deviates, and where it does not

The in-memory map is process-local; a second replica that receives a
revocation for the same token relies on the persisted marker alone, which
is the technique's "the set is a fast path, the record is the truth". No
deviation. The tree has no explicit "already in progress" verdict for a
caller - a re-entrant revoke returns success (`:2008`) - which is one of
the two answers the technique permits.
