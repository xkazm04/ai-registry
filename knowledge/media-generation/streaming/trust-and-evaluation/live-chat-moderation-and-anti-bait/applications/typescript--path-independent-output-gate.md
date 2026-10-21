---
layer: application
type: application
subject: live-chat-moderation-and-anti-bait
technique: path-independent-output-gate
stack: typescript
status: forged
verified_on: 2026-10-21
verified_against: typescript@6
applied: code
ab_verdict: better
---

# The chat lane is a speaking path: drawn before the filter, fixed by holding the line

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ 56da5cf, 2026-10-21. The
workspace pins TypeScript 6.0.3. The "before" figures replay the stage reducer as it stood on
1992b94, the commit the fix sits on. The fix is 56da5cf.*

Shadowrunr's Rust brain owns both moderation layers: the input filter over the chat inbox
(`crates/shadowrunr-brain/src/moderation.rs:961 "pub fn filter("`) and the output gate
over every host, foil and card line (the Rust application of this technique). The
TypeScript side draws the broadcast: a stage overlay (`packages/stage-kit`, rendered by
`apps/stage`) and the operator console's On Air replica of it (`apps/console`). The
technique says one gate sits at the last door before broadcast. The host's lines pass
through it. The stage's chat lane, which prints viewers' messages on the broadcast
canvas, did not pass through any gate.

## What the stage drew, before

The simulation runner writes each chat message to the event log as it arrives
(`crates/shadowrunr-sim/src/runner.rs:564 "w.push(StreamEvent::Chat {"`). The brain
filters the accumulated inbox on its beat, every 5 s in the sim, and emits a `moderation`
event per message it withholds. The stage reducer added every `chat` event to the lane at
once and struck a line through only when its `moderation` event arrived. The lane drew
the message's text in the meantime.

Replay over every recorded transcript in the tree's `runs/` (n = 372 transcripts,
187,492 chat lines; the reducer folded event by event and the visible lane sampled after
each event):

| | before (1992b94) | after (56da5cf) |
| --- | --- | --- |
| withheld lines drawn with their text first | 64,869 | 26 |
| of which term-list drops (slur, sexual, brigade lists) | 70 | 1 |
| lines the filter let through but the lane marked purged | 5,435 | 0 |
| median wait from arrival to on-screen | 0 s | 2.6 s |

Before the fix, text was exposed for a median of 2.7 s and at most 13.9 s. That was
measured from the gap between a dropped message's `chat` event and its `moderation`
event (54,472 drops, 0 judged before they were drawn).

The second row is a different defect in the same reducer. It purged any message that an
input event named, including messages the filter let through. Three kinds were affected:
a sincere question exempted from the rate cap and then answered on air, the surviving
representative of a collapsed flood, and lines that were only warned. The host
answered "yes, an AI" while the screen labelled the question "purged by the Warden".

## The fix

A line waits for the beat that judged it. The reducer keeps a watermark from the filter's
own verdicts (`picked` and input `moderation` events that name a message:
`packages/stage-kit/src/scene.ts:338 "if (ev.msg_id !== undefined) s = judgeTo(s, at);"`;
a stall or name notice does not count,
`packages/stage-kit/src/scene.ts:337 "Only a verdict on a message marks the filter's beat"`).
A beat closes only when an event later than it arrives
(`packages/stage-kit/src/scene.ts:115 "function closeBeat("`). The first version released
a beat's lines on its first verdict. The replay found 41,572 lines released between two
verdicts of one beat, so the close rule is the measured fix, not a refinement. The lane
draws only judged lines
(`packages/stage-kit/src/scene.ts:138 "if ((j.to === null || m.ts_ms > j.to) && !named) continue;"`),
through one helper that both renderers use
(`packages/stage-kit/src/ui/ChatLane.tsx:39 "const lines = shownLane(scene).slice(-16).reverse();"`,
`apps/console/src/pages/onair/view.ts:38 "for (const { id } of shownLane(scene).slice(-n)) {"`).

Purging is narrowed by naming what passes, not what withholds
(`packages/stage-kit/src/scene.ts:103 "function letThrough(action: string): boolean {"`).
An action the stage has never seen withholds the text. That is the technique's
"a gate that cannot run, does not let the line out", applied to a vocabulary the renderer
does not own.

The new tests were red on the old reducer (3 of 3) and green after; stage-kit 117/117,
console 411/411, stage 189/189, typecheck and lint green.

## Upward lessons

**A surface that displays viewer text is a speaking path, and its door is the input
filter's verdict.** The output gate screens what the host composes. A chat lane, a
highlighted message or a "heard" card reproduces what a viewer wrote, and no output gate
sees it. The rule that holds for both: nothing reaches the canvas before the layer that
judges it has spoken. Folded into the technique as a decision rule.

**A verdict stream needs a close, not a first verdict.** Verdicts for one beat arrive as
several events. A renderer that releases on the first one leaks between them.

## What is still open

- **26 residual exposures, all on sandbox runs.** A line can carry a timestamp before a
  beat that did not include it. In those runs a beat closed between such a line's arrival
  and its later drop. Only the producer knows which lines a beat judged. The closing fix
  is a per-beat watermark (or judged-id list) emitted by the brain, and it is not built.
  Return: the brain emits its inbox watermark.
- **Holding costs latency.** Lines appear when their beat closes, at a median 2.6 s after
  they arrive. A stretch with no verdicts holds lines longer: 158 of 167k waited over
  30 s. The producer watermark would shorten both.
- **`priority:safety` still reads "purged by the Warden".** Withholding a crisis
  disclosure's text from the canvas is right. Labelling the person as purged is not. That
  label is a live-safety question, so the label was left unchanged and is banked for the
  owner.
- The console's On Air replica draws a withheld line's text struck through. That replica
  is operator-facing and is not broadcast, so it was left unchanged.
