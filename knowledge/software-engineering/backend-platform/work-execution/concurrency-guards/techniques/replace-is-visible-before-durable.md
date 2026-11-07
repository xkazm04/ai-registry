---
layer: technique
type: technique
subject: concurrency-guards
technique: replace-is-visible-before-durable
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
applied: experiment
ab_verdict: unmeasurable
use_when: [deciding what a publish reports when the step after the rename fails, a guarded retry conflicts with the writer's own success, testing failure points of a write-then-replace, a file publish claims to survive a power cut, porting a directory flush to a platform that has none]
---

# A replace is visible before it is durable

[atomic-file-publish](./atomic-file-publish.md) settles what a reader can see: the old document or the new
one, never a partial one. It flushes the content first, so the name never points at unflushed bytes. That
secures the bytes, not the directory entry that names them. On common systems the entry needs its own flush,
on a handle to the directory, and the reference page for the file flush says plainly that it does not
necessarily reach the entry.

So a publish has three outcomes, not two.

- **Not published.** A failure before the replace. The old content stands.
- **Published and durable.** Every step finished.
- **Visible, durability unconfirmed.** The replace happened and the directory flush failed. Readers already
  see the successor, a crash may still undo it, and the writer has an error in hand.

## The rules

**Never report the third outcome as "the publish did not happen".** Measured on our own harness with the fault
injected after the rename: a fresh reader saw the new version, and a retry guarded by the revision the writer
started from failed with a conflict against the writer's own success. The same harness classifying the outcome
by what it had done reported visible-unconfirmed, and still reported not-published for a failure before the
replace.

**Name each failure point and test each one,** asserting what a fresh reader sees after it and after a reopen.
Keep the injection compiled out of shipping builds, and keep one path where the real call runs, because an
injected failure proves the handling and not the platform.

**A directory flush is owed when a name changes.** Appending to a file that already exists does not need one; a
create or a replace does.

**Return it or log it, and say which.** Two trees chose opposite defaults here, and both are defensible. One
returns the error, so its caller holds the third outcome and a test pins it. The other logs and returns success,
on a recovery path where the successor is already the only way forward and the caller can do nothing with the
error. The question is what the caller can still do: return it when a retry or a reader depends on the answer,
log it when nothing can act on it.

## Where the guarantee is absent

On at least one major desktop platform the standard library's plain open of a directory is refused with a
permission error, measured, so the usual code cannot run there. A publish that returned that error would fail
every time, and one that swallowed it would imply a guarantee it does not have. Compile the step out where it is
unavailable and say the guarantee is absent. One tree here gates every such flush to one family of platforms with
no comment saying so, and a mature application in this corpus records the same fallback as a stated deviation
([go--live-file-is-the-snapshot](../../../data-layer/transactions-over-a-replicated-log/applications/go--live-file-is-the-snapshot.md)).
The second is the form to copy.

## When not

A disposable hint or heartbeat that a restart rebuilds does not need the directory flush. Nothing here says a
directory flush was seen to save a document: no run in this corpus has cut power under one, so the crash half is
the reference page's claim. It takes a power-loss harness to move it.
