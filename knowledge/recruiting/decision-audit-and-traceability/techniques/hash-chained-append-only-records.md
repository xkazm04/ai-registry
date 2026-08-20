---
layer: technique
type: technique
subject: decision-audit-and-traceability
technique: hash-chained-append-only-records
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [building the storage layer for decision records, adding integrity verification to an audit trail, deciding how corrections are recorded]
---

# Hash-chained, append-only records

## The concern

An audit store's value is that nobody can revise it — including you, including for good
reasons, including to fix a typo. The moment a record is editable, its evidentiary weight
collapses to the weight of your assurance that you did not edit it, and under adversarial
reading that assurance is worth nothing. Append-only is the structural property; a hash
chain is what makes a violation of it *visible* rather than merely forbidden.

The mechanism is old and simple: each record includes a digest computed over its own
canonical content plus the digest of its predecessor. Change any earlier record and every
subsequent digest disagrees with what is stored. The break is detectable by anyone holding
the sequence, without trusting the operator's word.

## Procedure

**1. Define the canonical serialization first, and freeze it.**
The hash covers a byte string, so the byte string must be reproducible years later on
different machines. Fix: field order (explicit, not map iteration order), number
formatting, timestamp format with an explicit absolute offset, text normalization form,
and the exact treatment of absent versus empty fields. Write this down as a spec, not as
whatever the serializer does today — a library upgrade that reorders keys silently
invalidates your entire history.

**2. Decide what the digest covers, and state it in the schema.**
The sealed content: actor, kind, reason code, rule versions, decisive inputs, timestamp,
sequence position, predecessor digest. Deliberately *outside* the digest: anything mutable
by design, such as a soft-delete marker or an index used only for lookup. A field inside
the digest can never be changed; a field outside it is not protected. There is no third
option, and pretending otherwise is how chains end up "verifying" while the meaningful
content drifts.

**3. Chain per scope, and pick the scope deliberately.**
One global chain is simplest to verify and worst to operate: concurrent writers contend on
the tail, and any gap anywhere breaks everything. Narrower chains verify independently,
localize a break, and parallelize writes — at the cost that a whole missing chain is
invisible.

Where the system is multi-tenant, the scope is **the tenant**, and this is structural
rather than a tuning choice. A seal must link off the latest record *in its own tenant*,
so one organisation's records never enter another's proof and a verification walks a
single tenant's sequence. Otherwise every tenant's integrity claim depends on every other
tenant's write history, which is both an unacceptable coupling and an unnecessary
disclosure. Keep the global row identifier as a plain ordinal; the chain's identity is the
pair (tenant, predecessor digest). Pre-existing records backfill to a default tenant so an
older chain keeps verifying unchanged as that tenant's chain.

Then, whatever the scope, keep a counted, monotonic census of scopes so a *disappeared*
chain is detectable, per
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence).
A chain that verifies while its neighbours have vanished is a clean bill of health on an
empty room.

**4. Make corrections supersede, never edit.**
A wrong record is fixed by appending a correction that references the original and states
what was wrong. The original stays, marked superseded. This is the same asymmetry as
[a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged):
the superseded item is labelled, not removed, because removing it destroys the evidence of
how the error occurred along with the error.

**5. Verify continuously, not on demand.**
Run verification on a schedule over every chain, and alert on breaks. A chain first
verified the week a subpoena arrives is a chain that will first *fail* that week, with no
idea when the break happened. Continuous verification converts "the chain is broken" from
a catastrophe into a dated incident with a bounded window — which is a defensible fact
rather than an unbounded one.

**6. Return a structured verdict, not a boolean.**
Verification output should carry: which scopes were checked, how many records, where the
first break occurred if any, and — critically — a census of what was *not* covered. See
the sibling technique on what verification does and does not claim; the short version is
that the verdict's success flag must never be presented as a security claim.

## Decision rules

- **When a record must be deleted for a legal reason** — an erasure obligation that
  survives the legal-claims carve-out — delete the *content*, keep the *envelope*. Replace
  the covered payload with a tombstone that preserves the digest inputs' shape, or
  re-anchor from the deletion point and record the re-anchor as an event. Silently
  removing a link and re-chaining around the hole is the one operation that makes your
  store indistinguishable from a tampered one.
- **When writes are concurrent, serialize the tail per scope** inside the same transaction
  that seals the record. A chain assembled by a background job is a chain with a window in
  which records exist unchained, and that window is exactly what a hostile reader will ask
  about.
- **When the chain breaks, do not repair it.** Record the break, its detection time, and
  the last verified position. A repaired chain is a rewritten chain.
- **When you need external anchoring**, periodically publish the tail digest somewhere you
  do not control — a counterparty, a notarized email, a timestamping authority. This is the
  cheapest available upgrade from "we say we did not rewrite it" to "we could not have
  rewritten it before this date", and it does not require a distributed ledger.

## When not to use this

- **As the only integrity control.** A chain constrains what can be changed *after*
  writing. It says nothing about what was written, or about records that were never
  written at all. Pair it with the write-in-the-same-transaction rule and with coverage
  monitoring, or you have a beautifully verified partial history.
- **On high-volume operational telemetry.** Chaining costs a serialized write per scope
  and a verification pass over everything. Apply it to consequential decision records —
  the ones that end or advance a candidacy — and leave request logs unchained.
- **Where an append-only store is not actually append-only.** A chain over rows that an
  administrator can update out of band is theatre. If the storage layer permits privileged
  edits, say so in your threat model rather than implying the chain prevents them; the
  sibling technique exists precisely because that gap is the one teams gloss.
