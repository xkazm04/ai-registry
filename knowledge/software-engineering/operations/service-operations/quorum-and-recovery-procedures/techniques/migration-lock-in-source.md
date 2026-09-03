---
layer: technique
type: technique
subject: quorum-and-recovery-procedures
technique: migration-lock-in-source
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [copying a store's contents offline from one backend to another, two operators might run the same migration, deciding which keys a backend copy must skip, the server must refuse to start during a migration]
---

# The migration lock lives in the source

An offline migration copies every entry from one store to another while the serving
process is stopped. It is the simplest procedure in the subject and the one most
often run twice by accident: two operators with the same runbook, or one operator and
a scheduler that was not told. Two migrators writing one destination produce a store
that is neither the source nor a copy of it. The technique is three rules about where
the guard lives, what it skips, and who else must honour it.

## Lock in the store both migrators must open

The rule: **when two copies of a procedure could run concurrently against one source,
take the exclusion lock in the source, because the source is the one store every copy
is guaranteed to open before it does anything, and a lock anywhere else guards only
the copies that happen to look there.** The naive designs put the lock in the
destination (a second migrator with a different destination sails past it), in a
local file on the operator's host (a second operator on a second host never sees it),
or in the migrator's memory (a second process never sees it). The source is the
target of the operation - what is being read, what would be corrupted by a
concurrent writer - and the guard sees its target only when it sits there
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The lock is one entry under a reserved key, holding when it was taken and by which
host. Acquisition is a conditional write - fail if the key exists - and the migrator
refuses to proceed if it fails, printing the lock's provenance so the operator can
decide whether the holder is alive. Release removes the key on success and on every
error path the migrator controls; a lock that survives is the stale-marker case the
sibling cancel technique clears with an explicit reset flag, and the reset is the
*only* path that removes a lock the current process did not take.

Some backends carry their own exclusion: a single-file embedded store that takes an
exclusive file lock on open cannot be opened by two processes at all. For those the
reserved-key lock is redundant and the technique says so: skip it, because a second
lock with a second reaper is a second way to leave a stale marker. The exemption is
per backend, declared where the backend is registered, not a runtime guess.

## Reserved keys are never copied

The lock key is one of a small set of keys that describe the *source's own state*
rather than the data: the migration lock, the backend's leadership record, a
consensus peer list, an index of the log position. Copying them into the destination
transports a claim that was true of the source into a store where it is false - a
destination that, on first open, believes a migration is in progress, or that a
leader exists at an address that belongs to the old cluster. The migrator holds an
explicit denylist of reserved prefixes and skips them; the denylist is the same set
the serving process treats as its own.

The rule: **when copying between stores, skip every key the source uses to describe
itself, because such keys are true only in the store that wrote them.** The failure
mode of the naive full copy is the destination refusing to start on its own
migration lock - the copied marker - and the operator running reset against a lock
that was never taken here.

## The server refuses to start beside it

The lock guards the copy from a second copy. It must also guard the copy from the
serving process, which is a writer with far more reach than any migrator: a server
started against a store that is mid-drain accepts writes that the destination never
sees, and the operator discovers the split when the cutover loses a day of data. So
the serving process checks for the migration lock at boot, before it opens the
barrier, and refuses to start while the lock is held, naming the lock's provenance in
its refusal.

This is an instance of a guard that engages on its own rather than one the operator
must remember ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)):
the runbook that says "do not start the server during migration" protects the
operators who read it; the boot check protects the fleet. Where a deployment supervisor
restarts a crashed server automatically, the check is what keeps the supervisor from
undoing the procedure.

## The copy itself

The copy is one pass in a stated order: list the source depth-first, keys sorted,
read each entry, write it to the destination, with a bounded parallelism so a large
store finishes in a night and a small one is not slowed by a scheduler. Entries are
copied as stored - encrypted under the barrier - so the migrator never needs unseal
material and cannot read what it moves; this is what makes the procedure safe to hand
to an operator who is not a share-holder. The migrator reports what it copies as it
goes, so an interrupted run can be judged by its output.

The stated order is what makes an interrupted run resumable: because keys are visited
in lexicographic order, the position of an interruption is a key, and a re-run that
takes a start key skips everything before it. The rule: **when a copy may be
interrupted, traverse in an order that makes the resume point a name the operator
can read off the output, because a resume that has to compare source and
destination to find its place is a second migration.** The resume is sound only
because the source cannot have changed - the server was stopped, and the boot check
kept it stopped - so the resume flag and the boot refusal are one design, not two
features; a migrator that offers resume without the boot refusal offers a resume
that silently skips entries written after the interruption.

## What the technique is not for

A migration between stores under a consensus log that both stores participate in is
not offline and is not this technique; the log migrates state by replication, and the
procedure is a membership change. Nor is this the path for a backend's *internal*
format migration on version upgrade, which runs inside the serving process at unseal
with the barrier open. This technique is the cold copy, run with the server stopped,
by an operator who may not be able to read what they are moving.
