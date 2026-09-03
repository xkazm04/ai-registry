---
layer: golden-path
type: golden-path
subject: declarative-object-graph-configs
status: forged
use_when: [designing a config format whose values are live objects rather than settings, a config language has grown a reference syntax and needs a resolver, deciding whether a config file may contain evaluated code, layering an override file over a base config and the semantics of a repeated key are unclear]
techniques:
  - sigil-grammar-over-schema
  - reference-resolution-with-cycle-detection
  - escape-hatch-expressions
  - textual-macro-prepass
  - merge-vs-override-marking
  - directive-key-namespace
---

# Declarative object-graph configs

A **declarative object-graph config** is a file, in an ordinary structured text
format, that does not describe settings but denotes a **graph of live objects**: a
network, the optimizer that owns its parameters, the loader that feeds it, the
handlers that watch the loop, and the loop itself, each named by an id, each
built from a constructor and its arguments, each free to refer to the others.
Loading the file does not produce a dictionary of values; it produces, on demand,
the objects the file names, wired together as the file says.

The subject exists because a settings file and an object graph are different
things that share a syntax, and the naive reading of a config format collapses
them. A settings file answers "what values did the operator choose"; every key is
a leaf, the store is flat or nearly so, and the consumer already knows what to
build. An object-graph config answers "what program should exist", and its keys
are not leaves but nodes: a value may be a constructor call, an argument may be
another node, and the shape of the program — which handlers are attached, whether
a validator exists at all — is decided by the file rather than by the code that
reads it. Once a format crosses that line it acquires four obligations a settings
format never has, and the corpus of failed config languages is the corpus of
formats that crossed the line and acquired only one or two.

## The four obligations

**References must be a grammar, not a convention.** The moment one node names
another, the format has a reference syntax, and the syntax must be unambiguous
against literal data. A string that happens to start with the reference character
is either a reference or a literal, never "probably a reference"; and the set of
characters that carry meaning is closed, small, and written down in one place. The
alternative — a schema in which each key's type says whether it may hold a
reference — spreads the grammar across every key definition and is out of date the
week after the first extension. [sigil-grammar-over-schema](./techniques/sigil-grammar-over-schema.md)
is the argument for a tiny fixed alphabet of prefix characters, one per semantic
(reference, expression, macro, merge), with everything else literal.

**Resolution must terminate and must be lazy.** A graph can contain a cycle, and a
resolver that follows references without remembering where it is loops forever or
overflows the stack with a message that names nothing. A graph can also contain
nodes the caller never asked for — a training loop in a file loaded for
inference — and a resolver that instantiates the whole file to answer a question
about one node pays for objects nobody wanted, some of which may fail to
construct in an environment that lacks their dependencies. So resolution is
per-id, on request, memoized, depth-first, and carries a waiting set: a node
revisited while it is still being resolved is a cycle, reported by name.
[reference-resolution-with-cycle-detection](./techniques/reference-resolution-with-cycle-detection.md)
owns that procedure, including the two orderings it must respect — imports before
anything that could use them, references before the expression that embeds them.

**The escape hatch is code, and must be labelled as such.** No fixed grammar
covers every wiring a practitioner needs: the learning rate that is a function of
the batch size, the output directory built from a timestamp, the transform chain
that depends on a flag. Every serious object-graph format therefore admits an
inline evaluated expression, and every serious one has been embarrassed by
pretending that this is still configuration. It is not: a file that can contain
an evaluated expression is a program, and loading it from an untrusted source is
running untrusted code. The standard is to keep the hatch — it is what makes the
format sufficient — and to build it honestly: references inside an expression are
bound as scoped names, not spliced as text; there is a global kill switch that
turns evaluation off; there is a debug mode; and the trust boundary is stated in
the loader's documentation in plain words. [escape-hatch-expressions](./techniques/escape-hatch-expressions.md)
is that design.

**Composition across files must have defined semantics for the repeated key.**
One file is never enough: a base recipe, an override for a smaller machine, a
set of command-line assignments on top. When two layers both carry a key, the
naive answer — the later one wins — is right for scalars and wrong for the two
cases that matter most: a dictionary of handlers the override wants to extend,
and a list of transforms the override wants to append to. A format that only
overrides forces the override file to restate the whole list; a format that only
merges cannot remove anything. The standard is override by default and merge by
explicit per-key marker, with a type mismatch between the layers an error rather
than a coercion. [merge-vs-override-marking](./techniques/merge-vs-override-marking.md)
states the rules, and [textual-macro-prepass](./techniques/textual-macro-prepass.md)
handles the other cross-file operation — splicing a fragment of one file into
another, and turning relative ids into absolute ones — as a text transformation
that runs before any object exists, so the resolver only ever sees one flat
namespace of absolute ids.

## Directives are not arguments

A node in the graph is a mapping whose keys are, for the most part, the keyword
arguments of a constructor. But some keys are not arguments at all — they are
instructions to the framework: which callable to construct, whether this node is
switched off, which other nodes must be built first even though no argument
carries them, whether to construct the object or hand back the callable, a
human-readable description. If those keys share the namespace with constructor
arguments, a constructor with a parameter called `mode` or `description` becomes
unconfigurable, and a typo in a directive name is silently passed to a
constructor that will reject it or, worse, accept it. The rule is a **reserved
key set**, enumerated in one place, with a spelling that no reasonable
constructor uses (a leading and trailing underscore is the common choice), and a
loader that strips exactly that set before calling the constructor and passes
everything else through. A node marked disabled does not construct as a
placeholder; it **vanishes from its parent container**, so a handler list with
one disabled entry has one fewer element rather than a null the loop must
special-case. [directive-key-namespace](./techniques/directive-key-namespace.md)
carries the set and its consequences.

