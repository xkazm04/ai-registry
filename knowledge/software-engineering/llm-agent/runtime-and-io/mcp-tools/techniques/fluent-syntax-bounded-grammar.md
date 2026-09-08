---
layer: technique
type: technique
subject: mcp-tools
technique: fluent-syntax-bounded-grammar
status: forged
laws: [one-validation-door, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [a tool input accepts a syntax the model already writes fluently, choosing between a structured schema and a familiar command string, a passthrough surface must not inherit the wrapped thing's authority, an argument string is about to be handed to a shell]
---

# Fluent syntax, bounded grammar

[tool-schema-design](./tool-schema-design.md) says a tool's arguments should
be typed fields the model fills in, and it is right nearly always. There is
one recurring case where a structured schema is the worse contract: when the
operation already has a **notation the model writes better than it fills in
forms** — a command line, a query language, a glob, a regular expression.
Decomposing a search command into fifteen optional properties does not make
the model more accurate; it makes it translate out of a notation it knows into
a schema it has never seen, and the translation is where the calls fail.

The tempting resolution is to take the string and run it. That hands the model
the notation's *authority* along with its syntax, and for a command line that
authority is arbitrary code execution at the server's trust boundary.

The technique is the third option: **accept the fluent syntax, implement a
parser for it, and admit only the fragment of the grammar the operation
needs.**

## The shape

1. **Take the string the model is fluent in.** A single `command` field
   holding what the caller would have typed.
2. **Parse it to an argument vector yourself. Never pass it to a shell.**
   The familiar surface is a *notation*, not an execution model, and the whole
   point is that the two are separable.
3. **Reject every operator by name.** Pipes, redirections, separators,
   backgrounding, and command substitution (`$(…)`, `${…}`) each produce an
   error that says which operator was refused. A parser that drops what it
   does not understand is worse than one that never accepted the string,
   because the model gets results for a command it did not write
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
4. **Admit the exceptions the operation itself requires, and no others.** A
   search tool whose results are exhaustive by default needs one way to say
   "bound this", and the notation the model already reaches for is a trailing
   `| head -N`. So exactly that is admitted — a trailing `head`, with an
   optional count, parsed and applied by the tool as a limit. Not a pipeline:
   one whitelisted suffix that happens to be spelled like one.
5. **Validate the resulting argv against the surface's own allow-list**, which
   is where [caller-differentiated-capability](./caller-differentiated-capability.md)
   takes over.

The admitted fragment is a whitelist, never a denylist of dangerous
constructs. A denylist over a notation as large as a shell grammar is an
[absent guard](../../../../_laws.md#absent-guard-is-loud) with extra steps: it
protects against the constructs somebody thought of, and shells have more
constructs than anyone enumerates. Because the parser accepts a closed
grammar, everything outside it is refused by construction rather than by
recognition — one door, and nothing to remember
([one-validation-door](../../../../_laws.md#one-validation-door)).

## Why the whitelist has to be justified operationally

The interesting discipline is step 4, and it is where this design usually
rots. Every admitted operator needs a reason drawn from the *operation*, not
from the model's convenience — "agents keep trying it" is a reason to return a
clear error, not a reason to implement it. The bounding suffix earns its seat
because the tool's own contract is "exhaustive unless bounded", so without it
the model's only way to limit output is to not ask. A second operator admitted
because it seemed harmless is how a parser becomes a shell one commit at a
time.

Write the admitted fragment down as a list next to the parser, with the
operational reason beside each entry. The list is the contract; the parser is
its implementation, and a reviewer needs to be able to read the first without
the second.

## Platform notation is part of the grammar

A notation that looks universal is not. Backslashes are path separators on one
family of platforms and escape characters in the grammar being borrowed, and a
parser that picks one reading breaks half its callers silently. Decide per
construct, document the decision, and prefer the reading that matches the
platform the *paths* come from rather than the one that matches the notation's
origin — the model is describing files, and the files win.

## What this cannot do

The parser bounds the syntax, not the semantics. A perfectly parsed command
can still request something the tool should refuse — a path outside the root,
a pattern that will scan a million files — and those are separate checks that
run on the parsed form. This technique buys exactly one thing: that the string
the model wrote is never interpreted by anything with more authority than the
tool itself. Everything after that is ordinary argument validation, and
skipping it because the parse succeeded is the failure this technique is most
often mistaken for a defence against.
