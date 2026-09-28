---
layer: technique
type: technique
subject: module-design
technique: emitted-code-names-from-a-root
status: forged
laws: [gate-sees-target]
shared_with: []
applied: code
ab_verdict: better
use_when: [writing or reviewing a macro or code generator whose output is spliced into a caller's scope, an exported generator works at every call site today and every call site lives beside it, moving a generator or its callers across a package boundary, a generated body names a library or a sibling generator or a standard type by its bare name, deciding which of a generator's names the caller should be able to see]
---

# Emitted code names everything from a root

A generator whose output is spliced into the caller's code has a second
interface besides its parameters: **every name in its body that the invocation
does not pass in is resolved in the caller's scope.** A bare library path, a
bare call to a sibling generator, a bare standard type or constructor — each
one means whatever the calling module happens to have in scope. The
generator's real interface is therefore its parameters plus every name its
body leaves bare, and that second half is written nowhere. That is the
subject's opening claim — the interface is everything a caller must know —
arriving through a door no signature shows.

## Why every gate passes it

A generator is written beside its first callers, so every early call site
shares the scope the author had in mind: the same dependencies, the same
imports, the sibling generators already in scope. Each of those sites compiles,
and the green build is read as "this works wherever it expands". It is a gate
reading a proxy ([gate-sees-target](../../../../_laws.md#gate-sees-target)):
the check saw only callers that share the defining scope, which are exactly
the callers that cannot find the defect.

Measured on a data layer's nine exported generators, after a package split
had already rerouted their own types through the package-root token and
declared them working "wherever they expand". Every in-package call site
compiled. Invoked by path from a peer package that depended on the same
database library, 6 of 9 compiled; from a package depending on the data layer
alone, 2 of 9; from a caller that declared an ordinary one-parameter `Result`
alias, 0 of 6. The failures were exactly the three classes above: a sibling
generator called by bare name, a library the caller did not depend on, a
standard name the caller had rebound.

## The rule, in two halves

**Resolve from a root.** Everything the body needs that the invocation does not
supply is spelled from a root the caller cannot rebind:

- the defining package's own items **and its sibling generators** through the
  package-root token — including a generator's calls to its own internal arms,
  which are the most commonly missed, because a recursive call reads as local;
- third-party libraries through a hidden re-export from the defining package,
  so the caller does not have to depend on them, and so the version is the
  defining package's rather than whatever the caller resolved;
- the standard library through its absolute path, types, constructors and
  formatting helpers alike.

Methods are the one name class a path cannot reach: a method call resolves
through the traits in the caller's scope. The standard prelude's traits are an
accepted dependency; a method from any other trait is called by its fully
qualified form.

**Bind only what was asked for.** Helper locals and helper items live inside a
block the expansion opens, so they cannot collide with or leak into the
caller's names. But the products — the names the invocation supplies, and the
fixed names the generator's documentation promises — must stay visible,
because producing them is the generator's job. The literal form of this half,
"bind nothing the caller can see", is wrong for any generator that emits
items: wrapping the same six item-emitting generators in their own anonymous
scope broke 240 in-package call sites, every one of them a caller that could
no longer find the function it had asked for. The discriminator is a question
about each emitted name: **did the invocation, or the documentation, name
it?** If yes it is the product and stays visible; if no it is a helper and is
enclosed.

Some macro systems enclose helper locals automatically and still resolve
paths and items at the caller; a token-emitting generator whose identifiers
carry the call site's context encloses nothing; a text template encloses
nothing. Know which one you are writing — the half the language does for you
is the half nobody checks, and the other half is the one that ships.

## The dependency that cannot be rooted

A generator that composes with the product of a sibling generator — an update
that re-reads the row through the caller's own generated lookup — depends on a
name in the caller's scope by design, and no root reaches it. Do not pretend
otherwise: take it as a parameter where the invocation can bear one, and where
it cannot, state the obligation in the generator's documentation and at the
call in its body. A caller-scope dependency is acceptable when it is written
down as the caller's obligation; it is a defect when it is an accident of
where the first callers lived.

## When the opposite is right

A fragment that the includer *means* to adopt — a configuration splice whose
references are supposed to resolve in the including document — wants the
caller's namespace, and resolving it from a root would break it
([textual-macro-prepass](../../../../backend-platform/model-workflow-contracts/declarative-object-graph-configs/techniques/textual-macro-prepass.md)
owns that case). The discriminator is **who authored the names in the
fragment**. Names the caller wrote are resolved where the caller lives; names
the generator wrote are resolved from a root.

## The probe that finds it

Compile each exported generator from a package that shares nothing with the
defining one but the dependency edge: invoked by path, nothing imported, one
common alias declared in scope, and every product the invocation asked for
referenced. Pair it with the opposite assertion on the same probe — the
products are still visible — or the enclosing half can be over-applied and
still pass. Positive control: the same probes with the generator's helpers
imported the way in-package callers get them must compile on the unfixed
code, which proves the failures are dependencies on the caller's imports and
not a malformed probe. The probe costs one file and is worth keeping as a
regression test; it is the only check that stands where a foreign caller
stands.

## When not to use this

A generator that is private to one module, with every call site in that
module, has one scope and no foreign caller; rooting its body costs
readability and buys nothing until it is exported. A generator that writes a
standalone file carrying its own imports has no caller scope at all — the
file's own discipline governs it
([generated-file-hygiene](../../../build-and-release/codegen/techniques/generated-file-hygiene.md)).
