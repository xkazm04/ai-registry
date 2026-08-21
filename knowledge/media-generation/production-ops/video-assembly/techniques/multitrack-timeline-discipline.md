---
layer: technique
type: technique
subject: video-assembly
technique: multitrack-timeline-discipline
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [laying out or reviewing a multitrack cut, designing a timeline surface for a media pipeline, diagnosing an assembly whose numbers and picture disagree]
---

# Multitrack timeline discipline

A timeline earns trust by being literal: one shared clock, one lane per
medium, every block drawn at its true start and true length, and every
number on the surface computed from the same data the blocks are drawn
from. The technique is the set of rules that keep a timeline a **document
of record** instead of a diagram *about* the cut.

## One clock, one authority

Everything on the surface derives from a single time authority — the
project's total duration and the per-clip starts and lengths. The ruler is
drawn from it; block positions and widths are percentages of it; coverage
sentences and totals are reductions over it. The moment any element gets
its position or its caption from a second source — a hand-typed duration, a
remembered timestamp, a sentence written to match today's data — the surface
can disagree with itself, and a surface that can disagree with itself will.
The audit is mechanical: for every visible number and every drawn edge, name
the expression that produced it. Anything with no expression is copy, and
copy on a timeline is a defect.

## Lane grammar

- **One lane per medium**, stable order, labeled at the head of each lane.
  For factual video the canonical stack is picture, voice, music — the
  reading order matches the priority order (picture structures, voice
  argues, music supports). Effects and atmosphere, when present, get their
  own lanes below music rather than squatting in it.
- **Blocks are to scale.** A six-second clip is drawn at six seconds' width.
  Equal-width blocks for unequal clips is the single fastest way to make a
  timeline decorative — durations are the primary fact a timeline exists to
  show.
- **State is drawn in the lane, on the block.** Placed, drifting, missing:
  each visual state distinguishable at a glance, with a legend that names
  them. A block's tooltip or caption carries its computed times, not typed
  ones.
- **Cross-lane structure lives between the lanes.** Markers that all lanes
  share — act turns, chapter starts — are drawn once, spanning the lanes,
  from the same clock. Duplicating a marker per lane invites the copies to
  disagree.

## The literalism rules

1. **Draw only what exists; draw everything that should.** Every planned
   slot appears — filled if material backs it, explicitly empty-styled if
   not. Omitting the empty slots makes the cut look further along than it
   is, which is the timeline form of output outrunning evidence.
2. **Same fact, same pixels.** When a control edits a value (an offset, a
   trim), the block the user watches must move from that same value. A
   bench whose counter changes while the picture holds still is describing
   an edit, not making one — the reader cannot tell wired from painted, so
   the whole surface's credibility is spent.
3. **Status is re-derived, never stored stale.** A clip flagged as drifting
   whose offset has been zeroed is no longer drifting; the flag follows the
   measurement on every render.
4. **Totals reconcile.** The lane contents, the coverage line, and the
   project duration must sum. A reconciliation that fails is a data bug
   surfaced honestly; a reconciliation never computed is a data bug hidden.

## Decision rules

- When a caption or summary sentence would repeat information the blocks
  already show, compute it from the same arrays that drew the blocks, never
  from prose, because the two will diverge on the first data edit.
- When a value can be edited in two places, make one the writer and the
  other a view of it, because dual writers on a timeline produce silent
  disagreement about where a clip actually is.
- When a lane would hold two media "to save space", split it, because
  overlap in a shared lane is ambiguous between a mix decision and a
  collision.
- When the project's total length changes, let every percentage-positioned
  element reflow from the clock; anything that fails to move was absolutely
  positioned against the old truth and is now lying.

## When not to use this

Full literalism is for surfaces that people make decisions against. A
pitch-stage storyboard strip or a marketing mock is allowed to be
illustrative — but label it as such, and never let an illustrative strip
share a screen with the working timeline, because readers will assign it
the working surface's authority. And the discipline does not require a
timeline UI at all: a cue sheet as a table obeys the same rules (computed
times, drawn gaps, one authority) with no ruler in sight.
