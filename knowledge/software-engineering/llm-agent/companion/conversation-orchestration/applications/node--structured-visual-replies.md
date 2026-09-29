---
layer: application
type: application
subject: conversation-orchestration
technique: structured-visual-replies
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The register and the cap in kp's companion turn

kp is a Next.js recruiting studio whose operator companion, Candi, answers in a
30rem dock beside the board. The turn is executed by a spawned Python CLI
(`pipeline/jobfit/companion_cli.py`) which the TypeScript side calls with a
`turn.json`; the register and the block cap both live there, one file apart from
each other, and the seam between them is the interesting part.

*Citations resolved at kp `86eded59d` on 2026-09-29. Every line moved since the
first pass (the file gained a voice channel and two register bullets, all
citations below shifted by roughly 24-28 lines), so a line number here is a
location at that sha, not at the branch tip.*

## The register, stated as checkable rules

`companion_cli.py:174-184` is the whole tone contract, and its first line is the
technique's premise in the operator's own words: "Write like a modern web app,
not like a book." What follows is deliberately not adjectives —

> - Lead with the answer in one or two short sentences. Never restate the question.
> - Paragraphs of at most three sentences. Use bullets rather than a wall of prose.
> - Every number carries its unit or its noun ("4 candidates", "12 days", "68 %").
> - No markdown headings, no preamble, no sign-off, no commentary about answering.

Two bullets have been added since the first pass, and both extend the register
rather than change it: "Say what you do not know in one clause" (`:180`) and a
"WEAVE IT IN" rule for recalled memory (`:181-182`) — recall is used in the
sentence, never quoted back as a block. The register ends with the ceiling
stated numerically and conditionally (`companion_cli.py:183-184`): 700
characters when a block is present, 1200 otherwise (`:130-131`, applied at
`:443`). The prose budget tightens precisely when the block is
carrying the enumeration, which is the rule the technique asks for and the one
most implementations omit.

The block half (`companion_cli.py:190-207`) opens by naming the threshold in
capitals — "WHEN THREE OR MORE COMPARABLE THINGS ARE THE ANSWER, DO NOT ENUMERATE
THEM IN PROSE" — teaches the two fences by literal example rather than by
describing a schema, and states each cap as a consequence: "A block that breaks
one is DROPPED and the operator sees nothing" (`:202`). Its authoring comment
(`:186-189`) gives the reason the example is literal: "a schema described in
prose gets paraphrased, a fenced sample gets copied." The last line is the
redundancy ban: "Never describe a block in prose. It is rendered, so the operator
can already see it" (`:207`).

The whole register is appended to a constitution and identity the operator owns
on disk, and `_system_prompt`'s docstring states why it is appended rather than
written into them (`:293-295`): the tone, block and action contracts "belong to
this SURFACE — the same brain answers a terminal differently." The same function
now also appends a voice contract (`:306`), a third in-band dialect beside the
two fences.

## The cap: dropped whole versus truncated

`pipeline/jobfit/companion_blocks.py:18-31` states the three properties in the
order the technique argues them, and property 2 is the drop/truncate rule
verbatim: "Over-long arrays are TRUNCATED rather than dropped (a 10-row answer is
still an answer at 8 rows), while a structurally wrong block is dropped whole."
The code matches. Truncation is a `break` on reaching the cap while building
(`:147-148` for columns, `:159-160` for rows, `:200-201` for series) or a slice
for chart points (`[:MAX_CHART_POINTS]`, `:184` and `:196`); structural
rejection is a `return None` from `_table` / `_chart` (`:135`, `:150`, `:162`,
`:176-178`, `:183`, `:203`).

The prompt is harsher than the boundary, and the difference is worth naming.
The sentence the model reads says a block that breaks a cap "is DROPPED"
(`companion_cli.py:202`); the code drops a block only for a structural fault, and
truncates an over-long array. Only the block *count* is a counted drop
(`companion_blocks.py:339`, `if block is None or len(blocks) >= MAX_BLOCKS:
dropped += 1`). Telling the model the worse consequence is defensible — it is
the version that keeps models inside the cap — but it means the prompt cannot be
read as documentation of the boundary, and the test that pins the boundary has
to pin the code, not the prompt.

Nothing raises. `split_reply_blocks`'s contract is stated as a value judgement
(`:328-332`): `dropped` "is never an exception: a reply that reaches the operator
is worth more than a reply that was right." The count reaches the payload as
`blockErrors` (`companion_cli.py:467`), and its sibling `actionErrors` is kept
separate on purpose — the comment at `companion_blocks.py:238-242` says mixing
the two fence families into one regex "would make 'how many blocks were dropped'
and 'how many actions were dropped' the same number." That is
`failure-not-empty-success` applied at the granularity the technique asks for.

The truncated-input case is handled too: `_DANGLING_RE` (`:97`, comment `:94-96`) matches a fence
the model opened and never closed — a completion cut at its token ceiling — and
its comment names the failure it prevents: "Left in place it would print raw JSON
at the operator."

## Internal consistency before the renderer sees it

