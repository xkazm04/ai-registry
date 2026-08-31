---
subject: client-fetch-cache
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# client-fetch-cache

First touch: [[2026-08-22-11]], external reconcile against `TanStack/query`
@ `40321a0` (query-core 5.102.0) - the wave that began drawing second stacks
from framework-agnostic cores. Gained `node--cache-key-discipline`
(uncovered); single-stack debt cleared. The Map/Set silent collision was
verified EMPIRICALLY by running the hash function, not by reading it.

## Open leads (banked, convergence rule applies)

- Make the key TYPE structured and the string a derived artifact nobody
  handles - stronger than escape/encode/separator, worth promoting to the
  preferred answer.
- Serializer partiality: the key type must be no wider than the serializer is
  total over; where wider, the excess must FAULT, not flatten. (Confirming
  sighting of the unknown-is-not-a-value law - a Map flattening to {} is
  unknown rendered as a definite value.)
- Canonical serialization splits into sort-what-is-unordered vs
  preserve-what-is-ordered.
- The mechanized audit: a lint rule that reads the fetcher's free variables
  and demands they appear in the key.
- Whole-cache buster as the cheaper form of key-namespace versioning.

## Cross-subject proposals

- Join-by-observer with a status gate as a second valid single-flight
  registry shape -> concurrency-guards.
- Structured keys buy prefix invalidation for free -> client-state's
  invalidation-strategy.
- prefetch-and-defer remains uncovered; strong future application against
  this same pin.

### 2026-08-31 - `/intake`, from a single-author blog archive

Gained `admission-hypothesis` (6 -> 7 techniques) and a golden-path amendment.
Source: [[2026-08-31-brooker-blog]].

**The golden path declared its own completeness and was short by one.** "Every
cache declares three policies... a cache missing any one of them is either a
leak or a lie" - Key, Lifetime, Eviction - written as a reviewer's checklist. All
three presuppose the entry is already in. **Admission is the fourth**, and its
default is invisible: everything fetched is stored until a size cap starts
reaping, at which point the cache is deciding what to keep by memory accident.

An admission policy is a stated bet about why an entry will be read again, and
there are only four bets: recency of access, recency of **creation** (frequently
the stronger signal, and the one nobody looks at - new rows churn, old rows go
stable), proximity, and co-writing in time. The corroboration that this is a
real hole rather than tidiness came from two independently forged subjects
making the same unnamed bet: LRU is recency-of-access asserted as a default, and
a single TTL per key family assumes volatility is constant within it.

**The application measured the decay nobody could see.** A route-preload table
was the one place an application stated its admission bet - and **5 of 7 rules
and 8 of 10 targets pointed at routes that no longer exist**, including the
product's entire main flow, which admits nothing at all. A prefetch that never
fires looks exactly like a prefetch that was not needed, so the table rotted
silently at the rate the product changed. That produced the technique's rule
that a stated admission rule owes a check that it can still fire.

Structural fact: the policy was inexpressible. The query client's defaults carry
seven keys and no admission slot, the one policy-taking helper resolves to
exactly lifetime and eviction, and the upstream library offers no admission hook
- so the omission is not local taste. Fleet-wide there is no cache constructor
outside that one application that could take the argument.

## 2026-08-31 — intake `github:TanStack/query` @ `1566c16d` ([[2026-08-31-tanstack-query]])

**Second visit to this same repository, by a different lane.** The 2026-08-22
external-reconcile pass read it at `40321a0` and landed key discipline; this
run read the core and landed policy *resolution*, which that pass did not
touch. The source ledger had no row for it because reconcile does not write
one — worth knowing before a third lane pays for the clone again.

Gained `plural-policy-claims` + `next--plural-policy-claims` (experiment,
better). The finding is an **enumeration blind spot**: the golden path's four
policies are all written for a *single declarant*, and a cache keyed by
argument has a set of claims per policy. The code resolves that set with three
different quantifiers — max-and-monotonic for retention, existential for
believability, first-match for a shared trigger — plus reference counting so
the eviction clock starts only when the last claimant leaves.

Measured in `goat`: 7 of 50 keys are shared, **2 diverge numerically (2.0x,
3.0x)**, and both are prefetchers claiming longer freshness than their
consumer, so the prefetch's stated warmth is inert.

### Open leads

- **Two sites register one key with two different fetch functions** (seen in
  `goat` while verifying the census). A key-discipline defect, live instance,
  outside this run's picks. Return when `cache-key-discipline` is next swept.
- **Await-shaped fetch ergonomics serialize independent work.** Two suspending
  reads in one component run serially where two non-suspending ones run in
  parallel; concurrency has to be expressed by a plural primitive. Untriaged
  (row 5), anchored in the source note.

**Shipped** `goat` `d4995c3`: both colliding alias tables deleted, the two
prefetch claims aligned to what the cache resolves. Divergent shared keys
**1 -> 0**. Correction to the row above: **one** key diverges
explicit-vs-explicit; the second is explicit against the resolved client
default, which is real but invisible to a reviewer reading two call sites.
