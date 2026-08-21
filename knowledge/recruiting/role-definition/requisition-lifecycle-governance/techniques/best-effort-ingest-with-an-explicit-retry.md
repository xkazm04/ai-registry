---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: best-effort-ingest-with-an-explicit-retry
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [a role description and its matchable index live in separate stores, deciding what happens when indexing a description fails, designing a retry path for a failed derived step]
---

# Best-effort ingest with an explicit retry

Once a role's description and the machinery that matches candidates against it
are separate stores, a role acquires two halves: the **draft** — the text a
person wrote or pasted, which is the user's work — and the **index**, a derived
representation the matching, search and ranking machinery can act on. Producing
the second from the first is *ingest*.

The two halves have opposite reliability requirements, and every failure in
this area comes from treating them as one thing.

- **Saving must always succeed.** It is the user's action on the user's content
  and it touches one store. A save that fails because a downstream service is
  unavailable has destroyed work for a reason the user cannot understand or
  act on.
- **Ingest is allowed to fail.** It may call a model, an embedding service, a
  queue, a search cluster; it has rate limits, timeouts and bad days.

## The three-part discipline

**1. Save independently, and produce a durable draft.** A description draft may
exist without a matchable requisition, and that is a legitimate, expected state
— not a corruption to be repaired at read time. This is the concession that
makes the rest possible.

**2. Attempt ingest, allow it to fail, and make the failure a state on the
record.** The naive alternative — fire it and log the error — creates the worst
artifact in this technique: a saved role that looks exactly like an indexed one
until the day someone runs a match and gets nothing back. The record must be
able to say *not yet ingested*, *ingest failed at this time for this reason*,
or *ingested at this time* — a fact the interface can render and a human can
act on, not a line in a log nobody reads.

**3. Refuse politely at the transition that actually depends on it.** Going
live, being matched, being advertised — these need the index. When it is
missing, they refuse, and the refusal names the cause and the remedy: *this
role has not been indexed; retry indexing*. A refusal that says only that
something went wrong sends the user back to re-paste their description, which
creates a duplicate draft and does not fix the index.

The shape generalises: **the user's write is the transaction; the derived step
is best-effort; the consumer of the derived step is where the strictness
lives.** Putting the strictness at the write instead punishes the wrong person
at the wrong moment.

## The retry may never create

The retry is a scoped operation over a draft that **already exists**. It takes
that draft's identity, re-runs the derivation, and updates the record. It has
no create path.

This is not a detail. A retry endpoint that can mint a requisition when it does
not find one is a second create path — one that bypasses the go-live gate, the
approval precondition, the extraction preview and the actor attribution, all of
which live on the real create path. It *will* be used as one: by a bulk-repair
job written six months later, by an operator working through a list, eventually
by a loop that "repairs" a batch and produces requisitions with no backing
draft, no owner and no approval.

So the retry's contract is: given an identifier with no backing draft, it
fails, loudly, and does not create anything. The absence of a draft is
information —
[absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
— and the correct response to "there is nothing here to re-index" is to say so,
not to conjure something to index.

## Honest nulls: never-ingested is not zero

The state of the index also governs how the role reports on itself, and this
is where a small display decision becomes a lie.

A role that was never ingested has **no** match count, **no** candidate pool,
**no** ranking. A role that was ingested and that nobody has matched to has a
count of **zero**. Rendered identically as `0`, they tell a recruiter the same
thing — *this role is not attracting anyone* — when in one case the role is
unattractive and in the other it is invisible. The two demand opposite
responses: rewrite the role, versus fix the pipe.

The rule is that a never-computed quantity renders as absent, not as zero, and
that its absence is legible: a dash, an explicit *not indexed*, a state chip —
anything but a number.

The rule has to reach the **sort and the aggregate**, not just the cell. A
column that displays a dash but sorts the underlying value as zero has restored
the lie in the one interaction a recruiter uses to find neglected roles: the
uningested roles cluster at the bottom next to the genuinely quiet ones and
bury them. A null-aware accessor that sorts absent last in *both* directions is
the small piece of work that makes the honest rendering actually honest.
[Say only what the record holds](../../../_laws.md#say-only-what-the-record-holds):
the record holds "we never looked", and "nobody applied" is a claim it cannot
support. The same rule applies to every aggregate built on top: an average over
roles that were never indexed is an average over a population that was never
measured.

## Decision rules

- **When the derived step fails, the user's content survives.** Non-negotiable;
  everything else in this technique is downstream of it.
- **When a role cannot be matched, say which of the two reasons applies** — not
  indexed, or indexed with nothing found.
- **When retrying, scope to one record by identity.** A retry that takes a
  filter and repairs everything matching it is a bulk mutation wearing a
  retry's name; if you need one, build it deliberately, with its own
  attribution and its own limits.
- **When ingest keeps failing for one role, stop retrying automatically and
  surface it.** Repeated automatic retries on a permanently-bad input burn
  budget and hide the fact that a human needs to look at the text.
- **When ingest succeeds, record when.** A stale index over an edited
  description is the next failure in this family, and only a timestamp on both
  halves lets you detect it.
- **Never let a missing index silently degrade a candidate-affecting result.**
  A match run that quietly skips unindexed roles is a candidate not considered
  for a job they were qualified for, reported as an empty result.

## When not to use this

- **Where the index is cheap, synchronous and local.** If deriving the
  matchable form is an in-process computation with no external dependency, the
  two-phase split adds a state to reason about for no reliability gain — do it
  in the write.
- **Where the derived artifact is not consequential.** A cosmetic
  denormalisation does not need a visible failure state; the visibility is
  justified by the fact that this one gates whether a role can be found at all.
- **As a general delivery-retry pattern.** Queues, backoff, idempotency keys and
  dead-letter handling are general engineering practice with a large literature;
  this technique adds only the hiring-specific parts — which transition is
  allowed to refuse, and why a repair path must never create a requisition.