`_chart:205-207` collapses the axis and every series to one length, with the
reason inline: "One length wins: x and every series are truncated to the shortest
of them, so a bar can never be drawn against an axis tick that does not exist."
Holes are refused rather than filled — a series containing a non-number is
dropped entirely (`:197-198`, "a hole in a series is not a chart — drop the
series") — and a table row blank in every column is dropped as "noise, not data"
(`:156-157`). `_cell`'s docstring carries `unknown-is-not-a-value` in one clause
(`:116-117`): a missing value becomes `""` so "the renderer draws a quiet
placeholder, because an absent number is not zero."

## The two ordering rules, both present and both commented

`_shape:428-439` now calls its order "load-bearing three times over" — the voice
section is lifted first, a pass added since the first pass — and the fence half
is still the technique's rule exactly: the fences must come out before the prose ceiling
is applied, "or a 700-character slice would routinely halve one and turn a valid
proposal into a dropped one plus a paragraph of raw JSON." The cut lands at
`:443`, after the passes.

The blocks-only case is at `:444-449`, and it now also fires when only
actions survive. An empty prose channel with surviving
blocks is filled with `BLOCKS_ONLY_LEAD` (`:160-167`), four per-locale strings
whose comment says what they are for — "Not a greeting: the table below it is the
answer, and this is the one line that introduces it" — and whose call-site
comment names the defect avoided: "a blank bubble above a table reads as a bug."

## What the record keeps

`_episode_text:399-406` appends the blocks' titles to what the turn is remembered
as, because "Blocks are a rendering, but their SUBJECT is part of what was said —
an episode that dropped it would make 'what did you show me about the platform
role?' unanswerable a week later." This is the technique's record rule, reached
independently.

## The catalog is single-sourced; the caps are not

The two halves of this file disagree with each other on
`one-authority-per-vocabulary`, and the contrast is instructive.

The **action catalog is exemplary**. No action id appears anywhere in the Python:
`_action` validates against "the catalog THE CALLER WAS SHIPPED"
(`companion_blocks.py:247-257`), and `_action_contract` builds the teaching from
that same array (`companion_cli.py:246-255`), so "the prompt cannot teach an
action the parser rejects, or miss one it would accept." An absent catalog yields
an empty map and therefore no addendum at all (`companion_blocks.py:282-285`,
`companion_cli.py:269-270`) — the correct default rather than a permissive one.

**Deviation: the render caps are three hand-maintained copies, and only two of
them are derived.** `companion_blocks.py:59-66` defines `MAX_TABLE_COLUMNS`,
`MAX_TABLE_ROWS`, `MAX_CHART_POINTS`, `MAX_CHART_SERIES` and `MAX_BLOCKS`, under
a comment that names the hazard without closing it: "app/\_components/chat/
ChatTable.tsx and ChatMiniChart.tsx are built to exactly these numbers; changing
one without the other produces a block the model may emit and the dock cannot
draw." The prompt side is clean — every cap in `_BLOCK_CONTRACT` is interpolated
from these constants (`companion_cli.py:203-206`), never typed as a literal.

The first pass read the TypeScript side as prose comments only. That was
incomplete: `app/_components/chat/chatBlockTypes.ts:19-24` holds the same numbers
as real constants (`CHAT_MAX_BLOCKS` 2, `CHAT_TABLE_MAX_COLUMNS` 4,
`CHAT_TABLE_MAX_ROWS` 8, `CHAT_CHART_MAX_POINTS` 8, `CHAT_CHART_MAX_SERIES` 2),
enforced at draw time by the client coercion (`app/_lib/companion-blocks.ts`),
with the mirror obligation written out at `chatBlockTypes.ts:10-15` ("Change one
side and you must change the other"). The renderers themselves still restate the
numbers in prose (`ChatTable.tsx:14`, `ChatMiniChart.tsx:42-43`) and import none
of the constants. So the coupling is three copies — Python constants, TypeScript
constants, renderer comments — and the two test suites each derive from their
own copy (`test_companion_blocks.py:114`, `companion-blocks.test.ts:55`); no
test spans the language boundary, so drift would show only as the TypeScript
coercer truncating something Python let through. The fix the law implies is still
the one the action catalog demonstrates in the same repository: ship the numbers
through `turn.json` in the direction they are authored, or pin the two constant
blocks against each other in one test.

## The boundary is counted on both sides now

The first pass found the drop count reaching the dock as one server-side number.
Since `9abf3f32b` (2026-09-02) the dock adds a second count: blocks that passed
the Python boundary and then failed the TypeScript re-coercion at draw time.
`CompanionDockBody.tsx:355` reads `const { blocks, blockErrors: dropped } =
renderableBlocks(meta)`, and `renderableBlocks` (`companion-blocks.ts:152-158`)
returns the server's `blockErrors` plus its own discards. The header comment
(`companion-blocks.ts:97-115`) names the defect it closes — a block valid to
Python and invalid to TypeScript was previously dropped with no count — which is
the technique's counted-discard rule applied on both sides of the process
boundary rather than one. `actionErrors` stays separate (`:356`).

The two validators are not identical, and the gap is an `unknown-is-not-a-value`
divergence. Python drops a whole chart series that contains a hole
(`companion_blocks.py:197-198`); the TypeScript coercer filters non-numbers out
of the series (`companion-blocks.ts:71-73`), so the remaining values shift left
against the wrong x labels. It is reachable only for a stored or stale block, and
it is exactly the case a shared fixture between the two test suites would catch.
