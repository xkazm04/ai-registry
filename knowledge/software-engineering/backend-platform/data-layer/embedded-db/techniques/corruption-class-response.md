---
layer: technique
type: technique
subject: embedded-db
technique: corruption-class-response
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success, deletion-is-not-repair]
shared_with: []
use_when: [a live write reports the store is malformed, deciding whether to rebuild a damaged index or stop writing, a damaged store became unopenable after the incident, choosing what a handle may do after its first corruption error]
---

# Corruption-class response

Every other technique in this subject is about not arriving here. This one
starts after arrival: a live operation, on the user's data, has just been told
the store is damaged. The question is no longer how to avoid it — it is what
this handle is allowed to do next, and the answer is not one answer.

**Corruption is a class, not an event**, and the two classes have opposite
correct responses. Damage confined to a *derived* structure — a search index,
a materialised rollup, anything the application could recompute from records
it still holds — should be *detached*, with canonical writes continuing.
Damage in *canonical* structure — the record trees, the schema, the free
list — should *quarantine the handle* and stop writing entirely. A design with
one response for both is wrong in one of two ways: retry-and-rebuild
everywhere turns a derived-index fault on the write path into an unbounded
rebuild of the whole history, and quarantine-everywhere takes an application
offline over an index it could have dropped.

## Classify by provenance, and carry the verdict as a value

The class is decided by *where the failing operation was working*, not by the
error string alone. A corruption report raised while writing through a derived
sink, or from a statement against a derived table, is derived damage. A bare
structural report with no derived provenance — the image is malformed, the
file is not a database — is canonical damage, and it is the more dangerous
reading, so it is the default when provenance is absent.

That verdict then has to reach every boundary that acts on it as a **typed
value** ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
the write path, the flush path that must find somewhere else to put pending
work, the maintenance scheduler that must not start a pass, the health probe,
the operator-facing diagnostic. A classification that exists only as a log
line and is re-derived downstream by matching message text has died at the
boundary where it mattered — and message text is exactly the surface an engine
is free to reword between versions.

## Derived damage detaches; it never rebuilds inline

On a derived-damage verdict, in one transaction: record a **durable stale
marker**, remove the synchronisation triggers that keep the derived structure
current, then retry the canonical write with the derived sinks removed. Reads
that used the derived structure fall back to the slower exact path over
canonical rows.

The rule that makes this safe is a prohibition: **a live operation never
triggers a rebuild.** A rebuild is unbounded in the size of the history and
would run on the user's write path, at the worst possible moment, on a store
already known to be damaged. Rebuild ownership stays where it already is — a
later open, under the cross-process admission check that
[single-writer-holder-discipline](./single-writer-holder-discipline.md)
describes. If that guarded rebuild cannot run, the correct steady state is
*detached*: canonical writes available, the derived structure absent, the
marker durable and the repair command named.

Two failure modes hide in that steady state.

- A search served from a detached index returns fewer results and no error,
  which is the empty-success spelling of a fault
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  The stale marker must be readable by the surfaces that answer queries, not
  just by the repair tool, so degraded answers are labelled as degraded.
- The tempting repair is to delete the canonical rows the derived structure
  chokes on. That is
  [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in its
  purest form: it removes the evidence and the user's data together, to
  silence a fault in a structure that was rebuildable all along.

## Canonical damage quarantines the handle

On a structural verdict the handle is finished, and finished means four things
at once:

1. the failing write propagates the typed error and **nothing is retried**;
2. every later write on that handle fails immediately, without touching the
   file;
3. the handle never reopens its connection after close; and
4. close **skips its explicit checkpoint**, and where the engine exposes the
   switch, its own last-connection checkpoint is disabled too.

**Stopping the writes is the protection.** The measurement behind that
sentence is worth carrying: a handle that kept writing for roughly fifty
minutes after its first structural error checkpointed a handful of pages under
the wrong page numbers on shutdown — a leaf of a derived index landed on page
one — and a damaged-but-*readable* file became one that would not open at all.
The first structural error cost nothing that a recovery pass could not
retrieve; the fifty minutes of continued writing cost the file.

Point 4 is the one that reads as impolite and is not. Folding journal frames
into the main file is normally the tidy thing to do at close, but on a store
with damaged canonical structure it is the single write with the widest blast
radius, because it rewrites pages across the whole file using the very
metadata that is suspect. Leaving the frames in the sidecar keeps the most
recent commits legible to a recovery pass. Where the engine insists on one
last checkpoint anyway, the file set — main file and every sidecar, per the
file-set clause in
[journal-and-durability-modes](./journal-and-durability-modes.md) — is copied
*before* anything restarts.

Quarantine is per process and poisons the shared handle for every holder
inside it. The process restarts on a repaired or restored file; it does not
recover in place.

## Quarantine protects the file, not the work

A handle that refuses writes is a handle that is dropping the work those
writes carried. The quarantine decision therefore names, at the same moment,
**where pending work goes instead** — an append-only record beside the store,
a spool directory, anything that is not a retry queue aimed at the poisoned
handle. A retry queue is the default only because nobody chose; it converts a
recoverable file into a recoverable file plus lost work, and it keeps the
damaged file under write pressure while it does so.

## Decision rules

- Classify before responding: derived provenance means derived damage; a bare
  structural report with no provenance is canonical damage, and absent
  provenance defaults to canonical.
- Carry the class as a typed value to every path that must behave differently,
  never as text to be re-matched.
- On derived damage: mark stale durably, drop the synchronisation triggers,
  retry the canonical write without the derived sinks, serve the slow exact
  path — and never let a live operation start a rebuild.
- Keep the degraded answer labelled; a smaller result set with no error is the
  fault presenting as success.
- On canonical damage: propagate typed, retry nothing, refuse every later
  write on the handle, never reopen, and skip the checkpoint on close.
- Name the alternative sink for pending work in the same act that declares the
  quarantine.
- Never delete canonical rows to make a derived-structure error disappear.

## When not to use this

A store whose *entire* content is derived — a cache, a local mirror of an
authoritative record elsewhere — needs no split: the response to any
corruption is to discard the file and re-derive, and both branches above are
ceremony. Nor does the split help a short-lived process that can simply exit
and be restarted by its supervisor: quarantine exists so that a long-lived
process serving other work can keep serving it while one store is out.

And this technique assumes damage is real. Corruption-shaped errors on a
single-writer store are frequently a *holder*, not damage, and running this
classification against a store another process is writing produces a confident
verdict about nothing. The first question stays the one in
[single-writer-holder-discipline](./single-writer-holder-discipline.md): who
else has this open. Classify after the at-rest test, not before it.
