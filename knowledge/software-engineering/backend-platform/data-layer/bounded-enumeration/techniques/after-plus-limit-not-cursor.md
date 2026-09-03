---
layer: technique
type: technique
subject: bounded-enumeration
technique: after-plus-limit-not-cursor
status: forged
laws: [identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [designing the parameters of a list endpoint, replacing offset or cursor pagination over a growing key space, a filtered listing that must not disclose hidden keys, teaching a store without native seek to page]
---

# After plus limit, not a cursor

The position of a page is a key the caller already holds, and the size of a
page is a number the caller states. Those two parameters — `after` and
`limit` — are the whole pagination surface, from the storage interface up
through the request handler to the command line, and this technique is the
argument for refusing the two alternatives that every API designer reaches
for first: the offset and the opaque cursor.

## Why not an offset

An offset is an ordinal, and an ordinal is a position in a list that no
longer exists by the time the next request arrives. The store answers "skip
N, return M" by walking N keys it then discards, so the cost of page K is
proportional to K times the page size — the last page of a large collection
costs a full scan, and a client iterating a collection pays quadratic total
work. Under concurrent writes the ordinal drifts: an insert before the
offset shifts every later page by one, and the caller sees one key twice or
never. The naive reading — "offsets are simple and the client can compute
them" — fails at both ends: the store's work is unbounded in the page index,
and the position is an index-based key, which is precisely the identity that
does not survive insertion
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Why not an opaque cursor

A cursor fixes the ordinal's cost problem — it usually encodes a key — and
introduces a worse one. It is minted by the server, so the server decides
what it contains, and it is opaque, so the client cannot inspect what it was
handed. In an unfiltered listing that is merely an unnecessary layer. In a
listing that is filtered to the keys the caller may see, it is a leak: the
server computes the cursor from the last key it *examined*, and when the
last examined key was one the caller is not permitted to see, the cursor
carries it. Encoding does not help; the client decodes it, or guesses it,
or simply observes that the cursor after a "full" page of three visible
items points past something. A filtered page with a `next` cursor is the
widening this subject exists to name (see filter-after-return-under-limit
for the rest of that rule): the filter said no to a key, and the cursor said
it anyway.

`after` cannot leak, by construction. The client sets it to a key it
received in a previous page — a key it was therefore permitted to see — and
the server seeks strictly past it. Nothing the server withheld ever crosses
the boundary as a position. The gate that filtered the page is the gate that
decides what can become a position, which is the shape
[gate-sees-target](../../../../_laws.md#gate-sees-target) requires: the
position is computed from what the caller was shown, not from what the
server looked at.

## The primitive, precisely

The store's seek is: given a prefix, an `after` key, and a limit, return up
to `limit` direct children of the prefix whose name sorts strictly greater
than `after`, in key order. Three consequences follow, and each is a place
implementations go wrong.

**Strictly greater, never greater-or-equal.** The `after` key is the last
key of the previous page, and it has already been delivered. A
greater-or-equal seek returns it again as the first item of every page, and
a client that terminates on "fewer than limit" still works while a client
that terminates on "empty page" loops forever on a collection whose size is
a multiple of the limit. The rule: when the caller supplies `after`, seek
past it; when `after` is the empty string, begin at the start of the prefix.

**Direct children carry a trailing separator when they are subtrees.** A
hierarchical key space lists a prefix's immediate children and marks the
ones that have children of their own with a trailing separator, so a client
can descend. The separator is part of the child's name for ordering
purposes and for `after`: a client that descends into `a/` and later
resumes the parent listing passes `a/`, not `a`, or the seek lands before
the entry it meant to skip. And the empty child name is legitimate — a key
equal to the prefix itself, with nothing after the separator, is a real
entry (a writer joined paths carelessly and produced a trailing separator),
and it sorts first. Here the two meanings of the empty string collide: an
`after` of the empty string means "from the start", and the empty child's
own name is also the empty string, so a client that sets `after` to the last
key it received after a page holding only that child asks for the same page
again, forever. The rule: when a page holds only the empty child and the
page could have held more, the listing is complete, and the iterator stops
there rather than resuming from a position it cannot express. Test the
prefix-equals-key case explicitly; it is the one a developer's fixture
never contains and the one a recursive scan over real data will meet.

**The page is what the store returned, before anything downstream reshaped
it.** The `after` for the next page is the last key of the page the caller
received; where a post-processor filters the page, the caller receives
fewer keys but must still seek past the last key the store examined —
which is the subtlety filter-after-return-under-limit owns. This technique
only fixes the shape: position is a key, and it is a key the caller holds.

## A store that cannot seek

Not every store has an ordered index. A flat map, an object store with
prefix listing only, a directory on disk: each can list a prefix but cannot
begin at an arbitrary key. Do not add a second primitive for these. Teach
them the one primitive by fallback: list the whole prefix (the cost the
store was always going to pay), sort, binary-search for the first key
strictly greater than `after`, and slice `limit`. The fallback is worse than
a native seek by exactly the store's own listing cost and no more, and it
means every layer above the store interface sees one contract. The rule:
when a backend lacks a seek, implement `after`-plus-`limit` over its full
list with a binary search, because a second interface shape for the
non-seeking case propagates into every consumer and outlives the backend
that needed it. Name the fallback in the backend's documentation so an
operator choosing a store knows which ones page natively.

## Decision rules

When designing any list surface, take `after` and `limit` and nothing else,
because a position that is a key the caller holds costs the store one seek
and can never disclose a key the caller was not shown.

When an existing surface takes an offset, migrate it to `after` before the
collection grows, because offset cost is quadratic in the page index and the
migration is cheaper while the caller population is small.

When a listing is filtered per key, never mint a cursor from the last key
examined, because that key may be one the filter withheld; the client
resumes from the last key it received.

When a backend has no ordered seek, implement the primitive by
list-sort-binary-search rather than exposing a different shape, because
one contract at the interface is worth more than the seek the backend lacks.

When writing the seek, test the prefix-equals-key case and the
separator-terminated child case, because both are legitimate keys that
sort at the edges and both are absent from every ordinary fixture.
