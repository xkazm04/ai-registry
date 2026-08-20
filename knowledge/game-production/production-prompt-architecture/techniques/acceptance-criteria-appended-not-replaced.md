---
layer: technique
type: technique
subject: production-prompt-architecture
technique: acceptance-criteria-appended-not-replaced
status: forged
laws: [law-and-check-share-one-source, no-gate-self-certifies, a-budget-shapes-the-output]
shared_with: []
use_when: [a producer is graded against criteria it was never shown, composing per-step criteria on top of a pipeline baseline, criteria seeded upstream keep disappearing from prompts]
---

# Acceptance criteria appended, not replaced

The prompt closes with the criteria the output will be graded against, read from the source
the grader reads, and composed **additively**: a task-specific criterion is added to the
standing baseline and never overwrites it.

## The two failures this prevents

**The unseen bar.** Criteria are authored, stored, and read by exactly one consumer — the
checker. Every production prompt then asks a producer to author an artifact without telling
it the contract the artifact will be graded against. The pipeline is not measuring
capability at that point; it is measuring whether the producer guessed a standard that
existed in written form the whole time. Closing this gap is
[`law and check share one source`](../../_laws.md#law-and-check-share-one-source) read at
authoring time: the rule an artifact will be graded against is visible to whatever authors
it.

**The silent overwrite.** A shared assembler seeds each step with the pipeline's standing
criteria; a later phase adds its own and, because the natural operation is *set*, replaces
them. Nothing errors. The prompt still has an acceptance section, it is still well-formed,
and the baseline is simply gone — from that step, from that run, and from anyone's
attention. Once a step can supply criteria wholesale, a step can opt out of the baseline,
and a baseline that any step can opt out of is not one.

## The procedure

1. **One source.** Criteria live where the grader reads them. The prompt path *reads* that
   source; it never holds its own copy and never edits it.
2. **Two operations, and the default is append.** Provide a set operation for the caller
   that is defining the section from nothing, and an append operation for every caller that
   is adding to it. Make append the one that is easy to reach. If only one can exist, it is
   append.
3. **Compose in item form, not in rendered form.** Keep criteria as a list of items until the
   moment of rendering. An append implemented by parsing the already-rendered section back
   into items works, and it is fragile in exactly the way that costs a baseline later.
4. **Address the criteria to the producer.** A criterion phrased as a note to a reviewer is
   decoration. Phrased as a statement the producer can check its own draft against before it
   stops writing, it changes the output.
5. **State the rejection rules with the criteria.** What the checker refuses — placeholder
   text, a claim under a minimum substance threshold, a verification line that names no level
   of evidence — is stated once in the prompt so the producer can meet it rather than
   discover it. Rejection rules are the most actionable part of a bar.
6. **Cap the block and elide honestly.** Drop whole criteria rather than truncating one, and
   state how many were dropped. Assert the cap in a test against the live criteria corpus, so
   a newly authored criterion cannot quietly inflate every prompt in the system —
   [`a budget shapes the output`](../../_laws.md#a-budget-shapes-the-output) applies to the
   prompt as much as to the artifact.

## The injection path is non-authoritative

The code that renders criteria into a prompt reads and formats. It does not re-derive a
contract, does not re-validate one, and cannot cause any verdict to move. This is a hard
boundary and worth enforcing in review: the moment assembly can influence grading, the
producer's side of the pipeline is participating in its own certification, which is
[`no gate self-certifies`](../../_laws.md#no-gate-self-certifies) with the roles disguised.
The practical test — change the assembler arbitrarily and re-run the grader on stored
outputs; every verdict must be identical.

## Decision rules

- **When a step needs a stricter bar, append the stricter criterion.** The baseline stays;
  the step is now graded against both.
- **When a step genuinely cannot meet a baseline criterion**, that is a conversation about
  the baseline, recorded as an explicit exemption with a reason — never a quiet replacement
  in one step's prompt.
- **When criteria and the grader disagree**, the grader is not wrong by default: find which
  source the prompt read. A drift here means the single-source rule was broken somewhere.

## When not to use this

- **When there is no grader.** Criteria the producer will never be measured against are
  aspiration, and aspiration in the closing section dilutes the criteria that are real.
- **Free exploration**, where the point is to see what comes back. Grading criteria bias the
  output toward the bar, which is the whole purpose and exactly what exploration does not
  want.
- **When the criteria are longer than the task.** That is not an argument for replacing them
  — it is a signal that the baseline has accumulated items that belong in a domain
  constraints section instead.
