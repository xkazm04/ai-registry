---
layer: application
type: application
subject: time-travel-replay
technique: timeline-derivation
stack: react
verified_on: 2026-09-26
verified_against: react@19
applied: code
ab_verdict: better
---

# useReplayTimeline — a tempo fix that tested green and never reached the Replay tab

Re-verified 2026-09-26 against `personas` master at `a8cb3aa62` (React
`^19.2.6`), and after this run's fix. The first version of this document
(2026-08-18) recorded log lines stamped by index; the fix it proposed landed
on 2026-09-02 and was undone by an unrelated change two weeks later, without
a failing test. That history is the lesson, so it is kept.

`src/hooks/execution/useReplayTimeline.ts` derives the sandbox's timeline
from two records: `execution.tool_steps` (recorded `started_at_ms` /
`ended_at_ms` per step) and a page of the execution log fetched by
`getExecutionLogLines` (`ReplaySandbox.tsx:45`). The record's writer and
reader are described in [rust--timeline-derivation](./rust--timeline-derivation.md).

## The tempo: recorded, then lost at the reader

`parseLogTimestamps` (`:219`) reads the `[rfc3339]` prefix the engine logger
writes on every line, anchored by `LOG_TIMESTAMP_RE` (`:202`). Lines are
placed at the time they were written; unstamped continuation lines are
interpolated between their stamped neighbours and carry `recorded: false`
(`:22`). Only a log with no stamps at all falls back to the old even spread,
`(index / Math.max(texts.length - 1, 1)) * totalMs` (`:265`). Silences are
computed only from recorded lines (`findSilences`, `:316`), with a floor of
2 s or 2% of the run, and the scrubber hatches them only when the tempo was
recorded (`TimelineScrubber.tsx:138`). That is the technique's gap rule done
properly: an apportioned gap is never shown as a silence.

On 2026-09-17 the replay switched from the full-file read to the paged
`get_execution_log_lines`, which served the text after `[STDOUT] ` with the
stamp cut off. The parser found nothing and took the fallback on every run:
0 of 523 stdout-bearing logs on the operator's machine reached the timeline
with a tempo, the hatching and skip-silence were unreachable, and a
cancelled run (no `duration_ms`, `totalMs = durationMs ?? recordedSpanMs ?? 0`,
`:358`) lost its timeline. The hook's tests stayed green because they fed a
whole stamped log string; no test fed the page the Replay tab receives.

The fix, in this run (personas `281c02dc3`): the replay asks for a stamped page (`ReplaySandbox.tsx:45`,
the command's opt-in `stamped` flag), the parser strips the stamp from the
display text so the terminal shows what it showed before, and a new test
block feeds a page in the command's exact shape, chrono's
`2026-09-26T10:00:00.000000100+00:00` included. Its display-text test fails
against the unmodified parser, and the bare-page test pins why the flag
exists. Measured over the same 523 logs, the stamped page gives 523 of 523 a
recorded tempo and 3,445 disclosed silences.

## Still open

- **Load failure reads as an empty log.** `getExecutionLogLines` failure is
  `silentCatch`'d (`ReplaySandbox.tsx:49`), `logLines` stays null, and the
  terminal says "scrub forward" (`ReplayTerminalPanel.tsx:256`) as if the run
  were short. The reader adds to it: an unopenable file returns `Ok(vec![])`.
  A blind recorder and an idle run still render identically.
- **The page does not say it is a page.** The replay asks for the first 500
  stdout lines and the counter reads `N/500` (`ReplayTerminalPanel.tsx:185`)
  with no notice. 20 of the 523 logs are longer, and for them the page ends
  between 52% and 99% of the way through the recorded span.
- **Interpolated lines look recorded.** `recorded: false` exists on every
  line but the terminal panel's line type does not accept it, so a
  continuation line placed by interpolation renders like a stamped one.

## Steps and cost

Unclosed steps are now bounded rather than left open to the end:
`buildToolStepSpans` (`:183`) ends an open step at the next step's start, or
the run's end for the last one (`const bound`, `:191`), and marks it
`inferred_end: true`. Steps the engine closed itself at persist time arrive
with no such mark, and that part of the defect sits in the writer.

`accumulatedCost` (`:413`) still apportions `execution.cost_usd` by step
progress, because no per-step cost is recorded. `ReplayCostPanel.tsx:46`
prefixes it with `~`, which is the right instinct at the right place, but it
prints four decimals of an apportionment (`precision: 4`,
`libs/useReplayState.ts:15`) and never says what the estimate is apportioned
by. `CostAccrualOverlay.tsx:41` now decides its dashed "estimated" treatment
per curve anchor (`curveIsEstimated`) rather than per trace. The comment at
`:113-118` still describes the older per-trace meaning.
