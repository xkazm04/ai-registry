---
layer: application
type: application
subject: image-prompt-composition
technique: two-block-style-and-action
stack: react
status: forged
---

# React/TypeScript: a one-function prompt compiler

The gravitone-gcloud studio (a React/TypeScript video-explainer pipeline)
realizes the two-block contract as a single compiler module,
`lib/stylePrompt.ts` (67 lines), through which every image generation in the
app must pass. The module's header comment records the three findings that
shaped it — each "the kind that only shows up after forty frames rather than
after one" (`lib/stylePrompt.ts:1-19`).

## The style half is a typed object, compiled — never typed per call

`compileStyleBlock(b: StyleBlock)` (`lib/stylePrompt.ts:30-40`) renders the
project's locked style from structured data: technique sentence, subject
vocabulary sentence, palette, finish. The style is data (`StyleBlock` from
`lib/themes`), so a project edits its theme in one place and every
subsequent frame inherits it.

Finding 1 in the header is the law made executable: "THE STYLE BLOCK IS
RESTATED IN FULL, EVERY TIME — even when approved reference images are
attached. Attaching the reference alone was measured letting the look drift
*inside a single clip*. So there is no 'short form' of this function, and
callers cannot opt out of the style half" (`lib/stylePrompt.ts:5-9`). The
API surface enforces it: the only way to get a full prompt is
`compilePrompt(block, subject)`, which takes the style block as a required
first argument.

## Colour roles are a type, not a convention

`ColorRole` is a closed union (`ground | objects | accent`) and the compiler
maps each role to its load-bearing phrase via `ROLE_PHRASE`
(`lib/stylePrompt.ts:23-27`) — the accent renders as "used only on the
single element that carries the point, and nowhere else". Finding 2:
"'navy, cream and cyan' is a palette a model re-casts every frame; 'navy as
ground, cream for objects, cyan only for the accent' is one it can hold"
(`lib/stylePrompt.ts:11-13`). Because the role is part of the palette
entry's type, a caller cannot list colours without assigning them.

## The constraint half is welded on

`compilePrompt` (`lib/stylePrompt.ts:61-63`) assembles exactly the golden
path's order: style block, blank line, trimmed subject, blank line,
`NO_TEXT_CLAUSE`. The clause (`lib/stylePrompt.ts:43-44`) is a module
constant appended unconditionally — finding 3 explains why it lives in the
compiler "rather than left to each caller to remember"
(`lib/stylePrompt.ts:17-19`): the app composites its own vector text layer
bound to sourced facts, "so a plate that contains letters is not a nicer
plate, it is an unusable one."

## Vendor adaptation and budgets, same module

- `NEGATIVE_PROMPT` (`lib/stylePrompt.ts:48-51`) carries the standing
  exclusions for vendors that take a negative parameter; the comment at
  `lib/stylePrompt.ts:46-47` notes the vendor that does not gets the same
  contract "folded into an exclusion clause" by its adapter — the contract
  is vendor-neutral, only delivery differs.
- The doc comment on `compilePrompt` (`lib/stylePrompt.ts:55-60`) states
  the ordering rationale: models with short attention windows "see roughly
  the first 77 tokens and silently drop the rest, so the half that must
  survive truncation goes first."
- `PROMPT_CHAR_LIMIT = 1500` (`lib/stylePrompt.ts:65-67`) exposes the
  vendor's hard ceiling "so the UI can warn before the call rather than
  surfacing a vendor 400" — the budget enforced at authoring time.

## What transfers

The pattern is one file: a required-argument compiler, a closed role union,
an unconditional constraint constant, and exported budget constants. Any
React (or plain TypeScript) generation pipeline can adopt it verbatim; the
discipline is not the strings but the fact that no call site can assemble a
prompt without going through the function that restates the whole contract.
