---
layer: application
type: application
subject: async-ui-states
technique: placeholder-design
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16.3.3
applied: code
proof: structural-only
---

# Next.js — an appearance delay with no timer, and what it takes to keep it

The technique names a trap and does not say how to avoid it: when the
placeholder's invisibility window rides on its own entrance animation,
turning motion off must not turn the window off, or the users who asked for
less motion get more flashing. This tree pays the window's cost in the
styling layer — zero timers, zero JavaScript — which is exactly the
implementation that walks into the trap, and it is the only one in the fleet
that carries the paired escape.

## The window is the animation's backwards fill

```css
/* src/app/globals.css:616-619 */
.reveal-quiet {
  animation: ascent-arrive-in 200ms ease-out both;
  animation-delay: 150ms;
}
```

`both` fills backwards through the delay, so the element is held at the
keyframe's `from` — `opacity: 0` (`globals.css:602-606`) — for 150ms before
the fade begins. The comment above it states the whole mechanism and its
price, `globals.css:611-613`: "Gap-filler that is INVISIBLE for its first
150ms and only then fades up. `both` fills backwards through the delay, so a
chunk or fetch that resolves inside the window never paints a single pixel of
it — the anti-flash costs zero timers and zero JS."

The number is declared once in code and asserted against the stylesheet:
`src/components/ui/deferPolicy.ts:31` "export const
QUIET_PLACEHOLDER_DELAY_MS = 150", whose own comment (`deferPolicy.ts:23-30`)
repeats the doctrine the technique states — "Content itself is NEVER held for
this long; the delay lives on the placeholder only" — and
`src/components/ui/deferPolicy.test.ts:41-43` pins the pair so the two copies
cannot drift silently.

## The escape: a partner keyframe, not a disabled animation

Under the reduced-motion query the tree does *not* drop the animation. It
swaps the keyframe and collapses the duration:

```css
/* src/app/globals.css:879-884 */
/* The placeholder keeps its DELAY — that is anti-flash, not decoration — but lands at full opacity
   with no fade. */
.reveal-quiet {
  animation-name: ascent-hold-hidden;
  animation-duration: 1ms;
}
```

`ascent-hold-hidden` (`globals.css:622-626`) is a keyframe whose only content
is `from { opacity: 0 }`. With `both` and the 150ms delay still in force from
the base rule, it is the invisibility window with the fade removed — the
placeholder is absent for 150ms and then simply *is*. Compare the same block's
treatment of everything that is decoration: `globals.css:876-878` sets
`animation: none` on the entrance cascade, and `:885-890` does the same for
the ambient marks. **The preference distinguishes the two by hand**, one rule
at a time, which is the only way a styling-layer window can be kept: there is
no mechanism that separates timing from motion on its own.

That is the load-bearing detail for a reader borrowing this. The tempting
reduced-motion rule — one blanket `animation: none` over every animated class
— removes the window along with the fade, and the symptom is invisible to the
author, who is not the one running with the preference on.

## The placeholder that promises nothing

The technique's lazy-boundary clause says to promise only geometry you
actually know. The gap left by a streaming tab panel is a strict reading of
that: `src/components/org/shell/OrgTabGap.tsx:16` renders
`<div className={`reveal-quiet ${minH}`} aria-hidden />` — reserved height,
the delay, and nothing else. It is the second version, and the header says
what the first one cost (`OrgTabGap.tsx:3-8`): the previous silhouette "drew a
header + stat-row + two-card shape that matched no tab in particular, so a
cold navigation showed two unrelated loading layouts in a row (that one, then
the tab's own) before content: the exact flicker the choreography forbids."
A ghost that lies about geometry was measurably worse than no ghost at all,
and the tree kept only the two properties that were doing work — the reserved
height and the delay. `aria-hidden` is the technique's "not content" clause on
the same element.

`minH` is a parameter (`OrgTabGap.tsx:15`, default `min-h-[24rem]`) so a panel
with distinctive geometry reserves its own — `OrgTabChunks.tsx:58` passes
`min-h-[32rem]` — while the header's last line forbids the obvious next step:
"never draw content into it."

## Deferral is a payload decision, not a motion one

One neighbouring rule is worth recording because it is the same preference
being read correctly for a different reason.
`src/components/ui/deferPolicy.ts:41-55` collapses staged mounting to
"render immediately" under reduced motion — the waves themselves read as
motion — but refuses to do so for the viewport-triggered strategy:
`deferPolicy.ts:51-53` "`visible` is a payload/perf decision (don't mount a
chart nobody scrolls to), not a choreography one — reduced motion must not
force it into the DOM." Two deferrals that look alike in the API are
classified by *why they exist*, and only the perceptual one answers to the
preference. That is the same distinction the reduced-motion block draws
between the delay and the fade, made one layer up.

## What this realization cannot say

Nothing here was observed under the preference. The escape is verified by
reading the cascade — base rule, then the override that changes the name and
the duration while leaving `animation-delay` untouched — and the technique's
own instruction is to verify it *under* the preference, which no test in this
tree does. A rendering assertion that mounts a delayed placeholder with
reduced motion forced on and checks it is not painted on the first frame is
absent, and the unit test that exists pins only the constant's value, not the
behaviour it is supposed to produce.
