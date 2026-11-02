---
layer: application
type: application
subject: overlay-composition-and-safe-area
technique: placement-declared-at-provisioning
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0.3
---

# Placement declared at provisioning — Castle Control desktop stream set-up (TypeScript + Rust core)

Castle Control (main at `8ef2d8ecd1aa0ea4a47c6ce139e9d3ee885a1db5`, TypeScript 6.0.3 per
`package.json:26 "typescript": "6.0.3"`) is a streamer's desktop tool that adds its
overlays — a Gatehouse vote bar, a duel stage, Beacons visuals and a giveaway "lot plate"
— to the streamer's OBS scene as browser sources over obs-websocket. This application is
mostly a **deviation record**: the product has every ingredient of the technique except the
one that matters, and the composition was rescued in filming tooling instead.

## What the product has right

Position is owned by the page, and travels through a typed channel. Each source is a
full-canvas page, and the page anchors and scales itself from two query keys in its own
URL, parsed by one function with per-key fallback:

- `apps/overlay/README.md:71 "Exactly \`tl\`, \`tr\`, \`bl\`, \`br\`, or \`center\` (case sensitive)"` — the anchor grammar, default `center`.
- `crates/cc-core/src/overlay/vote_bar.rs:29 "let scale = single(\"scale\")"` through `:38 "_ => \"center\","` — the vote bar's
  parser: scale in [0.5, 2], anything else falls back to the default rather than failing the page.
- `crates/cc-core/src/overlay/lots.rs:145 "_ => \"br\","` — the lot plate is the one kind with a designed
  home: bottom-right by default, with saved S/M/L sizes at `:136 "Some(DisplaySize::S) => 0.75,"` and
  `:137 "Some(DisplaySize::L) => 1.5,"`.
- `crates/cc-obs/src/pages.rs:63 "matches!(part.split('=').next(), Some(\"scale\" | \"anchor\"))"` — the control
  layer already accepts those two keys on an owned URL, so a provisioning call could carry them.

This is the "one owner of position" design done correctly: the scene transform is left at
identity and the page alone places its content, so the two never compound.

## Where it falls short

The provisioning call sends no placement. The set-up model creates every source with the
scene, a name, the URL and the canvas size, and nothing else:

- `apps/desktop/src/stream/setup-model.ts:139 "await port.add({ scene_name, source_name: \`Castle Control · ${row.name}\`, url, ...size });"`
- `apps/desktop/src/stream/presets.ts:3 "'1080p': Object.freeze({ width: 1920, height: 1080 }),"` — a preset is a
  size, not a layout; `:5` adds `vertical` at 1080 × 1920 with no per-canvas placement row.

So the vote bar, the duel stage and every Beacons visual arrive with the page default,
centre, at scale one, each a full 1080p page with its art in the middle. There is no
placement table, no collision check between kinds, and only the lot plate has a home of its
own. The ownership ledger records what was created but not where it was meant to sit
(`crates/cc-obs/src/ownership.rs:111 ".push(Input {"` stores scene, name, UUID and item id), so
a later reconciliation cannot tell "the streamer moved it" from "it was never placed".

## The lesson solved in tooling

The filming harness for the product's showcase met the pile first and fixed it outside the
product:

- `film/lib/director.mjs:2 "browser sources (\"Castle Control · …\", each a full 1080p page with its overlay drawn in the middle);"`
- `film/lib/director.mjs:17 "'open-setup': [['vote', 'lot', 'beacon', 'duel'], 1],"` — the one shot that shows every
  overlay at once, and the one the filming evidence of 2026-11-02 recorded as an unreadable pile.
- `film/lib/director.mjs:18 "'gh-vote': [['vote'], 1.45],"` onward — every other beat hides all but one overlay
  and enlarges it, by scene transform, around the frame centre.

The director script produces watchable frames and hides the defect: a streamer who is not
running it gets the pile. Per the technique, the fix belongs in `add()` — pass a per-kind
`anchor` and `scale` (the page grammar and the control layer already accept both), give
the vote bar, duel and Beacons kinds distinct homes that cannot overlap the lot plate's
bottom-right corner, and add a row per preset so the vertical canvas is placed rather
than shrunk.
