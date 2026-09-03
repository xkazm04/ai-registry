---
layer: application
type: application
subject: repo-manifest-standard
technique: spec-ships-with-artifact
stack: python
verified_on: 2026-09-02
source_commit: 02201b8600df372cb425f2bb8e0cb7addd0df50f
verified_against: python@3.10
---

# A model package whose metadata file names its own schema, and whose pins are floors

A deep-learning toolkit distributes trained models as a **bundle**: a directory with a fixed layout — a license, a `configs/` folder holding a metadata file, a `models/` folder holding the weights and optional compiled forms, a `docs/` folder — that may be zipped, or embedded whole inside a compiled model container as extra files. The metadata file is the contract, and the tree's specification page states what it must carry. Three of its choices are the technique in this subject, applied to a carried artifact rather than a repository.

## The schema travels inside the file

The metadata file carries a `schema` key whose value is the address of the JSON schema it claims to satisfy, and the toolkit's `verify_metadata` command validates the file against exactly that schema. A consumer that has never seen this toolkit can fetch the schema the file names and validate it with a generic validator; a consumer offline can validate against a vendored copy the file identifies by version. The specification is not "somewhere in the docs"; the artifact points at it, per artifact, so two bundles built under two schema versions each say which one they mean.

## Version pins are floors, and the contract says so

The required keys pin the versions of the toolkit, the tensor engine and the array library the bundle was *generated on*, and the specification states the semantics in one clause: *later versions expected to work*. A pin is a floor, not an equality, and the file's own `required_packages_version` map names the extras the bundle absolutely needs beyond the base requirements. That is `must-ignore-unknown`'s sibling in the version dimension: a reader newer than the writer is expected to succeed, and the writer records what it had rather than what the reader must have.

## The contract describes inputs as constraints, not examples

Input and output tensors are declared with a type, a format from an open vocabulary, a channel map in plain language, a value range, and a **spatial shape written as expressions**: a literal size, `*` for any, or an expression in one-letter variables shared across dimensions — `"2**p*n"` for "a multiple of a power of two", with the same `p` binding every axis that names it. A model with a divisibility requirement states it as a rule a program can check, instead of shipping one example shape and hoping the reader infers the family. The file also separates the network's raw outputs from `post_processed_outputs`, so a consumer knows whether the labels it receives are what the network emitted or what the bundle's own post-processing produced.

## What the tree says about the technique

The technique is written for a repository's manifest; this tree applies the same three rules to an artifact that leaves the repository and is consumed by programs its author never meets — a model zoo, an annotation tool, a deployment container, a federated-learning client, all named in the tree as bundle consumers. It confirms the rules and stretches the subject's stated scope, which is "a contract a repository carries about itself": the source note records that stretch as a candidate boundary change rather than assuming it.

## What this realization cannot do

The metadata contract is checked by a schema and by a properties list per workflow type, but the config files beside it evaluate expressions and imports at run time; the contract describes the model, not the safety of the program that runs it. And the shape expressions are validated syntactically, not proven against the network — a bundle can declare a divisibility rule its network does not actually need, and nothing in the tree would notice.
