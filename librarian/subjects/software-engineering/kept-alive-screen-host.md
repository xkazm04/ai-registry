---
subject: kept-alive-screen-host
domain: software-engineering
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# kept-alive-screen-host

## Architecture review - 2026-10-31

First review, against `e3f00b8a4`. All eight documents were read in full. The
three promises (frame on the click, hidden-but-alive return, one sliced stream
per screen) hold together, and the load-bearing platform claims hold against
primary sources:

- React's Activity reference: hidden mode "will also destroy their Effects,
  cleaning up any active subscriptions", and on show React "will reveal the
  children with their previous state restored, and re-create their Effects";
  hidden children are hidden with `display: "none"`, re-render "at a lower
  priority", and "a hidden component's DOM is not destroyed, any side effects
  from that DOM will persist".
- Hidden Activity is not server rendered. The Activity reference is silent on
  SSR, but React's own server renderer says so at v19.2.0
  (`ReactFizzServer.js`, `renderActivity`): "A hidden Activity boundary is not
  server rendered. Prerendering happens on the client."
- `useSyncExternalStore`'s `getServerSnapshot` "will be used only during server
  rendering and during hydration of server-rendered content on the client",
  which is the hydrated-flag mechanism as described.
- next/link (app-dir `link.tsx`, canary) returns early on `if
  (e.defaultPrevented)`, so a capture-phase host that prevents the click is
  honoured, as host-click-delegation says.

Every application citation was re-read at `xkazm04/afterlife` `009c7893`
from raw files and matches, including both deviations (no unmount abort in
`useStack`; the `{}` in-band sentinel).

Three small clarifications are owed:

- The golden path puts the click listener "at the document"; the technique
  and the source (`navigation.ts:138`, `window.addEventListener('click',
  onClick, true)`) put it on the window. Internal inconsistency.
- sliced-screen-stream says JSON would turn the refused types "into `{}`, a
  string or `null`". MDN: a function is "omitted (when found in an object) or
  changed to `null` (when found in an array)". A dropped key is the more
  dangerous outcome in a protocol where an omitted key means unknown.
