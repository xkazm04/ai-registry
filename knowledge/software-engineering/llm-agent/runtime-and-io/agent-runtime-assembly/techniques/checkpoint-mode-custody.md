---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: checkpoint-mode-custody
status: forged
laws: [one-validation-door, unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [choosing between full and delta checkpoint storage, a resumed conversation comes back empty or replays a superseded answer, deciding whether a resume may fork the thread, more than one process opens the same durable thread store]
---

# Checkpoint mode custody

A conversation's durable record is written by the graph engine at every
step, and the runtime chooses the representation. That choice is
consequential in a way that a storage decision usually is not, because one
of the two available representations is not self-contained — and a reader
that does not know which representation it is holding will produce a
plausible, complete-looking, wrong answer. This technique is the custody
discipline around that record: the mode is frozen once per process, every
checkpoint says which mode wrote it, every read passes through one accessor
that gates compatibility, the gate fails closed in the one direction that
would read partial state silently, and a resume that would fork
non-self-contained state is rewritten as a linear write rather than a
branch.

## Two representations, one of them not self-contained

**Full** checkpoints store the complete state — the whole message list and
every channel value — at every step. Each checkpoint stands alone: read it
and you have the conversation. The cost is quadratic in the turn count in
*message references*, because a conversation of N turns writes N
checkpoints each carrying up to N messages; it is quadratic in *bytes* only
when each checkpoint copies message content rather than pointing at
content-addressed blobs, which is the representation most stores default
to. A long-running thread's store under that default grows into the tens of
gigabytes before anyone notices, and the serialization cost grows with it.

**Delta** checkpoints store what changed. Growth is linear, which is the
whole reason to want them. But a delta checkpoint is meaningful only with
its ancestry: materializing the state at a checkpoint means walking every
on-path ancestor and collecting each one's pending writes. The walk is the
store's, defined by the engine's own delta contract, and the runtime must
not reimplement it — a second implementation of the ancestry walk is a
second truth about what the conversation says.

The consequence that drives everything below: **a full-mode reader handed
a delta checkpoint does not fail.** It reads the checkpoint's own channel
values, finds an empty message list — because the messages live in the
ancestors it did not walk — and returns an empty conversation as if it were
the whole one. Nothing raised; nothing logged; the user sees a thread that
has forgotten everything. That is the partial read wearing a valid read's
costume, and it is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
in the runtime's own store: a state the reader could not materialize
rendered as the definite value *empty*.

## The mode is frozen per process, before the graph compiles

The two representations cannot be mixed by accident, so the mode is not a
per-call parameter. It is **resolved once per process** — from startup
configuration — and **frozen before the graph compiles**, because the mode
decides the graph's channel table and the snapshot cadence, and those are
compile-time facts of the graph. A second, different resolution inside the
same process is an error, not a reconfiguration; a runtime that allowed the
mode to change under a compiled graph would have a graph whose channel table
disagrees with its checkpointer.

Where the cadence lives is a deliberate choice. The snapshot cadence — how
often a full snapshot is written under delta mode — belongs in the compiled
graph's channel table, **not** in checkpoint metadata. Stamping it into
metadata would make the compatibility marker's meaning depend on a second
field, and a marker whose semantics move is a marker no gate can trust.

## Every checkpoint carries its marker; one accessor gates every read

Every checkpoint written under delta mode carries a **mode marker** in its
metadata. The marker is the fact the gate reads, and it travels with the
checkpoint, so a store opened by a different process — a different
deployment, a migration tool, an operator's script — can see what it is
holding.

All thread-state access passes through **one accessor**, and the accessor
does three things in order: it injects the marker on write, it runs the
compatibility gate on read, and it materializes state through the engine's
own walk. Per [one-validation-door](../../../../_laws.md#one-validation-door),
the accessor is the door; a raw read of the store — a direct query, a
convenience helper that bypasses the accessor — is the door left open, and
it is exactly the path through which the silent empty read arrives. Hand-
written checkpoints through the engine's raw put are refused for the
mirror-image reason: a checkpoint written outside the accessor has no
parentage the delta walk can follow, and severed parentage breaks every
later materialization on that thread.

## Compatibility is asymmetric, and fails closed in one direction

The gate's rule follows from the representations, not from caution:

| process mode | checkpoint marked | verdict |
| --- | --- | --- |
| full | full (or unmarked, from before the marker existed) | read |
| delta | full | read — a complete state materializes trivially |
| delta | delta | read — the walk is the process's own |
| full | delta | **refuse** |

The refusal is the whole technique. A full-mode process opening a delta
thread is refused with a typed conflict the caller can act on — the thread
exists, the process cannot read it, and the reason is the mode — rather
than served an empty conversation. The other direction stays open because
it is safe: a delta-mode process reading a full checkpoint has complete
state in hand and nothing to walk. Asymmetry is not inconsistency; it is
the gate's shape matching the failure's shape.

The gate sits in a different place for reads and for writes, and the
asymmetry is deliberate. A read gates on the marker of the **snapshot that
came back** — one fetch, and reading the blob is harmless; what is dangerous
is *using* the empty state, and the caller never receives it. A write gates
**before** the write, with its own fetch of the current checkpoint's
metadata, because a write cannot be un-applied and a full-mode write onto a
delta thread has already corrupted the lineage by the time anything could
notice. Cheap where reversal is free, early where it is not.

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), the gate reads
the marker *on the checkpoint it is about to materialize*, not a
process-wide assumption about what the store contains. A store migrated
from full to delta holds both kinds of checkpoint on one thread, and the
gate's verdict is per checkpoint. That is also what makes the migration
smooth: switch the process to delta, and every existing full checkpoint
still reads, every new checkpoint is delta, and no thread has to be
rewritten.

## Degradation is permitted exactly where the representation is self-contained

The accessor materializes state through the compiled graph, and the graph
may be unbuildable at read time — a model configuration that no longer
resolves, a tool server that is down. Under full mode the accessor may
**degrade to a raw read** of the checkpoint, because a full checkpoint
carries complete channel values and needs no graph; the gate still applies
on the degraded path, and the degraded snapshot *labels what it cannot
derive* — pending tasks read as none, thread status falls back to the stored
value — rather than inventing them. Under delta mode there is no degraded
path at all: materialization needs the channel table, and a raw read is the
silent empty conversation. The rule generalizes: a fallback is available
only where the fallback's answer is complete, and a fallback that would
answer partially is not a fallback but the failure with a different name.

The mirror-image rule governs the head write. The state-only mutation graph
that writes a materialized state must be compiled with the thread's
**effective schema** — the schema the assistant graph was actually built
with, including every channel a contributed hook added — because a write to
a channel the schema does not know is silently discarded. A mutation graph
built on the base schema "for simplicity" drops every extension's state on
every rollback and compaction, and nothing reports it. Where the effective
schema cannot be determined because the store that records it is down, the
mutation accessor fails closed rather than selecting the default.

## A resume of non-self-contained state is linearized, not forked

The engine's natural resume is a fork: to regenerate from an earlier turn,
or to continue from a checkpoint the client names, start a new branch at
that checkpoint and proceed. Under full mode the fork is correct, because
the checkpoint carries complete state. Under delta mode it is a lie in
waiting: the branch's ancestors include the **shared parent**, and the
shared parent carries the abandoned sibling's pending writes as well as the
path's own. Materialize the new branch and the answer that was meant to be
replaced comes back — the regenerated turn replays the turn the user asked
to redo.

The correct response is not to fix the walk; the walk is the engine's, and
reimplementing it is the second-truth failure named above. The correct
response is to **not fork**: when a resume would branch non-self-contained
state, the runtime materializes the requested checkpoint's complete state
through the accessor and **writes it onto the current head** as a
state-only mutation — a graph step that overwrites channels and calls no
model — and the run proceeds linearly from the new head. Lineage stays a
line; the superseded turn is behind the head, not beside it; and the
engine's walk, walking a line, is correct by construction.

The rewrite happens **before the graph starts**, at admission of the run —
the run that arrives asking to fork is rewritten into a run that first
overwrites the head and then continues — so that the graph never sees a
fork request in delta mode at all. Rollback flows compose the same way: a
rollback is a head write of an earlier checkpoint's materialized state,
followed by ordinary continuation.

Which checkpoint may serve as the base of a resume is a question in its own
right, and one rule of it belongs here because it is about the state's
completeness: the base must be a **settled** checkpoint — one with no
scheduled next task. A checkpoint with pending tasks is a mid-run snapshot;
resuming from it replays the writes of the node that was about to run. Nor
can message identities alone exclude such a checkpoint, because a hook may
rewrite a message's identity inside the run that produced it, leaving every
earlier checkpoint holding the same prompt under an unmatched id. The
lineage walk that finds the base — ancestry first, chronological scan only
for an explicitly absent legacy link, cycles and dangling parents failing
closed — is the store's replay discipline and sits beside this technique
rather than inside it.

The condition on all of this: it applies where the store's representation is
not self-contained. Under full mode the fork stays, because the engine's
default is correct there and linearizing would discard a branch structure
the user may want.

## Decision rules

- Choose the representation deliberately: full for self-contained
  checkpoints at quadratic cost, delta for linear growth at the price of
  ancestry-dependent reads. Measure the growth before choosing full for
  anything long-lived.
- Resolve the mode once per process from startup configuration and freeze
  it before the graph compiles; treat a second resolution as an error.
- Keep the snapshot cadence in the compiled graph's channel table, not in
  checkpoint metadata.
- Stamp a mode marker on every delta checkpoint; read the marker on the
  checkpoint being materialized, never from a process-wide assumption.
- Route every thread-state read and write through one accessor; refuse
  raw reads and raw puts.
- Refuse a full-mode read of a delta checkpoint with a typed conflict;
  allow a delta-mode read of a full checkpoint. Gate reads on the returned
  snapshot; gate writes before the write.
- Permit a degraded raw read only in the self-contained mode, with every
  underivable field labelled; give the non-self-contained mode no fallback.
- Compile every head write against the thread's effective schema; fail
  closed when that schema cannot be determined.
- Accept only a settled checkpoint as a resume base.
- When a resume would fork non-self-contained state, rewrite it at
  admission as a head write of the materialized state followed by linear
  continuation; do not reimplement the store's ancestry walk.

## When not to use it

A runtime whose threads are short — a handful of turns, then archived — pays
the quadratic cost in kilobytes and gains nothing from delta mode; full
mode, one accessor, and the engine's default fork is the whole design, and
the marker and the gate are dead code. The technique starts to pay when a
thread's lifetime is measured in hundreds of turns, or when more than one
process — a migration, a second deployment, an operator tool — can open the
same store, because that is when a reader can hold a checkpoint it does not
know how to read.
