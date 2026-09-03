---
layer: technique
type: technique
subject: federated-client-contracts
technique: lifecycle-verb-interface
status: forged
laws:
  - one-authority-per-vocabulary
  - verdict-survives-boundary
shared_with: []
use_when: [designing the class a federated platform will host at each site, porting a site participant from one federated platform to another, a platform integration is reaching into the participant's internals]
---

# Lifecycle verb interface

A site participant is hosted by a platform it does not control, and the technique is
to reduce the participant to a closed set of lifecycle verbs so that the platform
needs to know nothing else. The verbs are **initialize**, **train**, **evaluate**,
**report** (statistics, or the current weights), **abort** and **finalize**. Each takes
one typed exchange object and, where it returns anything, returns one. Everything
that is not one of those verbs — how the data are loaded, which loop runs, what is
logged where — is local detail, invisible across the interface, and therefore free to
change without touching a platform.

## The verbs and their contracts

Initialize receives the platform's context: the site's name, a working directory the
platform has provisioned, whatever handle the platform offers for structured logging.
It builds the workflow, neutralises it, and returns nothing; a participant that trains
during initialize has confused setup with a round and will be called wrong by the
first platform that initializes early. Train receives the global weights and the
round's parameters and trains locally for the configured span; it returns nothing —
the weights are requested separately, so a platform that wants to train and not
collect, or collect without training, can. Evaluate receives weights and returns
metrics, and it must evaluate the weights it received, not the ones the site last
trained; a participant that evaluates its own local model when handed the global one
reports a number about the wrong thing. Report returns what the participant currently
holds: the weights after train, or the dataset statistics for the statistics
participant. Abort is asynchronous relative to train — it is called from another
thread while a round is running — and must set a flag the loop observes at its next
safe point, then let train return; a participant that ignores abort holds the
platform's worker hostage until the round ends on its own. Finalize releases every
resource initialize acquired and is the last call the participant ever receives.

The verb set is a closed vocabulary with one definition, and every key the exchange
object uses — the weight slots, the metric names, the statistics keys, the weight-kind
tag, the filter positions — is likewise a single enumerated vocabulary shared by both
ends. A platform integration that spells a key as a string literal has created a
second copy of the vocabulary, and the two copies drift the day one gains a member
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Layering the participant

The participant is layered, with each layer adding verbs. The base holds initialize,
abort and finalize — the lifecycle every participant has. The statistics participant
adds report for dataset summaries and nothing else; it is deployed before any
training happens, to learn whether sites are commensurable. The training participant
adds train, evaluate and report for weights. A platform hosts whichever layer the
deployment calls for and calls only the verbs that layer declares. The layering
matters because a consortium's first run is almost never training: it is a statistics
round that reveals one site's labels are encoded differently, and that round should
be hostable by a participant that has no training code to misconfigure.

## What crosses the interface

Every argument and every return is an exchange object, never a bare tensor, a
dictionary of the participant's own devising or a platform-specific message. The
exchange object is what lets the two ends validate each other: each slot has a
declared kind, assignment checks the kind, and a description method reports which
slots are populated and how large they are without printing a value. A verb that
returns a bare structure has handed the platform something it cannot validate and
cannot safely log.

Outcomes cross as typed values. A train that was aborted, a train that diverged, an
evaluate that found no validation data — each is a distinct outcome the platform
branches on differently, and a participant that collapses them into a generic
exception or an empty return has left the platform to guess from the message text
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## Decision rules

When a platform integration needs something from the participant that no verb
supplies, add the need to a verb's exchange object rather than exposing an attribute;
an attribute is a second interface that the next platform will not have. When a verb
would need platform-specific behaviour, the platform-specific part belongs in a thin
adapter the platform owns, which calls the verb; the participant never imports the
platform. When abort arrives during initialize, finish initialize and then honour the
abort flag at the first safe point; tearing down half-built state is worse than
building it and releasing it in finalize.

Do not use this interface for a participant that is also the server; the verb set
assumes the loop lives elsewhere. Do not add verbs for convenience — every verb is a
call every platform adapter must make correctly, and six is already the ceiling a
platform author reads in one sitting.
