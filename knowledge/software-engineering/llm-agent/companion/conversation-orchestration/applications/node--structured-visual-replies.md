---
layer: application
type: application
subject: conversation-orchestration
technique: structured-visual-replies
stack: node
status: forged
verified_on: 2026-08-24
---

# The register and the cap in kp's companion turn

kp is a Next.js recruiting studio whose operator companion, Candi, answers in a
~26rem dock beside the board. The turn is executed by a spawned Python CLI
(`pipeline/jobfit/companion_cli.py`) which the TypeScript side calls with a
`turn.json`; the register and the block cap both live there, one file apart from
each other, and the seam between them is the interesting part.

## The register, stated as checkable rules

`companion_cli.py:146-156` is the whole tone contract, and its first line is the
technique's premise in the operator's own words: "Write like a modern web app,
not like a book." What follows is deliberately not adjectives —

> - Lead with the answer in one or two short sentences. Never restate the question.
> - Paragraphs of at most three sentences. Use bullets rather than a wall of prose.
> - Every number carries its unit or its noun ("4 candidates", "12 days", "68 %").
> - No markdown headings, no preamble, no sign-off, no commentary about answering.

— and it ends with the ceiling stated numerically and conditionally
(`companion_cli.py:155-156`): 700 characters when a block is present, 1200
otherwise (`:114-115`). The prose budget tightens precisely when the block is
carrying the enumeration, which is the rule the technique asks for and the one
most implementations omit.

The block half (`companion_cli.py:162-179`) opens by naming the threshold in
capitals — "WHEN THREE OR MORE COMPARABLE THINGS ARE THE ANSWER, DO NOT ENUMERATE
THEM IN PROSE" — teaches the two fences by literal example rather than by
describing a schema, and states each cap as a consequence: "A block that breaks
one is DROPPED and the operator sees nothing" (`:174`). Its authoring comment
(`:158-161`) gives the reason the example is literal: "a schema described in
prose gets paraphrased, a fenced sample gets copied." The last line is the
redundancy ban: "Never describe a block in prose. It is rendered, so the operator
can already see it" (`:179`).

The whole register is appended to a constitution and identity the operator owns
on disk, and `_system_prompt`'s docstring states why it is appended rather than
written into them (`:239-241`): the tone, block and action contracts "belong to
this SURFACE — the same brain answers a terminal differently."

## The cap: dropped whole versus truncated

`pipeline/jobfit/companion_blocks.py:18-28` states the three properties in the
order the technique argues them, and property 2 is the drop/truncate rule
verbatim: "Over-long arrays are TRUNCATED rather than dropped (a 10-row answer is
still an answer at 8 rows), while a structurally wrong block is dropped whole."
The code matches. Truncation is a `break` on reaching the cap while building
(`:123` for columns, `:135` for rows, `:160` and `:172` for chart points, `:176`
for series); structural rejection is a `return None` from `_table` / `_chart`
(`:110`, `:126`, `:138`, `:151-153`, `:158`, `:179`).

Nothing raises. `split_reply_blocks`'s contract is stated as a value judgement
(`:304-308`): `dropped` "is never an exception: a reply that reaches the operator
is worth more than a reply that was right." The count reaches the payload as
`blockErrors` (`companion_cli.py:362`), and its sibling `actionErrors` is kept
separate on purpose — the comment at `companion_blocks.py:214-218` says mixing
the two fence families into one regex "would make 'how many blocks were dropped'
and 'how many actions were dropped' the same number." That is
`failure-not-empty-success` applied at the granularity the technique asks for.

The truncated-input case is handled too: `_DANGLING_RE` (`:73`) matches a fence
the model opened and never closed — a completion cut at its token ceiling — and
its comment names the failure it prevents: "Left in place it would print raw JSON
at the operator."

## Internal consistency before the renderer sees it

`_chart:181-183` collapses the axis and every series to one length, with the
reason inline: "One length wins: x and every series are truncated to the shortest
of them, so a bar can never be drawn against an axis tick that does not exist."
Holes are refused rather than filled — a series containing a non-number is
dropped entirely (`:173-174`, "a hole in a series is not a chart — drop the
series") — and a table row blank in every column is dropped as "noise, not data"
(`:133`). `_cell`'s docstring carries `unknown-is-not-a-value` in one clause
(`:92-93`): a missing value becomes `""` so "the renderer draws a quiet
placeholder, because an absent number is not zero."

## The two ordering rules, both present and both commented

`_shape:334-338` calls its order "load-bearing twice over", and the first half is
the technique's rule exactly: the fences must come out before the prose ceiling
is applied, "or a 700-character slice would routinely halve one and turn a valid
proposal into a dropped one plus a paragraph of raw JSON." The cut lands at
`:342`, after both passes.

The blocks-only case is at `:343-348`. An empty prose channel with surviving
blocks is filled with `BLOCKS_ONLY_LEAD` (`:134-139`), four per-locale strings
whose comment says what they are for — "Not a greeting: the table below it is the
answer, and this is the one line that introduces it" — and whose call-site
comment names the defect avoided: "a blank bubble above a table reads as a bug."

## What the record keeps

`_episode_text:321-328` appends the blocks' titles to what the turn is remembered
as, because "Blocks are a rendering, but their SUBJECT is part of what was said —
an episode that dropped it would make 'what did you show me about the platform
role?' unanswerable a week later." This is the technique's record rule, reached
independently.

## The catalog is single-sourced; the caps are not

The two halves of this file disagree with each other on
`one-authority-per-vocabulary`, and the contrast is instructive.

The **action catalog is exemplary**. No action id appears anywhere in the Python:
`_action` validates against "the catalog THE CALLER WAS SHIPPED"
(`companion_blocks.py:225-231`), and `_action_contract` builds the teaching from
that same array (`companion_cli.py:193-198`), so "the prompt cannot teach an
action the parser rejects, or miss one it would accept." An absent catalog yields
an empty map and therefore no addendum at all (`companion_blocks.py:258-262`,
`companion_cli.py:215-216`) — the correct default rather than a permissive one.

**Deviation: the render caps are two hand-maintained copies.**
`companion_blocks.py:47-54` defines `MAX_TABLE_COLUMNS`, `MAX_TABLE_ROWS`,
`MAX_CHART_POINTS`, `MAX_CHART_SERIES` and `MAX_BLOCKS`, under a comment that
names the hazard without closing it: "app/\_components/chat/ChatTable.tsx and
ChatMiniChart.tsx are built to exactly these numbers; changing one without the
other produces a block the model may emit and the dock cannot draw." The prompt
side is clean — every cap in `_BLOCK_CONTRACT` is interpolated from these
constants, never typed as a literal — so two of the three consumers already
derive from one definition. The third, the renderer, is a TypeScript file across
a process boundary that restates them in prose comments
(`ChatTable.tsx:15`, "at most four columns by contract";
`ChatMiniChart.tsx:41-42`, "the block contract caps series at 2"). The fix the
law implies is the one the action catalog already demonstrates in the same
repository: ship the numbers through `turn.json` in the direction they are
authored, rather than documenting the coupling.
