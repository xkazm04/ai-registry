---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: list-verification-by-present-keys
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a transaction lists a prefix and then writes based on the result, a list result reconciled with buffered writes needs a verification hash, a bounded list inside a transaction returns fewer keys than its limit, deciding what a list verification re-executes at apply]
---

# List verification by present keys

A list is a read. A transaction that enumerates a prefix and decides on the
result - "no entry with this name exists, so create it"; "these are the
children, delete them all" - depends on that enumeration exactly as it
depends on a point read, and a list that changed under it is a conflict
with the same consequences. The complication is that the caller never sees
the raw list, and the thing the caller sees cannot be re-executed at apply.

## The rule

**When a transaction verifies a list, hash the keys storage actually
returned for the query storage was actually asked - prefix, starting point,
limit - and never the list the caller received after reconciliation with
the transaction's own buffered writes.** At apply, the state machine
re-executes the same query against the current state, hashes the result the
same way, and compares. The reconciled view is a projection of storage's
answer through the write buffer; the apply step has no buffer, so it can
reproduce only the input to that projection.

The naive reading hashes what the caller got, because that is the list the
caller's decision was made on. It fails in one of two ways depending on how
the apply step tries to match it. If apply re-executes the query and hashes
the raw result, every transaction that listed a prefix and then wrote under
it refuses itself: the caller's view included the write, storage's does
not, the hashes differ, and the transaction that most needed a list
verification is the one that can never commit. If apply tries to repair
this by replaying the transaction's writes over the list before hashing, it
has to know which keys in the entry are under which listed prefix and in
which order, it has to get the reconciliation identical to the caller's
code, and a divergence between the two reconciliations is now a silent
false pass rather than a loud false refusal. Both spellings put the gate on
a proxy ([gate-sees-target](../../../../_laws.md#gate-sees-target)); the
storage result is the target.

## What the hash covers

The hash covers the ordered sequence of keys storage returned, and the
query that produced them - prefix, the key the page started after, and the
limit. A key's *presence* in the result is what the transaction depended
on, not the value behind it; a list verification says "these keys existed
under this prefix, in this order, at this bound", and a transaction that
also depends on a value reads that key and gets a point verification for
it. Folding the query parameters into the hash is
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) for
enumerations: a set of keys without the bound it was fetched under can be
matched by a different set fetched under a different bound, and the apply
step must be unable to confuse the two.

## The limit arithmetic

Reconciliation changes the count. If the caller asked for at most L keys
and the transaction has deleted some of the keys storage returns, the
reconciled page needs more raw keys than L to fill; if the transaction has
added keys under the prefix, the reconciled list can exceed L and must be
truncated. So the cursor walk is driven by the reconciled count - it
continues until L reconciled keys exist or the prefix is exhausted - and
the number of raw keys it consumed to get there is a fact the caller's L
does not state. **The limit recorded in the verification is that consumed
count**, not the caller's L: apply replays "the first N raw keys under this
prefix after this point" with N equal to what the walk actually visited,
and hashes those. A transaction that records the caller's limit has hashed
a query it never ran, and apply will either stop short of keys the
transaction saw or run past them.

Two list calls in one transaction with the same prefix and start point
collapse to one verification: the one with the larger consumed count,
because a longer walk from the same start covers the shorter one. Lists
with different start points do not collapse even under one prefix - the
walks are disjoint and neither hash implies the other - and an
implementation that merges them has weakened a verification to save an
entry.

An unbounded list has no arithmetic to do and also no bound on the
verification's cost; a transaction listing a prefix with a hundred
thousand keys under it hashes a hundred thousand keys into one entry, and
the apply step re-reads all of them under the single writer. The cap on
transaction size bounds this indirectly; the interface should bound it
directly by refusing an unbounded list inside a transaction or by clamping
it to the same limit non-transactional lists are clamped to.

## What apply re-executes

Apply runs the query storage ran: same prefix, same start, same limit,
against the current state. It hashes the returned keys with the same
function and compares to the verification. It does not consult the entry's
writes, because those writes have not been applied yet and, if the
verification fails, never will be. And it hashes the **same projection**
commit hashed: if commit hashed the raw keys the cursor visited, apply
hashes the raw keys the cursor visits, not the entry names a caller would
be shown. A list helper that returns both the reconciled entries and the
raw keys invites the mistake of hashing one at commit and the other at
apply; the two agree for a flat prefix with no start point and disagree
the moment a key is nested or a start point filters the first key, and
the disagreement is a refusal of a transaction whose list never changed.
The refusal is in the safe direction, which is precisely why it survives:
a fast path that skips the re-hash when nothing under the prefix moved
hides it from every test that does not force the slow path with a nested
prefix. A list verification and the point
verifications in the same entry are checked in the order they were
appended, which is the order the caller made them; a transaction that
listed, then wrote, then listed again gets two verifications with two
different storage answers only if storage's answer actually differed, which
it does not - both were served from the same snapshot, and the second list
differs from the first only through reconciliation, which is exactly the
part that is not hashed.

## Decision rules

When a transaction lists, verify the storage answer, with its query
parameters, at the limit storage was queried with. When buffered deletes
fall under the listed prefix, query storage above the caller's limit by at
least their count before reconciling. When a list inside a transaction is
unbounded, either refuse it or clamp it, and say which in the interface.
When a transaction depends on the values behind listed keys, read them; the
list verification covers presence and order only.

## When not to reach for this

A transaction that lists for display and writes nothing under the prefix
still records the verification, but by [no-writes-no-log](./no-writes-no-log.md)
never ships it if it writes nothing at all; the cost is the hash, paid
locally. Outside a transaction a list has no verification and no
reconciliation, and pagination's own honesty rules - a page may miss or
duplicate entries created mid-iteration - are the neighbouring subject's,
not this one's.
