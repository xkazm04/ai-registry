---
layer: technique
type: technique
subject: candidate-consent-and-retention
technique: one-transaction-scrub-across-linked-records
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [implementing an erasure request, scrubbing a candidate across linked tables, issuing an erasure confirmation]
---

# One transaction, scrub across linked records

## The concern

A candidate is not a row. They are a row, plus their documents, plus each
analysis produced about them, plus interview sessions, plus transcripts, plus
notes, plus messages, plus every derived artifact that cited any of those. An
erasure that walks this graph in several independent writes has, in the failure
case, deleted the name and kept the transcript — and, worse, told the person it
was done.

The rule is blunt: **every linked record moves in one transaction, or none
does, and the confirmation is emitted only after commit.** A partial scrub that
reports success is the single worst outcome available here, because it destroys
the evidence that would have prompted a retry while leaving the exposure in
place.

## Enumerate the graph, explicitly and in one place

Write the list of everything that holds a piece of this person as a single
declared inventory, not as whatever the scrub function happens to touch. The
inventory should be reviewable by someone who has never read the scrub code,
and it should be the thing a new table gets added to when it is created.

For a hiring system the inventory reliably includes: the person record; source
documents and their parsed forms; every analysis, score, and rationale; session
and scheduling records; recorded conversations and their transcripts; recruiter
notes and free-text comments; outbound and inbound messages; consent history;
and the derived artifacts — provenance dossiers, exports, cached reports —
that quote any of the above.

**Decision rule.** If a table can be joined to the person, it is in the
inventory or it carries a written reason why not. "It only has an id" is not a
reason; a surrogate id that resolves to a person through any surviving table is
still a link, and a link is what re-identification uses.

Two shapes are missed almost universally, and both should be checked first
because they are where the person hides in plain sight:

- **Denormalised copies of the identifier.** Audit trails, activity feeds and
  event rows routinely snapshot the candidate's display name at write time so
  the feed reads well later. Scrubbing the person record while leaving those
  snapshots means the feed reconstructs the name perfectly after the erasure.
  Every denormalised copy is scrubbed in the same transaction as its source.
- **Tables joined by a human-readable key rather than a foreign key.** Saved
  analyses, imported artifacts and legacy tables often have no reference back
  to the person and can only be matched on something like a name. Normalise
  both sides of that comparison identically — trim and case-fold — or a record
  saved with different padding at a different intake survives untouched. And
  accept the asymmetry: within one organisational partition, over-scrubbing a
  namesake is the safe direction and under-scrubbing is not. Write down that a
  real per-person key is the durable fix, so the compromise stays visible
  instead of becoming the design.

## Scope by the owning boundary, and prove the scope

The most damaging erasure bug is not a missed table. It is a query scoped to
the wrong boundary — filtering only by the person's identifier while the
records live under an organisational partition, or filtering by a partition
derived from the requester's session rather than from the person's actual
holdings. Both shapes produce the same incident: the scrub reports success, and
the person's name, source document, analyses and transcript stay readable on a
recruiter's board in the partition the query never visited.

The mechanics of partition scoping belong to the engineering neighbour. What
belongs here is the hiring judgment about what the receipt means: an erasure
confirmation is a claim about the organisation's *entire* holdings of that
person, so the scrub must resolve the set of partitions from the person, verify
each was visited, and refuse to confirm if any was skipped or errored. Counting
rows affected per partition and asserting the count is not zero-by-accident is
the cheapest available proof.

## Order the operations so a crash is safe

Even inside a transaction, order matters for the surrounding system:

1. Resolve the full set of records first, and fail before writing anything if
   resolution is incomplete.
2. Compute what survives — the de-identified shell and the enumerated
   carve-out set — before destroying anything, so the surviving shape is known
   rather than whatever happens to be left.
3. Apply destruction and de-identification together.
4. Append the consent event recording the erasure.
5. Commit.
6. *Then* notify: the receipt to the candidate, the record to the audit
   surface, the invalidation to any cache.

Step 6 outside the transaction is deliberate — a mail send that fails must not
roll back a completed erasure — but nothing in step 6 may run before commit.
The common bug is an optimistic notification fired at step 3.

## The erasure event names its actor

The append to the consent history is not bookkeeping; it is the only durable
answer to "who erased this person, when, and on what request". Record the
requester, the actor that executed it, the timestamp, and the enumerated set
that was deliberately retained. A null actor renders as *not identified*, never
as a default person —
[every decision names its actor](../../_laws.md#every-decision-names-its-actor).
An erasure is a consequential decision about a person's record; it earns the
same attribution discipline as a rejection.

## The receipt says only what committed

The confirmation to the candidate is a statement about the record's actual
state. It says what was destroyed, what was reduced to a de-identified form,
and what was retained under the legal-claims enumeration with the ground and
the end date. It does not say "all your data has been deleted" when a sealed
decision record survives, because that is a false statement to the person with
the strongest interest in it and it will be discovered the first time they ask
a follow-up question — [say only what the record
holds](../../_laws.md#say-only-what-the-record-holds) applies to the receipt as
much as to the disclosure.

## Idempotence and re-request

Erasure must be re-runnable. A person who asks twice, or a retry after a
transport failure, must produce the same end state and a second consent event,
not an error and not a partial re-scrub of a record that is already a shell.
Write the scrub so that running it on an already-erased person is a no-op that
still returns a valid receipt.

## When not to use this

- **Do not run a single transaction across stores that cannot share one.** If
  documents live outside the transactional store, the correct pattern is to
  commit the transactional part with the external deletions recorded as
  pending, then reconcile — never to declare success on the strength of a
  best-effort external delete. The receipt waits for the reconciliation.
- **Do not use this shape for bulk retention sweeps.** A sweep touching
  thousands of people in one transaction will lock the store and time out; it
  batches per person, each batch atomic.
- **Do not let the scrub delete the enumerated carve-out set** because it is
  easier. Deleting more than required looks conservative and is not: it
  destroys the record that lets a rejected candidate contest their own
  outcome.
