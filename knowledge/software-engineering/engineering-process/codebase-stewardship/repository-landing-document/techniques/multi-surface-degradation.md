---
layer: technique
type: technique
subject: repository-landing-document
technique: multi-surface-degradation
status: forged
laws: [verdict-survives-boundary]
shared_with: []
use_when: [a project is about to be published to a package registry or a marketplace, the front page uses host-specific block syntax, relative image and section links stop working off the code host]
---

# Composing for the surfaces that strip the formatting

The landing document is written once, against one renderer — the code host's,
which is the richest one anybody involved will ever look at — and then
published to several others that each remove something. A package registry
reproduces the body but sanitizes anything the host invented on top of the
common markup, so host-specific callout blocks arrive as ordinary quotations
with a stray marker line at the top. A plugin marketplace takes a short
excerpt and no images. A search result takes a sentence, chosen by a machine.
A plain-text viewer takes the source, in which a centered layout block is
literal markup and an image is a line of punctuation. A chat unfurl takes a
title, a sentence and possibly one picture from a field that is not in the
document at all.

None of these surfaces reports what it dropped. The author sees the rich
rendering forever, and the reader — who is often meeting the project on the
poorest surface, because that is the surface the search engine and the
package index put in front of them — sees a document whose structure has
quietly gone missing. This is
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
at a rendering boundary rather than a type boundary: a distinction that
survives only as styling has not survived, and the test is what the reader on
the *outermost* surface can still tell apart.

## The tiers, and what each one actually keeps

Rank the surfaces a project publishes to by what they preserve. The exact
inventory differs by ecosystem, but the ladder does not:

1. **The code host.** Everything, including its own block extensions,
   relative links to other files in the tree, and section anchors.
2. **The package registry.** Common markup and images; host-specific block
   extensions degrade to their nearest common ancestor; raw layout markup is
   usually stripped; relative links resolve against the wrong root or not at
   all.
3. **The excerpt surfaces** — a marketplace card, a listing row, a search
   result. A leading fragment, no images, no structure, and a length limit
   measured in the low hundreds of characters.
4. **The source itself** — a plain-text viewer, a terminal, a diff, an
   assistant reading the file. Markup as characters.

## The rules

**Every load-bearing distinction is carried in words as well as in
rendering.** If a block means *say this to an agent* only because it is
tinted, then on tier 2 it means nothing and on tier 4 it is a quotation. Put
the distinction in text inside the block — a short lead-in that names the
destination — and the styling becomes a reinforcement rather than the carrier.
This is what settles the question of whether a host-specific block is
admissible at all: **it is admissible, and it may never be the only thing
carrying the meaning.** Forbidding it entirely would cost tier 1 its clarity —
which is where most readers are — to protect tier 2, and the cheaper fix is
one lead-in phrase.

**The first paragraph stands alone.** Tier 3 takes a leading fragment and
nothing else, so the document's opening must be a complete statement of what
this is and who it is for, in one or two sentences, with no dependency on a
heading above it, a badge row around it or an image below it. The common
failure is a document that opens with a layout block, a badge row and a
figure, and whose first actual sentence is a rhetorical framing of the problem
the project solves — true, well written, and useless as the entire content of
a listing card, because it names the problem and never the project.

**Links are addressed for the poorest surface that needs them.** A relative
link to a sibling file works on tier 1 and breaks on tier 2. A section anchor
works on tiers 1 and 2 and means nothing on tiers 3 and 4. The decision rule:
navigation the reader *must* be able to follow from a registry page is written
as an absolute address; navigation that is a convenience — a jump bar to a
section further down the same document — may stay relative, because its
failure mode is a dead click on a page whose content is right there.

**An image is an enhancement everywhere below tier 1.** It may carry
atmosphere, evidence and delight; it may not carry a fact the surrounding
prose does not also state. A capability shown only in a screenshot is a
capability invisible to three of the four tiers, and the caption that fixes
this is the subject of
[caption-carrying-figures](./caption-carrying-figures.md).

**Where the surface has its own field, fill the field.** Excerpt and unfurl
surfaces frequently do not read the document at all — they read a description
or preview-image field from the project's manifest or host settings, and fall
back to the document only when that field is empty. A project that composes
the perfect opening sentence and leaves the description field blank has
written for a surface that was never going to be consulted. Treat those fields
as part of the landing document even though they live somewhere else: the
reader cannot tell which file the sentence came from.

## Verify by looking, not by reasoning

The whole failure class exists because the author only ever sees tier 1, and
reasoning about the other tiers is exactly what produced the bug. Before a
project is published, someone opens the landing document on each surface it
will appear on and reads it there — and after any change to a block type, a
layout element or a link form, does it again for the surfaces that change
touched. Where a surface cannot be previewed before publication, render the
document with a plain common-markup renderer, which approximates tier 2
closely enough to catch the block degradations, and read the raw source once,
which is tier 4 exactly and costs nothing.

## When this does not apply

An internal repository published to exactly one surface owes none of this. The
tier ladder is a cost, and paying it for surfaces the document will never
reach is the same error in the other direction — writing prose that carries
every distinction twice, for an audience of one renderer that never needed the
second copy. The trigger for adopting the technique is the *second* publishing
surface, and the day a project acquires one is the day its landing document
stopped being a file and became a syndication.
