---
layer: technique
type: technique
subject: packaging
technique: adoption-time-packaging-audit
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [choosing between candidate libraries for a product that ships a transformed artifact, a dependency works in the dev process and dies in the packaged binary, a run of patch releases fixed nothing but bundling]
---

# Adoption-time packaging audit

Some packaging modes do not merely copy a program — they **transform** it.
Freezing an interpreted application into a self-contained executable,
statically bundling a module graph, compiling ahead of time, tree-shaking
aggressively: each of these rewrites the shape of the thing that runs.
And each breaks a **known, enumerable set of constructs** that were
perfectly legal in the untransformed program.

The set is short and it is stable across transforming modes:

- **A program reading its own source at run time.** Introspection that
  recovers the text of a function — decorators that parse their target,
  runtime compilation of annotated functions, type-checking wrappers that
  read a signature's body. The transform typically ships compiled units
  and no source, so the read returns nothing and the import fails.
- **Runtime metadata and entry-point lookup.** A library asking the
  package database for its own version, or enumerating registered
  plugins by scanning installed distributions. The transform flattens the
  distribution boundary; the database the lookup expects is not there.
- **Absolute-path resource resolution.** A native component that opens a
  data directory at a fixed system location, or a module resolving a file
  relative to its own on-disk position. Both are true on a development
  host and false inside a relocated bundle.
- **Packages shipping data files inside themselves.** Model weights,
  hyperparameter documents, dictionaries, phoneme tables. A transform
  collects code by following imports, so data that nothing imports is
  silently dropped.
- **Dynamic import by computed name.** Anything the transform's static
  analysis cannot see is not collected, and the failure appears only on
  the code path that computes that name.

The uniting property is what makes this a packaging technique rather than
a debugging tip: **the development host satisfies every one of them.** The
source tree is present, the package database is populated, the system
paths exist. So none of these failures is reachable from a passing test
suite, a running dev server, or a code review. They become reachable only
after the artifact is built — which is the subject's own inversion (*the
build output is not the product; the installed tree is*) arriving one
layer earlier, at the moment a dependency is chosen.

## The audit runs before the integration code is written

The mechanism is a **mandatory pre-integration phase**: before writing a
line of adapter code against a candidate dependency, obtain its source
*and the source of its transitive dependencies*, and search that tree for
the pattern set above.

1. **Fetch the real trees.** Not the documentation, not the package
   summary — the code, including the transitive closure. The hostile
   pattern is almost never in the library you chose; it is two levels
   down, in something that library imports for one small utility.
2. **Search for each pattern by name.** Keep the search block itself
   checked in beside the integration guide, copy-pasteable, one query per
   construct, so the audit is a command and not an act of remembering.
   An audit nobody can run in thirty seconds is an audit that will be
   skipped under deadline.
3. **Record the mechanism per hit, not the symptom.** "Import fails with
   a source-unavailable error" is a symptom shared by five unrelated
   causes and teaches nothing. "This transitive package decorates its
   models with a runtime type-checker that reads the decorated function's
   source at import time" names the mechanism, and the mechanism is what
   predicts the fix, predicts which *other* candidates will fail the same
   way, and survives a version bump that changes the error text.
4. **Assert the instrument.** A search that returns nothing because the
   tree was never fetched, or because the closure was shallower than
   assumed, looks exactly like a clean dependency
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
   Confirm the audit actually read what it claims to have read — a
   known-positive pattern in a known-offending package is the cheapest
   self-test.
5. **Price the shim, then decide.** The audit's output is not a
   pass/fail. It is a cost, attached to the candidate, comparable against
   the other candidates.

## The failure table is a durable asset

Every hit that reaches production should end up in a table with four
columns: the component, the observed failure, **the mechanism**, and the
fix. Kept per-mechanism, the table converges: the fifth engine integrated
hits patterns one through four again and is fixed in an afternoon,
because someone wrote down *why* rather than *what*. Kept per-symptom, it
never converges, because the same mechanism produces a different message
in every library.

The cost of not keeping it is measurable and shows up in the release
history as a **run of consecutive patch releases containing nothing but
bundling fixes** — an artifact shipped, a user reported it dead, a
collection flag was added, repeat. That signature in a changelog is the
strongest available evidence that this technique is missing, and it is
worth grepping your own history for before arguing about the cost of the
audit.

## The toxic dependency chain, and the shim

