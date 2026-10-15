---
layer: application
type: application
subject: adaptive-music-authoring
technique: transition-quantization-and-perceived-latency
stack: node
status: forged
verified_on: 2026-10-15
verified_against: node@24
applied: code
ab_verdict: better
---

# Transition quantization and perceived latency in an action-RPG music catalog

A game-production tool authors adaptive combat music as catalog entries: stems, intensity
layers, transitions, loop markers, a runtime test gate. The Transitions step is data plus
an acceptance rule, in TypeScript run under Node 24 (the runtime that executed the tests;
the tree pins no engine version). No audio plays in this tree, so everything below is a
statement about what the catalog declares and what its acceptance rule can see.

## What the tree did

- **One sync point.** Every transition request is queued and flushed at the next bar
  boundary of a clock at 96 beats per minute. The step says so in a sentence: "the only
  beat-sync point - no sub-bar sync in this track". A bar at 96 BPM is 2500 ms, so the
  worst-case wait is five times the 500 ms attribution window.
- **The grid event was the only event.** The combat entry's war-drum and brass stab both
  land on the bar. Nothing fires immediately, so the player who aggroes an enemy one tick
  after a downbeat hears nothing for 2.5 s: the *music ignored me* failure.
- **A contradiction inside the data.** The boss climax declared a 0.5-bar (1.25 s)
  crossfade "for near-immediate urgency", but the crossfade could only start at the next
  bar, so its real response time ranged from 1.25 s to 3.75 s.
- **No commit horizon.** Nothing stated how close to a boundary a request may arrive and
  still be honoured, and nothing reported the boundary actually used.
- **Already right: the reversal.** The exit's straggler rule resumes the interrupted layer
  and says "No restart - resume in-progress", and tests it against the same
  `CombatIntensity > 0.2` threshold the layer mapping uses. The technique's in-flight
  rule held here without change.

## The paired test

A and B were the catalog at its previous commit and the catalog with the technique
applied, run through one test block: a responsive transition that waits past the window
must declare an immediate accent; the commit horizon must be declared; acceptance must
fail when an accent is removed.

- **Target.** Responsive transitions with no covering accent: 3 of 3 (A) to 0 of 3 (B).
  Commit horizon declared: no (A), yes (B). A's three assertions failed with exactly
  those values; B's four tests passed.
- **Floor.** The rest of the catalog and library suites: 946 files and 8289 tests green
  with the change, and the type check reports nothing in the music files. The produced
  data still satisfies the existing populated-fields checks.
- **What changed.** Three unquantized unpitched accents (a drum hit, a sub-bass impact, a
  cymbal swell), a declared commit horizon (one 2048-sample buffer at 48 kHz, about 43 ms,
  plus a game frame; a request inside it takes the next bar) with requested-versus-used
  boundary logging, and a checker that computes the bar wait from the declared tempo and
  fails a responsive transition that carries no accent.

The first A run was invalid: the test harness imported the pipeline registry before a
module reset, so all three failures were a null lookup rather than a measurement. The
reported numbers come from the re-run after that was fixed.

## What this cannot show

The accent's real latency, the buffer arithmetic and the boundary log are declarations.
The runtime test that would exercise them stays deferred, and the catalog's own status
notes say it always reports deferred because no audio asset exists to test against. So the
verdict is `better` for what the catalog can see (a responsive transition can no longer
pass acceptance with a 2.5 s silent wait), and says nothing about how the music sounds.
The accent also does not fix the grid: the harmonic change still arrives up to 2.5 s
late, which is the technique's deliberate trade, not a defect.

Return when the runtime transition test runs: log requested against used boundary under
load and count how many of the declared transitions the run actually took.
