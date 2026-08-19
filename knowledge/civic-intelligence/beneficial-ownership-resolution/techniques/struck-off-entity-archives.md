---
layer: technique
type: technique
subject: beneficial-ownership-resolution
technique: struck-off-entity-archives
status: forged
laws: [missing-is-not-zero, provenance-or-nothing]
shared_with: []
use_when:
  - the live register returns nothing for an entity a source asserts
  - checking ties to dissolved, struck-off, or renamed companies
---

# Struck-off-entity archives

Live registry endpoints are snapshots of the present. A struck-off,
dissolved, or merged-away entity often returns nothing from the live lookup
— not a tombstone record, a plain miss — and the officer history that would
confirm or refute a tie disappears with it. Since the interesting entities
in accountability work have a habit of dying (liquidation after the
contracts, dissolution after the scandal), a pipeline whose only source is
the live register is structurally blind to a chunk of exactly the ties it
most needs to check. The technique is knowing where the past actually
lives — the register-keeper's own bulk historical exports — and consulting
it before any tie is declared uncheckable.

## A live miss is a fact about the live register

The first discipline is interpretive. When the live endpoint returns
nothing for a checksum-valid identifier that a source asserts, the honest
readings are, in order of likelihood: the entity is dead; the identifier
belongs to a namespace this register does not serve; the source's
identifier is wrong. "The entity never existed" and "the tie is
unverifiable, close the case" are both fabrications — the first invents a
negative, the second converts a source's window into a wall. The live miss
becomes a routing decision: send the identifier to the archive layer.

## The archive layer and its geometry

Register keepers commonly publish bulk open-data exports of the same
underlying register the live endpoint serves — scoped by court or district,
by legal form, and by year, with a full-extract variant that carries the
complete record for that year *including* the struck-off history within it.
Practical properties that shape the work:

- **You must resolve the scope key before you can fetch.** Finding an
  entity's file means determining which court/form/year partition holds it
  — usually derivable from the live register's basic-subject record, which
  frequently still exists after the full record is gone. When the scope
  cannot be resolved, the check *did not run*, and the recorded state says
  so — it is not a negative result.
- **For a dead entity, fetch the partition for its dissolution year**; the
  full extract for that year carries the terminal record. For a live
  entity with thin history, the most recent year's full extract carries
  the complete officer history the live snapshot abbreviates.
- **Files are large; fetches are targeted and cached.** One partition at a
  time, disk-cached so a run never re-fetches; a download that exceeds the
  run's network budget is recorded as "unfinished check, repeat" — a
  distinct state from any negative.

Every conclusion drawn from the archive cites the specific export file it
came from, exactly as a live-register conclusion cites its record — an
archive is a source like any other and its provenance travels with the
claim.

## The archive's own outcome vocabulary

Archive checks fail in more ways than live checks, and each way is a
distinct recorded state because each implies a different next action:
entity absent from the resolved partition (dissolved earlier than assumed,
or scope guess wrong — the check is incomplete, not negative); no dataset
exists for the resolved scope (the guess is wrong, repeat); scope
unresolvable (check never ran); matched on name but not on the strong
identity key (weaker evidence, route to human); negative but some archived
entries carry no identity key at all (inconclusive negative). Collapsing
these into "not found" discards the map back to a completable check.

## Legal and ethical handling of archived personal data

Bulk exports carry natural persons' identity attributes — birth dates,
home addresses — under reuse conditions that typically make the recipient
a data controller. The doctrine that keeps this defensible: identity
attributes from archives are *matching keys only*, compared against your
own roster to close identity, and never surfaced as content. Log the
licence terms before any bulk mirror; scope fetches to the ties under
check rather than mirroring for convenience; and keep the private-life
boundary absolute — the archive exists to verify public-role facts.

## When not to use it

The archive is not a freshness source — its partitions are year-scoped
extracts, and for anything the live register can answer, the live register
answers better and cheaper. Nor does it cover entities the register never
held: bodies created by special statute sit outside the commercial
register entirely, and for them neither the live endpoint nor the archive
can confirm or refute a tie — that is a structural limit of the source,
recorded as such, not a gap to keep re-querying.
