---
layer: technique
type: technique
subject: declarative-object-graph-configs
technique: merge-vs-override-marking
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [layering a second config file or a set of command-line assignments over a base config, an override file has to restate a whole list to add one element, two override files both need to extend the same mapping, deciding what happens when an override's type differs from the base's]
---

# Merge-versus-override marking

A config is loaded in layers: a base file, an override file for a machine or
an experiment, a set of key-value assignments from a command line. Each layer
is a tree, and where two layers carry the same key the loader must decide what
the result is. There are exactly two reasonable answers, they are both needed,
and the design question is only which is the default and how the other is
requested.

## Override is the default

When a later layer carries a key the earlier layer also carries, the later
value **replaces** the earlier one, whatever the types. This is the default
because it is the only rule under which an override file can *remove* things:
to drop a handler from a list, the override states the list without it; to
switch an optimizer, the override states the new mapping and the old
arguments vanish. A merge-by-default format cannot express removal without a
separate deletion syntax, and every merge-by-default format has eventually
grown one, badly.

Override applies at the key where the later layer stops describing. A later
layer that carries `trainer` with only `max_epochs` inside it replaces the
whole of `trainer`, not one key inside it — under override, "I mention this
key" means "I own this subtree". Authors who want to reach into a subtree
address the inner key directly by its path, `trainer::max_epochs`, which the
loader treats as a key at that depth and which then overrides only that leaf.
The path form is what makes override-by-default usable: the granularity is
chosen by the author per assignment, not fixed by the format.

## Merge is requested per key

Prefixing a key with the **merge marker** changes the rule for that key: the
later value is combined with the earlier one instead of replacing it. Two
combinations are defined and no others. A mapping merged into a mapping
**updates** it — keys in the later layer are added or replace their
counterparts, keys only in the earlier layer survive. A list merged into a
list **extends** it — the later elements are appended after the earlier ones.
That is the whole of merge; it does not recurse. A mapping-merge that wanted
its nested mappings merged too marks each of them, because a recursive merge
is a rule whose depth nobody can predict from reading the override.

The marker is on the key, and it is consumed by the loader: the resulting
tree has the unmarked key. A marked key in the base layer, with nothing to
merge into, is a plain key whose marker is stripped with a warning — it is
almost always a copy-paste from an override file.

## The two error cases

**A type mismatch is an error.** A marked list arriving over a mapping, a
marked mapping over a scalar, a marked scalar over anything — none of these
has a defined combination, and any coercion the loader invented (wrap the
scalar in a list, convert the mapping to its items) would produce a value the
author did not write and cannot see. The error names the key, both types and
both layers. It is a load-time error, before any object is constructed, so
the cost of the strictness is one message and the benefit is that the graph
never contains an accidentally coerced argument.

**A missing target is a warning plus a copy.** A marked key in a later layer
whose earlier layer has no such key cannot merge into anything. The result is
the later value, unmarked, as though override had been used — with a warning
naming the key, because the author asked to extend something and there was
nothing there, which is usually a typo in the key or an override file applied
in the wrong order. This is deliberately not an error: an override file that
extends `handlers` should still load against a base that has none, and the
warning is what tells the author which of the two situations they are in
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) — the
loader does not pretend the base had an empty list; it says it had nothing).

## Layer order and the command line

Layers apply in the order given, and the order is the operator's contract:
base, then override files in sequence, then command-line assignments last.
Command-line assignments are keys at any path with the same override and merge
semantics as a file — an assignment of `+handlers=[...]` extends, an
assignment of `handlers=[...]` replaces — and their values are parsed as the
same structured text format as the files, so a list on the command line is a
list in the tree. A format in which the command line has different composition
rules from the files is a format with two composition rules, and the second is
the one nobody documents.

## Interaction with references and directives

Override and merge operate on the parsed tree before any reference is resolved
or any expression evaluated; they are text-tree operations. A later layer can
therefore replace a reference with a literal, a literal with an expression, or
a whole node with a disabled one, and the resolver sees only the result. A
merge that extends a list of references extends the list of unresolved
reference strings, and each resolves later in the ordinary way. The directive
keys of [directive-key-namespace](./directive-key-namespace.md) are ordinary
keys to the merge rules — an override that sets a node's disabled flag sets
one key and leaves the rest of the node intact, which is the common way a
host neutralises a component it does not want.

## When not to use this

A single-layer config has no composition and needs no marker. A format whose
layers are whole-object — the first source that answers supplies everything —
is doing precedence between sources, not composition between files, and that
is the concern of a settings precedence chain, not of a merge marker. And a
format whose override files routinely need deletion from merged collections
should reconsider whether those collections belong in an override at all;
the answer is usually to make the base smaller and the overrides replace.
