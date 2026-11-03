---
layer: application
type: application
subject: earned-autonomy-tiers
technique: demotion-attribution-integrity
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1
applied: code
ab_verdict: better
---

# A slice re-derived from a re-filed row demoted the wrong slice

The `personas` desktop app (https://github.com/xkazm04/personas), read at `origin/master`,
commit 73888ab73a, keeps a scanner's autonomy in its own SQLite store, written in Rust. A
scanner files findings into a project backlog. Each finding belongs to a *slice*, and the
slice holds a level on a four-rung ladder (propose, auto-triage, auto-build, auto-merge). The
module states the ladder at the top:
`src-tauri/db/src/repos/dev/scan_trust.rs:2 "the decision memory a scanner reads before it predicts, and the autonomy"`.
This application traces
[demotion-attribution-integrity](../techniques/demotion-attribution-integrity.md) through the
store. It found the technique's then-missing trap live: the class is computed from the
action's own attributes, and the actor being judged rewrites those attributes.

## What the tree gets right

- **Only people's verdicts earn standing.** The agreement window counts only decisions a
  person made:
  `src-tauri/db/src/repos/dev/scan_trust.rs:503 ".filter(|i| i.decided_by.as_deref() =="` (the comparison is against the human actor).
- **Only a person's reversal demotes.** A reversal by any machine actor demotes nobody.
- **Every move is an append-only event.** The current level is read from the newest event, as
  `src-tauri/db/src/repos/dev/scan_trust.rs:16 "*Current* level: the newest"` states. That
  gives the technique its single ledger of moves.
- **A late prediction cannot count.** A prediction that arrives after a person decided is not
  recorded, because, as the module comment says, it "would contaminate the agreement the ladder
  is earned on".

That last rule is the precedent for the fix below.

## The class is recomputed, and the claimant writes its inputs

The slice is never stored with a decision. Whenever the ladder needs it, the slice is rebuilt
from the row's current `category`, `lens` and `size`. The verdict hook rebuilds it from the row
as it stands after the verdict:
`src-tauri/src/commands/infrastructure/scan_contract.rs:295 "let slice = trust::slice_key(&after);"`.
It demotes the slice it just rebuilt:
`src-tauri/src/commands/infrastructure/scan_contract.rs:310 "trust::demote_slice(db, project_id, &slice, reason, Some(&after.id))?;"`.

The inputs to that slice can be rewritten:

1. A later sweep that files the same finding hits the dedup guard. The dedup key pins the lens:
   `src-tauri/src/commands/infrastructure/app_master_writeback.rs:542 "repo::scan_dedup_key(key_type, context, title)"`.
   The guard then hands the existing row back:
   `src-tauri/src/commands/infrastructure/app_master_writeback.rs:740 "The guard fired. Hand back what is already there"`.
2. The door writes the new filing's fields onto that row:
   `src-tauri/src/commands/infrastructure/app_master_writeback.rs:784 "filed.idea = scan_contract::record_finding(db, &filed.idea.id, &finding)?;"`.
3. The store overwrote the slice parts whatever the row's status:
   `src-tauri/db/src/repos/dev/scan_trust.rs:143 "size         = COALESCE(?13, size),"`
   and `src-tauri/db/src/repos/dev/scan_trust.rs:128 "lens         = COALESCE(?1, lens),"`.
   It did so on purpose,
   `src-tauri/db/src/repos/dev/scan_trust.rs:106 "one (a re-sweep re-scores)"`.

Because `size` is not part of the dedup key, a re-scored size reaches a row the machine has
already decided. The failure scenario:

1. At L1, the slice `technical|error-handler|-|S` auto-accepts a finding.
2. The next sweep re-files that finding as size `M`.
3. A person reverses the decision.
4. The reversal demotes `technical|error-handler|-|M`, a slice that never decided anything.
5. The `S` slice keeps auto-deciding at its level, and its window never records the reversal.

The same move carries a person's earlier verdict, and its agreement credit, into another slice's
window. The scanner that is being judged is the party that writes `size`. Per
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate), the claimant
chose which slice its own reversal lands on.

## The fix, applied in the tree

The store already freezes `predicted_verdict` once an item leaves `pending`. The fix extends the
same rule to `lens` and `size`: a re-sweep still updates score, band and proof, but no longer
moves a decided item to another slice. `category` is not written on this path. Two tests were
added beside the store's own tests:

- a machine-decided item, re-filed with a new lens and size, keeps the slice it was decided
  under, and its score still updates;
- a pending item still moves when it is re-sized.

Control: against the unchanged code, the first test failed red. The item had moved from
`technical|error-handler|-|S` to `technical|code-optimizer|-|M`, and the second test passed.
With the fix, both tests pass.

The storage crate's whole suite ran 1609 passed and 4 failed. All four failures were the
encryption tests' fail-closed "Keychain not available on this platform" refusals, in files the
change does not touch.

**Upward lesson, now in the technique:** "a class computed from the action is a claim too".
Freeze the attributes that make up the class key when the verdict is recorded, or store the
computed key in the decision record.

## Remaining deviation

A person's reversal still recomputes the slice from the row, so a person who edits an item's
category before reversing moves the demotion with it. That is a person correcting the item rather
than the claimant, and it is left as is. Storing the slice in the decision record would close it,
at the cost of a migration.
