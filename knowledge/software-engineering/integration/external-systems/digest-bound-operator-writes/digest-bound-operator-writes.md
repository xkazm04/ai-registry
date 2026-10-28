---
layer: golden-path
type: golden-path
subject: digest-bound-operator-writes
status: forged
use_when: [a tool writes to a system it does not own on a person's behalf, a confirm button must run exactly what the person was shown, a write's answer was lost and someone wants to send it again, deciding what a failed or timed-out write should say]
techniques:
  - plan-twice-run-if-unchanged
  - record-before-each-command
  - preview-id-claim-and-recall
  - unretried-write-unknown-outcome
  - precondition-token-on-every-write
---

# Digest-bound operator writes

A tool that writes to a system it does not own, on a person's behalf, makes a promise
the moment it shows a confirm button: *what you are looking at is what will happen*.
Almost every such tool breaks that promise in an ordinary way. It shows a summary,
and on the click it rebuilds the request from whatever the client sent back, or from
the world as it is now, which is not the world the person looked at. It sends the
request once, the connection drops, and it reports "failed". The person reads
"failed" as "nothing happened", clicks again, and the remote system now holds two
merge requests, two commits, or one overwrite of a change another person landed in
the minute between.

This subject is the discipline that keeps the promise. A write is **staged as the
exact commands** it will send, never as a description of them. The confirm is
**bound to those commands by a digest**: it plans again from fresh reads and runs
only if the new plan's digest equals the one the person saw. Each command is
**recorded before it is sent**. Each confirm is **journaled under its preview's id**,
so a confirm whose answer was lost can ask the record what it did instead of doing
it again. A write that was sent and not retried and got no answer is reported as
**unknown outcome**, never as failed. And every write **carries a precondition
token**, the last state the plan read, so the remote system itself refuses a write
that has gone stale between the second plan and the send.

## The plan is the commands, not a picture of them

The naive staging shows the person a human sentence ("promote class X to tier 2")
and composes the request at send time. The sentence and the request then have two
authors, and nothing forces them to agree. They drift in the boring ways: a field
the schema does not have, a path into a file the file does not contain, a branch
name that differs by a date. The rule is that the server plans the **exact argument
vectors** it will send, the preview shows those vectors (with a readable rendering
beside each, never instead of it), and the client never composes a command. The
client sends back an *intent*, the thing the person wants done, and the plan is
always the server's derivation from the intent and from fresh reads. This is
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)
applied to writes: one code path writes the command text, and a check over the
client's sources that no hand-spelled write exists keeps the second author from
coming back.

## Confirm re-plans, and runs only if nothing moved

Between the preview and the click, the world moves: a teammate commits, a tripwire
lowers a record, a branch is deleted. A confirm that runs the plan it computed at
preview time runs a plan for a world that no longer exists. A confirm that re-plans
and runs whatever the new plan says runs something the person never saw. The only
honest confirm does both: it plans again, digests the new plan, and compares. Equal,
it runs. Different, **nothing runs**, and the response is a distinct "changed" state
carrying the new preview so the person can look again. The digest covers everything
the confirm will *do*, which includes the local side effects (the inbox item it will
settle, the record it will close), not only the remote commands. The mechanics are
[plan-twice-run-if-unchanged](./techniques/plan-twice-run-if-unchanged.md).

## The record lands before the command

