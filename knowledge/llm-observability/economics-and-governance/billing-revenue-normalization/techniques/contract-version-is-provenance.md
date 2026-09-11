---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: contract-version-is-provenance
status: forged
laws: [no-retroactive-restatement, never-present-absence-as-an-answer]
shared_with: []
use_when: [a billing provider offers dated or numbered API contract versions, deciding what a revenue record must carry besides amounts and identifiers, a provider rotates its default contract on a release cadence, the code that registers a webhook endpoint lives in a different repository from the code that parses its deliveries]
---

# The contract version is provenance

A revenue record already carries the provenance of everything the operator
controls. The amount keeps its original currency so conversion cannot destroy
it. The converted figure carries the rate and the **version of the rate book**
that produced it, so an auditor can check out the book that priced any row
(static-auditable-fx-book). That discipline is applied, consistently, to exactly
one side of the ingest — and the side it skips is the larger one.

The field semantics themselves are versioned, by the provider, on the
provider's clock. Which keys exist, what a status string can hold, whether an
amount is gross or net, whether a quantity is present on this event type: all of
it belongs to a **contract version**, and a provider that publishes dated
contracts rotates its default on a release cadence the operator does not set. A
ledger that stamps the rate book and not the contract can answer "which rate
priced this row" and cannot answer "did this field mean the same thing then".
The second question is the one that makes a month's revenue wrong.

## The version is chosen at registration, not at parse

The ordering is the whole technique, and it is counterintuitive because every
other property of a delivery is a property of the delivery.

A subscribing endpoint selects its contract **when it is created**. Deliveries
to that endpoint are serialized under the version the endpoint chose, and — in
the careful designs — an event's version is fixed when the event is *created*,
so a redelivery six weeks later reproduces the original payload rather than
today's. That is the right decision and it has a consequence worth stating
plainly: **changing an endpoint's version does not migrate its history.** After
a rotation the endpoint receives new events under the new contract while
redeliveries of old ones still arrive under the old, so the normalizer is
simultaneously reading two contracts for the same event type. Any parser that
treats "this is an order-paid event" as sufficient to know the payload's shape
is already wrong at that moment and will not be told.

So the parse dispatches on the **declared** version, which every careful
provider puts both in a delivery header and in the body. Reading it costs one
lookup, and it converts a silent misparse into a decidable branch.

## Absent is not current

The defaulting rule is where this goes wrong quietly. A request or an endpoint
that names no version is served the provider's *current* contract — a moving
target that advances every release cycle. The integration keeps working, the
tests keep passing, and the contract underneath changes on a date nobody in the
consuming organization has in a calendar.

An unnamed version is therefore **absence, not a value**
(`_laws.md#never-present-absence-as-an-answer`). Two obligations follow:

- **Name the version explicitly at every boundary** — the request, the
  subscribed endpoint, and the generated client if the provider binds the
  contract to the client. An integration that works because it inherited a
  default has no contract; it has a lease with no expiry date written down.
- **Refuse an unrecognized version rather than guessing.** A payload declaring
  a contract the reader does not know is not a payload to parse optimistically.
  This is the strict-set case: an unparseable or unknown contract version is a
  hard error, exactly as it is for any versioned artifact whose meaning the
  reader cannot afford to guess.

## What the record carries, and why it is not optional

Stamp the declared contract version on the record beside the rate-book version,
for the same reason and under the same law
(`_laws.md#no-retroactive-restatement`). Without it:

- A field whose meaning was narrowed between two contracts produces two rows
  that disagree and no way to tell which reading each used. The upsert converges
  them onto one id and the disagreement becomes invisible.
- A backfill run today against the provider's API re-reads historical objects
  under **today's** contract, while the webhook rows for those same objects were
  written under the contract in force when they arrived. Deterministic identity
  makes the two paths converge on one row — which is the point — but it also
  means a backfill silently restates history under a different contract unless
  the version is on the row to compare.
- A migration cannot be verified. "We moved to the new contract on the fourth"
  is checkable against the ledger only if the ledger says so.

The cost is one short string per row. The alternative is a reconciliation
project.

## The ownership split nobody declares

The endpoint registration and the payload parsing are frequently **not in the
same repository**, and the version is chosen by the first. A setup script,
a provisioning tool, or a dashboard click picks the contract; a separate
service — sometimes owned by a different team, sometimes a downstream analytics
consumer that never talks to the provider's API at all — parses what arrives.
Nothing in either tree records the dependency, and the consumer's correctness
rests on a value it cannot read from its own source.

Make the dependency explicit rather than ambient:

- The registering side **declares the version as configuration**, not as an
  inline literal in a setup script, so it is greppable and reviewable.
- The parsing side **asserts the version it received** against the one it was
  built for, and reports a mismatch as a first-class condition rather than
  discovering it as a null field three joins downstream.
- A pure downstream consumer that cannot set the version still records it, so
  the mismatch is at least diagnosable after the fact.

## Decision rules

- **When a provider publishes dated contracts, pin every boundary and write the
  pin where a reviewer will see it.** The default is not a choice, it is the
  absence of one.
- **When an endpoint's version is rotated, treat old and new as concurrent.**
  Redeliveries of prior events keep the prior contract; the parser must handle
  both for at least the provider's retry horizon.
- **When the rate book is versioned on the record and the contract is not, that
  asymmetry is the finding.** It marks provenance discipline that stopped at the
  boundary of what the operator controls, which is precisely the boundary where
  it matters most.
- **When a provider's support window is finite, the expiry is an operational
  date, not a documentation detail.** A contract that stops accepting requests
  is an outage scheduled in advance; it belongs in the same calendar as
  certificate renewals.

## When not to use this

A provider that publishes no contract version has none to stamp, and inventing
one from the SDK's package version is worse than nothing — the package and the
contract move independently, and a row stamped with a library version invites a
reader to believe a guarantee that was never made. Where the provider offers no
version, record that fact once in the integration's own documentation and rely
on the sibling techniques: deterministic identity and an idempotent upsert
already make a shape change loud at the point where a required field stops
arriving.
