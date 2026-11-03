---
layer: application
type: application
subject: overlay-composition-and-safe-area
technique: placement-declared-at-provisioning
stack: react
status: forged
verified_on: 2026-11-03
verified_against: react@19
applied: simulation
ab_verdict: better
---

# A layout table and a region test, bounded by the canvas — Overlord stage (React)

Overlord (origin/main at `41536936a6c586a0343c0f16325355802211c764`, read 2026-11-03;
`apps/stage/package.json:23 "react": "19.3.1"`) is an AI-hosted stream. Its stage app is
the whole broadcast picture: one 1920x1080 page that OBS captures as a single browser
source. It is the opposite architecture to the Castle Control applications in this subject,
where a tool adds several sources to the streamer's scene. Here the tool owns the canvas,
so the placement table is the page's layout table, and nothing is provisioned per overlay.

## What the stage has right

Every element has a declared home, and the homes are checked by computing boxes:

- `apps/stage/src/layouts.ts:1 "// Named scene layouts. Every on-canvas element lives in a named region; a layout is a rect per"` —
  the table. `:27 "export const REGIONS = ["` names the regions, and `:199 "export function layoutRects(layout: LayoutId, flags: LayoutFlags): Record<Region, Rect> {"`
  returns one rectangle per region for each layout and flag set.
- `apps/stage/src/stage.test.ts:24` builds one case per layout, poll flag and foil flag: "every visible region stays inside 1920x1080".
  `:16 "const overlaps = (a: Rect, b: Rect) =>"` is the box intersection the later cases use
  to assert that the caption, chat, vote, cards and decrees never sit under the avatar.
- `apps/stage/DESIGN.md:418 "The canvas is always laid out at 1920x1080 CSS pixels and scaled as a whole"` —
  one owner of position. The page lays out at canvas size, and `packages/stage-kit/src/playback.ts:96 "const scale = Math.min(winW / CANVAS_W, winH / CANVAS_H);"`
  letterboxes it into any window, so in a 1920x1080 source the page draws at exactly
  scale one.

**Upward lesson taken into the technique:** when the tool owns the whole picture, the
collision check is a unit test over the layout table. It covers every layout and flag
combination on every commit, before any frame is rendered. The technique now carries
this case under "When the tool owns the whole picture".

## Where it falls short: the floor is the canvas, not the player

The region test's bound is the frame edge (`apps/stage/src/stage.test.ts:32 "expect(r.x + r.w, k).toBeLessThanOrEqual(CANVAS_W);"`),
and two layouts sit inside the canvas but outside any safe area.

**Landscape ticker.** `apps/stage/src/layouts.ts:61 "export const GUTTER = 32;"` and `:63 "const TICKER: Rect = { x: GUTTER, y: 1004, w: 1920 - 2 * GUTTER, h: 52 };"`
put a text ticker 32 px from the sides and 24 px from the bottom edge. EBU R 95 (v1.1,
2017) sets 5% graphics-safe for HD, which is 96 px and 54 px on this canvas. The ticker
is also outside the 3.5% action-safe margin (67 px and 38 px). A web player does not
overscan, so the cost here is the player's control bar, which covers the bottom band
while it is shown. It is a convention gap, not a crop.

**Vertical clips.** `apps/stage/DESIGN.md:435` says clip mode draws a candidate "on a 1080x1920 canvas instead of the broadcast".
The clips are drafted for vertical platforms
(`crates/shadowrunr-clips/src/upload.rs:117` appends `#Shorts` to the title, and `:155 "pub struct TikTok;"`). The bottom bands are
`apps/stage/src/clip.css:190 "top: 1210px;"` (captions, 440 px tall), the citation strip
at 1664, and the footer at `:273 "top: 1812px;"`. The footer holds the AI disclosure and
the provenance (`apps/stage/src/ClipStage.tsx:172 "{clip.disclosure}</span>"`).
Meta's Reels ads guide, re-fetched verbatim 2026-11-03, advises "leaving roughly 14% of
the top, 35% of the bottom, and 6% on each side of your asset free from text, logos, or
other key creative elements". On 1080x1920 that is a bottom band from y 1248, a top band
to y 269, and 65 px sides. Google's and TikTok's vertical ad templates draw a bottom band
of the same order. Their figures were measured from the template images by this run's
research lane, not stated in page text. Against that band the disclosure footer, the
citation strip and most of the captions sit under the player, and the header (`apps/stage/src/clip.css:53 "top: 48px;"`)
starts inside the top band. The 72 px side margins clear the 6%. These are ad-placement
figures, and organic player layouts differ by app version. The shape (heavy bottom band,
lighter top band, a side rail) is what the subject relies on.

## Applied (2026-11-03, simulation, better)

Three real cases from this tree, walked under A, the current floor (inside the canvas),
and B, the player's band (Meta's figures above):

| Case | Box (y) | A: inside canvas | B: clear of player bands |
| --- | --- | --- | --- |
| Clip footer: AI disclosure + provenance | 1812–1868 | pass | fail: under the bottom band |
| Clip header: ALLEGED row and case title | 48–348 | pass | fail: starts under the top band |
| Broadcast ticker (landscape) | 1004–1056 | pass | fail against the 5% graphics margin; covered only while the player's control bar shows |

A passes all three. B flags all three, and the first is a provenance failure: the
disclosure that marks the clip as synthetic is drawn where the platform paints its
caption block. That is better by the subject's own measure, because it catches a defect
the current test cannot express. **Falsifier:** a capture of an uploaded clip in the
platform's own player, with its overlay UI showing, in which the footer is readable. The
code change (a per-canvas safe inset in the region test, and the clip disclosure moved
out of the bottom band) is a design change to the clip layout. It is left to the project,
recorded in its `.ai/applied.jsonl`.
