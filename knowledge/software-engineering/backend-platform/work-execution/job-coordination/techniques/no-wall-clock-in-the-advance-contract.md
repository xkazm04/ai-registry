---
layer: technique
type: technique
subject: job-coordination
technique: no-wall-clock-in-the-advance-contract
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [adding a deadline or time budget to the call that advances durable work, a timeout is being proposed to bound work the caller does not execute, deciding what a runtime may promise about wall time it does not own, a partial-progress return value is being added beside a terminal one]
---

# No wall clock in the advance contract

A durable runtime exposes some call that moves a unit of work forward — `drive`,
`tick`, `step`, `runOnce`. Sooner or later somebody proposes giving it a
deadline: *advance this job, but come back to me within thirty seconds.* It
reads as obvious hygiene. It is the most common way a durable API acquires a
promise it cannot keep.

The rule is that **the advance contract carries no wall-clock budget and no
partial-progress return.** The runtime reports what it durably knows — settled,
waiting on a retry until this instant, waiting on an external handle, needs an
action — and the host decides when to call again. Wall time and process
termination stay with whoever owns the process.

## Why a deadline on this particular call is not a boundary

A deadline is only ever checked where the loop looks at it, which is *between*
transitions. The work that actually consumes the time is the admitted effect —
the provider request, the tool invocation, the hook chain — and it does not
consult the caller's clock. So the sequence that matters is:

```text
check deadline          → still fine
admit the effect        → now uninterruptible from here
the effect runs long    → deadline passes, nobody is looking
the host's own limit expires → the process dies mid-effect
```

The deadline did not prevent the overrun, did not bound the admitted work, and
did not make the effect exactly-once. Recovery from durable state was mandatory
before it was added and remains mandatory after
([gate-sees-target](../../../../_laws.md#gate-sees-target) — a gate that cannot
see the thing it gates is not a gate). What it did add is a promise in the
signature, and callers read signatures.

This is the same principle
[guest-execution-bounding](../../../language-runtime/guest-execution-bounding/guest-execution-bounding.md)
states for embedded interpreters — *a ceiling is enforceable exactly where
something is counted, and nowhere else* — arriving at a different conclusion
because the situation differs in one respect. An interpreter **can** count: it
owns the dispatch loop, so it keeps the ceilings it can enforce and publishes
the uncounted set beside them. A durable work runtime owns no such loop; the
time is spent inside somebody else's call. Where the counted set for this
particular ceiling is *empty*, publishing it honestly and publishing nothing are
the same act, and the smaller API is the better one.

## The cost is not neutrality, it is four new races

Removing the option is not merely tidying. A wall-clock budget in a durable core
has to be reconciled with everything else that schedules, and each reconciliation
is a pair of orders somebody must specify and test:

- **deadline versus retry timer** — the budget expires while a backoff is
  pending; which one owns the outcome?
- **deadline versus effect admission** — the budget expires in the window
  between the check and the admitted call.
- **the partial-progress return versus terminal settlement** — a caller holding
  "yielded" must distinguish it from "settled", and every convenience wrapper
  and event bracket must handle a third shape.
- **safe-boundary checks** — the deadline must be consulted before hooks,
  effects and transitions, which means a check site at every one of them.

None of these races exist if the option does not. That is the actual argument
for removal: not that the feature is useless, but that it is a *durable-core*
feature whose only enforcement lives outside the durable core, and it charges
the concurrency specification for the privilege.

## What the runtime says instead

Replace the budget with facts the runtime actually holds. The advance call
returns a closed outcome set naming the durable situation and, where a wait is
involved, the instant the host may retry:

- **settled**, with the terminal outcome;
- **waiting**, with the reason and — for a retry — the earliest instant at which
  another call can do work;
- **action required**, where a human or an external event must move first.

Every one of those is a durable fact the caller can act on, schedule against, or
persist. A wall-clock budget is not: it is the caller's preference, and the
right place for a preference is the caller's own scheduler, which already has
one. A serving layer that wants a thirty-second slice takes it by *not calling
again for thirty seconds*, which it can do without the runtime's help.

## What this does not say

**Timeouts on the effect itself are correct and are a different thing.** A
provider request should have a request timeout; a tool invocation should have
one; both are enforced by whoever makes the call, at the place the time is
actually spent, and both are inside the counted set. The rule here is about the
*orchestration* call that advances a durable record, not about the leaf calls
that do the work.

**Nor is this an argument against liveness detection.** A lease whose expiry is
evidence of a dead executor ([lease-renewal](./lease-renewal.md)) is a wall
clock used correctly: it is measured by an observer, about a party that is not
running, to reach a conclusion the record can hold. The difference is who is
watching whom. A deadline passed *into* the advancing call asks the running code
to police itself at moments it has already left.

## Decision rules

- Keep wall-clock budgets out of the call that advances durable work. Put
  timeouts on the effects, where the time is spent and where they can be
  enforced.
- Return a closed outcome set of durable facts, and where the answer is "wait",
  return the instant rather than the duration — a duration is only meaningful at
  the moment it was computed.
- Do not add a partial-progress return beside a terminal one. It forces every
  caller and every wrapper to handle a third shape whose only content is that
  the runtime stopped looking.
- When a bound is proposed, ask what counts it and where. If the answer is "the
  loop, between transitions", the bound does not cover the work anyone is
  worried about.
- If the option already exists, prefer deleting it over deprecating it, and
  state the removal as an invariant so it is not re-added by the next person who
  finds its absence surprising.
