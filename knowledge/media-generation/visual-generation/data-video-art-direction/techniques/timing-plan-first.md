---
layer: technique
type: technique
subject: data-video-art-direction
technique: timing-plan-first
status: draft
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [starting any data-video render, deciding how fast a timeline runs, fixing flicker or dead stretches in a race chart, planning a Short and a long-form cut from the same data]
---

# Timing plan first

A constant "months per second" clock makes busy periods flicker and quiet
periods drag. The viewer feels the **rate of change**, not the calendar. So
every render starts with a **timing plan** computed from the data, saved
next to the render before any frame is drawn.

## Procedure

1. **Score change density per period** from the data the viewer will see:
   weighted rank swaps in the visible rows (top rows weigh more), entries
   and exits, and visible value motion (Σ|Δ| / axis max), plus a small base
   so quiet periods still move.
2. **Derive a time warp:** frames per period ∝ score, clamped (e.g. 1–10
   frames per month), Gaussian-smoothed so the speed never jumps, then
   renormalised to the timeline budget.
3. **Add event dwell:** a Gaussian bump of extra frames around each story
   event, so the event's month slows down.
4. **Calm the ordering, labelled:** order rows by a short moving average
   (3 months) plus a small overtaking margin (hysteresis). Keep the bar
   values raw and say so on screen ("ORDER: 3-MO AVG"). The plan's score
   uses the same order the viewer sees.
5. **Save the plan** as JSON (knots frame → period, per-period frames,
   events with frame and time, orders) and a short markdown note. Include
   the per-year table, the evenness metric, and the long-form note (the same
   curve ×3 for a 1–3 min cut).
6. The composition **reads the plan**. It never hard-codes keyframes.

## Decision rules

- Report evenness as the coefficient of variation of changes per second,
  uniform vs warped (excluding dwell). The search case went from 0.54 to
  0.21; aim for a 50 % cut or better.
- Dwell is for events, not for ranking churn. If a stretch is unreadable,
  fix the ordering (smoothing or hysteresis) before adding time.
- A Short runs a ~27 s timeline. A long cut uses the same plan ×3 and lifts
  the per-period minimum.
- Overlays (cards, chips) take their lifespans in **frames**, not data
  periods (event-card-stack).

## When not to use it

- **Single-moment explainers** with no timeline.
- **Data with no meaningful order changes** (one series). There, use an even
  clock with event dwell only.
