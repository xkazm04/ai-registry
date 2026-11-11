---
layer: technique
type: technique
subject: compile-time-code-emission
technique: representation-strength-from-input-contract
status: forged
laws: []
shared_with: []
use_when: [deciding whether an emitter parses its input as raw tokens or as a full syntax tree, an embedded little language is rejected with a host-syntax error, a generator re-implements the host grammar with hand-written token matching, choosing a tree for a tool that writes back into authored files]
---

# Representation strength from the input's contract

An emitter can see its input at three strengths. A **token tree** is the
lexed input grouped by brackets and nothing more: it accepts anything the
host's lexer accepts. A **full syntax tree** parses the input as the host
language and hands the emitter typed nodes - a function, its signature, its
parameters, its body. A **lossless tree** is a full syntax tree that also keeps
every comment, space and newline, so printing it reproduces the original file
exactly. The strength is chosen by what the input promises, and the promise
is set by where the emitter is invoked, not by what is convenient to code.

## The rule

- **The input is a little language** - a list, a query, a table, a grammar
  embedded in the host - and may not be host syntax at all: take the token
  tree, and write a narrow parser for exactly the little language's grammar.
  A full parse would reject legal input with a host-syntax error that names
  constructs the user never meant to write.
- **The input is guaranteed host code** - the declaration an attribute is
  attached to, the type a generator inspects - take the full syntax tree.
  Hand-matching tokens for a function's signature re-derives the host grammar
  badly, misses the forms nobody tested (generics, attributes, visibility
  modifiers, asynchrony) and breaks when the language adds one.
- **The output goes back into a file a person will read** - a codemod, a
  refactoring tool - take a lossless tree. Anything weaker reprints the file
  and destroys what the change never touched.

One host design states the reason the middle tier matters: its macro
arguments are parsed and type-checked against declared parameter types
*before* the implementation runs, so ill-typed input never reaches the
emitter. That is the full-tree contract taken to its end, and it is why such
emitters can be short. A host that gives emitters only tokens leaves the
choice to the author, and the author has to make it deliberately.

## Parse no deeper than the decision needs

Strength is also a cost: a full parse of a large input is slower, and a
richer tree pulls in a heavier parser at build time. Within the right tier,
parse only the part the emitter decides on, and carry the rest through
untouched. A wrapper that needs to know the names in a list it wraps can
parse those names and re-emit the original tokens verbatim, which keeps the
original locations and leaves the downstream consumer seeing exactly what the
user wrote.

## Where the choice fails silently

Two failure shapes deserve naming because neither produces an obvious error.
A **permissive extractor** over a token tree - one that keeps every token it
recognises and drops the rest - accepts malformed input as if it were valid:
a list with its separators missing is read as the list. The narrow parser
must reject what is not in the little language's grammar, with a diagnostic,
never filter it. And a **full-tree emitter that discards trivia** looks
correct in every expansion test, because expansions are compiled, not read; it
fails only when the same code is reused to write back into source.

## Relation to an import waist

An import pipeline also chooses a representation, and it is tempting to
merge the two decisions. They differ in kind: an import waist lowers foreign
data into the product's own vocabulary and records what was lost; an emitter
picks how much of the host grammar to trust its input with, and loses nothing
it then re-emits.

## When not to use this

A declarative pattern macro has no choice to make - the host matches its
input against declared fragment kinds - and the rule reduces to declaring the
narrowest fragment kind each pattern needs.
