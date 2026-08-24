---
layer: technique
type: technique
subject: conversation-orchestration
technique: structured-visual-replies
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [a companion answers a comparison as a numbered paragraph, a model-drawn table wraps every cell in a narrow panel, a malformed block from the model breaks the whole reply, deciding how wide a rendering inside a conversation may be]
---

# Structured visual replies

The naive reading is that a chat surface is a prose medium and a companion
therefore writes prose. It holds until the first question whose honest answer is
five candidates with three attributes each, at which point the companion produces
a numbered paragraph nobody reads, in a column narrow enough that every item
wraps to three lines. Prose is the worst available shape for comparable things,
and the model has no way to know that unless it is told.

So the standing instruction covers **the shape of the answer as well as its
content**, and the surface can render two things instead of one: prose, and a
small number of model-composed structures — a compact table, a two-axis chart —
that travel inside the same completion and are drawn beneath it. The whole design
is a contract in three parts: what the model is taught to emit, what the boundary
accepts, and how wide the result is allowed to be.

## The register: lead with the answer, then stop enumerating

State the register as rules the model can check itself against, never as
adjectives. "Be concise" is unfalsifiable; a character ceiling is not.

- **Lead with the answer in one or two sentences**, and never restate the
  question. A companion that opens by rephrasing what it was asked has spent the
  only two lines the user reliably reads.
- **When three or more comparable things are the answer, do not enumerate them
  in prose** — emit a block and keep the prose to the takeaway. Three is the
  threshold because two things compare fine in a sentence and four never do.
- **Paragraphs of at most about three sentences**, and a **prose ceiling that
  tightens when a block is present**. The block carries the enumeration; prose
  that also carries it has made the block redundant and the reply twice as long.
- **Never describe a block in prose.** It is rendered; the reader can already see
  it. A caption that recites the table is the most common way this feature
  doubles the length of the answer it was added to shorten.
- **State the caps as consequences, not requests** — a block that breaks one is
  dropped and the user sees nothing. A model told "please keep it under four
  columns" negotiates; a model told what happens does not.

Teach the block shape **by example, not by description**. A schema described in
prose gets paraphrased into something adjacent; a fenced sample gets copied.

## The boundary drops what is wrong and truncates what is merely long

The blocks arrive as fenced regions inside the completion and are parsed out
before anything is displayed, under the extraction discipline of
[display-vs-machine-channels](../../../../llm-agent/prompt-and-context/structured-output/techniques/display-vs-machine-channels.md):
the payload spans are removed from the text using the extractor's own boundaries,
and the hole they leave is closed so the remaining prose still reads.

What is specific here is the **schema cap**, and it has exactly two dispositions
with a rule for picking between them:

- **Structurally wrong is dropped whole.** Unparseable JSON, a missing axis, a
  chart kind that does not exist, a series of strings where numbers belong — none
  of these can be rendered into something honest, and a half-drawn chart is a lie
  with a picture attached.
- **Merely too long is truncated.** A ten-row table rendered at eight rows is
  still an answer; discarding it because it exceeded a display limit is the worse
  outcome, and it is the outcome a naive "validate then reject" boundary produces
  every time. Over-long arrays are cut to the cap and kept.

**No malformed block may raise.** The parse runs between the model and the user,
and an exception there costs the entire reply — including the prose, which was
probably fine. A reply that reaches the user beats a reply that was right.

## Every discard is counted, because zero blocks has two causes

A turn that emitted no blocks and a turn whose blocks were all thrown away look
identical on screen and are entirely different facts
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The parse returns a **drop count** alongside the surviving blocks, the turn's
record carries it, and the surface shows it quietly. Without it, a prompt change
that starts producing subtly invalid blocks degrades the product silently and the
only symptom is that the companion stopped drawing things.

Count each fence family separately. If the same completion can also carry
proposals or actions, one merged count answers neither "how many drawings were
lost" nor "how many proposals were lost".

## Internal consistency is the validator's job, not the renderer's

A renderer handed a chart whose x-axis has six labels and whose series has four
values will draw *something* — two bars against nothing, or a crash, depending on
the loop. Neither is acceptable, and neither is fixable in the drawing code
without inventing data. So the validator makes the block **internally consistent
before it ships**: the axis and every series collapse to their shortest common
length, so a bar is never drawn against a tick that does not exist.

The same discipline decides what to do with holes, and it is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) throughout.
A series with a missing point is dropped rather than plotted with the gap
rendered as zero — a zero is a claim. A missing table cell renders as a quiet
placeholder, never as an empty string that reads as nothing and never as zero.
And a row that is blank in every column is noise rather than data, and is
dropped before it reaches the count.

## The caps are one vocabulary, and it is easy to end up with two

