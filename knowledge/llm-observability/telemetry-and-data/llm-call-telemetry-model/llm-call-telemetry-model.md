---
layer: golden-path
type: golden-path
subject: llm-call-telemetry-model
status: forged
use_when: [designing an ingest schema for LLM call events, auditing why cost or usage rollups disagree with provider invoices, deciding which event fields the server must own, adding token or attribution fields to a telemetry record]
techniques:
  - dual-clock-event-time
  - token-usage-quadruple
  - nullable-cost-never-zero
  - metadata-attribution-keys
  - ingest-skew-rejection
  - server-owned-fields
---

# The LLM call telemetry model

One record type carries the whole weight of LLM observability: the normalized
call event. Every rollup, budget, forecast, margin statement, and quality
sample is a derived view over it. Get the record right and the derived layers
are arithmetic; get it wrong and no amount of dashboard polish recovers what
the ingest path threw away. The design question is therefore not "what fields
are useful" — everything is useful — but **what must a single row still be
able to prove months later, to a reader who was not there**, about identity,
time, quantity, money, and who to bill.

The naive reading treats the event as a log line: whatever the SDK sent,
stored as sent, queried as stored. The principal reading treats it as an
**accounting record that happens to arrive over an untrusted channel**. Those
are different disciplines. A log line is owned by its emitter; an accounting
record is owned by its receiver, and the receiver's schema states — field by
field — what it accepts from the client, what it re-stamps, what it refuses,
and what it prices regardless of what was claimed.

## The boundary: emission is not this subject

The builder-side tracing craft owns span emission inside the application —
where instrumentation hooks live, how spans nest, what a wrapper captures at
the call site. This subject begins where that one ends: at the **receiving
schema and its accounting invariants**. The server here takes traffic it did
not emit, from SDK versions it cannot pin, on clocks it does not control, and
still has to produce numbers a budget can be enforced on and an invoice can
be reconciled against. Nothing in this subject tells a builder how to
instrument; everything in it tells an operator what to refuse, re-stamp, or
price no matter what the instrumentation sent.

## The five field families

A durable call record decomposes into five families, each with its own trust
posture.

**Identity.** An event id minted per record; the owning project (derived from
the authenticated credential, never trusted from the body when a credential
is present); optional trace, span, and parent-span ids that let a multi-step
operation be reassembled on read. Two hard-won rules here. First,
*canonicalize correlation ids at the single shared door* — hex trace ids
arrive case-folded from one emitter and raw from another, and an
uncanonicalized store splits one end-to-end operation into two "traces" that
never rejoin. Second, keep an optional human-meaning **name** — the use-case
or call-site label — because provider+model is what you ran, while the name
is what you ran it *for*, and per-feature accounting groups on the latter.

**Token quantities.** Not a single count. Two mandatory counters (input,
output) and two optional ones (cached input, reasoning) whose absence and
zero mean different things — the [token-usage-quadruple](./techniques/token-usage-quadruple.md)
technique. Collapsing these to a total destroys pricing: the four classes
bill at different rates, and a record that stored only a sum can never be
re-priced or reconciled. The optional class list is provider-driven and
still growing — cache *writes* billed at a premium tiered by cache lifetime
are the proven next class — so the durable invariant is not the count four
but the rule behind it: every class the provider prices distinctly is
stored distinct.

**Time, twice.** The client's event time and the server's receipt time are
two fields with two owners and two jobs, never one field doing both —
[dual-clock-event-time](./techniques/dual-clock-event-time.md). Every
debugging read (listings, trace assembly, time-range queries) keys on the
client's clock; every accounting read (rolling budget windows, admission
decisions, forecast series) keys on the server's. A schema with one
timestamp has silently chosen to let every client clock in the fleet vote on
budget enforcement.

**Money.** Cost is nullable, and null is load-bearing —
[nullable-cost-never-zero](./techniques/nullable-cost-never-zero.md). A call
whose model is absent from the price book was *not free*; it was *unpriced*,
and every aggregate downstream must be able to say how many rows it could
not price. Alongside the amount rides its provenance: whether the number was
client-reported verbatim or computed from the operator's price book, because
a cap resting on self-reported spend is a materially weaker guarantee than
one resting on the operator's own arithmetic.

