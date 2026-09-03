---
layer: golden-path
type: golden-path
subject: declared-process-graph
status: forged
use_when: [declaring a graph of long-lived processes joined by named channels, validating a topology document before any process exists, adding or removing nodes in a running graph, deciding what a node kind may legally declare]
techniques:
  - per-kind-field-whitelist
  - composite-expansion-contract
  - bounded-expansion
  - panic-proof-numeric-fields
  - typed-port-compatibility
  - additive-live-mutation
---

# The declared process graph

A **process graph** is a set of long-lived programs that run concurrently and
exchange messages over named channels, for as long as the system is up. This
subject owns the **document that declares one**: the nodes and their kinds, the
named outputs each node publishes, the named inputs each node subscribes to and
what they are wired from, the optional type annotations on those ports, the
placement intent for each node, and the per-node and per-edge policies. It owns
the whole path from that document to a topology the runtime will accept —
composite expansion, per-kind field legality, cross-node wiring resolution,
numeric-field probing, port-type compatibility — and it owns the rules for
changing that topology while the graph is running.

It does not own what happens after acceptance. Supervising the processes the
document names — spawning them, watching them, killing them, restarting them —
belongs to the subject that owns a child process. The queue that sits on each
edge, its depth and its eviction verdict when a consumer falls behind, belongs
to the sibling subject `edge-queue-policy`. What a consumer is told when an
upstream node dies belongs to `fault-signal-propagation`. This subject stops at
the moment the topology is accepted and hands a validated document to all three.

## A process is not a step, and that difference drives everything

The nearest-looking subject is
[pipeline-dag](../../work-execution/pipeline-dag/pipeline-dag.md), which owns a
graph of **steps**, each with a fate: waiting, running, succeeded, failed,
skipped. Its validation excludes this subject by its own opening, and the
exclusion is not a technicality — three of its checks are actively wrong here.
**Cycles are legal**: a controller that consumes a sensor's readings and
publishes commands the sensor node consumes is a correct design, not a defect,
and a topological sort would refuse the system's most ordinary shape.
**Reachability is meaningless**: a node with no inputs is a source — a device
driver, a clock, an ingest process — and "nothing reaches it" is its job
description, not an orphan report. And a node has **no terminal status to
compute**: nothing here succeeds. The run does not end, so "which node is ready"
is never asked; the only progress question is whether every declared process is
up and every declared channel is carrying. Where the step graph validates a
program whose execution order it derives, this subject validates a *wiring
diagram* whose only order is the order things start in.

The other adjacent subject is the one that owns the **process**: spawn contract,
termination ladder, reaping, liveness, host protection. The seam is the
descriptor. This subject decides *that* a node exists, what kind it is, what
channels it holds the ends of, and where it should run; the process subject
takes that decision and makes an operating-system child out of it, then keeps it
alive. The rule a reader uses: if the question can be answered by reading the
document with nothing running, it is here; if it needs a live child to answer, it
is there. "May this node declare this field" is here. "The child went silent for
forty seconds, now what" is there.

A third neighbour is close in shape and far in purpose: the subject that owns a
**repository manifest**, a versioned contract a codebase carries about itself for
arbitrary readers. Both are declarative documents with a strict shape and a
decision to make about unknown fields, and they answer opposite questions. A
manifest describes an artifact to a reader who arrives with no prior knowledge
and no runtime; this document is an instruction to one specific runtime that is
about to create processes from it. That is why a manifest's evolution rule is
*must-ignore-unknown* and this document's is the exact inverse: an unknown or
misplaced field here is a refusal, because the only alternative is running a
topology the author did not describe.

## The descriptor is the single authority on topology

Nothing in the running system may discover its peers. A node learns the names of
its inputs and outputs from the descriptor, by way of whatever the runtime
injects into it at start; it never scans for publishers, never resolves a name at
first use, never falls back to a default channel. This is the
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)
law applied to a topology: the set of channels is a closed vocabulary, and a
system in which a second copy of it can come into existence at runtime has a
topology nobody can read off any single artifact. The practical payoff is that
the whole graph is checkable while it costs nothing to be wrong — before a
process exists, before a port is bound, before a device is opened.

That is also why **validation runs at the door and the writers are enumerable**
([one-validation-door](../../../_laws.md#one-validation-door)). Every path that
turns a descriptor into processes — the start command, the build step, the
explicit check, a control-plane request — passes the same function over the same
expanded form. A runtime with a fast path that skips validation has a validation
story that holds until someone uses the fast path, and the fast path is what
automation uses.

## Kinds are closed, and each kind consumes a closed set of fields

A node declares a **kind** — a program to launch, a hosted operator, a bridge to
a foreign system, a reference to a composite — and each kind consumes a different
set of fields. The naive reading treats the descriptor as a bag of optional keys
and lets each kind pick out the ones it recognizes. That reading has one failure
mode and it is the flagship failure of this subject: a field the kind does not
consume is **parsed and then discarded**, the document is accepted, the process
starts, and the author's stated intent is silently absent from the running
system. Nothing is logged, because from the parser's point of view nothing went
wrong. The discipline is a per-kind whitelist that refuses the field and names
the kind that *does* consume it
([per-kind-field-whitelist](./techniques/per-kind-field-whitelist.md)) — a
refusal, not a warning, because a warning on a start path is a line of scrollback
nobody reads ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## Composites expand before validation, and expansion is a validation stage of its own

A descriptor that cannot be composed does not survive its second deployment, so
the document supports a **composite node**: a node whose body is another
descriptor, declaring the ports it exposes to the outer graph and hiding
everything else. Expansion happens at load, before validation, and it rewrites
the document — inner node identifiers are prefixed with the composite's own so
two instantiations of the same body cannot collide
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)), inner
wiring is rebound, and the composite node itself disappears.

