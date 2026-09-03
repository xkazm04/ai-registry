---
layer: technique
type: technique
subject: self-describing-data-envelopes
technique: sidecar-as-export-format
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [migrating a pipeline from beside-the-data metadata to envelopes, a downstream consumer that still reads the sibling-key convention, a transform that reads the sidecar as a fallback]
---

# Sidecar as export format

A pipeline does not adopt envelopes on a green field. It adopts them in a
codebase whose samples are dictionaries, whose metadata sits under a sibling
key derived from the value's key by a suffix, and whose serialisers, caches,
downstream tools and third-party stages were all written against that
convention. The migration that deletes the sidecar convention strands every
one of them at once. The migration that leaves it in place *alongside* the
envelope — transforms reading whichever is present — restores the two-
authority failure that motivated the migration. The design that works is to
demote the sidecar from a representation to a **format**: something an
envelope can be exported *to* and imported *from*, by two explicit conversion
stages, and read by nothing else.

## The two conversions

The **unpack** stage takes a sample holding envelopes and produces a sample
holding bare primitives plus, for each, a sibling metadata entry under the
convention's key, containing the frame, the metadata map and the journal in
whatever serialisable shape the convention used. It is placed at the *end* of
a pipeline whose consumer expects the old shape — a serialiser, an external
tool, a legacy evaluation script.

The **pack** stage does the reverse: it takes a sample holding bare primitives
with sibling metadata entries and produces envelopes, removing the sibling
entries from the sample so that nothing downstream can read them. It is placed
at the *start* of a pipeline whose producer emits the old shape — a cache
written before the migration, a reader that has not been updated, a
third-party stage that returns the convention.

Both are ordinary transforms with names, so that they appear in a pipeline
definition where a reviewer can see them. Both are also **journaled and
invertible** like any other transform — the unpack pushes an entry before it
writes the sidecar, and its inverse pops that entry and re-packs — so that a
pipeline's inverse can cross the format boundary in either direction rather
than stopping at it; a conversion that is not journaled leaves a hole in the
history at precisely the seam where a consumer will want to run backwards.
And both are total: an unpack of an
envelope with an empty journal writes an empty journal, and a pack of a
primitive with no sibling entry produces an envelope with a default frame and
an empty map, not an error. The conversions are the boundary, and a boundary
that refuses some values is a boundary consumers will route around.

## Why the sidecar must not be a fallback

The tempting compromise during a migration is for every transform to accept
both shapes — read the envelope's frame if the value is an envelope, else
read the sibling key. It ships faster, because no pipeline definition has to
change. It also means the frame has
[two authorities](../../../../_laws.md#one-authority-per-vocabulary): a sample
can hold an envelope *and* a stale sibling entry, and which one a transform
reads depends on which branch of the fallback it takes. The moment one
transform updates the envelope and not the sibling — which is every transform
written after the migration — the sibling is a confident description of a
value that no longer exists, read by the next transform that happens to take
the fallback branch. That is the original failure, reintroduced with a
migration's worth of extra surface.

The rule is therefore absolute for the transforms in the middle of a
pipeline: **they read the envelope, or they fail.** Only the two conversion
stages know that the sidecar exists. A transform that grows a fallback branch
has moved the boundary inside itself, and the review that catches it asks one
question: is this transform one of the two conversions? If not, the branch
goes.

## The old serialised shape as a contract

Exporting to the sidecar shape is also how the pipeline talks to the world
that never adopted envelopes: a file written to disk with a metadata header, a
message on a queue, a record in a cache that predates the envelope type. For
those, the sidecar *is* the wire format and the unpack stage is the serialiser's
front half. This is worth stating because it reframes the sidecar: it was
never a bad idea as a format — a value and its metadata beside it is how every
persistent representation works — it was a bad idea as the *in-flight*
representation, where nothing enforces that the two move together. The
migration is not "abolish the sidecar"; it is "the sidecar is what the value
looks like at rest, the envelope is what it looks like in motion, and the two
conversions are the only doors between them."

## What the migration leaves behind, deliberately

Some machinery from the sidecar era does not survive as a format and must be
removed rather than kept. Any transform that *synchronised* the two
representations — a reconciliation step that compared the envelope's journal
with the sidecar's and picked the longer one — is a symptom of the two-
authority state and has no place once the conversions are the only doors; it
is deleted, and its deletion is a repair rather than a hiding, because the
condition it reconciled can no longer arise. While such a step must still
exist — for one release, gated off — it names the envelope as the preferred
authority when both are present and chooses the *longer* journal on the
forward path and the *shorter* on the inverse, because the longer one is the
one that saw the most recent transform; a reconciliation with no stated winner
is a coin toss per sample. Any per-transform hook that
mirrored envelope updates into the sidecar is likewise removed, along with the
global toggle that enabled it. What remains is the two conversions, the
envelope, and nothing that reads both.

If the old machinery must be kept for one release to give consumers time, it
is kept behind a switch whose default is *off*, whose enabling is loud, and
whose removal date is written beside the switch — a compatibility layer with
no reaper is the sidecar returning under a different name.

## When not to use it

A pipeline that never had a sidecar convention — envelopes from the first
commit — needs an export format only if some consumer outside the pipeline
wants one, and that consumer defines it. A pipeline whose old consumers can
all be migrated in the same change as the pipeline has no stranded consumer to
protect and can delete the convention outright, keeping the unpack stage only
if a persistent format needs it. And a sidecar that carried facts the envelope
does not model — some field with no slot — is not a format problem but a slot
problem, answered by extending the metadata map, not by keeping the sidecar
alive to hold the orphan.
