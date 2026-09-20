---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: scoped-dedup-keys
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [a sustained breach re-fires on every admission, scoped and global caps suppress each other's alerts, designing an alert cooldown, an alert carries a periodically flushed counter delta]
---

# Scoped dedup keys

A rolling-window limit breach is a **level, not an edge**. The window's usage
exceeds the threshold, and every admission from then on re-detects the same
condition until enough old spend rolls off — which for a monthly cap can be
weeks. Deduplication is therefore not an optimization of breach alerting; it is
the difference between an alert channel and a denial-of-service attack on the
operator's attention. The design surface is the **dedup key**: which breaches
count as "the same one," and which are genuinely distinct events entitled to
their own notification.

## The key is a claim about sameness

Two breaches share a dedup key exactly when the operator, seeing the second
within the cooldown, would learn nothing new. Work backwards from that:

- **Project (tenant)** — in the key. Two projects breaching the same metric are
  two different incidents with two different owners.
- **Metric** — in the key. A cost breach and a call-count breach on the same
  project are different diagnoses (an expensive model vs a runaway loop), even
  when one causes the other.
- **Window** — in the key. An hourly spike and a monthly exhaustion on the same
  metric are different urgencies: one may pass, the other will not.
- **Scope** — in the key, and this is the piece most implementations miss. A
  cap scoped to one model and a project-wide cap on the same metric and window
  are **independent rules with independent cooldowns**. If scope is omitted
  from the key, whichever rule fires first silences the other for a full
  cooldown — and the suppressed one is often the more specific, more actionable
  alert. The rule: *every axis that distinguishes one configured rule from
  another appears in the key.*

What stays **out** of the key is equally deliberate: the current value, the
ratio, the triggering event's identity, and — critically — anything describing
*how* the breach was detected. A key that includes the current value never
matches (the value moves every admission); a key that includes the detection
path (scheduled sweep vs on-request check) lets the same breach alert once per
mechanism, so enabling automation multiplies volume. The key names the
*condition*, never the *observation of the condition*.

## The exception: a payload the sender cannot re-derive

"The key names the condition, never the observation" holds because a level
survives its own suppression. Drop a breach notification and the breach is
still there, still re-detectable on the next admission, still readable from
the store — the only loss is timeliness. That property is doing more work in
the rule than it looks, and it fails for one class of payload.

Some alerts carry a **delta** rather than a level: a periodic flush of a
counter that is reset by the act of reading it. The count of ingest attempts
a cap turned away is the canonical case — a rejected call is deliberately
never stored as an event, because storing it would corrupt the very usage
totals the cap is evaluated against, so the only ledger is an in-process
counter and the flush is a destructive read. Suppress that notification and
the number is gone: there is no store to re-read, no next admission that
re-derives it, nothing to be late about. A dedup key that names only the
condition makes consecutive flushes collide, and the cooldown silently
deletes real accounting.

The arithmetic is unforgiving and easy to check: with a flush cadence that
divides the cooldown N times, N−1 of every N flushes are destroyed. A
quarter-hour cadence under an hour-long cooldown loses three flushes in
four — not degraded, not delayed, **gone**, and gone in exactly the
situation the deltas describe, because a sustained rejection storm is
precisely when every flush is non-empty.

So the discriminator is not "condition versus observation" but **whether the
payload is re-derivable from durable state**:

- **A level** — usage against a threshold, a ratio, a forecast — is
  re-derivable. Key it on the condition, and let the cooldown do its job.
- **A destructively-read delta** is not. Every occurrence is a distinct
  fact, so the key carries the occurrence instant and every flush is its own
  row. That is not smuggling the detection path into the key: the flush
  instant is not *how* the condition was noticed, it is *which* delta this
  is. Two flushes are two different facts that happen to describe the same
  condition.

This is the same boundary the closing section draws around genuine edges,
reached from the payload's side. The test to apply before designing a key:
*if this notification is dropped, can the number in it be recovered from
anywhere else?* A no makes the alert an edge, whatever the condition behind
it looks like. Where an edge's key must therefore carry an instant, the
burst protection it loses has to be bought back elsewhere — a flush cadence
chosen as the real rate limit, an empty-delta flush that emits nothing —
rather than by the cooldown, which can only buy it with data.

## Cooldown semantics

The cooldown is a per-key timer: first breach delivers, subsequent matches
within the cooldown are dropped, and the first match after expiry delivers
again — which for a still-sustained breach functions as a deliberate periodic
reminder, not a bug. Choose the cooldown against the shortest window you
enforce: a cooldown longer than the window can swallow a breach-clear-breach
cycle entirely; a cooldown much shorter than the window reintroduces the storm
in slow motion. One global default with an override knob is enough; per-rule
cooldowns are rarely worth their configuration surface.

The timer runs on the **server's clock**, keyed at delivery decision time —
never on any timestamp the ingesting client supplied. A client-writable time
entering the dedup decision would let a caller replay old event times to hold a
breach permanently inside its cooldown, muting enforcement alerts for a budget
they are actively burning.

## Warnings dedup separately

A soft warn tier below the cap needs its own key space (the same axes, plus the
tier). If warnings and breaches share keys, the warning that fired at 80%
consumes the cooldown, and the actual breach at 100% — the alert that matters —
is silently dropped. The tier is part of what the operator learns, so it is
part of the key.

## Dedup is one layer of a three-layer field stack

Mature alerting pipelines separate three mechanisms this technique should not
be mistaken for each other. **Deduplication** — this technique — drops repeat
observations of one condition under a cooldown. **Grouping** batches several
*distinct* keys that fire close together into one notification (a short
gather-wait, then a single message listing the members), trading a little
latency for a calmer channel during a platform-wide event. **Inhibition** is
*configured* suppression: an operator-authored rule saying "while this alert
fires, hold that one," used when one condition makes another redundant.

The distinction resolves an apparent conflict with this technique's core rule.
Scope belongs in the key because *accidental* suppression — two independent
rules colliding on an underspecified key — is a bug nobody chose. An operator
who then decides the project-wide breach should hush its per-model children
during a shared incident is expressing *deliberate* suppression, which belongs
in an inhibition layer where it is visible, reviewable configuration — never
smuggled in by widening the dedup key. Keys stay maximally specific; any
coarsening of what the operator hears is an explicit, separate decision.

## Honest limits of in-memory dedup

Dedup state held in process memory resets on restart and is per-instance under
horizontal scaling: a deployment of N instances may emit up to N copies of one
breach per cooldown, and a restart mid-breach re-alerts immediately. Both are
usually acceptable — duplicate alerts are a nuisance, missed alerts are an
incident — but the asymmetry must be a documented decision, and any move to
shared dedup state (a table, a coordination service) must weigh the new failure
mode it imports: a dedup store outage must degrade to *alerting anyway*, never
to silence.

## When not to use this

Do not dedup across projects to "summarize" a platform-wide event — each tenant
breach has a distinct owner and a distinct remediation, and a rollup belongs in
a digest, not in the incident path. And do not apply cooldown-style dedup to
alerts that are already edges (a task dead-lettering, a one-shot failure, a
flushed counter delta): deduping a genuine edge event risks eating a second,
distinct failure that happens to share a key within the cooldown — and where
the edge's payload is not re-derivable, "risks eating" is "destroys". Such a
key carries the occurrence instant, per *The exception* above.
