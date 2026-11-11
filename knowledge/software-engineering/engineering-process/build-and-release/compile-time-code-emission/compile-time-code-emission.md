---
layer: golden-path
type: golden-path
subject: compile-time-code-emission
status: forged
use_when: [writing or reviewing a macro, compiler plugin or source generator, deciding whether a generator should parse its input as tokens or as a full syntax tree, a generated expansion fails with an error pointing at code nobody wrote, planning a codemod that rewrites authored files across a codebase]
techniques:
  - target-syntax-templates
  - representation-strength-from-input-contract
  - call-site-diagnostics
  - pure-expansion
  - additive-expansion-with-declared-names
  - expansion-tests
  - lossless-tree-codemods
---

# Compile-time code emission

Compile-time code emission is a program writing program text that the host
toolchain then compiles as though a person had written it. Its common forms
are the language's own macro systems (pattern-based and procedural), compiler
plugins and source generators that run inside the compiler and add files to
the compilation, and - at the edge of the subject - codemods, which run once
and write their output into the author's own files. What makes them one
subject is not the mechanism but the contract: every emitter stands between
**two worlds it does not own**. On one side is the host compiler, which
decides what representation the emitter receives, what output it accepts, how
an error reaches the user and when the emitter runs at all. On the other side
is the caller's source: its names, its formatting, its authorship. Every
recurring defect in this subject is a breach of one of those two contracts.

## An emitter is a compiler stage somebody else wrote

The naive reading treats a macro as a function that happens to run early. It
inherits much more than that. An expansion that goes wrong fails *inside the
compiler*, so its error message points into code no human wrote and nobody can
open. An emitter that loops hangs the build, and the compiler does not catch
it. An emitter runs with the compiler's own privileges - it can read files,
open sockets and spend minutes - which makes it a dependency of every
developer's workstation and every build agent, priced as such
([build-time-dependency-tier](../../../security/code-provenance/supply-chain/techniques/build-time-dependency-tier.md)
owns that pricing). And an emitter's output is invisible to most of the tools
that make code maintainable: the formatter, the navigator, the reviewer's
diff. A principal engineer therefore holds an emitter to the standard of a
compiler stage, not a helper function: its input representation is chosen,
its output is well-formed by construction, its failures are diagnostics, its
behaviour is a pure function of its inputs, and its tests stand where a
foreign caller stands.

The corollary is the first decision of the subject: **do not emit when the
language can say it.** A generic function, a trait with default methods, a
higher-order function or a data table costs nothing in the categories above.
Emission earns its place when the language cannot express the thing at all -
new syntax for a little language, code derived from a declaration's shape,
a compile-time check the type system cannot state, or boilerplate that would
otherwise be hand-copied into hundreds of call sites and drift.

## The representation decides what can go wrong

An emitter reads and writes program text, and the single most consequential
design choice is how much structure it insists on, on each side.

On the input side, the choice is made by the input's contract, not by the
author's taste
([representation-strength-from-input-contract](./techniques/representation-strength-from-input-contract.md)).
A weak token tree accepts anything lexically valid, which is what a little
language embedded in the host needs, because its body may not be host syntax
at all. A full syntax tree is opted into only when the input is guaranteed to
be host code - a function the attribute sits on, a declaration a generator
reads - and then the tree's types replace hand-written pattern matching. A
lossless tree, which keeps every comment and space, is required exactly when
the output returns to a file a person will read again. Picking the stronger
representation for a weaker contract rejects legal input with a host-syntax
error the user cannot interpret; picking the weaker one for a stronger
contract re-derives the language's grammar by hand, badly.

On the output side, emitted code is built through the target's own syntax
with typed holes for the parts that vary, never by gluing strings
([target-syntax-templates](./techniques/target-syntax-templates.md)). A string
cannot tell a two-token sequence from an identifier, carries no source
location, defeats every tool that understands the target, and fails only when
the compiler finally reparses it - far from the line that built it. The
template form keeps the output well-formed by construction and keeps the
caller's source locations attached to the pieces that came from the caller.

## The caller's world: names, edits and visibility

Spliced output is resolved in the caller's scope, so every name the emitter
leaves bare is a dependency on the caller's imports. That half of the contract
is owned by
[emitted-code-names-from-a-root](../../codebase-stewardship/module-design/techniques/emitted-code-names-from-a-root.md)
in module design, which measured it on a real population of generators and
states the rule this subject relies on: resolve from a root, bind only what
was asked for.

The other half is what the emitter does to the author's code. Mature host
designs converge on **additive** emission: generators add files and members
beside the author's declarations; they do not rewrite them in place, and the
names they introduce are declared before expansion so the compiler and the
editor can reason about a declaration without running the emitter
([additive-expansion-with-declared-names](./techniques/additive-expansion-with-declared-names.md)).
A rewrite hides what a declaration means until the emitter runs, makes name
lookup depend on expansion order, and leaves the author unable to predict the
code they are reading. The same technique carries a lesson real trees keep
teaching: anything the author must edit or the formatter must see stays in
source, because a module or item an expansion emits is invisible to tools that
read source.

## The compiler's world: purity and diagnostics

