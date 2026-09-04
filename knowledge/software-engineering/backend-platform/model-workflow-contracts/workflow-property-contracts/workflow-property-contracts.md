---
layer: golden-path
type: golden-path
subject: workflow-property-contracts
status: forged
use_when: [a third-party host must drive a training or inference workflow it did not author, deciding what a workflow exposes by name versus what stays private to its config, adding a code-first workflow beside a config-backed one without touching the hosts, choosing where a host may hook a training loop it does not own]
techniques:
  - required-and-optional-property-sets
  - wiring-location-checks
  - attribute-protocol-over-accessors
  - dual-implementation-parity
  - contract-driven-adapters
  - mid-iteration-event-seams
---

# Workflow property contracts

A trained model travels further than its author. A model zoo lists it, an annotation
tool runs its inference, a federated client trains it on data the author never sees, an
automated search generates a dozen variants and ranks them. Every one of those programs
has to *drive* the workflow — set the number of epochs, find the network, swap the data
source, ask for the trainer — and none of them can read the author's code, because the
author is a stranger. This subject owns the interface that makes that possible: a
**named, machine-checkable set of properties** a workflow exposes, a check that tells a
host up front whether an unseen workflow can be driven, an attribute protocol under
which every workflow honouring the contract looks the same to the host, and the event
seams through which a host may observe or react to the loop without owning it.

The naive reading is that the config *is* the interface: a host that needs the network
reads the key the network lives under. That works until the second author lays out a
config differently, and then every host carries a table of per-author key paths that
grows with the zoo and breaks with every rename. The property contract exists to make
the layout private. A host asks for `network` by name; where that name lives in any
particular workflow is the workflow's business, declared once in a table and resolved
by the workflow itself.

## Boundaries

[Pipeline and DAG execution](../../work-execution/pipeline-dag/pipeline-dag.md) executes
an explicit, user-authored graph of dependent steps with human gates on some of them;
the graph is the program, and the engine's job is to honour whatever topology the user
drew. Here the loop is **fixed** — forward, loss, backward, step, repeated — and nobody
redraws it; what varies is what hangs off it. The rule for picking: when the user's
artifact is a topology and the system's job is to run it faithfully, read pipeline-dag;
when the topology is a given and the question is what a stranger may set, read and hook
on it, this subject applies. A training loop that let hosts rewire its stages would
have become a pipeline and lost the property that makes it driveable: a host can
assume the stages.

Declarative object-graph configs own the *language* a config-backed workflow is written
in: how a document denotes a graph of live objects, how references resolve, how
expressions escape the schema, how files merge. This subject owns the *contract* any
workflow exposes regardless of how it was written. The discriminator is whether the
question concerns a config that exists or a workflow that may not have one: a reference
that fails to resolve is that subject's; a required property that has no provider is
this one's, and the answer is the same whether the provider would have been a config
key or a method on a class. The two meet at exactly one point — the config item id a
property record carries — and this subject treats that id as an opaque address.

Federated client contracts describe one host of this contract: the lifecycle verbs a
site-local client honours, what leaves the site, and how the round's global weights
displace local state. That subject consumes the property protocol as a client; it does
not define what the protocol is. When the question is what a federated round does with
the trainer it obtained, read there; when the question is how it obtained the trainer
and how it knew it could, read here.

## The property table is the interface, and the graph is not

A property is a record with four fields: a **name** the host uses, a human
**description**, a **required** flag, and a **location** — the address inside the
workflow's own structure where a provider for this name lives. A fifth field is present
on some optional properties: a **reference location**, the address at which some other
component is expected to *use* this property. The table of such records, one per
workflow kind (training, inference, and so on), is the whole public surface. Everything
a host may touch is in it; everything not in it is private, and a host that reaches
past it has coupled itself to one author's layout and will be broken by the next.

Three consequences follow, and each is a technique. First, the required flag splits
the table into two sets with two meanings: a required property must have a provider or
the workflow cannot be driven at all, while an optional property must be correct *if
anything refers to it* and may be absent otherwise. One check reports both, in one
pass, as a list of names — never as an exception on the first miss, because the host
wants to know everything wrong with a workflow before it decides what to do
([required-and-optional-property-sets](./techniques/required-and-optional-property-sets.md)).
Second, for an optional property the honest check is not "does the object exist" but
"is it plugged into the graph where a consumer expects": a validation dataset that
exists but is not the one the evaluator reads is a check that passed on a proxy. The
reference location is what makes that verifiable; where a consumer's position is
unknowable, the check finds it by kind and reads the argument by name, and only a
consumer with neither a position nor a kind falls under a stated, reported exception
([wiring-location-checks](./techniques/wiring-location-checks.md)). Third, the table is
the one authority for its vocabulary: the documentation of what a workflow exposes is
generated from it, and a host is written against it, so a property added in one place
is added everywhere at once.

