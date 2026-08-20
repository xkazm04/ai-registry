---
layer: technique
type: technique
subject: usage-limit-governance
technique: dimension-scoped-caps
status: forged
laws: [server-owns-the-accounting-clock, never-present-absence-as-an-answer]
shared_with: []
use_when: [capping one model or provider without touching other traffic, giving a staging credential a smaller budget than production, per-customer spend ceilings]
---

# Dimension-scoped caps

A project-wide cap answers "how much may this installation spend"; real
governance questions are narrower — cap *this model* at five dollars a day,
give *the staging credential* a small budget while production keeps its
real one, stop *this customer* before their experiment becomes an invoice.
The technique is binding a rule to one value of one traffic dimension so
that it counts, warns about, and rejects exactly that slice and nothing
else.

## The dimension set

The useful scopes fall out of what an event already carries: provider,
model, use-case label, the credential that wrote it, the billing customer
it is attributed to. Two rules about the set:

- **The customer dimension is the same linkage the money uses.** Scope
  customer caps by the identifier margin and billing analytics already
  group on — inventing a parallel customer notion for limits guarantees
  the cap and the invoice disagree about who spent what.
- **Attribution dimensions are server-stamped or they are worthless.** The
  credential dimension must be the identity the server derived from the
  authenticated request, never a field the client asserted; a client-
  writable attribution field lets any caller launder traffic onto another
  budget — or off its own — with one key in the payload.

## Identify credentials by opaque id, never by material

A scope value leaks: it appears in rule listings, status payloads, alert
messages, dedup keys. So a cap on a credential must reference an opaque
row identifier — generated independently of the secret — not the key
material and not a hash of it. A hash feels safe and is not: it is a
stable fingerprint of the secret, testable by dictionary against leaked
key formats. The id is also usually what the credential-management API
already returns and what the event already carries, which leaves exactly
one identifier to reason about across rules, statuses, and alerts.

## Matching semantics: three rules that prevent three incidents

1. **A non-matching scoped rule is skipped entirely.** It is not evaluated
   against the event, and therefore can neither count it nor reject it. The
   failure this prevents is subtle and severe: an implementation that
   evaluates every rule and rejects on any breach lets a cap on one model
   turn away *another* model's traffic once the capped model is over
   budget — enforcement bleeding across the very boundary the scope drew.
2. **An absent dimension never matches.** An event with no use-case label
   is not charged to any use-case cap; an untagged call is not charged to
   any customer cap; events written before an attribution dimension
   existed are charged to no value of it. Reading absence as some default
   value silently pools all untagged traffic under one cap and bills
   anonymity to whoever owns the default. Absence is a state, not a value
   — but note what this honesty costs: untagged traffic is *ungoverned*
   traffic, so the pre-breach usage surface must show the untagged bucket
   explicitly, and driving it toward zero (by requiring attribution at the
   edge) is part of operating the governance layer, not an optional
   nicety.
3. **Pass dimensions as a named structure, not positional strings.** The
   dimension set grows — it always grows — and a widening tuple of strings
   re-orders every call site silently on the day it does. A struct with
   named fields makes adding a dimension a compile-visible change.

## Each scope keeps its own ledger

Usage totals key on (window, scope): a scoped cap and a project-wide cap
over the same window read *different* rolling totals, and two scoped caps
on different values never share one. The scope also belongs in every
derived key — alert-cooldown dedup, rejection-ledger buckets — because a
scoped cap and a project-wide cap on the same metric and window are
different policies, and folding them onto one key makes each suppress the
other's alerts and pollute the other's counts.

## The pre-breach question

An operator choosing a per-customer or per-credential threshold needs the
current distribution *before* any rule exists: how much has each value of
this dimension spent over this window? Serve that as a first-class status
surface — per-dimension usage breakdowns including the explicit "no value"
bucket — rather than making the operator create a rule and wait for it to
trip. A governance UI that can only describe spend after a 429 teaches
operators to set thresholds by folklore.

## When not to scope

Every scoped rule is one more (window, scope) ledger the substrate
maintains on every admission and one more line in the operator's mental
model. Prefer one project-wide cap plus observe-only scoped rules while
learning the traffic's shape; graduate the scoped rules to enforcement
once their thresholds are informed by the pre-breach surface. And resist
compound scopes (model AND customer) until a real policy demands them —
the ledger count multiplies, and most compound intents are better served
by two simple rules.
