---
layer: application
type: application
subject: page-load-pipeline
technique: discoverable-critical-resources
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16.3.8
applied: code
ab_verdict: better
---

# A client-only first screen: declare the one image it is built around

Tree: personas-web, read at `5b07070e` (2026-10-14) with a clean clone; change shipped as `e46e8063`.
The seam is a route whose entire first screen is a client-only chunk: the hero is loaded with
`ssr: false` by design (a self-playing scene behind a reduced-motion branch), so the served
markup contains a skeleton and nothing the hero will paint. That is the technique's
"client-rendered shell" blind spot, in its simplest form.

## What was read

The largest visual of that first screen is the avatar poster (a 476 KB still, used as the clip's
`poster`, and as an `<img>` under reduced motion). The served response body for the route named
it nowhere: the only preloads were two fonts, a logo and a low-priority script. The seam was
chosen because it could falsify the rule's third step: if moving the reference into markup is
impossible and a declaration is the only remedy, the declaration must be cheap to add and
consumed on every branch, or the technique's own "cost of declaring too much" section would
condemn it. Both held.

## A and B

- **A (as shipped):** cold load emulated at 150 ms latency, 1.6 Mbps, 4x CPU, production build,
  4 runs. The poster request started at 4.3 to 6.5 s, with the video element as initiator,
  because it waited for the page script and the hero chunk.
- **B (one preload in the route layout, a server component, high fetch priority):** the served
  response body carries the preload link; the request started at 0.19 to 0.20 s with the link as
  initiator, and finished at 6.3 to 8.2 s against 9.1 to 11.0 s. Four runs each.
- **Floor:** type check clean, lint clean on the file, 2147 unit tests pass. Three failures
  predate the change and do not touch the route (two history-anchored guide checks that need
  full history, one five-second timeout).

## What it adds to the technique

- **The route layout is the place for the declaration** when the page itself cannot move the
  reference. The layout runs on the server even when everything beneath it is client-only, and
  a statically generated route bakes the link into the response.
- **A preload is justified when every branch consumes it.** Here the poster and the reduced-motion
  image share one address. Had the branches used different files (as the mobile variants of this
  site do), one preload would have been paid on all viewports and used on some.
- **The poster byte weight is a separate finding.** 476 KB for a disc under 560 px is a format
  and sizing problem; discovery moved the start, not the size, and the finish still trails by the
  transfer time. A smaller variant already exists in the tree for other sections.

## Where it falls short

One route, one image, emulated network, no field data: the field-budget file for the site is
still report-only with no route entries, so the improvement is lab-only. The page is also
unindexed for now, so no real traffic reaches it.
