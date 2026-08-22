---
layer: technique
type: technique
subject: authoring-block-vocabulary
technique: per-block-line-grammar
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [designing the syntax inside a custom content block, choosing between a universal attribute syntax and per-block grammars, a malformed authored line breaks a whole page]
---

# Per-block line grammar

Each block type in the vocabulary defines its own grammar for what goes between
the fences. The grammars are not unified, and that is a decision, not an
oversight.

## Why not one attribute language

The engineer's instinct is a single bracketed key-value syntax shared by every
block: one parser, one specification, uniform tooling. For authored prose it is
the wrong trade, for three reasons that all bite the same person.

- **It is a second language to learn.** A writer who knows the base markup now
  has to learn an attribute dialect before they can write a callout. The
  vocabulary's whole justification was that non-engineers can author into it.
- **It forces quoting and escaping.** A general attribute syntax must let a
  value contain its own delimiter, so it acquires quotes, and then escapes for
  the quotes. Prose is made of apostrophes, colons, commas and quotation marks;
  a writer now spends attention escaping their own sentences, and gets it wrong
  in the locale where the punctuation is different.
- **It fails globally.** One unbalanced quote in a general grammar can consume
  the rest of the block, or the rest of the document. A per-block line grammar
  cannot: the worst a bad line does is lose that line.

Uniformity is worth having *between* blocks, but at the level of habits — every
block is line oriented, every block puts one item per line — not at the level of
a shared parser.

## The one-example test

The acceptance test for a block's grammar is: **can someone who has seen exactly
one example, and who does not know the renderer, write a correct second
instance — and retype the whole thing in another language without breaking it?**
That is not a thought experiment; it is literally the situation of every
translator who will ever touch the corpus.

Grammars that pass have the same shape:

- **Line oriented.** One item per line; the line break is the separator between
  items, because it is the one delimiter no writer can typo and every editor
  makes visible.
- **At most one separator character within a line**, splitting a line into a
  fixed number of fields. Two separators is usually a sign the block is carrying
  a table and should be a table.
- **Positional fields, not named ones.** `label | text` beats
  `label="x" text="y"` in every dimension that matters here; the field order is
  learnable from the example and there is nothing to misspell.
- **No nesting.** A block does not contain another block. Nesting requires
  balanced delimiters, and balanced delimiters are what a translator breaks.
- **No quoting, no escaping.** If a value may legitimately contain the separator,
  either the separator is wrong or the field belongs somewhere else.

## Choosing the separator

The separator has to be a character prose does not use and a translator will not
localize. The candidates, ranked by how they behave in practice:

- **A vertical bar** — effectively absent from natural prose in any language,
  visually obvious, survives copy-paste. The usual right answer.
- **A double colon or double dash** — acceptable; slightly more typing, and
  needs a rule for what happens when a single one appears in the prose.
- **A single colon** — tempting and treacherous. It appears constantly in
  ordinary sentences, and it is what a typographic pass may sit next to; a
  grammar that splits on the first colon will eventually eat a sentence.
- **A comma or a semicolon** — never. Both are ordinary punctuation, and both
  change usage between languages.

Whatever is chosen, it is a **do-not-translate token** and appears as such in
the translator's instructions
([vocabulary-as-translation-invariant](./vocabulary-as-translation-invariant.md)).

One refinement that only shows up once real people are typing into the corpus:
**accept the separator as a class, not a literal.** A dash separator should
match the hyphen, the en dash and the em dash interchangeably, because editors
autocorrect them, translators type the one their locale prefers, and the
corpus's own typographic pass may have rewritten one into another. Tolerance
costs one character in a pattern and removes a whole category of "the block
vanished and nobody knows why" — and it applies to the *shape* of the separator
only, never to field order or enum labels, which stay exact.

## Continuation lines and where prose actually goes

Real authored blocks want more prose than fits on one line, and the naive answer
— let a field wrap and require the writer to escape the newline — reintroduces
escaping. The better rule: **a line that does not start a new item is appended
to the previous item.** A line that lacks the block's item marker (or lacks the
separator, depending on the grammar) folds into the item above it as continued
prose.

That rule has three properties worth the small parser complexity. Writers get
paragraph-length content without a new syntax. Translators get to reflow text to
whatever length their language needs — a translated sentence is routinely half
again as long as its source — without changing the item count. And a stray blank
or indented line becomes harmless instead of becoming a new empty item.

The rule needs one guard: a continuation line arriving before any item has
started is discarded, not attached to nothing.

## Failure is per item, and per item is not per nothing

A malformed line loses that line. It does not throw, it does not abort the body,
and it does not render as raw text. But a block whose items *all* fail parses to
an empty block, and an empty block rendered as nothing is indistinguishable from
a block the author deliberately left empty
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
So the parser reports skipped lines upward to the same build-time count that
carries unknown directives, and a block that parsed zero items out of a non-empty
payload is a build failure rather than a quiet blank.

The reader-facing behavior stays the same in both cases — nothing on the page —
because the reader is not the audience for the failure.

## Pre-rendering the prose, once

Blocks contain human writing, and human writing wants real punctuation: proper
dashes, true quotation marks, ellipses, non-breaking spaces before units. That
transformation belongs in **one inline pass applied to every field of every
block**, run after the structural parse and before any output is emitted — never
in individual block renderers, where it will be applied to two of six blocks and
forgotten in the rest.

The ordering is load-bearing in both directions. Structural parsing happens
first, so the typographic pass can never invent or destroy a separator; the
typographic pass happens before output, so no field escapes it. And the pass
itself is part of the invariant surface: if it converts a straight quotation mark
into a curly one, translators must not be asked to type curly ones, and the
locale bodies stay typable on any keyboard.

Treat the overlap as a live hazard, not a coincidence: a typographic pass earns
its keep by rewriting runs of hyphens, runs of equals signs and doubled
punctuation, which are exactly the sequences that make good structural
separators. Only the ordering keeps them apart, so the ordering is stated where
the parse is written — a refactor that moves the typographic pass earlier "to
normalize the input" silently eats every separator in the corpus.

## When not to use a line grammar

When the item has more than about three fields, or the fields are genuinely
optional and unordered, a line grammar stops being legible and starts being a
puzzle. That is the signal that the content is **data, not prose**, and it
belongs in a structured record beside the body rather than inside it — referenced
from the body by an identifier, edited with its own tooling, and translated
field by field. The vocabulary is for structure that lives *inside* a sentence's
neighborhood. Everything else is a record that happens to be shown near one.
