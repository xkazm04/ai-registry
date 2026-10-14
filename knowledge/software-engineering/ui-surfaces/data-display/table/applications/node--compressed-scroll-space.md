---
layer: application
type: application
subject: table
technique: compressed-scroll-space
stack: node
status: forged
verified_on: 2026-10-14
---

# A windowed grid that probes the browser's scroll ceiling and maps two coordinate systems

Read in the `revolist/revogrid` tree (package version 4.28.4, commit
`8b606d6d15e24841aa6cd343cf4aa0e4b0739957`), a web-component data grid. The tree
pins no runtime: its workflows use `lts/*` and `latest`, so no
`verified_against` is written. Every citation below was opened in a clone on
2026-10-14.

**decision.** Rather than refuse or page past the browser's scrollable-size
ceiling, the grid keeps the whole dataset scrollable by giving the browser a
smaller "physical" scroll extent and mapping to the real "logical" one.

**forces.** A client-held grid with a million rows at the default row height is
tens of millions of pixels tall, past what an engine will lay out. The product
position is that the grid holds the data (it sorts, filters, groups and pastes
over all of it), so paging was not the answer.

**what the tree does that the technique asks for.**

- The ceiling is probed, with a fallback.
  `src/services/scroll.dimension.helpers.ts:1 "const FALLBACK_MAX_SCROLL_SIZE = 16_000_000;"` is the fallback only; the live
  value is read back from an off-screen scroller at
  `src/services/scroll.dimension.helpers.ts:68 "detectedMaxScrollSize = Math.max("` and a one-million-pixel guard is
  subtracted.
- The physical extent is capped and compression is derived, not configured:
  `src/services/scroll.dimension.helpers.ts:96 "const physicalScrollSize = Math.min(logicalScrollSize, maxPhysicalScrollSize);"`.
- The rendered window is offset by the difference:
  `src/services/scroll.dimension.helpers.ts:133 "getRenderOffset(coordinate"`.
- Wheel input advances in logical units rather than through the ratio:
  `src/services/local.scroll.service.ts:211 "if (typeof delta === 'number' && scrollDimension.isCompressed) {"`.
- The end-to-end suite names the edge and interaction checks the technique asks
  for: the final compressed-scroll row and column stay inside the viewport, deep
  row and column interactions stay aligned, and pinned areas stay aligned after
  compressed deep scroll (`e2e/virtualization.spec.ts`, `e2e/pinning.spec.ts`).

**what the tree does not state.** The thumb-addressability bound. At a
15-million-pixel usable ceiling the thumb reaches every row only up to about that
many rows (the derivation is in the technique); nothing in the tree records the
bound or what a larger dataset should do. A consumer past it has keyboard and
programmatic scroll and no stated fallback.

**structural fact.** Compression is a property of the scroll dimension alone: the
same helper serves rows and columns, which is why the suite carries a horizontal
twin of every vertical compression test.
