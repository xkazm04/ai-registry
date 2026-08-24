---
layer: application
type: application
subject: chat-transcript
technique: transcript-scroll
stack: rust
verified_on: 2026-08-23
verified_against: rust@1.85
---

# grok-build's scrollback — page-flip with a pin reserve, and two anchors

`xai-org/grok-build`'s `xai-grok-pager` crate renders its transcript in a
terminal, so it owns every scroll mechanic a browser would give for free —
which makes it an unusually explicit reference for the technique's rules.
Paths are relative to `crates/codegen/xai-grok-pager/src/`.

## The page-flip and the reserve

On send, `push_and_page_flip` (`app/dispatch/queue.rs:23-31`) scrolls the new
prompt to the viewport top and adds phantom bottom padding —
`scrollback/state/pin_reserve.rs:1-70` — so that pose is a legitimate scroll
bottom. The reserve shrinks as the reply streams in and shifts if content
above changes height; it is consumed inside the layout pass
(`scrollback/state/mod.rs:1724-1729`), never by the composer. Follow mode
stays armed: `follow_preserve_scroll` (`state/mod.rs:129-135`,
`state/layout.rs:879-926`) skips exactly one auto-scroll rather than
disengaging. This is the ChatGPT "your message jumps to the top" effect
without the clamp-jump most clones exhibit.

## Two anchors

`ScrollAnchor` (`state/layout.rs:6-23`) stores `(entry, logical_line,
sub_rows)` — width-independent, so a resize re-pins the same content.
`StructuralScrollAnchor` (`layout.rs:25-46`) is keyed by a stable `EntryId`,
armed immediately before an insert/remove invalidates the layout cache,
consumed by the next pass — and **discarded if the user scrolled in
between**, the rule the technique now names.

## Virtualization and measurement

`compute_paint_window` (`state/layout.rs:1814-1856`) binary-searches a
`virtual_y` prefix-sum with `partition_point`, then widens the window so
group headers aggregating off-screen items still render. Heights are
estimated on load (`measured: Vec<bool>`, `layout.rs:60-66`) and measured
only when a row nears the viewport (`settle_visible_measurements`), with a
bottom-pinned warm-up pass. Append is O(1) — the cache extends in place
(`state/mod.rs:634-663`) — and a streaming tail patches heights from the
earliest dirty index rather than rebuilding (`state/mod.rs:213-218,
1702-1755`).

## Animation only where it is visible

`tick()` / `needs_animation()` (`state/mod.rs:487-556`) return false unless a
running or flashing entry is inside the paint window, so an off-screen
background task cannot force repaints of a static screen. Every animation is
a pure function of one global `tick` (`views/turn_status.rs:30-60`), which
keeps all "working" indicators phase-locked — the React equivalent is one
shared rAF tick in context rather than per-component CSS animations.

## Presenter cadence

`event_loop.rs:513-611`: a dirty flag, a minimum draw interval derived from
the probed display refresh rate (`app/display_refresh_startup.rs:20-112`),
and an in-flight guard that refuses a new frame until the last one is acked.
Stream chunks are drained up to 32 per paint (`ACP_DRAIN_BATCH_MAX`,
`event_loop.rs:2229`, loop at `:2602-2620`) and the drain aborts the instant
an input event arrives.

## What does not port

Cell-grid diffing, writer-ack backpressure, the display-Hz probe, the
wheel/trackpad classification heuristics (`input/mouse.rs`), and the
sticky-header scratch-buffer copying (`scrollback/sticky.rs`) — a browser
compositor, `requestAnimationFrame` and `position: sticky` supersede all of
them. The reserve, the two anchors with the stale guard, visible-only
animation, and estimate-then-measure port unchanged.
