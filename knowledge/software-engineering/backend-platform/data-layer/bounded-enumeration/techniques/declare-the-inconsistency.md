---
layer: technique
type: technique
subject: bounded-enumeration
technique: declare-the-inconsistency
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [writing the documentation of a paginated endpoint, a caller reports a missed or duplicated entry across pages, deciding whether a listing runs inside a transaction, a consumer asks for a consistent snapshot of a collection]
---

# Declare the inconsistency

A paginated listing is a sequence of independent reads separated by network
round trips, and unless the contract says otherwise, the store may be
written between any two of them. That sentence is the whole technique. It
is the sentence every paginated API implies and almost none states, and
the cost of not stating it is that the first caller to observe its
consequence files a bug against behavior that was never promised to be
otherwise.

## What a seek-based page guarantees, and what it does not

Position by key (see after-plus-limit-not-cursor) is considerably more
stable than position by ordinal, and it is worth being exact about how
much more. Because each page begins strictly after a key the caller holds,
a write that lands *before* that key — an insert, a delete, a rename into
the passed range — does not shift the next page: the seek is anchored to a
value, not to a count. A write that lands *after* the position appears on a
later page, correctly. The two guarantees a seek gives are therefore: no
entry that existed for the whole iteration is skipped, and no entry is
returned twice by virtue of others moving around it.

What a seek does not give is a snapshot. An entry created behind the
position after the iteration passed it is never seen. An entry deleted ahead
of the position is never seen. An entry that is deleted and re-created under
a different key, or whose key sorts differently after a rename, can be seen
twice or not at all. And when the listing is post-processed — filtered,
merged from several sources, reconciled against another store — the "no
duplicates" property is a property of the raw page and not of the
processed one. The caller iterating a collection under concurrent writes
receives a set that is a correct listing of *no single moment*: it is the
union of what was true at each page's instant, and that union may be
neither a subset nor a superset of the collection at any time.

## Pagination is not bound to a transaction

The temptation is to fix this by holding a read transaction across pages.
The temptation should be refused, and the refusal stated. A transaction
across pages is a resource held for a duration the client controls — a
snapshot pinned for as long as the slowest caller takes to fetch the last
page, which under a single-writer store blocks the writer or under a
versioned store pins garbage — and its cost is unbounded by exactly the
quantity this subject bounds. The page's limit bounds one request; nothing
bounds the interval between requests. So the contract states that pages
are not transactionally bound, that each page is a fresh read, and that
the properties above are the properties on offer.

The naive reading — "the list is consistent because each page is a
consistent read" — is true of each page and false of the sequence, and a
consumer who builds a reconciliation on it (delete everything not in the
listing) will delete an entry that was created mid-iteration. That failure
is quiet, one-sided, and shows up as data loss weeks later. The contract
sentence prevents it by telling the consumer what they are holding: a
count of entries that carries the predicate "as observed across N reads
between two instants"
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
not "the collection".

## A consistent view is a different operation

A caller who needs a consistent view is not asking for better pagination;
they are asking for a different operation, and it is unbounded by
construction, because a consistent view of a collection is the collection.
Offer it as such — a snapshot export, a listing inside a single transaction
with the transaction's own limits on size and duration, a version-stamped
read where the store supports one — and put it behind a capability that
says what it costs, so the policy layer can grant the bounded operation
widely and the unbounded one narrowly. What must not happen is the
unbounded operation hiding inside the bounded one as a flag ("consistent
= true") that quietly removes the bound, which is the same widening
deny-absorbs-and-lowest-limit-wins refuses for recursion.

Where the store does offer transactional reads and the consumer is
prepared to pay for them, the transaction bounds a *single* list request:
one page, or one whole listing inside one request whose size is capped by
the transaction's own limits. Even then the contract says which — "this
page is a consistent read" is a different promise from "these pages are".

## The contract, in one paragraph

Every paginated endpoint's documentation carries a paragraph in the
following shape, in its own words: pages are independent reads; entries
created or deleted during iteration may appear on no page or on more than
one; the iteration is not a snapshot and is not bound to a transaction; a
consumer that requires a consistent view uses the named alternative, which
is unbounded and gated separately. The paragraph sits beside the parameter
list, not in an appendix, because the consumer who reads only the
parameters is the consumer who will build the reconciliation.

## Decision rules

When documenting any paginated read, state that pages are independent and
what a mid-iteration write can cause, because a consumer who is not told
will build on a snapshot that does not exist.

When a caller asks for a consistent listing, offer a distinct operation
with its own capability and no page bound, because a snapshot is the
collection and cannot be bounded by a page size.

When tempted to hold a transaction across pages, refuse, because the
interval between pages is controlled by the client and a resource held
for a client-controlled duration is unbounded.

When the listing is post-processed, restate the guarantees for the
processed result, because a filter or a merge removes the no-duplicate
property the raw seek provided.
