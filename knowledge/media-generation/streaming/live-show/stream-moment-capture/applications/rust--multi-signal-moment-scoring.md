---
layer: application
type: application
subject: stream-moment-capture
technique: multi-signal-moment-scoring
stack: rust
status: forged
verified_on: 2026-10-21
verified_against: rust@1.97.1
applied: code
ab_verdict: unmeasurable
---

# A clip factory that scores beats of a generated show from four signals

How Shadowrunr OS (github.com/xkazm04/shadowrunr @ b1740fc), an AI-run villain livestream,
ranks the moments of a recorded or simulated stream in its `shadowrunr-clips` crate.
Every citation below was opened on 2026-10-21, and the crate's 28 tests passed on that
tree the same day (`cargo test -p shadowrunr-clips`).

## The signals, each normalised to its own stream

The crate's module doc states the blend and its status in one breath,
crates/shadowrunr-clips/src/lib.rs:9 "0.35·marker + 0.25·chat + 0.15·audio + 0.25·hook",
and every scoring record carries the provenance string
crates/shadowrunr-clips/src/lib.rs:51 "unmeasured: design hypothesis from": the label the
technique asks the weights to travel with.

The crowd signal is the technique's, almost line for line: crates/shadowrunr-clips/src/signals.rs:11 "Distinct chatters (not messages)"
in a reaction window after each beat, as a standard score against the stream's own
trailing baseline, crates/shadowrunr-clips/src/signals.rs:267 "let z = (counts[i] - mean) / std.max(MIN_STD);",
saturating at crates/shadowrunr-clips/src/signals.rs:42 "const Z_CAP: f64 = 3.0;" so one
freak spike cannot carry a fused score. A flood or copypasta cluster in the window
suppresses the beat's crowd signal outright, crates/shadowrunr-clips/src/signals.rs:254 "return Crowd::Wave;",
and the candidate records why, crates/shadowrunr-clips/src/scan.rs:577 "(evidence of an arrival, not a moment)".
That is the technique's raid rule implemented on the moderation layer's own cluster tags.

An absent signal is unmeasured rather than zero, and its weight is redistributed over the
measured ones, crates/shadowrunr-clips/src/scan.rs:91 "let denom = w.marker + on(chat, w.chat) + on(audio, w.audio) + on(hook, w.hook);".
Audio is measured only when a run has a recording; on a simulated run it is unmeasured and
its share moves.

## Agreement decides the lane, and audio cannot vote

A candidate reaches the clip lane only when two signals fire,
crates/shadowrunr-clips/src/scan.rs:596 "let lane = if agreeing.len() >= 2 && !p.cut.needs_reauthoring {";
anything else goes to review. Only the marker, the crowd and the hook read can fire,
crates/shadowrunr-clips/src/scan.rs:587 "if signals.marker >= MARKER_FIRES {": audio adds
to the score but never makes a pair. That is a sharper reading of "audio is the most
easily confounded" than the technique states, and a defensible one: a loud host and a
loud host's marker are not independent.

## Cheap signals first, the model read on a shortlist

The scan ranks every beat on its marker and crowd, cuts the best
crates/shadowrunr-clips/src/scan.rs:42 "pub const PRE_CANDIDATES: usize = 8;" at least
crates/shadowrunr-clips/src/scan.rs:44 "pub const MIN_SPACING_MS: i64 = 30_000;" apart
(the technique's suppression step), and only then asks a model for the hook read,
crates/shadowrunr-clips/src/scan.rs:6 "One hook read rates those cuts (one engine call per run, cheapest tier)",
keeping crates/shadowrunr-clips/src/lib.rs:57 "pub const TOP_PER_STREAM: usize = 5;". This
prices the costliest signal per run instead of per beat, at a cost the technique does not
name: a quotable line that neither the host nor the crowd noticed never reaches the hook
read, so the hook can confirm a moment but can never find one.

## What the store shows

On 2026-10-21 the local store held 180 candidates from simulated tournaments, all awaiting
the owner: 92 in the clip lane and 88 in review. 87 were carried by the marker alone,
45 by marker and hook, 23 by marker and crowd, 20 by all three, 4 by crowd and hook and 1
by the crowd alone. The crowd fires rarely on its own, consistent with simulated chat that
answers lines rather than reacting in waves.

## Deviations from the standard

**No measurement of the weights yet, and the instrument is half-built.** The console
collects watched feedback per clip (landed, flat, cut too early, cut too late), which is
the technique's editor comparison in waiting, but no clip carries any feedback yet, so
precision at the editor's depth cannot be computed. Recorded as `unmeasurable`; the return
condition is twenty clips with owner feedback.

**A requested marker is scored like a spontaneous one** (see the marker application).

**The reaction window is tuned to simulated chat.** It is ten seconds, with the comment
crates/shadowrunr-clips/src/signals.rs:34 "simulated chat answers within a tick or two".
Published work on live platforms illustrates a reaction delay around twenty seconds and
YouTube puts low-latency delivery alone under ten, so a recorded stream from a real
platform would lose most of its crowd reaction outside the window.
