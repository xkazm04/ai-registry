---
layer: technique
type: technique
subject: prompt-fitness-and-evolution
technique: stamp-prompt-version-into-provenance
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
shared_with: []
use_when: [wiring a generation step so its output can be attributed later, designing artifact provenance, preparing to run a prompt comparison]
---

# Stamp prompt version into provenance

## The concern

Every artifact a production prompt authors must carry, as metadata, the identity of the
prompt configuration that produced it — written at generation time, by the code that made
the call. This is the enabling technique for the whole subject: without it, fitness is
inferred; with it, fitness is joined.

And it carries a warning of equal weight: the stamp must travel *beside* the artifact and be
excluded from anything that grades or fingerprints the artifact's content.

## What the version identifies

Not the prompt file. The **assembled configuration** that produced the call: the template
identity and its revision, the mutation lineage it belongs to, the model and its generation
settings, and the identity of any retrieval or context-assembly configuration that fed it.
Two artifacts stamped with the same version must have been produced under the same
conditions — otherwise the join in the next technique joins noise.

Give it one owner. The version string is minted in one place, at the point the configuration
is assembled, and every consumer reads it from the artifact rather than recomputing it. A
version derived independently by a reporting layer will disagree with the generator's, and
the disagreement surfaces only when it is load-bearing.

## Procedure

1. **Mint the identity where the configuration is assembled**, before the call, and pass it
   through to the write.
2. **Write it into a provenance envelope**, not into the content body. The envelope holds
   the version, the parent version, the mutation strategy, the timestamp, the trial or arm
   label if the artifact is part of a comparison, and the run identity.
3. **Make the envelope structurally separate.** A distinct field, a distinct record, or a
   distinct table — anything that a serialiser can omit as a unit. Interleaving provenance
   with content fields guarantees that some future serialiser takes both.
4. **Declare the graded projection.** State, in one place, which fields constitute the
   shipped content. Grading, content fingerprinting and any diff of "what changed in the
   artifact" read that projection. Everything else is excluded by construction. The
   projection is a *declared set*, not a subtraction: too wide and the critic grades your
   provenance, too narrow and it condemns content for context you withheld.
5. **On replay, pass the version the artifact was really produced under.** A regeneration,
   drain or backfill path that defaults to "the version currently in effect" re-labels
   historical output as the present version and destroys the very comparison the stamp
   exists for. Default to current only on a live first generation; every other path states
   the version explicitly.
6. **Merge into the envelope, never overwrite it.** A later stage adding a field must
   preserve what the producer already stamped. The stamp is append-and-merge; the producer's
   claim about its own output is the authoritative one.
7. **Backfill honestly or not at all.** Artifacts produced before stamping existed have an
   unknown version. Mark them `unknown` and exclude them from fitness. Never guess a version
   from a timestamp and never default to the current one.

## Decision rules

- **When the prompt text itself is retained for debuggability, retain it in the envelope and
  never in the body.** Retaining it is worth doing; the entire cost of doing it wrong lands
  on this subject, because a rubric that penalises leaked instruction text will score the
  provenance rather than the artifact, and it will do so as a function of prompt length.
- **When a content fingerprint is computed for verdict binding, compute it over the declared
  projection only.** Otherwise a provenance-only change invalidates every verdict on
  unchanged content, and the quality layer starts churning.
- **When the version cannot be established for an artifact, it is `unknown`, never absent
  and never inherited.** An artifact with no stamp is outside every fitness population; that
  is a visible gap and a survivable one.
- **When any part of the assembled configuration changes, the version changes** — including
  model settings. A prompt evaluated under two model configurations is two units.

## Verifying the stamp is inert

Do not assume the exclusion holds; prove it. Two cheap checks, run as part of the pipeline's
own gate:

- **Substring check.** Assert that no fragment of the assembled instruction text appears in
  the graded projection of any artifact in a sample. This catches the leak directly.
- **Length correlation.** Correlate assembled prompt length against mean score within a
  single prompt version, where no correlation should exist. A significant one is the
  signature of provenance contaminating the grade.

Run both when the projection changes, not once at build time. A leak introduced by a
serialiser refactor is exactly the kind of change nobody reviews as a measurement change.

## When NOT to use it

- **Throwaway exploration** in a scratch environment that never writes to the artifact store
  needs no stamp — but the moment an output can be picked up and shipped, it needs one.
- **Do not stamp a version onto an artifact a human then rewrote.** A human-edited artifact
  is no longer evidence about the prompt; mark the edit in provenance and drop the artifact
  from fitness rather than crediting the prompt with the human's work.
