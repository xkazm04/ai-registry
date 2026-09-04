---
layer: technique
type: technique
subject: workflow-property-contracts
technique: attribute-protocol-over-accessors
status: forged
laws:
  - one-authority-per-vocabulary
shared_with: []
use_when: [a host reads and sets workflow components by name, two implementations of one contract must look identical to callers, deciding between a getter-and-setter API and attribute access]
---

# Attribute protocol over accessors

A host that drives a workflow wants to write `workflow.max_epochs = 1` and
`trainer = workflow.trainer`, and it wants those two lines to work whether the workflow
behind them is a parsed document or a class the author wrote by hand. The way to get
that is not a pair of accessor methods per property — `get_trainer`, `set_max_epochs` —
but a single attribute protocol in which get and set of any name are intercepted,
looked up in the property table, and routed to the implementation's resolver. The
stance: **the property table is the dispatch table for attribute access**, and the
host's syntax is plain attribute syntax because the table, not the class, decides
what a name means.

## Why not accessors

Accessors couple the host to a method vocabulary that has to be kept in step with the
table by hand. Every property added means a getter and a setter added, on every
implementation, and a host that calls a getter the second implementation forgot is a
runtime failure in the field. Generic accessors — `get("trainer")`, `set("max_epochs",
1)` — avoid that but move the name into a string the host passes, which is fine for a
generic tool and hostile for anything else. Attribute access through the table gives
both: the host writes ordinary code, and the set of valid names is the table, which is
the one authority for it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Adding a property to the table adds it to every implementation's attribute surface at
once, with nothing else to update.

## The protocol

On read of a name: if the name is in the property table for this workflow's kind,
resolve its location against the implementation and return the result; otherwise fall
through to ordinary attribute lookup. On write of a name: if the name is in the table,
record the value as the property's provider — in a config-backed implementation, write
it into the parsed document at the property's location; in a code-backed one, store it
in the set-values tier — otherwise fall through to ordinary attribute assignment.

The fall-through is the part that is easy to get wrong. The workflow class has its own
attributes — the parser it holds, the kind it was created as, its bundle root, its
logging state — and the protocol must never shadow those. The rule: consult the table
*only* for names the table contains; every other name is an ordinary attribute. A
protocol that intercepts every read and asks the table second, with a fallback to
ordinary lookup, is correct; a protocol that tries the table for everything and returns
an empty value for unknown names has turned every typo into a silent `None`.

Three edges deserve rules. A write to a name in the table before the workflow is
initialized must succeed and must take effect on initialization — the host sets
`max_epochs` and *then* initializes, and a set that is lost because the parser had not
been built yet is the most common way a host silently trains for the author's epoch
count instead of its own. A write *after* initialization marks the workflow as no
longer initialized and discards every resolved object, and a read in that state is
refused until the host re-initializes: a set that leaves the old trainer cached beside
the new network is a workflow that trains the wrong model, and a protocol that refuses
the read is the only one that cannot serve it. And a read of an optional property with
no provider returns an explicit absent value, distinct from a read of a name not in
the table, which is an attribute error: the first is a contract-level "not provided",
the second is a programming error, and conflating them hides the programming error.

## The same syntax over two substrates

The protocol is what makes a config-backed and a code-backed implementation
indistinguishable. For a config-backed workflow, resolving a location means asking the
parser for the object at that id, which instantiates lazily on first read and caches.
For a code-backed one, it means consulting a precedence of set, cached, metadata and
generated values. The host sees `workflow.trainer` in both cases. A host that could
tell the difference — because one implementation exposes the parser and the other
exposes methods — has been handed the substrate, and it will use it, and then it is no
longer a host of the contract.

The test of the protocol is a consumer sequence run against each implementation
without modification: create, check, read the required names, set one, re-initialize,
read it back, run. Where an implementation fails that sequence, the failure is in the
implementation's resolver, never in the host, because the host contains no
implementation-specific line.

## Decision rules

When a host needs a component by name, expose it as a property in the table and let
the protocol serve it; do not add a method. When a name is needed by the workflow's
own machinery and not by any host — the parser, the resolver's cache — keep it an
ordinary attribute and out of the table, so the protocol never has to arbitrate. When
a host wants to set a value that is not in the table, refuse it with an error naming
the table rather than accept it as an ordinary attribute, because a host that sets
`max_epoch` (singular) and sees no error has silently done nothing.

Do not use the protocol for a workflow with a single implementation and a single
consumer that is also its author; there the accessor cost is nil and the interception
is indirection with no second substrate to justify it. Do not route the loop's own
runtime state — current epoch, last output — through the table; that state belongs to
the loop's event handlers and changes every step, and a protocol designed for
configuration-time properties is the wrong door for it.
