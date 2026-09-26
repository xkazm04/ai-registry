---
layer: application
type: application
subject: time-travel-replay
technique: transport-and-time-mapping
stack: react
verified_on: 2026-09-26
verified_against: react@19
---

# ReplaySandbox + useReplayTimeline — the execution-replay transport

Re-verified 2026-09-26 against `personas` master at `a8cb3aa62` (React
`^19.2.6`), after this run's fix to the log page. Since the first version of
this document (2026-08-18), the orphaned second transport,
`src/hooks/realtime/useTimelineReplay.ts`, was deleted rather than rewired
(`44b0bc8bd`, 2026-09-02), and disclosed silence-skipping was added. One
transport remains: `src/hooks/execution/useReplayTimeline.ts`, driven by
`src/features/agents/sub_executions/replay/ReplaySandbox.tsx`.

## The mapping, done right

The playhead is kept as **ms from execution start** (`currentMs`), directly
expressible as record time. The play loop accumulates elapsed viewer time ×
speed per animation frame (`pendingDelta += (now - lastTickRef.current) * speed`,
`:437`) but flushes state only every `PLAYBACK_FLUSH_MS = 80` (`:342`). That
gives time accuracy at frame rate and render cost at about 12 fps, with the
technique's "advance by elapsed × rate" shape. The clock is `performance.now()`
and nothing in the replay reads the wall clock. `scrubTo` clamps into
`[0, totalMs]` (`:468`). Crossing detection is positional, by a binary search
over sorted line times (`countVisibleLines`), so a jumped window releases
everything inside it and a paused playhead releases nothing.

## Seek, step and intent

- `scrubTo`, `stepForward` / `stepBackward` (`:478`) and `skipSilence`
  (`:496`) keep the current play state: the gesture moves the viewpoint and
  does not toggle intent.
- `jumpToStart` and `jumpToEnd` (`:475-476`) always pause. For the end, that
  matches the media contract (arriving at the end ends playback). For the
  start, it is a deviation: Home while playing stops playback.
- Stepping moves between a sorted set of tool-step boundaries (`:459`).
  These now include inferred ends of unclosed steps, so "next event" is exact
  where the step was closed by the record and approximate where the client
  bounded it, and the control does not say which just happened.

## Dead air: disclosed, opt-in, and briefly unreachable

Compression is built the way the technique conditions it. It is a toggle,
never the only view. Skip-silence moves the playhead to the end of the
recorded silence it stands in (`findSilenceSkipTarget`, `:129`). Auto-skip is
off by default (`useState(false)`, `:493`) and acts only during playback
(`:505`). The control is disabled rather than hidden when there is nothing to
skip (`ReplayTransportControls.tsx:117`). Silences are hatched on the scrubber
only from recorded tempo.

From 2026-09-17 until this run's fix all of it was unreachable, because the
log page arrived without stamps (see
[react--timeline-derivation](./react--timeline-derivation.md)). The only
remedy left was uniform speed (`SPEED_OPTIONS = [1, 2, 4, 8]`,
`libs/useReplayState.ts:17`), which compresses the action exactly as much as
the silence.

## Where it deviates

- **Ended is not closed, but replaying is no longer one gesture.** The end
  effect stops playback at `totalMs` and the run stays scrubbable. The
  deleted transport auto-rewound on play at the end. The surviving
  `togglePlay` (`:474`) does not: play at the end clamps, the end effect
  stops it on the next render, and the button appears to do nothing.
- **Keyboard grammar** is borrowed and not double-handled. `ReplaySandbox`
  wires Home/End/Space/arrows and defers to the scrubber when it has focus,
  because the scrubber "is a real slider now and owns its own arrow keys".