## One protocol, many implementations

A host must not be able to tell whether a workflow is a document with a resolver behind
it or a class with methods. That is achieved by routing attribute access through the
table: `workflow.network` consults the property record for `network`, resolves the
location against whatever the implementation holds, and returns the object; assignment
does the reverse. The workflow's own class has ordinary attributes for its own
bookkeeping, and the protocol never shadows those — a name is either a property, and
goes through the table, or an attribute, and does not
([attribute-protocol-over-accessors](./techniques/attribute-protocol-over-accessors.md)).

Once access goes through the table, a second implementation of the same contract
becomes possible: a code-first workflow whose properties are supplied by methods rather
than config keys. The load-bearing part is not that it exists but that it states a
**precedence** — a value the host set, a value cached from a previous resolution, a
value read from metadata, a value the workflow generates on demand — and that a
required property with none of the four is a hard error rather than an empty result
([dual-implementation-parity](./techniques/dual-implementation-parity.md)). A hybrid,
in which the code-first workflow still carries a small config for hyperparameters and
metadata, is the expected shape rather than a compromise: metadata is data, and a
class is a bad place to keep it.

## Hosts are built against names, never paths

Every host of the contract — the federated client, the candidate generator that emits
variants and trains them, the annotation tool that runs inference on request — is
written against property names and nothing else. It creates the workflow from a
location it was handed, runs the check, reads the names it needs, sets the names it
must, and runs. The moment a host reaches for a config path it has stopped being a host
of the contract and become a client of one author. The table is the only coupling, and
the test of a host is that a workflow rewritten from config to code, or from one config
layout to another, passes through it unchanged
([contract-driven-adapters](./techniques/contract-driven-adapters.md)). Where a host
must alter the workflow — disabling a checkpoint loader so a local file cannot override
the round's weights, for instance — it does so through a name or a marker the contract
defines, never by editing the document it was handed.

The consumer protocol is short enough to state as a sequence and to test as one:
create, initialize, check and expect an empty report, get, set, re-initialize, run,
finalize. A workflow that survives that sequence for each of its kinds honours the
contract; a workflow whose check is empty but whose `run` then fails on a missing
component has a check that does not see what it gates.

## The loop owns tensors; everything else is a handler on an event

Below the property table sits the loop the properties configure, and it has its own
contract with the host. The loop owns everything that touches tensors and gradients:
the forward pass, the loss, the backward pass, the optimizer step. Between those stages
it publishes **named events** — forward done, loss done, backward done, model done —
and at the boundaries of an epoch and a run it publishes the usual started-and-
completed pairs. Everything that observes or reacts is a **handler attached to an
event**: checkpointing, logging, metric accumulation, learning-rate schedules, the
trigger that runs validation every so many epochs, and — the part practitioners most
often get wrong — decollation of the batch into per-item records and the
post-processing transforms that need per-item data, which are handlers on the
model-done event registered in that order. Handlers mutate the loop's state and return
nothing; a protocol in which a callback's return value steers the loop has made the
loop's behaviour depend on registration order in a way nobody can read off the config
([mid-iteration-event-seams](./techniques/mid-iteration-event-seams.md)).

This is what makes the loop hookable without being owned. A host that needs to see the
loss every step attaches to loss-done; a host that needs to run a second workflow — a
validator, which is a full workflow in its own right — attaches a handler that calls it
on the epoch-completed event with a stride. The trainer never knows the validator
exists, which is exactly why the validator can be wired after construction and why its
property has a reference location that is an argument name rather than a position in
a list. The cost, stated honestly: handler order is registration order, and two
handlers on one event with an order dependency between them are a defect waiting for a
config reorder to expose it.

## What "done" looks like for this subject

A workflow contract meets the bar when a host that has never seen a given workflow can
create it, learn from one check every required name that has no provider and every
optional name that is present but wired wrong, drive it entirely by name, and cannot
tell whether a config or a class is answering. The check's empty report means the run
will find every component it needs — the check sees what it gates, and where it cannot
see, it says so rather than passing. The documentation of the contract is generated
from the table and never hand-maintained beside it. And the loop beneath is fixed,
publishes its stage events by name, and accepts observers that mutate and never
return — so a host that wants the loss, a checkpoint or a validation run attaches a
handler, and a host that wants to change what the loop *is* has come to the wrong
subject.
