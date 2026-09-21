---
layer: application
type: application
subject: usage-event-ingestion
technique: running-total-or-increment
stack: node
status: forged
verified_on: 2026-09-15
verified_against: node@22
---

# A session-log reader that names each counter's scope, then merges two scopes in one field

The stack version is witnessed by the tree's CI workflow (`node-version: 22`).
The tree is an open-source editor extension that parses coding agents' local
session logs and scores how its user works with them; citations are pinned to
commit `18b1a3d` (2026-09-05). It does not receive interval reports. It reads log
records written by the host editor, and it faces the same decision one level
down: **a token counter in a log is either this round's value or the whole
request's running total**, and the log does not always say which.

## What it gets right: scope is written beside the field

The normalized request type (`src/core/types/session-types.ts:70-79`) documents
the accumulation scope of every token counter in the field's own comment:
`promptTokens` is "LAST agentic round's input only, not cumulative across all
rounds", `completionTokens` is "CUMULATIVE across all agentic rounds", and the
cache counters are subsets of the prompt count. The parser repeats the analysis
at the point of extraction (`src/core/parser-vscode-request.ts:478-491`): the
per-round metadata values come from the final model call, "for agentic tasks,
metadata.outputTokens is often a dramatic undercount", while the top-level
counter is summed by the host across every call and "is the correct total output
token count". That is the technique's first step done well — the scope is decoded
where the record is parsed and written down where every downstream reader will
see it.

The same file refuses to guess a missing value. A request whose result object is
empty is `pending`, one with error details is `errored`, and a finalized agentic
request with no token data at all is `no-data`
(`parser-vscode-request.ts:422-446`); the coverage analyzer drops the first three
from its denominator rather than reading them as zero. The reasoning-effort field
carries the same rule in its comment: "Only set when the source actually exposes
the value — never guessed."

## Where it inverts its own rule

The extraction then assigns `completionTokens: topLevelCompletionTokens ??
metaOutputTokens` (`parser-vscode-request.ts:418`). When the host's cumulative
counter is absent — every log written before the host started persisting it —
the field silently takes the **last-round** value the comment above it calls a
dramatic undercount. Nothing on the request records which source filled it. The
consumption analyzer prices each request from that field as its output count
(`src/core/analyzer-consumption.ts:161-167`), and a request carrying both a prompt
count and this fallback output is classified `complete` — covered, not
`partial` — so an older log's agentic request is billed at one round of output and
counted as fully measured. A history that spans the host's upgrade then puts
running totals and single rounds into one cost series, and the coverage figure
beside it says nothing is missing.

This is the technique's failure reduced to a single field: two scopes behind one
name, one documented and one merely present. The type's comment states the scope
the field has *when the good source exists*; the fallback makes the comment
false for exactly the rows a long-term trend reads first. The realization that
the technique asks for is small — carry the decoded scope beside the value
(`cumulative | last-round`) or leave the field null and let the existing
`no-data` path count it — and the tree already owns both instruments.

## What this realization cannot do

It cannot recover cumulative input tokens at all: the host never persisted them,
and the comment says so rather than estimating. Any cost figure it shows for
input is therefore a per-round sample, and a reader copying its approach should
treat input-side totals from these logs as a lower bound, not a total.