- hidden-but-alive-screens names media among the effects that survive a hide
  but not the documented remedy, and its element rule omits React's documented
  text case ("A hidden Activity that just renders text will not render
  anything").

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/kept-alive-screen-host",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:bd3b786f76a63215",
  "disposition": "clarify",
  "trigger": "First architecture review; subject pending.",
  "intended_benefit": "A screen host whose click, keep-alive, stream and hydration rules match the platform behaviour they lean on, with one consistent description of where the click listener sits.",
  "failure_if_ignored": "A reader adds the listener on document while the technique says window (harmless but contradictory); a team trusts JSON to only mis-type refused values when it also silently drops keys, which the client reads as unknown; a kept screen keeps playing audio after a hide.",
  "boundary": "One client host owning many screens. Frame continuity as a property stays with app-shell; settle states and placeholder craft stay with async-ui-states; data kept beyond a view stays with client-fetch-cache.",
  "coverage": "All 8 documents read in full. Primary sources opened: React Activity reference, React useSyncExternalStore reference, ReactFizzServer.js at v19.2.0, next/link app-dir source (canary), MDN JSON.stringify. Every application citation re-read at xkazm04/afterlife 009c7893. Not evaluated: runtime behaviour, production-build timing, the claim that the framework path hook trails a host navigation by a frame, and next/link at the exact pinned 16.4.x tag.",
  "counterexamples": [
    "A kept screen with a playing <video> keeps playing after its Activity hides, because the element stays in the DOM; effect cleanup alone does not cover it unless a cleanup pauses it.",
    "A slice whose value has a function-valued field serialises with that key omitted, which the client decodes as unknown rather than as a refused value, if the server's plain-JSON walk is skipped.",
    "A product of a few server-rendered documents is better served by native navigation and the back-forward cache (host-click-delegation's own boundary).",
    "A user-composed dashboard has no static frame to paint (frame-first-no-skeleton's own boundary)."
  ],
  "sources": [
    {
      "url": "https://react.dev/reference/react/Activity",
      "result": "'destroy their Effects', 're-create their Effects', display none, lower priority, DOM side effects persist, video keeps playing with a layout-effect pause as fix, text-only hidden Activity renders nothing. Supports hidden-but-alive-screens; basis for its two clarifications."
    },
    {
      "url": "https://github.com/facebook/react/blob/v19.2.0/packages/react-server/src/ReactFizzServer.js",
      "result": "renderActivity: 'A hidden Activity boundary is not server rendered. Prerendering happens on the client.' Supports the golden path and server-client-first-frame-agreement."
    },
    {
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "result": "getServerSnapshot 'used only during server rendering and during hydration'. Supports the hydrated flag."
    },
    {
      "url": "https://github.com/vercel/next.js/blob/canary/packages/next/src/client/app-dir/link.tsx",
      "result": "'if (e.defaultPrevented) { return }' before navigating. Supports host-click-delegation's prevented-click claim."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      "result": "Map/Set become '{}', Date via toISOString, NaN/Infinity become null, functions 'omitted (when found in an object) or changed to null'. Refines sliced-screen-stream's list."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "All application citations re-read and matching; navigation.ts:138 shows the capture listener on window."
    }
  ],
  "documents": {
    "kept-alive-screen-host.md": {
      "disposition": "clarify",
      "reason": "Click delegation is described 'at the document'; the technique and the cited source use one capture listener on the window. Everything else consistent with the sources."
    },
    "techniques/hidden-but-alive-screens.md": {
      "disposition": "clarify",
      "reason": "Add the documented remedy for media that survives a hide (pause it in a layout-effect cleanup) and React's documented text-only case to the element rule. LRU, effects-stop and outlive-a-visit rules hold."
    },
    "techniques/sliced-screen-stream.md": {
      "disposition": "clarify",
      "reason": "The list of silent JSON changes omits that a function is dropped from an object; name the omitted key, which collides with the protocol's 'omitted means unknown'. Status, terminator and not-served rules hold."
    },
    "techniques/frame-first-no-skeleton.md": {
      "disposition": "keep",
      "reason": "Dash-not-zero, reserved geometry, seeded-once regression, non-vacuous gate test and the stated loading-file cost are coherent and match the cited test."
    },
    "techniques/host-click-delegation.md": {
      "disposition": "keep",
      "reason": "Pure take-predicate, opt-outs and history rules match the source; next/link skipping a prevented click confirmed in its source. The path-hook lag is a single-tree observation, stated as such."
    },
    "techniques/server-client-first-frame-agreement.md": {
      "disposition": "keep",
      "reason": "Hydrated flag via getServerSnapshot and hidden Activity skipped on the server both confirmed by primary sources; server-passed now and the no-'0d' rule are sound."
    },
    "applications/react--hidden-but-alive-screens.md": {
      "disposition": "keep",
      "reason": "Every citation re-read at 009c7893 and matching; the unmount-abort deviation confirmed (useStack has no unmount cleanup for the run). verified_on can move to 2026-10-31."
    },
    "applications/next--sliced-screen-stream.md": {
      "disposition": "keep",
      "reason": "Every citation re-read at 009c7893 and matching, including the {} sentinel deviation and the unmeasured production build. verified_on can move to 2026-10-31."
    }
  }
}
```

## Architecture review - 2026-10-31 (applied)

The three clarify items above were applied in the same run, and both
applications' `verified_on` moved to 2026-10-31 because every citation was
re-read at `009c7893`. No other text changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/kept-alive-screen-host",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:099f1b582c1ca7c7",
  "disposition": "keep",
  "trigger": "Clarify items from the first 2026-10-31 record applied in the same run.",
  "intended_benefit": "Listener placement is described once, consistently; the stream's refusal rationale names the dropped key; the hide rules name the media remedy and the text-only case.",
  "failure_if_ignored": "Not applicable; the items were applied.",
  "boundary": "One client host owning many screens. Frame continuity as a property stays with app-shell; settle states and placeholder craft stay with async-ui-states; data kept beyond a view stays with client-fetch-cache.",
  "coverage": "All 8 documents decided; the three edited passages and both frontmatter lines re-read after editing. frame-first-no-skeleton, host-click-delegation and server-client-first-frame-agreement are byte-unchanged. Sources as in the first 2026-10-31 record. Not evaluated: runtime behaviour, production-build timing, the path-hook lag, next/link at the exact pinned 16.4.x tag.",
  "counterexamples": [
    "A kept screen with a playing <video> keeps playing after its Activity hides unless a layout-effect cleanup pauses it.",
    "A product of a few server-rendered documents is better served by native navigation and the back-forward cache (host-click-delegation's own boundary).",
    "A user-composed dashboard has no static frame to paint (frame-first-no-skeleton's own boundary)."
  ],
  "sources": [
    {
      "url": "https://react.dev/reference/react/Activity",
      "result": "Basis for the media-remedy and text-only sentences in hidden-but-alive-screens."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      "result": "Basis for the dropped-key clause in sliced-screen-stream."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "navigation.ts:138 basis for the golden-path listener wording; all application citations re-read, basis for the verified_on moves."
    }
  ],
  "documents": {
    "kept-alive-screen-host.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'by delegation at the document in the capture phase' -> 'by one listener on the window in the capture phase', matching the technique and the source."
    },
    "techniques/hidden-but-alive-screens.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the element rule adds that a hidden text-only subtree draws nothing; the node side-effects paragraph adds stopping them in a layout-effect cleanup (pause the media)."
    },
    "techniques/sliced-screen-stream.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the silent-change list adds that a function-valued key is dropped, which the client reads as unknown."
    },
    "techniques/frame-first-no-skeleton.md": {
      "disposition": "keep",
      "reason": "Dash-not-zero, reserved geometry, seeded-once regression, non-vacuous gate test and the stated loading-file cost are coherent and match the cited test."
    },
    "techniques/host-click-delegation.md": {
      "disposition": "keep",
      "reason": "Pure take-predicate, opt-outs and history rules match the source; next/link skipping a prevented click confirmed in its source. The path-hook lag is a single-tree observation, stated as such."
    },
    "techniques/server-client-first-frame-agreement.md": {
      "disposition": "keep",
      "reason": "Hydrated flag via getServerSnapshot and hidden Activity skipped on the server both confirmed by primary sources; server-passed now and the no-'0d' rule are sound."
    },
    "applications/react--hidden-but-alive-screens.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: every citation re-read at 009c7893 and matching; verified_on moved to 2026-10-31."
    },
    "applications/next--sliced-screen-stream.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: every citation re-read at 009c7893 and matching; verified_on moved to 2026-10-31."
    }
  }
}
```
