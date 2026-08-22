---
layer: golden-path
type: golden-path
subject: authoring-block-vocabulary
status: forged
use_when: [extending a lightweight markup language with custom content blocks, deciding between embedded components and a fixed directive list, an authored corpus must be hand-translated into many locales, a second consumer needs to read authored content without a renderer]
techniques:
  - closed-directive-set
  - per-block-line-grammar
  - enum-guarded-block-payloads
  - vocabulary-as-translation-invariant
  - blocks-as-machine-readable-source
---

# Authoring block vocabulary

Every documentation surface reaches the same afternoon. Plain markup gives
headings, emphasis, lists, links and code — and the writer needs a numbered
procedure that looks like a procedure, a warning that looks like a warning, a
comparison of three plans with an availability badge on each. The base language
has no opinion about any of that, so something has to be added on top of it.

An **authoring block vocabulary** is one answer: a closed, enumerated set of
named block directives layered on the markup language, each with its own small
line grammar and its own validated payload vocabulary, dispatched by one
recognizer, where a directive the recognizer does not know **renders nothing**
rather than leaking its own syntax to the reader. The author types a fenced
directive into a text file; the parser turns it into one of a fixed number of
component shapes; anything outside the list falls off the surface silently and
loudly complains somewhere the author will see it.

The alternative is not wrong, and naming it honestly is the first job of this
subject. The **open** answer lets content embed arbitrary components — the
authoring file becomes a program, and a writer can reach for anything the
codebase can render. That buys authoring power without limit. It spends three
properties, and it spends them permanently:

- **Translatability.** A closed vocabulary can be handed to a translator who has
  never seen the renderer, because the only thing they must not touch is a
  handful of literal tokens. An open vocabulary makes every translation a code
  review.
- **Second consumers.** A closed vocabulary can be re-read by something that is
  not the renderer — a search indexer, a structured-data emitter, a summarizer,
  a print pipeline — from the source text alone, with no client runtime. An open
  vocabulary means the only way to know what a document says is to execute it.
- **Re-renderability.** A closed vocabulary outlives its renderer. The bodies are
  text with a documented grammar, and a replacement renderer is a weekend. An
  open corpus is bound to the framework it was written against for as long as it
  exists.

So the decision rule is not "closed is better". It is: **when the content will
be translated by people, read by machines, or outlive the renderer, the
vocabulary is closed; when the content is a handful of pages one team writes and
one team renders, the open form costs nothing you were going to spend.** The
mistake to avoid is drifting into the open form by accident, one escape hatch at
a time, and discovering the bill on the day the corpus goes multilingual.

## Where this subject stops

This subject owns the vocabulary a **human types into a text file** and the
parser that reads it back. That authorship is the whole design pressure. The
grammar must be legible to a writer who is not an engineer, retypable from one
example by a translator who does not know the renderer, and stable enough that a
document written years ago still parses. Nothing here is defending against an
adversary; it is defending against a typo, a well-meaning translator, and time.

That is precisely the seam against
[schema-driven-ui](../../input-and-editing/schema-driven-ui/schema-driven-ui.md),
which owns the closely related discipline for a specification a **machine
composes** and a host renders. Its vocabulary is a node set validated on arrival
because its author is a program whose output inherits the trust level of
everything upstream of it; its hard problems are repair, drop disclosure, action
consent and injection. Ours has no injection surface worth the name — the author
is a person with commit access, who could simply have edited the renderer — and
its hard problems are legibility and survival. The rule for picking: **ask who
typed the artifact.** If a program composed it and a validator must decide
whether to trust it, that is schema-driven UI. If a person wrote it as prose
with structure interleaved, and the question is whether a translator, an indexer
and a future renderer can all still read it, that is this subject. Both are
closed vocabularies; they are closed against different enemies, and the enemy is
what sets the design.

Two other neighbours border this one. The same closed-set instinct applied to
model output — propose only from an enumerated grammar, refuse the rest — is
[op-grammar-allowlisting](../../../llm-agent/prompt-and-context/structured-output/techniques/op-grammar-allowlisting.md),
where the payoff is that an unknown name cannot *execute*; here nothing
executes, and the payoff is that an unknown name cannot *leak*. And rendering
the base markup language itself, safely and faithfully, without extending it, is
[markdown-and-code-rendering](../../shell-and-navigation/chat-transcript/techniques/markdown-and-code-rendering.md):
if you are rendering a language somebody else defined, that is the neighbour; if
you are defining new directives on top of one, that is this.

## One dispatch, and it returns nothing for strangers

The vocabulary exists in exactly one place: a dispatch that takes a recognized
directive and returns a rendered block, and returns **nothing** for everything
else. Not a placeholder, not an error card, not the raw text — nothing. This is
the single most important structural rule in the subject, and it is unintuitive
enough that it gets argued in every review, so state the reasoning:

A published reading surface has no operator. The person looking at it cannot fix
anything, cannot re-ask, cannot open a console; the only thing an
"unknown-directive" placeholder does for them is advertise that the site is
broken. Worse is the default that a careless implementation actually produces:
an unrecognized directive falls through to the base markup renderer, and the
reader is shown the literal directive line. That is a **syntax leak**, and it is
the characteristic failure of this whole family — it looks like the page was
never proofread, it survives translation into every locale at once, and nobody
who could fix it is looking at the page.

None of which excuses hiding the failure. Failure is spelled differently from
empty success; it is just spelled at a **different time and to a different
audience**. The drop is silent to the reader and loud to the author: the build
that renders a corpus knows every directive it dropped and every payload it
could not parse, and that count belongs in a gate the author passes before
publishing, alongside a preview that shows the body as rendered. Runtime
disclosure to a reader and build-time disclosure to an author are the same
discipline aimed at whoever can act. This is
[closed-directive-set](./techniques/closed-directive-set.md).

