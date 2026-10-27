---
layer: technique
type: technique
subject: claimed-improvement-remeasurement
technique: queued-runs-as-head-sample
status: forged
laws: [count-carries-predicate, record-precedes-effect]
shared_with: []
use_when: [a claimed gain sits waiting because the head has too few runs, triggering extra pipeline runs to measure a change, mixing triggered and organic runs in one sample]
---

# Queued runs as the head sample

The sample floor is cheap to state and slow to meet. A change merged into a quiet repository
may see two pipeline runs in a week, and a judge that waits for organic traffic leaves the
claim waiting for a week — long enough that the claimant, the reviewer and the reason for
asking have all moved on. The judge therefore asks for the samples it needs: it queues
measurement runs, records exactly which runs it queued, and judges over exactly those runs
once every one of them has finished.

## The procedure

1. **Size the batch from the shortfall, under a cap.** From the waiting state's counts derive
   how many runs the head needs to clear its floor, and bound it by a small per-batch maximum.
   Measurement runs spend real compute, and an unbounded judge spends it on every claim.
2. **Pin each run to a commit.** Trigger each run on the change commit (or its nearest head
   descendant), not on a branch name. A run triggered "on the branch" builds whatever the
   branch points at when a runner picks it up, which may be a commit two changes later; when
   the platform can only queue by branch, record the commit each run actually built and check
   it against the change by ancestry before counting it.
3. **Record the batch before the runs exist.** Write the batch — the claim it serves, the run
   identifiers the platform returned, the time — to its own record beside the claim, as each
   run is queued. The batch record *is* the mark that separates triggered runs from organic
   ones, and it must be written as part of queuing, per
   [record-precedes-effect](../../../../_laws.md#record-precedes-effect): a run that was
   queued but never recorded is an organic-looking sample the judge cannot account for.
   Queue in order and stop at the first refusal, so the record never claims runs that were not
   created.
4. **Queue as the person who asked.** The trigger is a write to someone's pipeline. It runs
   under the requesting person's own credentials, staged as an explicit action they approve,
   never under a standing token the judge holds.
5. **Wait for the whole batch.** The head sample is the batch's runs, by identifier, and the
   judge does not compare until **every** run in the batch is finished. Judging on the first
   three to finish biases toward fast for the same reason a watermark that skips unfinished
   runs does. Failed runs are finished; they simply yield no value.
6. **Pick a base the same size, and like with like.** The base is the target's runs that
   precede the batch, taken newest first, as many as the batch holds — so neither side
   dominates. When the organic base is stale (an older runner image, last month's fleet), queue
   a base batch on the change's first parent too, interleaved with the head batch, so the
   comparison isolates the code rather than the trigger.
7. **Judge once per batch.** Append one verdict per batch with a method marking it as queued,
   and treat a later request for the same batch as a read of that verdict, not a new
   measurement.

## Why identity, not time or ancestry, defines this head

For organic runs, ancestry decides which side a run is on. For queued runs, the batch record
decides first: the head is exactly the runs the judge asked for, and nothing else that happened
to run in the same hour on the same branch. Every count the verdict reports then names its
composition, per [count-carries-predicate](../../../../_laws.md#count-carries-predicate) —
"five queued head runs against the five organic runs before them" is a different claim from
"five head runs".

Triggered runs are not organic runs. They usually skip the warm-up a real merge enjoys, run in
a burst on whatever runners are free, and may skip stages a real event would run. A sample
that mixes them without labels cannot tell a difference caused by the change from one caused
by the trigger.

## Decision rules

- When the head is short of its floor and the claim matters, queue rather than wait.
- When the platform queues only by branch, record and check the commit each run built.
- When any run of the batch is still executing, the answer is waiting, k of N.
- When the base sample predates the fleet's last material change, queue a base batch too.
- When the budget is exhausted before the floor is met, the verdict stays inconclusive with
  that reason — the judge does not lower the floor to fit the budget.

## When not to use it

When the pipeline has side effects — deploys, publishes, notifications — a measurement run is
not free to trigger; use a dry-run mode or measure only the side-effect-free stages. When
organic traffic will meet the floor within the claim's useful life, waiting is cheaper and the
sample is more representative.
