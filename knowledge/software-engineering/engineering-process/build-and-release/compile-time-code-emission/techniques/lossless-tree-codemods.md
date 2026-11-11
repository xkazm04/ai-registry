---
layer: technique
type: technique
subject: compile-time-code-emission
technique: lossless-tree-codemods
status: forged
laws: []
shared_with: []
use_when: [planning an automated rewrite across many authored files, a codemod diff reformats lines it never meant to change, deciding between text replacement and a tree-based rewrite, a migration must match calls by what they refer to rather than by their spelling]
---

# Lossless-tree codemods

A codemod is an emitter whose output becomes authored source: it rewrites
files across a codebase once, and people review, merge and own the result.
It works on a tree that round-trips the file byte for byte, reprints only the
nodes it changed, matches on what code *means* where spelling is ambiguous,
is idempotent, and has a dry run that shows the diff without writing.

## Why the tree must be lossless

An abstract syntax tree discards what the compiler does not need: comments,
blank lines, the spacing between arguments, the file's newline style. A
codemod that parses to such a tree and prints it back reformats every line of
every file it touches, and the diff of a thousand files buries the real change
in noise no reviewer can read. Concrete-syntax-tree libraries were built for
this: one states its property as preserving all whitespace so the tree can be
reprinted exactly, and accepts the costs - extra nodes for commas and
whitespace, slower parsing - as the price. Other toolkits take a second
route to the same end, with a printer reprinting only nodes the transform modified
and copying the rest from the original text.

The test of losslessness is mechanical: parse and print every file with the
transform disabled, and the output must equal the input byte for byte.
Anything less and the codemod will touch files it did not mean to.

## Match on meaning, not spelling

Text replacement and purely syntactic matching both match spelling. A call
named `info` on a receiver called `logger` is three different calls in three
files, depending on what `logger` was imported as. A tree with type
attribution - each node carrying the resolved type, including types defined
outside the file - lets the codemod match on what the call refers to; one
refactoring platform names this as necessary for accurate matching. Where the
tooling has no attribution, the codemod resolves imports itself and refuses
any site it cannot resolve, reporting it rather than guessing.

## Procedure

1. Prove the round trip on the whole target set before writing the
   transform.
2. Write the transform as fixture pairs - input and expected output - and
   include files where it must do nothing.
3. Make it idempotent: running it on its own output changes nothing. A
   codemod that is not idempotent cannot be re-run after a partial merge or a
   rebase, which is exactly when it is needed.
4. Run it dry, read the diff and the counts - changed, unchanged, skipped,
   failed - and treat every skip and failure as a list to work, not a number.
5. Land it as its own change, separate from hand edits, so review reads the
   mechanical diff as mechanical and the hand edits as decisions.
6. Leave inserted code in the surrounding style. A lossless printer with
   format-aware insertion matches the file it is writing into; otherwise run
   the project's formatter on changed files only.

## When not to use this

A rename the language's own refactoring tool can perform with full semantic
knowledge should be done by that tool. A change touching a handful of files is
faster and safer by hand. And a codemod is a one-shot emitter: if the same
transform has to run on every build, it is not a codemod but a generator, and
the rest of this subject - or the pipeline discipline of committed derived
source - governs it.
