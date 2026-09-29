---
layer: application
type: application
subject: conversation-orchestration
technique: narration-promote-on-finish
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Promoting the narration timeline in the Personas companion panel

Personas' companion accumulates a turn-scoped narration timeline while a turn
streams — the model's own beats plus every tool call with its duration — and
promotes it onto the finished turn at settlement. The whole handoff is three
files: a pure data module, one store action, and a persistence hook.

*Citations resolved at Personas `fb317cfa9` (master) on 2026-09-29. The frontend
moved from `src/features/plugins/companion/` to `src/features/companions/athena/`
(`bf4fe6c05`, 2026-09-22) and the store was renamed `athenaStore.ts`
(`d11cd7591`); paths below are the new ones. The first pass (2026-08-23) described
a settled trail the user could open. That was true of the code it read and not of
the product: the section on rendering is replaced by what actually holds.*

## The two stores, and the write between them

`src/features/companions/athena/narrationTimeline.ts:14-34` defines the two shapes
the technique's handoff needs: `NarrationEntry` (live, per-entry) and
`StoredNarration` (`startedAt`, `endedAt`, `entries`) — the durable form. The
module header states the model outright (`narrationTimeline.ts:1-12`): "on
`finished` the store promotes it to `narrationByEpisodeId` so a collapsed 'What I
did — N steps · 48s' trail persists under the completed bubble".

The write is `attachNarrationToEpisode`
(`src/features/companions/athena/athenaStore.ts:1360-1384`), and it has the shape
the technique prescribes for a single successful settlement:

- it computes the cleared live channel first, then decides whether to write
  (`athenaStore.ts:1362-1372`) — so the release is part of the same `set(...)`,
  never a second step that can be skipped between the two;
- it is keyed by `episodeId` into a record (`athenaStore.ts:1373-1383`);
- it refuses to write a trail that is not worth keeping (`athenaStore.ts:1369`,
  via `isTrailWorthKeeping` at `narrationTimeline.ts:69-71`) — a turn with no tool
  calls gets no trail.

**Correction to the first pass on idempotency.** The first pass said a second
observation of the same settlement "replaces rather than appends". Read closely,
the second call is a **no-op**, not a replace: it finds `streamingNarrationStartedAt
== null` (`athenaStore.ts:1364`, `:1368`) because the first call already cleared
the live channel in the same `set`, and returns only the cleared fields. There is
no guard on `narrationByEpisodeId[episodeId]`. So this implementation is a third
way to be idempotent, distinct from both the technique's two: not a keyed replace
and not a beside-the-record flag, but *consume the source on write*. It holds
exactly while nothing writes the source between the two observations. A duplicate
`finished` that arrives after a new turn has called `beginNarration`
(`athenaChatStream.ts:74`) would find a live channel again and attach the new
turn's entries under the old turn's id — read from the code, not exercised. No test
references `attachNarrationToEpisode` or `resetStreamingNarration` (a search of the
test files at HEAD returned nothing), so the property is held by the reading above
and by nothing else.

Idempotency also exists one level down: `appendNarrationEntry`
(`narrationTimeline.ts:41-47`) dedupes by entry id, with the reason in its own doc
comment — "the CLI can re-emit a `tool_use` block (whole-message after deltas), and
a beat re-scan must not double-log". `completeNarrationTool`
(`narrationTimeline.ts:50-60`) stamps an end time once and returns the same array
if it is already stamped.

## Which terminal paths promote

`athenaChatStream.ts:127-147` and `:173-181` decide it, and the branches are the
finding:

- **`finished` carrying an episode id** — the assistant episode exists — calls
  `attachRecallToEpisode`, `attachPendingJobsToEpisode`, `attachStepsToEpisode`,
  `attachNarrationToEpisode(ev.payload)` and then `persistTurnSidecar`
  (`:137-141`). Promotion happens.
- **`finished` with an empty payload** calls `setStreamingRecall(null)` and
  `resetStreamingNarration()` (`:143-144`). The trail is discarded.
- **`error`** calls `resetStreamingNarration()` and nothing narration-related else
  (`:180`). The trail is discarded.

