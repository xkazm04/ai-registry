---
layer: golden-path
type: golden-path
subject: durable-agent-operations
status: forged
use_when: [an agent run must survive the death of the process executing it, deciding what a restart finds after a crash mid-tool, a parallel tool batch settled out of order and a crash lost the finished results, designing shutdown for an agent runtime, a cancelled operation resumes or repeats work it already did]
techniques:
  - total-restart-point-by-reference
  - intent-mints-the-identity
  - settlement-order-is-not-placement-order
  - two-cancellations-and-a-synchronous-door
  - close-is-a-controlled-crash
  - recovery-prefix-enumeration
---

# Durable agent operations

One accepted unit of agent work — a run, a context compaction, a move to an
earlier point in the conversation — has a lifecycle longer than the process
executing it. The request that started it has returned; the person watching it
has closed the window; the process is deployed over halfway through the third
tool call. This subject owns what must be true at **every point that lifecycle
can be interrupted**: what the durable record says while an outcome is
uncertain, which identities were minted before the uncertain thing happened,
what a restart is allowed to conclude, and what a clean shutdown is forbidden
to write.

The naive design treats an agent turn as a function call with persistence
bolted on: run the loop, write the transcript as you go, and if the process
dies, mark the run failed and let the user try again. Every part of that is
wrong in a way that shows up in production and not in a demo. The transcript
written as you go is a transcript with a hole in it, because the interesting
crash happens *between* two writes. "Mark it failed" is a definite verdict the
runtime has not earned. And "let the user try again" is a design that repeats
side effects, because nothing in the record distinguishes a crash before the
effect from a crash during it.

The principal position is one sentence: **the durable state of an operation is
a total value that names its own next procedure, and every uncertain effect is
bracketed by two commits.** Everything below is those two ideas made
operational — plus the discipline that makes them checkable, which is that the
set of states a crash can leave behind is finite and each one is a test case.

## Where this subject sits, and where it should have sat

The merits placement for this material is the runtime-and-input-output
category, beside the subject that owns how the code around a model call is
assembled. That category is at its child-directory cap, and a corpus rule that
keeps a directory browsable outranks a filing preference. So the subject lives
in orchestration, one category over, and a reader who went looking for it
beside the runtime and did not find it was not wrong about the taxonomy — they
were early.

**The generic durable work record is not this subject.** A different bundle
owns the job: minted identity, a closed status vocabulary, a lease whose
expiry is evidence of a dead executor, per-class recovery verdicts at boot.
None of that is restated here and none of it is linked from here. The
discriminator is what the unit *is*. That subject's unit is work whose
executor may die, and its state is a status plus a position — a column and a
cursor. This subject's unit is an agent operation, whose phases are a provider
stream that may have half-arrived, a batch of parallel tool calls settling in
one order and required to appear in another, a transcript that must stay
source-ordered, and a compaction that rewrites the context the next phase will
read. A status column cannot express any of those, and a cursor over a list of
steps cannot either, because the next thing to do is not "the step after the
last one that finished" — it is whatever the current total state says it is.
The closest neighbour there is the step-position discipline, and it is
genuinely different rather than smaller: a position plus a per-step
re-run-safety declaration is a cursor over a list; what this subject persists
is a state whose *shape* selects the responsible procedure.

**How the runtime around the model call is assembled is not this subject.**
The hook chain, the extension surface, the assembly's identity, what the loop
may hold in memory —
[agent-runtime-assembly](../../runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md)
owns all of it, and three of its techniques sit directly against this ground.
[checkpoint-mode-custody](../../runtime-and-io/agent-runtime-assembly/techniques/checkpoint-mode-custody.md)
owns custody of the durable conversation record and states the representation
choice as a binary: complete state at every step, self-contained and
quadratic, or deltas, linear and not self-contained. That binary is correct
*for a checkpoint that contains the conversation*, and this subject's first
technique is the third option it does not have — because the quadratic term
was never a property of totality, it was a property of what was inside.
[indeterminate-closure-on-interruption](../../runtime-and-io/agent-runtime-assembly/techniques/indeterminate-closure-on-interruption.md)
owns what an interrupted call's record must *say*: a third status meaning the
outcome is unknown and nothing was retried. This subject owns the durable
state that makes that closure computable at all, and cites the neighbour
rather than restating it.
[bounded-projection-of-external-work](../../runtime-and-io/agent-runtime-assembly/techniques/bounded-projection-of-external-work.md)
owns work that is submitted and never polled from the loop; a suspended
provider request awaiting a later fetch is an instance of it, not a new rule.

