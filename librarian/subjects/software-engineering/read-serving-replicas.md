---
domain: software-engineering
subject: read-serving-replicas
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
---

# read-serving-replicas

Forged 2026-09-02 from the openbao harvest (6 techniques, 3 go applications, one tree).
First deepen: run dp-rsr-0926 (2026-09-26), a Curator dispatch on "single stack (go)".
3 -> 5 applications, 2 stacks (go, node). 0 new techniques, 4 techniques conditioned, and
the golden path carries the conditions. One application corrected: the go
client-carried-index application said the index headers were "an accepted design, not yet
landed"; OpenBao shipped them on 2026-09-09 (`c2fb6b42`, #3839).

## State after dp-rsr-0926

- Rung: L2. Two trees were read at current HEAD (openbao `a87e8099`, emdash `e0270dc0`)
  and nothing was run. The one behavioural claim made from reading code alone (emdash's
  bearer requests reach a replica in D1 auto mode, against its CHANGELOG #1662) is marked
  as unrun in the application.
- Stacks: go (openbao: shim, index headers, invalidation hook), node (emdash: D1 bookmark
  cookie, a Durable Object replica with statement classifier plus readonly refusal).
- Techniques with no second-stack application yet: committed-write-invalidation-hook,
  evict-not-update-on-commit, fairshare-invalidation-queues, preemptive-forward-for-known-writes.
  emdash has no invalidation stream above its stores; its caches are edge caches keyed by
  route, not derivations on a replica.

## Counter-evidence, claim by claim

- **forward-on-storage-error: CONFIRMED on the gate, REFINED on the classifier.** The
  industry default routes by verb or statement, and the vendors admit it is a heuristic
  (a framework's verb split; a pooler's hand-kept write-function list). A physical standby
  really refuses (a relational database's hot-standby error list, SQLSTATE 25006). Conditions
  landed: a classifier in front is a latency route that the shim backstops (converged:
  emdash tree, counter lane, blind lane "use both"); the refusal must hold for every account
  (a database's read-only mode exempts privileged users; a logical subscriber is writable);
  the forwarded unit is whatever left no trace, a statement where the store refuses per
  statement and a session carries order.
- **client-carried-index: CONFIRMED, REFINED five ways.** Client-carried positions are
  standard (a document store's cluster time, a GTID wait, D1 bookmarks, a replicated SQLite
  proxy's cookie, `WAIT FOR LSN` in PostgreSQL 19 beta). Refined: monotone only for
  sequential requests (both trees keep the last, not the greatest); the index names its
  authority (openbao ignores a foreign-cluster index; emdash's DO adapter cannot tell and
  serves stale after 250 ms); a credential carries its own birth index (openbao SSCTs,
  412); a cookie carrier reaches browsers only (emdash CHANGELOG #1662 vs the code); a time
  window is a guess, admissible only for the writer's session with lag-enforced ejection
  (a framework's 2 s window, emdash's per-isolate 60 s window). The "one dead replica halts
  all writes" argument was REFUTED as stated (semi-sync times out to async; quorum commit
  survives a dead standby) and re-grounded: the non-halting waits do not make an arbitrary
  replica fresh.
- **committed-write-invalidation-hook: CONFIRMED against TTL-as-correctness, REFINED on
  backstops.** No source defends a TTL for credentials, deletions or parent lists. A cloud
  cache vendor recommends an expiry on top of write-through, and the lookaside paper pairs
  logged, replayable invalidations with fast-expiring failover pools. Landed: never correct
  by time; a backstop expiry needs its own stream-gap alarm. Step-down on lag is established
  (a proxy's max replication lag, a tablet router's thresholds); step-down on invalidation-queue
  age has no precedent found. A router keeps a minimum of lagging replicas serving, so the
  all-breached policy is now a stated obligation.
- **evict-not-update-on-commit: REFINED.** openbao's shipped form advertises the applied
  index and puts the invalidation condition in the check. The rule now names both
  placements.
- Not verified: Aurora write forwarding and read consistency modes, pgcat routing, Django
  routers, the `WAIT FOR LSN` revert history (third-party only), D1 bookmark ordering (the
  page states none).

## Impact

Maps rebuilt against `1f164c9e` for the five joined projects only (goat, pumper, personas,
systedo-case, ascent), committed on each active branch, pushed in none. Six joined
contexts, all `unknown`: 0 verdicts on this subject anywhere, so 0 went stale. Every join
is lexical (cache, storage, invalidation, commit). No fleet tree reads from a replica.

## Owed to projects

- Map commits unpushed: goat `1af162b`, pumper `aa1dd22`, personas `a58d99a2f`,
  systedo-case `e34f8d05`, ascent `8ceaf168`. Each default branch was already 21 to 104
  commits ahead of origin with other sessions' work, and goat, pumper and personas have
  diverged. Pushing would have published that work under this run.
- Nothing else. No fleet project has the seam.

## Banked leads

- emdash's bearer-token D1 path (application section 3): a test that a bearer POST then GET
  in D1 auto mode lands on a replica would confirm or refute the code reading. Return: an
  upstream contribution session, or a fleet project that deploys emdash.
- The Durable Object adapter's serve-stale-on-timeout could forward via its primary stub.
  Same return condition.
- A second stack for the invalidation techniques. Return: a tree with derived in-memory state
  on a replica (a consensus-replicated service other than openbao, or an app caching on a read
  replica with a change stream).
- Invalidation-queue age as a step-down signal is unprecedented in mainstream routers. Return:
  if a production system is found measuring it, or a fleet project builds a replica cache.