The characteristic hard case: a candidate needs one small thing from a
package that drags in a large, hostile transitive tree — components that
will not build from source on one of your target platforms, or that carry
several of the patterns above at once. The answer is not to fight the
tree. It is to **reimplement the small thing** and register the
substitute under the name the candidate imports.

Three rules, and all three are earned:

- **The substitute is installed before the dependent library is
  imported.** Import order is the entire mechanism; if the real package
  is resolved first, the substitute is inert and the failure is confusing
  rather than absent.
- **The substitute must not itself use any audited pattern.** A shim
  written to escape runtime source compilation, that itself decorates a
  function for runtime compilation, has moved the failure by one file.
- **Reimplement only what is actually used.** Trace the real import
  chain and cover that surface. A shim that grows toward parity with the
  package it replaces has become a fork, and the trade it makes is
  [vendored-copy-loses-composition](../../../codebase-stewardship/dependency-declaration/techniques/vendored-copy-loses-composition.md)'s
  subject: composition and deduplication sold for setup cost. That trade
  can be right for a seven-line function and is almost never right for a
  subsystem.

A shim is a permanent maintenance obligation with an upstream that does
not know it exists. Price it as one.

## Where this sits among the packaging gates

Every other mechanism in this subject is **post-hoc**: it inspects an
artifact that already exists.
[installed-tree-acceptance](./installed-tree-acceptance.md) walks a tree
after a real install;
[native-payload-verification](./native-payload-verification.md) checks a
manifest against what shipped. Both still run — this technique does not
replace a gate, it moves a *question* left of adoption
([gate-sees-target](../../../../_laws.md#gate-sees-target) is why the gates
remain: an audit reads source, the acceptance walk reads the artifact, and
only the second one sees the target).

The audit feeds the manifest directly. Every dependency the audit finds
shipping its own data files becomes a payload manifest entry, discovered
at selection time instead of by a user whose first generation crashed on
a missing weights file. And the payload volume the audit surfaces is the
input to [size-budgets](../../release-pipeline/techniques/size-budgets.md):
a candidate that forces whole-package collection of a large tree is a
budget decision before it is a code decision.

One boundary must stay sharp.
[supply-chain](../../../../security/supply-chain/supply-chain.md) is
deliberately **not** the home for this. That subject gates whether a
dependency can be *trusted* — provenance, advisories, licence, pinning.
This one asks whether a dependency is *fit* for the artifact you ship. A
package can be impeccably provenanced, freshly patched and completely
unshippable, and a trust gate will never say so.

## Decision rules

- **A dependency is a packaging decision before it is an integration
  decision.** If the product ships a transformed artifact, run the audit
  during selection, on every candidate, and compare the shim costs.
- **Audit the transitive closure, not the direct dependency.** The
  offending construct is usually two levels down.
- **Record mechanisms.** A symptom-keyed table never converges.
- **When two candidates are otherwise close, the one with the cheaper
  packaging profile wins** — this is a legitimate, statable selection
  criterion, not an afterthought.
- **When not to bother:** if the packaging mode does not transform the
  program — a container image, an archive of an untouched tree, a
  server deployed as source — none of these constructs break, and the
  audit is ceremony. The technique's whole force comes from the
  transform.

## Classify the packaging mode before running the audit

The last decision rule draws the boundary; this is how to apply it before
paying for a sweep. The pattern set is not universal — each enumerated
construct is hostile only to the transformations that touch it — so name the
transformations the mode actually applies: source stripping, path relocation,
metadata elision, graph closure. A bundler that ships sources, keeps the module
graph resolvable and does not relocate resource paths applies none of them, and
the audit has nothing to find. Measured over a real dependency closure of 326
top-level entries and 464 manifests under such a non-freezing bundler: after
the instrument was asserted against known-positive controls — a linting package
with three source-reading files, and a compiler package that reads its own
source — the four principal dependencies returned zero absolute-path
resolutions in three of four, zero computed-name dynamic imports that are
actually imported, and a priced shim cost of zero. It predicted nothing the
existing post-hoc bundle check had not already caught, and the adoption budget
it consumed bought a table of zeroes.

Keep step 4 whatever the verdict, because it is what makes a zero readable: an
audit that returns nothing is worthless unless it was first shown to return
something against a known positive. A clean result under an unclassified mode
and a clean result from an instrument that was never pointed at anything are
indistinguishable in the record.
