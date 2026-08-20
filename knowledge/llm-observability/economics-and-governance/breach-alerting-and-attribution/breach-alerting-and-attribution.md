---
layer: golden-path
type: golden-path
subject: breach-alerting-and-attribution
status: forged
use_when: [designing budget breach alerts for tenant traffic, adding attribution to limit alerts, deciding what an alert payload may reveal, forecasting budget exhaustion before it happens]
techniques:
  - scoped-dedup-keys
  - off-request-path-delivery
  - top-contributor-attribution
  - scope-inverted-attribution
  - identity-scope-attribution-refusal
  - notification-channel-security
  - pre-breach-forecasting
---

# Breach alerting and attribution

A usage cap that fires silently is a bookkeeping entry; a cap that fires loudly
is an operational tool. This subject is the craft of the loud part: telling an
operator that a limit is under pressure — without storming the channel, without
delaying the traffic being measured, and while answering, inside the alert
itself, the question every operator asks the moment they read it: **what is
burning the money?**

The seam with builder-side observability matters here more than anywhere else in
the bundle. Builder-side alerting is "my job failed" — the emitter of the
traffic notifying itself about its own errors, on its own infrastructure, to an
audience that already has full read access to everything. This subject is the
operator side: alerting *about tenants* — customers, keys, products — where the
money flowing through the breached window is someone else's, where the alert
travels to a shared channel whose membership the alerting system cannot see, and
where — the deepest structural difference — **the events being alerted on may
deliberately not exist in the database at all**. An enforcing cap that rejects
an event must not store it (storing it would corrupt the very usage and cost
figures the cap reads), so the record of enforcement lives in an out-of-band
rejection ledger, and the alert is the only surface where that ledger becomes
visible. Builder-side intuitions — "just query the events behind the alert" —
fail by construction: there are no events behind the most important alerts.

## The three obligations of a breach alert

A breach alert carries three obligations, and the naive implementation violates
all three at once.

**It must not storm.** A rolling-window breach is not an edge — it is a level.
Once the window's usage exceeds the threshold, *every subsequent admission
re-detects the breach* until the window rolls the old spend off, which can be an
hour or a month. An alerter that fires on detection fires hundreds of times per
sustained breach, and the operator mutes the channel — which is worse than never
alerting, because now the channel exists and lies. The remedy is deduplication
under a cooldown, keyed precisely: project, metric, window, *and scope*, so that
a scoped cap and a project-wide cap on the same metric do not suppress each
other's first notification ([scoped-dedup-keys](./techniques/scoped-dedup-keys.md)).

**It must not tax the path it measures.** The breach is detected on the ingest
path — inside the admission decision, on the latency budget of a tenant's
request. Everything after detection (formatting, attribution queries, network
delivery to a possibly slow or dead sink) belongs off that path, in a spawned
task, best-effort. A down notification channel that can fail or delay ingest has
inverted the dependency: the measuring instrument now depends on the megaphone
([off-request-path-delivery](./techniques/off-request-path-delivery.md)).

**It must answer the next question.** "Budget X breached" is a fact the operator
cannot act on. The actionable version names the top contributors to the breached
window's spend — each with its share and its currency figure — computed from
rollups the system already maintains, inside the delivery task, at zero cost to
ingest ([top-contributor-attribution](./techniques/top-contributor-attribution.md)).
An alert without attribution converts a push notification into a homework
assignment; the operator must open a console, reconstruct the window, and group
the spend by hand — at 2 a.m., during the breach.

## Attribution has a direction, and scope inverts it

The subtle design decision in attribution is not *whether* to attribute but
*along which axis*. For a project-wide cost cap, the useful grouping is by model
— annotated with each model's dominant use-case, because "the expensive model,
mostly doing summarization" is a decision-ready sentence. But for a *scoped*
cap, that grouping is a tautology: a cap on one model, attributed by model,
reports "100%: the model you capped." The informative attribution is always
**within the scope, along the axis the scope did not fix**: a model cap breaks
down by the use-cases driving that model; a use-case cap breaks down by the
models serving that use-case; a provider cap breaks down by that provider's
models. The rule generalizes: *attribute along the free axis, never the pinned
one* ([scope-inverted-attribution](./techniques/scope-inverted-attribution.md)).
And when the scoped window holds no attributable spend, the alert says so
explicitly — an empty contributor list with a stated reason, never a silently
missing section that reads as "nothing to report."

## The alert payload is an exfiltration surface

