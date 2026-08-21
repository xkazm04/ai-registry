---
layer: technique
type: technique
subject: content-drift-and-revision
technique: orphaned-artifact-visibility
status: forged
laws: [unmeasured-is-not-a-pass, refuse-rather-than-destroy]
shared_with: []
use_when: [an entity or step is deleted or renamed, storage grows faster than the visible corpus, coverage numbers look better than the work performed]
---

# Orphaned-artifact visibility

An artifact keyed to an entity or a step that no longer exists is invisible to every
normal query, because every normal query starts from a live identity and walks down to
its artifacts. It is therefore never listed, never cleaned up, never restored, and never
counted. Surface it deliberately with a query that runs in the opposite direction.

## How orphans are made

Three routine operations produce them, none of which look destructive:

- **An entity is deleted.** Its artifacts remain under the old key.
- **A step is removed from a pipeline, or renamed.** Every artifact produced under the
  old step identity is stranded across the whole corpus at once — the highest-volume
  case, and the one most likely to go unnoticed because no single entity looks wrong.
- **A collection is forked or re-scoped**, and artifacts stay behind under the previous
  scope.

The result is not merely wasted storage. Orphans carry verdicts, revisions and produce
logs, so the store contains accepted content that no dashboard can reach; and coverage
arithmetic computed over live identities silently drops them, which flatters the
denominator. That is the mirror of
[unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass): work that exists but
is uncounted distorts the measure in the comfortable direction.

## The procedure

1. **Enumerate from the artifact side.** Scan stored artifacts and project their compound
   identity — collection, entity, step. Every other query in the system starts from live
   identities; this one must not, or it reproduces the blindness it is diagnosing.
2. **Join back to living identities** and to the declared step list of each collection's
   pipeline.
3. **Classify the misses by kind**, because the remedies differ: dead entity, unknown
   step, and dead collection are three different situations. A renamed step is usually
   remappable; a deleted entity usually is not.
4. **Report as a named category** in the same surface that reports coverage, with counts
   and storage size. An orphan on a list is a decision waiting to be made; an orphan not
   on a list is a lie in a number.
5. **Offer two explicit actions**: re-key to a living identity, or delete with a
   snapshot. Both are operator-initiated, and neither runs at boot — an operator may be
   mid-investigation with the very rows on screen.
6. **Delete across every table the identity writes to, and report real counts per table.**
   A produced step is rarely one row: the live record, its archived revisions, its current
   verdicts, and its bounded verdict log are all keyed by the same triple. Deleting only
   the first leaves standing condemnations and a whole revision archive behind, addressed
   to an identity nothing can reach. List the tables in one place so a count and its
   delete can never disagree about scope, and report the rows that *actually* went — not
   the number of rows the operation attempted, which cannot be wrong in any observable way
   because it never looked.

## Do not cascade

The reflexive fix — delete an entity's artifacts along with the entity — converts a
recoverable mistake into an unrecoverable one, and it makes a mistaken deletion destroy
weeks of accepted, reviewed content along with a row somebody clicked wrong. Keeping the
artifacts and reporting them is the
[refuse rather than destroy](../../../_laws.md#refuse-rather-than-destroy) branch: nothing is
lost, the cost is visible, and a person decides. The same logic forbids an automatic
sweeper that deletes orphans older than some age — age is not evidence of worthlessness,
and an automatic sweeper is a cascade with a delay.

## Decision rules

- **When a step is renamed, offer re-keying before anything else.** The content is
  intact and correct; only its address moved. A rename that strands a corpus and then
  regenerates it is the most wasteful possible outcome.
- **When an entity is deleted, keep its artifacts and mark them orphaned.** If deletion
  must reclaim storage, that is a separate, explicit, snapshotted operation.
- **When the orphan count grows steadily, the defect is upstream** — in the delete or
  rename path — and it should be fixed there. A growing orphan list is a symptom
  report, not a chore queue.
- **When an orphan cannot be attributed to any known identity at all**, keep it under an
  explicit unknown bucket rather than dropping it from the report. An unclassifiable
  record that disappears from the report is the original failure repeating one level up.
- **When a projection lists an artifact whose step the pipeline no longer declares, keep
  it in the list** with a sentinel position, and withhold only the actions that need a
  living position — navigation, re-run. An orphaned entry is information, not noise, and
  dropping it from a log is how the artifact stops existing for everyone.
- **When computing coverage, state the orphan count alongside it.** Not folded in — a
  percentage that quietly absorbs orphans is unreadable either way.

## Failure signatures

- Storage consumption grows while the visible corpus does not.
- A pipeline rename is followed by a large regeneration bill and no complaints, because
  the old artifacts silently ceased to exist as far as anyone could see.
- Coverage improves immediately after a bulk delete: the denominator lost rows the
  numerator never had.
- Restore requests that find nothing, for content everyone remembers reviewing.

## When not to use this

- **When identities are immutable and never deleted**, orphans cannot form, and the
  reverse query is cost with no yield. Verify the claim rather than assuming it — soft
  deletes and pipeline edits both break it quietly.
- **When the store enforces referential integrity with cascades** already accepted as
  policy, this technique is not a bolt-on; the argument to have is whether the cascade
  itself is right, and that argument belongs to whoever owns the retention policy.
- **When artifacts are ephemeral by design** — caches, derived renderings that are
  regenerated on read — an orphan is simply garbage and a lifecycle expiry is the correct
  and cheaper mechanism. This technique is for artifacts that are expensive to lose.
