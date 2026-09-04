---
layer: technique
type: technique
subject: federated-client-contracts
technique: contract-driven-hosting
status: forged
laws:
  - gate-sees-target
  - derivation-names-recomputation
shared_with: []
use_when: [writing the initialize and train verbs of a federated client over a workflow contract, a client's round report disagrees with the trainer's counters, a client re-creates its workflow every round]
---

# Contract-driven hosting

The federated host sets and reads the local workflow only through its property
contract — the root it resolves files against, the epoch budget, the trainer, the
evaluator, the dataset descriptors — and accounts for a round on the engine's own
state. The sibling subject states the general discipline that a host touches a
workflow by name and never by path; this technique is that discipline applied to a
round, and it adds the two things a round needs that a one-shot host does not: a
workflow that lives across rounds, and an account of work done that the host did not
write itself.

## Initialize: create once, set the round-invariant names

Initialize creates the workflow from the provisioned directory, naming the kind it
wants — training, with its evaluator if the deployment validates. It runs the
contract's check and treats a non-empty report as fatal for required names, because a
round that starts against a workflow with no trainer fails after the server has
already counted the site in. Then it sets the names that hold across rounds: the root,
so the workflow resolves its files against the site's provisioned directory rather
than the author's; the epoch budget, so a round runs the span the deployment
configured and not the author's default of hundreds. It neutralises the graph. Then
it initialises the workflow a second time, because setting a name and disabling a
component changed the content the workflow's objects were built from, and a workflow
that was initialised once, before the host set anything, holds a trainer built to the
author's epoch count with the author's loaders attached. Only after that second
initialisation does it read the trainer and, if present, the evaluator by name — and
it checks the kind of what it got. The contract guarantees a *name* has a provider; it
does not guarantee the provider is a trainer of the kind this host can drive, and a
host that assumes the kind finds out at the first attribute access inside the round.
A wrong kind is a refusal at initialize, in the contract's terms. It reads the
dataset descriptors by name — the data directory, the training and validation
descriptor lists — for the statistics verb, which is why those descriptors are
properties at all: the host that computes summaries could not otherwise find the data
without reading the author's configuration.

One workflow object lives for the participant's whole life. Re-creating it per round
re-runs the author's initialisation — which re-loads the checkpoint the host disabled,
re-seeds the sampler, re-allocates the network — and discards the optimizer state that
the next round should continue from. The engine is created once; rounds are runs of
it.

## Train: load, run, count

Train receives the global weights, holds an unmodified copy for the delta, and loads
them into the network the trainer holds — obtained by name, never by reaching into the
trainer's internals for a field the author might have renamed. It sets the round's
epoch budget on the trainer, relative to the epochs the engine has already run, so
that a trainer whose state counts cumulatively runs one more round's worth rather than
re-running from zero or stopping immediately because the budget was already met. Then
it runs.

The account of the round — how many epochs, how many iterations, how many samples —
is read back from the engine's state after the run, not from a counter the host
incremented. The host's counter records what the host intended; the engine's records
what happened, and the two diverge on every abort, every early stop and every
exception the loop caught. The report the platform receives cites the engine
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Where the host must derive
a figure — total samples this round as iterations times batch size — it names the
derivation beside the figure, because a platform that aggregates the figure across
sites will ask how it was computed, and a number that cannot say is a number that
will be added to a differently-derived one
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

Where the trainer counts cumulatively, the round budget is set as current epoch plus
the round's span, and the report subtracts the epoch count at round start from the
count at round end. The host records the start count before running, on the engine,
and never assumes it is what last round's report said.

## Evaluate: the received weights, on the evaluator by name

Evaluate loads the received weights into the evaluator's network — read by name, and
the same network object the trainer holds when the contract wires them so — runs the
evaluator, and returns its metrics through the exchange object. It does not run the
trainer's validation handler, because that handler fires on the trainer's epoch
schedule and evaluates whatever the trainer holds, which after a load is the received
weights only by coincidence of timing.

## Decision rules

When the host needs a name the contract does not have, add it to the contract — the
dataset descriptors are the precedent — and never read the document. When the round's
budget must be set, set it relative to the engine's current count. When the round is
reported, read the engine. When a derived figure is reported, write its derivation in
the same record. When the participant is finalized, release the one workflow; do not
release and re-create it between rounds.

Do not let the host cache a resolved object across initialize calls; a platform that
re-initializes has handed a new directory. Do not set the epoch budget as an absolute
on a cumulative engine after the first round; it will run zero epochs and report
success. Do not report a round from the host's own bookkeeping, however carefully
kept; the platform is aggregating across sites and needs the number the engine can
defend.
