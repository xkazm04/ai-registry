---
layer: technique
type: technique
subject: declarative-object-graph-configs
technique: sigil-grammar-over-schema
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [a config format needs a way to say "this value is a reference" without a schema per key, a string value that starts with a special character is ambiguous between literal and reference, adding a second non-literal semantic (expression, macro) to a format that already has one]
---

# Sigil grammar over schema

A config format that denotes objects must let a value say "I am not data, I am a
pointer to another node" — and, sooner or later, "I am an expression to
evaluate" and "I am a splice of another file". There are two ways to carry that
information. A **schema** annotates each key with what it may hold, so the loader
knows from the key name whether the string under `optimizer` is a class path or
an id. A **sigil grammar** makes the value self-describing: a reserved prefix
character says what the string is, regardless of which key holds it. This
technique is the case for the second, and the discipline that keeps it from
becoming the first's problem in a different costume.

## Why the prefix wins

A schema puts the grammar in every key definition, which means it is in as many
places as there are keys, and a new key added without its annotation is a key
whose reference values are silently treated as strings. A sigil grammar puts the
grammar in one place — the alphabet — and every key inherits it. A file can then
put a reference anywhere a value goes, including inside a list, inside a nested
argument, or as the sole content of a string that the schema would have called
free text. The format stays open: an author can wire a node into a position the
framework never anticipated, because the framework's opinion is about the
alphabet, not the positions.

The cost is that literal data starting with a sigil character needs escaping, and
that cost is the whole reason the alphabet must be tiny. Every character reserved
is a character that ordinary values can no longer begin with unescaped. Four is
about the ceiling: one for a reference to a node, one for an evaluated
expression, one for a textual macro, one as a key-prefix for merge. Beyond that
the format is designing a language and should admit it.

## The alphabet is a closed set with one home

Write the sigils as named constants in a single module, and have every parser,
resolver and pretty-printer import them from there
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The failure this prevents is concrete: a reference regex in the resolver, a
prefix check in the parser, and a stripping call in the pretty-printer each
carry their own copy of the character, and the copies drift the day someone
decides the macro character should change. The same module carries the id
separator, because the separator is part of the same grammar — a reference's
text is the sigil followed by an id, and the id's own grammar (which character
joins path segments, what a relative segment looks like) is inseparable from
the reference's.

The specification page for the format lists exactly the alphabet the module
holds, with one example each, and states what each sigil means in every
position: as a whole value, as a prefix of a longer string, inside an
expression. A sigil whose meaning depends on position is a sigil with two
meanings, and the page must say both.

## Rules for each sigil

**The reference sigil applies to the whole string or not at all.** A value
that is exactly a sigil plus an id resolves to the referenced object, whatever
its type. A string that merely contains the sigil somewhere in the middle is
literal text, because the alternative — substituting object representations
into arbitrary strings — is the string-substitution injection that
[escape-hatch-expressions](./escape-hatch-expressions.md) forbids. If an
author wants an object's value inside a string, the expression sigil exists
for exactly that.

**The expression sigil is a prefix, and everything after it is code.** The
loader hands the remainder to the evaluator; it does not parse it further. A
reference inside the expression is recognised by the reference sigil and bound
as a name, but that is the evaluator's concern, not the grammar's.

**The macro sigil is resolved before any of the others.** A macro denotes text
from another file, and text has no type, so a macro must be gone — replaced by
what it names — before the reference and expression sigils are interpreted.
The ordering is a property of the grammar, and the page says so.

**The merge sigil is a key prefix, not a value prefix.** It marks how a key
composes across layers, which is a question about the key, not its content;
putting it on the key keeps it out of the value grammar entirely.

## The sigils will meet a shell

The same values will be typed on a command line as overrides, and the
characters a config grammar finds convenient — a dollar sign, a hash, a
percent — are exactly the ones shells and argument parsers interpret. Choosing
them is defensible (they are visibly unusual, which is what a sigil needs), but
the specification then owes the reader one paragraph on quoting: which sigils
need escaping in which shell, with one worked example per sigil. A format that
documents its sigils and not their escaping has documented half the grammar,
and the missing half is the one every operator hits within a day.

## Escaping and ambiguity

A literal value that begins with a sigil character needs a way to say so. The
cheapest rule is a doubled sigil, or an expression that yields the literal
string; either is acceptable, but the format must choose one and document it,
because the absence of an escape rule is discovered by the first author whose
label text starts with the reference character. Where two sigils could in
principle combine — an expression whose first character is the reference
sigil — the grammar must state which is read first, and the safe answer is that
the expression sigil wins and the reference sigil inside it is the evaluator's
to bind.

## When not to use this

A format whose values are all leaves — a settings file with no references — does
not need a sigil and should not have one; a reserved character in a format that
never uses it is pure escaping cost. A format that must be validated by
arbitrary readers who cannot run the loader is better served by a schema, because
a schema is checkable without resolution and a sigil is checkable only by
resolving. And once a format wants more than four sigils, the honest move is
to stop extending the alphabet and either expose the expression hatch for the
new need or acknowledge that a real language with a real parser is what is
being built.
