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
The opening scene promises a question worth answering. The content preview promises a route
(the outline) and a return (what the reader will be able to do); the cost is the read time
in the page header, which the text does not restate. The through-line promises that the
scene will matter again. The closing chapter pays these back, in numbers, and returns to
the scene. A reviewer can check a structure by
listing the promises and looking for the line that settles each.

## The five load-bearing parts

**The opening scene.** One concrete case that carries the thesis in miniature: one
message, one request, one invoice, one failure, with its numbers in the first lines. It is
not a hook in the advertising sense; it is the smallest instance of the problem the whole
post explains. A scene chosen well can be returned to in every section, which is what makes
it a through-line rather than an anecdote. See opening-scene-hook.

**The content preview.** Directly after the opening, before the first section: what the
post is, the structure as a linked outline, and the two or three things a reader will be
able to do afterwards. The read time stays in the page header; a second figure in the text
can only disagree with the first. Technical writing courses put this as
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
opening scene ("what the refund message showed"), carries one compact comparison table
where the body compared things, and names what a reader should do differently,
specifically enough that they could start on Monday. See
closing-chapter-settles-the-account.

## Distinctions that matter

**Structure is not formatting.** Headings, bullets and bold text make a structure visible;
they do not create one. A post can be fully formatted and still be a survey. The test is
whether the sections could be reordered without loss: if they can, there is no argument,
only a list.

**The preview is not an abstract.** An abstract compresses the findings; a preview tells
the reader where the reading goes and what it buys. Findings in the preview spoil nothing (an
expert reader wants them), but a preview that carries only findings and no route leaves the
newcomer without a map.

**The close is not the place for new material.** A fact first introduced in the closing
chapter has no section that earned it, and a reader who skims the close to decide whether
the post was worth it cannot weigh it. New facts belong in the body; the close settles.

**The five parts are the shape of an argued article, not of every post.** A tutorial
has its own: the preview is what the reader will build and what they need first, often
under its own heading; the section headings are the steps, each named by its action;
the close is the next thing to do or read, not a recap. A reference page has none of the
five, because its reader looks up a known place. Holding a tutorial to the argued shape
turns every step heading into a "topic heading" finding and misses what the genre
actually lacks (a prerequisites list, a next step). Decide the genre before applying the
checks below.

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
- **The read time that lies.** The header's read time is the post's first number, and it
  is only the platform's when the platform computes it. Where it is a field somebody types
  (a CMS form, a static data file) it is the author's claim, and nothing ties it to the
  text: ten posts on one product blog stated 66 minutes for 15.8 minutes of
  text, wrong from the first commit and never moved by nine later edits. Derive a typed
  read time from the final text at build time, and size the preview from that computed
  length, not the typed one.
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
parts exist in the draft (a preview near the top with no read time of its own, a closing
section that names numbers and refers to the opening object, and, where the header's read
time is a typed field, a figure that matches the text); whether they *work* is the reviewer's
reading, and the check should never claim more than presence.

## Sources this subject rests on

- Technical writing course material on document organization: state scope, audience and
  essential answers at the start (Google, "Technical Writing One: Documents", updated
  2025-07-07, https://developers.google.com/tech-writing/one/documents).
- Eye-tracking research on scanning: put the most important points in the first two
  paragraphs and start headings with the information-carrying words (Nielsen Norman
  Group, "F-Shaped Pattern of Reading on the Web", 2017, reviewed 2026-08-19,
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/). The F-shape is
  the failure this advice works against, not the goal; the same group names the
  layer-cake pattern, a reader scanning headings and the words just under them, as the
  most effective way to scan, and says information-bearing words give the reader a
  subheading's point at once (Nielsen Norman Group, "The Layer-Cake Pattern of Scanning
  Content on the Web", 2019-08-04, read 2026-10-10,
  https://www.nngroup.com/articles/layer-cake-pattern-scanning/).
- Reading rate: 238 words per minute is the meta-analytic adult silent-reading rate for
  English non-fiction (Brysbaert, "How many words do we read per minute?", Journal of
  Memory and Language 109, 2019, https://doi.org/10.1016/j.jml.2019.104047; preprint
  checked 2026-10-10).
- A writing contest's owner review (2026-10-05) named three of the five parts by their
  absence: no content preview, a final chapter that did not wrap the result and the story,
  and an opening that was the one part praised.
