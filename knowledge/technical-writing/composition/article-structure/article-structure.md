---
layer: golden-path
type: golden-path
subject: article-structure
status: forged
use_when: [outlining a technical article before drafting, reviewing a draft whose sections are each fine but the whole does not hold, writing the opening or the closing chapter of a long post, building a generator or checker that shapes article structure]
techniques:
  - opening-scene-hook
  - content-preview-block
  - through-line-device
  - information-carrying-headings
  - closing-chapter-settles-the-account
---

# Article structure

A long technical article is read by someone who decides, several times, whether to keep
going. The first decision happens in the opening lines, the second at the end of the
first screen, and the rest at every section break, where a scanning reader looks at the
next heading and asks whether it is about anything they need. Structure is the craft of
giving that reader a reason to continue at each of those points and a reward at the end
for having done so.

The canonical failure is a post whose sections are individually correct and collectively
shapeless: a survey of the topic in the order the author learned it, with an introduction
that announces the topic and a conclusion that announces that the topic was covered. Every
paragraph can be defended; nobody finishes it. The opposite failure is quieter and more
common in generated drafts: the shape is present as decoration (an opening anecdote, a
"key takeaways" list, a cheerful sign-off) but nothing connects the parts, so the anecdote
is forgotten by the second section and the takeaways restate headings.

A principal practitioner treats structure as a **set of promises and their settlement**
([the opening promises, the close settles](../../_laws.md#the-opening-promises-the-close-settles)).
The opening scene promises a question worth answering. The content preview promises a cost
(the read time), a route (the outline) and a return (what the reader will be able to do).
The through-line promises that the scene will matter again. The closing chapter pays all
three back, in numbers, and returns to the scene. A reviewer can check a structure by
listing the promises and looking for the line that settles each.

## The five load-bearing parts

**The opening scene.** One concrete case that carries the thesis in miniature: one
message, one request, one invoice, one failure, with its numbers in the first lines. It is
not a hook in the advertising sense; it is the smallest instance of the problem the whole
post explains. A scene chosen well can be returned to in every section, which is what makes
it a through-line rather than an anecdote. See opening-scene-hook.

**The content preview.** Directly after the opening, before the first section: what the
post is, an honest read time, the structure as a linked outline, and the two or three
things a reader will be able to do afterwards. Technical writing courses put this as
"state the scope and the audience" and "answer the reader's essential questions at the
start"; usability research on web reading puts it as front-loading, because most readers
scan before they commit. The preview is the reader's contract: it lets the newcomer
decide to invest and lets the expert jump to the section they came for. See
content-preview-block.

**The through-line.** One device, usually the opening scene's object, followed through
every section: the same message tokenized, priced, cached and evaluated; the same request
traced through each layer of a system. It converts a survey into an argument, because
each section now answers "what happens to *this* next". See through-line-device.

**Headings that carry the claim.** A scanning reader reads the headings and the first
words under them. A heading that names a topic ("Caching") tells that reader nothing; a
heading that carries the section's claim ("Normalization changes the cache key, and the
bill with it") lets the scan itself teach. See information-carrying-headings.

**The closing chapter.** Not a summary and not a list of tips. It restates what was
established in a few concrete lines with the numbers included, ties them back to the
opening scene ("what the refund message showed"), and names what a reader should do
differently, specifically enough that they could start on Monday. See
closing-chapter-settles-the-account.

## Distinctions that matter

**Structure is not formatting.** Headings, bullets and bold text make a structure visible;
they do not create one. A post can be fully formatted and still be a survey. The test is
whether the sections could be reordered without loss: if they can, there is no argument,
only a list.

**The preview is not an abstract.** An abstract compresses the findings; a preview tells
the reader what the reading will cost and buy. Findings in the preview spoil nothing (an
expert reader wants them), but a preview that carries only findings and no route leaves the
newcomer without a map.

**The close is not the place for new material.** A fact first introduced in the closing
chapter has no section that earned it, and a reader who skims the close to decide whether
the post was worth it cannot weigh it. New facts belong in the body; the close settles.

**A long post is not a slow post.** Length is decided by what the material needs (see the
`depth-and-audience` subject); structure decides whether that length is navigable. A
fourteen-minute post with a preview, claim-carrying headings and a settled close is easier
to navigate than a seven-minute post without them, because the reader never has to wonder
where they are or whether the next section is for them.

## Failure modes of the naive reading

- **The announcement opening.** "In this post we will explore X." It promises a topic,
  not a question, and spends the most valuable lines of the page on nothing.
- **The orphaned anecdote.** An opening scene that never reappears. The reader carried it
  through the post waiting for it to matter.
- **The preview that lies about time.** A read time guessed from word count alone, on a
  post with twelve figures and four tables, under-promises the cost and over-promises the
  ease. Compute it, including figure and table text, and say what it includes.
- **The generic close.** "In conclusion, X is a complex topic with many trade-offs." It
  settles none of the opening's promises and gives the reader nothing to do; it is the one
  section an expert reader will quote back as evidence the post was hollow.
- **Takeaway lists that restate headings.** A bullet list at the end whose items are the
  section titles in sentence form. It is a table of contents placed where the result
  belongs.

## How the parts are checked

Structure is checkable before any prose is polished, from the outline alone: write the
opening scene in two sentences, the preview's three outcomes, each section's claim as its
heading, and the close's recap numbers. If any outcome in the preview has no section that
delivers it, or any recap number has no section that established it, the outline is wrong
and no amount of sentence work will fix it. A deterministic check can then confirm the
parts exist in the draft (a preview near the top, a read time, a closing section that
names numbers and refers to the opening object); whether they *work* is the reviewer's
reading, and the check should never claim more than presence.

## Sources this subject rests on

- Technical writing course material on document organization: state scope, audience and
  essential answers at the start (Google, "Technical Writing One: Documents", updated
  2025-07-07, https://developers.google.com/tech-writing/one/documents).
- Eye-tracking research on scanning: put the most important points in the first two
  paragraphs and start headings with the information-carrying words (Nielsen Norman
  Group, "F-Shaped Pattern of Reading on the Web", 2017, reviewed 2026-08-19,
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/).
- A writing contest's owner review (2026-10-05) named three of the five parts by their
  absence: no content preview, a final chapter that did not wrap the result and the story,
  and an opening that was the one part praised.
