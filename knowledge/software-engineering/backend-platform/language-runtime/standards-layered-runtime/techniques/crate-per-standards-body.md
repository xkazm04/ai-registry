---
layer: technique
type: technique
subject: standards-layered-runtime
technique: crate-per-standards-body
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [splitting a monolithic runtime package by the standards it implements, deciding whether a new API set should be a package or a feature flag, reviewing a dependency a standard package wants to add]
---

# Crate per standards body

Each external standard the runtime honours gets its own package, and that
package depends on the engine and on nothing else in the runtime. The
technique's name is a package-manager word because the unit that matters is
the one a manifest names: the thing an embedder writes on a dependency line,
the thing a lockfile pins, the thing a build tool can enumerate across a whole
dependency tree. A standard implemented at that granularity is a claim any
tool can read. Implemented at any finer granularity — a module, a feature
flag, a runtime option — it is a claim only the runtime's own source can read.

## Why a feature flag cannot carry the claim

The naive alternative is one runtime package with one build feature per
standard: cheaper to maintain, one version number, one changelog. It fails at
the point where the claim is supposed to be consumed. A feature flag is
resolved by unification: every package in a build that depends on the runtime
contributes its requested features, the build tool takes the union, and the
runtime is compiled once with all of them. So an embedder who requested only
the baseline can be compiled with every extra a transitive dependency asked
for, and its program will run against APIs its author never claimed to rely
on. Nothing in its manifest says so, and a conformance checker reading that
manifest will pass a program that is not portable
([gate-sees-target](../../../../_laws.md#gate-sees-target): the manifest is a
proxy that diverges from the compiled surface exactly when a flag was unified
in). The flag also has no identity a lockfile can pin, so "which version of the
baseline did this build ship" has no answer.

A package has all of those properties. Its presence in a manifest is a fact
about that manifest alone; its version is pinned independently; and a
dependency tree can be walked to list every standard a build claims. When
compliance is a package boundary, depending on the package asserts the
compliance, and nothing else in the build can assert it on the embedder's
behalf.

## What a flag may still gate

The argument above is against a flag that gates the *API surface* a package
claims. A flag has one legitimate job in a standards package, and it is worth
stating so the rule is not over-applied: **a flag may gate a backend whose
dependency is heavy or unavailable on some platforms, never the API the
standard requires.** A network client that does not build on every target is
the archetype; the fetch API's surface is required by the baseline and must
be present unconditionally, while the concrete client behind it may be a
feature that an embedder on a constrained platform leaves off and replaces
([backend-parameterised-web-api](./backend-parameterised-web-api.md)). The
test is what the flag removes: a backend, and the API still registers and
fails loudly without one; an API, and the package has smuggled the flag it
was created to avoid.

## The package follows the claim, not the publisher

A curated baseline gathers clauses from many publishers. The package follows
the curating authority — the body whose name the embedder's claim carries —
and holds every API that authority requires, regardless of which document
originally specified it. **When two APIs required by one baseline come from
different publishers, they still share one package**, because the embedder's
dependency line must express the claim the embedder makes, and no embedder
claims "conformant with the timer clauses of one document". The publishers'
names belong in the status headers
([status-header-per-api](./status-header-per-api.md)), where a reader tracing
a behaviour to its source needs them.

## The dependency rule

**When a standard's package needs something the engine does not provide, add
it to the engine or to a package below both, never to the standard's package
from the extras layer, because the extras layer is by definition what the
standard does not require.** The rule applies in both directions of temptation.
The baseline package will want a logger for its console; the logger
implementation is not standardised, so the baseline package defines the
backend trait and a no-op or minimal default, and the richer logger lives
above. The baseline package will want a network client for fetch; the client
is not standardised, so the same split applies. Each of these is a small
extra cost in the standard package — a trait, a default — that buys the
property the whole technique exists for.

**When two standards' packages need the same primitive, put it below both.**
A sibling dependency between two standard packages means an embedder cannot
take one without the other, which is the choice the layering was built to
preserve. The engine is usually the right home, because a primitive two
standards both need is nearly always a language-level facility — a job queue,
a realm handle, a structured-clone routine — that the specification already
describes.

**When an API is required by no standard, it goes to the extras layer, and it
is named there as non-standard.** The extras layer depends on every standard
package it wants and re-exports them, so an embedder who wants "everything"
depends on one package and an embedder who wants "only the baseline" depends on
another. Both are honest dependency lines.

## One standard, one vocabulary

A standard's package is the one place its vocabulary is defined: the names of
its API classes, the exception types it specifies, the registration entry
point. The extras layer and the executable refer to those names through the
package and never redefine them
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The moment a second definition of a standard's type exists above the package —
a convenience wrapper with the same name, a copied enum of its error kinds —
the two drift on the next revision of the standard, and an embedder holding a
value from one cannot pass it to the other.

## Migrating from a monolith

Most runtimes start with one package that does everything. The migration is
incremental and its order matters:

1. Create the standard's package as a skeleton that depends on the engine,
   with the registration entry point and no APIs. Publish it. It is now a
   claim in progress, and [status-header-per-api](./status-header-per-api.md)
   governs how it says so.
2. Move APIs down one at a time. Each move is: cut the API out of the
   monolith, place it in the standard package, and leave a re-export at the
   old path ([re-export-preserves-import-path](./re-export-preserves-import-path.md)).
   An API that cannot move because it depends on something non-standard is
   the signal that a backend trait is missing
   ([backend-parameterised-web-api](./backend-parameterised-web-api.md)).
3. When the last required API has moved, the package's status headers are all
   "landed", and the monolith has become the extras layer: it depends on the
   standard package and adds only what no standard requires.

**When a move would require the standard package to depend on the monolith,
stop and extract the primitive first**, because completing the move with the
upward dependency in place produces a package that claims the standard while
compiling the whole non-standard world into every embedder.

## When not to use it

A runtime honouring exactly one authority — the language specification and
nothing above it — has one package and no layering to do; adding an empty
standards layer in anticipation is decoration. And an internal tool whose
runtime is never embedded by anyone else has no reader for the claim a
dependency edge makes; a flag is cheaper and nobody is misled. The technique
pays when there is an embedder who is not the runtime's author and a
conformance claim that embedder will repeat to someone else.
