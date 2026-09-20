---
layer: application
type: application
subject: review-iteration-loops
technique: gate-record-outlives-the-media
stack: node
status: forged
verified_on: 2026-09-20
verified_against: node@24
---

# Node: the gate that deletes what it judged, and the ledger that is the only thing left

*Citations resolved against the `gravitone-gcloud` tree at `0e05c50`,
2026-09-20.*

Gravitone's training loop runs on a machine with the GPU; the human gate runs
in the app, in a checkout on another machine. Nothing about the arrangement is
optional — the renders are where the card is, and the person is not. The
server-side disk layer that joins them is `lib/foundry/training/store.ts`, and
its header states the split before any code appears:

> Cross-machine design: `foundry-out/` is gitignored, so the media never syncs.
> What DOES sync — because it is git-tracked — is
> `pipeline/foundry/training-ledger.json` (one row per gated improvement) and
> `training/thumbs/` (one kept image per approved improvement).

That is the technique's rule, arrived at from the constraint rather than from
the standard: the channel the two machines already share is the repository, so
the verdict goes in the repository and the bulk stays where it was made.

## The commit, operation by operation

`commitCycle()` (`lib/foundry/training/store.ts`) is the whole gate in one
function, and its ordering matches the technique's three:

1. **Keepers first.** Each *approved* improvement's chosen frame is copied into
   the tracked directory before anything is unlinked — the comment says why in
   one line: "the tracked copy must exist before the source is unlinked." The
   kept frame's source is itself one of the files the cull is about to take.
2. **Then the cull.** Both arms of every pair of every *decided* improvement,
   posters included, are unlinked. `ENOENT` is swallowed and every other error
   propagates, so a partially culled cycle is not silently reported as clean.
   The record is amended rather than removed: `MediaRef.deleted` is set to
   `true` — typed in `types.ts` as "Set by a commit: the file is gone, the
   record stays."
3. **Then the row.** One `TrainingLedgerRow` per decided improvement, appended
   to the tracked ledger, carrying the subject and technique it tested, the
   human verdict, the machine judge's pick rate, the second judge's agreement
   where there was one, and the tracked frame path for approvals only.

Scope is enforced on the way in: `decided` is the set with an explicit
`approve`/`reject`, so undecided improvements keep their media and a
half-reviewed cycle resumes. The status guard refuses anything not in
`awaiting-gate` or `failed`, and a second commit is a 409 — the operation is
one-way by construction, not by convention.

Rejections get a row and no frame, exactly as the technique says: the
`trackedThumb` map is only populated on the `approve` branch.

## The discharge marker is a field

`TrainingLedgerRow.reflected` is typed `false | string`, and `types.ts`
explains it in place: "false until the loop has edited the named prompt
surface, then the sha." The ledger's own `_purpose` string is blunter — rows
with `reflected: false` are "the next cycle's reflection work queue … the loop
edits the named prompt surface for each, then stamps the commit sha into
`reflected` so the row is never worked twice."

The union type is what makes it a queue rather than a boolean: the discharged
state is not `true`, it is *the identifier of the change that discharged it*,
so a row answers both "is this owed" and "where did it go". Rejections use the
same field for a third answer, `"not-better:no-edit"` — nothing is owed and the
row says so, rather than sitting at `false` forever and reading as backlog.

## Where the arrangement actually fails

The repository is the sync channel only for a process writing into the
repository that the other side reads. It has more than one working copy, and
the failure is invisible from the committing side. The tree's own operating
notes record it as a suspicion, dated 2026-08-31: "the 08-30 batch of nine
committed cycles has NO ledger rows (only 4 rows exist while 8 thumbs do) …
the ledger is not the record it claims to be for that batch; likely committed
from a worktree checkout."

Reconciling the two halves today confirms the shape and shows it running in
both directions. Reading `pipeline/foundry/training-ledger.json` against
`git ls-files pipeline/foundry/training/thumbs` on 2026-09-20:

| | count |
|---|---|
| ledger rows | 17 |
| rows citing a kept frame | 7 |
| frames present in the shared history | 8 |
| cited frames **absent** from the shared history | 4 |
| present frames cited by **no** row | 5 |

Only three rows and their frames agree. The five uncited frames are the
2026-08-30/08-31 batch the note already suspected; the four missing frames are
the reverse failure — rows that travelled while their evidence did not, which
no amount of care on the committing machine could have revealed, because that
machine has the files.

Neither half is wrong about itself. The ledger is a valid ledger and the
directory is a valid directory; the finding exists only in the join, which is
why the technique puts the reconciliation at the reading end. Nothing in this
tree runs that join today — it is a script that would take an afternoon and it
is the single highest-value thing the gate is missing, because every other
guarantee it makes is conditional on the record having arrived.

## What this realization does not cover

`commitCycle` is atomic in intent and not in mechanism: copy, unlink, ledger
write and manifest write are four sequential effects against two different
trees, and a crash between the cull and the ledger append loses the verdict
while destroying its subject — the exact ordering the technique's first rule
exists to prevent, one step further out than the code currently guards. The
keeper copy is protected; the row is not. A failure there is unlikely and
unrecoverable, which is the combination that justifies writing the row before
the cull rather than after it.
