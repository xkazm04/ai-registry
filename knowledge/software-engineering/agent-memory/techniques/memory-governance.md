---
layer: technique
type: technique
subject: agent-memory
technique: memory-governance
status: forged
laws: [one-validation-door, deletion-is-not-repair]
shared_with: []
---

# Memory governance

Governance answers the question the other techniques defer: **who is allowed
to make this agent believe something, and by what process?** Every belief
shapes future behavior — that is what makes it a belief and not a log line —
so the write path to durable memory is a control surface, and it must be
tiered by blast radius, not uniform. A system where an inferred aside about
the weather and a rewrite of the agent's own operating rules travel the same
ungated path has decided that everything is low-stakes, which is just
deciding nothing is.

## Write lanes, tiered by stakes

Three lanes, distinguished by what a wrong write costs:

- **Auto-commit** — observations about the world and the work: facts,
  patterns, procedures distilled by consolidation. Wrong ones are corrected
  by supersedence and bounded by decay; the pipeline's own discipline
  (provenance, confidence, one door) is sufficient control. This lane must
  be the overwhelming majority of writes, or the review lanes drown.
- **Proposal-reviewed** — claims about the *human*: their preferences,
  intentions, working style, boundaries. The agent proposes; the item is
  visible to the operator, adoptable, editable, or rejectable; until
  adopted it recalls (if at all) explicitly marked as unconfirmed
  proposal. The reason is not that the agent infers badly — it is that a
  belief about a person, recalled as settled fact into every future
  interaction with that person, is a feedback loop: the agent acts on the
  belief, the action shapes the interaction, the interaction confirms the
  belief. The human breaks the loop at the door.
- **Human-gated, always** — the agent's self-model and standing rules: what
  it is, what it values, how it must behave. No inference, however
  well-grounded, commits here autonomously. An agent that can silently
  update its own identity from its own experience will drift — each step
  locally reasonable, the sum unauthorized — and persistence turns drift
  into character. These writes take effect only on explicit human approval,
  and the provenance row records the approval itself.

The lanes assign categories, and category assignment is itself governed: an
item cannot lane-shop by rephrasing ("the operator seems to want me to be
more autonomous" is a self-model proposal wearing preference clothes). When
lane assignment is ambiguous, the stricter lane wins.

## The fourth writer: automated observation

The three lanes above are about *inference* — what the agent concluded. A
mature system acquires a fourth writer that infers nothing: an automated
pipeline recording what it directly observed ("this scope regressed", "this
threshold was crossed", "this gap was closed"). Left unbuilt, these facts live
in operational logs and alerts and never reach the store the agent reads, so
the memory an organization accumulates is whatever someone remembered to type,
while everything the machinery already knew evaporates. Building it is right.
Building it *ungoverned* is how the silent second writer gets in through the
front door with a business case.

Four rules make the observation writer a lane rather than a leak:

- **Its provenance shape is fixed and uniform.** Every item it writes carries
  the same source stamp, the same kind, the same scope convention. The reader
  — human or agent — must always be able to tell a machine observation from a
  colleague's claim, at a glance, without knowing which pipeline wrote it.
  This stamp is the anti-poisoning control for the whole store: an automated
  feed is the highest-volume writer memory will ever have.
- **Its confidence is high, and honestly so.** These are observed facts, not
  inferences, and understating them to seem humble corrupts the value model
  in the other direction. The grade reflects the epistemics, not a posture.
- **It never fails its caller.** A memory write is decoration on an operation
  that already succeeded; a failed insert logs and returns nothing, and never
  propagates. A memory store that can break the pipeline feeding it will be
  removed from that pipeline.
- **It is idempotent, with a deduplication floor calibrated to its
  generator.** Pipelines re-run, requests retry, humans double-click. Because
  machine-written items come from a fixed template, a genuine repeat is
  near-identical text — so the floor must be set *very* high. A floor tuned
  for human prose will treat a second, genuinely different event on the same
  scope as a duplicate of the first, and silently discard exactly the event
  most worth recording. Scope the comparison window (recent items, same
  scope, same tenant) so the check's cost does not grow with the store.

## The door, and the enumerable writers

Governance is structural, not exhortative, per
[one-validation-door](../../_laws.md#one-validation-door): the lanes are
checkpoints inside the **single validation door** to the belief store, and
the writers passing through it are enumerable — the consolidation pass, the
adoption of a reviewed proposal, the human's direct edit. Any path that can
create a durable belief without classifying it into a lane is not an
efficiency; it is the vulnerability. The test is concrete: list every code
path that writes belief, and for each, name its lane. A list that cannot be
completed is the finding.

Reads deserve one governance note of their own: recall does not launder
status. A rejected proposal is not retried into recall under a softer
phrasing; an unconfirmed item recalls as unconfirmed or not at all.

## Corrections: the highest evidence grade

When the human corrects a belief — "that's wrong", "stop assuming X", "the
preference you inferred is not mine" — the correction is the most valuable
single input the memory system ever receives, and it is handled with
matching priority:

- It supersedes **immediately**, skipping batch cadence; a correction that
  waits for the next cycle is a correction the agent visibly ignores in
  the meantime.
- It is **remembered as an event**, not just applied as an edit: the
  correction becomes an episode, and the superseding belief's provenance
  marks it operator-issued — the grade that outranks any accumulation of
  inferred reinforcement, so no volume of future inference quietly undoes
  it.
- Its **reach is checked**: beliefs derived from or reinforced by the
  corrected item are re-judged, not left standing on refuted ground.

## Audit: the answer every belief owes

The governance invariant, stated as the question it must always answer:
**"who wrote you, from what, approved by whom?"** — resolvable for every
durable item, in bounded steps, terminating at real events. Provenance rows
give the "from what"; lane records give the "by what process"; approval
records give the "who signed". An agent whose beliefs can answer this is
inspectable and therefore correctable; one whose beliefs cannot is a black
box that happens to be polite.

Two audit disciplines complete the surface:

- **The review lanes are monitored for bypass pressure.** If proposals pile
  up unreviewed, the pressure to widen auto-commit grows quietly — and the
  correct response is to make review cheaper (better batching, clearer
  diffs against standing beliefs), never to reclassify categories downward
  because the queue is long.
- **Governance failures are repaired at the gate, not by purge.** When a
  bad belief is found to have slipped a lane, the fix is the lane check
  plus a supersedence for the item — not a bulk wipe of the category, per
  [deletion-is-not-repair](../../_laws.md#deletion-is-not-repair). The
  purge destroys the evidence of how the gate failed, along with every
  innocent belief that shared the category.
