---
subject: runner-fleet
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# runner-fleet

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-31 - `/intake`, from a single-author blog archive

Corrected `capability-typed-queues`. Source: [[2026-08-31-brooker-blog]].

**One welded phrase mispriced a decision.** The file said "Every distinct size is
a separate pool **with its own queue** and its own idle capacity... Fewer types,
more depth per type" - joining two objects and charging the whole cost to the
wrong one. Partitioning *machines* costs pooling, which is real and is what that
bullet is about. Partitioning *queues* over machines that are already
non-fungible costs nothing, because the pooling benefit was never available: a
job needing a pinned toolchain cannot run on a runner that lacks it, whatever
line it waited in. What a merged line adds is head-of-line blocking. The
neighbouring technique already concedes the residual idle cost without noticing
that the fix for *that* is elastic capacity per type, next door.

**The technique is unapplied, and the enumeration that establishes it is worth
keeping.** Across all seven managed projects: 17 workflow files, 60 runner
declarations, 8 distinct labels, and **zero self-hosted runners in any tree or
any commit in any history**. Every runner is platform-hosted, so the queue is
per-label by construction and no project can merge or split it - the decision
this technique governs has never been available to the fleet. The nearest
reachable shape is a `needs:` barrier over a heterogeneous matrix, which is the
same mechanism at a different merge point, and it cost one project three
consecutive cancelled releases when a retired runner image left one leg
unsatisfiable.

Return condition is already named by the fleet itself: one project marks an
adoption point for a self-hosted ingest runner whose store cannot exist on a
hosted one. When that lands it will hold two genuinely non-fungible runner
classes and the queue decision becomes real for the first time.
