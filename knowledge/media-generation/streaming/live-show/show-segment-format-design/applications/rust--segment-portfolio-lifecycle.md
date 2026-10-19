---
layer: application
type: application
subject: show-segment-format-design
technique: segment-portfolio-lifecycle
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# A portfolio lifecycle as a transition table over a z-scored engagement score

Shadowrunr OS, an AI-run villain livestream, keeps its segment portfolio as a small
Rust module plus a design digest that specifies the slots, reflexes and approvals the
module does not yet implement. Read at github.com/xkazm04/shadowrunr @ 4025231 (branch
main); the toolchain pin is `rust-toolchain.toml:2 "1.97.1"`. The tree was read, not
built or run. No run has produced a score yet: the module has no caller outside its
crate at this commit, and every threshold is labelled an assumption.

## The score

The Segment Engagement Score is a fixed-weight sum of four standardised signals: chat
rate, poll vote rate, retention delta, and the 48-hour watch percentage of the
segment's clips. The baseline is the show's own recent history, which confirms the
technique's normalisation. The 48-hour clip signal is the reason the technique now
says a run's score is provisional until a lagging window closes.

- `crates/shadowrunr-segments/src/lib.rs:52 "each is already z-normalised by the caller"`
- `crates/shadowrunr-segments/src/lib.rs:61 "(weights are assumptions)"`
- `docs/design/obsidian-program-digest.md:29 "computed against a 14-day rolling mean"`

## The ladder and its rules

The module states the whole policy in its header. The code checks retirement before
promotion, draws no verdict below the window, and its table test pins the consecutive
rule: one run above the threshold breaks a retirement.

- `crates/shadowrunr-segments/src/portfolio.rs:1 "pilot -> trial -> regular -> flagship"`
- `crates/shadowrunr-segments/src/portfolio.rs:4 "the mean of the last 3 SES is >= +0.4"`
- `crates/shadowrunr-segments/src/portfolio.rs:5 "SES <= -0.5 for 3 consecutive runs (retire wins over promote)"`
- `crates/shadowrunr-segments/src/portfolio.rs:57 "if history.len() < SES_WINDOW"`
- `crates/shadowrunr-segments/src/portfolio.rs:61 "RETIRE_SES + EPS"`
- `crates/shadowrunr-segments/src/portfolio.rs:173 "Not consecutive: no retirement."`

Three upward lessons came from this module. Each stage is judged on its own runs; one
rule set replaced the design's per-stage numbers; and the flagship is the owner's to
award - the module flags a candidate that clears the bar and beats the current
flagship, and approval demotes the old flagship.

- `crates/shadowrunr-segments/src/portfolio.rs:68 "pass the runs since the last status change"`
- `crates/shadowrunr-segments/src/portfolio.rs:3 "it replaces the digest's mixed thresholds"`
- `crates/shadowrunr-segments/src/portfolio.rs:6 "only the owner can make it so"`

The calibration caveat is explicit, and even the opener, which the design calls the
flagship, enters as a pilot:

- `crates/shadowrunr-segments/src/portfolio.rs:9 "All three numbers are assumptions until calibrated over Season 0."`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:6 "pilot"`
- `docs/design/obsidian-program-digest.md:45 "20-30 min opener, FLAGSHIP"`

## What the design adds

The digest gives the ladder growing slots and an on-air send-off, specifies both live
reflexes, and splits approvals along time: automatic within a stream, owner-confirmed
across streams. The cut reflex sits further from the mean than the extend reflex and
must hold for minutes, which the handover technique adopted.

- `docs/design/obsidian-program-digest.md:28 "PILOT (15m) -> TRIAL (20-25m, 3 runs over 2 weeks)"`
- `docs/design/obsidian-program-digest.md:28 "in-character 60s"`
- `docs/design/obsidian-program-digest.md:34 "Live reflex: extend +10m if SES > +1.2 SD."`
- `docs/design/obsidian-program-digest.md:34 "Cut -10m and hand over if SES < -0.8 SD for 5 min."`
- `docs/design/obsidian-program-digest.md:38 "Automatic in-stream: extend/cut and handover."`
- `docs/design/obsidian-program-digest.md:40 "Owner one-click Morning Sheet: promote/retire."`

## Deviations (the standard stands)

- **Promotion and retirement are not owner-confirmed in code.** `next_status` applies
  the trigger directly; only the flagship waits for the owner. The design's one-click
  confirmation is not implemented.
  `crates/shadowrunr-segments/src/portfolio.rs:70 "pub fn next_status"`
- **No marker for runs that must not count.** A portfolio row's history is plain
  numbers, so an outage, an operator override or a provisional lagging score would be
  scored like any other run.
  `crates/shadowrunr-segments/src/portfolio.rs:87 "pub history: Vec<f64>"`
- **The live reflexes are design only.** Neither the extend nor the cut reflex exists
  in the segments crate at this commit.
- **Three runs is a thin verdict.** The window is both the minimum run count and the
  promotion sample; the technique asks for a trial length fixed before the runs, and
  the tree's own label says the number is uncalibrated.
