---
layer: technique
type: technique
subject: import-normalization
technique: durable-intermediate-representation
status: forged
laws: [derivation-names-recomputation, creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [parsing is the expensive stage and downstream knobs will be retuned, the parser is a third party that may not still be installed, a re-process would otherwise re-read the original artifact through a non-deterministic converter]
---

# The durable intermediate representation

[intermediate-representation](./intermediate-representation.md) describes a
staging shape: constructed in memory, consumed by validation, review and
commit, discarded when the proposal lands. That is the right answer for the
ordinary import, where the parse is cheap and deterministic and the original
artifact is still sitting where the user put it.

There is a class of pipeline where it is the wrong answer, and the
discriminator is precise: **when parsing is the expensive, non-deterministic,
externally-dependent stage, the parsed form is persisted beside the source and
every later stage reads it instead of the source.** The transient IR is a
waist between formats. This one is a waist between *time periods* — between
the parse that happened once and every reprocessing that will happen later.

## The three forces, and none of them is the N×M waist

- **Parse cost dominates.** Extracting structure from a page-oriented or
  binary document — layout analysis, table reconstruction, formula and image
  extraction — can cost orders of magnitude more than everything downstream
  of it, and can involve a model call or an out-of-process service.
- **Every downstream knob will be retuned.** Segment size, segmentation
  strategy, the derivation model, the extraction prompt: an operator changes
  each of these several times in a system's life, and each change reprocesses
  the whole corpus. With a transient IR, every one of those reprocessings
  re-pays the parse.
- **The parser may not still be there, or may not still agree.** A
  third-party or out-of-process converter is an availability dependency and a
  version dependency at once. Re-running it a year later can fail outright,
  or — worse — succeed differently, so a "re-segment" silently becomes a
  re-parse with different bytes underneath and the change is attributed to
  the knob that was actually innocent.

None of these is the force the transient IR answers. That one is combinatorial
(N formats × M consumers); these are temporal, and a staging shape that dies
at commit cannot address any of them.

## What persistence changes about the shape

The durable form is not the transient form written to a file. Four
obligations appear that a staging shape never carries.

**It names the thing that produced it.** Parser identity and parser version
travel *in* the artifact, not in an environment the artifact does not control.
This is the [derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)
law in its strictest reading: a stored derived value states how to recompute
it, and for a parse the recomputation is "this converter, at this version,
over this source". Without both halves the artifact cannot be invalidated on
purpose, only wholesale.

**It names its reaper.** A durable artifact beside the source outlives the run
that made it, so deletion of the source must delete it, and the code path that
writes it owns the path that removes it
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). The
characteristic leak is a store that deletes the record and the derived index
and leaves the parsed artifact on disk, where the next ingest of a
same-named source finds it and reuses somebody else's parse.

**It has a schema version of its own.** It is read by code that will be older
or newer than the code that wrote it — that is the entire point of keeping
it — so it carries a format version and the reader states which versions it
accepts. A durable artifact without a version is a contract with a future
maintainer who was not consulted.

**It has a backfill path.** Every document that entered the system before the
artifact existed has none, and the pipeline must state what happens to those:
re-parse on demand, a bulk conversion job, or a labeled degraded mode where
the affected documents cannot use the stages that read it. This obligation is
the tell that distinguishes the two shapes — a staging form never needs a
story for documents that predate it, and a durable one always does.

## Placeholders: keep the shape, defer the content

Parsing and enrichment are frequently separable — the structural extraction is
cheap-ish and local, while describing an image or a table may need a model
call that the operator has not configured, cannot afford yet, or wants to run
later. The durable artifact should record the *slot* at parse time and leave
the content empty, with the slot's identity stable.

Two rules make deferral safe. The parser writes only what it can observe and
never pre-fills a slot it did not fill, so "not analyzed yet" and "analyzed,
produced nothing" stay different states. And the slot's identifier is minted
at parse time and never renegotiated, so an enrichment run months later writes
back into the artifact by identity rather than by position — the same identity
discipline the transient IR applies to minted entity ids, extended across
runs instead of across stages.

## Reuse must be guarded, and the guard must not be optional

A durable artifact is a cache, and every cache needs an invalidation
predicate: the source's own fingerprint plus the parser's identity, version,
and effective parameters. Where the artifact is produced by an external
service, its endpoint identity belongs in the predicate too — the same
converter behind a different deployment is a different converter.

The failure mode worth naming, because it is the one that actually ships:
**a guard that skips its check when a field is unset**. A predicate written as
"if both sides declare a version, compare them; otherwise proceed" is off by
default in every install that never set the version, which is most of them —
and it is off precisely in the population least able to notice, since nothing
is logged when a comparison does not happen. Per
[absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud), an unset
version is either a refusal to reuse or a visible, recorded decision to reuse
unguarded; it is never a silent pass. The same applies to the artifact's own
self-describing checksum: a fingerprint written at parse time and read by
nobody is documentation, not a guard, and the honest thing is to say so rather
than to let its presence imply verification.

## Boundaries

- **To the transient waist.** They can coexist, and in a mature pipeline they
  do: the durable artifact holds the parsed source faithfully, and the
  transient IR is still constructed per import run from it, still where
  identity is minted and the loss ledger accumulates. Persisting the staging
  shape instead of the parse output collapses the two and pins the host's
  vocabulary into an artifact that outlives it, which is the mistake the
  original technique's "not the host's persistence model" sentence exists to
  prevent.
- **To the downstream unit of retrieval.** The artifact's blocks are not the
  units a retrieval system indexes, and the durable form must not decide the
  segmentation — that is exactly the knob being retuned, and freezing it here
  gives back the property the artifact was bought for. What the artifact
  should carry is enough positional information that a segment produced later
  can point back into it, so segment provenance survives a re-segmentation
  rather than being recomputed by matching text.

## When the transient IR is still right

- **The parse is cheap and deterministic.** A structured text export
  re-reads in milliseconds and produces the same tree every time; persisting
  it buys nothing and adds a reaper, a version and a backfill.
- **The source is not retained.** Where the pipeline is forbidden from keeping
  the original, the parsed form is usually forbidden too — it is the same
  content in a friendlier shape, and it is easy to reason about as "just a
  cache" until a disclosure review disagrees.
- **The pipeline runs once per artifact, ever.** No reprocessing means no
  reprocessing cost to amortize, and the durable form is a maintenance
  obligation with no counterparty.
