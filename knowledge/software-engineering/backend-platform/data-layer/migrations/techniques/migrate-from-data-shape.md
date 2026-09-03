---
layer: technique
type: technique
subject: migrations
technique: migrate-from-data-shape
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [the store has nowhere to write a version marker atomically with the data it describes, a store can be opened between runs by another release or by hand, deciding what an unrecognised store shape means, a crash left half the records converted and half not]
---

# Migrating from the data's shape

The runner anatomy this subject describes rests on a version marker: a number
stored in the data, read first, differenced against the number the code
carries. Two conditions turn that marker from a fact into a claim, and where
either holds the whole ledger design has to be replaced rather than patched.

- **The marker has no atomic home.** In a store whose "header" is a second
  write — a document set, a directory of files, a keyed collection with no
  transaction spanning it — the marker and the data commit separately, and a
  crash between them leaves the marker wrong in one of two directions,
  neither detectable from the marker.
- **The store is reachable by writers the marker does not know about.** An
  older release, a support tool, a person with an editor. The marker records
  what *some* writer believed; nothing binds it to the data as it now is.

The alternative is to stop asking the marker and ask the data: **on open,
classify the shape of what is actually stored, and migrate forward from the
shape you find.** The rows are the only authority — a marker is a proxy, and
a gate on a proxy passes exactly when the proxy has diverged
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## This is not the ledger-less replay variant

The two are often confused and their hazards are opposite. A ledger-less
replay chain still has an ordered chain of *steps*, each guarded by a probe
asking "has my step run"; its characteristic failure is chain-level — two
steps that undo each other and never reach a fixed point
([idempotent-steps](./idempotent-steps.md)). Shape-derived migration has no
step identity at all: it asks "what shape is this record", classifies, and
transforms accordingly. Its failure is a record matching nothing.

## The discriminator is the entire design

Everything the approach promises reduces to the signature's quality.

- **Positive, never by elimination.** "Carries this field" identifies the new
  shape; "lacks this field" identifies the old shape *or* a truncated store
  *or* one from a release that removed the field again. Give every shape a
  positive signature; classify nothing by being left over.
- **Total, not sampled.** The temptation is to inspect a handful of records
  and generalise, because classification runs on every open. It is wrong: a
  store crashed mid-conversion is *legitimately mixed*, so a sample answers a
  question about the sample. If a full pass is unaffordable, the cheap check
  must be one whose positive answer is conclusive for the whole store and
  whose negative answer routes to the full pass — never a sample generalised.
- **Stable forever.** A discriminator is a shipped contract like a step: once
  a release classifies on it, every later release must classify the same
  population the same way, and changing it forks the fleet with no version
  number to attribute the fork to.
- **Cheap on the converged store.** The probe runs on every open and cannot
  short-circuit on a number. Price it against the store that needs no work,
  and shape the signature so "nothing to do" is the cheapest answer.

## Three outcomes, and the collapse to guard against

Classification produces exactly three answers, each with its own spelling
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):

1. **Recognised, current** — no work.
2. **Recognised, older** — transform.
3. **Unrecognised** — refuse to open, naming what was found.

The collapse that destroys the design is treating outcome 3 as outcome 1:
matching no known signature read as "must already be current". This is the
marker-less spelling of the refuse-a-store-from-the-future rule, for the same
reason — a store written by a newer release looks, to an older one, exactly
like an unrecognised shape
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and
operating on data whose shape you cannot name corrupts on the first write.

The same discipline governs the classifier's own reads. A pass that meets a
record it cannot parse must **abort**, not skip: a skipped record is excluded
from conversion, and once its siblings are converted the "already current"
check short-circuits every later open — so it never gets converted at all,
permanently and invisibly. Strictness in the classifier is all that stands
between a parse failure and a stranded record.

## Mixed is normal, so the unit is the record

With no atomic marker there is also no atomic migration boundary. A crash
mid-conversion leaves some records old and some new — a legal state, not an
error — which decides the architecture:

- **Classify per record and transform per record.** Converged means "no
  record carries an old signature", not "a flag says done".
- **Re-running is the recovery path.** Classifying each record independently
  makes the whole migration an idempotent sweep, so the answer to a failure
  is to run it again. Guards obey the assert-don't-skip rule and its
  uncertainty bias — an unreadable probe resolves toward *converting*, whose
  failure is loud, never toward skipping
  ([idempotent-steps](./idempotent-steps.md)).
- **Decide the reader's posture explicitly.** Outside the sweep, a read that
  meets an old-shape record either refuses or converts in memory while the
  sweep converts on disk. Forbidden is the third habit: coercing the old
  shape into a partial new-shape value by filling defaults. Those defaults
  get written back, the old signature disappears, and the migration has
  nothing left to detect — the source destroyed by the reader meant to
  tolerate it.

## Order of operations at open

Classify, then snapshot, then transform. The snapshot contract still applies
in full ([pre-migration-snapshots](./pre-migration-snapshots.md)); what
changes is that "is work pending?" is knowable only *after* classification
rather than from a cheap ledger comparison — the real cost of going
marker-less, paid on every open. The pass must therefore be strictly
read-only: a classifier that repairs what it finds has moved the transform in
front of the snapshot gate.

## Boundary

[schema-drift-detection](./schema-drift-detection.md) presumes both a
replayable step chain and a recorded version, and its Class 1 is the
**two**-authority problem: a fresh-install path and an upgrade path each
defining "the current schema". Shape derivation is the zero-marker answer, so
that class cannot arise in the same form — the data is the only authority
there is. What survives, transposed: the convergence test becomes *build a
store fresh, sweep a fixture written by the oldest supported release, assert
the two are indistinguishable under every discriminator*; the boot-time
assertion becomes *no record carries an old signature* rather than a hash
matched against a manifest; the integrity sweeps carry over unchanged.

## When not to reach for this

**When the store can hold a marker atomically with its data, use the
marker.** It is cheaper on every open, it supplies the is-work-pending signal
the snapshot gate wants, and it lets a store from the future be refused on a
number rather than on the absence of a signature. Shape derivation answers a
missing capability; it is not an upgrade over the ledger, and a system that
has the capability and derives anyway has bought per-open cost and given up
its clearest diagnostic.

It does not apply at all where shapes are indistinguishable by inspection:
two releases that changed a field's *meaning* without changing its presence
or type leave records no signature can tell apart. There the honest answer is
a marker, an export-reimport, or a new field — never a discriminator that
guesses, because the mis-classified record is transformed by the wrong rule
and the evidence of which rule ran is gone.
