---
layer: application
type: application
subject: conversation-orchestration
technique: structured-visual-replies
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Drawing the block in kp's companion dock

kp's companion is a 30rem dock (`CompanionDock.tsx:51`, `sm:w-[min(92vw,30rem)]`)
beside the operator's board. Its transcript is
a generic component (`app/_components/chat/ChatTranscript.tsx`) shared with the
product's intake flow; the blocks a model composed reach it through one slot, and
everything about how they are drawn is decided in three small files.

*Citations resolved at kp `86eded59d` on 2026-09-29. `ChatBlocks`, `ChatTable`
and `ChatMiniChart` barely moved; `ChatTranscript` and `CompanionDockBody`
shifted by 5 to 130 lines, and `CompanionDockBody` now lives at
`app/features/shell/companion/CompanionDockBody.tsx`.*

## One dispatcher, wired through a slot rather than into the transcript

`ChatBlocks.tsx:26-38` is the only place a block type is mapped to a renderer,
and the reason it is exhaustive over the union is stated at `:10-12`: "adding a
variant to the union is a type error here until it is drawn, which is the only
place that check can live." The dispatcher is reached through
`ChatTranscript`'s `renderTurnExtras` prop (`ChatTranscript.tsx:80`, invoked at
`:155`), passed only by the companion (`CompanionDockBody.tsx:280`) — and
`ChatBlocks.tsx:14-16` explains the restraint: "Deliberately NOT wired into
ChatTranscript itself: intake renders through the same transcript and has no
blocks, and a prop it never passes is a prop that can never regress it."

Two corrections to that picture, both from reading the branch tip. The "switch"
is a ternary (`ChatBlocks.tsx:31-35`, `block.type === "table" ? <ChatTable/> :
<ChatMiniChart/>`), so exhaustiveness holds through type narrowing - a third
variant makes the else branch's `block` unassignable to the chart type, a compile
error at `<ChatMiniChart>` - rather than through a `never` check; the guarantee
is real but it fails one line away from where the comment says it does. And the
slot is no longer the only way in: the voice pane draws the same blocks through
`VoiceBlocks` (`voice/VoiceParts.tsx:39-58`, added in `8f5a65e2a`), which does not
use `ChatTranscript` at all and wraps the container in its own scroller capped at
16rem (`:54-55`). "Passed only by the companion" is true of the dock; the second
consumer is a second place the width contract can be broken.

## The width rule, and the finding that produced it

`ChatTranscript.tsx:143-144` caps every prose bubble at `max-w-[85%]` on both
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

`ChatMiniChart.tsx` is hand-rolled inline SVG. `:16-23` derives the geometry from
the type floor rather than from a round number: the drawing "scales with its
container (`w-full`, viewBox intact)", and "the floor the design law sets — a true
14px for anything rendered — is what decides the base number", so "at WIDTH the
labels land at exactly 14px, a wider container scales them UP, and `min-w` keeps a
narrow one from scaling them down, handing the block's own scroller the overflow
instead." The comment names the failure the arrangement prevents: "A viewBox that
could shrink freely would quietly print 9px axis labels on a phone."

That is implemented in one class string — `className="block h-auto w-full
min-w-[420px] text-meta"` on the `<svg>` (`:108`), with `viewBox` and
`preserveAspectRatio` intact (`:103-104`) and the scroller on the wrapper
(`:93`, `overflow-x-auto`). `WIDTH = 420` (`:32`) is derived arithmetically at
`:29-31` from the dock's real inner column. `ChatTable.tsx:24-25` gives the table
the same treatment for the same reason: "The scroller is the table's own, so a
wide value never widens the dock."

Two secondary rules from the technique are present. Ticks **thin** rather than
shrink (`tickIndexes:53-57`, reasoned at `:48-52`: "a label you cannot read is
worse than an absent one, and the bars still carry the shape"), and the anchoring
of a thinned tick set differs from a full one (`:79-84`) — with the regression
that taught it recorded inline: "'Screened' sat on top of 'Accepted' the first
time this went full-bleed."

Color travels as design tokens in presentation attributes
(`SERIES_COLORS:44`, `var(--color-coral)` / `var(--color-moss)`), which
`:6-15` explains as the reason no chart library is used here: a library needing
literal color strings forces a `useTheme()` fork per chart, and "a presentation
attribute is parsed as CSS, so `fill="var(--color-coral)"` resolves per theme with
no JS at all." The legend swatch uses the same trick rather than a styled span
(`:175-180`).

## A rendered sentence, not a data grid

`ChatTable.tsx:15-17` states the bound the technique asks for and keeps it: "No
sorting, no selection, no row actions — it is a rendered sentence, not a data
grid." The markup is a real `<table>` with `scope="col"` headers (`:26-35`, the `<th scope="col">` at `:30`) so it
is announced as a table, and the empty-cell rule is
`unknown-is-not-a-value` in one line (`:46-47`): "An absent cell is not zero and
must not read as zero" — rendering `labels.emptyCell` rather than an empty string.

## The drawing has a text alternative

Added on 2026-09-17 (`cd069798b`), after the first pass: `ChatMiniChart` renders a
screen-reader-only `<table>` of the same series beside the SVG (`:186-206`) and
points `aria-describedby` at it, built by `chatChartAlt.ts:15-27`; a missing value
reads as `labels.emptyCell` there too (`chatChartAlt.ts:23`). A drawing that is
the answer has to be an answer to a reader who cannot see it, and the table
`ChatTable` already emits is the model for the fallback: the same numbers, in the
element that is announced as data. The technique did not state this rule until
this application supplied it.

## The counted drops surface as quiet chips

`CompanionDockBody.tsx:355-356` reads `blockErrors` and `actionErrors` as two
separate numbers and renders each as its own chip (`:413-416`), so a turn that
drew nothing because its blocks were rejected is distinguishable on screen from
one that never proposed any. The block number is no longer only the server's:
`renderableBlocks(meta)` adds the blocks that failed re-coercion in the browser
(`app/_lib/companion-blocks.ts:152-158`), so the count is taken on both sides of
the process boundary. The whole extras region returns `null` when there is nothing
at all to say (`:386-397`, now also gated on `!speakSlot`), which is what keeps
the chrome from appearing under every turn.

## Deviation: the caps are restated here, not received

The renderers' own limits are documented in prose rather than derived.
`ChatTable.tsx:14` says "at most four columns by contract" and
`ChatMiniChart.tsx:42-43` says "Never a third — the block contract caps series at
2", while the authoritative constants live across a process boundary in the Python
validator (`pipeline/jobfit/companion_blocks.py:59-66`, whose own comment names the
coupling: "changing one without the other produces a block the model may emit and
the dock cannot draw"). The first pass stopped there and concluded that nothing
fails if they drift. That undercounted: the TypeScript side has real mirror
constants in `chatBlockTypes.ts:19-24`, enforced by `companion-blocks.ts` at draw
time, so drift truncates in the browser rather than producing an undrawable block.
But the renderers import none of them and no test spans the two languages. The
node application carries the full accounting.
The repository already demonstrates the fix on its sibling vocabulary — the action
catalog is serialized from TypeScript into the CLI's input and validated against
the shipped copy — so the caps could travel the same way.

One caveat on the geometry: three comments still describe the drawing as 240px
wide (`ChatMiniChart.tsx:11`, `:68`, `:95`), from before the full-bleed change
raised the base to 420 — `:17` refers to the old thumbnail deliberately and is
correct. The behaviour matches the new number; the stale ones in the reasoning
are worth a sweep before they are read as current.
