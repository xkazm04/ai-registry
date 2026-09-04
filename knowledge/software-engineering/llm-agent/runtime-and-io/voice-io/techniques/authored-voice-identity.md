---
layer: technique
type: technique
subject: voice-io
technique: authored-voice-identity
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [an engine offers to build a voice from a description or a sample instead of a catalog, storing a user's custom voice so it survives an engine upgrade, deciding whether a voice control needs a consent record, a custom voice sounds different every time it is regenerated, a voice ships as an opaque precomputed artifact rather than as audio or prose, a product must not be able to clone a voice at all]
---

# Authored voice identity

Everything the catalog discipline assumes is that a voice is **selected**: the
engine publishes a finite set of voices, the product stores a reference into
that set, and the hazard is the reference going stale when the set changes.
A growing class of engine breaks that assumption by letting a voice be
**authored** — brought into existence by the product rather than chosen from a
list. There are four specification kinds and the catalog model handles only
the first:

| Kind | What the product supplies | What identifies the voice |
| --- | --- | --- |
| **selected** | an identifier from the engine's published set | the engine's identifier |
| **described** | prose naming age, accent, register, delivery — no audio at all | the description text |
| **cloned** | a sample of real speech, plus a transcript of that sample | the sample and its provenance |
| **materialized** | the engine's own conditioning state for the voice, computed once and shipped as an opaque artifact | the artifact itself |

Direction — a prompt steering tone, pace or emotion for one render — composes
with all four and identifies nothing; it is a per-utterance parameter, not a
voice. The line that matters is whether the voice **pre-exists the product's
request**, because everything below follows from it.

## The durable artifact and the volatile one trade places

For a selected voice the identifier is durable and the audio is reproducible;
the catalog's whole integrity rule — *the stored preference is a reference, not
a promise* — exists because that identifier can be retired underneath you.

An authored voice has no engine-side identifier to retire, so that hazard
simply does not apply, and the opposite one takes its place. **The
specification is durable and the timbre is volatile.** A description or a
sample can be stored forever and re-sent to any engine that accepts that kind;
what cannot be guaranteed is that re-synthesis returns the same voice. Sampling
makes two renders from one description differ, an engine version bump can move
them further, and the drift is silent — nothing errors, the product simply
speaks in a slightly different person's voice than it did last week.

The storage rule follows directly, and it is the audio cache's discipline
raised one level ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):

- **The specification inputs are the system of record.** For a described
  voice: the description text and the engine version it was authored against.
  For a cloned voice: the reference sample, its transcript, and its provenance.
  Any seed or determinism control the engine exposes is part of the record, not
  a detail — it is the only thing standing between the product and silent
  re-casting.
- **A rendered voice sample is a cache, keyed by that whole tuple**, and it is
  a cache the product should actually keep, because for an authored voice the
  cached sample is the only evidence of what the voice *was*. Where the engine
  offers no determinism control, the honest posture is that the voice is
  pinned to its samples rather than to its specification, and re-authoring is a
  cast decision that goes back through casting.
- **An authored voice still needs a stable internal identity**
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)) so
  that transcripts, logs and per-persona mappings can name it without naming
  the description text. Two voices authored from identical descriptions at
  different times are two voices.

## The fourth kind inverts the trade, and that is why it is chosen

A **materialized** voice is neither selected nor authored in the sense above:
the product ships the engine's *own internal conditioning state* for that
voice — the prefix the model would have computed from a sample, computed once
by whoever built the artifact and distributed as an opaque blob. It is not an
identifier the engine resolves, it is not prose, and it is not a sample. It
sits downstream of the encoder, and everything about it follows from that one
fact.

**The durable/volatile pairing above runs the other way.** For described and
cloned voices the specification is durable and the timbre is volatile, and the
storage rule exists to keep the specification because the timbre cannot be
guaranteed. Here **the timbre is the durable thing and there is no
specification to keep.** The artifact does not get re-synthesised into a voice;
it *is* the state re-synthesis would have produced, so a sampling difference or
an engine version bump cannot re-cast it. It either loads or it fails to load.
The whole storage discipline of this technique — the specification inputs as
the system of record, the rendered sample as a cache keyed by that tuple —
has no referent, because there are no inputs and the artifact is a cache of
nothing the product can recompute.

Three consequences, and a product that takes the fourth kind is buying all
three together:

