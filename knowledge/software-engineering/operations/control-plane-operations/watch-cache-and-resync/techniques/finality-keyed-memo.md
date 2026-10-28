---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: finality-keyed-memo
status: forged
laws: [derivation-names-recomputation, creation-names-reaper]
shared_with: []
use_when: [a poll re-reads details that cannot have changed since the last cycle, deciding which polled facts may be cached and for how long, a cached status kept showing running after the run finished]
---

# Finality-keyed memo

A polling replica's cost is dominated by detail reads — the diff of each change,
the status of each run, the notes on each item — and most of them return what
the previous cycle already read. A time-to-live cache is the reflex and the
wrong instrument: it re-reads facts that can never change and serves stale
facts that changed a second after caching. The technique caches each fact **by
the condition under which it cannot change**, and only while that condition
holds.

## The two keys

- **Content-addressed facts are cached by their address, forever.** A diff
  at a commit hash, a file at a blob id, a revision of a document at its
  revision id: the key names an immutable thing, so the fact derived from it
  is immutable too. The memo stores the key beside the value and a hit
  requires the current key to equal the stored one — a change that gets a
  new head simply misses.
- **State facts are cached only once final.** The status of a run is cached
  when, and only when, it reaches a terminal state (*succeeded*, *failed*,
  *cancelled*); a running, pending or unrecognised status is returned but
  not stored, so the next cycle reads it again. The cache key includes the
  run's identity, so a new run for the same item misses.

## Procedure

1. **Name the immutability for each memo where it is declared.** *A sha's
   diff never changes*; *a final status never changes*. If the sentence
   cannot be written, the fact is not memoisable and is re-read
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
   the key is the recomputation rule).
2. **Treat unknown statuses as non-final.** A status the mapper does not
   recognise — a new state the source added, a manual or skipped state —
   is *unknown* and is not cached; caching it would freeze a value nobody
   decided was final.
3. **Never cache a failed read.** A detail read that failed is not a value;
   it is recorded as an issue and the field is unknown for this cycle.
4. **Keep the memo volatile and say so.** The memo lives in process memory;
   losing it costs one slower cycle, because every row is rebuilt from the
   source. A memo that must survive restart has become a store and needs
   that discipline.
5. **Declare each memo's reaper with its key kind.** Entries keyed by a
   source are dropped when the source leaves the scope; entries keyed by an
   item are dropped when the item leaves the polled window; entries keyed
   by content may be kept or trimmed to the revisions last read. Declare
   the key kind of every memo in one table that the type system checks, so
   adding a memo without saying how it is forgotten fails to compile
   ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

## Decision rules

- **A final status may still be superseded, not changed.** A re-run creates
  a new run identity; the memo for the old one stays correct, and the item's
  head points at the new one, which misses. Do not invalidate finals on a
  timer to catch re-runs; key by run.
- **When a fact's item leaves the polled window,** its last-read value stays
  on the stored row, and the memo entry goes. A status that finishes after
  the item left the window keeps its last read, and the view should date it.
- **Cheap list reads that carry a modification stamp** (an updated-at on
  each item) can key a memo of the item's sub-resources — its notes, its
  comments — by that stamp: the source says nothing changed, so nothing is
  re-read.

## When not to use

A source that publishes change events or entity versions should be followed by
them; the memo is for the polled source that offers neither and whose detail
reads are the replica's cost.
