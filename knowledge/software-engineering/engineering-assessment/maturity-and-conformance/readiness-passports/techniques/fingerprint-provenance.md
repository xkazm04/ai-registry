---
layer: technique
type: technique
subject: readiness-passports
technique: fingerprint-provenance
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [designing the header of a portable assessment artifact, an old stored fingerprint must still be readable, deciding when a fingerprint is too old to quote]
---

# Fingerprint provenance

A fingerprint with no stamp is a rumour. The stamp is the part of the artifact
that lets a reader who was not present decide how much of it to believe, and it
must live **inside** the artifact — not in the row beside it, not in the page
that rendered it — because the artifact is what gets copied into a message,
pasted into a planning document, and read six months later with all of its
context stripped away.

Three facts, and each fails in a characteristic way when omitted.

## 1. What was assessed: bind to an immutable identifier

The fingerprint names the exact state it observed, by an identifier that cannot
later mean something else: a content-addressed revision, not a branch name, not
a tag, not "current"
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

The failure this prevents is not exotic. A fingerprint bound to a moving name
describes a target that has already moved by the time anyone reads it, and it
can never be matched back to what it actually saw — so a disagreement between
the fingerprint and reality is unresolvable, and the only available response is
to distrust the whole artifact. Bound to an immutable identifier, the same
disagreement is diagnosable in one step: is this the state I am looking at, or
a different one?

The same discipline governs a **portfolio** of fingerprints: two artifacts are
comparable when each is bound to a specific observed state, and merely adjacent
when they are not.

## 2. By what instrument: version everything that shaped the verdict

Record the assessor version, each axis's ladder version, and the artifact's own
schema version. These are three different things and they change on three
different schedules.

- **Assessor version** — the code that gathered evidence. A change here means
  the same project could yield a different fingerprint with no change to the
  project.
- **Ladder versions** — the criteria that turned evidence into rungs. A stored
  rung is uninterpretable without the version of the ladder that produced it,
  because a criteria edit re-meanings every historical value.
- **Schema version** — the artifact's own shape, which determines whether an
  older stored fingerprint can be read at all.

Fold the versions into any cache key over derived results, so a bump
invalidates everything derived under the old instrument atomically rather than
leaving a fleet of half-old values that nothing distinguishes.

## 3. When, and how completely

The timestamp and the coverage caveats. Every artifact of this class begins
decaying the instant it is issued: the project keeps changing, the assessment
does not. This is the best-documented lesson from every neighbouring discipline
that ships portable per-artifact records — the record is useful at the moment of
issue and rapidly less so afterwards unless someone regenerates it on a defined
cadence, and the consuming side is at least as likely to forget as the issuing
side.

So the artifact carries its own age and, ideally, its own expiry pressure:

- **Regenerate on the event, not on a calendar.** The natural cadence is "on
  every meaningful change to the subject", which keeps the fingerprint bound to
  a state that still exists. A calendar cadence is a fallback for subjects that
  cannot signal change.
- **Render the age, always.** Not the timestamp alone — the elapsed time, in
  the same glance as the verdict. Readers do not subtract dates.
- **Define stale, and say what stale means for each consumer.** A stale
  fingerprint may still be shown; it may not be counted in a rollup denominator
  without disclosure, and it should not gate anything.
- **Stale is not bad.** A stale fingerprint reports as *unknown, last seen at
  rung 3*, never as a low rung
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **Name the drift set.** The strongest available definition of stale is not
  "older than N days" but "one of the inputs I was synthesized from has
  changed". Record the set of inputs the assessment actually read; when any of
  them changes, the fingerprint is stale by construction and a re-issue is
  owed. Age is the fallback for subjects whose inputs cannot be watched, and
  the two can coexist: whichever fires first wins.

Coverage caveats belong in the same header: what the assessment could not see,
and why. A fingerprint that inspected two of its subject's five evidence
sources and does not say so presents a partial view as a complete one, and its
axes are capped rather than confident.

## The projection must be reproducible

Because the fingerprint is a pure projection of a stored assessment, it can be
regenerated at any time and compared to what is stored. Do that: recompute into
a buffer, diff against the persisted artifact, and report a difference as drift
with a name ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

This is the cheapest integrity check in the whole subject and it catches the
two defects that otherwise stay invisible for months: a hand-edited fingerprint,
and a projection that quietly acquired a non-deterministic input — an ambient
clock, an unordered map iteration, a value read from the environment rather than
from the assessment. Order every collection deterministically before
serialising, or the drift check will fire on noise and be turned off.

The reproducibility rule also settles a recurring design argument: nothing may
enter the fingerprint that the assessment does not contain. "While we are
projecting, we could just check one more thing" makes the artifact
irreproducible, gives a summarisation step an error path, and creates the
possibility that the compact artifact and the full report disagree with no
arbiter between them.

## Migrate stored fingerprints on read

Fingerprints persist — in a portfolio store, in an attachment, in someone's
directory. The schema will change. Migrate **when the artifact is read**, not
by rewriting the store.

The read path is: inspect the stored schema version; if it is older, apply the
ordered chain of forward transforms; if it is newer than this reader
understands, refuse to interpret and say so; if it is unrecognised, the result
is `unknown` — never the bottom of the scale. Rewriting the stored artifact
would destroy the record of what was actually issued, which is the one thing a
provenance-bearing artifact exists to preserve.

Four rules keep migration from becoming quiet fabrication:

1. **A migration may reshape, never invent.** A field added in a later schema
   is absent in a migrated old artifact, and absent is a valid rendered state.
   Filling it with a default manufactures an observation nobody made — and the
   default that gets chosen is almost always `false`, which is the worst
   possible answer because it is indistinguishable from a real negative
   finding. A detector that did not exist when the artifact was written reads
   as **unknown**, and the derived next action names the re-assessment, not the
   missing thing.
2. **A migrated value is tagged as a floor, not a measurement.** When an older
   field's type widens — a boolean becoming an ordinal, say — the honest lift
   is to the *lowest rung the old value could possibly have supported*, and the
   artifact carries a marker saying it was lifted, plus a caveat saying from
   what. A boolean `true` only ever proved presence, so it lifts to the
   presence rung and no further. Without the marker, a reader cannot tell a
   lifted floor from an assessed rung, and every trend line built over the
   migration boundary splices two different kinds of claim.
3. **Lossy directions are declared.** Where an old value has no honest
   equivalent under the new schema, the migrated result is *unmappable*, with
   the original value preserved beside it.
4. **Migration is versioned and tested with fixtures** — a stored artifact of
   each historical version, with its hand-verified migrated form, run as a
   gate. Without fixtures the migration chain is the least-exercised and
   most-trusted code in the system.

## What this is not

This is provenance of an **assessment**, not of a build output. Signing what a
pipeline produced so a downstream consumer can cryptographically verify it is a
different discipline with a different threat model, and it belongs to the
`signed-artifacts` subject.

That said, one lesson transfers intact and is worth stating here because it is
the foundation of this whole subject: **an artifact that describes a subject is
worthless when the subject generated it.** A build that writes its own
provenance proves nothing, since a compromised build writes the identical
document. The same holds for readiness: the stamp must identify an issuer
distinct from the subject, or the fingerprint carries the authority-shape of an
assessment with none of its substance.

## When not to use this

- **An ephemeral, in-session verdict** that is never stored, quoted or
  compared. Then the provenance header is overhead on an artifact with no
  future.
- **A single-consumer pipeline** where the fingerprint is produced and consumed
  in the same run by the same code. Bind it to the revision anyway — that costs
  nothing — but the migration chain is speculative until the artifact is
  persisted somewhere a second reader can find it.