## Each block gets its own tiny grammar, not one big one

The tempting generalization is a universal attribute syntax — one bracketed
key-value language every block shares, with quoting and escaping rules — because
it is what an engineer would design and it parses with one function. It is the
wrong answer for authored content. A universal attribute language is a **second
language the writer must learn**, complete with the two hardest things in any
grammar: quoting and escaping. Prose is full of apostrophes, colons, commas and
quotation marks, so a general attribute syntax spends the writer's attention on
escaping their own sentences.

Instead each block type carries its own grammar, kept absurdly small: line
oriented, one item per line, at most one separator character, no nesting, no
quoting, no escapes. Small enough that the whole grammar is legible from a
single example — which is the actual acceptance test, because that is exactly
the situation a translator is in. Small enough that a malformed line is a
*local* failure that skips one item rather than a parse error that eats the
document. The discipline, the separator choices and the continuation-line
question are [per-block-line-grammar](./techniques/per-block-line-grammar.md).

## The labels inside a block are a second closed set

Blocks carry semantic labels — a callout is a note or a warning, an offering is
available or planned or retired — and those labels are a closed vocabulary
nested inside the closed vocabulary of directives. They get the same treatment
and they get it in **both** halves: the parser admits only the enumerated
literals, and the renderer keys its styling off the same enumeration with a
named fallback for the value it was not expecting. Two hand-maintained copies of
one label set is the classic drift, and it fails in the classic way — someone
adds a label to the renderer's style table, the parser still rejects it, and the
block silently loses items in production.

The stakes are higher than styling, because these labels are where meaning
becomes behavior. A warning label that escalates a callout to an assertive role
for assistive technology is only trustworthy if the parser can actually produce
that label and no other path can. Enumerate once, guard at the door, style off
the same union:
[enum-guarded-block-payloads](./techniques/enum-guarded-block-payloads.md).

## The vocabulary is the part that does not get translated

This is the property that repays the whole discipline, and it is invisible until
the second locale. A body in another language is not a different document — it
is the **same structural document with different prose in it**. Directive names,
fence delimiters, separator punctuation, anchor ids, enum labels and item counts
are invariants; only the sentences vary. That invariance is what lets one parser
render a dozen hand-translated locale copies, what lets a translator work in a
text editor without a build, and what makes a mechanical check possible at all:
parse the source body and the translated body, compare their block structure,
and a mismatch is a defect with a line number rather than a rumour.

The check has to read the actual translated bodies. A translation pipeline that
gates on a diff, a word count, or the translator's own report is looking at a
proxy, and it passes exactly when the proxy diverges from the text. The
taxonomy — what is prose, what is a token, and how the instruction is written
for whoever or whatever does the translating — is
[vocabulary-as-translation-invariant](./techniques/vocabulary-as-translation-invariant.md).
An open vocabulary does not get a weaker version of this technique; it does not
get one at all.

## A block type can be a contract, and then it stops being styling

Once a second consumer re-reads a block from the source text to emit something
of its own — structured data for a crawler, a table of contents, a search index,
an export — that block's grammar has become an interface. It can no longer be
changed for a visual reason. Renaming its separator to make an example look
nicer is now a breaking change to a consumer that will not fail loudly, because
the second consumer usually degrades to emitting nothing and nobody watches an
absence.

Two rules follow. First, the second consumer reads the **same source text**,
never the rendered output and never a hand-maintained parallel file: a derived
artifact names how it is recomputed, and the recomputation is "re-parse the
body". Second, whatever it emits must describe what the reader actually sees —
structured data claiming a procedure the page does not show is a lie told to a
machine, and it is penalized as one. Which blocks are contracts and which are
decoration is a decision to make deliberately and write down, because it decides
which grammars are frozen:
[blocks-as-machine-readable-source](./techniques/blocks-as-machine-readable-source.md).

## The set is small on purpose

Additions are cheap and should still be resisted, because the asymmetry between
adding and removing is severe. Adding a directive is three edits. Removing one
is a corpus migration: since unrecognized directives render nothing, deleting a
block type while any body still uses it deletes content from the surface in
perfect silence, in every locale simultaneously. Renaming is the same problem
twice. So the vocabulary stays small enough that sweeping every body in every
locale is an afternoon rather than a project, and every proposed addition
answers the question that keeps a set semantic: *what content is this, that no
existing block can carry?*

## The techniques

- [closed-directive-set](./techniques/closed-directive-set.md) — one dispatch
  enumerating every legal block, the null return for strangers, the
  escape hatches to refuse, and the growth and retirement disciplines.
- [per-block-line-grammar](./techniques/per-block-line-grammar.md) — the
  one-example test, line-oriented item grammars, separator choice, continuation
  lines, and per-item failure instead of per-document failure.
- [enum-guarded-block-payloads](./techniques/enum-guarded-block-payloads.md) —
  the nested label vocabulary, the parser guard and the renderer's total style
  table with a named fallback, and labels that carry accessibility semantics.
- [vocabulary-as-translation-invariant](./techniques/vocabulary-as-translation-invariant.md) —
  the translate / do-not-translate taxonomy, the structural equivalence check
  across locale copies, and the gate that reads the bodies themselves.
- [blocks-as-machine-readable-source](./techniques/blocks-as-machine-readable-source.md) —
  blocks as interfaces to a second consumer, re-parsing the source rather than
  the render, and keeping emitted structure honest to the page.
