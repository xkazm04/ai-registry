---
layer: golden-path
type: golden-path
subject: data-video-art-direction
status: draft
use_when: [designing the look of a narration-free data video, planning the timing of a race video before rendering, stacking event cards, writing non-revealing titles and thumbnails, designing the ending sequence, turning an accepted chart idea into a frame that feels like a broadcast rather than an infographic, reviewing a still or a render for clutter and legibility, choosing background, palette, chart form, event device and motion cues for a new case, adding real photos or portraits to a data video, planning an image-triage round and briefing prototype makers]
techniques:
  - leader-adaptive-theme
  - case-native-chart-form
  - evidence-card-popup
  - motion-cue-budget
  - legibility-floor
  - photo-rights-ledger
  - photo-to-poster-portrait
  - timing-plan-first
  - event-card-stack
  - curiosity-title-thumbnail
  - top-n-with-logos
  - ending-sequence
  - champion-split-wipe
  - concept-landing-proposals
---

# Data-video art direction

A narration-free data video is judged in the first frame the viewer sees,
and on a phone. A correct chart on a plain dark ground with a tidy callout
reads as **an infographic post**: competent, interchangeable, and easy to
scroll past. What lifts the same data above the competition is not more
decoration. It is a frame that looks like **a moment from a broadcast about
this one story**. Its look comes from the story's own world, real evidence
pops up when the data reacts, and a small number of motion cues prove the
frame is part of a moving picture.

This subject is about **how the frame looks** once an idea has passed the
choosing stage (`data-video-virality`). What a chart may claim belongs to
`evidence-bound-visuals`, and aspect and safe-area adaptation per platform
belong to `platform-format-adaptation`. Both are cited here, not restated.

## The governing fact: every case gets its own world

The strongest single pattern in review is that **a unique theme per case beats
a house theme applied to every case**. A house frame (one ground, one accent,
one card style) is consistent but makes every video look like every other bar
race. A theme drawn from the story's world tells the viewer what they are
watching before they read a label. That world might be a search engine's
palette, a racing team's livery, the flag colours of the year's biggest new
state, a steppe at dusk, smoke and embers for a shooter, or a 1980s fight
poster. The house identity survives in the invariants: the clock position,
the progress bar, the type families, the source line and the safe zones.
The world changes per case.

Three moves did most of the lifting from "infographic" to "broadcast":

1. **A background that follows the current leader** (leader-adaptive-theme).
   The far plane takes the colours or photo world of whoever leads now, and
   it cross-fades when the lead changes, so the lead change becomes the
   motion moment.
2. **Real evidence that pops up** (evidence-card-popup). A dated photo, a
   screenshot, a manuscript or a clipping on a card makes the event beat feel
   like news, not an annotation.
3. **Motion cues, capped** (motion-cue-budget). Digits caught mid-roll, sparks
   at an overtake, a smear behind a newcomer: two at most per frame.

## Principles

- **The chart form follows the story, not the template**
  (case-native-chart-form). Draw a crossing as a line race, collected titles
  as year blocks, territory as a globe, a wave of independence as a flag map
  with a dated log. A form that hides the story's move is wrong however
  pretty it is.
- **The event is shown on the data**: a leader line, a glow on the bar that
  changed, a pulse on the territory, an overtake arrow. The card adds the
  evidence; the data shows the effect.
- **Legibility is a floor, not a goal** (legibility-floor). Story text at
  26 px or more at 1080 wide. Content stays inside the platform's safe box.
  Tilt is 15° or less on anything carrying data, or tilt the background only.
- **One authority per frame.** One hero (the data), one evidence card, one
  title. Anything that competes with the hero gets removed, not shrunk.
- **Photos are evidence, so they are held to evidence rules.** A photo comes
  from the same event, or it is captioned as context. Every photo has a
  licence record and an on-frame credit (photo-rights-ledger).
- **Time is planned from the data, before render** (timing-plan-first).
  Change density per period sets a time warp so on-screen changes per
  second stay roughly even. Flicker is calmed with a labelled smoothed order,
  not with extra time. The plan is saved next to the render.
- **Events get reading time, not data time** (event-card-stack). Each card
  lives about 4 s in frames and carries its date. Overlapping cards pile up,
  newest on top, and each exits on its own clock. The transition varies by
  card type.
