---
layer: application
type: application
subject: motion
technique: preset-vocabulary
stack: react
verified_on: 2026-08-18
---

# React application — preset vocabulary

How this repo realizes the named-preset library, and the engine decision the
library was forced to make on day one.

## The vocabulary: `motionPresets.ts`

`src/features/shared/components/display/motionPresets.ts` is the single home
— its own header says "ONE place where glyph motion is defined … **Never
inline keyframes in a consuming component**; add or edit a preset instead."
Seven presets across four kinds (`entrance` | `loop` | `hover` | `oneshot`):
`draw`, `staggered-draw`, `fade-pop`, `float`, `pulse`, `hover-response`,
`success-settle`.

Each `MotionPreset` declares exactly what the technique requires:

- **Intent as doc, misuse as doctrine** — every preset carries a JSDoc
  intent, including negative guidance: `draw` is "STROKE traces only … on
  filled paths a `pathLength` dash sweep traces the region *boundary*, which
  reads as noise" (`motionPresets.ts:57-61`); `pulse` is "Only for surfaces
  where work really is happening … otherwise it lies"
  (`motionPresets.ts:106-109`).
- **Timing and easing owned by the entry** — `durationS`, `ease`, and a
  `stagger(delay, spread)` function per entrance (`motionPresets.ts:34-50`).
  Deviation from the standard: these are inline numbers, not references to
  the token ladder — the `MOTION` JS ↔ `--duration-*` CSS mirror is
  comment-only repo-wide (registered at `#w3-design-tokens`), so the
  vocabulary is single-sourced *internally* but not wired to the token axis.
- **Per-preset reduced fallback** — the `reduced: 'opacity-only' | 'none'`
  field (`motionPresets.ts:46-47`), with the shared cross-fade defined once
  as `REDUCED_FADE_KEYFRAMES` (`motionPresets.ts:52-54`). The split follows
  the lifetime rule exactly: every one-shot entrance falls back to
  `opacity-only`; both infinite loops (`float`, `pulse`) fall back to
  `none` — stillness, not a reduced loop.

## Taste constants beside the presets

The header block (`motionPresets.ts:14-20`) fixes the budgets where the
gestures live: entrance total ≤ ~1.2s, ambient translate ≤ 3px with opacity
delta ≤ 0.08 over a 3–6s period ("a screenshot 3s apart should look
near-identical"), and the ambient honesty rule verbatim ("a sweep on an idle
empty state reads as 'loading' and is a lie"). Class sequencing is enforced
as code, not memory: `ambientStartDelayS()` (`motionPresets.ts:161-164`)
computes when a loop may start — after the last stagger delay plus the
entrance duration plus a beat — so ambient never overlaps entrance.

## The engine decision baked into the vocabulary

The library is "Deliberately CSS-keyframe data, not framer-motion variants"
(`motionPresets.ts:9-12`): the app wraps everything in
`<MotionConfig reducedMotion={isDocumentVisible ? 'user' : 'always'}>`
(`App.tsx:321`), and under `'always'` framer snaps *every* animation,
opacity included — which had silently killed reveals. CSS animations are not
governed by `MotionConfig`, so the vocabulary escaped to the engine the
switch cannot see — the kill-switch hazard and the escape hatch from
engine-selection, both in one comment. The renderer
(`MotionizedGlyph.tsx:16-17`) closes the loop: "All timing/easing lives in
`./motionPresets.ts`, never inline here or in a consumer — one file to tune,
every motionized surface follows."

## The standing deviation

`MotionizedGlyph.tsx:10-12` re-plays the entrance via `IntersectionObserver`
"each time the glyph re-enters the viewport (section land / tab switch /
scroll-back)" — a deliberate decorative-glyph policy that contradicts the
one-shot standard the data-row primitives (`RevealItem` + `useRevealTracker`)
implement correctly. The vocabulary is consistent; its two consumer families
have opposite replay policies, and only one of them is written down as a
policy.

## Correction — what the library's kill switch actually does

*Added 2026-09-20 and resolved against the tree that day; the sections above keep
their 2026-08-18 date and were not re-checked beyond the two citations named
here.*

The engine-decision section above repeats the vocabulary's own comment: that
under `reducedMotion="always"` framer "snaps EVERY animation (opacity included)".
Read in `framer-motion@12.38.0` as installed in that same tree, it does not.
`motion-dom`'s `visual-element-target.mjs` substitutes an instant transition only
where `positionalKeys.has(key)`, and `keys-position.mjs` defines that set as
`width`, `height`, `top`, `left`, `right`, `bottom` plus the transform props.
Opacity, colour, and every geometry or path value animate at their authored
duration under the switch. `VisualElement.mjs` shows `"always"` and `"user"`
differing only in how `shouldReduceMotion` is computed, never in what reduction
does — so `"always"` is not a stronger kill, just an unconditional one.

The decision the comment justifies still stands, on the narrower and sufficient
ground: whenever the document is hidden the app sets `"always"`, every
transform-carrying entrance snaps to its end position, and a draw or fade-pop
preset loses the motion that distinguishes it. Moving the vocabulary to
stylesheet keyframes puts it outside the switch's reach entirely, which is the
escape hatch in [engine-selection](../techniques/engine-selection.md) used
correctly. What is wrong is the stated mechanism, and it matters because the
false version teaches that a library's global switch is total — the belief the
technique's engine-scope section exists to break.

The `MotionConfig` call has also moved: it is `App.tsx:371` on 2026-09-20, not
`App.tsx:321`.
