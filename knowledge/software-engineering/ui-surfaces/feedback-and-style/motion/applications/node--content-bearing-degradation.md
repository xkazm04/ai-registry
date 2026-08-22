---
layer: application
type: application
subject: motion
technique: content-bearing-degradation
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# Node application — projecting the degradation contract into a lint rule

This repo does the thing the technique asks for twice: it writes the
decorative-vs-content-bearing litmus down as a contract, and then it builds
a custom AST rule that runs in CI to enforce part of it. The interesting
half of this application is the word *part* — the gap between what the
contract says and what a static check can actually observe is large, it is
exactly where the incidents happened, and the repo's own artifacts let you
measure it.

## The contract, as written

`src/lib/animations.ts:3-54` is a fifty-line comment block above the motion
presets, headed "Animation Gating Contract". It classifies motion by cost
class first — canvas / frame-loop components (`:7`), GPU-intensive style and
vector components (`:18`), cheap composited effects (`:24`) — and assigns
each class an obligation, of which the canvas class's is the harshest:
"When reduced motion is preferred, return `null` — no canvas, no animation
frame loop" (`:10-11`).

Rule 4 (`:32-48`) then carves out the case this technique is about, and
carves it out *against* the three rules above it: the `return null` in rules
1–2 "applies ONLY to purely decorative ambience (orbs, particles,
background gradients) that carry no information", while components whose
animation "REVEALS CONTENT (typewriter headlines, animated
dashboards/metrics, build-up sequences that end on data the user needs) MUST
render their final/static end-state under reduced motion — never `null`,
never a permanently hidden or 'pending' state. Skip the animation, keep the
payload."

The litmus is stated operationally at `:40-43` — "if a sighted user with
motion enabled eventually reads text/numbers/status from the component, a
reduced-motion user must see that same end-state immediately" — and `:44-48`
names the three components that shipped wrong before the rule existed:
`CinematicBreather` (blank headline), `PulseGridDeck` (empty "idle" deck),
`Persona Matrix` (permanent skeleton), each "shipped by copying rule-1/2
`return null` into a content-bearing component". That sentence is the
clearest statement of the failure mode in the tree: the bug was not
ignorance of the rule, it was **correct application of the wrong rule**.

## The projection: one AST rule, ninety-five lines

`eslint-rules/require-animation-gating.js` is a hand-written rule whose own
header states the ambition: "This converts the documented contract into a
lint-time guarantee" (`:10`). Its mechanism is three visitors and a deferred
report:

- **Two trigger detectors.** A `CallExpression` visitor flags identifiers
  named `requestAnimationFrame` or `cancelAnimationFrame` (`:48-58`); a
  `JSXOpeningElement` visitor flags a literal lowercase `canvas` element
  (`:72-79`). Both push onto a per-file `triggerNodes` list rather than
  reporting immediately.
- **One satisfaction detector, checked two ways.** An `ImportDeclaration`
  visitor sets `hasReducedMotion` when any specifier binds locally to
  `useReducedMotion` or `useReducedMotionPreference` (`:36-45`); the same
  `CallExpression` visitor sets it when either name is *called* (`:60-67`),
  covering hooks obtained without an import.
- **Report at `Program:exit`** (`:82-92`), which is the one genuinely
  necessary piece of design here: file order is not guaranteed to put the
  import before the trigger, so judgment is deferred until the whole file
  has been walked, then every trigger node in an ungated file is reported
  individually.

The diagnostic (`:20-25`) is worth copying: it interpolates which trigger
fired and then cites the contract *by address* — "Per the animation gating
contract in lib/animations.ts…". An author who trips this rule is routed to
the document, where rule 4 is waiting. For a check this coarse, the routing
may be worth more than the assertion.

## What the rule provably cannot see

**Rule 4 — all of it.** The check proves a gate *exists*; it has no way to
observe what the gated branch renders. Every one of the three named
failures would pass it clean: `CinematicBreather`, `PulseGridDeck`, and the
persona matrix all called `useReducedMotion()` — that is precisely how they
got their `return null`. The rule enforces rules 1–2 and is structurally
silent about the clause whose violation produced the incident list. It is
the litmus's *precondition* checker, not the litmus.

**It matches identifiers, not semantics.** A locally renamed import, a
preference read through a differently-named wrapper, or a frame loop reached
via a helper module all evade it, and a canvas painted by a third-party
component rather than a literal `<canvas>` element is invisible to the JSX
visitor. The converse hole is cheaper still: `hasReducedMotion` is set by
the *presence* of the binding (`:36-45`), so importing the hook and never
using its value silences the rule for the entire file.