`resetStreamingNarration` (`athenaStore.ts:1385-1386`) clears
`streamingNarration` and `streamingNarrationStartedAt` and writes nothing. That is
the technique's "released without being written" defect, and it is real — but it
is narrower than the registry map's first reading of it ("a failed or interrupted
turn keeps no trail"). The Rust side salvages more than that suggests: a user
**Stop** is completed as `_[interrupted by user]_` and returned as `Ok`
(`src-tauri/src/companion/session/cli.rs:340-349`), a mid-stream pipe break
(`cli.rs:357-372`) and a non-zero exit with partial text (`cli.rs:394-407`) are
returned as `Ok` too, and each persists an assistant episode that `turn.rs:1073-1082`
announces with `Finished { payload: assistant_ep_id }`. Those turns take the first
branch and are promoted. What is lost is the **hard failure** — no partial text at
all: a dispatch error, the 25-minute timeout, a failed retry
(`turn.rs:497-515`), a non-zero exit with no text (`cli.rs:409-411`), an empty reply
(`cli.rs:420`) — each ends in `emit_error` and the reset. The trail of a turn that
never produced a reply is exactly the one the technique says is worth most.

Two further limits on what the promotion covers. The stream handler gates narration
append, tool completion and attach on `isActive` (`athenaChatStream.ts:69`, `:82`,
`:132`), and `streamingNarration` is one global slot, not one per conversation, so a
turn that finishes on a thread that is not focused gets no trail. And the technique's
distinct **interrupted** state is not represented: `StoredNarration` has no outcome
field (`narrationTimeline.ts:30-34`), so an interrupted turn's trail is
indistinguishable from a successful one's.

## Durability and the cap

Promotion into the store is session-scoped; a second write carries it to disk.
`persistTurnSidecar` (`src/features/companions/athena/useTurnSidecars.ts:34-45`)
snapshots four channels for one episode — narration, checklist steps, turn summary,
recall preview — and fires the IPC without awaiting, because "the caller is on the
`finished` / `turn-summary` event path and must not await IPC"
(`useTurnSidecars.ts:29-33`). `serializeSidecar` (`turnSidecars.ts:73-96`) returns
`null` when no channel has content, so a plain conversational turn writes no row at
all.

`capNarration` (`turnSidecars.ts:51-57`) trims to the newest
`MAX_PERSISTED_NARRATION_ENTRIES = 100` (`turnSidecars.ts:32`), with the reason
stated at `turnSidecars.ts:26-31`: an agentic run with hundreds of tool calls must
not write an unbounded blob into the user database, and "the NEWEST entries are
kept — the tail is what a reader wants when a trail is too long to show whole".
That is the retention rule the technique asks for.

**Deviation.** `StoredNarration` carries no pre-cap count and no outcome. A trail
capped at 100 (beats and tool entries combined) cannot say it was capped, so any
count derived from it is partial without saying so; the fix is small — carry the
true total beside the retained detail — and the renderer that would print the count
is, as below, not mounted.

Corrupt persisted blobs degrade correctly: `parseBlob` (`turnSidecars.ts:99-110`)
catches, reports through the silent-catch door, and returns `undefined`, so a bad
row becomes "no sidecar" — "exactly the behaviour before persistence existed —
rather than breaking the transcript". `parseSidecars` additionally drops an empty
entry list on read (`turnSidecars.ts:112+`).

## The trail is recorded and not rendered

The first pass documented a live view and a settled view. Both components exist —
`NarrationLiveLog` (`NarrationThread.tsx:70-95`, bounded to `LIVE_MAX_ROWS = 5`,
`:29`, with a "+N earlier" row, `:84-88`) and `NarrationTrail` (`:97-161`, a
collapsed disclosure with a step count and duration, tool entries only, entrance
animation declared once and collapsed under reduced motion) — and both are correct
against the technique. Neither is mounted. A search of `src` at HEAD finds them only
at their definitions and in one comment (`turnSidecars.ts:15`). The CompanionPanel
split (`7829b3a297`, 2026-08-07 — two weeks *before* the first pass) dropped both
from the render tree, and `athenaChatStream.ts:79-81` says so: "The narration
timeline still accrues (it backs the dev conversation log and the persisted turn
sidecar) even though the chat no longer renders it — Athena's tool calls are
recorded, not displayed." `AthenaChatStreamingTurn.tsx:1-12` names the live log as
removed on purpose ("ONE progress surface"). The only reader of
`narrationByEpisodeId` outside persistence is the developer log
(`devConversationLog.ts:99-104`).

So the whole promotion chain — clear-first write, the cap, the sidecar, the
degrade-on-corrupt read — runs on every tool-using turn and produces a record no
user can open. The technique's premise is that the trail a user reads a week later
lives in the record; here the record is faithfully kept for a reader who does not
exist in the product. What the technique should say that this application
supplies: **a write is finished when a reader exists**. Before building the
idempotency and the cap, name the surface that renders the settled form, and when
that surface is removed, remove the write with it or record the deliberate
decision to keep it for a named consumer — here that is the developer log and the
sidecar, and the second is a decision, not an accident.

The beats half is unaffected: beats persist as their own conversational aside
messages (see the progress-beat application), so a user does read those, and that
is why the trail filters to tool entries only.