**Whether the loop keeps going is not this subject.** The sibling
[session-continuation](../session-continuation/session-continuation.md) owns
the continuation fact, the turn boundary, and the cancel path that clears
every guard that could refuse a stop. The discriminator is sharp and is
written on both sides: *that* subject asks whether the loop should continue;
*this* one asks whether an interrupted operation resumes without repeating
what it already did. Its
[ordered-teardown](../session-continuation/techniques/ordered-teardown.md) and
this subject's shutdown technique look like opposites and are not — see below.

**The stream's own ending is not this subject.** Converging every exit on one
finalization, keeping partial output, and rendering a stop honestly belong to
[cancellation-and-finalization](../../runtime-and-io/streaming-output/techniques/cancellation-and-finalization.md).
This subject owns what the *store* holds while the stream's outcome is still
uncertain. And spend belongs to
[usage-ledgers](../../evaluation-and-cost/cost-metering/techniques/usage-ledgers.md);
this subject only insists that the ledger row belongs to the intent, so an
interrupted generation is not free.

Out of scope entirely: which provider is chosen, how the prompt is composed,
the tool protocol on the wire, fleet-level dispatch, and whether a process is
alive.

## The restart point is total, and it is small because content lives elsewhere

After every durable transition, the operation's state is **replaced** with the
complete current state. Not appended to, not diffed against the previous one,
not reconstructed by folding a journal. Recovery reads one value and dispatches
to the procedure responsible for that value; it never infers position from
something that is missing, and there is no history to fold because no history
is kept.

This sounds expensive and is not, because of what is *not* in it. The state
carries bounded policy — the retry allowance, the execution mode, the control
status — and the **identities** of large content, which lives at sibling
addresses the operation owns. A thirty-turn run replaces one value thirty
times and then deletes it, leaving exactly the conversation and the ledger.
Cleanup is deletion, not collection: no garbage collector, no tombstones, no
compaction of the state store, and no sweep that has to decide what is still
referenced.

The storage invariant that falls out of this is the spine of the whole
subject: **no read on a hot path may fold history or infer state from an
absent value.** Where a design finds itself asking "if this field is missing,
we must be at phase four", it has replaced a state machine with an inference,
and the inference will be wrong exactly once, in production, under a crash
nobody reproduced.
[total-restart-point-by-reference](./techniques/total-restart-point-by-reference.md)
owns the representation, the reference discipline, and the argument against
the neighbour's binary.

## Two commits bracket every uncertain effect

A provider request and a real tool call are uncertain effects: the runtime
sends them and then, for a while, does not know what happened. Wrap each in
two commits. The **intent** records, before the effect, that it is about to
happen and which identities its output will occupy. The **settlement** records,
after the effect, the complete output and the next state, together, atomically.

The intent buys something a position cannot: a crash *during* the effect
becomes distinguishable from a crash *before* it. Without it, both are
"still at step N", and recovery must guess which. With it, the durable state
says the effect is pending, and the guess is replaced by a declared policy for
an unknown outcome.

The identity half is the part that is usually missed. Because the output's
identities were minted at intent, a recovered synthetic settlement occupies the
*same* slot the real one would have. Replay does not grow the record; a
transcript recovered twice is the same transcript. And the usage row belongs to
the intent's reservation, so a generation interrupted after the provider began
work is not booked as free.

This does not make arbitrary external effects exactly-once, and a technique
that claimed it would be lying. It makes the *record* exact and the recovery
decision explicit.
[intent-mints-the-identity](./techniques/intent-mints-the-identity.md)
owns the two commits, the four crash positions, and the honest non-goal.

## Completion order and transcript order are two different orders

Parallel tool calls finish when they finish. Their results must appear in the
order the model asked for them. Conflating those two orders costs a repeated
side effect: three calls run, two finish, the third is still going, the process
dies — and the two finished results existed only in memory, so recovery treats
them as unresolved and may run them again. The loss is not a result; it is an
effect that happens twice.

So a result gets a durable state **between** "the effect settled" and "the
result is placed in the transcript": outcome durability follows completion
order, materialization follows source order, and neither waits for the other.
Placement is a prefix flush — a result is placed once every earlier position is
complete or ready — never a barrier at the end of the turn, which would leave
early-placed results existing in two representations at once.
[settlement-order-is-not-placement-order](./techniques/settlement-order-is-not-placement-order.md)
owns the two orders, the flush rule, and the projection obligation the
intermediate state creates for anything with a display.

## A caller's cancellation and the operation's cancellation are not the same thing

Aborting the caller ends that caller's observation and nothing else. Durable
cancellation is a separate primitive that writes a marker. Collapse them and
you get a system where closing a tab kills the work, or where killing the work
requires somebody to be watching it.

The door between "may this effect start" and "the effect started" is one
synchronous expression, with every preparation completed before it. Prepare
inside the check and cancellation can win while preparation is still awaiting,
which admits the effect *after* cancellation was requested. Two orders exist
for every admitted effect and only two, which is what makes the door testable —
and what is behind the door is a closed, enumerated list, not a convention.
The door is not durable state: if the process dies before the cancellation
commits, no cancellation exists, and recovery trusts only the marker.
[two-cancellations-and-a-synchronous-door](./techniques/two-cancellations-and-a-synchronous-door.md)
owns the split, the door, and the catalog.

