---
layer: golden-path
type: golden-path
subject: bounded-enumeration
status: forged
use_when: [adding a list or scan endpoint over a collection that can grow without bound, choosing a page size or a pagination parameter shape, deciding whether a listing can be filtered to what the caller may see, writing the consistency contract of a paginated read]
techniques:
  - after-plus-limit-not-cursor
  - page-size-from-memory-budget
  - declare-the-inconsistency
  - required-limit-breaks-unaware-clients
  - deny-absorbs-and-lowest-limit-wins
  - filter-after-return-under-limit
---

# Bounded enumeration

Every store that can be written to can be asked "what is in here?", and that
question is the one read whose cost is not set by the caller but by everyone
who wrote before them. A point read costs one entry. A list costs the
collection, and the collection is the accumulated output of every writer the
system has ever admitted — leaf certificates issued by an automated fleet for
a year, sessions minted per login, audit-shaped rows nobody prunes. Bounded
enumeration is the discipline of making the list a **bounded operation**: an
operation whose worst case is a number the operator chose, whose position is
a key rather than a count, whose size is a property the authorization layer
can govern, and whose consistency is stated rather than assumed. The subject
exists because an unbounded list is the one read that turns a store's growth
into the server's memory footprint, and it does so on the day the collection
is largest, which is the day the server can least afford it.

The naive design is a single verb that returns everything under a prefix. It
is correct at every size a developer tests and it fails at the size the
deployment reaches: the server materializes the whole key set to answer,
serializes it, and the response either exhausts memory or exhausts the
transport's entry-size limit, at which point the operator learns that the
collection's size was a constraint on a structure that was never designed
around it. The corpus has seen the second shape more than once — a table
whose every row lived inside one serialized entry, so a limit on the entry's
size became a limit on the number of rows, and the fix was to reshape the
table to one entry per row rather than to raise the entry limit. Raising the
limit moves the cliff; bounding the operation removes it.

## The core stance: a list is a seek, and a page is a policy object

A principal engineer holds two things at once about enumeration. The first is
about the store: **the primitive is a seek by key**, "the next N keys greater
than this one under this prefix", and everything above it — the storage
interface, the request handler, the client library, the command line — takes
that shape and no other. Once the primitive is a seek, a page's position is a
key the caller already holds, the cost of any one page is bounded by N, and
the store that cannot seek natively (a flat key-value map, a directory
listing) is taught to by a list-plus-binary-search fallback rather than by
inventing a second primitive for it. The second is about the request: **a
page is a policy object**. Its size is not a client convenience; it is the
quantity that decides how much memory one request may pin and how many
authorization evaluations one request may cause, and both of those are
things the authorization layer has to be able to say no to. So the limit is
a capability-shaped parameter with a per-path ceiling, an explicit deny that
wipes it, and a merge rule across policies that resolves to the smallest
number present. A list whose size cannot be governed is an unmetered read,
and it is exactly the read a low-privilege caller uses to make the server
work hardest.

> **An enumeration is bounded when its position is a key, its size is a
> number the operator derived and the policy can cap, and its consistency
> is a contract the caller can read.**

The consequences of that stance form the spine of the subject:

1. **Position is `after` plus `limit`, never an opaque cursor.** A cursor is a
   server-minted token whose contents the client cannot inspect and whose
   next value the server must compute — and when a page is filtered to what
   the caller may see, the cursor is computed from a key the caller may not
   see, which is a leak by construction. A key the caller already received is
   a position that cannot disclose anything new (see
   after-plus-limit-not-cursor).
2. **The default page is derived from a memory budget.** Worst-case key
   length times the number of keys one request may hold is bytes pinned per
   request, and that product, not a round number, is where the default comes
   from. The arithmetic is written beside the number so the next operator
   recomputes it (see page-size-from-memory-budget).
