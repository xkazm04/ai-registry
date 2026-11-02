---
layer: application
type: application
subject: contribution-reactive-visuals
technique: presets-with-consequence-lines
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0.3
---

# Presets with consequence lines — Castle Control Beacons Steward flows (TypeScript)

Castle Control (main at `8ef2d8ecd1aa0ea4a47c6ce139e9d3ee885a1db5`, TypeScript pinned by
`package.json:26 "6.0.3"`) tunes its Beacons visuals through the
"Steward" dock: one small choice at a time, with the picture showing each draft live and
nothing changing until a hold to seal (`docs/guide/beacons.md:16 "Setup runs through the Steward dock, one small choice at a time, and the picture"`).
The flow model is the clearest realization of the technique in the tree, and its gaps are
instructive. The same file also carries the Test fire flow, so the self-ending test fire's
one serious deviation is recorded at the end.

## Presets, named by feeling

- `apps/desktop/src/rooms/visuals/flow-model.ts:24 "export type StrengthId = 'keep' | 'gentle' | 'balanced' | 'eager';"` —
  three strengths plus "As it is".
- `apps/desktop/src/rooms/visuals/flow-model.ts:27 "balanced: { label: 'Balanced', ranges: [{ total: 0, intensity: 0 }, { total: 10, intensity: 0.25 }, { total: 30, intensity: 0.6 }, { total: 100, intensity: 1 }] },"` —
  four control points, concave: 2.5 %/unit, then 1.75 %/unit, then about 0.57 %/unit.
- `apps/desktop/src/rooms/visuals/flow-model.ts:34 "{ id: 'fast', label: 'Halves every 2 min', decay: { kind: 'exponential', half_life_s: 120 }, line: 'A flash: a gift bomb flares, then settles within minutes' },"`
  through `:37 "{ id: 'hold', label: 'Never fades', decay: { kind: 'none' }, line: 'Only climbs until the night ends; it soon sits at full blaze' },"` —
  cooling presets in minutes, each with its consequence in words; "never fades" says plainly what it costs.

## Lines computed by replaying generated nights

- `apps/desktop/src/rooms/visuals/flow-model.ts:9 "/**"` … `:10 " * Pure choices behind the Beacons Steward flows. Every consequence line is computed from"` and
  `:11 " * the same preview rules as the room (curve, decay, gift weighting, generated nights),"`.
- `apps/desktop/src/rooms/visuals/flow-model.ts:92 "if (trace.first_lit_s === undefined) return 'stays dark';"`,
  `:93 "sits at full blaze for"`,
  `:94 "peaks ${Math.round(trace.peak.intensity * 100)}%"` — the three
  findings the technique names.
- `apps/desktop/src/rooms/visuals/flow-model.ts:99 "Sample night: peaks 74%, lit 12 min · Gift wave: full blaze for 8 min"` — two nights
  side by side, so the range is visible.
- `apps/desktop/src/rooms/visuals/flow-model.ts:110 "/** The night's moves, offered only when the trace earns them (the same rule as the workbench). */"` and
  `docs/guide/beacons.md:52 "fitted point move (a pinned or never-lit night, or a peak under 90%). **Send curve to the Steward** drafts a proposal; nothing"` —
  one point move, offered only when the trace earns it; `docs/guide/beacons.md:50 "**Back to the sealed curve** puts it back in one press. The trace names its **lit**"`.

## Deviations

- **The cooling lines are hand-written.** The strength lines are computed from replays, but `line:` at
  `apps/desktop/src/rooms/visuals/flow-model.ts:34 "line: 'A flash"` (through :37) is literal copy beside a computed label. Nothing fails if a half-life changes and the copy does not.
- **The replay runs a second implementation.** `apps/desktop/src/beacons-model.ts:37 "/** The one decay rule for the simulated clock and replays, applied to the running total before the curve. */"`
  is a TypeScript copy of `crates/cc-beacons/src/intensity.rs:49 "pub(crate) fn decayed_at("`, and
  `apps/desktop/src/beacons-model.ts:42 "/** UI-only sandbox. The historical feed and initial totals are illustrative,"`.
  The two agree in form today; no parity test pins them over the same nights. The replay also counts only gifts and subs
  (`docs/guide/beacons.md:45 "subs count; bits, points and Hype Train marks stay as muted ticks. Shaded"`), so a visual driven by Bits or
  channel points gets lines computed from a feed it does not have.
- **The preset curves have no lighting floor in the curve** (every preset starts `{ total: 0, intensity: 0 }`); the visible rest
  state lives in the design binding instead (`crates/cc-core/src/beacons/design_package.rs:98 "0.35, 1.0)];"`).
  That is the split the subject recommends, and is confirmed rather than a gap.

## The test fire beside it (self-ending test fire)

The flow model's Test fire shots (`apps/desktop/src/rooms/visuals/flow-model.ts:41 "export const shots: readonly { id: ShotId; label: string; source?: 'gift' | 'subscribe'; count: number }[] = ["`)
compute a before/after on the local picture. The guide is honest about it —
`docs/guide/beacons.md:32 "bursts and clock advancement affect a local preview only. **Test fire**"` /
`:33 "does not call OBS or create a real contribution."` — and the filming run of 2026-11-02 found the consequence:
`film/plan.mjs:45 "beaconFireVia: 'scenario', // the room's test fire never reaches the OBS overlay; the scenario lights it (beacon-test 2026-11-02)"`.
The core path the scenario uses is the realization the technique asks for: an isolated session
(`crates/cc-beacons/src/preview.rs:1 "//! Isolated test-fire lifecycle. No contributions, dedupe or ledgers are written."`) with fixed end
conditions (`:10 "pub const PREVIEW_HOLD_S: u64 = 30;"`, `:12 "pub const PREVIEW_MAX_S: u64 = 600;"`, `:60 "<= 0.005"`, within 0.005 of the floor),
pushed with provenance and handed back
(`crates/cc-core/src/beacons/simulate_overlay.rs:85 "// The next real intake is based on 10 + 10, never the simulated 50."`,
`:145 "// A real value equal to a simulated value must still replace its source tag."`), and cancelled by a live contribution
(`crates/cc-core/src/beacons/routing.rs:74 "// Clear even if the next live value equals the last one."`). The deviation is that the
streamer-facing button in the Steward flow drives the preview, not that path.
