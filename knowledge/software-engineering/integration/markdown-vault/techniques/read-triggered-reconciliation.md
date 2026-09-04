---
layer: technique
type: technique
subject: markdown-vault
technique: read-triggered-reconciliation
status: forged
laws: [gate-sees-target, derivation-names-recomputation]
shared_with: []
use_when: [a derived index over a store other programs write, a change watcher is unavailable or silently unreliable, deciding when a mirror is reconciled rather than how, a ledger records what was reconciled and nothing ever resolves it]
---

# Read-triggered reconciliation

[editor-interop](./editor-interop.md) answers "how does the application learn
the human edited a file" with two mechanisms and ranks them: a change watcher,
which is precise and fails silently, and a time-based staleness bound, which is
the honest one and therefore the load-bearing one. That enumeration is missing
its third member, and the third one is the cheapest of the three to be right
about:

> **Reconcile on the read.** Do not ask when the derivation goes stale. Ask what
> it is for, and rescan immediately before answering that. The staleness window
> collapses to the read itself, and there is no window left to bound.

A query cannot return results computed from a tree that changed before the query
ran, because the query *is* the trigger. No watcher exists to go quiet, no
interval exists to tune, and no invalidation protocol exists for a second writer
to be unaware of. What replaces all of it is a rescan on the path that consumes
the derivation — and the rest of this technique is about making that rescan
cheap enough to be affordable, and its gate honest enough to be trusted.

## The mirror carries the source's own change-stamp

The reconcile pass needs to decide, per record, whether the derivation is
current. The tempting shape is a ledger beside the mirror recording what was
last written — and [mirror-indexes](./mirror-indexes.md) already documents the
confession that shape owes, because the gate then reads the ledger and believes
it read the disk.

Read-triggered reconciliation removes the confession by removing the ledger.
**Store the source record's own change-stamp as a field of the mirrored record**,
and the gate compares that stored value against the live source:

- There is no third store, so there is no ledger-versus-mirror divergence to
  represent. The stamp cannot say "current" about a record the mirror does not
  hold, because the stamp is *in* the record.
