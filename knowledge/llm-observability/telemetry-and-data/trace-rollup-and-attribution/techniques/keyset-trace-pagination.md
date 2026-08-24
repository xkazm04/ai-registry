---
layer: technique
type: technique
subject: trace-rollup-and-attribution
technique: keyset-trace-pagination
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when: [paging a trace or event list under filters, live traffic lands between page fetches, a client renders "n of N" without paging to count]
---

# Keyset trace pagination

A trace list is browsed newest-first while new traces are still landing.
Offset pagination is wrong here in a way that produces *silent* data loss:
every insertion between two page fetches shifts the offset window, so page
two either repeats the tail of page one or — worse — skips the rows that
slid past. An operator paging through an incident sees a trace once, twice,
or never, and nothing in the payload says which. Keyset pagination replaces
the offset with a cursor encoding the last returned row's position in a
total order, and the next page is "strictly after this position" — exact
under concurrent writes by construction.

## The cursor is a composite, always

Page on **(ordering timestamp, id)**, not on the timestamp alone. Timestamps
collide — batch ingestion lands many rows in the same millisecond — and a
cursor on a non-unique column either skips the colliding siblings or loops
on them. The id tie-break makes the order total; any stable unique column
works, but it must be part of both the ORDER BY and the cursor predicate.

And the ordering column obeys one constraint the tie-break cannot rescue:
**it must be immutable, or mutable only in the direction that duplicates.**
For an entity that grows, mutation direction and traversal direction
interact asymmetrically. Under a newest-first traversal, a key that moves
*later* carries a row from behind the cursor to in front of it, where
"strictly after this position" can never reach it — a silent skip, the
exact failure this technique exists to prevent. A key that moves *earlier*
can only carry a row backward across the cursor, where it is seen a second
time and deduplicated by id — the benign case. So the trace's *latest*
event time — the intuitive "newest first" column for a growing entity — is
precisely the column a newest-first traversal cannot page on: every late
span moves it in the skipping direction. Page on the trace's *start* time
(minted once, or mutable only earlier under late-arriving spans), accept
that newest-*started* is not newest-*active*, and let clients deduplicate
by id for the rows the benign direction re-serves. A surface that truly
needs activity ordering restarts from the head rather than paging through
a mutating order.

Encode the cursor opaquely (the pair, serialized) and validate it on
receipt: a malformed cursor is a client error, never a silent fresh-start
from page one, which would masquerade as data corruption.

## Cursor predicate and content predicates stay independent

The list is filtered — by status, by cost floor, by time window, by tag —
and the cardinal structural rule is that the **cursor predicate is appended
alongside the content predicates, never merged into them**. The page is
"rows strictly after the cursor *that also match the filter*". Composed this
way, traversal is exact under every filter combination without per-filter
pagination code; entangle them and each new filter needs its own paging
logic and gets it subtly wrong. The corollary discipline: adding a filter
must never require touching the pagination path at all. If it does, the
predicates were not independent.

On a trace list served from a grouped aggregate, both filter and cursor
compare against aggregate-level values (the grouped latest-activity time),
and one subtlety follows: a *lower-bound* time filter that prunes at the raw
event level can under-report a trace whose activity straddles the boundary —
the rollup then covers only the in-window spans. Either document that the
window filters *activity* rather than *traces*, or filter on the aggregate
bound; do not let the two readings coexist unstated.

## The total is not the page

Clients render "n of N". Serve N as **the size of the whole matching set —
the content predicates without the cursor** — computed as one extra count
query per request that asks for it, and make it opt-in, because the count
costs a scan the common infinite-scroll case does not need. Deriving N from
the pages seen so far, or reporting the page size as the total, presents a
window as a population — the reader cannot tell "12 traces matched" from
"12 so far of 40,000". And when a next page exists, say so explicitly with
the returned cursor; a full page with no cursor must mean exactly "this is
the end", not "we didn't check". The cheap idiom: fetch limit-plus-one rows,
return limit, and the extra row's existence is the has-more signal.

## Refuse what you cannot page correctly

A backend that cannot honor a filter inside this scheme — an unported
predicate, a store with no server-side grouping — must refuse with an
explicit "unsupported" naming the filter, never serve an unfiltered or
unpaged approximation presented as the real thing. A wrong page that looks
right is strictly worse than an honest refusal: the refusal gets fixed, the
approximation gets trusted.

## When not to use it

Bounded, effectively-static sets — a tenant's project list, a price book —
can use offset paging or no paging; keyset machinery there is complexity
without a threat model. And keyset pagination cannot jump to an arbitrary
page number; if a surface genuinely needs "go to page 37" (rare in
observability, where browsing is always from-the-newest), that is a
different access pattern and should be designed as a windowed query, not
bolted onto the cursor.
