---
layer: technique
type: technique
subject: federated-client-contracts
technique: graph-neutralization
status: forged
laws:
  - gate-sees-target
  - absent-guard-is-loud
shared_with: []
use_when: [a provisioned training workflow keeps restoring a local checkpoint over the global weights, deciding which components of an authored workflow a federated host must switch off, stating what a site accepts by running an application directory the server sent]
---

# Graph neutralization

A workflow authored to train standalone contains components that a federated round
cannot tolerate, and the host disables them programmatically before the round starts.
The technique names which components those are, how a host finds them in a workflow
whose layout it has not read, why the disabling is unconditional, and what trust the
site has already extended by the time neutralisation runs.

## What must be neutralised

The canonical case is the checkpoint loader. A standalone training workflow restores
its best model at the start of every run — from the last save, from the best
validation score — and that is correct for a workflow that is resuming itself. In a
round it is exactly wrong: the host has just loaded the server's global weights into
the network, and the loader, firing on the run-started event, replaces them with the
site's local optimum from last round. The site trains from the wrong base, returns a
difference computed against a base it did not train from, and the server aggregates
garbage that looks like convergence. The failure is silent because every step
succeeded.

The same class contains any component that writes host-supplied state from a local
source: a learning-rate scheduler that restores its step count from disk, an
optimizer-state loader, an early-stopping handler that carries a best-score across
runs, a data loader that persists a shuffled order. Each overrides something the round
supplied, and each was reasonable when the author wrote it. The discriminator is
whether the component's *input* is something the host set for this round — weights,
epoch budget, optimizer state; if it is, and the component reads that input from
anywhere but the host, it is neutralised.

## How to find them

The host does not know the author's layout, so it cannot disable a component by its
address. It finds components by **kind**: it walks the collections the property
contract names — the trainer's handlers, the evaluator's handlers — and matches each
component's declared type against the kinds it neutralises. For each match it sets the
workflow language's reserved disabled marker on the component's declaration, so that
when the workflow is instantiated the component resolves to nothing and vanishes from
its parent collection. The marker is set on the declaration, before instantiation, not
on the live object after — an already-constructed loader may have registered itself
on an event, and detaching a registered handler is a second mechanism with its own
failure modes.

The host does this on the graph that will actually run, at the moment before it runs,
never on a copy or a cached description: neutralisation that operates on the document
the host was handed while the workflow instantiates from a merged or overridden
version has disabled nothing ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
And because the marker is set on a declaration the workflow may already have resolved
into objects, the host re-initialises the workflow after setting it — the workflow's
content changed, and the objects it holds were built from the content before the
change. After that re-initialisation the host reads the collection back and confirms
the matched kinds are absent, because a marker that was set on the wrong key fails
silently.

## Why it is unconditional

Neutralisation runs by default and is switched off only by an explicit, logged choice.
A host that disables loaders when a flag is set protects the deployments whose
operator knew to set the flag; every other deployment trains from local checkpoints
and reports success. A guard that must be requested is absent where it is needed
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The legitimate
reason to switch it off — a workflow whose author designed the loader to be
round-aware — is rare enough that the operator who has it can say so.

## The trust cost that remains

A federated platform provisions the whole application to a site: the workflow's
configuration, its code, its model definition, and whatever else the directory holds.
The site runs it. Neutralisation removes the components that would override the
round's state; it does nothing about a component written to do harm, and it cannot,
because a component that reads the training data and writes it to a metrics slot is
indistinguishable by kind from one that computes a legitimate metric. What the site
has accepted, by running a provisioned directory, is code execution on behalf of
whoever controls the server, with no human reviewing the directory between
provisioning and execution. That cost is stated in the client's documentation, in the
consortium's agreement, and in the operator's deployment notes — and the client
itself emits it, as a warning at the site every time initialize is about to execute a
provisioned directory, naming the directory and the two mechanisms (unrestricted
component instantiation, expression evaluation) by which the directory becomes code.
Documentation is read once by whoever integrated the platform; the warning is read by
whoever is watching the site's log on the day it matters, which is a different person
in a different year. A client that neutralises loaders and says nothing about the rest
has implied a guarantee it does not give. What a provisioned payload may instantiate when loaded — deserialization
rules, extraction rules — is the supply-chain subject's ground; this technique starts
after those have run and states the cost they do not remove.

## Decision rules

When a component's input is something the host set for this round and the component
reads it from a local source, neutralise it. Find components by declared kind in the
contract-named collections, never by address. Set the disabled marker on the
declaration before instantiation; confirm absence after. Run by default; log the
override. State the residual trust cost where the operator reads, not where the
developer does.

Do not neutralise by removing the component from the document the host was handed;
the document is the author's and the host will need it unchanged next round. Do not
neutralise inference-time loaders in a training round on the assumption they are
inert; an evaluator that restores a local checkpoint evaluates the wrong model. Do not
extend neutralisation to a sandbox — a host that tries to make a provisioned directory
safe by disabling kinds has taken on a job it cannot finish, and the honest posture is
to state the cost.
