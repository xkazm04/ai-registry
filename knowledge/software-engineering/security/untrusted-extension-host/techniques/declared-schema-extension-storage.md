---
layer: technique
type: technique
subject: untrusted-extension-host
technique: declared-schema-extension-storage
status: forged
laws: [one-validation-door, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [an extension needs persistence and must not be given schema authority, designing the query surface exposed to untrusted extension code, uninstall leaves data nobody owns]
---

# Declared-schema extension storage

An extension that can store nothing is a formatter. An extension that can issue
schema changes is an administrator of the host's database — it holds the
credential, it authors the migration, and its mistakes are the host's outage.
This technique owns the middle: persistence that an untrusted extension can use
fully, declared in its manifest and realized by the host, with no path from
extension code to the schema and no path from a query to an unbounded scan.

## The shape

One store, owned by the host, partitioned by extension identity. Nothing the
extension writes is addressable without its identity in the key, and the
identity comes from the installation record rather than from anything the
extension supplies — an extension that could name its own namespace could name
its neighbour's.

Within its namespace an extension declares **collections** in its manifest,
each with a small set of **indexes** over named fields. The host creates them
at install, migrates them when a declaration changes, and removes them at
uninstall. The extension receives a narrow data interface — put, get, delete,
and a query bounded by what it declared — and nothing that accepts schema.

The interface offers no free-form query language. Not a restricted dialect, not
a parameterized template, not a builder that composes fragments: a structured
request naming a collection, a set of field predicates, an ordering, and a
limit. The host translates it. This is the same argument the corpus makes about
any renderer at a trust boundary — a closed vocabulary of nodes instead of raw
markup — and it holds for the same reason: every escape hatch that accepts
author-supplied fragments is an injection surface with a friendly name, and the
one thing you cannot do with a structured request is smuggle a second statement
into it.

Because there is one translator and every extension query passes through it,
the validation, the namespace prefixing and the limit enforcement live in one
place ([one-validation-door](../../../_laws.md#one-validation-door)). A second
convenience path added later — a raw hatch for "advanced" extensions — is not a
feature, it is the removal of this technique.

## Enforce the index set; do not document it

Here is the decision rule that gives the design teeth, and the one most hosts
soften: **the queryable set is exactly the declared index set, enforced at the
query door.** A filter or an ordering on a field with no declared index is
**refused**, with an error naming the field and the manifest entry it needs.
Not warned. Not permitted-but-slow.

The reasoning is about what each failure mode teaches. A host that permits
undeclared queries has made index declaration advisory, and advisory
performance contracts are honoured until a deadline. The extension that queries
an unindexed field works perfectly against the author's fifty test records, and
becomes a full scan across every tenant's table at scale — a scan the author
cannot see, the host did not authorize, and the operator experiences as an
unexplained database load with no owner. The refusal converts that into a
development-time error message with the fix in it.

The rule cuts both ways and that is the point: dropping an index from the
manifest must **fail** the queries that used it, loudly, rather than degrade
them into scans. A performance contract that degrades silently is not a
contract, and this is the specific shape of empty success that storage layers
produce — a query that returns the right rows while doing something the system
cannot sustain
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)
applies to the instrument as much as the result: a query surface that never
refuses anything is not proving that every query is fine).

Two corollaries. Every query carries a limit, defaulted by the host and capped
by the host, because an extension that can request unbounded results can
exhaust the host's memory without violating any privilege. And the declared
index set is visible to the administrator at install, because the storage
declaration is part of what the extension is asking for — which leads directly
to the next point.

## Storage is part of the trust contract, and is usually left out of it

A host that documents storage as one of the things an extension declares, and
then omits it from the consent dialog and from the update comparison, has a
declaration with three parts of which two are governed. The gap is easy to miss
because storage does not look like a privilege — it looks like a schema — and
the consent screen was written by someone enumerating capabilities.

It is a privilege. Declared collections consume the operator's database.
Declared indexes consume write throughput on every insert. An update that adds
six collections and a dozen indexes to an extension the administrator installed
for one is a material change to the deployment, and if the escalation
comparison walks only the capability grants, it is a change that ships
silently. **Whatever the extension declares that the host will act on is part
of the consent surface and part of the diff** — the test is not "is this a
permission" but "does the host do something on the extension's behalf because
it is written here".

## Uninstall names the reaper

Every collection the host creates on an extension's behalf is created with a
stated end ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).
Uninstall removes the extension's namespace, and the host asks once whether to
retain the data — because reinstalling an extension whose data was silently
destroyed is a support incident, and reinstalling one whose data was silently
retained is a surprise of the smaller kind. Retained data is retained as a
named, listable, deletable artifact with the extension's identity on it, not as
rows nobody can attribute.

This is the concrete cost the prefixed-table-name convention never pays and
never can. Under that convention the extension runs its own migrations against
the shared database, agreeing to touch only names beginning with its own
prefix. Uninstall then has nothing to remove, because the host never knew what
was created; the tables outlive every extension that made them, accumulate
across years, and become undeletable through ordinary caution — nobody can
prove a table is unused. Declaring the schema is what makes cleanup possible at
all.

## Decision rules

- Partition by an identity from the installation record, never one the
  extension supplies.
- Declare collections and indexes in the manifest; let the host create,
  migrate and remove them. Expose no interface that accepts schema.
- Accept structured query requests only — collection, predicates, ordering,
  limit — translated by the host. No fragments, no dialect, no advanced hatch.
- Refuse filters and orderings on undeclared fields, naming the field and the
  manifest entry that would permit it; make removing an index break its
  queries.
- Default and cap the result limit at the host.
- Include the storage declaration in the consent dialog and in the update
  comparison, because the host acts on it.
- Remove the namespace at uninstall, asking once about retention; keep
  retained data attributable and deletable.

## When not to use it

An extension surface that is purely computational — transforms, formatters,
validators that hold no state between invocations — needs none of this, and
giving it a store is inventing a persistence problem to solve. Extensions that
need only a handful of settings values should get a settings object with a
declared shape rather than a collection interface: it is the same discipline at
a size where a query surface is overhead. The full technique starts to pay when
an extension's data is per-record rather than per-installation.
