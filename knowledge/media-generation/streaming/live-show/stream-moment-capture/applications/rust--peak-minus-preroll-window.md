---
layer: application
type: application
subject: stream-moment-capture
technique: peak-minus-preroll-window
stack: rust
status: forged
verified_on: 2026-10-21
verified_against: rust@1.97.1
applied: simulation
ab_verdict: unmeasurable
---

# Cutting a scored beat on the spoken clock, with the lag paid in the reaction window

How Shadowrunr OS (github.com/xkazm04/shadowrunr @ b1740fc), an AI-run villain livestream,
turns a scored beat into a clip interval in `crates/shadowrunr-clips/src/window.rs`. Every
citation below was opened on 2026-10-21, and the crate's 28 tests passed on that tree the
same day.

## Two clocks, and why the anchor is a line

A simulated stream runs on ticks, crates/shadowrunr-clips/src/transcript.rs:5 "A simulated beat is a 5 s tick",
that hold far more speech than five seconds; the cut plays on a separate spoken clock. One
stored crowd-driven candidate sits at 3:30 on the stream clock and at 24:51 on the spoken
clock. A lag in seconds measured on one clock means nothing on the other, so the factory
never anchors on a signal's timestamp. The crowd is credited forward to the beat it reacted
to (the scoring application), and the cut anchors on a line of that beat: for a marker,
the host line sharing most words with the mark's label; for a crowd peak,
crates/shadowrunr-clips/src/window.rs:127 "otherwise (a crowd peak) the beat's last host line, the one".
The lag is paid once, in the reaction window, and the pre-roll is spent entirely on setup.
This is the form the technique's first step now names as an alternative.

## The procedure, step by step

The pre-roll is the technique's order of magnitude and is labelled as craft:
crates/shadowrunr-clips/src/window.rs:26 "pub const PREROLL_MS: i64 = 12_000;", with
crates/shadowrunr-clips/src/window.rs:12 "The 12 s pre-roll and the bands are the digest's craft defaults, not".
The opening edge snaps to a whole line and only ever moves earlier,
crates/shadowrunr-clips/src/window.rs:178 "the edge only ever moves earlier", and on the
voice's real timing it opens a breath before the first word but never into the previous
heard line, crates/shadowrunr-clips/src/window.rs:53 "s - prev.map_or(VOICE_LEAD_MS, |e| (s - e).clamp(0, VOICE_LEAD_MS))".
The cut closes one reaction beat past the payoff,
crates/shadowrunr-clips/src/window.rs:28 "pub const REACTION_TAIL_MS: i64 = 1_500;".

The band is set by the kind of moment, as the golden path asks:
crates/shadowrunr-clips/src/window.rs:77 "SEG-01 split-stage 25-35 s; SEG-02A 45-60 s",
the longer band for the segment whose clips carry a sourced claim. An overlong cut sheds
setup line by line but never past the line the payoff answers,
crates/shadowrunr-clips/src/window.rs:195 "while first < min_first && end - start > band.max_ms {",
and a setup that still cannot fit is flagged, not amputated,
crates/shadowrunr-clips/src/window.rs:202 "re-author, do not cut the setup". Overlapping
candidates merge when the union fits the band and shares a segment,
crates/shadowrunr-clips/src/scan.rs:497 "if k.segment == p.segment && end - start <= band.max_ms {".

## Deviations from the standard

**The provenance names a lag that was never applied.** The window records which signal
drove the anchor and the lag, and for a crowd-driven cut that lag is half the reaction
window, crates/shadowrunr-clips/src/scan.rs:633 "signals::REACTION_MS / 2", while the
anchor is the beat itself, crates/shadowrunr-clips/src/scan.rs:636 "anchor_ms: beat.ts_ms,".
The contract's own docs say otherwise:
crates/shadowrunr-types/src/clips.rs:135 "The beat the score peaked on, corrected for its signal's lag."
and crates/shadowrunr-types/src/clips.rs:146 "The lag applied before the pre-roll". All
five crowd-driven candidates in the store on 2026-10-21 carry a 5000 ms lag that moved
nothing. The technique's provenance step now says to record the lag actually applied, and
how.

**The minimum setup is one line.** The setup the trim protects is the line before the
payoff, or the viewer's question when the beat opens on one. A setup that runs two lines
can lose its first under band pressure without being flagged.

## The simulation, and why it could not decide

The condition this tree earned (credit the crowd forward; do not shift a forward-credited
anchor again) was set against the technique's original step on the five crowd-driven
candidates in the store. Arm A moves the anchor back by the recorded lag, one tick; arm B
is the tree's beat anchor. The ground truth came from another layer: the host line in the
preceding minute sharing most words with the chat lines in the reaction window. That line
fell inside the tree's cut in 1 of 5 cases, at arm A's anchor in 1 of 5, and outside both
in 3. The instrument is confounded: the host's lines answer chat by name, so word overlap
finds replies as readily as causes, and two of the five "truths" came after the anchor.
Verdict `unmeasurable` at n = 5. Return condition: owner feedback tagged cut too early or
cut too late, apps/console/src/pages/onair/clipModel.ts:88 "cut_too_early", on twenty
crowd-driven clips.
