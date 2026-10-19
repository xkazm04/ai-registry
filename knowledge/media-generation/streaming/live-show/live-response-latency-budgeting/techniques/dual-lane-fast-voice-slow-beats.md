---
layer: technique
type: technique
subject: live-response-latency-budgeting
technique: dual-lane-fast-voice-slow-beats
status: forged
laws: []
shared_with: []
use_when: [a live host needs work that takes far longer than the response budget, planning or memory calls are silencing the host, deciding whether a slow result should still be voiced]
---

# Dual lane: fast voice, slow beats

A live show needs two kinds of generation that cannot share a path. Reactive
lines (a viewer greeted, a jab answered, a vote acknowledged) must start
within the first-word budget. Rich beats (a planned segment turn, a callback
to a moment from an hour ago, a summary of what the room decided) take far
longer to make well. Put both on one path and every rich beat silences the
host while it is made; drop the rich beats and the show is all reflex and no
arc. The answer is two lanes with a strict rule about who speaks.

## The two lanes

The **fast lane** owns the microphone. It runs on the live-voice latency
class, writes short lines, and voices them as soon as they exist. Its prompt
is small and stable, its model is chosen for its tail latency, and it never
blocks on anything slower than itself.

The **slow lane** owns material. It runs on a slower class, does the heavy
work asynchronously, and produces **beats**: a planned line or a premise, with
the moment it is for and an expiry. It never speaks. Its output goes into a
queue the fast lane reads.

When the floor opens (a pause in chat, the end of a reactive exchange, a
segment boundary), the fast lane takes the next fresh beat and voices it,
in its own voice and adjusted to what has happened since the beat was made.
Keeping the voicing in the fast lane means the host sounds like one speaker,
whichever lane did the thinking.

## The rules that keep the lanes apart

- **The fast lane never waits on the slow lane.** If a beat is not ready, the
  fast lane voices something else: a reactive line, a stall, or a premise.
  A host that pauses to wait for its own planning has rebuilt the single lane.
- **The slow lane never speaks directly.** A slow result that goes straight to
  the voice bypasses the fast lane's knowledge of what was said in the
  meantime, and lands as a non sequitur.
- **Every beat carries an expiry.** A callback to a joke works within a few
  minutes of the joke; a reply to a viewer who has left works not at all. A
  beat past its expiry is dropped, not voiced late, because late is worse than
  absent.
- **A beat names its moment.** A beat made for a segment that has since ended,
  or for a vote that has since closed, is stale whatever its age. Check the
  moment, not only the clock.
- **A beat is offered once.** A finished beat is shown to the fast lane as
  news on the next turn and then marked as seen; a beat re-offered every turn
  gets voiced twice, and a host that announces the same discovery twice has
  shown its seams.
- **The slow lane may be pre-empted.** When the room changes (a raid arrives,
  a safety event fires), queued beats are invalidated in bulk rather than
  voiced into a room they no longer fit.

## What the slow lane is for

Work that belongs in the slow lane is work whose value does not depend on
being immediate: planning the next segment, choosing a callback, consolidating
memory, composing a recap, preparing the next premise. Work that belongs in
the fast lane is work whose value is immediacy: acknowledging, answering,
reacting. When a piece of work is both (an answer that needs a lookup), split
it: the fast lane acknowledges in character within budget, and the slow lane
returns the substance as a beat. Covering that interval is the stalling
technique's job.

## Decision rules

- When a call's high-percentile latency exceeds the first-word budget, it
  belongs in the slow lane, whatever its importance.
- When a slow beat keeps expiring, either shorten its work or lengthen its
  expiry honestly; do not voice expired beats to recover the investment.
- When the fast lane's prompt grows to carry what the slow lane should
  prepare, its tail latency grows with it; move the work back.

## When not to use it

A short show with no arc, or a host whose every line is reactive, needs one
lane. A scripted show with no live input needs none: everything is slow lane,
and the script is the beat queue.
