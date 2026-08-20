---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: scoped-dedup-keys
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [a sustained breach re-fires on every admission, scoped and global caps suppress each other's alerts, designing an alert cooldown]
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
alerts that are already edges (a task dead-lettering, a one-shot failure):
deduping a genuine edge event risks eating a second, distinct failure that
happens to share a key within the cooldown.
