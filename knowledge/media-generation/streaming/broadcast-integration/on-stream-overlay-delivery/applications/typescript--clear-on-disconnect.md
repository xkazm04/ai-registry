---
layer: application
type: application
subject: on-stream-overlay-delivery
technique: clear-on-disconnect
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0.3
---

# TypeScript: an OBS overlay renderer that clears instead of freezing

Castle Control (local checkout `Spooky/CastleControl`, main @ 8ef2d8e) ships a
small static renderer that OBS loads as a browser source. It is written in
`packages/renderer/src/` and built into `apps/overlay/`; each page subscribes to one
server-sent event stream on the isolated overlay origin and receives full-replacement
snapshots. The written rule is in the overlay README:
`apps/overlay/README.md:102 "stream error the renderer clears its layers, bindings, diagnostics and SIMULATED"`
`apps/overlay/README.md:103 "badge, so a disconnected source cannot freeze old art on air. A fresh stream"`.

## The vote bar: clear on error, clear on a rejected snapshot

`mountVoteBar` paints the server-embedded first snapshot before any stream opens,
`packages/renderer/src/vote-bar.ts:28 "const initial = document.getElementById('cc-vote-bar')?.textContent;"`,
then subscribes. A snapshot that fails the schema parser clears the layer instead of leaving
the previous frame up,
`packages/renderer/src/vote-bar.ts:45 "catch { root.replaceChildren(); }"`. On any stream error
it clears first,
`packages/renderer/src/vote-bar.ts:49 "root.replaceChildren();"`, and only then decides how to
come back. A dropped connection keeps the browser's own retry; a refusal closes the stream
for good, so the page runs its own timer:
`packages/renderer/src/vote-bar.ts:50 "CONNECTING keeps the browser's native retry. An HTTP refusal (404/503) closes"`,
with a doubling delay capped at thirty seconds,
`packages/renderer/src/vote-bar.ts:55 "backoff = Math.min(backoff * 2, 30000);"`. The README
states the ladder: `apps/overlay/README.md:108 "HTTP 404/503 refusals) get one retry timer: 2, 4, 8, 16, then at most 30 seconds"`.

## Beacons: reload when package script ran

The Beacons renderer has the same shape plus the scripted-package branch the technique
calls for. Its error handler clears the scene,
`packages/renderer/src/overlay.ts:225 "scene.clear();"`, and when the scene had executed
package script it reloads the document rather than reconnecting:
`packages/renderer/src/overlay.ts:227 "Module scripts evaluate once per document: only a fresh document re-runs them."`,
with the attempt count kept across reloads,
`packages/renderer/src/overlay.ts:228 "Delay 2s, 4s, 8s, 16s, then 30s per attempt; the count resets after 60s without a reload."`.
A rejected snapshot is counted in the DOM, never echoed:
`packages/renderer/src/overlay.ts:218 "A count only, never payload text: a contract mismatch shows up in the DOM."`.
After a clear, an identical package still rebuilds:
`apps/overlay/README.md:105 "rebuilds the scene, even if it has the same hash as the cleared package."`. Decorative
images that fail to load hide rather than show a broken glyph, per the same README section.

The server side ends a stream whose design stops being valid, so the clear is triggered
from the source of truth rather than waiting for a timeout:
`apps/overlay/README.md:101 "An open push stream ends when its accepted design becomes unverified."`.

## Deviations

Both renderers reset the backoff when the stream opens, not when a valid snapshot
arrives: `packages/renderer/src/vote-bar.ts:41 "source.addEventListener('open', () => { if (active()) backoff = 2000; });"`.
A server that accepts and then immediately fails keeps the page at the two-second floor.

Neither page treats silence as a break. The server sends keep-alive comments,
`crates/cc-core/src/overlay/vote_bar.rs:112 ".keep_alive(KeepAlive::default())"`, but the
renderer arms no watchdog on them, so a half-open connection that raises no error leaves
the last frame up — the frozen-overlay case the technique exists to remove.

On a rejected snapshot the two renderers disagree: the vote bar clears, Beacons keeps its
scene and counts the rejection (the decision record's evidence table lists "invalid push
ignored" for Beacons). The subject's rule is the vote bar's.

No break-to-clear time is recorded anywhere. The only timing on file is delivery of
package and curve changes in a headless browser, and the live OBS figure for that is
explicitly unclaimed (see the Rust application in this subject). Break-to-clear is
therefore unmeasured, not passed.