Two consequences are easy to get wrong and expensive to discover late. First, the
main validator runs on the **expanded** form, which means every check that can
only see the *pre-expansion* form — a field expansion is about to delete, a
composite carrying source fields it has no business carrying — must live inside
the expander, because by the time the validator runs the evidence is gone
([composite-expansion-contract](./techniques/composite-expansion-contract.md)).
Second, expansion is unbounded recursion over documents chosen by the author, so
it needs a depth cap, a size cap, and a containment rule on where a body may be
read from ([bounded-expansion](./techniques/bounded-expansion.md)). A cycle check
over the set of paths already visited feels like the bound and is not one: a
finite set of documents that reference each other in a tree still expands
combinatorially, and nothing about "no path repeats on this branch" caps the
result.

## The validator must survive every document, including the hostile one

A validator that runs inside the control plane and converts a declared duration
or size into the runtime's own representation is one arithmetic edge case away
from being a denial of service that any author can trigger. The rule is that
**every numeric field is probed at exactly the boundary the runtime will later
cross**, during validation, using the same conversion — not a range check that
approximates it, because an approximating check passes precisely where the two
disagree ([gate-sees-target](../../../_laws.md#gate-sees-target)). The
second half of the rule is the one that gets skipped: a value that is accepted
must also **render back to its own textual form exactly**, because a value that
survives parsing but renders lossily comes back as a different value later — and
when the field is a period, a lossy render of a sub-unit value is zero, and zero
is a busy loop that saturates a core for the life of the deployment
([panic-proof-numeric-fields](./techniques/panic-proof-numeric-fields.md)).

## Types on ports are optional, and the gradient is the design

Port type annotations are the one part of the document that must be adoptable
halfway. A graph is written first without them and annotated later, node by node,
so the type system's job is not to prove a whole graph correct but to catch a
real mismatch in the annotated fraction without punishing the unannotated one. An
unannotated port stays dynamic and pairs with anything. A mismatch is only ever
declared where **both** sides say something and the two things they say cannot be
reconciled; where an annotated port meets an unannotated one, the strongest
honest verdict is a warning, and only when the operator asked for strictness.

Two rules keep that from decaying into noise. Compatibility is decided by a
**bounded** search — a chain of declared conversions explored to a fixed small
depth, never a fixpoint — because an unbounded search over a user-supplied
conversion set is the same unbounded-recursion problem the expander has, wearing
a different hat. And a schema the checker cannot fully resolve yields **no
schema**, never a partial one: half a schema is an unknown rendered as a definite
value, and every consumer downstream will read it as the whole truth
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The rules
are in [typed-port-compatibility](./techniques/typed-port-compatibility.md).

## Placement is intent, not a location

A node declares *where it should run* — a named machine, or labels a machine must
satisfy — and the control plane resolves that intent against the machines it
currently has. The document is validated for the shape of the intent, never for
the machine being up: a descriptor that only validates when the fleet is healthy
cannot be checked in a build, and checking it in a build is most of the value.
Placement also decides nothing about transport; which path a message takes
between two nodes is a runtime decision made per message, and belongs to the
sibling subject `data-plane-transport-selection`.

## A running graph changes only by addition

The last thing this subject owns is the mutation path. A graph whose routing
tables are owned by a single event loop can be changed without locks *provided
every change is additive from that loop's point of view*: a new node's tables are
built before anything routes to it, a new mapping is inserted into a table the
loop alone writes, and nothing that is currently being read is mutated in place.
Removal is the hard direction and it is not the inverse of addition — every
dependent of a removed edge is told, as a typed event on its own input stream,
that the edge is closed, *before* the edge is purged; the alternative is a
consumer blocking forever on a channel that no longer has a writer.

Two rules make the difference between a mutation path that works and one that
lies. A mutation commits **only on its own typed reply variant**: accepting any
successful-looking reply as proof that the change landed is a documented bug
class, because the control plane's generic acknowledgement means "your request
was received", and the code that treats it as "your node is running" has erased
the verdict it needed ([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).
And the readiness barrier that gates the graph's start is **persisted and
replayed**: a node added late, or restarted, or subscribed after the barrier
already resolved, gets the stored verdict rather than silence — including a
failure verdict, which is never cleared, because a late subscriber that hears
nothing will assume it is early and wait forever. The whole path is
[additive-live-mutation](./techniques/additive-live-mutation.md).

## What "done" looks like for this subject

A descriptor layer meets the bar when: a document with a field on the wrong kind
is refused by name, with the kind that field belongs to stated in the refusal;
a composite is refused at expansion for anything expansion would erase, and the
expansion itself is bounded in depth, in size, and in where it may read from; the
whole validation runs with nothing running and no fleet reachable, so a build can
gate on it; no descriptor an author can write crashes the control plane, and no
accepted duration or size means something different the second time it is read;
an unannotated graph type-checks clean, an annotated one catches a real mismatch,
and a schema that could not be resolved is absent rather than partial; and a node
added to a live graph is either running and routable, or reported as not added,
with no third state in which the caller believes one thing and the loop believes
another.
