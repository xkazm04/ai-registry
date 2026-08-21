---
layer: technique
type: technique
subject: portable-hiring-records
technique: external-identifier-as-the-sync-identity
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
use_when: [importing candidates or jobs from an external system, writing an upsert against synchronised records, adding a new counterparty to an existing integration]
shared_with: []
---

# External identifier as the sync identity

## The concern

Two systems hold the same person. Each has its own primary key, and neither
can see the other's. The only durable way to say "this row and that row are
the same human" is a field on your record that stores *their* identifier — the
external identifier. That field is not metadata, not a debugging aid and not
an optional enrichment. It is the identity under which every subsequent
synchronisation resolves.

Its failure is uniquely nasty because it is silent and it looks like success.
Drop the external identifier from a read path — a refactor, a projection that
selects only the columns a screen needs, a mapping that forgets one field —
and the importer cannot find the existing record. So it creates a new one.
Nothing throws. The job reports rows written, the dashboard is green, and the
pipeline quietly fills with duplicates of real people. Run it nightly for a
fortnight and a recruiter finds nine copies of the same candidate at nine
different stages, with the correspondence split between them.

That is the single most expensive integration bug in this domain, and it is
caused by treating a join key as a display field.

## The procedure

**1. Store it as a compound, not a scalar.** The external identifier is only
unique within a source. Store the pair — *which system* and *which identifier
within it* — and enforce uniqueness on the pair, scoped to the organisation.
A bare identifier column breaks the day a second counterparty is added, and it
breaks by colliding two different people, which is worse than breaking loudly.

**1a. The source half is server-derived, never payload-asserted.** Which system
a record came from is a property of the *connection* it arrived over, not a
field the record may fill in. A payload permitted to name its own source can
claim to be another source, and thereby resolve onto — and overwrite —
records that belong to a different counterparty entirely. Exclude the source
from the set of mappable fields on principle, so no configuration can ever
bind it.

**2. Make the database enforce it.** A unique constraint on (organisation,
source system, external identifier) is the only defence that survives a code
path nobody reviewed. Application-level "check then insert" is a race, and
bulk importers are exactly the workload that loses that race.

**3. Resolve on it, and only on it.** The lookup that decides create-versus-
update takes the external identity and nothing else. Never fall back to
matching on email, name, or name-plus-date — those fallbacks feel helpful and
they merge two different people, which is unrecoverable in a way a duplicate
is not.

**4. Carry it in both directions.** When you create a record locally that the
counterparty does not yet have, push it and store the identifier they mint.
An integration that only records identity on the inbound leg can never update
what it created.

**5. Assert its presence at the boundary.** A mapped record with no external
identifier is not importable. Reject it at the edge with a named reason,
rather than importing it and hoping the next run reconciles — the next run
will create a second copy.

**5a. Bind once; never re-bind on conflict.** Once an external identity is
linked to a local record, that binding is write-once. A later run may refresh
what the link *observed* — last stage seen, last synchronised at — but it may
never repoint the link at a different local record. A re-bindable link means
one upstream edit can silently move a person's entire history onto somebody
else's row.

**5b. Coerce conservatively, and never into a plausible constant.** Identifiers
arrive as numbers as often as strings, and converting those is fine. Converting
a structure is not: a generic stringification of an object yields the same
short placeholder for every record, which is not a parse error, it is a value —
and it collides every candidate in the batch onto one identity. Accept scalars,
refuse everything else.

**6. Test the read path, not the write path.** The bug is never that the
identifier was not stored; it is that some read forgot to select it. The test
that catches it is a round trip: import, mutate upstream, re-import, assert
the row count did not grow.

## The decision rules

- **When the external identifier is absent on an inbound record, refuse the
  record.** Do not synthesise one from a hash of the fields — a synthesised
  identity changes the moment any of those fields is edited upstream, so it
  guarantees a duplicate on the first correction of a typo
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
- **When two local records claim the same external identity, stop and surface
  it.** Do not pick one. A duplicate identity means an earlier run already
  went wrong, and merging automatically destroys the evidence of how.
- **When a counterparty's identifiers are not stable — reissued on edit,
  reused after deletion — say so in the integration's own record and do not
  pretend otherwise.** Some systems really do this. The honest response is a
  documented weaker guarantee and a human-reviewed reconciliation, not a
  matching heuristic dressed as an identity.
- **When a record is deleted upstream, do not free the identifier for reuse.**
  Tombstone the mapping. A reused identifier silently re-points your history
  at a different person.
- **When you deduplicate people locally**, the merged record keeps *every*
  external identity it absorbed, not just the survivor's. Dropping one
  re-creates that counterparty's copy on the next sync.

## The observability that makes it real

Three numbers, emitted by every synchronisation run, turn a silent failure
into a loud one:

- **Created versus updated.** A steady-state sync creates near zero. A run
  that suddenly creates thousands has lost the identity, and that single
  ratio is the whole alarm.
- **Records refused for missing identity.** Should be zero and is a mapping
  defect when it is not.
- **Distinct external identities seen versus local records touched.** A
  divergence means one identity resolved to several rows.

Report these to the operator as counts of *people*, not counts of operations.
"Four thousand candidates created" reads as an incident; "4011 upserts" reads
as a healthy log line, and it is the same event.

## When not to use it

- **A one-shot migration with no ongoing sync** does not need a persisted
  external identity — but it almost always turns into an ongoing sync within a
  year, and retrofitting identity after the records exist means reconciling by
  heuristic exactly once, badly. Store it anyway; the cost is one column.
- **A counterparty that exposes no stable identifier at all** cannot be
  synchronised on this technique. The correct answer is import-once with a
  human review step, not a fuzzy matcher — a fuzzy matcher on candidate
  records merges strangers.
- **Internal record linkage between your own tables** is a foreign key, not a
  sync identity. Do not conflate them; the external identity belongs to
  someone else's namespace and must never be used as your own key.
