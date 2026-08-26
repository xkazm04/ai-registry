---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: sharded-translation-ci
status: forged
laws: [coverage-is-counted-not-claimed, clean-strings-stay-untouched, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [a translation ci job times out before publishing anything, sizing translation batches against a runner time limit, parallel language jobs overwrite each other on push, deciding what should trigger the machine-translation workflow, a full-catalog translation run restarts from zero every attempt]
---

# Sharded translation CI

A machine-translation pass over a real corpus does not fit in a CI job. The
measured shape: one language over a ~500-unit corpus runs ~27 hours on a CPU
runner against a hard 6-hour job limit. The naive per-language job therefore
times out **before publishing anything**, every time — all compute spent,
zero units delivered, and the next attempt starts from zero again. That is
the failure mode this technique exists to kill: an unsharded job does not
degrade gracefully, it loses everything, forever. The unit of progress must
be the **published shard**, not the attempted run — a fact this corpus's own
coverage law states directly:
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed),
and a run that publishes nothing counts as nothing regardless of hours burned.

## Size shards to the hard limit, with margin

Partition the corpus so that the **largest** shard finishes comfortably under
the runner's ceiling — not the average shard, the largest one, because the
limit is per job and one oversized shard reinstates the all-or-nothing loss
for its slice. The working ratio from the sighting: with ~27h for ~500 units,
a shard of ~85 units lands near ~4.5h against a 6h limit — roughly 75% of the
ceiling. Leave that kind of margin; per-unit cost is not uniform (long units,
model warm-up, retry churn), and a shard sized to 95% of the limit will cross
it on a bad day. When the corpus grows, re-derive the partition from measured
per-unit time rather than adding units to existing shards until one silently
crosses the line.

## Partition so write-slices are disjoint by construction

Shard on **(language × section of the corpus)**: one matrix job per pair.
This is not only a sizing move — it makes every job's write-set disjoint from
every other job's by construction. Each job owns exactly one language's one
section; no two concurrent jobs ever write the same file, so there is nothing
to merge at the content level. The only contention left is the narrow shared
tail: concurrent pushes to the same derived branch race on the ref, not on
the files. Handle that with a fetch-rebase-retry loop around the push — pull
the branch, replay the job's own commit, push, retry on rejection. Because
the slices are disjoint, the replay never conflicts; the loop resolves ref
races, not content races. If a partition scheme would let two jobs touch one
file, fix the partition — do not reach for locking or merge tooling to paper
over an overlapping write-set.

Disjoint slices also enforce
[clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
structurally: a job that can only write its own section cannot clobber
another section's reviewed output in a merge, because sparse per-slice pushes
replace full-catalog writes.

## Restore before work: resume from global published state

Each job's first act is to restore its language's prior output from the
derived branch — the published state, not a workspace cache and not the run's
own memory. Then it translates only what its section needs (new or changed
source units) and pushes only its own slice back. This makes every run
incremental against reality: a shard that published 40 of 85 units before a
transient failure resumes at unit 41 on the next run, because those 40 are on
the branch. Restore-before-work is what converts "the job must finish
everything" into "the job must publish what it finished," which is the whole
point of sharding. A job that skips the restore re-translates published units
— wasted compute at best, and at worst an unreviewed overwrite of a value a
later pass had already corrected.

## Trigger only on what feeds the pipeline

The workflow triggers on changes to exactly three things: the canonical
source content, the language registry, and the workflow definition itself.
Nothing else. Content classes deliberately outside the pipeline — a
source-language-only area that is never translated — are excluded from the
trigger paths, so edits there never burn translation compute. This is
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
read as a topology rule: translation is a pure function of the canonical
sources plus the registry, so only those inputs may wake it. A trigger
broader than the input set produces phantom runs that re-derive identical
output; a trigger narrower than the input set (forgetting the registry, or
the workflow file) leaves the derived branch silently stale after exactly the
changes most likely to need a rebuild.

## Failure modes

- **The unsharded job**: times out at the limit having published nothing;
  every retry repeats the total loss. Any shard whose projected time
  approaches the ceiling is this failure waiting.
- **Publish-at-the-end batching**: a job that translates its whole shard and
  pushes once at minute 350 is a miniature of the same defect — a late
  failure loses the shard. Push completed work in durable increments where
  the platform allows it.
- **Overlapping write-sets**: two jobs writing one path turns the retry loop
  into a real merge, and last-push-wins silently drops a slice.
- **Snapshot restore**: restoring from the run's trigger-time snapshot
  instead of the current derived branch reverts slices that sibling jobs
  published mid-run — the stale-snapshot re-run defect the coverage law warns
  about, at branch scale.
