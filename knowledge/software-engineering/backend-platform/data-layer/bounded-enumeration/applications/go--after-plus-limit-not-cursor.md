---
layer: application
type: application
subject: bounded-enumeration
technique: after-plus-limit-not-cursor
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# `ListPage(prefix, after, limit)` from bbolt to the CLI in OpenBao

OpenBao at `6b5f82e1` (an MPL-licensed fork of HashiCorp Vault maintained
under the Linux Foundation) carries the seek primitive as one signature at
every layer, and its RFC `website/content/community/rfcs/paginated-lists.mdx`
is the design record: `after` is exclusive and need not exist, `limit` is
non-positive for unlimited, and no cursor is minted anywhere. This
application records where the tree confirms the standard, where it taught
the standard something, and the one place it deviates.

## The primitive, confirmed at the storage interface

`sdk/physical/physical.go:54-61` declares `ListPage(ctx, prefix, after,
limit)` on `physical.Backend` with the contract in the comment: sorted
order, the first result is the entry after `prefix + after`, at most `limit`
entries, and — the consistency sentence declare-the-inconsistency demands —
"this is not necessarily a consistent view: entries may be created or
deleted between calls". `sdk/logical/storage.go:45-50` repeats the same
shape one layer up on `logical.Storage`, adding that `after` "need not exist
in the entries on disk" (the binary-search semantics the RFC's example
table shows: `ListPage(..., "a", -1)` returns everything because `"a" <
"abcd"`). The plugin gRPC boundary and the API client carry it through, and
`internal/command/list.go:66-79` exposes `-after` and `-limit` on the CLI
with `-limit` defaulting to `-1`. No layer takes a cursor.

## Strictly greater, with the folder case handled

`sdk/physical/listing.go:12-48` is the `Lister` helper an ordered, seeking
backend uses to implement `ListPage` uniformly: `Start(seekPrefix)`,
`Next()`, `Key()`. `SeekPrefix()` at lines 53-70 joins `prefix + "/" +
after` for a strict greater-than seek, and `shouldIncludeEntry` at lines
127-150 is the guard the standard asks for: a leaf whose name is `<= After`
is skipped (line 136), and a folder — the name truncated at the first `/`,
*with* the trailing separator — is skipped when `folder <= After` (line
145). That is the technique's "pass `a/`, not `a`" rule enforced on the
server side, and lines 210-214 say why the guard exists at all: the
backend is assumed to seek past `after`, but entries at or before it are
skipped "in case this is ambiguous or different". The seek is the
optimization; the comparison is the contract.

The same file extends the primitive in a direction the draft did not
anticipate and that belongs to the transactions subject rather than this
one: lines 36-47 and 172-311 reconcile a page against writes made earlier
in the same interactive transaction (skipping keys `Deleted` in the
transaction, merging `Inserted` keys in sort order, then trimming to
`limit` at lines 302-310), and return `presentKeys` — what storage actually
held — beside the reconciled page for conflict detection. Pagination stays
key-plus-limit inside a transaction; nothing about the shape changes.

## The store that cannot seek: list, sort, binary search

`sdk/physical/file/file.go:300-368` is the fallback the RFC's Downsides
section names for the file backend: read the directory, `sort.Strings`
(line 349), `sort.SearchStrings(names, after)` and step past an exact match
(lines 352-358), then slice `limit` (lines 360-365). The same shape recurs
in `sdk/helper/keysutil/encrypted_key_storage.go` for the encrypted
key-storage wrapper. One interface at every layer; the non-seeking
backends pay their own listing cost and expose nothing different.

## The upward lesson: the empty child terminates the scan

`sdk/logical/storage.go:174-186`, inside the paginated recursive scan
`scanViewPaginated` (lines 131-190), is the case the technique's
"trailing-separator empty key" paragraph was rewritten from. A key written
with a trailing slash (`baz/`) is a valid entry, so `list(baz/)` returns
`""`; `after=""` is also the default "from the start", so an iterator that
sets `after` to the last key of a page holding only `""` requests the same
page forever. The tree's rule, quoted from the comment: if `after == ""`
and the page holds exactly one entry and the page size was greater than
one, "we know there's nothing else there and thus we can break". The draft
had said the empty child "sorts first" and must not be treated as "no such
key"; the tree showed that the actual hazard is the collision between the
empty name and the empty `after`, and the technique now states the
termination rule.

## Page size, and the structure the entry limit reshaped

`sdk/logical/storage.go:30-33` declares `DefaultScanViewPageLimit = 2500`
with its derivation in the comment: "roughly fit in 2MB of memory assuming
an excessively long path length (400 characters)". The inputs are named,
which is what page-size-from-memory-budget asks; the deviation is that the
stated quotient is 5000 and the constant is 2500, so an unstated per-key
overhead factor of two sits between the formula and the number — the
omission that technique now warns about by name. The 400-character
ceiling is also an assumption rather than an enforced bound, and the
comment says so ("assuming").

`internal/vault/mount.go:840-851` is the golden path's opening example of a
structure reshaped when one entry's size limit bound it: the mount table
moves from a single serialized entry to one entry per mount under a
transaction, migrated on the first start against a transaction-aware
backend, with "going backwards ... not possible without manual
reconstruction". The RFC `split-mount-tables.mdx` (Problem Statement)
gives the force: a 1 MB `max_entry_size` "usually works out to about 14k
mounts", upstream's answer was a larger-entry tunable, and the fork's
answer was to make the count a listing bounded by memory and storage speed
(a proof of concept at 360k mounts) rather than by one entry's size. The
dispatch removed the migration as a technique of this subject; the
application records it because it is the incident that motivates the
subject.
