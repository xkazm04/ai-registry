---
layer: technique
type: technique
subject: evidence-bound-visuals
technique: precision-limit-propagation
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [drawing charts or comparisons from researched facts, designing the fact-record schema, reviewing a frame that looks suspiciously clean]
---

# Precision limit propagation

A fact record carries not just a value but a *grade* — how confident, how
precise, sourced from where, disputed by whom. This technique makes that
grade travel all the way into the drawing: the render of a fact may never be
sharper, surer, or more comparable than the record says. Prose does this
naturally with hedging words; pictures have no hedging words unless you
build them, so the propagation must be mechanical or it will not happen.

## Where the grade lives: on the material, once

The limit is stated **next to the fact or the source material, one time**,
not re-derived per scene. A price series whose sources disagree by a few
percent gets, on the record itself, a rendering constraint in plain
language: "draw as a proportion of the peak — no current-value label, no
fine axis." Every scene that draws from that series inherits the constraint
through the citation established by
[figure-must-cite-a-fact](./figure-must-cite-a-fact.md). Stating it per beat
instead guarantees drift: the third scene to use the series will be directed
by someone (or some model call) who never saw the first scene's caveat.

Two fields do the work:

- **confidence** — an ordinal grade on the fact. It caps *certainty*
  rendering: what visual authority the element may carry.
- **precision limit** — a free-text rendering constraint on the material.
  It caps *precision* rendering: axis fineness, labeling exactness,
  whether a single figure or a band is drawable. Free text on purpose —
  the honest constraint is usually specific ("draw the band, never the
  midpoint"), and an enum flattens exactly the nuance the field carries.

## The propagation table

The vocabulary is small enough to state as rules:

- **High-confidence, dated, precise fact** → full grammar: exact figure,
  labeled axis, fine ticks.
- **Medium confidence or disagreeing sources** → shapes and proportions,
  not values: draw the ratio, the band, the trend — no exact label, no
  tick marks fine enough to read a value off. A band drawn where sources
  span a range is *more* informative than a false midpoint, not less.
- **Two facts whose comparability is itself uncertain** → never a shared
  axis. A shared scale is an assertion of comparability; if the research
  records the figures as possibly non-comparable, side-by-side on one axis
  asserts what the research explicitly refuses. Show them apart, or show
  the *question* of their relation.
- **Correlation or sequence without sourced causation** → no arrow from
  one to the other; see
  [causal-arrow-discipline](./causal-arrow-discipline.md).
- **A claim about something that does not exist** (an unbuilt program, an
  unfilled reserve) → the absence is the depictable object. Rendering a
  plausible image of the thing asserts existence; render the gap, the
  disagreement, the empty frame.

## The innocent violation

The rule most likely to be broken is broken by diligence, not laziness: a
cleaner chart looks like better work. A director tightening a frame, a
polish pass "fixing" a fuzzy axis, a reviewer asking why the bar has no
number on it — each pushes toward precision the fact does not have, and
each feels like quality. Three defenses, in order of strength:

1. **Record the reason with the limit.** "No fine y-axis — sources
   disagree by ~5%" survives a polish pass; an unexplained soft axis reads
   as sloppiness and gets fixed. An undocumented deliberate imprecision has
   a half-life of one review cycle.
2. **Make exceeding a limit an escalation, not an edit.** A downstream
   pass that believes a limit is wrong sends the question back to the
   research layer, which can re-grade the fact with new sourcing. What it
   may never do is out-draw the limit locally — that is the laundering
   move exactly, performed with good intentions.
3. **Review for overclaim as its own pass.** Fact-accuracy review checks
   whether the values are right; overclaim review checks whether the
   *grammar* is right — every axis, label, and paired series audited
   against the grades behind it. They find different defects, and the
   second is the one no general "does it look good" review performs.

## When not to use it

Do not propagate limits into elements that assert nothing — atmosphere,
metaphor, texture. Graded hedging applied to a mood shot produces mush and
trains people to ignore the real limits. And resist inventing precision
*downward* as false modesty: a fact the corpus grades high and exact should
be drawn exact. Under-claiming is a milder sin than laundering, but it is
the same sin — the render no longer states what the evidence supports.
