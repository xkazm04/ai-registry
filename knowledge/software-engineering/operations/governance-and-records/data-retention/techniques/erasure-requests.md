---
layer: technique
type: technique
subject: data-retention
technique: erasure-requests
status: forged
laws: [identity-survives-reuse, one-validation-door]
shared_with: []
use_when: [honouring a request to delete a subject's data, inventorying where copies of data live, deciding between soft delete and hard delete]
---

# Erasure requests

Deleting a **specific subject's** data on demand, across every store that
holds a copy, provably, on a clock the system does not control. Erasure
obligations arise under data-protection regimes in several jurisdictions;
the engineering shape is the same regardless of which one applies, and the
shape is not the scheduled purge with a different filter.

## Four differences from expiry

- **Targeted, not horizon-based.** The selector is a subject, so the sweep
  covers everything keyed to that subject rather than everything older than
  a date.
- **Externally clocked.** A deadline arrives with the request; the system's
  own cadence is irrelevant to it. Erasure therefore needs an on-demand
  door, not only a scheduled one.
- **Must be provable.** Someone will ask for evidence that it happened.
- **Rare and high-stakes**, so it earns per-request ceremony that a nightly
  purge cannot afford.

## The inventory is the work

The deletion statement is trivial. Knowing where the copies live is the
whole engineering problem, and the answer decays continuously as the system
grows. Maintain an explicit inventory of stores that may hold subject data:
the primary store; derived rollups and aggregates; search indexes; caches
and sessions; queues and event streams still holding undelivered payloads;
generated exports and reports; object storage for uploads; and anything a
processor holds on the system's behalf. For each, record how it is keyed to
a subject, who deletes from it, and what the delete costs.

Two rules keep the inventory honest. First, **a new store that can hold
subject data ships with its erasure answer**, decided at the design review —
retrofitting an inventory across years of accumulated stores is the failure
mode every team reports. Second, the erasure path is **one door** that fans
out to all of them
([one-validation-door](../../../../_laws.md#one-validation-door)); parallel
per-store erasure scripts guarantee that the store added last quarter is the
one nobody remembers.

Aggregates deserve a specific decision rather than a default. A count that
includes an erased subject is usually acceptable and sometimes required —
the number is no longer personal data once it cannot be resolved back to a
person — but that is a judgement to record, not to leave implicit, and it
only holds where the aggregate is coarse enough that it cannot single anyone
out.

## Proof without content

The paradox: a record proving you erased something, written in full detail,
reproduces the thing you erased. The resolution is that identity and
attributes are stored separately and erasure works on the resolution
between them. The accountability trail holds **stable identifiers**, minted
once and never reused
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); the
attributes that make an identifier a person live in one place, and erasure
removes that place. Afterwards the trail still reads "this actor performed
this action at this time" — which preserves the integrity of the historical
account — while the actor no longer resolves to a human being.

That leaves a discipline the trail's own subject enforces at write time: an
identifier-only trail is only achievable if personal attributes never got
copied into event payloads in the first place. Erasure cannot fix a trail
that inlined names and addresses into ten thousand immutable rows; it can
only fail loudly against one. Where the trail is tamper-evident — chained,
checkpointed, externally anchored — targeted deletion breaks the chain by
design, which is the correct behaviour and the reason the separation must
be designed in rather than bolted on. The alternative technique, where the
obligation genuinely reaches into immutable rows, is to store the sensitive
fields encrypted with a per-subject key and destroy the key: the integrity
proofs are computed over the ciphertext, so they stay verifiable while the
plaintext becomes unrecoverable.

Record the erasure itself: which subject identifier, when, at whose request,
across which stores, with what outcome per store. Two outcomes are
**degraded, not successful**, and must be reported as such rather than as a
green result: an erasure that stopped at a safe boundary before finishing,
and an erasure that completed but whose own record could not be written.
For a compliance control, "mostly erased" and "erased with no proof" are
both states the caller has to act on. Where the erasure deletes in
committed batches, the recovery for the first is simply to repeat the
request — which makes idempotence a requirement of the door, not a nicety,
and makes "resumable" a field in the response rather than tribal knowledge.

Build the erasure path out of **the same deletion primitives the scheduled
purge uses**, with the horizon set to keep nothing. The alternative — a
second delete graph written for erasure — drifts from the first the moment
a new dependent table appears, and it drifts in the direction of leaving
data behind under the exact obligation that forbids it.

## Backups are a carve-out you state

Restoring a backup taken before an erasure resurrects the erased data. This
is not solvable by deleting inside backups, which are usually immutable and
whose whole purpose is to be a fixed point. The defensible arrangement has
three parts and all three must exist:

1. A **bounded, documented backup retention horizon**, so erased data ages
   out of backups within a stated period rather than indefinitely. A backup
   schedule that contradicts the stated retention schedule is the gap
   reviewers look for first.
2. A **deletion list** — the set of subjects erased since a backup was taken
   — which is **replayed against any restored dataset before it is made
   live**. This is the step that is always missing, and the restore runbook
   is where it belongs, because a restore happens under pressure by whoever
   is on call.
3. Backup copies kept **beyond use** in the interim: not queried, not
   restored for ordinary purposes, access-controlled, and described as such
   in the disclosure to the subject. Supervisory practice generally accepts
   a stated, bounded backup gap; it does not accept an undocumented one.

## Soft delete is not erasure

A flagged row is retained data with a filter in front of it. Soft delete is
a good reversibility mechanism and a false compliance mechanism, and the two
get conflated because the code path looks identical from the caller. It also
brings costs teams underestimate: every query must exclude the flag, unique
constraints must be made partial, indexes must be narrowed, and storage
never shrinks.

The decision rule: **reversibility and erasure are both satisfiable, but
only by a stated grace window** — soft-delete for N days so mistakes can be
undone, then a hard delete performed by the scheduled purge, with N short
enough to defend and long enough to rescue an accident. What is not
defensible is an indefinite flag presented as deletion, because it satisfies
the reviewer looking at a screen and none of the obligations that made the
request. If the record must survive for a competing legal reason, the honest
answer is to keep it and say so under the exemption that permits it — not to
hide it and imply it is gone.

## When not to use this

- **Where no external erasure obligation exists** and data is genuinely
  non-personal; horizon-based expiry alone is the right and cheaper design.
- **Against a competing retention obligation.** Some records must be kept —
  financial, safety, legal-hold. The answer is to refuse the erasure for
  those records under a documented exemption, narrowly scoped to them, and
  erase everything else. A blanket refusal citing one exempt table is the
  failure this rule prevents.
- **As a substitute for collecting less.** The cheapest erasure is data that
  was never stored; an inventory that keeps growing is a collection problem
  wearing a deletion problem's clothes.