- **Ask, don't tell, up front** (curiosity-title-thumbnail). A one-line
  topic title, a question hook and a thumbnail with the players but not the
  answer. The answer lands in the ending (ending-sequence): winner
  spotlight, then like & subscribe, then Powered by StatReel with the Frame
  Stat logo.
- **Show the field** (top-n-with-logos): a top 10 with logged, trademark-
  labelled logos, and a true-scale treatment for a dominant #1.
- **A change of champion flips the frame** (champion-split-wipe): a
  diagonal seam, the outgoing side desaturated, the palette handed over.
- **Real people come from real photographs** (photo-to-poster-portrait). A
  boosted, illustrative portrait is made from a freely licensed photo with
  deterministic filters, never generated. Where no photo exists, use a
  labelled placeholder.

- **Triage four ways, two of them as concepts** (concept-landing-proposals).
  Every case gets two concept/landing seats and two data-chart seats. A
  concept seat bets on one non-obvious metaphor, with per-item artwork drawn
  in code, nested layers, a zoom lens and a headline claim. The data-chart
  seats can still win, especially when change over time is the story.

## Anti-patterns

- **The infographic post:** a flat ground, a generic accent and a tidy card.
  It is correct but forgettable, and it is the round-one baseline that loses.
- **Gamer wallpaper:** light leak + grain + vignette + speed lines + sparks +
  glow on one frame. Each layer is fine; together they bury the data.
- **The decorative HUD:** game-UI grammar (segmented bars, kill feeds,
  reticles) that makes values harder to compare and repeats the ranking.
- **The tilted table:** a 3D tilt over 15° on rows or a map. The far rows
  shrink and the north disappears.
- **The stand-in photo passed off as the event:** a photo from another race,
  city or year captioned as if it were the moment.
- **The trick axis:** broken bars, per-series sparkline scales, rounding that
  exaggerates a gap. Viewers misread them at a glance.
- **Lookalike identities:** two entities sharing a colour because they share
  a category (two nations both blue, two products both red).
- **Confetti geography:** small states at phone size carrying information
  nobody can see.
- **The silent newcomer:** a new entry that appears as a dot or a sliver,
  with no smear, flash or chip to make the arrival felt.
- **The generated likeness:** any model-made image of a real person.
- **Dead bands:** an empty strip between header and chart that pushes the
  hero down for no reason.
- **The spoiler title:** a title, hook or thumbnail that states the outcome
  ("everyone else is scrap"), so the race has no question left.
- **The calendar clock:** constant months per second, so busy years flicker
  and quiet years drag.
- **The blink card:** an evidence card tied to data months that vanishes
  before it can be read, or outlives its month with no date on it.

## Composition order

1. Compute and save the **timing plan** from the data (timing-plan-first),
   and write the one-line topic title and the question hook
   (curiosity-title-thumbnail).
2. Name the case's **world** (team, brand, era, place, genre) and pull a
   4-to-6 colour palette and one background idea from it. Write down which
   entity "owns" each palette (leader-adaptive-theme).
3. Pick the **chart form** that shows the story's move best
   (case-native-chart-form). In triage, run four seats: two concept/landing
   metaphors and two data charts (concept-landing-proposals). Assign one identity colour per entity.
4. Choose the **event device** and its evidence: a photo of the same event
   or a captioned context photo, a date stamp and a headline
   (evidence-card-popup). Log the licence (photo-rights-ledger).
5. Spend the **motion budget**: at most two cues, and say which beat each one
   sells (motion-cue-budget).
6. Lay the frame inside the **safe box** and check the type floor
   (legibility-floor).
7. Queue the events in the **card stack** with lifespans and transitions
   (event-card-stack), and add the **ending sequence** (ending-sequence).
8. Review at phone size and strike anything from the anti-pattern list.
9. Record the case's visual breakdown (palette, background logic, chart
   form, event device, motion cues, typography, what makes it unique) so the
   next case starts from a written precedent, not a memory.

## Failure modes

- **Theme as costume:** the palette is borrowed, but the chart form and
  event device are unchanged, so the frame still reads as a template.
- **Evidence without effect:** a vivid card next to data that shows no
  reaction.
- **Effect without evidence:** sparks and smears with no dated event behind
  them.
- **Over-direction:** each frame tries every tool. The budget exists because
  the urge is constant.
- **Legal debt carried into render:** photos with unknown or share-alike
  licences, brand palettes and logos, real likenesses, found only at publish
  time.