## What a principal practitioner holds true

The format is a language, and languages need a specification page: one document
enumerating the sigils, the directive keys, the reference grammar, the merge
marker, the evaluation rules and the trust statement, so an author in another
organisation can write a valid file without reading the loader. A format
documented by examples is documented by the examples' accidents.

Lazy construction is a feature and a trap: a file may describe far more than any
one run needs, but a broken node is discovered only when someone asks for it —
possibly hours in, when the evaluator is first built. The mitigation is a
resolver that can walk a node **without constructing or evaluating** — the same
depth-first pass, the same cycle and missing-reference errors, definitions
instead of instances at the leaves — run by a validation step over every named
entry point before the run begins.

Missing references have exactly one correct default: an error. The global toggle
that downgrades it to a warning exists for a tool that reads a file it does not
intend to run, and it is global rather than per-reference precisely so that a
file cannot carry its own permission to be broken.

The separator inside an id is a public commitment: once files in the wild spell
paths as `trainer::handlers::0`, a change is a migration. When a legacy
separator survives, it is normalized to the canonical one at the parser's front
door, once, so that no downstream code ever branches on which spelling arrived.

## The failure modes of the naive reading

**The format is called configuration, and so it is loaded as configuration.** A
team that thinks of the file as settings puts it in a public repository, accepts
it in an upload, lets a remote service supply it — and has shipped arbitrary
code execution. The trust boundary is invisible precisely because the syntax is
the syntax of settings. The only defence is to say, in the loader's own
documentation and in the format's specification, that loading a file from an
untrusted source runs that source's code, and to make the kill switch a real
switch that a hardened deployment can throw.

**References are resolved by string substitution.** The first implementation of
an expression hatch replaces `@x` inside the expression text with the string form
of `x`'s value, which works for integers, breaks for strings without quoting,
and is a code-injection vector for anything an operator can influence. The
correct mechanism binds the referenced object to a scoped name and lets the
expression language look it up.

**Override is the only composition operator.** Every override file restates
every list, two override files cannot both add a handler, and a mis-typed key
in an override silently creates a new node rather than modifying the intended
one. The merge marker and the type-mismatch error are cheap and both are needed.

**Framework keys leak into constructor calls.** A disabled flag that reaches the
constructor's keyword arguments is a crash at best and, at worst, a constructor
that swallows unknown keywords and builds the object meant to be switched off.

## Boundaries

This subject and [settings](../../../operations/governance-and-records/settings/settings.md)
share a file format and nothing else. A settings store is a runtime key-value
substrate whose reads return defaults, whose keys are a closed registry, and whose
consumer already knows what to build; it owns typed accessors, fail directions,
audit and precedence across *sources* (an operator file, an environment
variable, an ambient identity). This subject owns the composition of *files* into
an object graph: references between nodes, evaluated expressions, textual
splicing, the merge marker, and the resolver that turns ids into instances. The
rule a reader uses to pick: if the consumer of the file decides what objects
exist and the file supplies values, it is settings; if the file decides what
objects exist and the consumer asks for them by id, it is an object-graph config.
A file that carries a learning rate is settings; a file that carries the
optimizer is this.

[repo-manifest-standard](../../../engineering-process/standards-and-gates/repo-manifest-standard/repo-manifest-standard.md)
is a contract a repository carries about itself — what is here, how to invoke
it, under which version of the contract — read by an arbitrary tool that must be
able to validate it from the specification alone and must never execute it. This
subject's file is the opposite kind of artifact: it is executed, it denotes
objects, and its reader is the loader that constructs them. The discriminator is
whether the file is meant to be *acted on* or *built from*: a manifest declares
and points, and a reader that runs anything from it has misread it; an
object-graph config instantiates, and a reader that only inspects it has used
the inspection mode of a language, not a manifest. Where a package ships both — a
metadata document about itself and a config that builds its program — the
metadata is the manifest and the config is this subject.

A third neighbour, the self-describing model package, owns the artifact this
language most often travels inside: the directory layout, the metadata contract,
the version floors, the frozen copy of the config an export embeds. This subject
owns the language and its loader, and would be the same subject if the package
were a single file or a database row. Package questions — what must be present,
how the metadata is validated, what a consumer may ask a package for — go there;
grammar, resolution, evaluation and composition questions come here.

## The techniques

- [sigil-grammar-over-schema](./techniques/sigil-grammar-over-schema.md) — a
  closed set of prefix characters, enumerated once, carries every non-literal
  semantic.
- [reference-resolution-with-cycle-detection](./techniques/reference-resolution-with-cycle-detection.md)
  — depth-first, lazy, memoized resolution over a waiting set; imports hoisted;
  a missing reference is an error unless a global inspection toggle says warn.
- [escape-hatch-expressions](./techniques/escape-hatch-expressions.md) —
  evaluated expressions with references bound as scoped names, a kill switch, a
  debug mode, and a plainly stated trust boundary.
- [textual-macro-prepass](./techniques/textual-macro-prepass.md) — cross-file
  splices and relative ids resolved as text before any object exists.
- [merge-vs-override-marking](./techniques/merge-vs-override-marking.md) —
  override by default; a per-key marker merges; type mismatch is an error.
- [directive-key-namespace](./techniques/directive-key-namespace.md) — framework
  directives split from constructor arguments by a reserved-key set; a disabled
  node vanishes from its parent.
