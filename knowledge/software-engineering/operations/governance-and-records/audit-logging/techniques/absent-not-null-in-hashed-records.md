---
layer: technique
type: technique
subject: audit-logging
technique: absent-not-null-in-hashed-records
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [adding a field to a hash-chained or digested record that already has history, a reader meets a record key it does not know, several programs write, import or verify the same chain]
---

# Absent, not null, in hashed records

A digested record is verified by recomputing its digest from what is stored,
and the recomputation runs through code: a parser that rebuilds the record, a
serializer that canonicalizes it, a type that decides which keys exist. Every
one of those programs is part of the proof. So the schema of a hashed ledger
cannot evolve the way an ordinary table's does — by adding a nullable column
and letting old rows read as null — because **the old rows were hashed without
the field, and a reader that hands them back with the field set to null has
changed their bytes.** Every record written before the field existed then
verifies as tampered, at once, on the next read. Nothing was altered; the
reader lied.

This sits beside the canonical-serialization rule in
[tamper-evidence](./tamper-evidence.md), and the two must be read together.
Within one fixed field list, encoding absence explicitly removes ambiguity.
Across a field list that grows, the records written under the shorter list
cannot be re-encoded without being rewritten, which append-only forbids. A
ledger therefore picks one of two disciplines and states it beside the digest
recipe: **a versioned recipe** (each record names the field list it was hashed
under, and the verifier selects the recipe by version), or **an open record in
which an optional field that has no value is absent** — not null, not an empty
string, not a default — so a record that never had the field serializes
exactly as it always did. Mixing them is the failure: a recipe that claims to
encode absence explicitly while new fields arrive unversioned.

## The open-record rule, at every step

The rule is easy to state and easy to break, because each layer has its own
habit of filling holes:

- **The type** declares the field optional, never nullable. "Optional"
  means the key may be missing; "nullable" invites every writer to send null
  for "nothing to say".
- **The writer** omits the key when there is no value. Where the language's
  serializer drops an explicitly undefined value on output, the canonical
  form must drop it too, so an in-memory record and its stored line hash the
  same.
- **The parser** rebuilds the record field by field and copies an optional
  key only when it was present. A spread of defaults, a schema library that
  fills missing keys, or an object-mapper that materializes every declared
  property each reintroduces the null.
- **The store** (an index, a cache, a relational copy) may hold a nullable
  column — that is its representation, not the record's — but the reader
  that turns a row back into a record drops null columns rather than passing
  them through.

Write the reason on the field itself, where the next contributor adding a
sibling field will read it, and pin it with a test that hashes a chain
written before the field existed through every layer — parse, store, read
back — and asserts the digests the old code computed. That test is the only
thing that notices when a refactor of the reader quietly starts emitting
nulls.

## A key the reader does not know is a version verdict

The mirror-image failure is an old reader meeting a new record. A parser that
rebuilds records field by field drops the unknown key, recomputes the digest
over what it kept, and reports **tampered** — a confident integrity verdict
for what is a deployment skew. A parser that keeps unknown keys unvalidated
verifies them but has stopped validating anything.

The rule: **refuse a record that carries a key this reader does not know, and
name the refusal as "written by a newer version than this reader", not as a
broken chain.** The two verdicts send their readers to different places — an
upgrade, versus an incident — and the distinction has to survive as a typed
reason all the way to the surface that displays it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A tamper alarm that fires on every rollout trains its audience to ignore it,
which is the outcome tamper evidence exists to prevent.

The known-key set is a vocabulary, and it must have one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
derive it from the record's type, or bind the two so that a key added to one
and not the other is a build failure. A hand-maintained list beside the type
is the race in which a field is added, the list is forgotten, and the writer's
own next record is refused as newer than itself.

## One parser for writer, importer and verifier

When the program that appends, the program that imports into an index and the
program that verifies each parse records their own way, they disagree about
exactly these edge cases — a null here, an unknown key there — and the
disagreement surfaces as a chain the writer extended and the importer
rejects. Share one parser among them; let a caller add stricter rules on top,
never looser ones; and have the writer refuse to extend a chain the importer
would refuse. The digest recipe then names its recomputation once
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
in one module every party runs.

## When not to use it

A ledger without digests evolves like any other table; nulls are harmless
there and the ceremony is waste. A ledger that already carries a recipe
version per record should bump the version instead of relying on absence,
since its verifier can afford to know every recipe it ever shipped. And no
field that a verdict depends on should be optional at all: if older records
cannot carry it, the verdict on them is "not stated", spelled as such, not
inferred from the key's absence.
