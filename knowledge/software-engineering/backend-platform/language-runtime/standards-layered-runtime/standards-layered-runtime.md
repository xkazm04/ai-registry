---
layer: golden-path
type: golden-path
subject: standards-layered-runtime
status: forged
use_when: [deciding how to split an embeddable runtime into packages, choosing which runtime package an embedder should depend on for a portability promise, adding a host-facing API that an external standard defines, reviewing a feature-flag proposal that would gate a standard's API set]
techniques:
  - crate-per-standards-body
  - status-header-per-api
  - baseline-plus-extension-tuple
  - backend-parameterised-web-api
  - re-export-preserves-import-path
  - cli-as-thin-assembler
---

# Standards-layered runtime

A guest-language runtime is never one thing. Underneath is the language itself,
whose behaviour a specification fixes to the last observable detail. Above it is
the world the language has no opinion about: timers, a console, structured
cloning, a fetch call, an event target — the platform surface that a program
written for one host expects to find on another. Those two halves answer to
different authorities. The language answers to the language specification; the
platform surface answers to several bodies at once — the ones that publish the
individual web-platform standards and, more recently, the effort that curates a
**cross-runtime baseline** out of them, a minimum set every server-side runtime
agrees to provide so a program can move between hosts without a compatibility
layer. **A standards-layered runtime turns that map of authorities into its
package graph.** The engine implements the language specification and nothing
else. Each external standard the runtime honours lives in its own package that
depends only on the engine. Everything the runtime offers beyond any standard —
a logger for the console, a concrete network backend, host-specific conveniences
— sits in an extras layer above the standards packages. The executable at the
top assembles those layers and adds no behaviour of its own.

The naive reading is that this is packaging hygiene, a slightly more elaborate
version of "keep the core small". The principal reading is about **what a
dependency edge is allowed to mean**. When compliance with a standard is a
package boundary, an embedder who depends on that package has said, in a
manifest a build tool reads, exactly which promises its program may rely on and
exactly which it may not. The dependency choice *is* the conformance claim. A
feature flag cannot carry that claim: a flag is a build-time toggle inside one
package, its presence is invisible to every downstream manifest, and a program
that depends on "the runtime" with or without the flag cannot be distinguished
by anything that reads dependencies. The layering exists to make the claim
legible to tooling and to people, and every technique in this subject serves
that one purpose.

## The boundary with the neighbours

[Module design](../../../engineering-process/codebase-stewardship/module-design/module-design.md)
decides boundaries *inside* a codebase by depth and by seam — where substitution
should be possible, which decisions a module should hide, and how a boundary
pays the maintainer and the caller. This subject inherits that discipline and
adds a boundary criterion module design does not have: an authority *outside*
the codebase. Whether the timer API and the fetch API belong in the same package
is not answered by their rate of change or depth, which is what module design
would ask, but by which document requires them and whether an embedder can
want one without the other. Use module design when the question is "is this
boundary deep enough and in the right place"; use this subject when it is
"which external promise does depending on this package make", and expect this
subject to occasionally place a boundary module design would call shallow. [Conformance checking](../../../engineering-assessment/maturity-and-conformance/conformance-checking/conformance-checking.md)
is the *verdict* on a claim — a checker executing a declared contract against a
tree and reporting what it could prove; this subject is the *claim itself*, the
one a dependency edge carries, which a checker may later confirm or refute but
never makes.

## Layers answer to authorities, not to convenience

The layer count is not chosen. It falls out of counting the authorities the
runtime honours and adding two: one below for the language, one above for the
things no authority defines. A runtime that honours the language specification
and one cross-runtime baseline has exactly four layers — engine, baseline,
extras, executable — and adding a second standard adds a package beside the
first, never a layer above or below it. The rule for a new API is therefore a
question with one of three answers: *which document requires this?* If the
language specification, it belongs in the engine. If an external standard, it
belongs in that standard's package, and only there. If none, it belongs in the
extras layer, marked as such, until a standard adopts it or the runtime decides
it never will.

One refinement, and it corrects the technique's name. The unit is not the
body that *publishes* a specification but the **claim an embedder wants to
make**. A cross-runtime baseline is curated from a dozen documents by several
publishers — the timers from one, the abort and event interfaces from another,
the fetch and console and encoding APIs from others still — and no embedder
wants "the timers document"; they want "the baseline", because that is the
promise their program's portability rests on. So the package follows the
curating authority and gathers every clause it requires, whoever wrote each.
Splitting the baseline into one package per publisher would produce
dependency lines nobody reads and a claim nobody can make in one edge.

The rule has a hard consequence that separates a layered runtime from one that
merely has several packages: **a standard's package depends on the engine and
on nothing else in the runtime**. Not on the extras layer, because the extras
layer is by definition the set of things the standard does not require, and a
standard package that reached into it would be claiming conformance while
depending on something nobody standardised. Not on a sibling standard's package,
because an embedder must be able to take one standard without the other, and a
dependency between them removes that choice. Where two standards genuinely need
a shared primitive, that primitive belongs in the engine or in a package below
both of them — never in one of them.
[crate-per-standards-body](./techniques/crate-per-standards-body.md) owns the
dependency rule, the case against feature flags, and the migration from a
monolithic runtime package.

## A package is a claim in progress, and it says so

A package named after a standard makes a promise the day it is created and
keeps it only when the last API lands. Between those two dates, the package is
a claim in progress, and a claim in progress that looks finished is a defect:
an embedder reads the name, depends on the package, and discovers at runtime
that half the baseline is missing. The honest form is a **status header** on
every API module — which standard requires this module, and where the module
currently lives relative to where it will end up. A module that still sits in
the extras layer but is destined for the baseline package carries a marker
saying so, and a module that has landed carries the citation of the clause that
requires it. The headers are not documentation for its own sake; they are the
material a reader uses to answer "how much of the promise does this version
keep", and a checker can read them the same way. The one thing a package in
progress must never do is let its entry point succeed while installing
nothing: a stub registrar that returns success is the claim's worst form,
because the embedder who depended on the package for the baseline gets a
green registration and a missing API.
[status-header-per-api](./techniques/status-header-per-api.md) owns the header
contents and the discipline that keeps them true.

## Registration is a baseline plus extensions

An embedder does not install APIs one by one. It asks the runtime to register a
**baseline** — the set every program may assume — and adds **extensions** of
its own: a fetch backend, a host-specific module, a debugging hook. The shape
that composes them without the runtime knowing the extension list in advance
is a fixed baseline registered unconditionally plus a caller-supplied tuple
of extensions, each implementing one registration trait, composed
structurally up to some arity, with a late door for the extension whose
construction needs a running context.
[baseline-plus-extension-tuple](./techniques/baseline-plus-extension-tuple.md)
owns the trait, the arity rule, and the late door.

## The standard fixes the API; the host supplies the backend

The single most consequential move in a standards-layered runtime is to
separate *what the API looks like to the guest* from *what happens when it is
called*. The standard defines the former to the letter and says nothing about
which socket library performs the request, where console output goes, or
which clock a timer reads. So the runtime implements the API surface once,
exactly as specified, and parameterises it by a **backend trait** the host
implements — a logger, a fetcher, a message sender, a process provider — with
a shipped default for each, so an embedder replaces exactly the backend it
cares about. The rule that keeps this honest is at the error boundary: a
backend fails in its own vocabulary, and the guest sees only the exception
type the standard names, carrying the backend's message. A host error type
reaching the guest, or the runtime aborting on one, breaks the API contract in
a way no conformance suite will forgive.
[backend-parameterised-web-api](./techniques/backend-parameterised-web-api.md)
owns the trait shapes, the default-backend rule, and the error translation.

## Migration between layers keeps the import path

Layers move. An API that began in the extras layer is adopted by a standard and
must move down into the standard's package, and every embedder who imported it
from the old home has a path that must keep working, or the migration is a
breaking change disguised as a refactor. The rule is that **the old layer
re-exports the moved API under its historical name**, so the old path keeps
compiling and both paths name one type, not a copy.
[re-export-preserves-import-path](./techniques/re-export-preserves-import-path.md)
owns the mechanics and the rule for when a re-export may finally be removed.

## The executable assembles and does not extend

The last layer is the one most tempted to grow. A command-line front end has
a flag parser, a file loader, an event loop and a place to print errors, and
each is one careless commit away from becoming a behaviour the library does
not have — at which point the executable is a fifth authority, "the runtime
as the shipped binary behaves", which no embedder can depend on and no
standard describes. The rule is that the executable makes a small, fixed set
of choices — job executor, module loader root, whether the host blocks,
which baseline and extensions — and hands every one to the library. Anything
an embedder could not reproduce by making the same choices does not belong
there. [cli-as-thin-assembler](./techniques/cli-as-thin-assembler.md) owns
the choice list and the test that detects a thickening front end.

## Failure modes this standard exists to prevent

- **The flag that claims conformance.** A single runtime package whose
  standard support is a build feature: no manifest can tell which programs
  rely on the standard, and every downstream build inherits whichever flag set
  a transitive dependency happened to pick.
- **The standard package that leaks upward.** A baseline package that reaches
  into the extras layer for a logger or a network client, so that depending on
  the baseline silently pulls in the non-standard world it was meant to
  exclude.
- **The finished-looking skeleton.** A package named after a standard with a
  fraction of it implemented and no per-module statement of what is missing.
- **The backend error that reaches the guest.** A host trait's failure type
  surfacing as a native panic or a foreign exception, where the standard
  promised a specific exception class.
- **The thick executable.** A front end that grew a behaviour — a module
  resolution rule, a polyfill, a timing quirk — that no library caller can
  obtain, so that "works in the binary" and "works when embedded" diverge.

## The techniques

- [crate-per-standards-body](./techniques/crate-per-standards-body.md) — one
  package per conformance claim, depending only on the engine; why a flag
  cannot carry the claim and what a flag may still gate; the monolith migration.
- [status-header-per-api](./techniques/status-header-per-api.md) — which
  standard requires each module, where it lives relative to its destination,
  and why a stub's registrar never returns success.
- [baseline-plus-extension-tuple](./techniques/baseline-plus-extension-tuple.md)
  — an unconditional baseline plus caller extensions composed as a tuple of one
  registration trait, with a late door.
- [backend-parameterised-web-api](./techniques/backend-parameterised-web-api.md)
  — the standard's API over a host backend trait with a shipped default; a
  backend error becomes the exception the standard names.
- [re-export-preserves-import-path](./techniques/re-export-preserves-import-path.md)
  — moving an API between layers under its historical name, and when the
  re-export may retire.
- [cli-as-thin-assembler](./techniques/cli-as-thin-assembler.md) — the
  executable's closed choice list and the test for a thickening front end.
