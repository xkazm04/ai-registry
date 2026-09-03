---
layer: technique
type: technique
subject: workflow-property-contracts
technique: dual-implementation-parity
status: forged
laws:
  - failure-not-empty-success
  - one-authority-per-vocabulary
shared_with: []
use_when: [an author wants code rather than a config document but the hosts must not notice, defining what a property read returns when several sources could supply it, a required property has no source at all]
---

# Dual implementation parity

A contract with one implementation is a class with a fancy name. The contract earns
its existence when a second implementation honours it — a code-first workflow whose
properties come from methods rather than from a document — and the hosts that were
written against the first keep working against the second without a line changed.
The stance: **offer the code-first implementation, and make its property resolution a
stated precedence** across the several places a value could come from, ending in a
hard error for a required property with no source.

## What a code-first workflow is, and what it still carries

An author who wants to write the training loop in code rather than describe it in a
document still has to expose the same table of names. The properties that are
components — the network, the trainer, the inferer — are supplied by methods the
author writes, one per property, named by convention so the resolver can find them.
The properties that are data — the epoch count, the bundle root, the metadata — are
not well served by methods, and a code-first workflow is expected to keep a small
config for hyperparameters and metadata. That makes it a hybrid, and the hybrid is the
right shape: metadata belongs in a document that can be read without importing
anything, and a class is a poor place to keep a version string.

The parity requirement is on the *surface*, not the substrate. Both implementations
answer the same names from the same table, run the same check, and accept the same
consumer sequence. A code-first implementation that adds a name to its surface which
the config-backed one lacks has forked the contract; the addition goes into the table
or nowhere ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The precedence

A property read on a code-first workflow can be answered from four places, and the
order in which they are consulted is part of the contract because a host will rely on
it. First, a **value the host set** through the attribute protocol: the host's
intent overrides everything, or setting is meaningless. Second, a **cached value** from
an earlier resolution: a component the workflow already built is returned again, not
rebuilt, because a host that reads the trainer twice must get the same trainer.
Third, a **value from the config or metadata** the workflow carries: the epoch count
the author wrote down. Fourth, a **generated value** from the author's method for that
name: the network the author's code constructs on demand, cached on first
construction so that the second read hits the second tier.

The order is set, cached, config, generated, and each tier is consulted only when
every tier above it is empty. Three rules follow. A host's set value must survive
re-initialization — it is the host's intent, and initialization rebuilds the
workflow's internals, not the host's instructions — so set values and cached values
live in separate stores, and only the cache is cleared. A generated value, once
generated, is cached; a method that constructs a new network on every read produces a
trainer that trains one network and an evaluator that evaluates another. And a set
marks the workflow as not initialized, exactly as it does on the config-backed
implementation, so that a read after a set is refused until the host re-initializes
and the cached tier cannot hand back an object built against the old value.

## No source is a hard error, not an empty value

When all four tiers are empty for a **required** property, the read raises an error
naming the property and stating that no method supplies it. It does not return an
absent value. A required property answered with an absent value is the failure that
looks like success: the host proceeds, passes the absence into a trainer, and fails
several layers down with a message about the wrong thing
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). For an
**optional** property with no source, an absent value is the correct answer — that is
what optional means — and the check reports nothing.

The check on a code-first workflow follows the same rule as the config-backed one:
required names are probed for a source across the four tiers, and a required name with
none is reported. Wiring checks generally do not apply, because a code-first workflow
has no document with reference locations to inspect; the report says so rather than
pretending the wiring was verified.

## Decision rules

When an author asks for code because the document language cannot express what they
need — a loop with a custom inner step, a data source that is a service call — offer
the code-first implementation and hold it to the table. When an author asks for code
because they dislike the document, decline: a second implementation carries a
maintenance cost that a preference does not justify. When adding a property, add it
to the table first and then to both implementations, in that order; an implementation
that gains a property the table lacks is the drift the table exists to prevent.

When a host sets a property and then re-initializes, the set value wins; when it
initializes and then sets, the next read is refused until it re-initializes, and then
the set value wins; when it reads, sets, re-initializes and reads again, the second
read returns the set value even though the first was cached. A precedence in which
cached beats set is a workflow the host cannot steer.

Do not build the second implementation before there is a second author who needs it.
Do not let the two implementations diverge in what the consumer sequence does — if
`initialize` on one builds all components and on the other builds none, a host that
reads a component after initialize gets an object from one and a generator call from
the other, and the parity is nominal.
