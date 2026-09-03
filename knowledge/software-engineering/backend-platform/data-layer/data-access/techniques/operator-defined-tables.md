---
layer: technique
type: technique
subject: data-access
technique: operator-defined-tables
status: forged
laws: [one-authority-per-vocabulary, one-validation-door, gate-sees-target]
shared_with: []
use_when: [a non-developer must add a record type without waiting for a release, choosing between a schema-in-code model and a universal document blob, a user-supplied field name is about to reach a data-definition statement, a table exists in the store that no part of the product knows about]
---

# Operator-defined tables

Some products hand the data model to their operator. The person who decides
that there is now a *product* record with a price and a supplier is not a
developer, does not have a deploy pipeline, and expects the change to be live
in the next thirty seconds. The model is therefore a **runtime input**, and
the two obvious implementations both fail the requirement rather than
implementing it.

**Schema in code** — the model as declarations the compiler reads — needs a
release for every change, which is precisely the thing the operator does not
have. It is the right answer for a model developers own, and it is not an
answer to this problem at all.

**The universal store** — entity-attribute-value rows, or one document column
per record — accepts any model at runtime and pays for it forever: no usable
index on any user field, no referential constraint between user records, a
parse of the whole payload on every row of every read, and a store whose
shape is invisible to the engine's own tooling. It looks like flexibility and
is actually the permanent loss of everything the store was chosen for.

## The third substrate: definitions as rows, types as tables

Split the durable state into two planes.

The **definition plane** is ordinary rows in system tables the product owns:
one row per record type (its identifier, its display labels, which optional
capabilities it wants, and how it came to exist) and one row per field (its
type, its owning record type, its validation, its presentation hints, its
ordering). These rows are the model. They are queried, edited and audited
like any other data.

The **content plane** is one real table per record type, created by the host
at runtime from the definition rows, with real typed columns for the fields
and a fixed set of system columns every record type carries — identity,
address, lifecycle state, authorship, timestamps, a soft-delete marker, a
concurrency counter. Adding a field is: insert the definition row, alter the
table, regenerate the validator. Three steps, one transaction where the
engine allows it, no release.

What this buys back, and the reason it is worth the machinery: real indexes,
working foreign keys, a shape the engine's own inspection tools can read, and
no per-row parsing on the hot path.

## The two-tier field model is the decision rule

This is the part that is usually missed, and skipping it produces a design
that degrades into the universal store within a year.

**Sort every field type into exactly two tiers.** Scalar-shaped types — a
short string, a number, an integer, a boolean, an instant, a single choice
from a closed set, an address, a reference to one other record — get a real
typed column, and **these and only these are the queryable set**: filterable,
sortable, indexable, joinable. Structured types — rich text, multi-select,
nested repeating groups, free-form payloads — get a single serialized
document column and are **explicitly not queryable**. That is not an
implementation detail to be quietly improved later; it is the contract, and
it belongs in the type system where a caller meets it.

The rule has teeth only if the refusal is early and typed. A request to
index, filter or sort by a structured field is rejected **at definition
time**, naming the field and its type — not accepted and answered later by a
full scan that reads well in a demo with forty rows.

**The mapping from field type to column type is a total function over the
field-type vocabulary.** Express it as a value keyed by the type enum, so
that adding a field type without deciding its storage is a compile error
rather than a runtime surprise; the enum, the mapping and the queryable set
are one vocabulary with one definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and every consumer — the validator generator, the table builder, the query
surface, the admin form — derives from it.

**Index creation on a user field is opt-in per field.** Indexing every
operator-invented column makes write amplification a function of how many
fields somebody felt like adding, on a schema nobody reviews. The opt-in is a
flag on the field definition, and it is checked against the queryable set at
the moment it is set, so an index on a structured field is unrepresentable
rather than merely unwise.

## Every identifier here is user input reaching a schema statement

Column and table names cannot be bound as parameters in any mainstream
engine, so a design where the operator names the columns is a design where
person-typed text is interpolated into data-definition statements and into
document-path expressions. That is the injection surface of the whole
subject, and it has exactly one defence: **one validation function, called
before any interpolation, on every identifier, without exception.**

- A single conservative pattern — begins with a lowercase letter, then
  lowercase letters, digits and underscores — plus a length cap. Not a
  denylist of dangerous characters; an allowlist of the small set the product
  actually needs.
- One function, one call site policy: the layer that builds statements
  validates, and nothing above it is trusted to have done so
  ([one-validation-door](../../../../_laws.md#one-validation-door)).
- Where a second, looser pattern is genuinely needed (document keys that
  allow mixed case, plugin identifiers that allow hyphens), it is a *named
  second function* with its own documented charset, never a relaxation of the
  first. Two spellings of "validated" that differ by accident is the same
  defect as no validation.

**Two reserved namespaces**, both closed lists checked at definition time:
the system column names every content table already carries, and the record
type identifiers that would collide with the host's own tables or shadow its
own routes. The second is easy to forget and produces a record type that
exists in the store and can never be addressed. One caution about these
lists: they are a vocabulary that grows whenever the host adds a system
column, and a name added to the list later does not retroactively invalidate
the operator field that already took it. Extending the reserved set is a
migration question — find the collisions, decide their fate — not a list
edit.

## Orphan discovery: the tables no query can see

Every ordinary read starts from the definition rows, so a table whose
defining row is gone is invisible to the entire product while continuing to
hold data and continuing to be found by the next schema-wide migration. The
same blindness runs the other way: a definition row whose table creation
failed looks like a working record type until someone writes to it.

The instrument is a deliberate cross-check that observes the store directly
rather than through the definitions
([gate-sees-target](../../../../_laws.md#gate-sees-target)): enumerate the
content plane from the engine's own table listing by the name pattern, list
the definitions, and diff in both directions. Report each side with enough
context to decide — the orphan's row count decides whether it is debris or
somebody's data. Offer adoption (write the missing definition rows from the
table's actual columns) as the primary remedy. Do not auto-drop: an orphan is
evidence, and the failure that produced it has not been diagnosed yet.

## Boundary: the other substrate for a typed model

A typed content catalog can also live in the **module graph** and be checked
at build time — records as declarations, relationships as references the
compiler resolves, integrity asserted before the artifact ships. That model
buys stronger guarantees than this one and is the better choice whenever
developers own the content model, because its authoring friction is paid by
people who were going to run a build anyway. This technique is the other
substrate, and the discriminator is exactly one question: **can the person
who changes the model run a deploy?** If yes, put the model in the build. If
no, the model is data, and everything above follows.

## When not to reach for this

- **The model changes only when developers change it.** Then this design is
  schema-in-code with the compiler removed and a validator generator bolted
  on: all of the cost, none of the reason.
- **The operator only renames and reorders.** Labels, ordering, help text and
  visibility are data in *any* design. Make those fields data and keep the
  shape in code; the expensive part of this technique is the runtime DDL, and
  it buys nothing if no column is ever added.
- **The record types are few and known.** Three types that will always be
  three types are three tables, written by hand, reviewable in a diff.

The standing cost to price before adopting: once the shape is data, **the
store's schema is no longer reviewable in a pull request.** Whatever review
the shape used to get from human readers must be rebuilt as constraints in
the definition plane — the validation, the reserved lists, the queryable-set
rule — because there is no longer a diff for anyone to read.
