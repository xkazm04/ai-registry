---
layer: technique
type: technique
subject: durable-agent-operations
technique: close-is-a-controlled-crash
status: forged
laws: [unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [designing shutdown for a runtime that owns durable work, a graceful-exit path writes different state than a crash, recovery works in tests and fails on the first real restart, deciding whether shutdown may cancel in-flight effects]
---

# Close is a controlled crash

Shutdown writes no cancellation and no terminal state. It seals admission,
drains what was already admitted, releases resources, and stops — so reopening
finds exactly the restart point a power loss would have left. That is the whole
technique, and the argument for it is not elegance. It is a testing argument.

## The argument

A distinct graceful-shutdown path is a **second recovery path**. It runs on
clean exits: a deploy, a restart, a developer pressing a key. The crash path
runs on the other kind of exit, which by construction happens rarely, at
inconvenient times, and to somebody else. So the system has two paths, and the
one that is exercised constantly is the one that does not matter, while the one
that matters is exercised only when it is already going badly.

That asymmetry has a reliable consequence: **the rare path is the wrong one.**
It was written from the same design, tested with the same fixtures, and then
never run again until an incident. Teams discover their recovery is broken at
precisely the moment they need it, and the reason is always the same — the code
they were running every day was the other path.

Making close indistinguishable from a crash collapses the two into one. Every
deploy, every restart, every test that opens and closes a runtime now exercises
the recovery path. The rare case stops being rare, and a defect in recovery
surfaces on an ordinary Tuesday instead of during an outage. In the terms of
[gate-sees-target](../../../../_laws.md#gate-sees-target): a shutdown path is a
*proxy* for the real ending. Testing the proxy passes exactly when the proxy and
the target diverge, which is the moment the test existed for.

## What close may do

- **Seal admission.** No new operation is accepted; no new effect is admitted
  through the door. Callers arriving after the seal get a clear refusal.
- **Reject observations at its boundary.** Waiting calls are rejected with a
  closed error rather than left hanging.
- **Drain what was already admitted.** Work admitted before the seal is allowed
  to finish its in-flight commit, so the store is left mid-nothing rather than
  mid-transaction.
- **Release resources it owns.** Connections, file handles, timers. Whether it
  also signals cooperative in-flight work to stop early is a local resource
  decision and does not change what is written.

## What close may not do

- It may **not write cancellation**. Nobody requested that the work end; the
  process is going away, which is a different fact. Writing a cancellation
  marker converts a restartable operation into a cancelled one, and the next
  process will terminalize work the user still wanted.
- It may **not synthesize a settlement**. Close does not know the outcome of an
  effect that was in flight, and writing one is
  [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at its
  most expensive: the outcome is genuinely unknown, and a synthesized result is
  a confident claim about a side effect that may or may not have happened.
- It may **not remove a durable operation**. An operation deleted at shutdown is
  work silently discarded.
- It may **not create an ownership-loss recovery path** — a distinct "the
  process that owned this went away cleanly" state, which is the second recovery
  path readmitted under a new name.

An effect that finishes *after* the seal simply cannot commit: its write is
refused, and the operation stays at its pending restart point, which is exactly
where a crash one instant earlier would have left it. That refusal is the
mechanism; there is nothing else to build.

## The relationship to two-commit effect boundaries

Close is safe *because* the effect boundaries are already two-commit. The
pending state left behind is a state recovery has a declared policy for — it
says an effect was in flight and its outcome is unknown, and the next process
applies the unknown-outcome policy for that effect class.

Without that, "close like a crash" is just "lose work". A runtime whose effects
are unbracketed leaves behind a state that means "somewhere in the middle", and
a shutdown that writes nothing into it has thrown away everything the process
knew and recorded nothing in its place. So the ordering of adoption matters:
bracket the effects first, then delete the graceful-shutdown path. Deleting it
first is a regression wearing the costume of a simplification.

## Where this stance is wrong

A technique that claimed universality here would be lying, and two conditions
genuinely break it.

**The interrupted work holds a resource nothing else can release.** An external
lock with no lease, a device claimed exclusively, a session on a remote system
that only this process can end — when the process disappears without releasing
it, no successor can. There the shutdown path has a job no recovery can do, and
it must do it. Note the shape of the correct fix, though: the durable-work
disciplines prefer to remove the condition rather than to add the path, by
giving the resource a lease so that a dead holder is recoverable evidence rather
than a permanent hold. Where that is possible, do it, and close goes back to
writing nothing.

**The effect is irrevocable and shutdown could have compensated it.** If the
process knows an unsettled effect has escaped, and it holds a compensating
action that a successor will not be able to take — because the handle is
process-local, or the compensation window closes — then shutting down silently
discards a repair that was available. Here the honest reading is that the
compensation is part of the effect's own contract, and the effect's design owes
it a durable handle, so the successor can compensate too.

Both exceptions have the same structure: they are cases where a fact lives only
in the dying process. The rule generalizes to *close writes nothing, and every
fact that would have justified a write should have been durable already.*

## Boundary: the opposite stance on a different object

The neighbouring session discipline's ordered teardown says a cancel path must
clear **every** guard that could refuse a stop, in dependency order, and abort
rather than half-clear. This technique says close clears **nothing**. They read
as a contradiction and are not: the registry holds both because the objects are
different and the trigger is different.

The discriminator is **whether a person asked for the work to end.** When they
did, a stop is being requested, guards exist that could refuse it, and clearing
all of them in order is the correct discipline. When the process is simply going
away, nobody has requested anything; there is no stop to unblock, and every
write close makes is a verdict it invented. Write that discriminator down in
both places — a reader who meets these two techniques a month apart will
otherwise conclude one of them is stale.

## Decision rules

- Make close seal, drain and stop. Write no cancellation, no terminal state, no
  synthesized settlement, and delete no operation.
- Let a post-seal write be refused rather than specially handled; the refusal is
  the mechanism.
- Adopt this only after uncertain effects are bracketed by intent and
  settlement.
- Assert equivalence directly: for each durable state, close cleanly and compare
  the store against the same state after a simulated process loss. Any
  difference is the second recovery path reappearing.
- Give a resource with no other releaser a lease, rather than giving shutdown a
  job only it can do.
- Make an escaped effect's compensation handle durable, so a successor can run
  it, rather than running it in the dying process.
- Keep local resource cleanup — closing handles, signalling cooperative work —
  strictly separate from durable writes, so it cannot grow into a write.

## When not to use it

A runtime that owns no durable work has nothing to preserve and nothing to
recover; close is just cleanup and this technique has no content for it.
Likewise a runtime whose in-flight work is entirely reconstructible from inputs
can afford a shutdown that discards it, and the equivalence test is trivially
satisfied. The technique starts paying the moment an operation can be found
mid-effect by a process that did not start it — which is the same moment the
rest of this subject starts paying.
