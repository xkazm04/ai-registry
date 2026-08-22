---
layer: technique
type: technique
subject: authoring-block-vocabulary
technique: blocks-as-machine-readable-source
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [emitting structured data from authored content, a second consumer needs the structure of a page without a renderer, deciding whether a block grammar may change]
---

# Blocks as machine-readable source

The moment something other than the renderer reads a block, that block's grammar
stops being an implementation detail and becomes an interface. This technique is
about noticing when that has happened, deciding it deliberately instead of
discovering it, and living with the consequences.

## The second consumer, and why it exists

A closed authored vocabulary means the structure of a document is recoverable
from its text. That is not a theoretical property; it is what lets a whole class
of consumer exist without a client runtime:

- **A structured-data emitter** that turns a procedure block into a machine-
  readable how-to, a question block into a question-and-answer set, an offering
  block into availability facts — so that indexers and assistants receive the
  page's structure instead of guessing at it from paragraphs.
- **A search index** that weights a step differently from a caption, and that can
  return the *block* rather than the page.
- **A navigation or outline builder** that derives section structure from the
  same bodies the renderer uses.
- **An export pipeline** — print, offline bundle, plain-text feed — that
  re-realizes the content in a medium the renderer knows nothing about.
- **A retrieval corpus** for a summarizer or assistant, which does far better on
  text whose structure is explicit than on a rendered page it must reverse
  engineer.

Every one of these is a reason the vocabulary was closed in the first place. If
none of them will ever exist, this technique is not load-bearing, and its
absence should be a recorded decision rather than an oversight.

## Read the source, never the render

The second consumer parses **the same body text the renderer parses**. Two
alternatives present themselves and both are traps.

- **Scraping the rendered output** makes the extractor depend on the component
  tree — spacing changes break it, and it can only run where a renderer runs. It
  also inverts the dependency: content structure now derives from presentation.
- **Maintaining a parallel structured file** beside the body — the steps listed
  once in the prose and once in a data file — guarantees the two disagree, and
  the disagreement is invisible because neither side reads the other. Worse, it
  multiplies by locale.

And read *all* of the source. Authored bodies usually live inside a container —
a data module, a bundle, an archive — and an extractor that pulls bodies out of
the container with a pattern rather than parsing the container will eventually
stop early: a delimiter that appears legitimately inside a body ends the match,
and the extractor silently returns a prefix. Everything downstream then operates
on that prefix while reporting success, which is the same shape of defect as a
gate reading a proxy. The container is parsed by something that understands the
container; the body is parsed by the block grammar; neither job is done with a
pattern that guesses at the other's boundaries.

Anything derived from a body names how it is recomputed, and here the
recomputation is a sentence long: re-parse the body with the block's parser
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Cache the result if the cost warrants it; the cache is then a cache, with an
invalidation tied to the body, and not a second source of truth.

## One parser, or a narrower one that says so

Ideally the second consumer calls the same parsing function the renderer calls.
Frequently it cannot — it runs in a different process, at a different stage, in
a context with no rendering machinery — and so it re-implements a reduced parse:
find the fence, take the lines, split on the separator.

That is acceptable, and it is a
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
exposure that has to be handled rather than ignored. The rules that keep it
honest:

- The reduced parse is **deliberately narrower**, never differently permissive.
  It may recognize fewer blocks; it may not accept a syntax the renderer
  rejects, because then a body could emit structured data for content no reader
  ever sees.
- The narrowing is **written at the extraction site**, naming which blocks it
  reads and which it ignores, so the next person does not "fix" the gap by
  guessing.
- The two parsers are pinned together by a test over a real body: the same input
  through both, and the extracted structure must be a subset of the rendered
  structure.

## The grammar is now frozen for presentation reasons

This is the cost, and it is worth paying only where the value is real. Once a
block feeds a second consumer:

- **Changing its separator, its field order, or its fence name is a breaking
  change**, and it breaks quietly — the extractor stops matching and emits
  nothing, which looks exactly like a page that has no steps. Nobody watches an
  absence.
- **Adding an optional field is safe; reordering is not.** Positional grammars
  are legible precisely because position carries meaning, which is the same
  reason position cannot move.
- **A grammar change is therefore a migration**, run in the same order as
  retiring a directive: accept both forms, sweep the corpus in every locale,
  drop the old form.

So mark the contract blocks explicitly. A vocabulary where some blocks are
interfaces and some are decoration is fine; a vocabulary where nobody knows
which are which means either every grammar is frozen or every consumer is
fragile.

## Emitted structure must match the page

The last rule is an honesty rule, and it has teeth beyond taste. Structured data
emitted from a body must describe **what the reader actually sees on that page**
— the same steps, in the same order, with the same text. It is tempting to
enrich: add the steps from a related page, keep emitting a procedure whose block
was removed, promise availability the page hedges. Indexers treat that as
misrepresentation and penalize the whole surface, and an assistant that ingests
it will state the false version confidently to a user.

Two consequences follow mechanically. Emission is driven by the parse, so a body
with no procedure block emits no procedure — an empty extraction is a correct
extraction and must not fall back to a hand-written default. And per-locale
bodies emit per-locale structured data from their own text, which is another
reason the structural-equivalence check across locale copies matters
([vocabulary-as-translation-invariant](./vocabulary-as-translation-invariant.md)):
a locale that lost a block now under-reports its own page to every machine
reading it.

## When not to do this

Do not make a block machine-readable speculatively. Extraction is code with a
maintenance cost, and freezing a grammar with no consumer behind it removes
freedom for nothing. Wait for the first real consumer, then decide — the
vocabulary being closed is what guarantees the option stays available, and the
option is the asset, not its exercise.