- The gate satisfies [gate-sees-target](../../../_laws.md#gate-sees-target)
  literally rather than by disclosure: it stats the file it is making a claim
  about. The proxy and the target are one comparison apart, not one store apart.
- Reconciliation is the derivation's named recomputation
  ([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)),
  and it is named at the only place that cannot forget to invoke it — the read.

The reconcile pass is then a single sweep with three arms, and all three fall
out of one join between "what the mirror holds" and "what the store contains":
records the mirror holds whose source is gone are deleted, records whose stamp
disagrees are re-derived, and files the mirror has never seen are added. The
sweep is idempotent by construction — run it twice and the second run does
nothing — which is the property that lets it sit on the read path at all.

## Compare the stamp for inequality, never for ordering

The gate's predicate is `stored != live`, not `stored < live`, and the
difference is the whole reason a modification time is usable here.

An ordering comparison assumes change-stamps only move forward. Under this
subject's second peer writer they do not
([replicated-substrate](./replicated-substrate.md)): a sync client, a checkout,
an archive extraction and a timestamp-preserving copy all write modification
times wholesale, and any of them can install a record whose stamp is *older*
than the one the mirror recorded. A `<` gate reads that as "the mirror is ahead,
nothing to do" and serves the superseded derivation forever. Inequality treats
every disagreement as a disagreement, which is the only claim a stamp the
substrate owns can actually support.

The same reasoning bounds what the stamp can promise. Two writes inside the
filesystem's stamp granularity are one write to this gate, and granularity is a
property of the mount, not of the code — coarse on network shares and on
filesystems that store whole seconds. Where a missed edit inside that window
matters, the stamp is a cheap pre-filter and a content hash is the decider; the
structure is unchanged, only the comparison gets more expensive.

## Schema change is a rebuild, not a migration

A derivation has one property its source does not: it can always be thrown
away. That makes migrating it a category error — a migration is code written
once, run once, and wrong forever afterwards, maintained for a store that could
have been regenerated from scratch instead.

So version the derivation's *schema* and make the version part of the
derivation's identity — the index's name, the cache directory's name, the
mirror table's name. A schema change is then one constant edit, and its
consequence is structural: the running process looks for a derivation under the
new identity, does not find one, clears whatever occupies the location, and
builds. `mirror-indexes` requires that a full rebuild exist and be cheap to
reach for, and leaves its invocation to the moment "doubt arises" — which is a
human judgment nobody makes on schedule. Naming the derivation after its schema
converts that judgment into a fact the process discovers at startup.

The obligation this creates is on the source, not the derivation: everything the
mirror holds must be recoverable from a full walk. A field that exists only in
the mirror — a hand-corrected title, an operator's annotation, anything the
store cannot regenerate — makes the rebuild lossy, and the version bump then
deletes it. Either that field moves into the store, or the derivation is not a
derivation and this technique does not apply to it.

## Reconciliation is optional work, so contention degrades

Putting a write-capable pass on every read path creates contention against a
store that usually admits one writer. The reconcile's exhaustion policy follows
from what it is: an accuracy improvement to an answer that exists either way.

Retry the reconcile a bounded number of times, and when the retries are spent,
**log it and answer the query from the derivation as it stands.** A reader that
fails because another reader was refreshing the index has converted an
optimization into an outage. This is the read-path member of the family
`absent-degrades-malformed-fails-fast` names in
[optional-dependency-degradation](../../../backend-platform/resilience/optional-dependency-degradation/optional-dependency-degradation.md):
a reconcile that could not run is absent and degrades; a derivation that will
not parse is malformed and fails.

Say the degradation out loud where the answer is consumed. A result set computed
against an admittedly stale derivation is a different claim from one computed
against a reconciled derivation, and only the first needs a caveat.

## What it costs, and where it stops being affordable

The price is paid per read and it is exact: one directory enumeration, plus one
stat per record the derivation already holds, plus re-derivation of whatever
disagreed. That is affordable under two conditions, and both must hold:

- **The store is small enough that a full enumeration is not itself the query.**
  Thousands of records, not millions. The pass is linear in corpus size on every
  single read, which is precisely the cost profile an index exists to avoid — so
  a corpus large enough to need the index badly is a corpus this trigger stops
  fitting.
- **Reads are human-paced.** A person searching their own notes issues reads
  seconds apart. A service answering thousands of reads per second pays the
  sweep thousands of times per second to observe the same unchanged tree.

Where either fails, the trigger moves rather than the mechanism: reconcile on a
timer, or on an explicit refresh, or behind a short debounce that collapses a
burst of reads into one sweep — and the moment reconciliation stops riding the
read, the time-based staleness bound `editor-interop` requires comes back,
because the window has reopened. Everything else here survives the move: the
stamp still lives in the mirror, the comparison is still inequality, the schema
is still a name, and exhaustion still degrades.

## Failure modes

- **The ledger nobody resolves.** A record of what was last reconciled, written
  faithfully on every reconcile, that no gate ever reads back — so it can hold a
  value that does not resolve to anything at all and the store still reports
  clean. A stamp is not a gate; the comparison is the gate, and a stamp with no
  comparison is decoration that reads as diligence.
- **The gate that only sees the change in flight.** A staleness check that
  compares what is being changed *right now* rather than what the derivation
  says it was reconciled to. It fires while the edit is in the working set and
  goes silent forever once the edit lands, so drift is detectable during exactly
  the one moment it is not yet drift.
- **The ordering comparison.** `stored < live` against a stamp the substrate
  owns, serving a superseded derivation after any restore, checkout or
  timestamp-preserving copy.
- **The migration for a derived store** — schema evolution code maintained for
  data that a full walk regenerates in seconds.
- **The lossy rebuild** — a field that lives only in the mirror, deleted by the
  first version bump, discovered by its absence.
- **The reconcile that fails the read.** Lock contention on the derivation
  turned into an error for a caller who asked a question the derivation could
  have answered.
- **The sweep that outgrew its trigger** — a corpus that crossed from thousands
  to millions of records while the reconcile stayed on the read path, so every
  query now pays a full enumeration to learn nothing changed.
