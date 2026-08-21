---
layer: technique
type: technique
subject: portable-hiring-records
technique: versioned-record-envelope
status: forged
laws: [say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged]
use_when: [defining the record shape an integration exchanges, changing a field on an exported record, reading a file exported by an older version of the system]
shared_with: []
---

# Versioned record envelope

## The concern

A hiring record does not stay inside the process that made it. It is written
to a file, parked in an object store, mailed to a counterparty, restored into
a staging system eighteen months later by an engineer who was not there. Every
one of those readers must answer the same question before they may read a
single field: **what shape is this?**

A record that does not answer that question forces the reader to infer it from
the fields present. Inference is optimistic — a missing field reads as absent
rather than as *not yet invented*, an added field reads as noise rather than
as *this file is newer than your parser*, and a field whose meaning changed
reads as if it never changed at all. The envelope exists so that no reader
ever has to guess.

## The procedure

Wrap the payload. The envelope is a small, fixed set of fields that sit
outside the record's domain content and are never merged into it:

| Field | Says | Why it is not optional |
| --- | --- | --- |
| **schema version** | which shape the payload conforms to | the reader's dispatch key; without it, parsing is guesswork |
| **producer** | which system and which build wrote it | routes a malformed file back to the code that made it |
| **produced at** | the instant of production, in an absolute timescale | distinguishes a stale archive from a fresh pull |
| **scope** | what this record set covers — which organisation, which requisitions, which record kinds | prevents a partial export from being read as a complete one |
| **counts** | how many of each record kind are inside | the cheapest possible integrity check, and the number an operator actually needs |

For a single record moving over a live boundary, the envelope collapses to the
first three plus the record's own kind. For a bulk export, all five belong in a
header, once, ahead of the payload.

Version the **payload shape**, not the product. A version that tracks
marketing releases changes when nothing about the record changed, and stays
still when a field's meaning changes under a patch. Increment on: a field
added, a field removed, a field's type changed, a field's *meaning* changed
even where its type did not, or an enumerated vocabulary gaining or losing a
member. The last two are the ones teams miss, and they are the ones that cause
silent misreads rather than parse errors.

## The decision rules

- **When you read a record whose schema version is newer than you understand,
  refuse it.** Do not parse the fields you recognise and ignore the rest. A
  newer version may have changed what a field you *do* recognise means, and a
  partial read of a hiring record produces a confident wrong answer about a
  person.
- **When you read a record whose version is older, migrate it forward
  explicitly**, through a named function per version step, and record that the
  migration happened. Never let the current parser read an old shape by luck.
- **When a record carries no version at all, treat it as a distinct
  "unversioned legacy" case with its own handler**, not as the earliest known
  version. Those are different claims: one is *written before we versioned*,
  the other is *conforms to version one*, and only the second is a promise.
- **When a field's meaning changes, add a new field and deprecate the old
  one.** Re-meaning a field in place is invisible to every archive already
  written, and every one of those archives now asserts something false. The
  envelope's version tells a reader *that* something changed; it cannot tell
  them what a stored value used to mean.
- **When you cannot fill a field, omit it or mark it explicitly unknown —
  never zero, never empty string, never a plausible default.** An exported
  compensation of zero is a claim about a job's pay
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
- **Seal derived state as derived.** A record that carries a computed field —
  a decision's automated flag, a normalised stage role, a completeness score —
  marks it as produced by this export rather than authored upstream, so a
  re-import does not treat it as an input. A verdict re-imported as an input
  is no longer
  [bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged).

## What belongs inside the envelope, and what does not

Inside: the domain record — the job, the candidate, the pipeline state, the
decision, the offer terms.

Outside, in the envelope: anything about the *act of producing* this record.
Who exported it and under what authority belongs to the egress audit, not to
the payload — it is a fact about the export event, and copying it into the
record means the record's content changes every time it is re-exported, which
breaks any hope of diffing two exports of the same data.

Also outside: transport concerns. Compression, chunking, checksums of the
transfer, and pagination cursors belong to the delivery layer. An envelope
that carries a page cursor cannot be stored, because the cursor is meaningless
once the file lands.

## When not to use it

- **An internal function call between two modules of the same deployment**
  does not need an envelope; it needs a type. The envelope pays for itself
  exactly where the reader and the writer can be different versions.
- **A live request-response against a counterparty who versions their own
  API** already has a version negotiation; adding a second one inside the body
  gives you two versions that can disagree. Carry theirs; version only what
  *you* define.
- **A record that never leaves memory** — an intermediate in a mapping
  pipeline — should not be enveloped, because an envelope on an ephemeral
  value tempts someone to persist it.

## How you know it is working

The test is archival, not synthetic: take the oldest export file anyone can
find, feed it to the current reader, and see what happens. Three outcomes are
acceptable — it migrates cleanly, it refuses with a named reason, or it
reports itself as unversioned legacy and routes to the legacy handler. Exactly
one outcome is unacceptable, and it is the one an unenveloped record produces:
it parses, quietly, into something plausible.
