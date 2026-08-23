---
layer: application
type: application
subject: conversation-orchestration
technique: narration-promote-on-finish
stack: react
status: forged
verified_on: 2026-08-23
---

# Promoting the narration timeline in the Personas companion panel

Personas' companion accumulates a turn-scoped narration timeline while a turn
streams — the model's own beats plus every tool call with its duration — and
promotes it onto the finished turn at settlement. The whole handoff is three
files: a pure data module, one store action, and a persistence hook.

## The two stores, and the write between them

`src/features/plugins/companion/narrationTimeline.ts:14-34` defines the two
shapes the technique's handoff needs: `NarrationEntry` (live, per-entry) and
`StoredNarration` (`startedAt`, `endedAt`, `entries`) — the durable form. The
module header states the model outright (`narrationTimeline.ts:1-12`): the live
view renders under the streaming bubble, and "on `finished` the store promotes
it to `narrationByEpisodeId` so a collapsed 'What I did — N steps · 48s' trail
persists under the completed bubble".

The write is `attachNarrationToEpisode`
(`src/features/plugins/companion/companionStore.ts:1235-1258`), and it is
exactly the shape the technique prescribes:

- it computes the cleared live channel first, then decides whether to write
  (`companionStore.ts:1237-1247`) — so the release is part of the same
  `set(...)`, never a second step that can be skipped between the two;
- it is keyed by `episodeId` into a record (`companionStore.ts:1249-1256`), so
  a second observation of the same settlement **replaces** rather than appends;
- it refuses to write a trail that is not worth keeping
  (`companionStore.ts:1243-1244`, via `isTrailWorthKeeping` at
  `narrationTimeline.ts:69-71`) — a turn with no tool calls gets no trail and
  no empty disclosure toggle.

Idempotency also exists one level down: `appendNarrationEntry`
(`narrationTimeline.ts:41-47`) dedupes by entry id, with the reason in its own
doc comment — "the CLI can re-emit a `tool_use` block (whole-message after
deltas), and a beat re-scan must not double-log". `completeNarrationTool`
(`narrationTimeline.ts:50-60`) stamps an end time once and returns the same
array if it is already stamped.

## Durability and the cap

Promotion into the store is session-scoped; a second write carries it to disk.
`persistTurnSidecar` (`src/features/plugins/companion/useTurnSidecars.ts:33-45`)
snapshots four channels for one episode — narration, checklist steps, turn
summary, recall preview — and fires the IPC without awaiting, because "the
caller is on the `finished` / `turn-summary` event path and must not await IPC"
(`useTurnSidecars.ts:28-32`). `serializeSidecar`
(`turnSidecars.ts:73-96`) returns `null` when no channel has content, so a plain
conversational turn writes no row at all.

`capNarration` (`turnSidecars.ts:51-57`) trims to the newest
`MAX_PERSISTED_NARRATION_ENTRIES = 100` (`turnSidecars.ts:32`), with the reason
stated at `turnSidecars.ts:28-31`: an agentic run with hundreds of tool calls
must not write an unbounded blob into the user database, and "the NEWEST entries
are kept — the tail is what a reader wants when a trail is too long to show
whole". That is the retention rule the technique asks for.

**Deviation.** The trail's step count is `toolEntries.length` computed from the
retained entries (`NarrationThread.tsx:104-108`), and no true total is carried
alongside. A turn whose trail was capped at 100 therefore renders "100 steps"
with no indication that the count is partial. The cap is generous enough that
this is rare, and the fix is small — carry the pre-cap count into
`StoredNarration` — but as it stands the count does not carry its predicate.

Corrupt persisted blobs degrade correctly: `parseBlob`
(`turnSidecars.ts:99-110`) catches, reports through the silent-catch door, and
returns `undefined`, so a bad row becomes "no sidecar" — "exactly the behaviour
before persistence existed — rather than breaking the transcript". `parseSidecars`
additionally drops an empty entry list on read (`turnSidecars.ts:112+`) because
"a trail with no entries would render an empty 'What I did' toggle".

## Live view and settled view are different components

`NarrationLiveLog` (`NarrationThread.tsx:70-92`) renders the running turn's log
bounded to `LIVE_MAX_ROWS = 5` (`NarrationThread.tsx:28-29`) with a "+N earlier"
row carrying the hidden count (`NarrationThread.tsx:84-88`) — the bounded live
window the technique requires, and its count is honest because it is derived
from the same array.

`NarrationTrail` (`NarrationThread.tsx:97-160`) renders the settled form: a
collapsed disclosure labelled with the step count and a formatted duration
computed from `endedAt - startedAt` (`NarrationThread.tsx:107-112`), expanding
to the tool rows. Two details are worth copying. The trail filters to tool
entries only (`NarrationThread.tsx:102-105`) because in this codebase beats
already persist as their own conversational aside messages, so including them
would double-show — the technique's "when not to use this" clause, realized.
And its entrance animation is declared `initial`/`animate` once on mount
(`NarrationThread.tsx:118-121`) so re-rendering the transcript never re-plays
it, with `shouldAnimate` collapsing it to nothing under reduced motion — the
"re-opening history is not a replay" rule.

**Deviation.** There is no separate rendering for a failed or interrupted turn's
trail: `NarrationTrail` collapses identically regardless of outcome. The
technique asks a failed turn to lead with its last step, expanded or one
interaction away, because for a failed turn the process is the answer.
