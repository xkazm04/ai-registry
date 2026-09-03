---
layer: technique
type: technique
subject: migrations
technique: expand-deploy-contract
status: forged
stage: team
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a schema change must land while two code versions are serving traffic, renaming or dropping a column that live code still names, deciding whether the destructive half of a change is safe to run yet, a rollback would put old readers back in front of a contracted schema]
---

# Expand, deploy, contract

This is a **server** discipline, and it exists for one condition: during a
rolling replacement, two versions of the application run at once against one
store. The old version is still serving while the new version starts; for the
length of the rollout, and for as long afterwards as a rollback remains
possible, the schema must satisfy both. Every rule below is derived from that
single fact.

On an unattended single-copy machine the condition never arises — one
process, one store, the chain runs at boot before the application opens — and
nothing here applies. What replaces it there is the snapshot-and-halt
contract: no compatibility window is needed because there is no second
reader, and no rollback exists except restoring the copy taken before the
first step. Confusing the two produces both characteristic errors: a
single-copy product paying three releases for a column rename, and a fleet
dropping a column out from under half of itself.

## The three phases

### Expand — make the schema tolerate both shapes

Only additive, optional shape ships here. A new column that is nullable or
carries a default; a new table; a new index; a new value added to a widened
vocabulary but not yet written. The test to apply to every statement in this
phase: **the previous release's code, unmodified, must still read and write
this store correctly** — which in practice means it must be able to insert a
row without knowing the new column exists.

What may not appear in expand: a non-nullable column without a default, a
rename, a drop, a narrowed type, or a uniqueness constraint over data that
has not been de-duplicated yet. Each of those breaks the running old version
at the instant it commits.

**Backfill is part of expand and is its own step.** The shape change is fast
and atomic; the backfill is long and crash-exposed. Fused into one step they
are un-retryable together — batched, watermarked and resumable is the shape
the backfill must take, and it runs after the column exists, never in the
same unit.

### Deploy — ship the code that uses the new shape

The release that reads and writes the new shape. Two obligations, and both
get skipped:

**It must tolerate an incomplete backfill.** Between the column existing and
the backfill finishing, the new code reads rows the backfill has not reached.
Absent must be handled as *absent*, distinct from every legitimate value: an
unbackfilled count is not zero, an unbackfilled state is not the default
state, an unbackfilled timestamp is not the epoch. This is the exact laundering
point the law names — an optional column meeting a non-optional field, and
"we do not know yet" published as a confident value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)) — and
it is why the honest expand phase leaves the column nullable rather than
defaulting it to something that reads as real data.

**It must keep the old shape correct while old code still writes it.** For as
long as the previous release can be running or rolled back to, writes go to
both representations and reads prefer the new with a fallback to the old.
Dual-write is required exactly when old code still *writes* the old column;
where the old code only reads it, keeping the old column populated by a
one-way projection is enough. Dual-write is a cost, so scope it: it is
temporary code with a named removal date, which is the next phase.

### Contract — remove the old shape, in a later release

Drop the old column, table or constraint; delete the dual-write; delete the
fallback branch. This is where the code becomes simple again, and it is the
phase teams skip, because by then the feature works and nothing is on fire.
A system that never contracts accumulates a permanent compatibility tax, a
schema no reader can interpret, and a growing population of columns nobody
dares touch because nobody can prove they are dead.

Contract is still a one-way door. It gets the same snapshot the subject
demands of every destructive step.

## The rule that decides when contract is safe

Contract may run when **no code that could read or write the old shape can
still be running, or be rolled back to.** That is three conditions, and each
is an *observation* — the whole discipline collapses if any of them is
assumed ([gate-sees-target](../../../../_laws.md#gate-sees-target)):

1. **Every instance is at or past the deploy release.** Read this from the
   deployment system's live inventory, not from the change log and not from
   "we shipped that last week". A single instance that failed to replace and
   was never noticed is the whole population that matters.
2. **The rollback target is at or past the deploy release.** This is the
   condition most teams get wrong, because they check what is *running* and
   not what they could *return to*. Contract removes the column; a rollback
   after contract reinstates readers that name it. Until the retained
   rollback targets have all moved past the deploy release, contract is a
   loaded gun pointed at the recovery path.
3. **The backfill is complete, measured against the store.** Count the rows
   where the new column is still unset, with the predicate written down
   beside the number; do not infer completeness from the backfill job's exit
   code, which reports that the job ended, not that it converged.

And one enumeration that is routinely too narrow: **asynchronous consumers
are running code.** Queued jobs enqueued by the old release, scheduled tasks,
in-flight exports, replica read paths, cached query plans, and anything that
deserializes a payload the old release persisted. The compatibility window is
not "how long does the rollout take"; it is **"how old is the oldest thing
that will still read this row"** — and for a durable queue that can be days.

## The rename is the trap

There is no rename in this discipline. A rename is three releases: add the
new column (expand), write both and read the new (deploy), drop the old
(contract). Spelled as a single alteration it is a guaranteed error window
for the length of the rollout, falling on whichever half of the fleet is
currently on the wrong side of it — and the errors are attributed to the
release that was already deployed, not to the one that renamed the column.

The same decomposition covers the other apparent one-shot changes: narrowing
a type is add-new, convert, swap, drop; adding a uniqueness constraint is add
index without enforcement, de-duplicate, enforce; splitting a column into two
is expand twice and contract once.

## What it does not buy

- **It does not make the migration reversible.** Contract is a one-way door,
  and expand plus deploy are only reversible while the old shape is still
  maintained. The compatibility window is a *recovery* window, not an undo.
- **It does not remove the backup.** Three phases of care do not make the
  destructive statement safe; they make the moment it runs predictable.
- **It costs calendar time.** Three releases per shape change, and the middle
  one carries dual-write code. That price is why the discipline is
  under-used, and why it tends to be adopted immediately after the outage it
  would have prevented — which is the wrong order but the usual one.

## When it is ceremony

Below a rolling replacement, take the window. A single instance, or a
deployment model where the old process is stopped before the new one starts,
has no two-version interval to protect; a brief maintenance window is
cheaper, simpler and more honest than a three-release dance whose entire
justification does not apply. Adopt the discipline at the rung where two
versions genuinely overlap — and then adopt it for *every* destructive change,
because the one exception is always the one that overlaps.
