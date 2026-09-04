---
subject: background-jobs
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# background-jobs

First touch: 2026-09-03, an `/intake` run over a doctrine corpus ([[2026-09-03-rusttraining]]).

## State

+2 amendments. Also named as `shared_with` on
`job-coordination/no-unrestorable-state-at-a-suspension-point`, the run's
highest-confidence finding.

**Golden path — the roster rule applies to spawned work, not only to registered
loops.** Concurrent work is spawned into a named group that can enumerate, await
and abort its members. Work with no owner cannot be counted, waited for or
stopped, and its cardinality is whatever the input happens to be. This fills a
space `drain-and-shutdown.md:61-63` explicitly hands off ("the executor's drain
problem"). Inverts for work that must outlive its parent and is owned by its own
durable record — `job-coordination`'s regime, where the record is the owner and
the group is not.

**`tick-isolation` — the failure the envelope does not catch: a tick that never
yields.** The technique models panics; this is per-worker starvation, where one
non-yielding unit blocks everything queued behind it on a scheduler that advances
work only when work yields. Three properties each defeat a layer: the deadline may
not fire because timers are advanced by the same scheduler; the victim is not the
culprit; and it scales with contention. Inverts where the non-yielding span is
microseconds, and the offload is ceremony.
