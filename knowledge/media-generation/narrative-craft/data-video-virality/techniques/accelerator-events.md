---
layer: technique
type: technique
subject: data-video-virality
technique: accelerator-events
status: draft
laws: [causality-over-sequence, output-never-outruns-evidence]
shared_with: []
use_when: [designing the on-screen annotation layer of a narration-free data video, scoring whether an idea can teach without narration, writing beats for a ranked race or map evolution]
---

# Accelerator events

Without narration, a sudden move on screen is either a puzzle or a
lesson. Accelerator events turn it into a lesson: dated real-world events
(a launch, a merger, a war, a rule change, a crash, a scandal, a release)
that pop up exactly when the data reacts to them. They are the
educational layer of the format and the reason a viewer learns something
rather than just watching bars move.

## Procedure

1. **List 5 to 15 dated events per case**, each with three parts: the
   date (to the month where possible), what happened in a few words, and
   the expected on-screen effect ("Iraq and Kuwait's bars vanish", "lead
   change", "every bar drops by a third").
2. **Keep most events inside the animated span.** Background events
   before the start can be shown in an intro card, but at least five should
   fire while the data is moving.
3. **Spread them out.** Events bunched in one stretch leave long silent
   stretches. Aim to have events across most of the span.
4. **Tie each event to a visible effect.** An event with no visible
   reaction is trivia. Drop it, or replace it with the event that actually
   explains the move.
5. **Design the pop-up creatively and consistently.** Callout boxes,
   markers on the time axis, a brief freeze-frame or slow-down at the
   biggest moves, merge animations when two bars combine, a flash when a
   record line moves. Keep one visual grammar per series so viewers learn
   it.
6. **Check the dates against a source** before the build. A wrong date
   on screen is worse than no callout.

## Decision rules

- Fewer than five events with effects means the idea can't teach without
  narration. Fail it or redirect it.
- More than about fifteen turns the video into a caption reel. Keep the
  events that explain the largest moves.
- Speculative milestones after "now" (projected overtakes) are allowed
  only when labelled as projected.
- Events explain moves; they never assert causes the data doesn't show.
  "Oil embargo" next to a price spike is fine. "This caused the
  recession" is narration, and it needs evidence.

## When not to use it

- **Pure-ambient or loop content** meant to play without attention.
- **Very short clips** (under about 20 seconds), where more than two or
  three callouts can't be read.
