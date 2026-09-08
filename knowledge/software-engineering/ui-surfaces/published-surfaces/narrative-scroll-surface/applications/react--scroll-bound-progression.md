---
layer: application
type: application
subject: narrative-scroll-surface
technique: scroll-bound-progression
stack: react
status: forged
verified_on: 2026-09-08
verified_against: react@19
---

# Scroll-bound progression — a self-hosted recruiting studio's `/about` page

How `kp` (at `3394deb2`) implements
[scroll-bound-progression](../techniques/scroll-bound-progression.md) in
`app/landing/spark/AboutCurve.tsx`, and the three places its motion is still
driven by a clock.

## Per-station progress, and one page-level value with a stated predicate

`StepRow` subscribes to its own element's progress:

```ts
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
```

(`AboutCurve.tsx:79`) — zero when the station's top meets the viewport bottom,
one when its bottom passes the viewport top. Every visible property in the row
is a transform of that one value, which is the technique's one-input rule
held exactly.

The page-level value exists too, and has the single legitimate consumer: the
spine's drawn length. `AboutCurve.tsx:142-143` measures the *track*, not the
document — `target: trackRef`, `offset: ["start center", "end end"]` — so the
readout is progress through the sequence, from the first station to the last,
and the closing section and footer below it do not inflate it. The painted
path rides that value directly (`:228`, `style={{ pathLength }}`) over a
static under-stroke (`:227`), so the spine is a distance readout that costs no
extra space.

## The envelope has all three phases

```ts
const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.74, 1, 0.82]), …);
const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.1, 1, 1, 0.15]);
```

(`AboutCurve.tsx:80-94`.) In at `0.74`, peak at `1.0` at mid-progress, out to
`0.82` — a recede that is present rather than omitted, and one that stops well
short of nothing, so a station the reader has passed is still legible when
they glance back. Opacity holds a plateau across the middle 60% of the
station's travel, which is the reading window; it dips to `0.1` and `0.15` at
the extremes rather than to zero.

The number dot has its own curve on the same input, `[0.34, 0.5] → [0, 1]`
(`:95`), so the marker snaps in over the last sixth of the approach — the
technique's "a small marker can be crisper and faster", expressed as a
narrower keyframe window rather than as a second input.

## Smoothing

Both scale tracks run through a spring, `stiffness: 110, damping: 26`
(`:80-93`), so a wheel notch is absorbed rather than reproduced. The
page-level spine uses its own, `stiffness: 120, damping: 30` (`:143`). The
constants are inlined at three sites rather than named once, which is the
technique's "state the lag centrally" rule unmet — a page with three
personalities held in agreement by hand.

## The measured collision check

This is the clearest confirmation in the tree, and it is the derivation the
technique asks for, written beside the number it justifies
(`AboutCurve.tsx:84-89`):

> The illustration peaks 10% larger than the copy beside it: same scroll
> progress, same keyframe positions, same spring — only the centre value moves
> (1 → 1.1), so the in-ramp and the linear post-peak decrease keep their
> shape. Measured at 1024/1280/1440: the widest art card at 1.1 still stops
> short of the number-dot column, so the extra size costs no collision and
> `scale` never reflows. The text column stays on `scale`.

Two rules in one comment: the per-column differentiation is a single changed
value over an otherwise identical curve, and the peak above rest is a measured
clearance at three viewport widths rather than a chosen factor.

## Where the repo falls short

**Each station's evidence animates on a clock.** The outer envelope is
scroll-bound; the illustration *inside* it is not. `about-art/shared.ts:9-10`
declares a viewport trigger and a fixed duration —
`ENTER = { once: false, amount: 0.5 }`, `DRAW = { duration: 1, ease: … }` —
and each art module runs a delayed cascade on it: `IntakeArt.tsx:18-56`
staggers five channel chips at `0.1 + i * 0.09`, then a connector at `0.6`,
a card at `0.8`, a badge at `1.05`. Every one of those is the failure the
technique names: the gesture plays on the clock rather than at the reader's
position, so on a fast scroll it is finished before it is seen and on a slow
one it finished before the station was reached.

`once: false` compounds it. `shared.ts:5-6` states the replay as a choice —
"Every step art replays when it re-enters the viewport (`once: false`), so
scrolling the page up and down keeps it alive" — but a reader scrolling back
to re-read a station is a reader returning to something, not arriving at it,
and a 1.05-second cascade replayed on each pass is the glitch reading the
motion subject's one-shot rule exists to prevent. The station's *envelope*
already handles the return correctly, by being reversible; the art inside it
contradicts that.

**Reduced motion does not collapse the stations.** The page imports its
reduced-motion hook (`AboutCurve.tsx:141`) and spends it on exactly one
gesture: the hero's scroll hint (`:210`). `StepRow` has no reduced-motion
branch at all, so a reader who asked for less motion still gets two scale
springs, a scroll-bound opacity ramp and a scaling dot; the art's cascades are
ungated too. The technique requires every station at its peak state,
independent of scroll. Note what the repo *does* get right in the same area:
`useStillMotion.ts:19-24` reads the preference as live external state with a
server snapshot, precisely so that nothing branches served markup on it — the
hero's confetti once did and "took the entire page down with it" (`:12-17`).
The mechanism for a correct collapse is present and built; the stations do not
use it.

**The guard's predicate is narrower than the rule.** `AboutCurve.test.ts`
holds three checks over the landing tree: which reduced-motion hook a file may
read (`:67-77`), that every `repeat: Infinity` loop reaches the flag
(`:79-91`), and that every *entrance* reaches it (`:115-131`). The third is
the one that would catch these stations, and it is scoped to the feature-preview
directory (`:105-113`) — the step art and the station transforms are inside no
check's target. The file's own comment records why that third check exists at
all: the loop check "was the whole reduced-motion gate for months, so the nine
feature previews slammed `scale: 2.2` stamps onto the page … for a reader who
had asked the OS for less: the choreography is finite, so `repeat: Infinity`
never saw it" (`:93-101`). The same widening has not yet reached this page's
own art
([gate-sees-target](../../../../_laws.md#gate-sees-target)).
