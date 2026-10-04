---
layer: technique
type: technique
subject: data-video-virality
technique: continuity-gate
status: draft
laws: [causality-over-sequence, unmeasured-is-not-pass]
shared_with: []
use_when: [triaging data-video ideas for a narration-free format, deciding whether a dataset can carry one to three minutes of motion, rejecting record ladders and winners lists that test well on topic alone]
---

# Continuity gate

A narration-free chart video holds attention only while the screen keeps
changing in ways the viewer can follow: bars overtaking, lines crossing,
borders moving, a leader collapsing. That needs **many real data steps**
and **many entities moving against each other**. A famous topic with
coarse data turns into a slideshow: one jump a year, then a pause, then
another jump. A single record holder replaced every few years turns into a
list. The continuity gate checks the data's shape before anyone scores the
topic.

## Procedure

1. **Count the real steps.** Take the span and the granularity of the
   series you can actually get (daily, weekly, monthly, quarterly, per
   race, per match, per dated event, yearly). Real steps means observed
   values, not interpolated frames.
2. **Apply the step floor.** For sub-annual or per-event data, require
   about 60 or more real steps. For yearly data, require a long series
   (about 100 or more years) and at least ten entities, so the
   interpolation between years has many simultaneous moves to show. Data
   by decade, or a few decades of yearly points, fails.
3. **Require a cast.** At least five entities on screen at once (bars,
   lines, countries, flags). A single line is a chart, not a race.
4. **Estimate the path.** Count the lead changes you expect at the top,
   and the visible overtakes or sharp moves elsewhere. Require at least two
   lead changes and roughly fifteen visible movements over the runtime. If
   the leader never changes, look for a ranking where it does (the
   chasers, the second tier, a per-capita view) or drop the idea.
5. **Classify the format** and refuse the shapes that cannot pass
   whatever the data: single-value ladders (the tallest, the biggest, the
   oldest, one at a time), record lists, winners of every year,
   single-season stories, documentary human stories, monotone fill-ins
   where things only switch on, and conclusion-only reveals.
6. **Redirect before rejecting.** Many failing ideas pass once reframed:
   "number one song each year" becomes "top 20 songs each month"; "who
   held the record" becomes "top 10 by cumulative total, event by event";
   "one flag changing" becomes "every flag on a map, splitting and
   merging".

## Decision rules

- Granularity is checked against the data you can obtain, not the data
  that should exist. If monthly data is behind a paywall you won't buy,
  score the yearly version.
- Interpolating between yearly points is honest only when many entities
  move at once. Smoothing one line between yearly points invents motion.
- A cumulative race is continuous even when its events are discrete,
  because every event moves a bar (goals per match, launches per launch,
  medals per competition day).
- Estimates of lead changes and movements are recorded with the case, so
  they can be checked against the finished render.

## When not to use it

- **Explainer formats with narration.** A narrated piece can carry a
  single line or a one-off record, because the voice supplies the path.
- **Still or carousel formats.** A single striking comparison image
  doesn't need motion.
