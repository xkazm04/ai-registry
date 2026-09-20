---
layer: application
type: application
subject: motion
technique: content-bearing-degradation
stack: react
verified_on: 2026-09-20
verified_against: react@19.2.4
---

# React application — the armed start state, under server rendering

The technique's fourth failure shape — a decorative gesture that blanks a
surface because its *start* state was delivered by something that could not also
clear it — is not hypothetical. It shipped, on a public front door, and the
repair is the technique's placement rule implemented twice by two different
authors. Evidence is from `ascent` (Next.js App Router, React 19.2.4,
framer-motion 12.40.0), resolved against the tree on 2026-09-20.

## The regression, in the component's own words

`src/components/deck/Reveal.tsx` wraps almost every block of the public
`/about` page and the index landing. Its header comment (lines 6–18) records the
defect it now guards, and it is the failure shape exactly:

> the previous framer-motion version used `initial={{ opacity: 0 }}`, which
> framer bakes into the SSR HTML as an inline `opacity:0`. Since the only thing
> that unhid it was a client-side `whileInView` observer, any render without
> working JS — scripts disabled/blocked, a crawler that doesn't execute JS, or a
> partial hydration failure — left EVERY Reveal-wrapped block permanently at
> `opacity:0`.

Nothing about the gesture was content-bearing. A fade-and-rise carries no
information its resting state does not; the litmus answers *decorative*, and
"render nothing" would be the right degraded path for the motion. What was
deleted was not the motion's payload but everything the motion wrapped, by a
value the server emitted and no server-reachable code could remove.

## The repair is a placement change, not a fallback

The hidden start state now lives only in `.js-reveal`
(`src/app/globals.css:684-697`), a class the component adds *after* it mounts
(`Reveal.tsx:51-75`), armed in a layout effect so the hidden start lands before
the first post-hydration paint and JS readers see no flash. The delivered markup
carries neither the class nor any inline opacity, so the no-JS render is the
settled state. Two details complete it:

- The arming class sits inside `@media (prefers-reduced-motion: no-preference)`,
  so a reduced-motion reader is never hidden even once the class is added — the
  reduction and the progressive-enhancement guard are the same rule in one
  block.
- `Reveal.tsx:57-60` takes the third bullet of the rule literally: with no
  `IntersectionObserver` available it reveals immediately rather than arming,
  "degrade to plain visible, never blank."

## The contract is pinned by a test that reads markup

`src/components/deck/Reveal.test.tsx` is the concrete form of the technique's
claim that this is one of the few motion contracts a suite can hold. It renders
through `renderToStaticMarkup` — no effects, so the output mirrors the true
server render — and asserts the content is present, that the HTML does *not*
match `/opacity\s*:\s*0/`, and that neither `js-reveal` nor `is-revealed`
appears (lines 16–28). A second test asserts no inline opacity style ever
reaches the element (lines 30–40); a third exercises the observer-absent path
and asserts the content ends visible (lines 42–56).

None of these assert that an animation ran. They assert what a reader who never
sees it run receives, which is the only half a suite can actually verify.

## The second witness: a playhead whose served state is "finished"

`src/components/about-org/aboutOrgLoopMotion.ts` reaches the same rule from the
progress-driven side, and says so (lines 11–14): the rest state is `p = 1`, the
run already finished, and the "before" state is armed only in a client layout
effect, "so a reader with no JS, or a crawler, sees the completed run instead of
a field frozen at its start." `useState(1)` (line 45) is that rule as one
character. The observer-absent branch (lines 63–65) and the reduced-motion
branch (lines 60–61) both return without arming, leaving `p` at its finished
value.

The hook also derives its liveness from the loop rather than from the
preference: `playing: p < 1` (line 93) is true only while a run is actually
advancing, so a surface labelled from it cannot claim to be running when nothing
armed it. That is the technique's "the switch is driven by the loop's real
state" with no separate flag to fall out of sync.

`.live-dot` (`globals.css:787`) is the same discipline at the other end: every
call site applies the pulsing class conditionally on real state — `moving`,
`phase.tone === "live"`, `status === "in_progress"` — rather than always-on, and
the class is zeroed in the reduced block (`globals.css:889`).

## What the reduced-motion block gets right, and it is not the usual thing

`globals.css:854-903` is an enumerated block, not a universal reset: each
animation class is named and switched off, which is why the deck's arming rule
and the placeholder's timing window can be treated differently from each other.
Two rules of
[reduced-motion-mechanics](../techniques/reduced-motion-mechanics.md) appear
verbatim in it. `.reveal-quiet` — a gap filler invisible for its first 150 ms so
a fast resolve paints none of it — keeps its delay and loses only its fade
(`globals.css:881-884`), with the comment "that is anti-flash, not decoration";
and it collapses to `animation-duration: 1ms` against a hold-hidden keyframe
rather than to `animation: none`, which is the epsilon-not-zero rule arrived at
independently.

## Three standing deviations

The standard is not bent to fit any of them.

- **The playhead routes frame values through reactive state.**
  `aboutOrgLoopMotion.ts:82-88` calls `setP` inside its `requestAnimationFrame`
  step, so every consumer of `p` re-renders per frame for the whole
  `LOOP_RUN_MS = 2400` run —
  [performance-discipline](../techniques/performance-discipline.md)'s "frames
  bypass reactive state", inverted. It was filed as an instance of the rule; it
  is an instance of the defect, and the rule stands.
- **The deck reveal is not one-shot.** `Reveal.tsx:61-70` mirrors each entry's
  live intersection with `once:false`, so a section re-hides and re-staggers
  every time the reader snaps back to it. Snap-scrolling makes this feel
  intentional and
  [unprompted-motion-lifecycle](../techniques/unprompted-motion-lifecycle.md)
  still names it: coming back into view is a reader returning to re-read.
  `aboutOrgLoopMotion.ts:69-71` propagates the idiom to the diagram loop.
- **The preference is read two ways in one tree.**
  `src/components/ui/useReducedMotion.ts` is a subscribing, SSR-agreeing
  wrapper; `aboutOrgLoopMotion.ts:23-25` calls `matchMedia` raw, per invocation,
  inside render and effect paths. The wrapper exists, which is the hard part;
  forbidding the raw reader is the part still owed.
