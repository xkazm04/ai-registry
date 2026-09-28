---
layer: application
type: application
subject: narrative-scroll-surface
technique: motion-carries-the-mechanism
stack: react
status: forged
verified_on: 2026-09-24
verified_against: react@19.2.8
applied: code
ab_verdict: better
proof: ab-paired
---

# A flow explainer that looped for everyone, and a page that vanished

How `personas-web` (public; Next.js 16.3.3, React 19.2.8 and framer-motion
13.0.0 as its lockfile witnesses, at `11601e0`) meets
[motion-carries-the-mechanism](../techniques/motion-carries-the-mechanism.md).
The seam is the `/how` page's event-bus section, whose "swarm" view explains
one mechanism: every connected tool sends its messages through one central
hub. The tree was opened, run under both motion preferences with a browser
automation harness, changed, and run again on 2026-09-24.

## The mechanism lived only in the loop

The swarm draws ten tool badges on a ring around a hub. Each badge fades in, a
dot travels from it to the hub, and it fades out on a staggered cycle. The
claim ("tools talk through the hub") exists only as that travel. No frame
shows it, and the connectors were drawn at 5% opacity, faint enough that a
still frame reads as ten unrelated icons.

It was also animated in an engine the site's reduction rule could not reach.
The global reduced-motion block collapses stylesheet animations
(`src/app/globals.css:796 "@media (prefers-reduced-motion: reduce) {"`,
`src/app/globals.css:800 "animation-duration: 0.01ms !important;"`). The swarm
animates with the vector format's own animation elements, which that rule does
not govern. This is the engine-inventory gap
`reduced-motion-mechanics` describes, found in a tree that had already fixed
the same gap for two other engines.

**Measured, arm A (before):** with reduced motion emulated, 10 of 10 badges
were still changing opacity over a 1.7 s sample, and 20 animation elements
were live. In the same section the stylesheet animations did stop: 2 infinite
animations under no preference, 0 under reduce. The reduction worked on the
engine it could see and missed the one it could not.

## The repair draws the flow instead of dropping it

`src/components/sections/event-bus-showcase/components/SwarmView.tsx:15 "const still = useStillMotion();"`
reads the preference through the project's SSR-safe, subscribing resolver.
Under reduced motion the badges render at rest
(`src/components/sections/event-bus-showcase/components/SwarmView.tsx:84 "opacity={still ?"`), the animation
elements are not rendered at all (`src/components/sections/event-bus-showcase/components/SwarmView.tsx:85 "{!still && ("`), and each
connector gets a short direction mark with an arrowhead toward the hub
(`src/components/sections/event-bus-showcase/components/SwarmView.tsx:116 "markerEnd={`url(#${uid}-toBus)`}"`). That is the
technique's third degraded form: a continuous flow with no steps keeps its
path and its direction. Resolving it to a still ring of icons would have been
the "end state that encodes no time" the technique refuses.

**Arm B (after):** under reduce, 0 of 10 badges changing, 0 animation
elements, 10 of 10 visible. **Floor:** under no preference, 10 of 10 still
animate and all 20 animation elements are present. Type check clean, lint clean
for the section (the timing math moved to its own module to stay inside the
project's file-length rule), unit suite 239 of 239.

## The same tree, one level up: the start state

Screenshotting the repaired swarm under reduced motion returned a blank image.
The cause was not the swarm. `src/components/PageTransition.tsx` wraps every
route, and the server always renders its opening variant because it cannot
know the preference. For a reduced-motion visitor the client then removed the
animation target, and nothing carried the wrapper back from
`opacity: 0; translateY(20px)`. Arm A measured the settled wrapper at opacity
0 on 4 of 4 routes tried (`/`, `/how`, `/security`, `/roadmap`), with only the
fixed header visible. Visitors who had asked for less motion got an empty
site.

This is the fourth failure shape of `content-bearing-degradation` exactly: a
decorative gesture's start state, served in the markup, with the lifting half
removed. It adds one path the technique's list did not name. Scripting was on,
the observer existed, and the lift was removed **by the reduced-motion branch
itself**. The component's own header comment had fixed a hydration mismatch
by gating the animation props rather than the element. Gating `animate` away
also removed the lift, and the start state stayed.

The repair keeps the target and removes only the travel
(`src/components/PageTransition.tsx:45 "const INSTANT = { duration: 0 };"`,
`src/components/PageTransition.tsx:56 "transition={prefersReducedMotion ? INSTANT : TRANSITION_NORMAL}"`).
**Arm B:** settled opacity 1 on 4 of 4 routes under reduce. **Floor:** under no
preference the wrapper still starts from 0 and settles at 1, so the enter
transition still plays.

## What this realization cannot do or prove

- **It has no beat list.** The swarm is a loop with authored timing, so it
  cannot be stepped, scrubbed or captured frame by frame. The repair is the
  flow-with-direction degraded form, the one available without rebuilding the
  view. A rebuild as beats (a message leaves a tool, reaches the hub, fans out
  to a subscriber) would let the section teach the fan-out as well, which the
  current loop never shows.
- **Measured in development mode only.** Both arms ran against the dev server.
  The start-state mechanism depends on server rendering, which production
  shares, but no production build was measured.
- **A small sample.** One page load per arm per preference and four routes. The
  numbers are counts of a deterministic render, not rates, and that is how they
  should be read.
- **The pattern that caused the blank page is shared.** `src/app/m/layout.tsx`
  wraps the mobile routes in a different mechanism (the animation library's
  own reduced-motion mode). It was not measured here.