- **Reproducibility is free and total.** The conditioning prefix is
  byte-identical on every request, which is the property
  [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
  normally has to be engineered toward. Silent re-casting, the failure this
  technique exists to prevent, cannot occur.
- **Portability is gone, and not merely reduced.** A cloned voice's sample can
  be re-sent to any engine accepting that kind. A materialized voice is bound
  to one model's internal layout, so it does not survive a *version* bump, let
  alone a change of engine — and the failure is total rather than a drift. The
  fallback-chain rule above therefore binds harder here: there is no receiving
  adapter, in any fallback, on which the stored artifact means anything. The
  degradation is always a cast decision.
- **Latency moves off the request path.** There is no encode step between the
  request and the first audio, which is why this kind appears in products with
  a first-audio budget tight enough that an encode does not fit in it.

**Establish the artifact's identity when it is installed, never when it is
used.** This follows from the first two consequences together and is the one
place the kind's storage rule is counter-intuitive. Because the artifact is the
identity, the temptation is to key caches and receipts on a hash of its bytes,
computed where the voice is resolved. That is correct and it is in the wrong
place: these artifacts are large — tens of megabytes is ordinary, since the
whole point is a materialized state rather than a reference — and the voice is
resolved on the request path, ahead of any cache lookup that resolution feeds.
Hashing there taxes every request, including the hits, with a cost measured in
tens of milliseconds against a stat's microseconds, and it is levied hardest on
exactly the fast path a synthesis cache exists to create.

So the hash is computed **once, at the moment the artifact enters the catalog**
— an import, an export, a pack installation, a re-materialization — and stored
beside it. Everything on the request path reads the stored value. The rule that
falls out is worth stating on its own, because it is what makes the cheap
identity honest: **whatever installs an artifact is responsible for making its
cheap identity move.** Where a deployment fingerprints by file metadata, the
installer stamps the modification time even when the byte count is unchanged;
a delivery mechanism that preserves timestamps — an archive extraction, a
metadata-preserving copy, an image layer — will otherwise install new bytes
under an unchanged fingerprint, and the product serves the previous voice with
no error anywhere. Fixing that at the read side is the expensive answer to a
problem the write side can close for nothing.

**The consent question does not disappear, and the artifact cannot answer it.**
A materialized artifact is frequently made from a real person's speech, and
after materialization nobody downstream can listen to it, attribute it, or
check its provenance by inspection. So it needs a clone's consent record while
carrying none of a clone's evidence, and treating an artifact that arrives
without one as a described voice — which is what its opacity makes it resemble
— is how a catalog acquires an unattributable likeness.

The record therefore has to do work the artifact cannot, and the shape that
does it is **a content hash of the source clip stored in the consent receipt.**
That single field is what makes the chain checkable in the direction anyone
actually needs it: given a recording and a receipt, a reviewer can establish
that *this* consent covers *that* audio, without the artifact participating at
all. Storing the clip's filename, its duration, or the date of the sign-off
does not survive a re-encode, a rename, or a second clip from the same session.
Two consequences follow and both are cheap:

- **Stamp the receipt forward on every re-materialization.** An artifact
  rebuilt from a clip that was already consented to inherits that receipt
  rather than prompting for a new attestation, which is what stops a rebuild
  from quietly becoming an unconsented voice.
- **Export is one-directional.** A portable bundle may carry the artifact and
  the receipt; it must not carry the artifact *as* a recording, because that
  turns an opaque conditioning state back into a distributable sample and
  launders the consent by omission. If the format can express both, the guard
  belongs in the exporter.

**A capability that cannot be expressed cannot be misused, and that is a
design position rather than a policy one.** A product that accepts only
materialized voices has no code path from an arbitrary sample to a voice; the
cloning capability is absent from the system rather than gated within it, and
absence is the one control that survives the product's own configuration,
its operators, and its future maintainers. The cost is stated plainly and is
the reason it is not the default: the voice set is closed, and extending it is
somebody else's build step rather than the product's feature.

## A cloned voice is a likeness; a described voice is not

The two arrive through the same control and are the same shape in a schema.
They are entirely different objects the moment anyone asks where the voice came
from, and the catalog must not flatten them into one list:

- A **cloned** voice is a likeness of a real person. It carries a consent
  record naming who was cloned, by what evidence, for what use, and for how
  long — and the sample is chosen from performances the owner endorses, not
  from whatever recording was nearest. A clone with no provenance is not a
  voice, it is a liability with a play button.
- A **described** voice is authored from nothing and needs no such record —
  and this is the reason to prefer it wherever a specific real person is not
  the point. It is also the reason the two must be visibly distinguishable in
  every surface that lists voices, because a reviewer's first question about
  any voice in the catalog is which of the two it is.
- **Check whether the sample is self-contained, because it varies by engine.**
  Some cloning paths require the reference audio's transcript alongside the
  clip; a **zero-shot** path takes the clip alone. The rule is therefore not
  "always store a transcript" but *store whatever the clone cannot be
  re-derived without* — and that set is a property of the engine, which is one
  more reason it belongs in the capability declaration below rather than in the
  storage code. A measured counter-example: a shipped zero-shot engine clones
  from a single reference wav with no transcript anywhere in its interface, so
  a product that made the transcript mandatory would have blocked its own only
  cloning engine.

The acoustic caveat in
[tts-pipeline](./tts-pipeline.md) applies with extra force here: a cloned voice
inherits the recording chain of *its own reference sample*, so an otherwise
excellent clip recorded in the wrong room clones the room.

## The adapter declares which kinds it accepts

[engine-abstraction](./engine-abstraction.md) requires capability to be a
first-class declaration and forbids branching on engine identity. Its published
axes — streaming, timestamps, language coverage, partials, speed, execution
location — all describe what an engine does with the *text* it is given, and
none of them can express what an engine accepts as a *voice*. So the axis set
gains one: **which specification kinds the adapter supports**, declared and
probed like any other.

It is a load-bearing capability rather than a cosmetic one, because the
surfaces differ. "Describe the voice you want" is a text field with no
validation the product can perform, an unbounded render cost, and no preview
until the engine answers; "choose a voice" is a list. A product that offers a
described voice against an engine supporting only selected ones has built a
control that
cannot be wired, and the failure is at authoring time rather than at synthesis
time — which is exactly the class the honest-outcome discipline
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success))
exists for: *unsupported specification kind* is a distinct, actionable outcome,
not an empty voice list.

The fallback chain inherits the same constraint. A preference chain that
degrades from an engine accepting descriptions to one that does not cannot
carry the voice across — the stored specification has no meaning on the
receiving adapter. Either the chain is restricted to engines sharing the kind,
or the degradation is a **cast** decision surfaced to the user, never a
silent substitution.

## What this technique does not claim

That authored voices are better. They are a different object with a different
failure surface, and for a product that needs one recognisable narrator
forever, a selected voice from a stable catalog is the stronger choice
precisely because its identity is somebody else's problem to keep. The
technique's job is to stop a product from storing an authored voice as though
it were a selected one, which is the failure that ships silently and surfaces
as a voice that slowly stops being the same person.
