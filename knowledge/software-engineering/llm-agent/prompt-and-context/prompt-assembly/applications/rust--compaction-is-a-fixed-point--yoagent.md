---
layer: application
type: application
subject: prompt-assembly
technique: compaction-is-a-fixed-point
stack: rust
status: forged
verified_on: 2026-10-02
verified_against: rust@1.86
---

# A compactor built to be run twice (Rust, agent library)

Stack version from the crate's `rust-version` field (`Cargo.toml:24 "rust-version"`);
commit `2428f68d` of a public agent library. The code anchors were opened at this
commit; the replay numbers are the tree's own report and were not re-run (the replay
is a 2,400-turn test whose inputs come from archived production runs the tree does
not ship).

## The four leaks, and where each is closed

1. **Marker charged to the cap.** The truncation helper's doc comment states the
   property and the failure it prevents:
   `src/context.rs:658 "The marker is charged against"`; a marker that
   shrank on each pass (950 lines truncated, then 3) misreported the loss and rewrote
   settled history. A test at the same file pins that the output fits its own budget.
2. **Constant marker, inherited clock.** `src/context.rs:804 "pub(crate) const COMPACTION_MARKER"`
   holds fixed text, with the count moved to the debug log, because the marker sits
   near the front of the list. Level-2 summaries take the replaced turn's time:
   `src/context.rs:755 "Inherit the summarized turn"`.
3. **Cap on append.** The default is on append, per tool, with a page-and-exempt rule
   for file reads: `docs/concepts/prompt-caching.md:202 "Applying the cap **on append**"`.
4. **Snapped boundaries.** Cuts go through `safe_head_end` and `safe_tail_start`, which
   move to turn starts and keep calls with results.

The documentation states the product claim in one line:
`docs/concepts/prompt-caching.md:190 "Markers carry no drifting state."`

## What it measured

A replay renders each turn as a provider body would see it and counts the leading
bytes consecutive requests share. Old and new compaction ran through the same code
path on a 128K window: hit rate 94.77% to 95.27% at 2,400 turns, history rewrites 415
to 70, input spend down 21.3% on one provider's price shape and 22.8% on another's.
The tree's point about its own metric is the transferable part: the old version kept
its hit rate by compacting constantly to a small context, so the rewrite count, not
the rate, carried the signal.

## A second, live figure worth knowing the shape of

A live session on two providers reached similar session hit rates (79.0 to 83.7% and
75.5 to 79.2%) with different mechanics: one provider charged nothing for populating
the cache, so 92% of its uncached tokens came from the two turns where compaction
rewrote history; the other charged a write premium every turn, so compaction was
about half of its uncached tokens. The tree's accounting rule is the portable
sentence: "not cached" is input plus cache writes, because a provider that books a
re-processed prefix as a write otherwise looks about ten times cheaper than it is.
Those are single-session figures (five runs for the session rate, one for the
per-turn curve) and the tree labels the dollar gap illustrative.

## What the realization cannot do

- Idempotence is asserted by tests on the truncation helper and the marker; there is
  no general property test that compacts a random history twice and compares bytes.
  The mutation baseline's surviving mutants include the level-2 summary content
  (`docs/evals/mutation-baseline.md:89 "No test checks *what* a level-2 summary says."`),
  so a change there would pass.
- The model-written summary path is outside the fixed point by nature: a second
  summarization of the same span can differ, so the property holds for the
  deterministic rungs only. Nothing read in the tree states what stops a settled span
  being summarized twice; that is the open question for this path.