The maximum column count, row count, series count and point count are a closed
vocabulary shared by three consumers: the prompt that teaches the model, the
validator that enforces them, and the renderer that was drawn to them. All three
must derive from **one authoritative definition**
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The failure is specific and quiet: raise a limit in the prompt and not the
validator and the model emits blocks that are dropped on arrival; raise it in the
validator and not the renderer and the surface is handed a block it cannot draw.

The signature of having got this right is that **no cap appears as a literal in
the prompt text** — the instruction is assembled from the same constants the
validator reads, so raising a limit is one edit. It is the same discipline a
companion applies to the catalog of actions it may propose, at a smaller scale
and with a quieter failure: a drifted action id is a capability that silently
does nothing, while a drifted cap is a drawing that intermittently fails to
appear.

## Two ordering rules that look like details and are not

**Strip the fences before applying the prose ceiling.** Cutting the raw
completion at a character limit and then parsing routinely halves a fence, which
turns a valid table into a dropped block *plus* a paragraph of raw JSON printed
at the user — the worst reachable outcome, produced by doing two correct
operations in the wrong order.

**A blocks-only completion still has to say something.** When the model answered
entirely in structure, the prose is empty, and a blank bubble above a table reads
as a bug rather than as brevity. Fill it with a short deterministic lead-in
authored by the product, not the model — one line that introduces what is below
it. It is not a greeting and it is not a summary; it is the seam that keeps the
transcript's unit of record intact.

## The block escapes the bubble

The transcript's prose bubbles are side-aligned and capped short of the column
width, because a paragraph needs a ragged right edge and an identity gutter to
read as speech. **A structure inherits neither.** Every pixel a table gives back
to the identity gutter is a column it cannot show, and a three-column table
squeezed inside a chat bubble in a narrow panel wraps each cell to three lines
and reads as illegible chrome — which is the failure this rule was written from.

So structures render **full width beneath the bubble they belong to, on both
sides of the conversation**, while the prose above them keeps its cap. Ownership
is unchanged: the block is still part of that turn, still positioned under it,
still gone when the turn is. Only the width rule differs, and it differs because
the two are different kinds of thing.

Width brings a second obligation. A drawing that scales freely with its container
scales its labels too, and an axis label is a floor: below the product's minimum
readable type it is not a small label, it is an absent one. So a chart scales
with its container **over an intact coordinate system** — the drawing's internal
geometry does not change — with a **minimum width below which it stops shrinking
and its own scroller takes over**. Choose the base width so that at that floor the
type lands exactly on the readable minimum; a wider container then only ever
scales it up. Give a table the same treatment horizontally: its own scroller, so
a long value scrolls the table rather than widening the panel.

Two smaller consequences worth stating. Thin the axis ticks rather than shrinking
them when the labels would collide — a label that cannot be read is worse than an
absent one, and the bars still carry the shape. And carry color through the
product's own design tokens as presentation attributes rather than resolved
literals, so the drawing follows the theme without a scripted fork.

## It is a rendered sentence, not a data grid

No sorting, no selection, no row actions, no drill-down. The block exists because
a paragraph was the wrong shape for three comparable things — the moment it gains
interaction it has become an application surface embedded in a transcript, and it
belongs to the feature it is a view of, reached from the conversation by a link.
The bound is what keeps the block cheap enough to draw on any turn.

## What the record keeps

The block is a rendering, but its **subject is part of what was said**. A stored
turn that keeps only the prose makes "what did you show me about that role last
week?" unanswerable, because the answer was in the table. Whatever the turn is
compressed into for the record and for later recall carries at least what the
block was about — its title, its kind, how many there were. Compressing the
drawing away is compressing away the answer.

## Where this ends

The extraction boundary — how a machine payload is separated from display text,
and the ban on ever parsing the display channel back — is structured-output's.
The transcript's typed rows for things that *happened* are the transcript
subject's
([inline-structured-rows](../../../../ui-surfaces/shell-and-navigation/chat-transcript/techniques/inline-structured-rows.md)):
a tool invocation, an approval card, an error is a record of an event, with
identity, position and a lifecycle. What this technique owns is the structure the
model **composed as its answer** — a shape it chose because prose was wrong for
the content — together with the instruction that taught it to and the width the
result is drawn at.

## When not to use this

- **When the surface is wide.** A full-page conversation has room for an
  enumeration and the discipline buys much less; the register still helps, the
  width rule is moot.
- **When the data is authoritative and consequential.** A block is composed by a
  model from whatever grounding it was given, and it renders like a report. Where
  the number must be right — money, headcount, anything acted on — link to the
  view that owns it rather than redrawing it inside a chat turn.
- **When the model has no grounding for it.** A block built from the model's own
  recollection is a hallucination with gridlines, and it is markedly more
  convincing than the same claim in prose. Instruct explicitly that blocks are
  built only from the grounding the turn was given.
- **When the surface is the ambient one.** A table is reading material, and
  reading material belongs in the conversation by the routing rule.
