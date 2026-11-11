---
layer: technique
type: technique
subject: compile-time-code-emission
technique: target-syntax-templates
status: forged
laws: []
shared_with: []
use_when: [an emitter builds its output by concatenating or formatting strings, a generated identifier is assembled by pasting text fragments together, choosing between a template system and a text writer for a generator]
---

# Target-syntax templates

An emitter builds its output in the target language's own syntax, written as
a template with typed holes for the parts that vary, rather than assembling
the output as text. The template is quoted code: it looks like the code it
produces, it is checked as that code's syntax when the emitter is compiled,
and each hole accepts a value that already *is* a piece of syntax - an
identifier, an expression, a list of items - not a string that will become one
after the compiler reparses it.

## What the string form loses

String assembly appears to cost nothing, which is why it is the default in a
first emitter. Its costs arrive later and far from their cause.

- **Well-formedness is checked last.** A missing brace or a misplaced
  separator in a format string is found only when the compiler reparses the
  emitted text, at the invocation site, with an error pointing into generated
  code. A template is malformed when the emitter itself is compiled, at the
  line that is wrong.
- **Token boundaries are lost.** Text cannot distinguish a prefix glued to an
  identifier from two adjacent tokens. Template systems expose this directly:
  writing a prefix next to a hole yields two tokens, and an identifier built
  from parts must be made with the template system's identifier constructor.
  That constructor is the point - it refuses a name that is not a legal
  identifier at emission time, where text would pass it along.
- **Source locations are lost.** A piece of syntax taken from the caller
  carries the caller's location. Interpolated into a template it keeps it, so
  a type error in that piece is reported on the caller's line. Converted to a
  string and back it is located at the invocation as a whole, or nowhere.
- **Every tool that understands the target goes blind.** Highlighting,
  formatting, navigation and review all work on a template body and none of
  them works on a string literal. The tutorial-level reason - "the template
  is highlighted" - is the visible tip of this.

Typed quotation systems take the rule one step further: a quoted expression
carries the static type of the code it denotes, so a splice of the wrong kind
fails when the emitter is compiled. Where the host offers that, use it; where
it offers only token-level quotation, the well-formedness and location
benefits still hold.

## Procedure

1. Write the expansion for one concrete input by hand, as ordinary code, and
   compile it. That is the template's body.
2. Replace each varying part with a hole, and make each hole's value a piece
   of syntax obtained from the input or built with the syntax constructors.
3. Express repetition with the template's repetition form over a collection,
   not with a loop that appends text, so separators are emitted by the
   template and never doubled or dropped.
4. Build new identifiers with the identifier constructor, and give them the
   location of the input they were derived from, so a collision is reported
   where the user can act on it.
5. Keep literal names in the template rooted, per the hygiene rule the
   subject's golden path points to.

## When a text writer is still right

A generator that produces **a whole file**, which the compiler parses on its
own, has a different trade. One generator vendor's guidance recommends
exactly that: an indentation-aware text writer rather than syntax-tree
construction, because normalising the whitespace of a constructed tree is
expensive and the host accepts the output only as text anyway. The output is
not spliced into a caller, so location loss matters less, and readability of
the emitted file matters more. The discriminator is **where the output
goes**. Spliced into a caller as tokens: a template, always. A standalone file
reparsed whole: a text writer is acceptable, provided a test parses every
emitted file and the writer owns indentation, never the call sites.

## When not to use this

A generator that emits a data format, not code, wants that format's own
serializer, not a code template. And a template that has grown more holes
than fixed text is a sign the emitter is doing work an ordinary function in
the target could do at run time; move it there.
