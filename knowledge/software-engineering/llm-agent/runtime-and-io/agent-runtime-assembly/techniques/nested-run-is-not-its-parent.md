---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: nested-run-is-not-its-parent
status: forged
laws: [identity-survives-reuse, one-validation-door, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [an agent run launches another agent run, a subagent shares the parent's thread or conversation id, a callback or hook fires for a run nobody wired it to, a signal receiver resolves an unknown session by its working directory, a child session inherits the parent's session identifiers through the environment, a nested run's tool calls show up in the parent's memory or status]
---

# A nested run is not its parent

A run that starts another run hands the child more than its brief. Every
carrier that makes identity *ambient* for the parent - so that nobody has to
pass it by hand - reaches the child by the same route: identifiers the runtime
put in the process environment, callbacks bound to a context variable, the
thread or conversation id a memory writer keys on, hooks installed for the
whole user rather than for one session. Each carrier was built so that work
*belonging to* a run finds that run without being told. A nested run is not
work belonging to its parent. It is a second actor, and through those carriers
it acts as the first one without anybody having written a line that says so.

This is the reverse of the failure the tracing subject warns about. There,
ambient context fails to follow work across a queue or a pool, and the fix is
an explicit carrier. Here ambient context follows work it should not, and the
fix is an explicit break. Both are true, and the question that tells them apart
is whether the new unit of work *is part of* the current run - a tool call, a
retry, a worker doing one step - or *is a run of its own*, with its own turns,
its own memory, and its own end. A per-tenant scope that a spawned task
inherits as a snapshot is right for the first. For the second it is the leak.

## Where the inheritance lands

Three shapes, one mechanism:

- **Environment identifiers.** A runtime that injects its session id, its
  control-socket path and token, or a pane id into the environment makes every
  descendant process a holder of them. A nested command-line agent that reads
  them either treats itself as a child (a runtime in one fleet tree was recorded
  refusing to register the session and never writing its transcript) or
  addresses the parent's session through them, so "close this pane" closes the
  caller's.
- **Context-variable callbacks.** A framework that binds handlers to the
  current context lets an inner run started inside an outer one fire the
  outer's handlers - its tracer, its streaming sink, its cost meter - with the
  inner run's events. Nobody attached them; the context did.
- **A shared thread id.** A subagent that runs on its parent's conversation id
  so that it can read the parent's context also passes through the parent's
  end-of-turn memory flush, and the parent's durable memory fills with the
  subagent's internal turns.

## The rule at the launch door

The run-starting call is the door
([one-validation-door](../../../../_laws.md#one-validation-door)), and at the
door a nested run is re-rooted:

- **Mint the child's identity at creation, never inherit it**
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
  The link to the parent is a *field* the child carries - parent id,
  originator - not the parent's identity reused.
- **Scrub the whole ambient set, not the variable you tripped on.** Remove
  every identifier the runtime family injects (by prefix, from one list the
  door owns) and add back, by name, only what the child needs. A per-site list
  of three well-known markers is the list the runtime outgrows: the next
  release adds a socket path and a token, and every site that enumerated
  keeps passing them on.
- **Rebind, do not inherit, the in-process carriers.** Start the inner run in
  a fresh context with its own handlers, or state explicitly which of the
  outer's handlers it gets. A subagent on the parent's thread declares whether
  it writes memory, and the default is that it does not.

## The rule at every receiver

The door cannot cover the carriers it does not own: hooks configured for the
whole user fire from every nested process whatever the launcher scrubbed. So
whatever *consumes* run signals needs the same distinction:

- **An identity the receiver has never bound is unknown, not the parent's**
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A
  receiver that falls back from "no row holds this session id" to "the most
  recently active row in the same directory" hands every nested run's tool
  calls, stops and ends to the parent: its memory gains the child's tool
  events, its status flips to idle while it is still running, and an alert
  meant for the child wakes whoever manages the parent.
- **Let a restart announce itself.** A legitimate new identity on an existing
  row does exist - a session cleared or resumed in the same terminal starts
  under a fresh id - and the start event says why it started. Rebind on that
  announcement, and drop the unknown otherwise. A fallback on the ambient key
  stays only for signals that carry no identity at all.

## When the inheritance is right

Work that is part of the run - a tool call, a retry, a worker executing one
step, a background task the run owns - should inherit, and scrubbing it breaks
correlation. Measure before scrubbing on a runtime you do not own: a headless
child of one command-line runtime was launched with a complete, fake parent
identity in its environment and made no connection to the parent's socket and
wrote under a fresh session id, so on that runtime the environment half costs
nothing today - and the receiver half still attributed its hooks to the parent.

## Decision rules

- Ask first whether the new unit is part of this run or a run of its own; only
  the second is re-rooted.
- Mint the nested run's identity at creation; carry the parent as a field.
- Scrub ambient identifiers by family at one door and add back by name.
- Start a nested run in a fresh callback context; a subagent on a shared
  thread skips the parent's memory flush unless it declares otherwise.
- At a receiver, an unbound session id resolves to nothing; rebind a row only
  when the start event announces a clear or resume.