A write to an external system is an effect the tool cannot undo and may not even be
able to observe. If the tool sends first and records after, a crash between the two
leaves an effect nothing accounts for. So each command is written to the tool's own
record, with who, what, the exact vector, and when, *before* it is sent, and finished
with its exit after. When the record cannot be written, the command is not sent,
per [record-precedes-effect](../../../_laws.md#record-precedes-effect). The record
is per command, not per confirm, because a multi-command plan (a branch, then a
commit on it, then a request to merge it) fails part-way, and the question afterwards
is always which of them landed. That is
[record-before-each-command](./techniques/record-before-each-command.md).

## A lost answer is recalled, not resent

The most dangerous moment in this whole subject is the one after a confirm went out
and no answer came back: the browser tab closed, the proxy timed out, the server
restarted. The person wants to know whether it happened. The naive tool has two bad
answers: assume not and enable the button again, or assume so and show success.
The disciplined tool keeps a journal row keyed by the preview's id. The confirm
**claims** the id atomically before its first command and **finishes** it with the
response it sent. Then a repeat of the same id answers from the record, a concurrent
confirm of the same id (a double click, a second tab) is refused while the first is
running, and a client that got no answer can **recall** what the id did: ran (with
the response), running, never claimed, or unknown. Only "never claimed" and "unknown"
lead to a fresh preview, and the fresh preview re-plans from the world as it now is.
That is [preview-id-claim-and-recall](./techniques/preview-id-claim-and-recall.md).

## Failed is a claim; unknown is the honest default

A write that was refused by the remote system (a permission error, a validation
error, a precondition mismatch) failed, and the tool knows it did not land. A write
whose request was sent and whose answer never arrived, whether a timeout, a reset,
or a kill after send, has an **unknown outcome**. Calling it "failed" is the most
expensive lie available to this kind of tool, because "failed" reads as "safe to
send again", and the second send is exactly the duplicate or the stale overwrite
the rest of the subject exists to prevent. The tool does not retry such a write on
its own: the person is the only party who can decide to send it again, after
reading the remote state. The classification of errors into refused, unknown and
transient, and the wording that goes with each, is
[unretried-write-unknown-outcome](./techniques/unretried-write-unknown-outcome.md),
resting on [unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value).

## The remote system is the last guard

Re-planning narrows the stale window to the gap between the confirm's own read and
its send. It does not close it. The remote system closes it, if the write tells it
what the writer believed: a last known commit id on a file update, an entity tag on
a conditional request, a resource version on an update, an expected revision on a
lease-protected push. With the token, a write over a state the plan did not see is
refused by the system that owns the state, and the tool reports a refused write
rather than a silent overwrite of someone's revoke. The rule is strict: a write that
can carry a token always does, and a write whose token the read did not return is
**not planned at all**. Creations, which have no prior state to name, are guarded
by a post-condition instead: the thing the write made is read back and checked to be
what the plan intended. That is
[precondition-token-on-every-write](./techniques/precondition-token-on-every-write.md).

## Where this subject stops

The confirm's *strength* is not this subject's ground. How heavy the confirmation
should be, a plain click for retrying a job and a type-the-name for deploying to
production, and the fire-then-watch contract that keeps a monitor from painting an
optimistic outcome, belong to
[cicd-monitoring](../cicd-monitoring/cicd-monitoring.md) and its blast-radius ladder.
This subject owns what the confirm is *bound to*: whatever its strength, a confirm
here authorizes one digest of one set of exact commands, and the machinery that
keeps that authorization from being spent twice or on a different plan. Pick
cicd-monitoring when the question is "how much friction does this action deserve";
pick this subject when the question is "how do I know the click ran what was shown,
once, against the state it was planned on". The pause itself, its pending state and
its decision record when a machine rather than a person proposes the write, is
[hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md);
this subject begins after a person has decided and ends when the tool can say what
the remote system now holds. Exactly-once processing of a queue of work, atomic
claiming in general and idempotency keys minted for retry, are
[delivery-guarantees](../../../backend-platform/work-execution/delivery-guarantees/delivery-guarantees.md)
and [concurrency-guards](../../../backend-platform/work-execution/concurrency-guards/concurrency-guards.md);
the preview id here is a specific use of those ideas, keyed by content and scoped to
one person's confirm, and the general theory stays with them.

## Failure modes of the naive reading

The plan shown and the plan sent have different authors, so they drift. The confirm
trusts a plan carried by the client, so a tampered or merely stale client sends
something the server never showed. The confirm re-plans silently, so the person
authorized the old world and the tool acted on the new one. The command is recorded
after it is sent, so a crash leaves an effect with no line. A lost answer re-enables
the button, so the second click duplicates the first. A timeout is labeled failed,
so the person retries a write that had landed. An update carries no precondition,
so a write planned seconds ago lands over a change the person never saw. Each of
these is one missing rule above, and each is invisible on the day it is introduced.
