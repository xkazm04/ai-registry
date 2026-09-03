---
layer: technique
type: technique
subject: fault-signal-propagation
technique: last-value-degradation
status: forged
laws: [unknown-is-not-a-value, identity-survives-reuse, silent-state-is-ungoverned]
shared_with: []
use_when: [a consumer stops entirely because one of several inputs died, designing what a stage does while an input is stale, a restarted producer's first values are fused with the old producer's cached ones]
---

# Degrading on the last value

Telling a consumer that an input died is only half a mechanism. The other half is
leaving it something to act on, so that the response to a dead input can be
something other than stopping. That something is a **per-edge cache of the last
value received**, and the rule that makes it useful is the one every
implementation gets backwards on the first attempt.

## The cache survives the close

The instinct on receiving a close is to clear the cached value: it is stale, and
stale data is dangerous. The instinct inverts the actual economics. The close is
the exact moment the cached value becomes load-bearing — before the close the
consumer had live data and did not need a cache; after it, the cache is the only
material a degraded decision can be made from. Clearing it converts "I hold a
detection that is 400 milliseconds old" into "I hold nothing", and a consumer
holding nothing has exactly one option, which is the option this whole subject
exists to avoid.

**A close never clears the cache.** What a close changes is the *metadata* the
cache carries.

## A cached value travels with its age and its edge's health

A stale reading served without provenance reads identically to a fresh one. Any
consumer accessor that returns a bare value has laundered an unknown into a
definite one
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), at the
one boundary where the difference decides behaviour. Every read of the cache
therefore returns three things together: the value, its age, and the current
health of its edge.

The consequence is that the consumer's degraded decision is made from surfaced
state rather than an implicit assumption
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)) —
and it is inspectable afterwards. A consumer that produced an output while
running on two stale inputs should be able to say so in its own output's
metadata, because otherwise the downstream stage repeats the same laundering one
level further out and the confidence of the final result is unrelated to the
evidence behind it.

## The degraded modes are designed before the outage

Given material, a consumer chooses from a small set of behaviours that were
decided at design time, per edge:

- **Continue on the last value**, bounded by a stated maximum acceptable age.
  Beyond that age the value is not merely old; it is inadmissible, and the
  consumer escalates to one of the modes below.
- **Fuse with fewer inputs**, and widen the declared uncertainty of the output to
  match. A fusion stage that silently drops from four sensors to two and reports
  the same confidence has produced its most dangerous output of the run.
- **Reduce capability** — a slower, more conservative policy that the surviving
  inputs actually support.
- **Enter a declared safe state**, for edges marked critical.

**Criticality is declared per edge by the designer, never inferred by the
runtime.** No supervisor can know that one measurement edge is survivable and
another is not; that is domain knowledge, it belongs beside the edge declaration,
and its absence defaults to critical, because the failure of guessing
"degradable" is worse than the failure of guessing "critical".

The maximum acceptable age is a *different number* from the staleness deadline
and both are needed. The deadline says "you should be told this input has gone
quiet"; the age bound says "you may no longer act on what you last got from it".
The first is usually shorter — a consumer wants notice before its material
expires, so that a degraded mode is entered deliberately rather than discovered
at the moment the last usable value goes out of date.

## A restart does not automatically make the cache trustworthy

When a producer restarts, its consumers are told. The tempting response is to
mark the edge healthy again and continue. That is safe only when the new
instance is *the same source* as the old one.

It often is not. A restarted device driver may have re-enumerated onto a
different physical device; a re-initialised estimator comes back with a reset
coordinate frame or a cleared calibration; a reconnected upstream may have
skipped an unknown interval. Fusing values from before and after such a restart
produces output that is smooth, plausible and wrong — the worst failure shape
available, because nothing downstream can detect it.

So the rule is conditional: **a restart resets the edge to healthy only when the
producer's source identity is established and unchanged.** That requires an
identity that survives the restart and is carried with the data
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)) — a
declared source map, a device identity, a calibration epoch. Where no such
identity is available, the restart *invalidates* the cache rather than restoring
it: the consumer degrades to no-value for that edge until the new instance has
published, which is honest and briefly expensive, instead of continuous and
quietly wrong.

Even with the identity proven, the restart restores **eligibility, not health.**
The producer being alive again is not evidence that it has published; marking the
edge healthy on the announcement hands application code a cached pre-restart value
labelled current, which is the exact laundering this technique exists to prevent,
performed by the recovery path instead of the failure path. Health returns with
the first post-restart message, which is also what proves the edge recovered.

## Decision rules

- **Cache per edge, not per consumer.** One value per input, keyed by edge
  identity; a single "last input" is unusable to a consumer with four of them.
- **Never return a cached value without its age and edge health.** One accessor,
  returning all three, so that a caller cannot accidentally take the value alone.
- **State a maximum acceptable age per edge, distinct from the deadline.**
- **Declare criticality per edge; default to critical.**
- **Propagate degradation downstream.** An output computed under degradation says
  so, so that the next stage's own degraded logic runs on truth rather than on a
  full-confidence claim built from stale parts.
- **On restart, restore only on proven identity; otherwise invalidate.**

## When not to use this

Values that are **events, not states**, do not cache meaningfully. A cached
"button pressed", "goal reached", or "collision detected" is not a degraded
reading — it is a phantom, and a consumer replaying it acts on something that
happened once, minutes ago. Only state-shaped edges (a measurement, a pose, a
mode, a status) have a "last value" that means anything when it is old.

Values whose acceptable age is shorter than the time it takes to notice a fault
also gain nothing: if any value older than the detection latency is inadmissible,
the cache is empty at every moment it would be consulted, and the consumer should
be designed around the safe state instead of around degradation that cannot
happen.
