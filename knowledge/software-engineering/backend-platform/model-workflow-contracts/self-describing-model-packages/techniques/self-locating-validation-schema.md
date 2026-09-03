---
layer: technique
type: technique
subject: self-describing-model-packages
technique: self-locating-validation-schema
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [choosing how a package's metadata is validated by a consumer that has never seen the package's ecosystem, deciding whether to pin a schema by address or by hash, supporting several schema versions in one population of packages]
---

# The metadata names its own schema

A metadata file is validated against a schema. The question is where the
consumer gets the schema from, and the naive answer — the consumer knows,
because it was written by the same people — fails exactly when the package
matters: on a consumer that was not written by those people, or that was
written against last year's schema.

The rule: **the metadata carries, as a field, the address of the schema it
claims to satisfy, and validation resolves that address.** No out-of-band
registry maps package types to schemas; no consumer hard-codes a schema
version; the package says which contract it speaks, per package, and a
generic validator can check it.

## What self-location buys

Two packages built under two schema versions sit in one catalogue. A
consumer that hard-codes one schema rejects half of them or, worse,
validates half of them against the wrong contract and passes. A consumer
that reads the schema address from each package validates each against what
it claims, and can report "this package speaks a version I do not implement"
as a fact rather than a parse error.

The second thing it buys is independence from the reference implementation.
A consumer in another language, or with no access to the package's
framework, fetches the schema at the named address and validates with any
conforming validator. The schema is the definition; the framework's own
validation command is one client of it. That is the doctrine of the
neighbouring repository-manifest subject — the specification ships with the
artifact and the reference runner is a runner, not the definition — applied
to a pointer instead of a vendored copy, and the pointer is the right form
here because a package is small and copied often, and a schema copied into
every package is a schema with ten thousand chances to diverge
(`../../../../_laws.md#one-authority-per-vocabulary`).

## The offline case

An address is only useful where it resolves. A consumer behind a proxy, on
an air-gapped machine, or reading a package three years after the host
reorganized needs a fallback, and the fallback is a **vendored copy the
address identifies by version** — the same schema, cached locally, matched to
the package by the version segment of its address rather than by trusting
the file that happens to be on disk. A vendored copy that is not matched to
the address is a second authority, and it will be the one that is out of
date.

## Pinning by hash

An address names a location; it does not name content. If the schema at the
address changes, every package that named it now validates against
something its author never saw. Where that matters — where validation is a
gate, not a courtesy — the metadata carries, beside the address, a **hash of
the schema bytes**, and the validator refuses when the fetched bytes do not
match. That is the integrity discipline of the signed-artifacts subject
applied to one pointer, and this technique borrows it without owning it.

The decision of when to pin is the decision of what the validation is for.
A catalogue rendering a front page can tolerate a schema that gained an
optional field. A serving container deciding whether to load a model cannot
tolerate a schema that changed what "required" means. Pin when the verdict
has consequences.

## What validation observes

Schema validation confirms the metadata is well-formed. It does not confirm
the model does what the metadata says. The schema check and the forward-pass
check are two gates over two targets — the description, and the network —
and a consumer that treats a green schema check as proof the model runs has
trusted a proxy (`../../../../_laws.md#gate-sees-target`). Report the two
verdicts separately and name what each one read.

## Decision rules

- **When a package is created, the address field is written by the tooling,
  not the author**, and it names the schema version the tooling implements.
  An author-typed address is the one that will point at a draft.
- **When a consumer does not implement the named schema version, say so as a
  distinct outcome** — not "invalid", which means the metadata failed the
  schema, but "unsupported", which means the consumer cannot judge.
- **When the address is unreachable and no vendored copy matches, refuse to
  report valid.** A validator that could not fetch its schema has not
  validated anything, and an empty success here is the expensive kind.
- **When the schema evolves, evolve additively within a version and change
  the address on a breaking change.** A package that names a version has
  named a contract, and the contract must not move underneath it.
- **When a key must be renamed without changing its meaning, the reader
  carries a rename map** from the old name to the new, applied at load
  with a deprecation warning, so a package written under the old name
  still validates and still resolves. The map is one table in one reader,
  which is what keeps it from being a second vocabulary; a rename that
  every consumer handles by its own special case is the drift the address
  was meant to prevent.

## When not to use this

Do not put the schema *itself* inside every package. The address is small,
stable, and versioned; the schema is large and evolves, and a copy per
package is a copy per package to drift. And do not use the schema as a
substitute for the executable check — a metadata file can satisfy the schema
perfectly while describing a network that does not exist.
