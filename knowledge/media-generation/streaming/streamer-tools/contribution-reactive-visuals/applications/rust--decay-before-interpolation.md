---
layer: application
type: application
subject: contribution-reactive-visuals
technique: decay-before-interpolation
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Decay before interpolation — Castle Control Beacons engine (Rust)

Castle Control (main at `8ef2d8ecd1aa0ea4a47c6ce139e9d3ee885a1db5`, toolchain pinned by
`rust-toolchain.toml:2 "1.97.1"`) calls its contribution-reactive visuals
**Beacons**. The `cc-beacons` crate holds intake, totals, curves and the test-fire session;
`cc-core` routes accepted Twitch contributions into one engine per visual and hands the
resulting intensity to the native OBS overlay host. The engine is a clean realization of the
technique — it decays the *total* and interpolates after — and it is also where the
neighbouring techniques are anchored, so they are cited here in context.

## The order, exactly as the technique states it

- `crates/cc-beacons/src/intensity.rs:64 "/// One broadcaster and visual per engine. Decay applies to the running weighted"` and
  `:65 "/// total before interpolation; totals above the last range remain accumulated."` — the rule and the
  keep-the-overflow choice, stated on the type.
- `crates/cc-beacons/src/intensity.rs:104 "let now = self.clock.now();"`, `:105 "let mut total = self.decayed_at(now)?;"`,
  `:111 "total += amount;"`, `:114 "let result = self.result(total)?;"`, then `:115 "self.total = total;"` and
  `:116 "self.updated_at = now;"` — read clock, decay, add, interpolate, store with time.
- `crates/cc-beacons/src/intensity.rs:120 "/// Reads decay without consuming contributions or mutating dedupe state."` — the
  snapshot path runs the same decay-then-interpolate without an addition.
- `crates/cc-beacons/src/intensity.rs:59 "total * 2.0_f64.powf(-elapsed.as_secs_f64() / f64::from(half_life_s.get()))"` —
  decay from elapsed time, not per tick; `:57 "IntensityDecay::None {} => total,"` is the never-fades option.
- `crates/cc-beacons/src/intensity.rs:48 "// One decay calculation for live totals and isolated preview sessions."` — the
  test-fire session (`crates/cc-beacons/src/preview.rs:54 "let total = decayed_at(self.total, self.started_at, now, &curve.decay)?;"`)
  reuses the very function, so a test cools exactly like the live visual.

## The clock

- `crates/cc-beacons/src/intensity.rs:9 "/// Monotonic elapsed time supplied by the host. Logic never reads system time."`
- `crates/cc-beacons/src/intensity.rs:55 "clock moved backwards"` — a
  backwards clock is an error; because `contribute` stores only after every fallible step, it changes no state
  (`crates/cc-beacons/README.md:28 "interpolation, including when reading a snapshot. A backwards clock is an error"`).
- `crates/cc-core/src/beacons/routing.rs:16 "impl Clock for HostClock {"` — the host injects a tokio `Instant`.

## Cadence and handoff

- `docs/guide/beacons.md:78 "test contribution. Decay snapshots run once a second."`
- `crates/cc-core/src/beacons/routing.rs:117 "if live.last != intensity {"` — the native overlay is told only about changes.
- The overlay page owns no clock: `packages/renderer/src/overlay.ts:39 "/** No animation loop: package changes build once; intensity changes update CSS. */"`.
  It also does not ease between states; the page snaps once a second. That is within the technique (easing is optional) but a
  visible step on a fast-decaying visual.

## The curve the total is read through

- `crates/cc-beacons/src/intensity.rs:14 "pub fn validate_curve(curve: &IntensityCurve) -> Result<(), &'static str> {"` and
  `:23 "range totals must be strictly increasing and distinct"`; `IntensityEngine::new` calls it at
  `:83 "validate_curve(&visual.curve)?;"`, so no engine exists over an invalid curve.
- `crates/cc-beacons/src/intensity.rs:41 "return Intensity::try_from((lower + fraction * (upper - lower)).clamp(0.0, 1.0));"` — linear
  segments, clamped.
- The look is a separate linear binding with a visible rest state:
  `crates/cc-core/src/beacons/design_package.rs:87 "0.15, 1.0)];"` and
  `:98 "0.35, 1.0)];"`; the swell keeps its centre
  (`:34 "/// Scale is anchored at the layer's top-left corner, so a scale binding comes"`), and the renderer fits the
  envelope over the whole range (`packages/renderer/src/overlay.ts:12 "/** Conservative envelope across the entire intensity range; no zoom pumping. */"`).

## Intake feeding the total

- `crates/cc-beacons/src/intake.rs:55 "/// The adapter must supply the same underlying identity for overlapping topics;"` and
  `:56 "/// neither event_id, a viewer ID nor (source, amount) identifies a contribution."`; keys live for the session
  (`:53 "/// Deduplication lasts for the lifetime of this intake. Start a fresh intake for"`); a blank key is refused
  (`:67 "expected nonblank underlying contribution identity"`).
- `crates/cc-beacons/src/intake.rs:104 "cannot aggregate incompatible contribution units"` and
  `:107 "duplicate selected source (including overlapping Bits topics)"`; currencies are partitioned upstream
  (`:85 "/// Monetary inputs require upstream currency partitioning: Contribution has no"`).
- `crates/cc-beacons/src/intensity.rs:102 "contribution belongs to another broadcaster"`

## The wall around the money

- `crates/cc-beacons/tests/dependency_direction.rs:31 "fn money_cannot_cross_into_draws_moderation_or_engine() {"`, resolving
  `:14 "normal,build,dev"` edges for `:11 "--target"` all, both directions (`:57 "cc-beacons transitively reaches {isolated}"`,
  `:61 "{isolated} transitively reaches cc-beacons"`), plus a conservative manifest mention check
  (`:42 "// Conservatively reject every mention, including aliases, paths, optional,"`).
- `docs/guide/beacons.md:5 "intensity only; they do not buy draw odds, votes, rank or moderation decisions."`

## Deviations

- **Monotone intensity is not validated.** `crates/cc-beacons/README.md:35 "may decrease between points; each value remains in the contract's finite 0..1"` —
  only totals must increase. The standard requires non-decreasing intensities; a dragged point can produce a dip.
- **Every save resets the live total**, including a curve-only change:
  `crates/cc-core/src/beacons/routing.rs:134 "// Configuration commits reset the total, including when an input"` and
  `docs/guide/beacons.md:77 "Saving configuration resets that visual's live total; configure it before the"`. The standard keeps the
  total when only the curve or decay changes and resets only when the unit changes.
- **No timestamped restore.** The engine is in memory (`crates/cc-beacons/README.md:14 "topics. Keys are retained throughout the intake's in-memory accounting session;"`);
  a restart starts at rest, which the technique allows.
- **Live acceptance is unclaimed.** `docs/guide/beacons.md:111 "Live intake and curve routing are built, but **a real test cheer moving the live"` —
  the engine's order is proven by tests with a fake clock, not on a broadcast.
