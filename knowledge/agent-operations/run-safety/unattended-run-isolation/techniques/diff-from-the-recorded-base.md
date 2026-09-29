---
layer: technique
type: technique
subject: unattended-run-isolation
technique: diff-from-the-recorded-base
status: draft
laws: [measure-the-tree-not-the-summary, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [a harness reads an unattended run back as a diff and lands or reviews it, the run may commit inside its own checkout, the checkout is a copy of a directory rather than a repository, a dirty working tree must be captured before a run starts, the step that lands a run's work into a live tree is a model turn]
---

# Diff from the recorded base

[disposable-run-environments](./disposable-run-environments.md) commits the task's
material before the agent starts so that "every later diff is the agent's work."
That sentence is true only for a diff taken **against the commit that was
recorded at that moment**. The usual way to read a run back does something
different, and the difference is silent.

## The blind diff

The common read-back stages everything in the run's checkout and asks for the diff
of the index against the checkout's own head. The checkout's head moves the moment
the agent commits, so the diff is against *the agent's latest commit*, not against
where the run began.

- **Everything committed** — the diff is empty. A landing step that trusts it
  reports "nothing to land" and the work is gone.
- **Some committed, some not** — only the uncommitted remainder appears. A landing
  step applies that remainder, reports success, and leaves the committed change out of
  the live tree. The two halves of one edit can arrive separately, and a half-applied
  change usually still compiles.

Neither outcome carries an error. The tool did exactly what it was asked, and the
question was the wrong one. **Record the base when the checkout is created — the
commit id of the starting revision — persist it beside the run's state, and read
every diff as the working tree against that id.** That single diff covers commits,
staged edits, unstaged edits and new files together, and it is the only read-back
whose meaning does not depend on what the agent chose to do with its own history.
A state file that predates the field falls back loudly, not silently.

## The same defect in a checkout that is not a repository

When the isolation is a copy of the directory, there is no history to record and
the blind diff has a cousin: comparing the **live** tree with the copy. Anything the
operator edits after the copy was made appears as the agent's work, and a file the
operator created appears as one the agent deleted. In a run where the operator
touched one file and added one, a one-file agent change read back as three.

The base for a copy is a **manifest of content hashes taken at copy time**. The
agent's change is the copy now against that manifest; the operator's drift is the
live tree now against the same manifest; and the two are compared before landing,
not folded together.

## Capturing a dirty tree without writing into the operator's history

A run should start from what the operator is looking at, including uncommitted work.
The tempting capture stages everything and commits it onto the operator's branch, so
that the start is a commit. That commit stages untracked files too: a local secrets
file that no ignore rule covers enters the operator's history, in a commit they did
not make, before any agent has run.

Capture the dirty state as an object nothing references, or on a private ref, and
start the checkout from it. The operator's branch, index and history are unchanged,
the run has a base that includes their in-progress work, and refusing to start
because untracked files match a secret pattern is a choice the harness can make in
one line rather than a commit it cannot take back.

## The landing step is mechanical, and success is read from the tree

The landing rule in [the golden path](../unattended-run-isolation.md) says the last
step is a mechanical gate. The failure to guard against is the step that is a model
turn: hand the diff to an agent in the live tree, let it choose merge, cherry-pick or
direct edits, and mark the run applied when that turn emitted no error event.

- A mechanical apply against the recorded base **refuses on drift and applies
  all-or-nothing**. A dirty file the diff touches, a committed conflict, a deletion
  of a file the operator edited: each refuses and leaves the live tree exactly as it
  was.
- A model turn converts each of those refusals into a guess, under whatever
  permission mode the unattended session runs in, and "no error event" is a statement
  about the turn, not about the tree
  ([measure-the-tree-not-the-summary](../../../_laws.md#measure-the-tree-not-the-summary)).
- Whatever does the landing, **the applied mark is computed from the tree**: the
  diff of the live tree against its own pre-landing state equals the recorded change
  set, or the run is not applied.
- Dispose of the run's checkout only after that comparison. A checkout deleted after
  a turn that merged nothing takes the only copy of the work with it.

## The three-case test

Before the queue starts, run the harness's read-back and landing on three
constructed runs and compare each to what the agent actually changed: **(1)** the
agent commits everything, **(2)** it commits one file and leaves another
uncommitted, **(3)** it commits nothing. Case 3 is the control that must not move
when a fix lands; cases 1 and 2 are the ones a blind diff loses. Add a fourth for the
operator editing the live tree after the run started.

## Boundaries

- Which environment the run gets, and what it may reach, is
  [disposable-run-environments](./disposable-run-environments.md) and
  [os-enforced-run-boundary](./os-enforced-run-boundary.md). This is the read-back
  and the landing only.
- A run that must not commit at all can be forbidden to; the diff-from-base rule
  still costs nothing and covers the day the prohibition is not enforced.
