---
layer: technique
type: technique
subject: concurrency-guards
technique: race-catalog-with-two-histories
status: forged
laws: [count-carries-predicate, silent-state-is-ungoverned, one-authority-per-vocabulary]
shared_with: []
use_when: [concurrency is intended rather than accidental and guards do not describe it, specifying what two colliding operations are each allowed to produce, a concurrent system's correctness lives in prose nobody can test, deciding whether an interleaving is a defect or a legal outcome]
---

# The race catalog, with two histories each

Most of this subject is about the races you do not want: two invocations of one
logical operation, refused by a guard. Some systems have the other kind. A
durable runtime is *designed* to be entered concurrently — a cancel arrives
while a response is settling, a watcher registers while state is publishing, a
second caller joins a pass already running — and there is no guard to add,
because both parties are supposed to be there. What those systems need is not a
refusal. It is a **specification**.

The technique is to write one down: a table of every durable mutation race,
each row naming the pair of operations and **both** legal outcomes.

```text
| Race                                  | Orders                                    |
| cancel vs response settlement         | marker first → normalized "aborted";      |
|                                       | terminal commit first → completed record, |
|                                       | and the later cancel reports a mismatch   |
| watcher registration vs publication   | watcher first → old snapshot plus the     |
|                                       | complete buffered batch; publication      |
|                                       | first → new snapshot without that batch   |
| later effect settles vs earlier one   | the later stages its outcome immediately; |
|                                       | placement waits for the earlier           |
```

Three properties make the table worth more than the prose it replaces.

## Exactly two, and the count is the design constraint

Each row has **two** histories, and that number is not a description — it is the
rule the design is held to.

- **Three or more legal outcomes is a defect**, not a richer contract. It means
  the interleaving window is wider than one commit boundary, so the system has
  states it can reach and nobody enumerated. The repair is to narrow the
  window until the answer is two, not to document the third.
- **One legal outcome is not a race.** Either something already serializes the
  pair — say so and delete the row — or the second outcome exists and was not
  written down, which is the more common case and the reason the audit is worth
  running.

That is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
applied to a specification rather than a metric: *two* is only meaningful
because the predicate — one atomic commit boundary, one pair of operations — is
fixed and stated. A table whose rows have varying arity is measuring nothing.

## The table is consumed by tests, which is what makes it normative

A design document nobody executes drifts, and concurrency prose drifts fastest
because the failure is invisible in the common ordering. The rule is that **the
catalog is an input to the suite**: for every row, both orders are constructed
deliberately — with test-only gating on the commit primitive and controlled
hooks, providers, tools and timers — and both are asserted.

That gives the table a property ordinary design documents lack: adding a row you
cannot construct is immediately visible, and so is deleting a row whose test
still passes. The document and the suite hold each other honest, and neither is
the sole authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The strongest form asserts write *order*, not just the end state

Two interleavings can reach the same final state through different writes, and
the difference is exactly where durability defects live. So the harness worth
building wraps the storage commit primitive in a recording decorator and asserts
the **sequence** of transactions and their contents against the specification's
own transaction tables.

What that catches is a specific and otherwise-invisible class: an effect
admitted before its intent was committed; a settlement that forgot to delete the
auxiliary state its intent created; a progress write that landed after the child
it belonged to had already settled; an outcome staged after the point where
replay stopped being possible. Every one of those leaves correct-looking final
state and a record that cannot be recovered from
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
An end-state assertion sees none of them.

## Where this sits against the guards

The rest of this subject answers *how do I stop this from happening twice*. This
technique answers *what is allowed to happen when both are legitimate*, and the
two are complements rather than alternatives — a system usually needs both, on
different pairs. The discriminating question when you are holding a collision
and do not know which lane it is in:

> Is one of these two parties wrong to be here?

If yes, it is a guard: pick the identity, refuse the duplicate, and the rest of
this path applies ([guard-key-design](./guard-key-design.md) onward). If no —
both callers are entitled, the collision is a property of the design rather
than a bug in it — no guard will help, because there is nothing to refuse. Write
the row instead.

## When not to build one

The catalog costs real effort and it earns it only where the interleavings are
durable and the states outlive a process. For a system whose concurrency is
confined to one process's memory, the ordinary tools — a lock, a single-flight,
an attempt fence — are cheaper and sufficient, and a table of two-history rows
is ceremony. The signal that you have crossed over is that a collision's outcome
is **still observable after a restart**: at that point the interleaving is part
of the data model, and anything part of the data model gets specified.

## Decision rules

- Where two entitled callers can collide durably, write the row before writing
  the code; the enumeration is the design step, not the documentation step.
- Give every row exactly two orders. Three means the window is too wide — narrow
  it. One means it is not a race, or the second order is missing.
- Construct both orders in tests, with gating on the commit primitive rather
  than with sleeps, and treat a row you cannot construct as an unfinished
  design.
- Where durability matters, assert the write sequence and not only the final
  state; that is the only assertion that sees an effect admitted before its
  intent.
- Do not reach for a guard first. Ask whether either party is wrong to be there,
  and only then choose between refusing and specifying.
