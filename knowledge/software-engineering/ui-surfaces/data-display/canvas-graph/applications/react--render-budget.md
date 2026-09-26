---
layer: application
type: application
subject: canvas-graph
technique: render-budget
stack: react
verified_on: 2026-09-26
verified_against: react@19.2
---

# CanvasShell — the Mastermind render budget at 50–100 projects

`src/features/teams/sub_mastermind/lib/CanvasShell.tsx` is the shared shell
for every Mastermind variant, and its header (`:7-12`) states the budget
contract outright: the world `<g>` is driven imperatively while panning,
islands are `React.memo`'d with referentially stable callbacks, off-viewport
islands are culled — "together these keep a 50–100 project portfolio at 60fps
— a pan does zero island re-renders and a wheel zoom commits at most once per
animation frame."

## Rung 1 — pan touches one element

The camera (`useCanvasCamera.ts`) writes the world transform directly during
a pan and commits state once on release; islands never receive the camera as
a prop, so a pan invalidates nothing. Zoom keeps rendering (counter-scaled
layers genuinely need `z`), but coalesced to ≤1 commit per frame
(`useCanvasCamera.ts:6-12`, `:144-161`).

## Rung 2 — culling, and its two hard-won corollaries

- `visibleRect` is derived from the committed camera plus `CULL_MARGIN = 700`
  world units (`:64`, `:238-247`) — the margin is sized so an island (~900×800
  footprint) "is only culled once its whole body is well clear of the
  viewport — no popping" (`:62-63`), which is what lets point-in-rect against
  island *centers* stand in for full rect-intersection (`:254-259`).
- **Empty before measured, not everything** (`:249-253`): before the
  viewport measure + fit effects run, `visibleIslands` is `[]` — the comment
  records that rendering the whole world in pass one only to cull it in pass
  two "cost N×~150 SVG nodes of pure waste — a large slice of the
  first-open freeze."
- **Culling follows the camera mid-gesture**: the camera lands one interim
  commit per `PAN_COMMIT_WORLD = 350` (≈ `CULL_MARGIN / 2`,
  `useCanvasCamera.ts:18-22`) of world travel, so long render-free pans do
  not drag across empty sea.
- **Waved mounting under a measured frame budget** (`:261-289`): even the
  culled set commits in slices — one wave per animation frame, the next
  wave's size halved when the previous one overran `MOUNT_FRAME_BUDGET_MS`
  and grown when it came in under half, with the measurement guarded so a
  data arrival re-running the effect cannot be mistaken for a slow frame.
  Fill order ranks nearest-to-viewport-center first (`:291-309`) so the
  pixels under the user's gaze resolve first; only the *set* is ranked —
  child order stays stable so keys and paint order never shuffle. The budget
  only grows, so later pans mount immediately with no re-stagger.
- One deliberate exception proves the derivation is owned: the keyboard
  cursor's island is always mounted, "even mid-flight to an off-screen
  island" (`:311-314`) — focus travel is an animated pan, and culling the
  focused island would draw the focus ring over nothing.

## Rung 3 — memoized islands, stable callbacks

Every island-facing callback is wrapped in `useEventCallback`
(`useEventCallback.ts` — stable identity, latest closure, ref swapped in a
layout effect) at `:363-419`: hover, tap, connect, focus, menu, fleet list,
commit. The comment at `:363-364` names the reason — "referentially stable so
React.memo'd islands skip re-rendering when only the camera transform (pan)
changed." (Quoted as "…when the shell does" until 2026-09-26; that wording was
never in the source.) This is the
technique's "callback takes the node's identity as an argument" clause
realized as the standard `useEvent` pattern; a fresh closure per island per
render would defeat the memoization of the entire portfolio.

Hover focus dimming bypasses rendering entirely: `el.style.opacity` is
written imperatively per island element (`:232-235`) rather than threading a
`lit` set through props — a highlight change touches zero component renders.

## Rung 4 — detail as a function of zoom

Mastermind reads the scale in two coarse forms and never passes the raw
value to an island. `zoomBand` and `bandGte` (`types.ts:246`, `:256`;
applied at `CanvasShell.tsx:204`) gate which structural layers render at
all. The counter-scaled banners get `zq` (`:205-209`, handed to islands at
`:817`), a zoom quantized to about 6% logarithmic steps. The comment gives
the accounting: a wheel zoom commits state every frame, but islands
"re-render when the quantized value crosses a step — ~12 renders per zoom
doubling instead of one per frame", and banners are at most 3% off between
steps. This is the stepped-zoom form of rung 1, reached in the tree before
the technique allowed it. Until 2026-09-26 the technique said nodes must not
know the transform exists, which would have read `zq` as a violation.

The continuous half of this rung used to live in a sibling, the
pattern-graph camera. It had `labelScale(k) = k^-0.62` counter-scaling text so
names stayed readable at 0.3× without becoming billboards at 3×, and
`lod(k, from, to)` as an opacity ramp rather than a step. That file moved on
2026-08-19 and was deleted on 2026-08-23 with the graph lane it served. The
citations hold at `8dca190821~1`
(`src/features/overview/sub_patterns/graph/useGraphCanvas.ts:216-225`) and
are history, not a current witness.

## Where it falls short of the standard

Edges skip the budget entirely: `scene.edges.map(...)` (`:888-890`) and
`LinkLayer` (`:891-897`) render every route on every commit with no culling
at all, and derived routes are keyed by endpoint pair
(`` `${e.from}→${e.to}` ``) rather than minted edge identity. At the current
scale (tens of islands, ~70 edges) this is invisible — and it is the first
thing to revisit if edge counts grow an order of magnitude, per the
technique's "cull edges by their own geometry, not their endpoints" clause.