3. **The contract says what a page can miss.** Pages are not bound to a
   transaction unless the subject says they are, and they are usually not; an
   entry created between two pages may appear in neither or in both, and a
   caller who needs a consistent view is asking for a different, unbounded
   operation. Writing that sentence into the contract is cheaper than
   discovering it in a bug tracker (see declare-the-inconsistency).
4. **A required limit breaks clients that do not know about limits, and that
   is the choice being made.** Making the limit mandatory converts every
   legacy full-list caller into a failing caller; clamping preserves them and
   silently truncates. Neither is free. The operator picks per path, and a
   `max` literal exists so a client that does not know its own ceiling can
   still iterate until the page comes back empty (see
   required-limit-breaks-unaware-clients).
5. **Deny absorbs; the lowest limit wins; recursion is a separate verb.**
   When several policies apply, an explicit deny empties the capability set
   regardless of what else was granted, and the pagination ceiling is the
   minimum of every ceiling present. A recursive listing is not a flag on
   the list verb but a verb of its own with its own capability, because its
   cost class is different and a policy that granted the flat list did not
   grant the tree (see deny-absorbs-and-lowest-limit-wins).
6. **Filtering a page to accessible keys is admissible only under a limit.**
   Per-key accessibility is an authorization evaluation per key, so the cost
   of filtering a page is the limit times an evaluation, which is bounded
   exactly when the limit is. And a filtered page that comes back empty is
   not the end of the collection — the end is an unfiltered empty page — so
   the client's termination rule has to be stated with the filter (see
   filter-after-return-under-limit).

## Where this subject ends

Three neighbouring subjects also say "too much", and the refusals must not
be confused. The boundary against
[rate limiting](../../resilience/rate-limiting/rate-limiting.md) is the
axis of measurement: rate limiting bounds how many requests a key may cause
per unit time, and its limit-derivation technique prices one admitted request
to set a ceiling on the rate. This subject bounds the size of one
enumeration — how many keys one request may return and how much memory and
how many policy evaluations that one request may pin. The rule a reader uses
to pick: if the number is per window, it is a rate and belongs next door; if
the number is per response, it is a page and belongs here. The two compose
at exactly one point, and it is worth naming: the rate limiter's price of an
admitted list request is a function of this subject's page size, so a list
whose page is unbounded cannot be priced and therefore cannot be rate-limited
honestly. Bound the page first; then the rate has a unit.

The boundary against
[scope design](../../../security/identity-and-access/authorization/techniques/scope-design.md)
is the difference between the vocabulary and one word in it. Scope design
owns scopes as contracts: one registry, an enforcement point per scope, exact
matching, intersection as the only combination rule. This subject owns the
enumeration-shaped capabilities that registry carries — a list capability, a
separate recursive-scan capability, a pagination ceiling as a per-path
property — and the merge semantics that are particular to numbers: a ceiling
across merged policies resolves to the minimum, which is intersection
expressed in integers, and an explicit deny absorbs everything, which is the
same rule the scope registry applies to capability sets. The reader picks by
asking whether the question is "what does this scope mean and who checks it"
(scope design) or "what does a limit mean when three policies each state
one" (here).

## What "done" looks like for this subject

An enumeration layer meets the bar when every list path takes a position key
and a limit and no path takes a cursor; when the store's interface exposes a
seek and the stores that cannot seek carry the documented fallback rather
than a silent full scan; when the default page size is a derived number with
its arithmetic recorded beside it and overridable at deploy time; when the
contract for every list endpoint states, in one sentence, that pages are not
transactionally bound and what a caller who needs a consistent view does
instead; when the policy language can cap a page per path, an explicit deny
wipes the list capability, and the merge of several ceilings is the smallest
one; when the recursive scan is a verb with its own capability and is not
reachable by a flag on the flat list; and when result filtering, where it is
enabled, is enabled only on paths where the limit is enforced, and the
client-side termination rule for filtered pages is published beside the
filter. The failure this bar prevents is the quiet one: a list that works
for every developer and every test, and fails for the one operator whose
collection grew, at the moment the collection is the largest it has ever
been.
