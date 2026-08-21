---
layer: technique
type: technique
subject: unattended-build-loop
technique: rollback-to-last-green
status: forged
laws: [refuse-rather-than-destroy, one-authority-per-quantity]
shared_with: []
use_when: [an automated item exhausts its retries, recovering an unattended run that went red, resuming an interrupted automated run]
---

# Rollback to the last green

Snapshot the working state every time an item passes its required checks, label
each snapshot, and on exhaustion rewind hard to the most recent one before
promoting the failed item as gapped. The invariant: **a bad session can never
corrupt work that was already independently verified.**

## The procedure

1. **Take a baseline snapshot before the first item runs.** The pre-run tree is
   the last known-good state; without it, the first failure has nowhere to rewind
   to.
2. **Work on a dedicated line of history named for the run**, not on whatever
   branch the operator happened to be on. Rewinding someone's working branch is
   the destructive outcome this technique is supposed to prevent.
3. **Snapshot on green only.** The trigger is the required checks passing — the
   producer's own claim of success is not a trigger. A snapshot taken on a
   self-reported pass is a checkpoint at an unknown state.
4. **Label each snapshot with the item's identity and the iteration.** Sanitise
   the label for whatever naming rules the history system enforces, and collapse
   sequences that are illegal in a label rather than failing the snapshot.
5. **Maintain a ledger** — an ordered list of snapshot identities, most recent
   last — persisted alongside the run's other durable state.
6. **On exhaustion, rewind hard to the ledger's last entry, then promote the
   failed item as gapped.** Rewind first; the promotion is bookkeeping about an
   item, not a licence to keep its changes.

## Decision rules

- **Rewinding forces a concurrency of one.** A hard reset discards the whole
  working tree, including changes a sibling worker is midway through writing.
  With several writers interleaved into one tree there is no coherent state to
  rewind *to* — the last green snapshot describes a tree that no longer
  corresponds to any worker's assumptions. Either run one item at a time, or
  give each worker an isolated tree, or do not offer rollback. There is no
  fourth option, and offering rollback anyway produces silent work loss under
  concurrency.
- **The ledger must survive a restart.** A resumed run that starts with an empty
  ledger takes a fresh baseline at the resume-time tree — which is exactly the
  damaged state the operator resumed in order to escape. Rehydrate the ledger
  from durable state, and adopt it only when it belongs to this run's line of
  history.
- **The rollback target and the displayed ledger must be one authority.** The
  classic failure is a recovery path that resets to an internally-recomputed
  baseline while the operator's view renders the persisted ledger. Both look
  plausible; they disagree; the disagreement is only observable as lost work.
- **Verify the target still resolves before arming a rollback.** If the ledger's
  last entry no longer names a real state, discard the ledger and take a fresh
  baseline. Never arm a rewind at a missing target.
- **Re-attach to an existing line of history; do not recreate it in place.** A
  create-or-reset operation moves the reference onto the current state and
  orphans every snapshot the ledger names. If the line is gone but its snapshots
  survive because they were labelled, recreate it *at* the last green.
- **A dirty tree at resume is preserved, not discarded — and never becomes a
  target.** Commit it under a distinct resume-snapshot label so it stays
  reachable after a later hard rewind, and deliberately leave it out of the
  ledger. Refusing to destroy an operator's uncommitted work costs one label;
  destroying it costs their afternoon.

## When NOT to use this

- **When the loop's writes are not to a versioned tree** — direct mutations to a
  live datastore, calls to external services with side effects. Rewinding the
  code does not rewind those, and a snapshot ledger over a partially-rewindable
  world is more dangerous than none because it implies a recovery that did not
  happen.
- **When throughput matters more than recoverability.** The concurrency-of-one
  constraint is real and expensive. For a run whose items are independent and
  individually cheap to redo, wide concurrency without rollback beats serial
  execution with it.
- **When items are genuinely isolated** — each writing to its own area with no
  shared state — a per-item revert is cleaner than a whole-tree rewind, because
  it does not discard the successful siblings that ran alongside.
