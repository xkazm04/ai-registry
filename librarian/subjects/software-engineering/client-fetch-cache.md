---
subject: client-fetch-cache
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
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
