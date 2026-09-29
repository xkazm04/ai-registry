---
layer: application
type: application
subject: prompt-assembly
technique: summary-evidence-gate
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A summary admitted on its finish reason, from input the summarizer only half saw (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. The realization is the
model-written summary tier of a compaction ladder. It fails closed on the cases that are
visibly broken and has no gate for the ones that are only wrong.

## What admits a summary

Three checks reject a reply: empty text
(`src/context/compaction/CompactionEngine.ts:424 "throw new Error("Summary model returned empty content");"`),
a finish reason of *length*, and a finish reason of *content filter*. A structure check on
the expected headings exists and only warns
(`src/context/compaction/CompactionEngine.ts:1327 "code: "compact_summary_structure_weak","`).
Secrets are redacted by pattern. There is no check that a value or identifier the summary
names occurs in the source, none that the summary adds nothing, and no source pointers, so
the technique's model-free checks are all absent: the summary is the reply that got
through.

## Executed: what the summarizer is shown

Each tool result is capped before the summarizer sees it
(`src/context/compaction/CompactionEngine.ts:99 "const COMPACT_SUMMARY_INPUT_TOOL_RESULT_MAX_CHARS = 2_000;"`),
with a preview and a short tail kept. A 3,839-character result of two hundred rows reached
the summarizer as 1,084 characters: the first and last rows were visible and row 100 was
not. The result is elided with no pointer telling the model where the omitted middle can
be fetched again, so a summary can state a fact about a table it read a fifth of and the
resumed model has no way to know. The same tree's older-output rewrite does carry a
reference for large results, and it does not extend to the summarizer's input.

The adjacent duplicate rule reads as though the newer call were the one omitted, and the
executed order was the reverse: the omitted result was the newer call, and the older kept
its content (`src/context/compaction/CompactionEngine.ts:960 "A newer call produced the same large output."`
is the text placed on the omitted one, which was the newer call).

## What the failure path does right

A failed summary marks the compaction as failed with a status the boundary record carries
(`status="summary_failed"` in the executed boundary), keeps the messages it was going to
keep, and does not fabricate a checkpoint; a test names that behaviour. That is the
technique's "failures keep the last valid state, marked stale" in the half the tree built.

## Cannot say

Whether the elided middle of a real tool result ever carries the fact a later turn needs.
The truncation is a bounded loss on a bounded input; the missing pointer is what turns it
into a silent one. The tree holds no measurement of summary fidelity.
