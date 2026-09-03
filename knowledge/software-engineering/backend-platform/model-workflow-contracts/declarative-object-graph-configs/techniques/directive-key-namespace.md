---
layer: technique
type: technique
subject: declarative-object-graph-configs
technique: directive-key-namespace
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [a config node mixes constructor arguments with instructions to the loader, a node must be switched off by an override without deleting it, a node depends on another that no argument carries, a constructor has a parameter whose name collides with a loader keyword]
---

# Directive key namespace

A node in an object-graph config is a mapping. Most of its keys are the
keyword arguments of a constructor: `lr`, `in_channels`, `handlers`. A few of
its keys are not arguments at all but **directives to the loader**: which
callable to construct, whether to construct at all, what else must exist
first, whether to return the callable itself rather than call it, a line of
prose for a human. The two kinds live in the same mapping because that is
where authors will put them; the technique is keeping them from colliding
there.

## The reserved set

The directives are a **closed, enumerated set of keys**, spelled so that no
ordinary constructor parameter shares the spelling — a leading and trailing
underscore is the convention that has survived, because it is visibly
unusual and no style guide permits it for a parameter name. The set lives in
exactly one place — a constant the parser, the instantiator, the validator
and the documentation generator all import
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary))
— and the loader's instantiation step does one thing with it: strip every key
in the set from the mapping, act on what was stripped, and pass everything
remaining to the constructor untouched.

The set is small and its members are stable. The ones a mature format carries:

- **target** — the callable to construct, as an importable name; the loader
  locates it and calls it with the remaining keys.
- **disabled** — a boolean; when true the node is not constructed and vanishes
  from its parent (below).
- **requires** — a reference, or a list of references, to nodes that must be
  resolved before this one although no argument carries them; the ordering
  dependency for side effects the graph does not otherwise express.
- **mode** — how to instantiate: construct the object (the default), hand back
  the callable uninvoked so a consumer can call it later, or construct under a
  debugger.
- **description** — free text for the reader; the loader ignores it.

Every other key in a node is an argument. A key the constructor does not
accept is the constructor's error to raise, and the loader does not intercept
it — which is why the directive spelling must be unmistakable: a mistyped
directive, `_disable_` for `_disabled_`, must reach the constructor and fail
there rather than be silently treated as a directive that does nothing.

## A disabled node vanishes

The disabled directive is the one whose semantics are most often gotten wrong.
The naive implementation constructs nothing and leaves a null in the node's
place; every consumer of a list of handlers then has to skip nulls, and every
consumer of a mapping has to check for them, and the one that forgets crashes
on the first disabled node in production. The correct rule: a disabled node
resolves to nothing **and is removed from its parent container** — a list
shrinks, a mapping loses the key. The removal is done by the resolver as it
finishes the parent, so the parent's constructor receives a container of
exactly the live children.

The reason to disable rather than delete is layering. An override file, a
command-line assignment or a hosting program can set the disabled directive on
a node it knows by id without knowing anything else about the node — a
federated host switching off a checkpoint loader that would clobber the
weights it just supplied, an inference run switching off a training-only
handler — and the base file remains intact and reviewable. Deletion by an
override would require the override to restate the parent container; a
single-key directive is the surgical alternative.

## The requires directive

References express data dependencies: `optimizer` needs `network` because an
argument carries it. Some dependencies are not data. A node that registers a
global (a random seed, a device selection, a logging configuration) must be
constructed before anything that reads the global, and nothing in the graph
carries it as an argument. The requires directive names those nodes, and the
resolver resolves them — through the ordinary depth-first path, with cycle
detection — before constructing the node that requires them. The alternative
is to rely on file order, which the resolver's laziness does not honour, and
which breaks the first time a caller asks for an entry point out of order.

## The mode directive

A node is usually an instance: the target is called with the arguments. Two
other shapes are common enough to name. The **callable** mode returns the
target with its arguments bound but uncalled, so a consumer can invoke it later
with additional runtime arguments — a loss function that a loop calls per
batch, a transform factory called per sample. The **debug** mode constructs
under the host's debugger for the author chasing a bad constructor call. Mode
is a directive rather than a target variant because it is orthogonal to what
is constructed; every target could in principle be requested in every mode.

## The specification page carries the set

The format's specification lists the reserved keys, each with its type, its
default and one example, and states the stripping rule. A reader of any node
can then classify every key at a glance: reserved spelling means directive,
anything else means argument. A generator that documents the format reads the
set from the same constant the loader uses, so the page cannot drift from
the code.

## When not to use this

A config whose nodes are constructed by code that already knows their shape —
a fixed set of top-level keys, each handled by a dedicated branch — has no
generic instantiator and no need for a directive namespace; its "directives"
are just the schema. A format that constructs only one kind of object can
fold target into the format. And a format in which nodes never need to be
switched off, ordered, or returned uncalled needs only the target key, and
should reserve the rest of the spelling anyway, so that adding a directive
later is not a breaking change for files that used the spelling as an
argument name.
