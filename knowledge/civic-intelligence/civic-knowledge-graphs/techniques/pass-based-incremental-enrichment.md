---
layer: technique
type: technique
subject: civic-knowledge-graphs
technique: pass-based-incremental-enrichment
status: forged
laws: [one-definition-one-import, disclose-never-repair]
shared_with: []
use_when: [adding a new data layer to an existing graph, writing an ingest that updates node properties, sequencing analysis work over months]
---

# Pass-based incremental enrichment

The concern: a civic graph is not built, it accretes. The roster lands first;
voting analysis enriches it; the money layer arrives when its registry adapter
is ready; engagement metrics, forensic flags and prior-term profiles follow over
months, written by different scripts on different days. The technique is the
discipline that lets many writers deepen one store without erasing each other:
numbered passes, stamped writes, and a merge contract every writer obeys.

## Passes: the unit of accountability

A **pass** is one enrichment run with a number, an owner script, declared
inputs, and a ledger entry. The pass number appears in the provenance of
everything it wrote, so the graph's history reads as a sequence of auditable
deltas: pass 1 minted persons and institutions, pass 10 the money layer, pass
11 legislation, pass 34 role refinements. Keep a human-readable pass ledger —
one line per pass, what it wrote, what it measured — because the store records
*that* pass 22 deleted forty-nine edges; only the ledger records *why*.

Two numbering rules earned by incident:

- **First-seen understates history.** A node's "first seen in pass N" survives
  every later enrichment; the highest first-seen number in the store therefore
  lags the true pass sequence. Deriving "the next pass number" from the store
  is a fallback for the casual invocation — an operator who knows the ledger
  passes the number explicitly, and the ledger is authoritative.
- **Independent efforts get independent sequences, labeled.** When a second
  provenance track starts writing into the same tables (an investigative case
  line beside the analytical loop), its pass numbers are its own sequence.
  Pretending one global sequence exists across uncoordinated efforts produces
  collisions; the fix is a track label in provenance, not renumbering.

## The merge contract: read, then write over

The single most damaging bug class in an accreting graph is the **wholesale
property replace**. A storage layer's upsert typically replaces the entire
property object; a writer that hands it a freshly built object therefore
deletes every property any other pass ever computed for that node — no error,
no diff at write time, just a quieter graph. The contract:

> **What this run computed wins; everything else the node already carried
> survives.** Read the existing properties, spread the new ones over them,
> write the merged object.

Per [one-definition-one-import](../../_laws.md#one-definition-one-import), this
idiom must exist as *one named, unit-tested helper* that every writer imports —
not as a convention each ingest re-spells inline. The measured history is
exactly the law's prediction: the same two-line rule retyped across sibling
scripts was wrong in several of them, and each wrong copy silently destroyed a
layer until the next full recompute. Name it once; cite it; test it.

The merge has an **honest limit, disclosed rather than papered over**: a
property a writer computes *conditionally* keeps its previous value when the
condition lapses. If a recompute stops emitting a rate for a person who fell
below the eligibility floor, the old rate survives under the old pass's
provenance — a stale value, strictly less harmful than the erasure it
replaces, but real. Per
[disclose-never-repair](../../_laws.md#disclose-never-repair), the right
response is to document the limit and track the fix (owned-key deletion lists,
or recomputing the kind wholesale under a rebuild guard), not to pretend the
merge is lossless.

## Recompute in place, never wipe to refresh

Deterministic layers are recomputable, and the upsert-with-merge makes
recomputation safe: each claim is replaced in place, properties merge, other
passes' work survives. This means **a recompute never needs a reset** — the
instinct to "start clean" before re-running a deterministic pass is precisely
the instinct the destructive-rebuild-guard technique exists to intercept.
Proposed layers recompute differently: a new gated proposal supersedes the old
claim, with the old verdict retained as history.

Ingest scripts must also be **re-runnable against human state**: a pass that
refreshes its own source data merge-preserves review states and human
annotations it does not own. "Re-ingest reset the review queue" is a
catastrophic bug with a one-line cause — the ingest treated fields it never
computed as its own to overwrite.

## Decision rules

- When a new analysis needs a new property on an existing kind, it is a new
  pass with its own provenance nested in the property group — never an edit to
  an old pass's output.
- When a pass discovers its own earlier output was wrong (false edges from a
  bad join), the correction is itself a pass: deletions counted, cause named
  in the ledger, population figures updated everywhere they were quoted.
- When two passes want to write the same property, that is an ownership
  conflict to resolve in design, not a race to resolve by ordering. One
  property, one owning pass lineage.

## When not to use passes

A dataset rebuilt whole from one source on every run — a small static lookup, a
single-registry mirror with no enrichment — gains nothing from pass machinery;
version the export and regenerate. Passes pay for themselves exactly when
multiple independent computations must coexist in one store over time. The tell
that you need them is the first time a second script writes to a table a first
script considers its own.
