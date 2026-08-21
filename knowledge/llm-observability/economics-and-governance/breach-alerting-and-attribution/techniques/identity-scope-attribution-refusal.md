---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: identity-scope-attribution-refusal
status: forged
laws: [aggregates-leave-identity-behind, never-present-absence-as-an-answer]
shared_with: []
use_when: [a per-key or per-customer cap breaches, deciding what an alert payload may enumerate, reviewing alerts as a data-exfiltration surface]
---

# Identity-scope attribution refusal

Some caps are scoped to an **identity**: one API key, one customer. When such a
cap breaches, the attribution machinery *could* answer richly — which keys
spent what, which customers are burning the budget. The technique is the
deliberate decision not to: **identity-scoped breaches are never attributed
inside the alert payload.** The alert states the scope (the operator's own
rule) and points to the authenticated surface that does answer the question.
This is a refusal by design, and it must be written down as one, or a
well-meaning future maintainer will "fix" it.

## Why the channel decides, not the data

An alert channel fans out to whoever holds the endpoint. A chat webhook posts
to a room whose membership churns; a push topic is subscribable by anyone who
learns its name; an email list grows forwarding rules. The alerting system
cannot enumerate its audience at delivery time, and any audience it could
enumerate today is not the audience next quarter. So the payload must be
composed for the **widest plausible audience** — and against that audience,
key identifiers are credentials-adjacent material (an attacker's shopping
list, a correlation handle across leaked logs) and per-customer spend is
confidential business data (revealing to anyone in the room which customer is
largest, growing, or in trouble).

The dividing line generalizes cleanly: **infrastructure axes** (providers,
models, workload names) describe the operator's own system and may be
enumerated into a broadcast; **identity axes** (keys, customers, and anything
that resolves to a person or an account) describe *other parties* and may not.
When a new scope type arrives, classify it on that line before wiring
attribution.

## The mechanical reinforcement

There is a second, humbler reason the refusal is cheap to hold: the rollups
that attribution reads are grouped by model and workload, and *cannot* be
filtered to one key or customer. Keeping identity axes out of the standard
rollup grouping means the leak is not one code review away — the convenient
data structure simply does not contain the answer. This is worth engineering
deliberately: make the safe composition the only composition the alert path
can reach, rather than relying on a comment to stop the enumeration. A
boundary enforced by data shape survives maintainers; one enforced by
discipline does not.

## Refuse loudly, with a forwarding address

The refusal must not present as a malfunction. An identity-scoped breach whose
attribution section is silently absent reads as "the enrichment broke," and
the natural bug report leads to someone adding the enumeration. Instead the
payload carries an explicit scope note: the scope label the operator
configured, plus a pointer to the **authenticated, tenant-scoped surface**
(the limits-usage endpoint, the per-customer console) where the per-identity
breakdown is available to callers who present credentials for it. The alert
answers "where do I look," which is the legitimate kernel of the question,
while the sensitive answer stays behind access control.

Two properties of the pointed-at surface matter: it must be scoped by the
authenticated principal (a project token sees its own keys, not the
platform's), and it must actually exist before the refusal ships — a refusal
pointing at nothing teaches operators to hate the boundary.

## Decision rules

- When scope resolves to a key, a customer, an end user, or any
  account-shaped thing → no contributors in the payload, scope note with
  pointer, always.
- When an operator asks for per-key attribution "just in our internal
  channel" → the channel's membership is an assertion the system cannot
  verify; the answer stays no, and the internal audience uses the
  authenticated surface like everyone else.
- When designing digest emails or periodic summaries that *are* explicitly
  per-tenant and delivered to verified tenant contacts → this technique does
  not apply; that is an authenticated surface with a known audience, not a
  broadcast.

## When not to use this

The refusal governs broadcast alerting, not observability generally.
Authenticated dashboards, per-tenant reports delivered over verified
channels, and the operator's own ad-hoc queries are exactly where identity
attribution belongs — starving those surfaces in the name of this boundary
just moves the enumeration into hand-run queries with no audit trail. The
technique is about *where* the answer may appear, never about whether the
operator is entitled to it.
