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
canonical content plus the digest of its predecessor. Change a record in the middle
without recomputing, and the next link disagrees with what is stored.

That is all the sequence proves on its own, and the gap is the one teams miss. A chain
commits to each record's predecessor, never to its own **head or length**. Delete the
newest records and the shorter chain verifies clean. Rewrite everything and recompute
every digest and the new chain verifies too. Both are detectable only against an
**earlier head held somewhere the writer does not control**, and only for history up to
that head. The secure-logging literature named the first gap a quarter-century ago: a
"truncation attack ... whereby the attacker deletes a contiguous subset of tail-end log
entries", which the per-entry schemes before it did not defend against (Ma and Tsudik,
2008). A reader holding only the sequence can detect neither gap. A reader holding
yesterday's head can detect both.

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
[absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).
A chain that verifies while its neighbours have vanished is a clean bill of health on an
empty room.

**4. Make corrections supersede, never edit.**
A wrong record is fixed by appending a correction that references the original and states
what was wrong. The original stays, marked superseded. This is the same asymmetry as
[a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged):
the superseded item is labelled, not removed, because removing it destroys the evidence of
how the error occurred along with the error.

**5. Commit the head outside the row set, and check it on every verification.**
The chain cannot notice its own shortening, so something else has to remember how long it
was. Per scope, that is the head: the last position, its digest, and the count of records
at or below it. Hold it in increasing order of strength:
- **the verifier's own memory.** A verifier that has vouched for a head must fail any
  later chain that no longer contains it, and must not forget it on that failure.
  Re-hashing what is left cannot prove what was removed. It is weak: it covers only what
  that verifier saw, and it is gone on restart. But it is not writable by the deleter.
- **a keyed head record** that the deleter cannot re-sign.
- **an external anchor** (the decision rule below), which is the only one of the three
  that also survives a wholesale rewrite.

A head kept in the same table, unkeyed, is written by the party it defends against. Any
speed-up that skips re-verifying a known-good prefix must also re-check that nothing below
it disappeared. A checkpoint that starts from an untouched anchor hides an interior delete
just as well as a tail delete.

**6. Verify continuously, not on demand.**
Run verification on a schedule over every chain, and alert on breaks. A chain first
verified the week a subpoena arrives is a chain that will first *fail* that week, with no
idea when the break happened. Continuous verification converts "the chain is broken" from
a catastrophe into a dated incident with a bounded window — which is a defensible fact
rather than an unbounded one.

**7. Return a structured verdict, not a boolean.**
Verification output should carry: which scopes were checked, how many records, where the
first break occurred if any, which head the verdict was checked against and where that
head was held (none, the verifier's memory, a keyed record, an external anchor as of a
date), and — critically — a census of what was *not* covered. See the sibling technique on
what verification does and does not claim; the short version is that the verdict's success
flag must never be presented as a security claim.

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
  rewritten it before this date", and it does not require a distributed ledger. It is also
  the only defence against truncation or a wholesale rewrite that no internal verifier
  happened to witness, and it covers history only up to the latest anchor. A timestamp
  token is "evidence indicating that a datum existed before a particular time" (RFC 3161),
  which is exactly the "not written after your letter" question.
- **An anchor nobody checks proves nothing.** Tamper evidence holds only while someone
  compares the chain against the published heads. Crosby and Wallach (2009): "If the
  logger knows that a given commitment will never be audited, it is free to tamper with
  the events fixed by that commitment." Schedule the comparison with the verification in
  step 6. Where many parties must check append-only growth between two heads cheaply, a
  Merkle tree gives a short proof ("Merkle consistency proofs prove the append-only
  property of the tree", RFC 9162). A plain chain's proof between two heads is every
  record in between.

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
  sibling technique exists precisely because that gap is the one teams gloss. The
  commonest out-of-band writer is the product itself. Look for a demo or sandbox reset
  that purges the records its run sealed, a restore that replaces a scope's rows from a
  backup, or a cleanup job. Each one deletes from the chain without knowing it is a chain,
  and a tail delete is invisible without step 5.
