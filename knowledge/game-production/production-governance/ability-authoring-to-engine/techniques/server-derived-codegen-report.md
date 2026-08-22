---
layer: technique
type: technique
subject: ability-authoring-to-engine
technique: server-derived-codegen-report
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, compiling-is-not-wiring]
shared_with: []
use_when: [recording what a code generator actually produced, deciding whether a generated artifact counts as done, storing provenance for generated source]
---

# Server-derived codegen report

## The concern

A generation run ends and something must be written down about what happened. The cheap
version writes down what the generator said. The generator is a fluent, motivated party
reporting on its own work; asked whether the build succeeded it will answer plausibly,
promptly, and — in the cases that matter — from inference rather than observation. A run
that dispatched a code-generation task and recorded "generated successfully" has recorded
an intention, and intentions accumulate into a catalogue where everything is complete and
nothing is in the engine.

The report is the only artifact that makes a completion claim checkable later. It has to be
derived by whoever observed the real state, and it has to distinguish the rungs of evidence
rather than collapsing them into one word.

## The procedure

**1. Name the rungs the run can reach, in order.** For code generation into a live project
the ladder is roughly: files were written · the module compiled · the registration or seed
step ran · the artifact appears in the destination the runtime reads · nothing it references
is missing. Each rung is a separate field with a separate answer. "Done" is not a rung; it
is a summary someone will want to compute later, and they can only compute it if the rungs
were stored.

**2. Derive each field from observation, on the receiving side.** File list from the file
system or the diff, not from the narration. Build status from the build's own exit. The
registration count from the destination record. Where the generator's own claim is
recorded at all, store it as a separate, labelled, self-reported field beside the observed
one — the two disagreeing is a finding, and often the most useful signal the pipeline
produces.

**3. Keep *not reported* distinct from *zero*.** A count that was never returned and a
count that was returned as none are different epistemic states. Collapsing them to zero
turns a missing measurement into a measured failure — or, when the default is the other
way, into a measured success. Give the field a null and render it as unmeasured.

**4. Require a reason on failure.** A failed status with no reason is unactionable and, in
practice, gets retried blindly until it succeeds by accident or gets ignored. The reason is
part of the report's schema, not an optional courtesy.

**5. Carry the referenced-but-missing list in the report.** The run knows which names it
referenced and could not resolve. That list is the cheapest possible early warning about
the vocabulary, and it belongs in the record of the run that produced it rather than being
rediscovered by a later audit.

**6. Store provenance next to the output: the resolved prompt, in full.** Not a template
name, not a version. Two reasons, and the second is load-bearing. Without the exact prompt
a later reviewer cannot separate a model failure from a briefing failure, and those have
opposite fixes. And prompts drift continuously while artifacts persist, so a version
identifier resolves to a document that no longer exists — provenance that points at a
mutable thing is not provenance. Store the generated source alongside it too, even if that
source is not what ships, so the record is a complete account of the run.

**7. Bind the report to what it judged, and timestamp it.** The report speaks for the
artifact as it was at that moment. When the artifact changes, the report becomes evidence
about the past; keep it, mark it stale, and never let "verified before the last edit" read
as "verified".

**8. Seed starter artifacts with their unknowns marked as unknown.** Where the pipeline
creates a scaffold before anyone authors into it, the scaffold's empty slots are labelled
as unfilled rather than populated with plausible defaults. A default that looks like an
authored value gets shipped as one, and no report can tell the difference afterwards.

## Decision rules

- **When the producer reports a status, that status is an input, never the verdict.**
- **When a rung was not observed, the report says so.** Absence renders as unmeasured, never
  as pass, and never as a neutral number standing in for one.
- **When two of the report's fields imply different verdicts, keep both and surface the
  disagreement.** Reconciling them at write time destroys the only evidence that something
  is wrong.
- **When a run writes files but the build fails, the status is failed.** Partial progress is
  described in the fields, not laundered into the status.
- **When the report is used to drive a dashboard, gate on the observed fields only.** A
  panel that mixes self-reported and verified numbers into one figure is a panel that lies
  in exactly the situation it exists for.
- **When the prompt cannot be stored, do not claim provenance.** Record the run as
  unprovenanced; an unverifiable pass must not elevate anything.

## When not to use it

- **When nothing external changed.** For a pure transformation with no side effects,
  validating the output *is* the observation and a separate report is bookkeeping.
- **When the observer is the producer.** If the only thing that could report on the build is
  the process that ran it, you do not have an independent authority — you have a nicer
  format for a self-claim. Say so in the record rather than styling it as verified.
- **When the ladder is a single rung.** Where writing the file is genuinely the whole job, a
  multi-field report invents distinctions and trains people to skim reports.
