---
layer: technique
type: technique
subject: multi-speaker-speech-production
technique: voice-asset-model-generation-binding
status: forged
laws: [unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [upgrading the speech engine under a cast of cloned or designed voices, storing a cast sheet that must survive engine changes, a stored voice resolves but sounds different, deciding whether a rebuilt clone needs a fresh consent record]
---

# Voice asset to model-generation binding

A cloned or designed voice is stored as an identifier and looks like a stable
asset. It is in fact **an artifact of one engine generation**: built by training
or conditioning against that generation's architecture, and valid on it. A
newer generation may refuse it, may accept it and render a different person, or
may accept it only after it has been rebuilt from its source audio. Vendor
documents state this in their own terms; for one current engine family the
facts, read from its documents at the time of writing, are that a professional
clone was not supported on the previous generation and that clones made before
the newest generation must be retrained to work well on it. Those are the
vendor's statements and are dated; the rule is general and the facts are
re-read on every upgrade.

## Boundary with authored voice identity

The authored-voice-identity technique in the voice-I/O subject owns **one
voice's specification**: whether it is selected, described, cloned or
materialized, what the durable record of it is, and why the timbre is volatile
while the specification is durable. This technique owns the **asset lifecycle
across engine generations** for a whole cast in a production: which generation
each voice was built for, what an upgrade does to it, and what must pass before
the production moves. The two compose: that technique says the source sample
and its provenance are the system of record; this one says that record is what
the rebuild on a new generation is made from.

## The cast sheet records the binding

For each voice in the cast, the production stores, beside the identifier:

- the engine generation it was built on and the date;
- the source, whether a description, a recorded sample or a design prompt, kept
  so the voice can be rebuilt without asking anyone again;
- the consent record for a cloned voice and what it covers (below);
- the last acceptance pass: which engine generation, which clips, which
  listeners, what was decided;
- the lines currently rendered with it, by address, so an upgrade knows its
  blast radius.

A voice whose record lacks the generation is unbound, and an upgrade treats
every unbound voice as unaccepted.

## An upgrade is a re-casting event

The engine identifier changing, or the vendor announcing a better generation, is
not the trigger to move. The rule: **the upgrade is gated on a per-voice
acceptance pass, never on the identifier having changed**, because the identifier
moves on the vendor's schedule and acceptance moves on evidence
([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)).

1. Read the vendor's current statement on voice compatibility for the new
   generation: what is supported, what must be retrained, what is unavailable.
2. For each voice, rebuild on the new generation from the stored source where
   required, under the same consent (below).
3. Render a fixed audition set for each voice on both generations: the same
   hard lines, the same anchor clip of the source. Put old and new side by side
   on a listening board
   ([listening-board](../../generated-speech-acceptance/techniques/listening-board.md))
   and grade with the acceptance subject's instruments, including speaker
   similarity within one embedding model.
4. Decide per voice: accept the new build, keep the voice on the old generation,
   or replace the voice. The cast may be split across generations only if the
   old generation stays available for the lines that need it, which makes
   mixed-generation scenes a review item, not a default.
5. Only after every voice has a verdict does the production's pinned engine
   move. Lines rendered on the old generation are stale under the key in the
   line-addressed technique; re-render them in order of scene, and review each
   scene once.

The cost is counted per accepted voice and per re-rendered line
([cost-per-usable-output](../../../_laws.md#cost-per-usable-output)): an upgrade
that improves the average and breaks two of eight voices is not an upgrade for a
cast of eight.

## Consent is a precondition of the rebuild

A cloned voice is a likeness of a person. Rebuilding it on a new generation is a
new use of that likeness: the consent record must exist for the source audio and
cover the rebuilt asset and the use being made of it, before the rebuild
runs. If the record cannot be found, the voice is not rebuilt, whatever the
engine permits. A similarity score measures resemblance and grants no permission.
Who may be cloned and for what is decided by people outside this technique; here
the consent record is only checked, and its absence blocks the step.

## Decision rules

- The vendor says existing voices work unchanged and the audition confirms it:
  record the confirmation, upgrade that voice, and still review the scene.
- The vendor says retrain required: schedule the rebuild and the acceptance pass
  as one unit of work; an unretrained voice never enters production on the new
  generation.
- The vendor's claim of improved speaker preservation on long texts is a claim
  to verify on the production's own voice and length, not a reason to skip
  the pass.
- A voice fails on the new generation and cannot be rebuilt: it stays on the old
  generation while that remains available, or it is re-cast with the
  scenes it appears in re-reviewed.

## When not to use it

A production using only catalog voices published by the engine, with no cloned
or designed voices, has no asset to bind, though catalog voices can also be
retired and the cast sheet should still note the engine generation. A one-off
render on one engine that will never be upgraded does not need the machinery.
