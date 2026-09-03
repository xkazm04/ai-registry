---
layer: technique
type: technique
subject: node-boot-and-declarative-bootstrap
technique: config-objects-are-api-immutable
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [a device can be created both from configuration and through the API, an API caller deleted an audit sink the configuration created, deciding how startup handles a stored object that configuration no longer declares, a device that writes host paths is creatable by a network principal]
---

# Config objects are API-immutable

Some kinds of object in a stateful node can be born two ways: declared in the configuration
file the process reads at start, or created by an API call while it runs. Audit sinks, plugin
registrations, listeners and mount-like attachments are the usual kinds. This technique
gives the configuration-born population its own record type, makes every API mutation path
consult that type and refuse, and defines reconciliation at start and reload so that a
disagreement between the file and the store is always loud.

## Why two provenances need two types

The naive design stores both populations under one record type and one key space, because
they are the same kind of object and the code that uses them does not care where they came
from. Three things go wrong. An API principal can delete or alter an object the operator
declared in configuration — the audit sink that was supposed to be always-on is removed by a
compromised or careless token, and the node runs unaudited until the next restart recreates
it. Startup cannot tell whether a stored object it does not find in configuration was removed
from the file (and should be deleted) or was created through the API (and should be kept).
And, the most consequential: some of these objects act on the host — a file sink writes to a
host path, a socket sink connects to a host-local address, a plugin registration spawns a
host process. Creating one is a system-operator privilege, and an API that grants it to a
network principal has converted an API credential into host access. The record of what the
API may touch must be a property of the object, not a policy someone remembers to write.

## The record type

Configuration-born objects are stored with a distinct type discriminator — a separate record
kind, a separate key prefix, or a typed field that every consumer reads — and the
discriminator is a closed vocabulary with one definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)). The
provenance is not inferred from the object's name, not looked up in a side table, and not
reconstructed by re-parsing the configuration at request time; it travels with the record so
that every boundary that acts on the object can branch on it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). The rule:
**every API path that alters, disables or deletes an object of this kind reads the
discriminator first and refuses with a distinct error when it says configuration-born.** A
read path may return both populations, marked, because listing what exists is not a
mutation. The failure mode of inferring provenance is a rename: an operator renames the
sink in the file, the API-born object with the old name is now unmarked, and it is deletable.

The refusal names the reason and the remedy: *this object is declared in configuration;
change the file and reload*. An error that says only "forbidden" sends the operator to
policy, which is the wrong layer.

## Reconciliation at start and on reload

The configuration is the authority for its own population. At start and on every reload the
node compares the declared set against the stored configuration-born set and resolves each
difference in exactly one way. A declared object with no stored record is created. A stored
configuration-born record with no declared object is removed — the operator deleted it from
the file, and keeping it would resurrect a device the operator meant to retire. A declared
object whose stored record differs in options is resolved per kind, and the kind's rule is
stated once: either the record is updated to match the file, or — for a device whose
options cannot change under a live handle, an audit sink among them — the difference is a
**refusal at startup that names the field, the stored value and the declared value**, and
the operator's move is to remove and re-add. What the kind may never do is keep the stored
options and report success. A declared object
whose name collides with an *API-born* record is a conflict, and a conflict **fails startup**
and **fails the reload** with the name and both provenances — never adopts the API-born
object into configuration, never overwrites it, never picks whichever code path ran last.

The naive reading is "configuration wins": overwrite whatever is there. Its failure mode is an
operator who created an audit sink through the API months ago, an unrelated operator who adds
a sink of the same name to the file, and a restart that silently replaces the first sink's
options with the second's. A node that fails to start with a two-line message costs a restart;
a node that starts and audits to the wrong path costs the audit trail. The decision rule:
**when the two authorities disagree about one name, stop; when they disagree about existence,
the file decides for its own population and only its own.**

Reconciliation on reload is what makes this class of object reloadable at all: the file is
re-read, the declared set is recomputed, and the same three resolutions apply. Where an object
is *held* — a listener bound to a port — its reload class is restart-only and reconciliation
reports it as such; the partition rule is the sibling technique's.

In a replicated deployment reconciliation is an act of the node that can write. A replica
that cannot write runs the same comparison and **warns** on every difference instead of
acting, and its warning says why it may be a false positive: the replica's view of stored
state lags the writer's, and a device the writer just created looks, for a moment, like one
the replica's configuration does not declare. The naive reading has every node reconcile;
its failure mode is a replica whose stale view deletes a device the writer created seconds
earlier, or a replica that fails to start because its configuration file is one deploy
behind the writer's.

## The privilege argument, stated once

Because these objects act on the host, the only principal who may create them is one who
already holds the host: whoever can write the configuration file. That principal can already
replace the binary, so allowing them to declare a file sink adds no privilege. A network
principal holding an API credential does not hold the host, so allowing them to create the
same object adds exactly the privilege of writing to arbitrary host paths. The record type is
the mechanism by which that argument is enforced rather than remembered, and the API's
refusal to create objects of a host-acting kind at all — not just to alter configuration-born
ones — follows from the same argument for kinds where every instance acts on the host.

## When not to use this

Objects with no host effect and no always-on expectation — a role, a policy, a rate limit —
are ordinary API objects, and if configuration seeds them it does so through the once-only
bootstrap chain, after which the API owns them. The record type is for objects whose
continued existence is an operator commitment or whose creation is a host privilege; giving
every seeded object a configuration-born type turns the file into a desired-state controller
and takes the API away from the people it was built for.
