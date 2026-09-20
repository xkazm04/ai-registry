---
layer: application
type: application
subject: motion
technique: reduced-motion-mechanics
stack: react
verified_on: 2026-08-28
applied: experiment
ab_verdict: better
proof: ab-paired
---

# React application — reduced motion under server rendering

The technique states that a reduction mechanism reaches only the engine it
lives in, and that the preference is live: *"subscribe, and where the
platform's own reader does not subscribe, wrap it and forbid the raw one."*
Server rendering adds a second axis the technique does not name, and it has a
worse failure mode than a missed engine. Evidence below is from `personas-web`
(Next.js 16 App Router, React 19, framer-motion), scanned 2026-08-28.

## The reader is wrong on the server, not just stale

framer-motion's `useReducedMotion` is, in full:

```js
!hasReducedMotionListener.current && initPrefersReducedMotion();
const [shouldReduceMotion] = useState(prefersReducedMotion.current);
```

Two properties follow, and only the first is the one teams look for.

- **It never subscribes.** `useState` samples once; the source carries a
  standing `TODO` about whether anyone misses live updates. This is exactly the
  sample-once reader the technique says to wrap.
- **It answers wrong on the server.** `motion-dom`'s state module initialises
  `prefersReducedMotion = { current: null }` with the comment *"Returns `null`
  server-side"*, and `initPrefersReducedMotion` early-returns when `!isBrowser`.
  So the server always answers "motion is fine", while the client's first render
  — before `useState` samples — has already run `matchMedia` synchronously and
  answers with the truth.

A sample-once reader degrades gracefully: the user gets the accommodation on
the next reload. A reader that disagrees across the render boundary does not
degrade at all — it produces a **hydration mismatch**, and the recovery is the
expensive one.

## Branching markup on the preference inverts the accommodation

When the value decides *element shape* rather than animation values, the server
emits one tree and the client's first render produces another. React discards
the subtree and re-renders it on the client. The cost lands on precisely the
visitors who asked for less work:

> "the most work possible for precisely the visitors who asked for less"
> — the wrapper's own header comment, written after the bug shipped

The canonical shapes are `if (reduced) return null` and returning children
unwrapped instead of wrapped. In the scanned repo, 133 files read the
preference; 17 branched on shape; 4 of those server-rendered, and one of the
four wrapped **every route in the application**:

```tsx
// before — server emits the wrapper, a reduced-motion client's first render does not
if (prefersReducedMotion) return <>{children}</>;
return <motion.div key={pathname} variants={pageTransition} …>{children}</motion.div>;
```

Note the exemption that keeps the rule honest: a component rendered only behind
a client-only dynamic import or a viewport-gated mount never server-renders, so
shape-branching there is safe. The repo had independently reasoned this out in
one file's comment — *"This deck is mounted with `ssr: false` … so branching on
`reduced` during render cannot desync hydration"* — which is a good sign the
rule is discoverable, and a bad sign that it lived in one comment.

## The wrapper, made concrete

`useSyncExternalStore` is the right primitive, because React deliberately uses
`getServerSnapshot` for the **hydrating** render too. The first client paint
therefore agrees with the server by construction, and the true preference
arrives on the next commit:

