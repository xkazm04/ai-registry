---
layer: technique
type: technique
subject: client-fetch-cache
technique: one-owner-per-datum
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [a router preload store and the fetch cache both hold the same response, a store or context keeps a copy of a list the fetch layer already caches, two lifetimes are being tuned to agree for one datum, a refresh control clears one cache while the screen reads another, a field documented as cached is never written, deciding which of two client caches owns a datum]
---

# One owner per datum

The golden path asks every cache to declare four policies. It assumes one
cache per datum. A client grows a second one without anyone deciding to:
a router that keeps what its loaders returned, with its own preload window
and its own collection time; a store or context that keeps "the list" for
convenience beside the fetch cache that already keeps it; a module-level
last-result map wrapped around a read the fetch layer also remembers. Each
copy has its own lifetime, its own eviction and its own invalidation
surface, and they hold one datum.

## Do not tune both

The reflex is to make the two agree: shorten one window, lengthen the
other, invalidate both on a write. That is two sets of four policies that
must stay equal by hand, for every datum they share, through every later
change to either one. They drift the first time someone edits one cache's
settings and does not know the other exists. The visible result is a
refresh that refreshes nothing: the control clears one copy and the screen
reads the other.

**Pick one owner and set the other to zero.** The owner is the layer that
already carries the key, the fetcher and the invalidation surface the event
side drives, which in a client with a fetch cache is the fetch cache. The
other layer keeps nothing: its lifetime and collection time go to zero, so
it hands every read through to the owner, and the four policies are declared
once. A router configured this way still runs its loaders to start reads
early. It just keeps no copy of what they returned.

## Zero by removing the surface, not only the contents

A copy that is kept but never filled is the worst form of zero. Its type
still offers the field, the field still reads as a list, and the list is
empty. The next consumer that reaches for the convenient field gets an
empty answer that looks like a real one: no item matches, an id resolves to
nothing, and the screen behaves as if the data were absent rather than
unread ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).
The defect ships because nothing about it is wrong at the type level.

So where the second cache is your own code (a store field, a context
value, a module map), zero it by deleting the field, its setter and any
clear or refresh action written against it. A consumer that reaches for it
then fails to compile instead of reading an empty list. Any refresh control
that pointed at the deleted copy must point at the owner's invalidation
surface. Where the second cache belongs to a framework you cannot remove,
set its lifetimes to zero and route every read through the owner's
definition ([portable-read-definitions](./portable-read-definitions.md)), so
the framework's copy is never the one a consumer reads.

## What this is not

- **Not derived values.** A memo keyed on the owner's own returned value,
  whose entry dies when the owner replaces that value, is acceleration with
  no lifetime of its own. It is
  [parse-and-derive-caches](./parse-and-derive-caches.md), and it stays.
- **Not a persisted copy.** A durable copy that outlives the session is a
  second cache with independent staleness too, and its admission rule is
  [client-state](../../client-state/client-state.md)'s persistence rule.
- **Not two consumers of one entry.** Several readers with different
  freshness needs on one cache entry are claims, resolved by
  [plural-policy-claims](./plural-policy-claims.md). This technique is about
  two caches, not two readers.

## Checks

- For each datum the client fetches, one layer declares its key, lifetime,
  eviction and invalidation. Any other layer that touches it has lifetime
  zero or does not exist.
- No store, context or module field is documented as a cache of a list the
  fetch layer also caches.
- Every refresh or clear control invalidates the owner's entries, by key or
  prefix. None of them clears a convenience copy.
- A consumer that tries to read the removed copy fails at compile time.
