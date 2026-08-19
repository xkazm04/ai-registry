---
layer: technique
type: technique
subject: evidence-bound-visuals
technique: epistemic-draw-routing
status: forged
laws: [checkability-routes-the-pixel, output-never-outruns-evidence, style-is-restated-not-remembered]
shared_with: []
use_when: [architecting a frame compositor, writing image-generation prompts for factual work, deciding whether an element is generated or drawn]
---

# Epistemic draw routing

A composed frame in factual work is not one image; it is layers with
different owners, split along one question: **could a viewer check this
element against a fact?** If yes, deterministic code draws it from the fact
records. If it only has to feel right, a generative model may draw it. The
split is epistemic, not stylistic — it exists so that every checkable pixel
has a chain of custody, and it is the precondition for every other
technique in this subject: you cannot bind a figure to a fact, or propagate
a precision limit, into pixels a model composed freehand.

## The canonical layering

- **Plate** — the generated illustration: shape, color, atmosphere,
  objects, metaphor. The model's layer, and most of the screen.
- **Elements** — vector marks: arrows, bars, brackets, rules, loops,
  markers. Geometry that means something, drawn by code, positioned in
  relative coordinates so it stays crisp at any output size.
- **Texts** — the words: kickers, captions, labels, figures. Drawn by
  code, bound to fact records per
  [figure-must-cite-a-fact](figure-must-cite-a-fact.md).

The routing rule per element is mechanical once the question is asked. A
chart's *bars* are checkable (their ratio is a claim) — vector. The
weathered texture behind them — plate. A quantity's *shape* ("two stacks,
the left twice the height of the right") may be in the plate, because a
rough proportion is the kind of claim illustration legitimately carries;
the *number* stating it is text-layer, cited. When in doubt, ask what a
motivated skeptic could screenshot and dispute: that pixel routes to code.

## Text is never generated — a hard rule, welded in

The model draws no letters, no digits, no logos. Not because generated
lettering is ugly (models have gotten better at it) but because a generated
glyph is an **unaccountable** one: it cannot cite a fact, it can silently
diverge from the corpus, and it forks the text population into owned and
unowned members that the viewer cannot tell apart. A plate that comes back
carrying text is not a nicer plate — it is an unusable one, rejected
whole.

Enforce this at three points, because each alone leaks:

1. **In the prompt compiler** — the no-text constraint is emitted by the
   one function that compiles every image prompt, so no caller can forget
   it. A constraint of the architecture must not depend on each call site
   remembering it.
2. **In the subject language** — nouns are text magnets: ask for a
   "ledger" or a "signpost" and the model writes on it (measured leaking
   on every style tested when named objects were requested). Direct
   plates as *shapes doing things*, not objects with names: "two stacks of
   discs, the right one toppling" survives; the named ledger does not.
3. **In inspection** — plates are checked for rendered text before
   compositing, and a lettered plate is regenerated or the composition
   revised. Prompt-side prevention raises the pass rate; inspection is the
   guarantee.

## Prompt-side corollaries

- **Reserve the text zone.** The composition must leave room where the
  code-drawn captions land (conventionally a clear lower band), and the
  plate prompt says so explicitly. Otherwise the layers fight and the
  accountable layer loses legibility to the decorative one.
- **The plate never contains a checkable quantity.** It contains the
  *shape* of the quantity; the figure layer states the number. A generated
  chart — axes and all — is the routing failure in its most tempting form,
  because it looks exactly like the diligent thing to ask for.
- **Style is fully restated on every plate call** so that the split does
  not drift visually: code-drawn layers are deterministic and consistent
  by nature; the plate must be held consistent by contract, or the
  composite reads as two artworks glued together.

## Decision rules

- When an element is borderline (a map, a flag, a recognizable building —
  checkable in kind but illustrative in role), route by *stake*: if the
  beat's argument depends on its accuracy, code or sourced imagery; if it
  is scenery, the model may draw it and the piece must not lean on it.
- When the deterministic layer cannot yet draw something (a mark kind the
  vector kit lacks), the answer is to extend the kit or change the
  composition — never to let the model draw it "just this once". Routing
  exceptions are invisible in the output, which is what makes them
  permanent.
- When a hybrid is genuinely needed (generated texture inside a bar
  chart), generate the texture as a fill *clipped by code-drawn geometry* —
  the model paints inside shapes whose extents the fact records set.

## When not to use it

Work with no factual surface — pure mood pieces, title cards, abstract
interludes — has nothing to route; imposing the layering there is
ceremony. And in rapid ideation, sketch however is fastest; the routing
contract binds the *published* frame. The one part that stays on even in
exploration is no-text-in-plates, because exploratory lettered plates have
a way of surviving into the final cut unaudited.