A host compiler that caches expansions, re-runs them on every keystroke in an
editor, or runs them on many cores at once assumes the emitter is a pure
function of what it was given. Any undeclared input - the clock, an
environment variable, a file the emitter opened by path - produces output that
differs between machines and runs and a cache that serves stale expansions
nobody can reproduce. The models an incremental generator carries between
stages must compare by value, or the cache never hits and the editor re-runs
everything on every edit ([pure-expansion](./techniques/pure-expansion.md)).

Failures go back through the compiler's own channel. A panic or exception
becomes a generic error at the invocation; a silent empty expansion becomes
an unrelated error three lines later. The standard is a diagnostic attached
to the caller's own tokens - the unknown option, the wrong field, the
unsupported shape - collected so one build shows every problem, with the
expansion still produced where a partial result helps the compiler report
the rest ([call-site-diagnostics](./techniques/call-site-diagnostics.md)).

## An emitter is tested where its caller stands

The emitter's logic is a program and is unit-tested like one, but three
properties only appear at the compiler boundary: what the expansion is, what
the user sees when the input is wrong, and whether the expansion compiles in a
caller that shares nothing with the emitter's own package. Each needs its own
test layer ([expansion-tests](./techniques/expansion-tests.md)). The first is a
snapshot of the expanded text; the second is a compile-fail fixture that pins
each diagnostic's wording *and* its position; the third is a probe compiled
from outside. Logic that manipulates a representation only the compiler can
construct is moved behind a plain mirror type first
([mirror-type-at-the-edge](../../codebase-stewardship/module-design/techniques/mirror-type-at-the-edge.md)).

## When the output lands in the author's file

A codemod is emission whose output becomes authored source: it runs once,
across a codebase, and its result is reviewed and owned by people. Every rule
above still applies, and one is sharpened to the point of being the whole
technique: the representation must round-trip the file byte for byte, so that
the diff is exactly the intended change. A codemod that reprints a whole file
from an abstract tree destroys comments and formatting on lines it never meant
to touch, and a diff of a thousand files in which the real change is buried is
a diff nobody can review
([lossless-tree-codemods](./techniques/lossless-tree-codemods.md)).

## Where this subject stops

[codegen](../codegen/codegen.md) owns **committed source derived from other
committed source**: the registry of generators, their triggers, drift gates,
headers and failure isolation. The discriminator is whether the output is a
file in the tree. A build-time generator that writes a committed file is
codegen's; an expansion that exists only inside the compilation, or a
generator whose output the compiler adds without writing it to the tree, is
this subject's. A generator can be both, in which case its emission rules come
from here and its pipeline rules from there. Module design owns the hygiene of
spliced names, as above. The import waist and its loss ledger in
[intermediate-representation](../../../integration/acquisition-and-ingest/import-normalization/techniques/intermediate-representation.md)
govern lowering foreign data into a product's vocabulary, which is a different
choice from how strongly an emitter parses its own input. A configuration
include that is *meant* to adopt the includer's names is
[textual-macro-prepass](../../../backend-platform/model-workflow-contracts/declarative-object-graph-configs/techniques/textual-macro-prepass.md),
not an emitter.

## The techniques

- [target-syntax-templates](./techniques/target-syntax-templates.md) - build
  output in the target's syntax with typed holes; when a text writer is still
  right.
- [representation-strength-from-input-contract](./techniques/representation-strength-from-input-contract.md) -
  token tree, full syntax tree or lossless tree, chosen by what the input
  promises.
- [call-site-diagnostics](./techniques/call-site-diagnostics.md) - failures as
  diagnostics on the caller's tokens, collected, never crashes or empty output.
- [pure-expansion](./techniques/pure-expansion.md) - declared inputs only,
  value-equal models, the privileges an emitter carries.
- [additive-expansion-with-declared-names](./techniques/additive-expansion-with-declared-names.md) -
  add beside, never rewrite; declare introduced names; keep editable structure
  in source.
- [expansion-tests](./techniques/expansion-tests.md) - expansion snapshots,
  compile-fail fixtures, foreign-caller probes.
- [lossless-tree-codemods](./techniques/lossless-tree-codemods.md) - round-trip
  trees, minimal reprint, idempotence and a dry run.

## Sources

Primary design documents and vendor guidance read for this subject:

- Procedural macros, language reference: https://doc.rust-lang.org/reference/procedural-macros.html
- Span hygiene in the compiler's macro API: https://doc.rust-lang.org/proc_macro/struct.Span.html
- Expression macros design proposal: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0382-expression-macros.md
- Attached macros design proposal: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0389-attached-macros.md
- Quotes and splices guide: https://docs.scala-lang.org/scala3/guides/macros/quotes.html
- Concrete syntax trees for codemods: https://libcst.readthedocs.io/en/latest/why_libcst.html
- Lossless semantic trees: https://docs.openrewrite.org/concepts-and-explanations/lossless-semantic-trees
- A codemod toolkit's own documentation: https://github.com/facebook/jscodeshift

The quasi-quoting library, the parser library's error type, the compile-fail
harness and one generator vendor's incremental-generator design notes and
cookbook were read as well; their addresses are on hosts whose paths this
layer's purity check reads as repository paths, so they are cited in the
subject's applications and its review note instead.
