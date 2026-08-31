---
layer: technique
type: technique
subject: voice-io
technique: authored-voice-identity
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [an engine offers to build a voice from a description or a sample instead of a catalog, storing a user's custom voice so it survives an engine upgrade, deciding whether a voice control needs a consent record, a custom voice sounds different every time it is regenerated]
---

# Authored voice identity

Everything the catalog discipline assumes is that a voice is **selected**: the
engine publishes a finite set of voices, the product stores a reference into
that set, and the hazard is the reference going stale when the set changes.
A growing class of engine breaks that assumption by letting a voice be
**authored** — brought into existence by the product rather than chosen from a
list. There are three specification kinds and the catalog model handles only
the first:

| Kind | What the product supplies | What identifies the voice |
| --- | --- | --- |
| **selected** | an identifier from the engine's published set | the engine's identifier |
| **described** | prose naming age, accent, register, delivery — no audio at all | the description text |
| **cloned** | a sample of real speech, plus a transcript of that sample | the sample and its provenance |

Direction — a prompt steering tone, pace or emotion for one render — composes
with all three and identifies nothing; it is a per-utterance parameter, not a
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
until the engine answers; "choose a voice" is a list. A product that offers the
first against an engine supporting only the third has built a control that
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
