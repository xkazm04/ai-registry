---
layer: technique
type: technique
subject: generative-artifact-gating
technique: generation-history-as-artifact
status: forged
laws: [a-verdict-is-bound-to-its-content, law-and-check-share-one-source, one-authority-per-quantity]
use_when: [designing what a generative step persists, a gate cannot prove a generator ever ran, producing and grading halves of a step are drifting]
---

# Generation history as artifact

## The concern

The intuitive model is that generation is a transient act and the artifact is its winner:
one field holds the chosen asset, the losing candidates are noise, and the attempts are a
log line somewhere. Under that model no gate downstream can ever prove that a generator
ran, because the only surviving evidence — a populated field — is exactly what a stand-in
also produces. **The candidate set, each candidate's origin, and the record of which one
was kept are part of the artifact.** Not scaffolding, not telemetry, not a debug aid.

## What the history must carry

Per candidate, the minimum that makes a gate possible:

- **Identity** — a stable handle a verdict can name and a human can fetch.
- **Origin** — generated, or deterministic stand-in. Recorded at creation by the producer;
  never inferred later from shape, size or name.
- **Position** — the candidate's own idea of where it sits in the kept set, so a selection
  pointing at it can be cross-checked against it.
- **Kept or discarded** — discarding is an event, not a deletion. A selection that points
  at a discarded entry must be detectable as broken rather than silently absent.

Per step, alongside the candidates: which candidate is selected, and by what provenance.
The provenance vocabulary is its own technique; what belongs here is that the field lives
in the history, not beside it, so it cannot be lost when the history is rewritten.

## The single-source rule

The half of the system that **produces** the artifact and the half that **grades** it must
read one definition of its shape. This is the rule teams skip and it is the one that
decays gates into existence checks: the grader was written against a field the producer
later renamed, the read silently yields nothing, the grader's fallback path treats nothing
as neutral, and the step goes green forever. Nobody sees it, because a gate that has
stopped checking looks exactly like a gate that keeps passing.

The remedy is structural, not procedural. Put the producing shape and the grading shape in
one place, so the grader reads the producer's definition rather than a copy of it, and so
a change to the shape is a change to both halves in the same edit. A verdict is only
honest if it can rely on the structure of what produced the thing it judges — which is a
statement about where the code lives, not about how careful anyone is.

## What the history buys you later

- **Re-judgment.** A new rubric can be run over old artifacts, because the objects it needs
  still exist. Without history, improving a rubric only affects work not yet done.
- **Attempt counts.** How many generations a slot needed before one was kept is the only
  honest input to whether prompts, references or models are improving. It cannot be
  reconstructed after the fact.
- **Audit of origin.** "Which shipped slots were never touched by a generator" is a query,
  not an investigation.
- **Rejection economics.** Deciding whether to regenerate or repair needs to know what the
  rejected candidates looked like. That decision is owned elsewhere, but it is fed from
  here.

## Retention

History is not free, and unbounded retention is not the rule — a re-roll-heavy slot will
grow its stored prompts and candidate records until it hits whatever quota is holding it.
Three rules keep it bounded without losing the evidence:

- **Cap the kept batches** at a number that is a generous browsing window rather than an
  archive. Around a dozen is the working figure: enough that a reviewer can look back
  across a session's re-rolls, small enough that the artifact stays cheap to store and to
  ship around.
- **Exempt the batch that owns the current selection from pruning.** Without this
  exemption the cap eventually evicts the batch containing the selected candidate, the
  selection stops resolving, and the gate reports corruption where the only fault was
  retention policy. This is the single most common way a well-intentioned cap manufactures
  failures.
- **Compact rather than delete.** After acceptance, keep the selected candidate plus the
  **counts and origins** of the discarded ones. The counts are what the metrics need; the
  payloads are what the disk cannot afford. Never compact away the origin field — it is
  the one value the gate cannot reconstruct, and losing it converts every historical
  artifact into "unrecorded" forever.

## When not to use it

- **Single-output steps with no candidate set.** Keep the origin and the identity; there is
  no set to retain and inventing one adds a structure nobody reads.
- **Where the generator's own store is authoritative.** If candidates already live in a
  durable external store with stable handles, hold the handles and the origins rather than
  copying the payloads — two copies of the same set is two authorities for one quantity,
  and they will disagree.
- **As a substitute for a verdict record.** History says what was produced. It does not say
  what was judged, at which rung, against what fingerprint. Those are separate records and
  the verdict one is not optional.
