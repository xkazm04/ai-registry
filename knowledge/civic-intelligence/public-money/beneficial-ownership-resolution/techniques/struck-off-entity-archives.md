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
lives for the register in question — historical lookup, filings or bulk
exports where available — and checking that coverage before declaring a tie
uncheckable. Access, retention and export formats are source-specific.

## A live miss is a fact about the live register

The first discipline is interpretive. When the live endpoint returns
nothing for a checksum-valid identifier that a source asserts, the honest
possibilities include: the entity is dead; the identifier
belongs to a namespace this register does not serve; the source's
identifier is wrong. "The entity never existed" and "the tie is
unverifiable, close the case" are both fabrications — the first invents a
negative, the second converts a source's window into a wall. The live miss
becomes a routing decision: inspect the register's documented historical
access. Do not infer an ordering of these possibilities without local evidence.

## The archive layer and its geometry

Where bulk archives exist, discover their partition and retention contract
before fetching. A court/form/year layout and a full-extract variant are
possible designs, not universal guarantees. Practical checks:

- **Resolve the documented scope key before fetching a partition.** Finding an
  entity's file means determining which court/form/year partition holds it
  — usually derivable from the live register's basic-subject record, which
  frequently still exists after the full record is gone. When the scope
  cannot be resolved, the check *did not run*, and the recorded state says
  so — it is not a negative result.
- **Check which snapshot contains the relevant historical interval.** A
  dissolution-year partition is useful only if the publisher says it retains
  that entity's terminal record. A later export need not preserve all history.
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
exists for the resolved scope (coverage may be absent or inaccessible; inspect
the publication contract before retrying); scope
unresolvable (check never ran); matched on name but not on the strong
identity key (weaker evidence, route to human); negative but some archived
entries carry no identity key at all (inconclusive negative). Collapsing
these into "not found" discards the map back to a completable check.

## Legal and ethical handling of archived personal data

Bulk exports carry natural persons' identity attributes — birth dates,
home addresses — whose reuse needs its own jurisdiction and purpose review.
An open download is not itself permission for every subsequent use. Identity
attributes from archives are *matching keys only*, compared against your
own roster to close identity, and never surfaced as content. Log the
licence terms before any bulk mirror; scope fetches to the ties under
check rather than mirroring for convenience; and keep the private-life
boundary absolute — the archive exists to verify public-role facts.

## When not to use it

Choose a source by coverage, provenance and snapshot date, not by the label
"live" or "archive". A live endpoint may omit precisely the historical roles
under review, while an old export cannot establish present status. Neither
source covers entities the register never
held: bodies created by special statute sit outside the commercial
register entirely, and for them neither the live endpoint nor the archive
can confirm or refute a tie — that is a structural limit of the source,
recorded as such, not a gap to keep re-querying.
