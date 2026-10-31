---
layer: technique
type: technique
subject: session-continuation
technique: compaction-checkpoint
status: forged
laws: [silent-state-is-ungoverned, unknown-is-not-a-value]
shared_with: []
use_when: [a continuation mode is dropped after the harness compresses context, deciding what a pre-compaction hook must write, a resumed session forgets its background jobs or its plan anchor, the summariser is the only thing carrying loop state]
---

# Compaction checkpoint

Context compaction is the harness rewriting the model's memory to make room,
usually on its own trigger and rarely while the operator is watching. A
summariser is handed the transcript and asked to keep what matters, and it
does — for the meaning of "matters" that a summariser has, which is prose that
reads as important. Which modes are armed, where the plan anchor points, which
background jobs are outstanding, how many iterations have run: none of those
survive as prose, and every one of them is something the control loop depends
on. After compaction the session is fluent about the task and has forgotten it
was in a loop. This technique treats compaction as an **explicit control
boundary** and ferries the loop's state across it by hand.

## What crosses, and who carries it

The rule is that **nothing the loop depends on crosses compaction inside the
summary.** The harness enumerates the control state that must survive and
writes it itself, at the pre-compaction event, to a checkpoint the
post-compaction start reads back. The enumeration is short and it is closed:

- the **active modes**, with the condition each is waiting for;
- the **loop authority** and its conflict policy;
- the **plan anchor** — the identity of the plan or task record the loop is
  executing against, not its content;
- **background job handles** — the identifiers of any work the session
  started and has not collected;
- the **counters** — iteration count, stagnation and failure counts, stage
  index — because a counter that resets on compaction defeats every rule
  built on it.

Each of these is control state that was, until written, internal to the
session — shaping what the loop does next while readable by nothing outside
it ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
The checkpoint is the conversion into an artifact. Content the model was
reasoning about is deliberately absent from the list; it belongs to the second
channel below.

The neighbour agent-instruction-files owns a different cargo across the same
boundary: the advisory floor — the rules the project hands its agent — and its
context-reset-redelivery technique re-reads that file after every reset. The
two must not be confused. The neighbour restores what the agent should
*believe*; this technique restores what the harness was *doing*. Both must
fire on the same event, and a harness that has one and not the other resumes
with either a rule-following agent that forgot its loop or a looping agent
that forgot its rules.

## When it is written and when it is read

The checkpoint is written at the **pre-compaction event**, before the
summariser runs, from the harness's own control state — never reconstructed
by parsing the transcript, which is what the summariser is about to destroy.
It is also written at every **control transition** — a mode armed or
deactivated, a stage advanced, a job started or collected, a cancel — so
that a compaction whose pre-event hook never fires restores the last
transition rather than nothing, and so the checkpoint never lags the state
it claims to carry.
It is read at the **post-compaction session start**, and the read is **keyed
on the reason the session started**. Harnesses report several start reasons —
a cold open, a clear, a compaction, a resume — and the restore is correct for
exactly one of them. Restoring after a clear resurrects the loop the operator
just discarded; restoring on a resume double-arms modes that never left. The
start hook branches on the reason, and an unrecognised reason is treated as
unhandled, with a diagnostic, rather than as any of the known ones.

The restore is **idempotent and checked against the current generation**.
Running it twice must leave the same state as running it once, so a start
hook that fires twice does not double-arm. And a checkpoint whose generation
is older than the control record's current one — a cancel or a newer arming
landed after it was written — is not applied over the newer state; it is
reported as superseded.

A missing checkpoint on a compaction start is **not** "no modes were active"
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Its
cause is unknown: the pre-compaction write may have failed (the hook threw,
the file was not writable), the event may not have been delivered, the
checkpoint may have been cleaned up or written under another key, or no loop
was armed at all. The honest restore reports a missing checkpoint as exactly
that, without asserting which cause it was, so that a loop silently dropped by a failed write is a visible incident
and not a session that seems to have finished. The restore may then fall back
to the second channel.

## Two channels, neither sufficient alone

The **automatic checkpoint** above is written by the harness and carries what
the harness knows. It cannot know what the model was in the middle of
reasoning about: the hypothesis it was testing, the file it had decided to
edit next, the reason it rejected the obvious approach. The **model-writable
notepad** is the second channel: a small persistent note the model is
instructed to update at meaningful moments — before a long tool call, at a
decision — and which is re-injected after compaction alongside the
checkpoint. It carries working intent that no harness field could name.

Neither channel suffices alone, and the two failures are symmetrical. A
checkpoint without a notepad restores a loop that knows it is looping and has
forgotten why the last three attempts failed. A notepad without a checkpoint
restores a model that remembers its reasoning inside a harness that has
forgotten to enforce anything. The notepad is advisory — the model may not
have written it, and what it wrote may be stale — so the loop never depends
on it; the checkpoint is authoritative and the loop depends on nothing else.
In particular the notepad cannot re-arm control: a note saying "I was in
the keep-working mode" restores the model's memory of the mode, not the mode.
Arming stays with the checkpoint and the explicit arming channel.

## Decision rules

- Enumerate the control state that must survive compaction, closed and
  short; write it from the harness's own state at the pre-compaction event.
- Restore at the post-compaction start, keyed on the start reason; treat an
  unrecognised reason as unhandled.
- Write at control transitions as well as pre-compaction; restore
  idempotently, and never apply a checkpoint older than the current
  generation.
- A missing checkpoint on a compaction start has an unknown cause and is
  reported as missing — never read as "nothing was active", and never
  asserted to be a failed write.
- The notepad never re-arms a mode.
- Keep the harness checkpoint and the model notepad as separate channels; the
  loop depends only on the first.
- Never let the summariser carry anything the loop depends on.

## When not to use this

A harness that raises no compaction event on a given surface cannot
checkpoint there, and the honest posture is to say so and keep sessions on
that surface short enough that compaction does not occur mid-loop — the same
bounded claim the neighbour makes about an uncovered reset surface.
