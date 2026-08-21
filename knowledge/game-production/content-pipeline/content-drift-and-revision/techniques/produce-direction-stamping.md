---
layer: technique
type: technique
subject: content-drift-and-revision
technique: produce-direction-stamping
status: forged
laws: [a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [an operator steers a generation with free text, a regeneration must not lose the last instruction, investigating why regenerated content changed]
---

# Produce-direction stamping

Store the free-text direction that steered a generation **on the artifact it produced**,
not only in the request that triggered the job. A regeneration then re-applies the
direction by default instead of silently reverting to the unsteered output the operator
was steering away from.

## The concern

The steer — "darker, and make the second phase a chase", "fewer enemies, more verticality"
— is the highest-value input in the loop and the least durable. It is not in the
specification, not in the template, and not in the rubric. It exists for the duration of
one request. If it is not persisted with the output, then the next regeneration for any
reason at all — a template fix, a bulk refresh, a restore — produces content that ignores
every correction the operator ever made. The operator's experience is that the line does
not listen, and the observable symptom is content drift with no explanation available.

Stamping also pays during investigation. When drift detection flags an artifact whose
content moved, the first question is what direction produced the new content. If that
answer lives only in a job log, it is usually already rotated away.

## The procedure

1. **Capture the direction verbatim** as the operator typed it. Do not summarize it, do
   not normalize it into structured fields, do not fold it into the assembled prompt and
   discard the original. The original is the record; the assembled prompt is derived.
2. **Persist it on the artifact record** under a single namespaced key, so it can never
   collide with a field the artifact's own schema owns, and so the addition is purely
   additive — a checker, grader or consumer that never reads the key is unaffected by its
   arrival.
3. **Record the derived instruction alongside the raw one, and leave it empty when there
   was none.** A deterministic production that no instruction drove has an empty derived
   field; fabricating a plausible one there is inventing provenance. Likewise a placeholder
   artifact seeded before anything ran carries a stamp that *says so*, with a frozen
   timestamp — a placeholder that looks freshly produced is worse than an empty step.
4. **Read it back on regeneration** and re-apply it unless the operator explicitly
   clears or replaces it. Default-carry, explicit-clear — the inverse default loses
   corrections by omission.
5. **Show it wherever the artifact is shown.** A steer the operator cannot see is one
   they cannot correct, and they will re-type a contradictory one.
6. **Snapshot it with the revision**, so restoring an older version restores the
   direction that produced it. A restored artifact under a newer, unrelated steer is a
   combination that never existed.

## The stamp makes a pipeline log possible

Once every artifact carries its direction and its outcome, a chronological log across a
whole entity's pipeline is a pure projection of what is already stored — no new truth, no
new writes, no ability to move a status. This is the second, larger payoff: without it, a
failure on a step nobody re-opens is invisible, and "what did we ask this pipeline for?"
has no answer short of opening every step.

Two rules make the projection honest. A failure needs **its own timestamp**, because a
failed production deliberately preserves the last successful one's timestamp — the content
survived — so sorting by that stamp would date the failure to when it last worked. And a
step with neither a production nor a recorded failure is **omitted**, not listed as
pending; listing it turns the log into a duplicate of the pipeline definition and buries
the events.

## The stamp is bookkeeping, not content

The direction is state *about* the artifact, so it is excluded from the content
fingerprint. Getting this backwards inverts the whole drift signal in both directions:
editing a steer without regenerating would report as a content change, and a real
regeneration under the same steer would be reported cleanly only by accident. Only what a
reader would judge is content — which is
[a verdict is bound to its content](../../../_laws.md#a-verdict-is-bound-to-its-content)
applied at the projection boundary: the grader read the output, not the instruction.

The corollary is that a steer edit must be *visible* by some other means. Record it in
the produce log with a timestamp, so "the content did not change but the direction did"
is answerable without being reported as drift.

## Decision rules

- **When the direction is empty, store absence, not an empty string.** "No steer given"
  and "steer cleared to nothing" are the same outcome but a defaulted empty string
  becomes indistinguishable from a lost one during investigation.
- **When a bulk regeneration runs across many artifacts, each one carries its own
  stamp.** A batch-level steer applied to every artifact overwrites individual
  corrections — the most expensive form of this failure, because it destroys many
  operators' work in one action.
- **When the direction contradicts the specification, the direction wins for this
  artifact and the contradiction is surfaced.** A steer that permanently fights the
  specification is a signal the specification is wrong; silently obeying it forever hides
  that.
- **When the steer is long enough to be a specification, promote it.** A multi-paragraph
  standing direction repeated on every regeneration belongs in the authored
  specification, where it is reviewable, not in a per-artifact free-text field.
- **When an artifact is copied to a new entity, decide explicitly** whether the steer
  travels. Defaulting either way silently is how a correction meant for one case
  propagates across a project.

## When not to use this

- **When the generation takes no free-text direction** — a fully specification-driven
  step with no operator channel — there is nothing to stamp, and adding an unused field
  invites someone to write bookkeeping into it.
- **When the direction contains material that must not be retained** — pasted
  confidential context, personal data — do not persist it verbatim. Persist a reference
  and hold the text under the retention policy that governs it.
- **When the steering channel is structured** — sliders, tags, enumerated intents — store
  the structure, not a rendered sentence. Free-text stamping is the fallback for
  unstructured intent, not a preference over an authored control.