## Shutdown writes nothing

A graceful shutdown that writes cancellation or synthesizes a terminal state is
a **second recovery path** — one exercised only on clean exits, which is to say
the one that is wrong, because the path exercised on the rare event is the path
nobody has ever watched work. Make close indistinguishable from a power loss
and the single recovery path is exercised by every shutdown; the rare case
stops being rare. Close seals admission, drains what was already admitted,
releases resources, and stops. Reopening finds exactly the restart point a
crash would have left.

This is where two techniques in this registry look like they disagree and do
not. Ordered teardown, next door, governs **guards that can refuse a stop**,
and requires one cancel path that clears every one of them. Close, here,
clears **nothing** — because nobody asked for the work to end. The
discriminator is whether a person requested a stop. When they did, the
teardown discipline applies and this one does not; when the process is simply
going away, writing a cancellation nobody requested invents a verdict.
[close-is-a-controlled-crash](./techniques/close-is-a-controlled-crash.md)
owns the seal, the forbidden writes, and the two conditions under which this
stance is wrong.

## The states are enumerable, so the recovery tests are enumerable

The counterpart obligation of a total restart point is that crash states are
**enumerable — between transactions, never inside one**. That is not a
pleasant property; it is the whole warrant for believing recovery works. For
each durable state: construct it, close, reopen, drive it, and assert the next
transition. And each half-completed prefix is its own case — invoking recovery
twice from the same initial prefix proves only that recovery is idempotent from
one place.
[recovery-prefix-enumeration](./techniques/recovery-prefix-enumeration.md)
owns the derivation of the case list and the writer-conformance tier that
checks write *order*, which no state test can see.

## Failure modes this standard exists to prevent

- **The inferred phase** — recovery deducing where it is from a field that is
  absent, and being wrong under exactly one crash.
- **The journal that must be folded** — a restart point assembled by replaying
  appended entries, whose cost and whose correctness both grow with the run.
- **The guessing restart** — a crash before the effect and a crash during it
  recorded identically, so recovery must choose between repeating a side effect
  and losing one.
- **The growing transcript** — a recovered settlement written under a fresh
  identity, so every recovery adds a record instead of filling the reserved one.
- **The free interruption** — a killed generation booked at zero cost because
  the usage row was going to be written at settlement.
- **The lost parallel result** — a finished effect held only in memory because
  an earlier sibling had not finished, and re-run after the crash.
- **The vanishing call** — a result that disappears from the display between
  its effect completing and its placement, because the projection renders only
  two of the three states it can be in.
- **The tab that kills the work** — one cancellation mechanism serving both a
  caller's disconnect and the operation's end.
- **The door with preparation inside it** — admission checked, then awaited,
  and the effect starting after cancellation was requested.
- **The remembering gate** — an admission refusal that survives a restart, so
  cancellation has two sources of truth and they disagree.
- **The graceful path** — a shutdown that writes a terminal state, exercising
  a recovery path that clean exits reach and crashes never do.
- **The single-prefix recovery test** — a suite that proves recovery works
  from the beginning of the operation and says nothing about the dozen states
  it can actually be found in.

## The techniques

- [total-restart-point-by-reference](./techniques/total-restart-point-by-reference.md)
  — the complete current state replaced at every transition, small because
  large content lives at referenced sibling addresses; no folding, no absent-value
  inference; cleanup as deletion.
- [intent-mints-the-identity](./techniques/intent-mints-the-identity.md) — two
  commits around every uncertain effect, output identities minted before it,
  the four durable crash positions, the metered reservation, and the non-goal.
- [settlement-order-is-not-placement-order](./techniques/settlement-order-is-not-placement-order.md)
  — a durable state between settled and placed; completion order for outcomes,
  source order for the transcript; prefix flush, not a turn-end barrier; and
  what a projection owes the intermediate state.
- [two-cancellations-and-a-synchronous-door](./techniques/two-cancellations-and-a-synchronous-door.md)
  — caller cancellation versus durable cancellation, the synchronous admission
  expression with preparation before it, the closed catalog of what is gated,
  and the gate's deliberate non-durability.
- [close-is-a-controlled-crash](./techniques/close-is-a-controlled-crash.md) —
  shutdown as a sealed drain that writes nothing, so the one recovery path is
  exercised by every exit; what close may not write; and where the stance fails.
- [recovery-prefix-enumeration](./techniques/recovery-prefix-enumeration.md) —
  the case list derived from the state vocabulary, one case per half-completed
  prefix, and the write-order conformance tier beside it.
