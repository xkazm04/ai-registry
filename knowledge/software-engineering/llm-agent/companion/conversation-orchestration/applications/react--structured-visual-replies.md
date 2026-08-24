---
layer: application
type: application
subject: conversation-orchestration
technique: structured-visual-replies
stack: react
status: forged
verified_on: 2026-08-24
verified_against: react@19
---

# Drawing the block in kp's companion dock

kp's companion is a ~26–30rem dock beside the operator's board. Its transcript is
a generic component (`app/_components/chat/ChatTranscript.tsx`) shared with the
product's intake flow; the blocks a model composed reach it through one slot, and
everything about how they are drawn is decided in three small files.

## One dispatcher, wired through a slot rather than into the transcript

`ChatBlocks.tsx:26-38` is the only place a block type is mapped to a renderer,
and the reason it is exhaustive over the union is stated at `:10-12`: "adding a
variant to the union is a type error here until it is drawn, which is the only
place that check can live." The dispatcher is reached through
`ChatTranscript`'s `renderTurnExtras` prop (`ChatTranscript.tsx:75`, invoked at
`:141`), passed only by the companion (`CompanionDockBody.tsx:153`) — and
`ChatBlocks.tsx:14-16` explains the restraint: "Deliberately NOT wired into
ChatTranscript itself: intake renders through the same transcript and has no
blocks, and a prop it never passes is a prop that can never regress it."

## The width rule, and the finding that produced it

`ChatTranscript.tsx:127-130` caps every prose bubble at `max-w-[85%]` on both
sides. `ChatBlocks.tsx:29` renders the block container at `w-full min-w-0`
instead, and the header comment (`:18-24`) is the technique's width rule with its
evidence attached:

> Blocks escape the bubble: the bubble keeps its 85 % cap because a paragraph
> needs a ragged right edge to read as speech, but a table or a chart is a
> DRAWING and every pixel it gives back to the identity gutter is a column it
> cannot show. […] The operator's round-5 finding was exactly this — a
> three-column table inside a 26rem column wrapped every cell to three lines and
> read as illegible chrome.

Note what did **not** change: blocks still render inside the turn's own element,
directly under its bubble, on both sides of the conversation
(`ChatBlocks.tsx:21-22`). Only the width contract differs.

## The readable floor, held by a min-width and a scroller

`ChatMiniChart.tsx` is hand-rolled inline SVG. `:14-21` derives the geometry from
the type floor rather than from a round number: the drawing "scales with its
container (`w-full`, viewBox intact)", and "the floor the design law sets — a true
14px for anything rendered — is what decides the base number", so "at WIDTH the
labels land at exactly 14px, a wider container scales them UP, and `min-w` keeps a
narrow one from scaling them down, handing the block's own scroller the overflow
instead." The comment names the failure the arrangement prevents: "A viewBox that
could shrink freely would quietly print 9px axis labels on a phone."

That is implemented in one class string — `className="block h-auto w-full
min-w-[420px] text-meta"` on the `<svg>` (`:103`), with `viewBox` and
`preserveAspectRatio` intact (`:99-100`) and the scroller on the wrapper
(`:89`, `overflow-x-auto`). `WIDTH = 420` (`:30`) is derived arithmetically at
`:27-29` from the dock's real inner column. `ChatTable.tsx:24-25` gives the table
the same treatment for the same reason: "The scroller is the table's own, so a
wide value never widens the dock."

Two secondary rules from the technique are present. Ticks **thin** rather than
shrink (`tickIndexes:51-55`, reasoned at `:46-50`: "a label you cannot read is
worse than an absent one, and the bars still carry the shape"), and the anchoring
of a thinned tick set differs from a full one (`:74-80`) — with the regression
that taught it recorded inline: "'Screened' sat on top of 'Accepted' the first
time this went full-bleed."

Color travels as design tokens in presentation attributes
(`SERIES_COLORS:42`, `var(--color-coral)` / `var(--color-moss)`), which
`:6-13` explains as the reason no chart library is used here: a library needing
literal color strings forces a `useTheme()` fork per chart, and "a presentation
attribute is parsed as CSS, so `fill="var(--color-coral)"` resolves per theme with
no JS at all." The legend swatch uses the same trick rather than a styled span
(`:170-174`).

## A rendered sentence, not a data grid

`ChatTable.tsx:13-17` states the bound the technique asks for and keeps it: "No
sorting, no selection, no row actions — it is a rendered sentence, not a data
grid." The markup is a real `<table>` with `scope="col"` headers (`:26-33`) so it
is announced as a table, and the empty-cell rule is
`unknown-is-not-a-value` in one line (`:46-47`): "An absent cell is not zero and
must not read as zero" — rendering `labels.emptyCell` rather than an empty string.

## The counted drops surface as quiet chips

`CompanionDockBody.tsx:203-204` reads `blockErrors` and `actionErrors` off the
turn's metadata as two separate numbers and renders each as its own chip
(`:237-240`), so a turn that drew nothing because its blocks were rejected is
distinguishable on screen from one that never proposed any. The whole extras
region returns `null` when there is nothing at all to say (`:219-228`), which is
what keeps the chrome from appearing under every turn.

## Deviation: the caps are restated here, not received

The renderer's limits are documented in prose rather than derived. `ChatTable.tsx:15`
says "at most four columns by contract" and `ChatMiniChart.tsx:41-42` says "Never a
third — the block contract caps series at 2", while the authoritative constants live
across a process boundary in the Python validator (`pipeline/jobfit/companion_blocks.py:47-54`,
whose own comment names the coupling: "changing one without the other produces a
block the model may emit and the dock cannot draw"). Nothing fails if they drift.
The repository already demonstrates the fix on its sibling vocabulary — the action
catalog is serialized from TypeScript into the CLI's input and validated against
the shipped copy — so the caps could travel the same way.

One caveat on the geometry: three comments still describe the drawing as 240px
wide (`ChatMiniChart.tsx:9`, `:66`, `:91`), from before the full-bleed change
raised the base to 420 — `:15` refers to the old thumbnail deliberately and is
correct. The behaviour matches the new number; the stale ones in the reasoning
are worth a sweep before they are read as current.
