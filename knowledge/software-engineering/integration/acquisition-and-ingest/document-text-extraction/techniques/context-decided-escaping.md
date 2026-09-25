---
layer: technique
type: technique
subject: document-text-extraction
technique: context-decided-escaping
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [a converter emits Markdown or another lightweight markup from document text, text vanished or changed shape only after the output was rendered, a fix for one swallowed character escapes every occurrence of it and prices or identifiers come back with backslashes, text runs are escaped one at a time and then concatenated with emitted markup, an extracted field is later embedded in or joined to other output, a plain-text consumer strips markup from a converter's output]
---

# Context-decided escaping

An extractor that emits markup has a second way to lose text that none of the
subject's region instruments can see: the text arrives, every character of it,
and then **parses as syntax**. A placeholder written in angle brackets renders
as an unknown tag and disappears. A paragraph that begins with a year and a full
stop becomes a numbered list and loses the year. Two stars around a word become
emphasis and lose the stars. Character counts are healthy and the output reads
as complete, so this is the serialization-stage sibling of
[structure-saturation-guard](./structure-saturation-guard.md): structure the
document never had, invented here by the output format rather than by a
classifier.

The obvious repair is to escape every character that can ever be syntax, and it
fails the other way. Every consumer that reads the output as text rather than
rendering it pays for each backslash - a model reading the page, a search index,
a plain-text field stripped from it - and blanket escaping pays it on prices,
arithmetic, identifiers and every bracket in the document. The usual history is
both failures in sequence: a new construct makes one character significant, the
fix escapes that character everywhere, and the next release is about the prices.

## Escape where the character would parse, decided on the assembled output

The rule: **escape a text character only where it could parse as syntax in the
output as assembled.** Whether it can is a property of its neighbours, and its
neighbours are often written by other code - the next element's emphasis
marker, a code span's backtick, a link's bracket. So the decision cannot be
taken while one text run is escaped in isolation. It needs two things:

- **Provenance.** The decision is about document text; the markup the converter
  emits is not escapable and must not be escaped. Keep the distinction until the
  decision is made, either by rendering runs through an escaper that is told
  what the later runs will emit (one reverse pass over the runs computes it for
  all of them), or by marking text characters as they are written and deciding
  once the block is assembled. Both are this rule. A per-run escaper with
  neither is the defect.
- **The right scope.** Delimiters pair across the whole inline container - a
  paragraph, a list item, a heading, one table cell - not across a line.
  Emphasis spans a line break inside a paragraph. A table cell is parsed on its
  own, so pairing stops at the cell border.

## Look ahead for what cannot be escaped

A pair whose halves are both document text is broken by escaping **either**
half, and the later half can always see the earlier one. So lookahead is not
needed for text-text pairs: escape the later half. It is needed exactly where
the partner that follows cannot be escaped:

- **Syntax the converter will emit.** A text backslash before a strong marker
  escapes the marker's first star; a text `!` before a link turns the link into
  an image; a text backtick before an inline code element opens a span the
  element closes.
- **Backticks, always.** A backslash does not stop a backtick from closing a
  code span, so of a backtick pair it is the opener that must be escaped, and
  the opener needs to see every later backtick, text or not.
- **One-character adjacency.** A backslash matters only before punctuation, `<`
  only before a letter or `/`, `&` only before an entity name. These read the
  next character, whoever writes it.

Escaping both halves of every pair is also correct, and costs roughly twice the
backslashes for no additional fidelity.

Block syntax is the other direction: it depends on what came **before** - is
this the first character of block content? That position is after a list
marker or a quote prefix too, not only at a line start. A list item whose text
begins with `# ` is a heading inside the list.

## Unknown context escapes as though a partner follows

Where the output is a value somebody else will place - an extracted field, a
fragment its caller embeds or joins - what follows its end is unknown. Treat
that end as the worst case: a trailing delimiter that could open is escaped as
if a partner follows it
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A whole
document's end is known and needs no such treatment; applying it there only
adds backslashes.

## The consumers that strip markup

A consumer that turns the output into plain text by deleting markup characters
must also drop the escapes, or it inherits every backslash the escaper added.
This breaks silently the day the producer starts escaping, so change both in the
same change, and give the plain-text consumer a test fixture with a character
that needs escaping.

## Testing it

Two tables that pull in opposite directions, asserted together:

- **Must escape**: text that pairs with emitted syntax, a text pair split by an
  element, text that starts block content, text that reads as a tag or an entity.
- **Must not change**: prices, `5 * 3`, `snake_case`, a lone star, `a < b`,
  ampersands, backslash paths. Byte-identical output, zero backslashes.

The first table alone is passed by blanket escaping; the second alone is passed
by escaping nothing. For a converter already in production, add a rendered-text
oracle over real pages: render the output with a strict parser, compare the
visible text with the source's visible text after removing whitespace, and count
the characters that differ. That is what finds the swallowed placeholder the
seam tables did not think of.

## When not to reach for this

Output that is parsed back by a program (frontmatter scalars, configuration,
anything with a round-trip test) wants a total, quoted encoding, not a minimal
one: its reader is a parser, not a person, and quoting every value is cheaper
than proving which ones are safe. Minimal escaping is for text that people,
models and renderers read.
