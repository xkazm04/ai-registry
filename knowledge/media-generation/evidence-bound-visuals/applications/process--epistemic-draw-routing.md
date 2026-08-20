---
layer: application
type: application
subject: evidence-bound-visuals
technique: epistemic-draw-routing
stack: process
status: forged
verified_on: 2026-08-19
---

# Epistemic draw routing in the Gravitone direction pipeline (process)

The Gravitone studio (`C:\Users\mkdol\dolla\gravitone-gcloud`) realizes the
routing as a prompt-pipeline contract: the frames direction prompt declares
the layer split and its rules to the model, the style compiler welds the
no-text constraint into every image call, and the director-dimension
doctrine records why the split exists — the laundering incident that made
it law.

## The split, declared to the model

`pipeline/FRAMES-SCENE-PROMPT.md:33-46` gives the direction model the
layer table verbatim — plate drawn by the image model ("Shape, colour,
atmosphere. **Never text.** Never a checkable number."), elements and texts
drawn by "our vector code", motion authored but rendered by "nobody, yet".
Then the routing rule in the exact form the technique states:

> The split is epistemic. **If a viewer could check it against a fact,
> code draws it.** So a plate never contains a quantity — it contains the
> *shape* of the quantity, and our figure layer states the number, bound to
> the notebook row that sourced it. (`FRAMES-SCENE-PROMPT.md:43-45`)

The plate-subject rules that follow (`:47-60`) are the prompt-side
corollaries: rule 1 "No text, no letters, no numbers, no logos"; rule 2
directs shapes-doing-things over named objects — the prompt records the
measurement behind it: asking for the script's "reservation book" leaked
rendered text "on 6 of 6 styles. Nouns are text magnets. Shapes are not."
(`:25-27`); rule 3 reserves the lower third for the code-drawn captions.

## The constraint welded into the compiler

`lib/stylePrompt.ts:15-19` is where the no-text rule stops being a request.
Finding 3 of the compiler's header:

> THE MODEL DRAWS NO TEXT. Captions, numbers and callouts are our vector
> layer, bound to the notebook's facts — so a plate that contains letters
> is not a nicer plate, it is an unusable one. This is a constraint of the
> architecture, not a preference, which is why it is welded into the
> compiler rather than left to each caller to remember.

`compileStyleBlock` is "the one compiler" — every image call routes through
it, callers cannot opt out of the style half (finding 1, `stylePrompt.ts:6-9`,
which also realizes the restate-in-full law: reference images alone were
measured drifting within a single clip). The same architecture note appears
a third time at `app/_phases/frames/frames.ts:11-15`, so the contract is
stated at the type layer, the prompt layer, and the compile layer.

## Why the split is law: the laundering record

`pipeline/DIRECTOR-DIMENSION.md:341-352` is the doctrine's origin entry. A
low-confidence vendor figure "nearly got laundered" in prose and was caught
by the notebook schema's `confidence` field; the section then observes "**A
picture launders confidence the same way and has no such field**" — a
medium-confidence figure drawn as a crisp bar chart "states more than the
prose is allowed to", and one beat is worse: two on-chain figures the
notebook records as possibly non-comparable, where a shared axis "asserts a
comparison the notebook explicitly refuses". Hence the rule, verbatim:

> **The picture may never be more precise, more certain, or more causal
> than the fact it draws.** Fact confidence propagates to the visual. An
> arrow is a causal claim; an axis is a precision claim.

Routing checkable pixels to code is what makes that propagation
implementable at all: the vector layer draws *from* the notebook rows
(`precision_limit` lives on the material, `DIRECTOR-DIMENSION.md:393,414`),
which a freehand generated chart could never consult.

## Confirmations and upward lessons

- **Confirmed:** the three-layer epistemic split, no-text-in-plates
  enforced at compiler chokepoint + prompt + inspection, text-zone
  reservation, shape-not-number plates.
- **Upward lessons taken into the techniques:** nouns-are-text-magnets
  (measured 6/6) as the subject-language defense; the limit stated once on
  the material rather than per beat; "exceed a precision_limit" listed in
  the doctrine's forbidden moves (`DIRECTOR-DIMENSION.md:575-577`) with
  the observation that it is "the one most likely to be broken innocently,
  because a cleaner chart looks like better work" — now the golden path's
  polish-regression failure mode.
