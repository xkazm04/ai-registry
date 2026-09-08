---
layer: technique
type: technique
subject: durable-agent-operations
technique: recovery-prefix-enumeration
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding how much recovery testing is enough, a recovery suite passes and the first real crash is unhandled, adding a state to a durable operation machine, asserting that writes happen in the specified order]
---

# Recovery prefix enumeration

Recovery is the code least likely to be correct and least likely to be
exercised. It runs when something has already gone wrong, in a process that did
not write the state it is reading, along a path no user request reaches. The
usual quantity of testing it receives is one case: kill a run, restart, assert
it finishes. That case proves recovery works from **one** place, and the
operation has a dozen.

This technique is the case list. It is not general test-harness architecture —
how suites are partitioned, what a fixture costs, which lane blocks a merge all
belong to that subject, and this one assumes them. What is owned here is the
*derivation*: because the durable state is a total value from a closed
vocabulary, the set of states a crash can leave is finite and enumerable, and
the test list is that enumeration rather than a sample of it.

## The case list is derived, not invented

Take the state vocabulary — the same single definition that execution and
recovery both dispatch on
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
For **each** member:

1. construct that state durably, directly, without running the operation up to
   it;
2. close the runtime;
3. reopen it;
4. drive the operation;
5. assert the next durable transition, wait, or terminal result.

Constructing directly rather than driving up to the state matters more than it
looks. Driving to a state means the test only reaches states the driver can
reach in the way the driver reaches them, and the interesting crash states are
the ones a happy path passes through in microseconds. Direct construction also
makes a missing recovery case a compile-or-fixture failure at the moment a new
state is added, which is the only reliable way to keep the enumeration honest as
the machine grows.

The list is therefore maintained by construction: a new state with no case is a
gap the vocabulary itself reveals. That is the payoff for having defined the
vocabulary once.

## Every half-completed prefix is its own case

The sharp rule, and the one most suites get wrong: **invoking recovery twice
from the initial prefix is not sufficient.** Running recovery, letting it get
part way, killing it, and running it again proves that recovery is idempotent
*from where it started*. It says nothing about a crash that lands halfway
through recovery's own sequence of transitions, and recovery is itself a series
of durable transitions, each of which can be interrupted.

So each half-completed prefix is enumerated in its own right: recover to
transition *k*, close, reopen, drive, and compare the outcome against
uninterrupted recovery from the same starting state. The comparison against the
uninterrupted run is the assertion that matters — not merely "it completed", but
"it completed with the same durable result as if it had not been interrupted".

This is what makes the property *interrupting and rerunning gives the same
result* a tested claim rather than a design intention. It is also where the
enumerable-crash-state property is spent: it is only affordable because a crash
lands between transactions and never inside one, so the prefixes are countable.

Two cases belong on the list that teams routinely omit, both trivially cheap and
both real: accept an operation and close **before it is ever driven**, then
reopen and drive; and drive an operation to a terminal state, then reopen and
observe that the immutable result is readable and the operation is gone.

## The other half a state test cannot see: write order

A state test observes states. It cannot observe the *order* in which writes were
committed inside a procedure, and order is precisely where this subject's
correctness lives — an effect admitted before its intent commits is invisible to
every assertion about the state before and after.

So a second tier wraps the store in a **recording decorator** that captures every
transaction's writes in order, runs the ordinary public surface against it, and
asserts the observed write sequence and contents against the specification's own
transaction tables. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target), this tier reads the
thing it gates — the actual commit stream — rather than the state that stream
happened to produce.

What it catches, and what nothing else does:

- an effect starting before its intent commits;
- a settlement that omits its spend row, or that fails to delete the staged
  content it consumed;
- progress or partial-output writes committed after the call they belong to has
  already settled;
- an outcome placed into the record before it was staged, so a crash between
  them would replay a completed effect;
- results materialized out of the required order;
- an identity reserved late, after the effect it was supposed to name;
- scratch state that the terminal transaction failed to delete.

Every one of those is a design invariant that leaves no trace in the before and
after states. Assert write order against a recording decorator, never against a
log file the production code writes — a log is a second proxy, and it will drift.

A third tier follows from the same principle for concurrency: every race the
design has identified is driven in **both** of its orders with commits gated by
the test, and both orders are asserted to produce one of the two legal
histories. A race whose two orders are not both tested has a preferred order,
and the preferred order is whichever one the test runner happened to produce.

## Why this lives with the state machine and not with the test harness

The judgement call is worth stating, because both homes are defensible. The
test-harness subject owns the machinery: suite partitioning, isolation lanes,
fixture economics, which gate a suite blocks. Those apply to this suite exactly
as they apply to any other, and none of them tells you **what the cases are**.

The case list here is not a testing decision at all — it is a corollary of the
durable model. It is derivable only by someone holding the state vocabulary; it
changes when the vocabulary changes; and it is the evidence for the claim the
state model makes. Filing it under machinery would separate a claim from its
proof, and the first consequence would be a state added here with no case added
there. Where it does depend on machinery — how the fixtures are built, what
they cost, where the suite runs — defer to that subject entirely.

## Decision rules

- Derive the case list from the state vocabulary; one case per member, and a
  new member without a case is a failure rather than an omission.
- Construct each durable state directly. Do not reach it by driving the happy
  path.
- Enumerate every half-completed recovery prefix separately, and compare each
  against uninterrupted recovery from the same start — not merely against
  "completed".
- Include accept-then-close-before-first-drive, and reopen-after-terminal, for
  every kind of operation.
- Add a write-order tier over a recording decorator, asserted against the
  specification's transaction tables.
- Drive every identified race in both orders with test-gated commits, and
  assert both legal histories.
- Keep the assertions against the store, never against production logs or
  telemetry.
- When a real incident reveals a state the list did not contain, add the state
  to the vocabulary and the case to the list in the same change.

## When not to use it

An operation with one durable state and one effect has an enumeration of size
one, and writing the machinery to enumerate it costs more than the single test
it produces. The tier is also wasted where the durable model is not total — if
the restart point is a journal that must be folded, the crash states are not
enumerable and this technique has nothing to enumerate. That is worth saying
plainly, because it is the same conclusion from the other end: a design that
cannot list its crash states cannot test its recovery, and the fix is the state
model, not more tests.
