---
layer: technique
type: technique
subject: trust-base
technique: verdict-pins-its-checker
status: forged
laws: [derivation-names-recomputation, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [a checker's verdicts are stored, compared or acted on later, a gate accepts verdicts produced by a checker it did not run itself, a defect is found in a checker and the verdicts it produced must be found, choosing what to hash to identify a checker build]
---

# A verdict pins its checker

Every verdict a checker emits is true modulo the checker. The checker is the first member of
every trust base, and the one most often left out of the count, because it is the thing doing
the counting. A verdict stored without saying which checker made it cannot be re-examined when
that checker is found to be wrong, cannot be refused by a gate that trusts one build and not
another, and cannot be told apart from a verdict produced by a copy someone edited to pass.

The rule: **every verdict carries a content hash of the checker that produced it, computed over
the code that actually runs, and a pinner that cannot see all of that code refuses to pin.**
Per [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation), a
stored verdict is a derived value, and the pin is what names its recomputation: run this exact
checker on these inputs.

## What the pin covers

A version string is not a pin. It is a claim a person updates, and an edit that forgets to bump
it leaves two checkers with one name. A hash of the checker's folder is not a pin either: it
moves when a test or a fixture changes, which teaches everyone to ignore it, and it misses the
rules the checker imports from elsewhere in the repository — exactly the shared definitions most
likely to change under it.

The pin is the hash of the checker's **import closure**: the entry point and every source file
it reaches through its imports, transitively, wherever in the repository they live. Each file
contributes its repository-relative path and its content, line endings normalised so a checkout
on another platform pins identically, in a sorted order so the hash does not depend on traversal.
Tests, fixtures, documentation and files nothing imports are outside the closure by
construction, and the pin does not move when they change.

Two kinds of input sit outside an import closure and have to be named rather than assumed:

- **Third-party packages** are pinned by the lockfile, not by this hash. State that boundary
  next to the pin, or extend the pin with the integrity hashes of the packages the closure
  imports.
- **Data the checker reads at runtime** — a rules table loaded from a file, a schema read by
  path — is not an import. Either import it, so it joins the closure, or list it explicitly as
  part of the pin; a rules file read by path is otherwise a checker change that moves nothing.

## Refuse what the pinner cannot follow

The naive pinner skips what it does not understand. That is the defect: a skipped edge is a set
of files that can change without moving the hash, so the pin silently shrinks, and per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) a smaller pin that
still prints a hash is the empty success the pin exists to prevent. The pinner is a trust-base
member in its own right, and it refuses:

- **An import it cannot resolve** — a relative path to no file: refuse, naming the specifier and
  the importing file.
- **An alias** resolved by build configuration rather than by path: refuse. The pinner would have
  to re-implement the resolver to follow it, and a half-implementation is a shrinking pin. Write
  the checker's imports as relative paths.
- **A dynamic import whose argument is computed**: refuse. Its target is decided at run time and
  no static walk can name it.

Each refusal fails the build that computes the pin, so the checker that cannot be pinned cannot
emit a pinned verdict. Test every refusal kind, and test the two directions of the hash: it moves
when an imported file outside the checker's folder changes, and it does not move for a file
nothing imports or for a line-ending change.

## Consumers compare the pin, always

A pin nobody compares is decoration. The gate that acts on verdicts knows the pin of the checker
it trusts and refuses a verdict whose pin differs — "made by a different checker build" is a
block, not a warning. Per [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud), that
comparison is not an option the caller may forget to pass: a gate with no expected pin configured
either refuses to decide or says, in its output, that it accepted verdicts from any checker.
Store the pin with every verdict in the record, so that when a checker defect is found the
verdicts it produced are a query, not an archaeology.

## Decision rules

- Every verdict carries the checker's pin; a verdict without one is not admitted.
- The pin hashes the import closure — paths and normalised contents, sorted — never a folder and
  never a version string.
- Name what the closure leaves out: packages (pinned by the lockfile) and data read by path
  (import it or list it).
- An unresolvable import, an alias or a computed dynamic import is a refusal to pin.
- The acting gate compares pins and blocks on a mismatch; a gate without an expected pin says so.
- The record keeps the pin with each verdict.

## When not to use it

A checker shipped as a reproducibly built binary is already identified by the binary's digest;
pin that, and the import walk is redundant. And a checker whose verdicts are read once by the
person who ran it, and never stored or acted on by anything else, gains little from a pin — the
technique pays when verdicts outlive the run that made them.