```ts
const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb) => { const m = matchMedia(QUERY); m.addEventListener("change", cb);
                            return () => m.removeEventListener("change", cb); };
const getSnapshot = () => matchMedia(QUERY).matches;
const getServerSnapshot = () => false;   // guess "motion", then correct
export const useStillMotion = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

`getServerSnapshot` returning `false` is a deliberate asymmetry worth stating:
guessing "reduced" would ship a still page to every visitor for one frame,
which is a worse default than one corrected commit for some.

This single wrapper fixes both defects — SSR agreement *and* liveness — which
is why "wrap it and forbid the raw one" is the whole prescription rather than
half of it.

## Two placement rules that decide whether the fix holds

**Gate the props, not the element.** Once the reader is SSR-safe the mismatch
is gone, but a shape branch still costs a reflow on the correcting commit. Keep
DOM shape constant and vary `animate`/`variants`/`transition`, so the
accommodation costs a stopped animation instead of a re-layout. This is the
technique's "prefer gating an `animate` prop over dropping an element", and
under SSR it is what turns a full-page reflow into nothing visible.

**Build the merged pause signal on the wrapper.** Where a product implements
loop-pause-governance's merged signal, that coordinator reads the preference on
behalf of every consumer — so if *it* uses the raw hook, every downstream loop
inherits the SSR defect no matter how disciplined the call sites are. One edit
inside the coordinator fixed four deciders' worth of consumers in the scanned
repo. The corollary for auditors: check the coordinator's reader first; it is
the highest-leverage line in the system.

## The accidental shield, and why it needs writing down

The same repo's authenticated dashboard renders locale- and clock-dependent
values during render — the shape that mismatches — and does not break, because
an auth gate renders a skeleton until a client-only effect resolves. Server and
client agree on the skeleton, and the divergent content only ever mounts
post-hydration.

That is a real shield and it is entirely undocumented, which makes it a
liability of a specific kind: **a load-bearing invariant nobody named.** A
future change that resolves auth on the server, or removes the loading state,
silently reintroduces a whole bug class with no failing test and no reviewer
prompt. When an audit finds structural safety that no one designed, the
finding is not "this area is fine" — it is "this area is fine for a reason that
must be recorded before someone optimises it away."

## Enforcement

A lint rule that requires "a reduced-motion gate" must accept the wrapper and
the merged signal, or it fights the fix — the scanned repo's rule matched the
raw hook's identifier by name and began flagging files the moment they were
migrated to the safer reader. Keep the accepted-gate list in one named set, and
prefer the wrapper in the rule's message so the rule teaches the hierarchy
rather than merely permitting it.

## The snapshot-transition layer: `<ViewTransition>` under a universal reset

*Section added 2026-09-15; its citations were resolved that day. The sections above were not re-checked, so this document's verified_on stays at their date.*

*Witness for the version: `react@19.3.0` and `react-dom@19.3.0` as installed from
npm on 2026-09-15 (`package.json` of the installed packages; `ViewTransition` is
exported as a component symbol and `browser` from `react-dom` as a function). The
consuming tree, `personas-web` at `4445215`, pins `react ^19.2.8`, so the
experiment runs its CSS against the release the tree will upgrade to, not the one
it ships today.*

React 19.3 (announced 2026-09-09) promoted `<ViewTransition>` to stable. It wraps
the browser View Transitions API. React calls `document.startViewTransition`
itself, and its reference documentation says three things that matter to the
technique's "every reduction mechanism is engine-scoped" section:

- *"React doesn't automatically disable animations for this case"*, and it
  recommends a `@media (prefers-reduced-motion)` query.
- *"you should never"* call `startViewTransition` yourself, and *"if you have
  something else on the page running a ViewTransition React will interrupt it."*
- Only updates in a Transition, a `<Suspense>` reveal or `useDeferredValue`
  activate it. A `flushSync` in the middle skips it.

### The experiment

A 30-line React 19.3 app, bundled with esbuild and driven by Playwright 1.62.1
against Chromium 151.0.7922.34. One `<ViewTransition>` wraps a teal card whose
mount is toggled in `startTransition`. The page also carries a positive control:
an element with an infinite 2-second keyframe animation, which proves the reset
applied at all. Every view-transition animation is paused at `currentTime = 125`
(of the default 250 ms). The measurable is the composited pixel at the card's
centre: solid teal `0,128,128` means no visible motion, and anything lighter
means the card is still fading in.

| Arm | Reduced-motion CSS | Preference | Element animations left | VT animations > 1 ms | Pixel at card |
| --- | --- | --- | --- | --- | --- |
| A0 | none | reduce | 1 | `old(root)`, `new(_t_0_)` | `51,153,153` |
| A | universal `*, *::before, *::after` reset | reduce | 0 | `old(root)`, `new(_t_0_)` | `51,153,153` |
| B | reset + `::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important }` | reduce | 0 | none | `0,128,128` |
| C | reset + `<ViewTransition default="none">` when the query matches | reduce | 0 | `old(root)` only (under a `group(root)` held at opacity 0) | `0,128,128` |
| A (seam) | **`personas-web` `src/app/globals.css` reduced-motion block, verbatim (31 lines)** | reduce | 0 | `old(root)`, `new(_t_0_)` | `51,153,153` |
| B (seam) | the same block + the pseudo-element rule | reduce | 0 | none | `0,128,128` |

With the preference off, every arm animated identically (`51,153,153`), so arm B
costs nothing for users who did not ask for less motion. The same A/B on the bare
platform (hand-rolled `document.startViewTransition`, no React) gave the same
split: the universal reset left all three root animations at 250 ms, and the
pseudo-element rule removed them. The universal selector's blindness is a
platform fact, and React only inherits it.

A `flushSync` toggle with no reduction rule produced zero view-transition
animations. Whether the card animates is a property of how the update was
scheduled.

### What the tree says

`personas-web` has no view transitions today. `git grep` for `ViewTransition`,
`startViewTransition` and `view-transition` over `next.config.*` and `src` returns
nothing. So the gap is latent and fires on adoption. The block the seam
experiment copied is a textbook universal reset, and it is also what six other
fleet trees carry in a stylesheet (`*, *::before, *::after` inside the media query). It passes every reading of
"honours reduced motion". The experiment shows one class of animation it cannot
reach, and the tree's own code gives no hint that the class exists.

A second fleet tree already hand-rolls transitions (it calls `startViewTransition`
behind a `matchMedia` check, inside `flushSync`) and independently wrote the arm B
rule beside its scoped reset. That is convergence from code written without this
technique. Its call-site gate is exactly what React 19.3 forbids on migration, and
its stylesheet rule is exactly what survives it.

The seam was chosen to falsify. A caught outcome would have meant something in a
real product's verbatim block reached the pseudo-elements, such as an
`html`-level rule or an inherited property. The amendment would then shrink to a
note about hand-written resets. It did not: the verbatim block behaved exactly
like the synthetic one.

### What this realization cannot do

- It measured enter only. `share` and `update` animate position and size on
  `::view-transition-group`, which arm B also silences, but that was not
  measured here.
- One engine. The selector behaviour is specified, but the pixel was read in
  Chromium alone.
- Arm C works, but it is per boundary. The technique rejects it because it
  scatters the reduction across every `<ViewTransition>` a contributor adds.
- It proves the gap on the release the tree will adopt. It cannot move a number
  in the tree today, which is why no product change shipped (see the applied row).

## The reduce switch that only reduces some properties

*Section added 2026-09-20; its citations were resolved that day. The sections
above were not re-checked, so this document's `verified_on` stays at their date.*

The technique's engine-scope section now says a library's reduce switch is scoped
a second time, to the properties that library counts as motion. framer-motion is
where that was read, and it is one expression in the installed package. In
`motion-dom`'s `animation/interfaces/visual-element-target.mjs`, each animated
value starts with

```js
shouldReduceMotion && positionalKeys.has(key) ? { type: false } : valueTransition
```

and `render/utils/keys-position.mjs` defines `positionalKeys` as `width`,
`height`, `top`, `left`, `right`, `bottom` plus every transform prop. So the
switch substitutes an instant transition for position-class values and leaves
everything else at its authored duration: opacity, colour and fill, a traced
path's length, a circle's centre or radius, a flex weight. `render/VisualElement.mjs`
(the `reducedMotionConfig` branch) shows that `"always"` and `"user"` differ only
in how `shouldReduceMotion` is *computed* — never in what reduction does. Read in
two fleet installs on 2026-09-20: `framer-motion@12.40.0` in `ascent` and
`framer-motion@12.38.0` in `personas`, identical in both.

This is the coverage gap that is hardest to see, because the switch is present
and honored. A vocabulary built only from transform and opacity is almost
entirely covered by it — and "almost" is the whole problem, since the uncovered
half is opacity, which for a one-shot gesture is the fallback anyway and for an
infinite loop is a flashing element the preference exists to suppress.

`ascent` maintains a wrapper for exactly this reason:
`src/components/about/motionReveal.ts` single-sources the four-prop ternary that
makes each element animating a non-positional value jump to its final state under
the preference, "where one missed branch silently animates for reduced-motion
users." Its header states the boundary and misstates two of its members — it
lists `left` and `width` among the props the switch does not degrade, and both
are in `positionalKeys`. The props it is right about are `pathLength`, `cx`/`cy`
and `flexGrow`. The wrapper is therefore correct and slightly over-broad, which
is the safe direction to be wrong in; the comment is the artifact to fix.

## A second spelling of the SSR-safe reader, and a second reason for it

`ascent`'s `src/components/ui/useReducedMotion.ts` reaches this document's two
properties without `useSyncExternalStore`: it seeds state `false` "so the server
render and the first client render agree (no hydration mismatch)", then corrects
it in an effect and subscribes to the media query for later changes. Same two
guarantees, and the same deliberate asymmetry in the initial guess.

Its header adds a third reason to refuse the library's own hook, and it is not an
accessibility reason at all:

> Deliberately NOT framer-motion's hook of the same name: `<Defer>` is imported
> by ordinary panels, and pulling framer into their chunk to read one media query
> would undo the payload win deferring is there to buy.

That is the technique's "the resolver belongs to no engine", discovered from the
delivery-cost side. The preference is consumed by every panel that merely decides
whether to defer something, and a reader shipped by the animation library makes
each of those a consumer of the animation runtime.

The same tree still calls `matchMedia` raw, per invocation, in
`src/components/about-org/aboutOrgLoopMotion.ts:23-25`. Building the wrapper is
the hard part and it is done; forbidding the raw reader is the part still owed —
the same standing gap this document's enforcement section describes from the lint
side.