**It is file-scoped.** `src/components/particle-host/particleHostRegistry.ts`
drives a module-scope frame loop with no component in the file at all; the
gating happens in a wrapper elsewhere. That split is legitimate and the rule
cannot follow it, which is why the file carries a suppression — and why the
suppression is written the right way, as one file-level disable at `:1`
carrying its justification inline: "The React ParticleHost wrapper gates
this registry with useReducedMotionPreference before mounting the canvas or
registering layers." A suppression that names where the real gate lives is
a pointer; a bare disable comment is a hole.

**The quality-tier half of rules 1–2 is unchecked.** The contract requires
`useQualityTier()` and complexity scaling (`:12-16`); nothing in the rule
looks for it.

## Severity: `warn`, and the consequences of that

The rule is registered under its own plugin namespace in
`eslint.config.mjs:36-39` and given severity at `:55`:
`"custom-animation/require-animation-gating": "warn"`. CI runs
`npm run lint` (`.github/workflows/ci.yml:27`), which is bare `eslint`
(`package.json:22`) with no `--max-warnings`, so **the rule cannot fail a
build**. The header's "lint-time guarantee" is, as configured, a lint-time
notification.

This is a choice rather than a limitation: the sibling custom rule
`custom-quality/no-confusable-minus` is `"error"` in the same block
(`:61`), so the repo does escalate rules it trusts. Warn is defensible for a
check with this false-positive surface — identifier matching across a
codebase full of wrapper hooks will flag correct code, and a blocking rule
that flags correct code gets disabled wholesale rather than fixed. But the
consequence should be stated plainly and is the reason this application
exists: the contract's most load-bearing clause is enforced by a human
reading `animations.ts:32-48`, and the clause below it is enforced by a
check that does not block. The realistic upgrade path is `--max-warnings 0`
in CI once the suppression inventory is stable, at which point the
justification-carrying disable comment at `particleHostRegistry.ts:1`
becomes the documented escape rather than an optional courtesy.

## What the humans wrote that no rule could

The contract's actual enforcement is a set of hand-written degraded paths,
one per content-bearing surface, and they are worth reading as a matrix of
the technique's cases:

- **Resolved end state instead of nothing** —
  `src/components/feature-sections/designMatrixShared.tsx:124-131` skips the
  timed build and calls `showFinal()` "so the section carries its full
  content instead of a permanently pending skeleton"; `:152-157` makes the
  *replay* control take the same instant path, "otherwise it would start the
  very animation the user opted out of".
- **The target, never zero** — `src/hooks/useTweenedNumber.ts:39` returns
  `shouldAnimate ? value : target`, and `:21` seeds the state with `target`
  rather than `0`. The count-up hook cannot render a wrong number under
  reduction because the un-animated path never touches the interpolated
  value.
- **A deterministic snapshot for loop-generated content** —
  `PulseGridDeck.tsx:29-33` states the failure it exists to prevent: the
  live deck fills in via an interval "that we intentionally never start
  under reduced motion; without this seed the lanes would sit permanently
  empty/'idle' while the chrome still claimed to be streaming".
  `staticSnapshot()` (`:35-53`) generates the stand-in from index
  arithmetic, so the degraded surface is identical for every reader.
- **The chrome relabels itself** — the same component switches its status
  strip from `"streaming"` to `"snapshot"` (`:117`) *and* its footer from
  `"auto-refreshing"` to `"snapshot"` (`:153`). Both repetitions of the
  liveness claim move together, which is the corollary most
  implementations miss.
- **Freeze on the most explanatory frame** —
  `src/components/feature-sections/plugins/DevToolsGrid.tsx:17-19` sets
  `INITIAL_TICK = 12` rather than 0, with the reasoning written above it:
  "mid-triage — orb resolving a cell, one stale, one still awaiting, the
  rest working. The whole scenario in one image."
- **The stagger is the cost** — `src/components/guide/guide-motion.ts:3-26`
  supplies `STATIC_CONTAINER` / `STATIC_ITEM` variant maps with the same
  variant *names*, so a call site swaps one prop, and quantifies why it
  matters: without it "a reduced-motion reader would otherwise wait ~1.3s
  for the last card of a twelve-item grid to appear".

Six surfaces, six bespoke degraded paths, zero of them derivable from the
AST. That is the honest shape of this projection: the executable check
guards the precondition and routes authors to the document; the document
does the teaching; the payload survives because somebody read it.
