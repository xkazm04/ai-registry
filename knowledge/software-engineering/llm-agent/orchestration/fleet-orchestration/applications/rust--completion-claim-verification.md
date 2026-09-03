---
layer: application
type: application
subject: fleet-orchestration
technique: completion-claim-verification
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.97
applied: simulation
ab_verdict: better
proof: structural-only
---

# Completion-claim verification in Personas' overnight fleet (Rust)

The repo runs a fleet of unattended coding sessions overnight and harvests
them in the morning. It has built the *reporting* half of the standard
carefully and none of the *verifying* half — which is the technique's
claim about where fleets rot, seen in one tree.

## What the tree has: a declared result, never a paraphrase

The dispatch brief (`src-tauri/engine/src/unattended.rs:46-66`) is a
result contract in the result-harvest sense. A worker is told to work on
a dedicated `autopilot/<slug>` branch, never to push or merge, and to end
its final turn with exactly one of two machine-readable lines:
`FLEET:DONE — <one-line summary>` or `FLEET:BLOCKED — <what you need and
who can decide it>`. Blocked is a result, not a wait (rule 6) — failure as
first-class output.

The bridge honours the contract mechanically.
`src-tauri/src/commands/companion/fleet_bridge.rs:859` (`handle_mechanical_cue`)
scans the bottom content rows of a parked screen for the newest marker,
requires a real separator so prose *about* the protocol and template echoes
do not match, and on `FLEET:DONE` calls `mark_finished(session_id, &summary)`
(`:889`), writing `Task complete: <summary>` as the durable state reason.
The run harvest (`src-tauri/src/commands/fleet/run.rs:169`,
`summary_from_reason`) reads back only that prefix and returns `None` for
anything else — its own comment: "we only report what a session actually
declared, never a paraphrase of its last state." A session auto-finished
on an unanswered question gets a different prefix on purpose
(`unattended.rs:185-194`), so the harvest cannot mistake it for a claim.

That is result-harvest's "report only what was declared" rule, built
correctly, with the test coverage to keep it.

## The structural fact: the claim is the only input

Nothing between the cue and *Finished* reads an artifact. A search of the
bridge and the run harvest for any read of the branch, the diff, or the
worktree finds one comment about a decision hash that "can't verify"
(`fleet_bridge.rs:1272`) and nothing about the work. The cue was
introduced because an earlier round spent **27 assessment turns on pure
completion confirmations** (`fleet_bridge.rs:777-779`), and the fix
removed the assessment from the completion path entirely — the claim now
parks the session at zero cost, and at zero scrutiny.

The tree also holds the cheapest decidable leaf the technique names, and
never asks it: the brief *requires* a branch with the work on it. "The
branch named in the brief exists and has at least one commit ahead of its
base" is a parent-side, code-checkable, artifact-grounded leaf — one
version-control call, no model turn — and it is precisely the leaf a
worker that flailed and then typed `FLEET:DONE` cannot satisfy.

## The A/B, as a simulation over three cases from the tree's history

- **Policy A** (as shipped): `FLEET:DONE` with a summary parks the session
  as Finished; the harvest reports the summary.
- **Policy B** (the technique): the cue is a claim. Before Finished, the
  bridge checks the brief's decidable leaf against the artifact; a claim
  whose leaf fails is parked with a verdict of *unverified*, its summary
  still recorded as declared, and the run report says which.

1. **The 27-confirmation round** (`fleet_bridge.rs:777`). Under A the cue
   costs nothing and trusts everything. Under B the cue costs one
   version-control call per session, still no model turn — the saving the
   cue was introduced for is intact — and a session that declared done on
   an empty branch is labelled rather than believed. Predicted: the
   report's *Finished* count splits into finished-verified and
   finished-unverified, and the morning reviewer opens the second set
   first.
2. **Probe 2: `FLEET:NEXT` fell through to a full assessment turn**
   (`fleet_bridge.rs:786-789`). Unchanged under B: a continuation cue is
   not a completion claim, and the technique gates only completion.
3. **A session that ended on a question** (`unattended.rs:185`). Unchanged
   under B: the tree already refuses to paraphrase, and the technique adds
   verification to declarations, not declarations to silence.

**What would falsify the prediction:** a run history in which every
`Task complete:` session's branch carries commits ahead of its base. Then
the leaf never fires and B is one cheap call of pure cost. The tree's
durable `fleet_sessions` rows plus the branches the workers were given are
enough to measure this after the fact, which is the return condition.

## Verdict

`better`, filed as the project's next change rather than committed: the
bridge's finish path is a few lines, but the leaf needs the brief's branch
name threaded to the bridge, and the run report needs a third state, which
is more than a reviewer reads in one diff. The first measurement is a
query over existing rows, not a change.

## What this realization cannot do

The tree has no execution receipts — sessions run in a terminal the harness
observes as text, so the technique's first layer (runtime-stamped receipts
the report must cite) has no substrate here, and the provenance rule for
test runs has nothing to stamp. What it can do is the second layer at its
cheapest: one artifact leaf the brief already demands. That is also the
honest reading of the technique's cost curve — the leaf is worth more than
the ledger in a fleet whose workers write to a version-control system,
because the system is the receipt.
