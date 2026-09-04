---
layer: technique
type: technique
subject: workflow-property-contracts
technique: required-and-optional-property-sets
status: forged
laws:
  - failure-not-empty-success
  - one-authority-per-vocabulary
shared_with: []
use_when: [deciding which names a workflow must provide versus may provide, writing the check a host runs before driving an unseen workflow, generating the contract's documentation from its definition]
---

# Required and optional property sets

A contract that lists every name a workflow *might* expose, all with one status, is
useless to a host: it cannot tell the difference between a workflow that is missing its
network and one that simply has no learning-rate scheduler. The contract therefore
splits its table into two sets with two distinct meanings, and one check reports on
both in a single pass. The stance: **required means a provider must exist; optional
means if anything refers to it, it must be correct** — and the check returns a list of
names, never a first-failure exception.

## The two meanings

A **required** property is one without which the workflow cannot be driven at all: the
network definition, the data source, the number of epochs for a trainer, the inferer
and the input path for an inference workflow. A host that reads the table and finds a
required name with no provider stops before initializing anything, because there is no
run to have. The failure is a hard one — an error naming the property, not a missing
attribute and not an empty value — because an absent required provider is not a value
the host can reason about.

An **optional** property is one the workflow may legitimately not have: a validation
dataset, an evaluator, a validation interval, a key metric, post-processing transforms.
Its meaning is conditional: *if some component of the workflow refers to it, it must be
defined and wired correctly; otherwise it may be absent*. The condition matters. A
check that reports every absent optional property as a finding will report a
correctly-built inference workflow as broken, and the host learns to ignore the
report, which is the same as having no check.

The naive alternative is a single list with a required flag that the check treats as a
filter — report missing required, ignore optional. That loses the second half of the
contract entirely: an optional property that is present but disconnected passes, and
the host discovers it when the evaluator runs on nothing.

## The record carries both meanings in its fields

Each property record has a name, a description, a required flag, and a location — the
address within the workflow's structure where a provider lives. Optional records may
carry a fifth field, a reference location, naming where some other component is
expected to *refer* to this property. The required flag drives the first half of the
check; the reference location drives the second. A record with neither the required
flag nor a reference location is a property the host may read if it wants and the
check has nothing to say about.

The table is written once per workflow kind. A training kind has its table; an
inference kind has a smaller one; a kind that is both carries the union. The table is
the one authority for the names — the documentation of the contract is generated from
it, and a host is written against it, so that adding a property is one edit and not
three ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A hand-maintained list in the documentation beside a code-maintained table in the
workflow is a race, and it is lost precisely when someone adds a property and updates
one of them.

## The check reports, it does not throw

The procedure: iterate the table; for each required name, probe whether a provider
exists and append the name to the report if not; for each optional name with a
reference location, apply the wiring check and append the name if it fails; return the
list. An empty list means the workflow can be driven. A non-empty list is the complete
set of things wrong with it, so the host can decide — refuse, warn, or repair — with
the whole picture in hand.

Two rules make the report honest. First, a probe that cannot run — the workflow's
structure is not yet parsed, the table for this kind is absent — is not an empty list;
it is a distinct outcome, because an empty report means "checked and clean" and
nothing else ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
A check that returns an empty list because it had nothing to check has told the host
the workflow is ready when the host has learned nothing. Second, the check is a pure
read: it instantiates nothing. A check that resolves a property to verify it exists
has run part of the workflow before the host agreed to run any of it, and a slow or
side-effecting constructor turns a preflight into a partial run.

## Decision rules

When a new component becomes something a host must be able to find — a model
converter needs the network, a federated client needs the trainer — add a record with
the required flag set, because a host that cannot find it has no fallback. When a
component is one the host may want but the workflow may lack, add an optional record,
and give it a reference location if there is a canonical place it is consumed; a
reference location on an optional record is what turns "exists" into "is used". When
a required property's provider would be expensive to construct, leave it required and
keep the check a pure existence probe; do not demote it to optional to make the check
cheap.

Do not use two sets when the workflow has one consumer that is also its author: the
contract exists for strangers, and an in-house script that knows its own config has no
host to report to. Do not extend the sets with a third status — "recommended",
"deprecated" — until a host actually branches on it; a status no host reads is a
comment with a schema.
