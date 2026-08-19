---
layer: golden-path
type: golden-path
subject: evidence-bound-visuals
status: forged
use_when: [directing visuals for a factual script, building a frame or chart compositor, reviewing generated frames for overclaim, deciding what a model may draw vs code]
techniques:
  - figure-must-cite-a-fact
  - precision-limit-propagation
  - causal-arrow-discipline
  - epistemic-draw-routing
  - generous-strawman-rendering
---

# Evidence-bound visuals

A picture in a factual piece is not decoration on top of the argument — it is
part of the argument, and it makes claims with a grammar of its own. An axis
with fine ticks claims precision. An arrow claims causation. Two series on a
shared scale claim comparability. A number on screen claims that somebody
checked it. The subject of this document is keeping those claims honest:
making sure no rendered element asserts more than the sourced fact behind it
supports, and routing every element that *could* be checked to a drawing
process that can be held accountable.

The naive reading is that visuals merely "illustrate" the script, so the
epistemic work was finished when the prose was fact-checked. That reading
fails at the exact moment the work starts looking good. Text pipelines carry
confidence fields; a rendered picture has no such field. When a
medium-confidence figure from a single aggregator is drawn as a crisp bar
chart with labeled ticks, the chart states more than the prose was allowed
to — and the audience, correctly, reads the chart as the stronger claim.
This is the **laundering problem**: confidence limits attached to the fact
are stripped in the render, and the picture emerges asserting certainty
nobody vouched for.

## The laundering problem, precisely

Laundering is not fabrication. Every number in the laundered chart is
"real"; what got lost is the *grade* of each number. The prose said
"roughly", "one source suggests", "these two figures may not be comparable";
the picture says none of that, because pictures have no hedging vocabulary
unless you deliberately give them one. Three escalating forms:

1. **Precision laundering.** A fact known to within a wide band is drawn
   with a fine axis and an exact label. The uncertainty existed in the
   research notes; the render deleted it.
2. **Certainty laundering.** A low-confidence or single-source claim is
   drawn with the same visual authority as a high-confidence one. The viewer
   cannot tell them apart, so both inherit the confidence of the strongest
   element on screen.
3. **Relation laundering** — the worst, because it invents a claim rather
   than sharpening one. Two figures the research explicitly refuses to
   compare are placed on one axis; the shared scale *asserts the comparison*.
   A sequence of events gets an arrow; the arrow asserts the causation the
   prose was careful to phrase as "moves with, not because of".

The defining property of all three: **the violation looks like better
work.** A cleaner chart, a sharper axis, a confident arrow — each reads as
craft. This is why the discipline cannot live in taste or review vigilance
alone; the most likely person to break it is the most conscientious one,
polishing. It has to live in structure: fields that carry the limits, gates
that refuse renders that exceed them.

## Two moves make the discipline enforceable

**First: every checkable element traces to a fact.** A figure on screen —
a number, a dated label, a plotted value — must carry a reference to the
sourced fact it asserts, and the reference must resolve against the actual
research corpus, not against the model's memory of it. A figure with no fact
behind it is not an unchecked figure; it is an unchecked figure *presented
as a checked one*, which is worse than omitting it. This is the
[figure-must-cite-a-fact](techniques/figure-must-cite-a-fact.md) gate, and
it must be enforced by a validator that rejects, not requested of a
generator that forgets.

