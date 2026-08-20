---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: off-request-path-delivery
status: forged
laws: []
shared_with: []
use_when: [wiring breach notification into an ingest path, an alert sink outage is affecting tenant traffic, deciding what work runs inside the admission decision]
---

# Off-request-path delivery

Breach *detection* has to happen on the request path — the admission decision
needs the verdict synchronously, because an enforcing cap must reject the event
before acknowledging it. Everything downstream of the verdict does not:
formatting the message, querying rollups for attribution, and the network round
trip to a webhook, a push topic, or an email relay. The technique is a strict
partition: **on-path work ends at the boolean; delivery is a spawned task with
best-effort semantics.**

## The dependency inversion this prevents

An alert sink is, by nature, third-party and unvetted: a chat platform's
incoming webhook, a self-hosted push relay, someone's transactional email
provider. Put delivery on the request path and the availability of tenant
ingest now depends on the availability of a notification channel — the least
reliable component in the system gates the most important one. Worse, the
coupling activates precisely at the worst time: breaches correlate with traffic
spikes, so the moment delivery volume peaks is the moment the sink is most
likely to slow down, and its slowness back-pressures the ingest path *during
the spike*. The instrument must never depend on the megaphone.

## The procedure

1. **On-path**: evaluate limits, produce the admission verdict and the list of
   breached/warning statuses. Log the breach synchronously — a structured log
   line is the one delivery channel with no external dependency and it must
   never be lost to a spawn failure.
2. **Hand off**: pass the breach statuses (plus any small out-of-band figures
   already in hand, such as the running rejection count) to a spawned task.
   Pass *data*, not database handles doing on-path reads: the spawn boundary
   is where the latency budget ends.
3. **Off-path**: inside the task, dedup-check, compute attribution (this is
   where the rollup queries belong — they cost the ingest path nothing here),
   format per channel, and deliver to each configured sink independently.
4. **Best-effort, per sink**: one sink failing must not stop the others; a
   failure is logged and dropped, not retried into a queue that can grow
   unboundedly during exactly the incident that caused the failures.

## Best-effort is a semantic, not a shrug

"Best-effort" here is a deliberate contract with three clauses. Delivery
failure never propagates to the tenant — the event's admission or rejection
was already decided and answered. Enrichment failure never blocks delivery — if
the attribution query errors or returns nothing, the alert ships without the
attribution section rather than waiting or dying; the alert's first duty is to
arrive, its second to explain. And ordering is not guaranteed — spawned tasks
may deliver out of order under load, so the payload carries its own facts
(current value, threshold, window) rather than relying on arrival order to
tell a story.

The one thing best-effort must **not** mean: silent. Every failed delivery is a
logged, countable event. An operator who configured a webhook six months ago
needs a way to discover it has been 404ing since a channel rename — a delivery
failure counter or a startup-time channel summary is the minimum.

## Decision rules

- When a piece of alert work needs a database read, it runs in the spawned
  task — no exceptions for "fast" queries; fast queries stop being fast under
  the concurrent load that accompanies breaches.
- When a new channel type is added, it joins the same spawned fan-out with the
  same per-sink isolation; never a special synchronous case because "email is
  important."
- When someone proposes delivery retries, bound them tightly (small count,
  short backoff, in-task) or route genuinely-must-arrive notifications through
  a durable queue owned by a different subsystem — the ingest-adjacent spawn
  is the wrong place for durability machinery.

## When not to use this

The pattern is for *notification*. It is not for the enforcement side effects
themselves: recording a rejection into the ledger, incrementing counters that
future admission decisions read — those must be on-path and consistent, because
the next request's verdict depends on them. If a side effect's loss would
change a future admission decision, it is accounting, not alerting, and it does
not belong in the best-effort task. Likewise, a synchronous "test this webhook"
button in an admin surface should deliver on-path deliberately — there the
caller *wants* to wait for the sink's answer.