**Attribution.** Who to bill, which feature to charge, which credential
wrote the row. These ride as well-known keys in an open metadata map rather
than as columns — [metadata-attribution-keys](./techniques/metadata-attribution-keys.md)
— which buys backward compatibility across store backends at the price of
discipline: the keys must be documented, accessed through named readers, and
partitioned into client-asserted (customer, product) versus server-owned
(the writing credential's id). That last one is stamped from the
authenticated principal and any client-sent value is stripped, because
otherwise one JSON key lets a caller launder its spend onto another
credential's budget — [server-owned-fields](./techniques/server-owned-fields.md).

## The ingest path is the constitution

All of the above is enforced at exactly one place: the shared preparation
step both the single-event and batch front doors pass through. That step, in
order: scope the event to the authenticated project; stamp receipt time;
canonicalize correlation ids; stamp the writing credential and strip the
forgeable copy; validate (including clock-skew bounds —
[ingest-skew-rejection](./techniques/ingest-skew-rejection.md)); apply the
project's payload-persistence policy and redaction floor; then price the
call and stamp the cost's provenance. Two properties make this a
constitution rather than a convention. It is **one function** — two ingest
surfaces that validate separately will drift apart, and the drift will be
discovered by a customer's invoice. And it runs **before storage** — a field
corrected after rows exist creates two populations, and every historical
population needs an explicit story (a backfill sentinel, an "unattributed"
bucket) rather than a silent NULL that later reads as data.

The enumeration is where this goes wrong, and it goes wrong in a direction the
section's own framing hides. "Both front doors" counts the surfaces a *caller*
can reach. A mature ingest has more writers than that, and the extra ones are
records the **server builds itself** - a settled unit of dispatched work, a
reconciliation row, a synthesized event for something that happened out of
band. Such a writer is exempted from the shared step deliberately and with a
good argument: its event needs no validation, because the server assembled it;
no costing, because it prices from its own report; no admission, because the
work already ran and refusing to record spend does not un-spend it. Every
clause of that argument is true, and none of it covers the payload class. So
the door reaches storage with a literal in place of the owner's policy, and the
content it carries is the *most* likely to be sensitive, because a
server-built record of a failure quotes the input that failed.

Two consequences for the constitution. The enumeration of writers is a
maintained list, not an adjective - "the front doors" silently stops being all
of them the first time a server-built path is added. And the class must be
applied through the one function even by a writer that legitimately skips
everything else in the step, because the receipt is written from the same
value the enforcement used: a door that chose the class also names it in the
stamp, and the posture report that exists to say what the store *actually*
holds then reads that door's choice as the owner's policy - a stamp that is
present, well-formed and wrong, which is the one shape this bundle's posture
on absence does not catch
([never-present-absence-as-an-answer](../../_laws.md#never-present-absence-as-an-answer)
forbids a missing value dressed as an answer; here the value is not missing,
it is the wrong authority's).

## Absence is disclosed, never substituted

The record model and its query surface share one posture: when the system
does not know, it says so, in the payload. An unpriced cost is null with a
provenance gap, not zero. An untagged call falls into a named unattributed
bucket, not onto some default customer. A store backend that has not ported
a query predicate answers "unsupported", naming the filter — never an
unfiltered page presented as if the filter had been honored, because a
reader who asked "errors only" and silently got everything will draw a
confident, wrong conclusion. Rows that predate a column carry a documented
backfill value, so a reader can distinguish "measured" from "assumed at
migration time". Auditable-months-later is exactly this property: every
value in the row either is a measurement or announces that it is not.

## Failure modes this standard exists to prevent

- **The single-timestamp schema** — one clock serving both debugging and
  accounting, so one skewed client corrupts budget enforcement fleet-wide.
- **The phantom zero** — unpriced calls stored as $0, making the newest,
  least-vetted model traffic read as the cheapest.
- **The collapsed token count** — a stored total that can never be re-priced
  when cached or reasoning rates change, and never reconciled per class.
- **Attribution by honor system** — the billing credential read from the
  request body, so per-key caps and spend attribution are attacker-chosen.
- **The split trace** — correlation ids stored as sent, one logical
  operation appearing as two because two emitters normalized differently.
- **Drifting front doors** — single and batch ingest validating with
  separate code, accepting different populations under one schema.
- **The exempt writer** - a server-built record skipping the shared step on
  grounds that cover validation, costing and admission but not the payload
  class, and stamping the class it chose rather than the one the owner set.
  Not found by the suite: the shared step's tests are green, and they cannot
  see this door.
- **The helpful unfiltered page** — a backend answering a predicate it does
  not implement with unfiltered data instead of a refusal.

## The techniques

- [dual-clock-event-time](./techniques/dual-clock-event-time.md) — two
  timestamps, two owners: client event time for debugging reads, server
  receipt time for every accounting window.
- [token-usage-quadruple](./techniques/token-usage-quadruple.md) — input,
  output, cached-input, reasoning as distinct counters; absent and zero are
  different statements.
- [nullable-cost-never-zero](./techniques/nullable-cost-never-zero.md) —
  unpriced is null, aggregates disclose their unpriced count, and cost
  carries its provenance.
- [metadata-attribution-keys](./techniques/metadata-attribution-keys.md) —
  well-known keys in an open map: customer, product, pricing lane, cost
  provenance, writing credential.
- [ingest-skew-rejection](./techniques/ingest-skew-rejection.md) — asymmetric
  clock-skew bounds on client event time: tight toward the future, generous
  toward the past, refusal with a stable code.
- [server-owned-fields](./techniques/server-owned-fields.md) — the fields the
  server stamps and the client cannot influence: receipt time, project
  scope, writing credential; stamp-and-strip at the one shared door.