**Second: the fact's grade caps the rendering.** Tracing alone is not
enough — a correctly cited fact can still be over-drawn. So the limits ride
with the fact: a confidence grade, and where sources disagree or precision
is bounded, an explicit statement of *how* the material may be drawn ("as a
proportion, no fine axis, no current-value label"). Rendering decisions
consult those limits mechanically. This is
[precision-limit-propagation](techniques/precision-limit-propagation.md),
and its most consequential special case —
[causal-arrow-discipline](techniques/causal-arrow-discipline.md) — governs
the single most claim-dense mark in the vocabulary: the arrow.

## Routing: who is allowed to draw what

Generative image models are superb at atmosphere and hopeless at
accountability. They render letterforms unreliably, they invent digits, and
nothing they produce can be traced back to a source. So the composed frame
is split into layers along an **epistemic** boundary, not a stylistic one:

> If a viewer could check an element against a fact, deterministic code
> draws it. If it only has to feel right, a model may draw it.

The generated plate carries shape, color, and mood — the *shape* of a
quantity, never the quantity. Vector code, driven by the fact records
themselves, draws every axis, bar, arrow, label, and number on top. The
model is explicitly forbidden to render text, and a plate that comes back
carrying letters is discarded — not because the letters are ugly, but
because a generated glyph is an unaccountable one. The full routing
procedure is [epistemic-draw-routing](techniques/epistemic-draw-routing.md);
the [checkability-routes-the-pixel](../_laws.md#checkability-routes-the-pixel)
law is its one-sentence form.

This split is what makes the first two moves *possible*. You cannot bind a
figure to a fact record if the figure was hallucinated into the pixels of an
illustration; you cannot propagate a precision limit into a chart the model
composed freehand. Routing is the load-bearing wall; traceability and
propagation are what it exists to hold up.

## The reversal hazard: honest frames for positions you will refute

Factual narrative structures routinely state a position in order to reverse
it — the obvious reading, built generously, then turned. This creates a
visual problem prose does not have: the frame drawn for the "obvious
reading" beat is a picture asserting a position the piece goes on to refute,
and frames travel alone — screenshotted, thumbnailed, paused on. The
temptation is to protect yourself by drawing the position weakly, which
ruins the narrative (a reversal of a strawman lands as nothing) and is its
own dishonesty. The discipline —
[generous-strawman-rendering](techniques/generous-strawman-rendering.md) —
is to render the case at full evidential strength while withholding
*conclusion-grade* marks: real figures, real shapes, but no settling arrow,
no verdict iconography, and a composition the reversal frame can visibly
revise rather than merely contradict.

## What this subject is not

- It is not a fact-checking process for the script. The research corpus is
  assumed to exist upstream, with sources and confidence grades already
  attached. This subject governs what happens *between* that corpus and the
  screen.
- It is not visual style. Style decides how things look; this decides what
  things are allowed to *say*. The two are orthogonal, and conflating them
  is how "make it cleaner" quietly becomes "make it claim more".
- It is not a prohibition on generated imagery. Most of the screen, most of
  the time, is legitimately the model's — atmosphere, objects, metaphor.
  The discipline concerns the minority of pixels a viewer could check, and
  insists only that those pixels have an answerable chain of custody.

## Failure modes this standard exists to prevent

- **The laundered chart** — a hedged fact drawn crisp; the render asserts
  what the research declined to.
- **The invented comparison** — a shared axis or overlaid pair asserting
  comparability the sources refuse.
- **The confident arrow** — sequence or correlation drawn as causation
  because arrows are the default connective mark.
- **The unowned number** — a figure on screen with no fact record behind
  it, indistinguishable from the owned ones and thereby devaluing all of
  them.
- **The lettered plate** — model-drawn text accepted because it happened to
  look right, breaking the accountability boundary silently.
- **The cardboard strawman** — the to-be-reversed position drawn feebly, so
  the reversal refutes nothing and the piece argues instead of thinks.
- **The polish regression** — a later pass "improving" a deliberately
  imprecise drawing into a precise one, because nobody recorded *why* it
  was imprecise.

## The techniques

- [figure-must-cite-a-fact](techniques/figure-must-cite-a-fact.md) — every
  checkable element on screen binds to a fact record, enforced by a
  rejecting validator.
- [precision-limit-propagation](techniques/precision-limit-propagation.md) —
  confidence and precision limits ride with the material and cap every
  rendering of it.
- [causal-arrow-discipline](techniques/causal-arrow-discipline.md) — arrows
  and connective marks reserved for sourced causation; sequence and
  correlation get weaker grammar.
- [epistemic-draw-routing](techniques/epistemic-draw-routing.md) — the
  plate/vector split: checkable elements to deterministic code, atmosphere
  to the model, text never generated.
- [generous-strawman-rendering](techniques/generous-strawman-rendering.md) —
  full-strength evidence for positions the piece will reverse, minus
  conclusion-grade marks.
