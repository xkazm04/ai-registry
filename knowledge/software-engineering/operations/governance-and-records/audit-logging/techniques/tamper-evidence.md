---
layer: technique
type: technique
subject: audit-logging
technique: tamper-evidence
status: forged
laws: [gate-sees-target, derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [a trail must convince a reader outside the operating team, adding integrity proof to an existing ledger, exporting records as filed evidence]
---

# Tamper evidence

Append-only *shape* stops a contributor from editing history through the
application. It stops nobody with direct access to the store. When the
trail's audience includes someone who is entitled to distrust the team
that runs it — an external examiner, a counterparty in a dispute, a
regulator — the ledger needs a claim that survives that distrust: **a
record carries a proof that binds its own content, and something
recomputes that proof over the stored bytes.** This technique is how the
proof is chosen, computed, checked, and honestly described.

The first thing to get right is what the word means. Tamper *evidence* is
not tamper *prevention*: nothing here stops a privileged actor from
altering a row. It makes the alteration show. And it only shows if
somebody looks — a proof written at insert and never recomputed on read is
decoration, not evidence
([gate-sees-target](../../../../_laws.md#gate-sees-target): the check must
observe the stored record, and a mechanism whose verification step was
never built is a gate over a target it has never read).

## The ladder, priced by what each rung detects

Each rung costs more and detects more. Buy the rung a real reader
demands, and state plainly what it does *not* cover.

1. **Module shape only.** No proof at rest. Correct for a trail whose
   audience is the operating team; pretending otherwise buys ceremony
   without a threat model.
2. **A per-record keyed digest.** Each record carries a digest computed
   with a server-held key over that record's own content. Detects
   **modification** of any covered field. Does **not** detect **deletion**
   of a whole record, nor reordering, nor wholesale replacement of a
   range — because no record depends on any other. Its compensating
   virtue is large: records are independent, so concurrent writers never
   contend, and the digest can be folded into a field the ledger already
   has, which means a live system gains tamper evidence with no schema
   change and no backfill.
3. **A chain across records.** Each record's digest covers the previous
   record's digest, so deletion and reordering break the chain as well as
   modification. The cost is the part usually left unsaid: **a chain has
   one tail, and concurrent writers fork it.** Two writers reading the
   same predecessor produce two successors claiming the same parent, and
   the verifier cannot tell a fork from an excision. A chain is therefore
   only honest where writes to it are serialized — a single writer, a lock
   on the tail, or one chain per partition with a separate head each. Also
   decide up front how trimming interacts with it (retire at checkpoint
   boundaries, keep the checkpoint digests), because the first retention
   pass otherwise breaks verification for every record after it.
4. **External anchoring.** Publish the chain head, or the records
   themselves, into a store under different administrative control. The
   only rung that survives a fully privileged local adversary: the claim
   becomes "two independently controlled systems would both have to be
   corrupted."

The decision rule: **pick the rung from the pair (which alteration must be
detectable, how many writers there are).** If deletion must be detectable
and writers are concurrent, you owe the serialization work of rung 3 —
skipping it and calling rung 2 "tamper-proof" is the failure this ladder
exists to prevent. If modification is the realistic threat and writers are
many, rung 2 is the right answer and its deletion blindness gets written
into the ledger's own documentation, where a reader will find it, rather
than discovered by an examiner.

## The digest names exactly how it is recomputed

A stored proof is a derived value, and a derived value that does not name
its recomputation is a future dispute with no arbiter
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Three parts of the recipe are load-bearing and each has burned somebody:

- **A canonical serialization.** Digest a form that two independent
  implementations produce identically: a fixed field list in a fixed
  order, keys of nested structures sorted recursively, absent values
  encoded explicitly rather than omitted. Without it, a value that
  round-trips through a different builder serializes differently, the
  digest differs, and an untouched record verifies as tampered — the
  false positive that destroys confidence in the mechanism faster than a
  missed tamper would.
- **The covered field set is part of the claim.** Any field outside the
  serialization is unprotected. Enumerate the covered fields where
  readers see them; an audience that assumes the whole record is covered
  will cite the proof for a field it never touched.
- **The digest covers the values as stored, not as intended.** If the
  store assigns a field — a default timestamp, a generated identifier —
  the writer must fix that value *before* digesting and store the same
  value it digested. A digest over the moment the record was built while
  the store writes the moment it landed makes every record verify as
  tampered.

## Verify on read; the verdict has four values, not two

Verification belongs on the **read path**, recomputed from each stored
record as it is served, so that every surface the trail reaches — the
interactive view, the interface, the export — states a verdict. A
write-side-only implementation is the common half-build: it produces the
proof and never checks it, which means an altered record is served as
fact for as long as nobody thinks to write the verifier.

The verdict vocabulary must distinguish four states, and collapsing them
into "fine / not fine" is where the mechanism starts lying
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):

- **verified** — recomputed and matched.
- **tampered** — recomputed and did not match.
- **unsigned** — the record carries no proof. Expected and legitimate for
  records written before the mechanism existed, and for records written
  through a path that bypassed the door. It must render *distinctly* from
  verified: "we cannot vouch for this record" is not "this record is
  fine."
- **unverifiable** — no key is configured in this deployment, so nothing
  can be checked at all.

The unsigned population is a completeness metric, not a cosmetic detail:
**every unsigned record written after the mechanism shipped is a write
path that bypassed the chokepoint.** Count them and treat a rise as the
coverage defect it is — this is the cheapest detector of a second write
door that anyone has, and the records most worth forging are usually the
ones some convenient side path wrote.

Comparisons run in constant time. An unkeyed digest lets anyone who can
edit a record recompute a matching digest, which is why the key is the
mechanism; and a keyed proof convinces only a party who holds the key, so
a reader who must verify *without trusting the operator* needs an
asymmetric signature or the anchoring rung. Say which of the two you have
rather than letting "cryptographically signed" imply the stronger one.

## Degrade inert, never closed

With no key configured, the integrity layer signs nothing, reports
*unverifiable*, and the ledger behaves exactly as it did before. It must
never fail a write: an integrity feature that turns a missing
configuration value into a broken audit path has become a new way for the
observer to take down the observed, which the ledger's whole posture
forbids.

## The filed artifact verifies itself

Evidence leaves the system. Once a file is downloaded, the reader is
holding bytes, far from the store, with no way to ask the ledger anything
— so the export carries its own content digest, computed over the exact
bytes delivered and travelling **beside** them (a separate channel, so the
digest does not become part of the content it covers). The recipient
recomputes it and proves the file was not edited after filing.

Two rules keep that honest, and both are learned the hard way:

- **The export must carry every field the per-record proof covers.**
  Strip a covered field to tidy the columns and the recipient can no
  longer recompute a single per-record verdict; the file's own digest
  still passes, so the loss is silent.
- **A content digest certifies the bytes, not the completeness.** A
  truncated export — a row cap hit, a filter narrower than the reader
  thinks — is delivered with a perfectly valid digest and looks like
  complete evidence. So a capped export declares its truncation
  explicitly, alongside the row count and the predicate that produced it,
  and marks it where a reader cannot miss it. A valid proof over a partial
  file is worse than no proof, because it converts an incomplete extract
  into confident false evidence.

## When not to reach for this

An internal operational trail with no external reader gets rung 1 and the
effort goes into coverage instead — a complete unsigned trail beats a
partial signed one every time an actual question is asked. And no rung of
this ladder substitutes for the ledger having one write door: proofs
attached to a trail whose writers are unenumerable prove that individual
records were not edited, while saying nothing about the records that were
never written.
