---
layer: technique
type: technique
subject: workflow-property-contracts
technique: contract-driven-adapters
status: forged
laws:
  - verdict-survives-boundary
shared_with: []
use_when: [writing a federated client or a candidate generator or an annotation host over workflows it did not author, reviewing an integration that reads config keys directly, a host must alter a workflow it was handed]
---

# Contract-driven adapters

A host is any program that runs someone else's workflow on its own terms: a federated
client that trains it for a round and returns weights, a generator that emits
candidate variants and trains each to rank them, an annotation tool that runs
inference on a request. The technique is a discipline for how such a host is written:
**against property names, and only property names**. The table is the whole coupling.
A host that knows a config path knows one author's layout, and it will meet a second
author within the month.

## The shape of a host

A host receives a location — a directory, a package, an identifier a zoo resolves —
and does the following, in order. It creates the workflow from the location, naming
the kind it wants (training, inference). It runs the check and reads the report. It
sets the names it must — the number of epochs for this round, the root the workflow
should resolve its files against, the data source it is substituting. It reads the
names it needs — the trainer, the evaluator, the network. It initializes, runs,
finalizes. Every one of those operations is expressed through a name in the table or a
verb in the consumer sequence, and none reaches into the document.

The report from the check is the host's first decision point, and it must reach the
host as a list of names — a typed value the host can branch on — rather than as a log
line or a boolean. A host that gets "check failed" cannot tell a missing network from
a miswired evaluator, and the two want different responses: the first is fatal, the
second may be tolerable for a host that never validates
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). A host
that gets the list decides per name.

## What a host may change, and how

Hosts routinely need to alter the workflow they were handed. A federated client must
prevent a checkpoint loader in the workflow from overwriting the round's global
weights with a local file. A candidate generator must substitute the data source. An
annotation tool must replace the input path per request. The rule: a host alters a
workflow through a **name the table defines or a marker the workflow's language
reserves**, never by editing the document by path. Setting the data-source property is
a name. Flipping a reserved disabled-marker on every component of a known kind is a
marker. Deleting the key at a path the host remembered from one author's config is
neither, and it will delete nothing in the next author's config while reporting
success.

Where the alteration the host needs has no name and no marker, the fix is to add one
to the table or the language, not to reach around them. Every such reach is a
per-author special case that the host now maintains forever.

## The test of a host

A host is contract-driven when a workflow rewritten from a document to a class, or
from one document layout to another, passes through it unchanged. That is a test worth
automating: two workflows honouring one table, one config-backed and one code-backed,
driven by the same host, producing the same run. A host that passes it can be pointed
at a zoo; a host that fails it is coupled to whichever workflow it was developed
against, and its adoption ceiling is that workflow's author.

The corollary is that a host's failures are reported in the contract's terms. "Required
property `trainer` has no provider" is a message the workflow author can act on.
"Key error at the fourth handler" is a message about the host's private assumption,
and it teaches the author that the host is fragile rather than that their workflow is
incomplete.

## Decision rules

When a host needs something from a workflow, look in the table first; if the name is
there, use it. When it is not there, add it to the table — with the required flag if
the host cannot proceed without it — and then use it; do not read the config. When a
host must remove or disable a component, use the language's reserved disabled marker
on components matched by kind, not by path. When a host substitutes a component — a
data source, a network — set the property, and let the workflow's own resolver wire it
wherever that author's layout consumes it.

When the check's report is non-empty, decide per name, because required and optional
findings mean different things and the host may tolerate some of the second. When the
check could not run at all, treat that as fatal, not as clean.

Do not write a host for a single workflow the host's author also owns; the contract's
cost is justified by strangers. Do not let a host cache the resolved object across
workflows — the trainer it read from one is not the trainer of the next — and do not
let it hold the workflow's document after creation; a host that keeps the document is
a host that will eventually read it.
