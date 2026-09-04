---
layer: technique
type: technique
subject: declarative-object-graph-configs
technique: reference-resolution-with-cycle-detection
status: forged
laws: [failure-not-empty-success, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [writing the resolver that turns config ids into instances, a config load hangs or overflows the stack with no useful message, deciding what happens when a config references an id that does not exist, an inspection tool needs to read a config it does not intend to run]
---

# Reference resolution with cycle detection

Once a config can say "this argument is node `x`", the loader needs a procedure
that turns an id into the object it denotes, and that procedure has to be
correct in the presence of the three things authors will do: refer to nodes
that depend on other nodes, refer to nodes that do not exist, and — by accident
or through a copy-paste — refer to a node that refers back. The procedure below
is the standard shape. Its properties are lazy, memoized, depth-first, and
terminating, and each property answers a specific failure.

## The procedure

Resolution is **per id, on request**. The caller asks for `trainer`; the
resolver does not build the whole file, it builds `trainer` and whatever
`trainer` transitively needs. A file may describe ten entry points of which a
given run uses one; constructing the other nine costs time and, worse, pulls in
dependencies the environment may lack. A resolve-everything mode exists for a
validation step, and is invoked as such — never as the default path a run takes.

Resolution is **memoized by id**. The first request for `network` constructs
it; the second returns the same instance. This is not an optimisation, it is
semantics: the optimizer and the trainer must hold the *same* network, and a
resolver that constructed a fresh one per reference would produce a graph in
which no two nodes share anything. The cache is keyed by the absolute id and
lives for the lifetime of the parsed document.

Resolution is **depth-first over a waiting set**. To resolve `x`, add `x` to
the waiting set, find every reference in `x`'s definition, resolve each one
recursively, then construct `x` from the resolved arguments, cache it, and
remove `x` from the waiting set. The waiting set is the set of ids whose
resolution has begun and not finished. If a reference names an id already in
the waiting set, the graph has a cycle, and the resolver raises an error that
names the id — not a retry, not a placeholder, not a stack overflow. This is
the entire mechanism; there is nothing else to it, and implementations that
try to be cleverer (breaking the cycle with a proxy, deferring one edge) have
produced graphs that half-exist in ways that are impossible to debug.

Resolution **hoists imports first**. Some nodes are not objects but
declarations that make names available to expressions — a module import, a
constant. Every node of that kind is resolved before any other, in the order it
appears, so that an expression anywhere in the file can rely on the names
existing regardless of which entry point was requested first. Without hoisting,
whether an expression works depends on which id the caller happened to ask for
first, which is the class of bug that appears only in production.

Within a node, **references resolve before the expression that embeds them**.
An expression that mentions `@network` needs `network` to exist as a bound
name at evaluation time; so the resolver walks the expression text for
references, resolves each, binds it, and only then evaluates. The binding is by
name, into a scope the evaluator reads; it is never a textual substitution of
the object's representation into the expression source.

## Missing references

A reference to an id the document does not define is an **error**, and the
error names both the referencing node and the missing id. There is no
reasonable default value for a missing object, and a resolver that substituted
one — an empty mapping, a null — would produce a graph that constructs and then
misbehaves far from the cause
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

Exactly one downgrade exists: a **global toggle** that turns the error into a
warning and lets resolution continue with the reference left unresolved. Its
purpose is a tool that reads a config it does not intend to run — a linter, a
documentation generator, a package inspector that wants the shape of the graph
without the environment the graph needs. Two properties keep it safe. It is
global to the resolver, not per reference, so a file cannot carry its own
permission to be broken. And it defaults to off, so the guard is present unless
someone deliberately removed it; a per-run flag that a tool sets is a visible
choice, where a per-file directive would be an invisible one
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Ids and their separator

An id is a path — top-level key, then nested keys, then list indices — joined
by a separator. The separator is part of the reference grammar and is chosen
once. When a format changes separators (a common history: a single character
that turned out to collide with something), the parser accepts the legacy
spelling and **normalizes it to the canonical one at its front door**, in one
function, before any id reaches the resolver. Nothing downstream ever sees two
spellings. A resolver that tolerates both is a resolver with two code paths
that will diverge.

## Whole-value references versus embedded text

A value that is exactly the reference sigil plus an id is replaced by the
referenced object, preserving its type — a mapping, a list, a callable, an
instance. A string that contains the sigil somewhere inside is left alone; it
is text, and the author who wanted interpolation has the expression hatch. The
resolver checks the whole-string case first and cheaply, and does not go
looking for references inside arbitrary strings.

## Disabled nodes

A node marked disabled resolves to nothing, and the resolver **removes it from
its parent container** after the parent's other children are resolved — a list
loses an element, a mapping loses a key. Callers therefore never see a
placeholder, and a handler loop iterates over exactly the handlers that exist.
The removal happens at resolution time, not at parse time, because the
directive can itself be set by a later layer or a command-line override, and
the parse-time tree must still show the node for tooling that wants to see
what was switched off.

"Resolves to nothing" needs a representation, and the obvious one — the host
language's null — is wrong, because a constructor may legitimately return null
(a factory that declines, a setup function with no result), and a resolver
that drops every null child from a container has silently dropped that node
too. Use a private sentinel for "disabled", distinct from any value a
constructor can return, and drop only the sentinel
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value): a
node that was switched off and a node that produced nothing are two different
facts, and a container that cannot tell them apart will lose one).

## Inspection without construction

The resolver takes two per-request flags: whether to instantiate components,
and whether to evaluate expressions. With both off, a request for an id walks
the same depth-first path — references found, cycles detected, missing ids
reported — and returns the node's definition with its references resolved to
other definitions rather than to instances. This is the mode a validator, a
documentation generator or a package inspector uses, and it is per request
rather than global so that one tool can inspect one entry point and construct
another. The missing-reference toggle below is a different knob: the flags
change what resolution *produces*; the toggle changes what a broken reference
*does*.

## When not to use this

A config whose values never reference each other needs no resolver; a plain
load is correct and a cycle is impossible. A graph that must be constructed in
topological order for reasons the references do not capture — side effects at
construction, a global registry that must be populated first — needs the
ordering directive described in [directive-key-namespace](./directive-key-namespace.md)
rather than a cleverer resolver; depth-first over references is the right
order exactly when the references are the only dependencies.