Here the operator-side nature of the subject bites hardest. An alert channel
fans out to whoever holds the webhook — a team chat room, a paging rotation, a
forwarding rule nobody remembers. The alerting system cannot enumerate that
audience, so it must assume the widest one. That forces a refusal: caps scoped
to an **identity** — an API key, a customer — are deliberately *not* attributed
in the alert. Enumerating key identifiers or per-customer spend into a broadcast
channel is a data leak wearing an ops costume. The disciplined alert states the
scope (the operator's own rule, which they already know) and points to the
authenticated, access-controlled surface that does answer the per-identity
question ([identity-scope-attribution-refusal](./techniques/identity-scope-attribution-refusal.md)).
The general principle: attribution granularity in a broadcast payload stops at
the level of *infrastructure* (models, providers, workload names) and never
reaches the level of *identity* (keys, customers, people).

The content boundary has a transport twin. The delivery pipe itself is an
outbound webhook whose destinations are operator-supplied URLs: unsigned
payloads let anyone who learns the endpoint forge enforcement news, and
unvetted destinations turn the "add a webhook" form into a probe of the
platform's own network. Signing what is sent and vetting where it is sent are
settled field practice with their own technique
([notification-channel-security](./techniques/notification-channel-security.md)).

## Warning is a different event from breaching

A cap that only speaks when it bites teaches operators to fear it. The humane
design adds a soft tier — a warn threshold below the cap — that fires an
advisory before enforcement starts. Two rules keep the tier honest. First, the
warning uses the same dedup discipline as the breach, under its own key, or the
warning storm simply arrives earlier than the breach storm it was meant to
preempt. Second, a warning should be raised only for *admitted* traffic — if the
event that crossed the warn line was itself rejected, the usage figure the
warning would report does not include a recorded event, and the alert would
describe a state the store cannot corroborate.

The static warn threshold has a rate-based sibling from reliability practice:
alerting when the window's *burn rate* — spend per unit time relative to what
the budget affords — would exhaust the budget early, confirmed against a short
recent window so a stale spike cannot page for a fire already out. The two
warn styles answer different questions ("we are near the line" vs "we are
approaching the line unusually fast") and mature deployments carry both; the
rate-based tier's dedup and phrasing obligations are unchanged.

## Forecasting: the alert before the event

The final maturity step is alerting on breaches that have not happened.
A small, explainable model — a recency-weighted level plus a fitted linear
trend, the same arithmetic an operator would do by eye, made precise — projects
each budget forward and each tenant's margin toward its crossover, yielding
"on track to breach in about N days" and "on track to turn unprofitable next
week" ([pre-breach-forecasting](./techniques/pre-breach-forecasting.md)). Three
disciplines separate a useful forecast alert from noise: the projection is
advisory and phrased as such ("about", never a timestamp); an already-breached
budget is excluded (that is the live alert's job — a forecast of the present is
a duplicate); and the forecast alert's dedup key deliberately omits *how* the
forecast was produced, so a scheduled sweep and an on-demand query for the same
subject share one cooldown and enabling the sweep cannot double the operator's
alert volume.

## Failure modes this standard exists to prevent

- **The muted channel** — level-triggered breaches alerted as edges; hundreds
  of duplicates per sustained breach; the operator mutes, and the next real
  breach lands in a channel nobody reads.
- **The megaphone on the request path** — a slow notification sink adding
  latency to (or failing) tenant ingest; the instrument degraded by its own
  announcements.
- **The homework alert** — a bare "limit breached" with no attribution,
  pushing the diagnostic query onto a paged human during the incident.
- **The tautological attribution** — a scoped cap attributed along its own
  pinned axis, reporting the scope back to the operator as if it were news.
- **The leaky payload** — key identifiers or per-customer spend enumerated
  into a broadcast channel with unknowable membership.
- **The double-voiced forecast** — sweep-produced and query-produced forecasts
  deduping separately, so enabling automation doubles alert volume.
- **The phantom evidence assumption** — tooling or runbooks that assume every
  alerted-on event can be looked up, when enforcement-rejected events are
  deliberately never stored and exist only in the rejection ledger the alert
  itself carries.

## What honesty requires the alert to disclose

Dedup state is usually in-memory: it resets on restart, and horizontally scaled
instances dedup independently, so a scaled deployment may emit up to one alert
per instance per cooldown. That is an acceptable trade — but it must be written
down where the operator configures the channel, not discovered during an
incident. Likewise best-effort attribution: when the rollup read fails or comes
back empty, the alert still delivers, minus the attribution section — delivery
never waits on the explanation. The alert's first duty is to arrive; its second
is to explain; its third is to never claim more than it measured.

## The techniques

- [scoped-dedup-keys](./techniques/scoped-dedup-keys.md) — the dedup key as a
  contract: project, metric, window, scope; independent cooldowns per rule
  family; what belongs in the key and what must stay out.
- [off-request-path-delivery](./techniques/off-request-path-delivery.md) —
  detection on-path, everything else off-path: spawned delivery, best-effort
  semantics, and the dependency inversion this prevents.
- [top-contributor-attribution](./techniques/top-contributor-attribution.md) —
  answering "what is burning the money" inside the alert: top-k with share and
  currency, from existing rollups, degrading to silence rather than blocking.
- [scope-inverted-attribution](./techniques/scope-inverted-attribution.md) —
  attribute along the free axis: model caps by use-case, use-case caps by
  model, provider caps by model; empty scopes state their emptiness.
- [identity-scope-attribution-refusal](./techniques/identity-scope-attribution-refusal.md)
  — the broadcast-payload boundary: infrastructure axes may be enumerated,
  identity axes are refused with a pointer to the authenticated surface.
- [notification-channel-security](./techniques/notification-channel-security.md)
  — the transport twin of the payload boundary: sign the exact bytes sent,
  freshness-check against replay, vet operator-supplied destinations, rotate
  secrets without a verification gap.
- [pre-breach-forecasting](./techniques/pre-breach-forecasting.md) — explainable
  projection to "breach in about N days" and margin-crossover warnings;
  window-aware projection semantics; methodology-free dedup keys.
