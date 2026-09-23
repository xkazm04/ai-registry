---
layer: technique
type: technique
subject: companion-runtime
technique: host-seam-contracts
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
stage: team
use_when: [a second channel needs the same companion brain, the companion cannot be constructed in a test, deciding what a companion runtime may import from its host, deciding whether the store needs a hand-written double]
---

# Host seam contracts

The seam is the complete list of things a companion runtime asks of the program
it lives in. Its size is the whole design: a runtime that asks for five
capabilities can be hosted by anything that can supply five capabilities, and a
runtime that asks for "the application" can be hosted by that application.

## Enumerate the capabilities, hand them in at construction

The seam is one object, assembled by the host and passed to the runtime when the
runtime is created. Not read from process environment, not looked up from a
global registry, not imported. Construction-time injection is what makes the
list *auditable* — the seam is exactly as large as the object's shape, and a new
dependency cannot be added quietly because it has to be added to the object and
supplied by every host.

For a companion, five capabilities cover the ground:

- **A store.** Read and write the companion's durable state. The seam speaks in
  the runtime's own nouns — identity, memory items, episodes, conversations,
  ledger rows — never in the host's schema. A store capability that exposes
  query text has moved the runtime's data model into the host.
- **A model leg.** Run one request, return the output and what it consumed. Which
  vendor, which model, which credential, and the retry and timeout policy are the
  host's. See [metered-llm-seam](./metered-llm-seam.md) for what this one must
  additionally require of its callers.
- **A turn sink.** Somewhere to emit typed events as a turn produces them. The
  runtime never knows whether the other end is a screen, a socket, a file, or a
  test collector.
- **A pressure source.** The current time, plus the signals that say material has
  accumulated. A clock alone is not enough and a scheduler is too much: the
  runtime asks *what is the pressure*, and the host decides whether that number
  comes from a counter, a queue depth, or a query.
- **An action executor.** Perform one validated action from the catalog and
  report its outcome. The catalog is the runtime's; the doing is the host's,
  because doing is where the application actually lives.

Anything that does not fit those five is a sign that the runtime is trying to be
the application. Notifications, windows, navigation, credentials, background
scheduling, and localization all belong on the far side.

## The rule that keeps the seam from leaking

**A file inside the runtime that imports from the host application has already
broken portability, whatever it says in a comment.** This is the only rule that
can be checked mechanically, and it should be — a dependency direction is
trivially assertable and impossible to maintain by intention alone, because each
individual reach across the line is the shortest path to a working feature and
none of them looks like a decision.

The cheapest assertion is a package boundary rather than a lint. Put the runtime
in its own package or crate and have the host depend on it: build tools that
refuse dependency cycles then refuse every reach from runtime to host, with no
rule to maintain. What they do not refuse is a new edge that forms no cycle — the
runtime depending directly on a lower package the host also uses, most often the
data-access layer. That edge is where "the host's schema" leaks in under a
respectable name, and it needs either an explicit allowed-edges test over the
dependency graph or the store capability in front of it. While the runtime is
still a module *inside* the host's package, nothing the build does can see the
line at all, and an import count is the only honest measure of how far it has
been crossed.

The mirror rule bounds the host's side: the host may not reach *into* the
runtime's internals either. It constructs the runtime, calls its turn function,
calls its cycle function, and reads its typed results. A host that imports a
runtime's internal store helpers to "just check something" has made the runtime's
internals into the host's public surface, and the runtime can no longer be
refactored without breaking an application that never called it.

## The doubles are part of the seam, not part of the tests

Every capability ships with a double the runtime owns: an in-memory store (or,
for an embedded engine, the helper that opens a throwaway instance of it), a
scripted model leg that returns canned outputs and declared usage, a collecting
sink, a settable pressure source, a recording executor. They live with the
runtime because they are the executable definition of the contract — a host
author reads the double to learn what the real one must do, and a change to the
contract that forgets the double fails immediately rather than at the second
host.

The acceptance test is blunt: **the runtime's full behaviour — a turn, an
autonomous cycle, an action proposal, a memory write — must be exercisable with
no interface, no network, no real model and no host process.** If it cannot be,
the seam is in the wrong place, and the specific dependency that prevents it is
the one to move. The lane for it is the runtime's own test runner, in the
runtime's own language; an end-to-end suite that drives the shipped application
is a different instrument with a different job, and its needing the real
application says nothing about whether the runtime does.

The store is the one capability where "double" deserves a second look. When the
production store is an embedded engine that can open a throwaway instance — a
temporary file, an in-memory database — that instance *is* the best double
available: it has the real engine's semantics, and a hand-written in-memory
store will drift from them in exactly the places tests are meant to catch
(ordering, uniqueness, transactions, text comparison). Vendors of data-access
layers say as much: a repository layer purely for substitution carries a
significant implementation and maintenance cost, and tests against the real
engine are needed in any case. So the store capability's return is not
testability where the engine is embedded — it is the runtime's own nouns at the
boundary, and a second host whose storage differs. Where the engine is a server
the runtime cannot open cheaply, the in-memory double earns its place as before.

That return has a precondition: **the whole store is reached through the handle
the test opens.** A companion's store is rarely one engine — a database beside a
directory of documents is the common shape — and the half found through
process-global state (an environment variable, a well-known home directory) is not
isolated by the throwaway instance. Every test in the process shares it, and a
test that clears the variable falls back to the real store. For that half the
capability does pay for testability after all: carry its location on the handle.
Until it is carried there, every writer of the global takes one lock — not one
lock per module that happened to notice the race.

## The second consumer is the proof, and the parity trap is the usual outcome

A seam that has only ever had one host is a hypothesis. The evidence is a second
consumer — a terminal channel, an automation endpoint, a headless driver —
constructed from the same runtime with a different set of capability
implementations. It proves exactly the capabilities it substituted and no
others: a second channel running inside the same host process, reusing that
host's store, clock and executor, proves the turn is callable from a second
mouth, and is silent about whether the runtime could live anywhere else.

The failure to name in advance, because it is what teams actually build: a second
channel that **re-implements** the companion rather than calling it. It assembles
its own prompt from the same sources, reads memory its own way, writes its own
episodes, and is kept aligned with the first channel by a written parity contract
and somebody's attention. It works on the day it ships, which is exactly why it
is believed. Then one side gains a memory tier, or a new fence around untrusted
text, or a changed episode shape, and the other does not — and the divergence is
silent, because both channels still answer, both still write rows, and nothing
compares them. Two implementations of one behaviour are two authorities for one
vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and the drift is always toward whichever copy is edited more.

Two consequences follow. First, a parity contract is a **debt marker, not a
design** — write it down as the thing to remove, with the seam extraction as its
retirement condition. Second, a portability claim tested only by the runtime's
own doubles is a gate reading a proxy rather than the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)): doubles prove the
runtime is *constructible* elsewhere, and only a real second host proves it is
*sufficient* elsewhere. Both are worth having; only one of them is the proof.

## When not to build the seam

A companion with one surface, one channel, and no plans is better served by
keeping the code direct and the dependency direction honest. The seam earns its
cost at the second consumer, at the first time the companion must be tested
without an interface, or when the runtime is expected to outlive the shell it was
born in — and the way to stay ready is not to build the object early but to
refuse the reaches that would make extracting it later a rewrite instead of a
move.
