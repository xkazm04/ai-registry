---
layer: technique
type: technique
subject: module-design
technique: io-free-core
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [a test must construct several doubles to exercise one decision, choosing between an adapter per dependency and one driver at the edge, logic that must run under more than one runtime or flow-control model, making protocol or workflow logic testable without mocking]
---

# The I/O-free core

[seams-and-adapters](./seams-and-adapters.md) answers "where can this be
substituted" with an interface and two adapters, and then spends a section
keeping the double honest. This technique is the case where that whole
apparatus is the wrong shape: **when a module's job is logic over events —
a protocol, a parser, a scheduler, a retry policy, a workflow — do not wrap
each of its dependencies in a seam. Remove the dependencies from the module
entirely.** The module receives inputs as values, returns outputs as values,
takes the time as a parameter, and performs no I/O, no waiting and no
scheduling of its own. A thin driver at the edge does all of that.

The pattern has several names in the field — a functional core with an
imperative shell, an implementation "without I/O", a pure state machine — and
they describe one structure. What matters here is not the name but the
decision it replaces.

## Why this is not the adapter discipline

An adapter keeps a dependency and makes it substitutable. That is right when
the dependency is a capability with many verbs — a store, a queue, a
container runtime — because the module genuinely needs those verbs and the
question is only who supplies them. The double is then unavoidable, and the
contract suite exists to stop it drifting.

Logic over events is different. A retry policy does not need a clock; it
needs to know what time it is. A protocol does not need a socket; it needs
the bytes that arrived and a place to put the bytes it wants sent. Every
"dependency" of that kind is an input or an output that has been disguised as
a collaborator, and putting a seam in front of it preserves the disguise.
The test then constructs a fake clock, a fake socket and a fake random
source to exercise one branch of one state transition — which is the
"five unrelated things to exercise one" complaint that the
[structural-improvement-loop](./structural-improvement-loop.md) lists as the
most reliable coupling measurement anyone has already paid for.

The I/O-free form deletes the doubles instead of keeping them honest. A test
hands the module a value, advances a number, and reads what came back.
Nothing is mocked because nothing was reached for. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) in its strongest
form: the test observes the logic itself, not a proxy for the environment the
logic runs in.

## The shape

Four properties, and a module has the shape only when it has all four:

1. **Inputs are values.** Bytes received, an event, a command — handed in by
   a call, never fetched by the module.
2. **Outputs are values.** Bytes to transmit, an event for the application,
   a request for something to happen — handed back and *executed by the
   caller*. The module never does the thing; it says what the thing is.
3. **Time is a parameter.** Every entry point that depends on time receives
   the current instant. The module never asks the environment what time it
   is, and it says when it next needs to be woken — a *next deadline* the
   driver turns into a real timer.
4. **Nondeterminism is injected.** Random values, identifiers, anything the
   environment would otherwise supply arrives through the constructor, so a
   test can fix it and a fuzzer can drive it.

The consequence that makes this a design technique rather than a testing
trick: the core becomes indifferent to the **runtime**. The same logic runs
under blocking I/O, under an asynchronous executor, under a different
executor, in a simulation that advances time by assignment, and behind a
foreign-language binding — because none of those was ever in the module.
Choosing the runtime late, or supporting two, is a decision the structure no
longer forecloses.

## The driver is the adapter now

What the seam discipline says about adapters moves, intact, to the driver.
The driver is the one place that touches the socket, the clock and the
executor; it owns the loop — feed inputs in, drain outputs, arm the next
deadline, repeat — and nothing else in the system performs I/O on the core's
behalf. That is [one-validation-door](../../../../_laws.md#one-validation-door)
in the shape this technique produces: all I/O passes through one door, and
the core cannot reach around it because the core has no hands.

Two things follow. The driver is small and boring on purpose; every line of
logic that migrates into it is a line that has left the testable part of the
system, and "the driver got clever" is the decay signature to watch for. And
the driver is where the contract discipline is still needed — a second
driver for a second runtime must produce the same observable behaviour from
the same core, and that is a shared exercise over drivers, not over the
core.

## Decision rule

**Use the I/O-free form when the module's job can be stated as a transition
function** — given this state and this input at this time, produce this
state and these outputs — and at least one of the following holds: the
module must run under more than one runtime or flow-control model; its tests
currently need two or more doubles to reach one decision; or its correctness
is the kind that wants exhaustive or randomized exploration, which a pure
transition function makes cheap and an I/O-bound one makes impossible.

**Use an adapter instead when the dependency is a capability, not an input.**
A module that must read, write, list and query a store is not disguising an
input; it needs a supplier, and a seam with a contract suite is the honest
structure. Forcing that into "return a value that says what to do" produces a
core that emits commands nobody wanted to interpret and a driver that grows
into the module it was supposed to sit beside.

The tell that separates the two cases is the number of verbs. One or two
directions of flow — bytes in, bytes out; event in, actions out — is an
input/output pair pretending to be a dependency. A dozen verbs with
individual semantics is a capability.

## The costs, stated

The form charges its price at the edge, and pretending otherwise is how it
gets adopted for the wrong module.

- **The loop is the caller's.** Every consumer that is not the shipped driver
  must write one, and a loop that mis-handles the next-deadline contract
  busy-spins or stalls in ways that are hard to diagnose, because the bug is
  in the glue and the core is provably fine.
- **Sequential logic becomes explicit state.** A workflow that reads
  naturally as "do this, wait, then do that" has to be modelled as states
  and transitions, and the ergonomic cost of that is real. For logic that is
  genuinely a long sequence with little branching, the readable form is the
  sequential one, and the technique is the wrong instrument.
- **Composition partners are fewer.** A core that performs no I/O cannot
  call a library that does. Its dependencies must be I/O-free too, or they
  move to the driver, and the ecosystem of such libraries is smaller than the
  ecosystem of convenient ones.

## When not to use it

Not for a module with a single runtime, a single dependency that runs fine in
a test, and no exploration need — a seam there is cheaper than a driver, and
a seam nobody substitutes at is already the failure
[seams-and-adapters](./seams-and-adapters.md) names. Not for glue, whose whole
job is the I/O. And not as a retrofit target for a working module whose
tests are fast and whose behaviour is pinned: the form is chosen when the
logic is being shaped, or when the doubles have visibly become the cost, not
because purity is a virtue.
